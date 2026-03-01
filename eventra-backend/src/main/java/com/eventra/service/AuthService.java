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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
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
     * Register a new user.
     * Removed @Transactional — single-document MongoDB writes are atomic;
     * multi-document transactions require a replica set which may not be
     * provisioned on every deployment target.
     */
    public LoginResponse register(RegisterRequest request) {
        log.info("Register attempt: email={}, role={}", request.getEmail(), request.getRole());

        // ── Validate role ──────────────────────────────────
        if (request.getRole() == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }
        String requestedRole = request.getRole().toUpperCase();
        if (!"ORGANIZER".equals(requestedRole) && !"COMPANY".equals(requestedRole)) {
            throw new IllegalArgumentException("Invalid role. Allowed: ORGANIZER, COMPANY");
        }

        // ── Check duplicate (application-level, precedes DB unique index) ──
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // ── Hash password ──────────────────────────────────
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // ── Build & persist user ───────────────────────────
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .name(request.getName())
                .role(Role.valueOf(requestedRole))
                .build();

        User savedUser;
        try {
            savedUser = userRepository.save(user);
        } catch (DuplicateKeyException ex) {
            // Race condition: another request registered the same email between
            // the existsByEmail check and the save.  Return a clean 400.
            log.warn("Duplicate key on save for email={}", request.getEmail());
            throw new IllegalArgumentException("Email already registered");
        }

        log.info("User registered: id={}, email={}", savedUser.getId(), savedUser.getEmail());

        // ── Generate JWT ───────────────────────────────────
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

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt: email={}", request.getEmail());
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
