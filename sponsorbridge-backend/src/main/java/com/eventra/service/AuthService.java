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

import java.time.LocalDateTime;

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

    /**
     * Register a new user with the provided credentials
     * @param request the registration request containing email, password, name, and role
     * @return LoginResponse with token and user (auto-login after register)
     * @throws IllegalArgumentException if email already exists or invalid role
     */
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Only allow ORGANIZER and COMPANY roles via self-registration
        String requestedRole = request.getRole().toUpperCase();
        if (!"ORGANIZER".equals(requestedRole) && !"COMPANY".equals(requestedRole)) {
            throw new IllegalArgumentException("Invalid role. Allowed: ORGANIZER, COMPANY");
        }

        // Hash the password
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Create new user entity
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .name(request.getName())
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Save to database
        User savedUser = userRepository.save(user);

        // Generate JWT token for auto-login after registration
        String token = jwtTokenProvider.generateToken(savedUser.getId(), savedUser.getRole().toString());
        UserDTO userDTO = userMapper.toDTO(savedUser);

        // Return LoginResponse (matches frontend { token, user } contract)
        return LoginResponse.builder()
                .token(token)
                .user(userDTO)
                .role(savedUser.getRole().toString())
                .userId(savedUser.getId())
                .expiresIn(jwtExpirationMs)
                .build();
    }

    /**
     * Authenticate user with email and password, generate JWT token
     * @param request the login request containing email and password
     * @return LoginResponse with JWT token, role, userId, and expiresIn
     * @throws IllegalArgumentException if user not found or password is invalid
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getRole().toString());

        // Build user DTO for frontend
        UserDTO userDTO = userMapper.toDTO(user);

        // Return LoginResponse with user object (matches frontend contract)
        return LoginResponse.builder()
                .token(token)
                .user(userDTO)
                .role(user.getRole().toString())
                .userId(user.getId())
                .expiresIn(jwtExpirationMs)
                .build();
    }

    /**
     * Validate a JWT token
     * @param token the JWT token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        return jwtTokenProvider.validateToken(token);
    }
}
