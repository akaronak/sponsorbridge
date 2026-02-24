package com.eventra.service;

import com.eventra.dto.LoginRequest;
import com.eventra.dto.LoginResponse;
import com.eventra.dto.RegisterRequest;
import com.eventra.dto.UserDTO;
import com.eventra.entity.Role;
import com.eventra.entity.User;
import com.eventra.mapper.UserMapper;
import com.eventra.repository.UserRepository;
import com.eventra.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserMapper userMapper;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        String requestedRole = request.getRole().toUpperCase();
        if (!"ORGANIZER".equals(requestedRole) && !"COMPANY".equals(requestedRole)) {
            throw new IllegalArgumentException("Invalid role. Allowed: ORGANIZER, COMPANY");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .name(request.getName())
                .role(Role.valueOf(requestedRole))
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(savedUser.getId(), savedUser.getRole().toString());
        UserDTO userDTO = userMapper.toDTO(savedUser);

        return LoginResponse.builder()
                .token(token)
                .user(userDTO)
                .role(savedUser.getRole().toString())
                .userId(savedUser.getId())
                .expiresIn(jwtExpirationMs)
                .build();
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getRole().toString());
        UserDTO userDTO = userMapper.toDTO(user);

        return LoginResponse.builder()
                .token(token)
                .user(userDTO)
                .role(user.getRole().toString())
                .userId(user.getId())
                .expiresIn(jwtExpirationMs)
                .build();
    }

    public boolean validateToken(String token) {
        return jwtTokenProvider.validateToken(token);
    }
}
