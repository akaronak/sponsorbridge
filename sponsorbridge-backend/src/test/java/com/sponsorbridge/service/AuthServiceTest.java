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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;
    private UserDTO testUserDTO;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "jwtExpirationMs", 86400000L);

        registerRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .name("Test User")
                .role("ORGANIZER")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .name("Test User")
                .role(Role.ORGANIZER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testUserDTO = UserDTO.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .role("ORGANIZER")
                .build();
    }

    @Test
    void testRegisterSuccess() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toDTO(testUser)).thenReturn(testUserDTO);

        // Act
        UserDTO result = authService.register(registerRequest);

        // Assert
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test User", result.getName());
        assertEquals("ORGANIZER", result.getRole());
        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(passwordEncoder).encode(registerRequest.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegisterDuplicateEmail() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(registerRequest);
        });
        assertEquals("Email already registered", exception.getMessage());
        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterWithDifferentRoles() {
        // Test COMPANY role
        registerRequest.setRole("COMPANY");
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("hashedPassword");
        
        User companyUser = User.builder()
                .id(2L)
                .email("company@example.com")
                .passwordHash("hashedPassword")
                .name("Company User")
                .role(Role.COMPANY)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        UserDTO companyUserDTO = UserDTO.builder()
                .id(2L)
                .email("company@example.com")
                .name("Company User")
                .role("COMPANY")
                .build();

        when(userRepository.save(any(User.class))).thenReturn(companyUser);
        when(userMapper.toDTO(companyUser)).thenReturn(companyUserDTO);

        // Act
        UserDTO result = authService.register(registerRequest);

        // Assert
        assertEquals("COMPANY", result.getRole());
    }

    @Test
    void testLoginSuccess() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.generateToken(testUser.getId(), testUser.getRole().toString()))
                .thenReturn("jwt-token-123");

        // Act
        LoginResponse result = authService.login(loginRequest);

        // Assert
        assertNotNull(result);
        assertEquals("jwt-token-123", result.getToken());
        assertEquals("ORGANIZER", result.getRole());
        assertEquals(1L, result.getUserId());
        assertEquals(86400000L, result.getExpiresIn());
        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPasswordHash());
        verify(jwtTokenProvider).generateToken(testUser.getId(), testUser.getRole().toString());
    }

    @Test
    void testLoginUserNotFound() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(loginRequest);
        });
        assertEquals("Invalid email or password", exception.getMessage());
        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void testLoginInvalidPassword() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPasswordHash())).thenReturn(false);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(loginRequest);
        });
        assertEquals("Invalid email or password", exception.getMessage());
        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPasswordHash());
        verify(jwtTokenProvider, never()).generateToken(anyLong(), anyString());
    }

    @Test
    void testValidateTokenValid() {
        // Arrange
        String token = "valid-token";
        when(jwtTokenProvider.validateToken(token)).thenReturn(true);

        // Act
        boolean result = authService.validateToken(token);

        // Assert
        assertTrue(result);
        verify(jwtTokenProvider).validateToken(token);
    }

    @Test
    void testValidateTokenInvalid() {
        // Arrange
        String token = "invalid-token";
        when(jwtTokenProvider.validateToken(token)).thenReturn(false);

        // Act
        boolean result = authService.validateToken(token);

        // Assert
        assertFalse(result);
        verify(jwtTokenProvider).validateToken(token);
    }

    @Test
    void testRegisterPasswordHashing() {
        // Arrange
        String plainPassword = "password123";
        String hashedPassword = "bcrypt-hashed-password";
        
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(plainPassword)).thenReturn(hashedPassword);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toDTO(testUser)).thenReturn(testUserDTO);

        // Act
        authService.register(registerRequest);

        // Assert
        verify(passwordEncoder).encode(plainPassword);
    }

    @Test
    void testLoginWithDifferentRoles() {
        // Test with COMPANY role
        User companyUser = User.builder()
                .id(2L)
                .email("company@example.com")
                .passwordHash("hashedPassword")
                .name("Company User")
                .role(Role.COMPANY)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        LoginRequest companyLoginRequest = LoginRequest.builder()
                .email("company@example.com")
                .password("password123")
                .build();

        when(userRepository.findByEmail(companyLoginRequest.getEmail())).thenReturn(Optional.of(companyUser));
        when(passwordEncoder.matches(companyLoginRequest.getPassword(), companyUser.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.generateToken(companyUser.getId(), companyUser.getRole().toString()))
                .thenReturn("company-jwt-token");

        // Act
        LoginResponse result = authService.login(companyLoginRequest);

        // Assert
        assertEquals("COMPANY", result.getRole());
        assertEquals(2L, result.getUserId());
    }
}
