package com.sponsorbridge.service;

import com.sponsorbridge.dto.LoginRequest;
import com.sponsorbridge.dto.LoginResponse;
import com.sponsorbridge.dto.RegisterRequest;
import com.sponsorbridge.dto.UserDTO;
import com.sponsorbridge.entity.Role;
import com.sponsorbridge.entity.User;
import com.sponsorbridge.mapper.UserMapper;
import com.sponsorbridge.repository.UserRepository;
import com.sponsorbridge.security.JwtTokenProvider;
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
     * @return UserDTO of the created user
     * @throws IllegalArgumentException if email already exists
     */
    @Transactional
    public UserDTO register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
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

        // Return UserDTO
        return userMapper.toDTO(savedUser);
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

        // Return LoginResponse
        return LoginResponse.builder()
                .token(token)
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
