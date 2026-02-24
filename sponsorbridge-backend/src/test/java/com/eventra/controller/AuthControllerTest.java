package com.eventra.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.eventra.dto.LoginRequest;
import com.eventra.dto.LoginResponse;
import com.eventra.dto.RegisterRequest;
import com.eventra.dto.UserDTO;
import com.eventra.filter.RateLimitFilter;
import com.eventra.infrastructure.DistributedRateLimiter;
import com.eventra.security.CustomUserDetailsService;
import com.eventra.security.JwtAuthenticationFilter;
import com.eventra.security.JwtTokenProvider;
import com.eventra.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private DistributedRateLimiter distributedRateLimiter;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private LoginResponse registerResponse;
    private LoginResponse loginResponse;

    @BeforeEach
    void setUp() {
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

        UserDTO userDTO = UserDTO.builder()
                .id("1")
                .email("test@example.com")
                .name("Test User")
                .role("ORGANIZER")
                .build();

        registerResponse = LoginResponse.builder()
                .token("jwt-token-register")
                .user(userDTO)
                .role("ORGANIZER")
                .userId("1")
                .expiresIn(86400000L)
                .build();

        loginResponse = LoginResponse.builder()
                .token("jwt-token-123")
                .user(userDTO)
                .role("ORGANIZER")
                .userId("1")
                .expiresIn(86400000L)
                .build();
    }

    @Test
    void testRegisterSuccess() throws Exception {
        // Arrange
        when(authService.register(any(RegisterRequest.class))).thenReturn(registerResponse);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", is("jwt-token-register")))
                .andExpect(jsonPath("$.user.id", is("1")))
                .andExpect(jsonPath("$.user.email", is("test@example.com")))
                .andExpect(jsonPath("$.user.name", is("Test User")))
                .andExpect(jsonPath("$.user.role", is("ORGANIZER")));

        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void testRegisterMissingEmail() throws Exception {
        // Arrange
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .password("password123")
                .name("Test User")
                .role("ORGANIZER")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).register(any(RegisterRequest.class));
    }

    @Test
    void testRegisterInvalidEmail() throws Exception {
        // Arrange
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .email("invalid-email")
                .password("password123")
                .name("Test User")
                .role("ORGANIZER")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).register(any(RegisterRequest.class));
    }

    @Test
    void testRegisterShortPassword() throws Exception {
        // Arrange
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("short")
                .name("Test User")
                .role("ORGANIZER")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).register(any(RegisterRequest.class));
    }

    @Test
    void testRegisterMissingName() throws Exception {
        // Arrange
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .role("ORGANIZER")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).register(any(RegisterRequest.class));
    }

    @Test
    void testRegisterMissingRole() throws Exception {
        // Arrange
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .name("Test User")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).register(any(RegisterRequest.class));
    }

    @Test
    void testRegisterDuplicateEmail() throws Exception {
        // Arrange
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new IllegalArgumentException("Email already registered"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());

        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void testLoginSuccess() throws Exception {
        // Arrange
        when(authService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is("jwt-token-123")))
                .andExpect(jsonPath("$.role", is("ORGANIZER")))
                .andExpect(jsonPath("$.userId", is("1")))
                .andExpect(jsonPath("$.expiresIn", is(86400000)))
                .andExpect(jsonPath("$.user.email", is("test@example.com")))
                .andExpect(jsonPath("$.user.name", is("Test User")));

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void testLoginMissingEmail() throws Exception {
        // Arrange
        LoginRequest invalidRequest = LoginRequest.builder()
                .password("password123")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).login(any(LoginRequest.class));
    }

    @Test
    void testLoginMissingPassword() throws Exception {
        // Arrange
        LoginRequest invalidRequest = LoginRequest.builder()
                .email("test@example.com")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).login(any(LoginRequest.class));
    }

    @Test
    void testLoginInvalidCredentials() throws Exception {
        // Arrange
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid email or password"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void testValidateTokenWithQueryParam() throws Exception {
        // Arrange
        String token = "valid-token";
        when(authService.validateToken(token)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(get("/api/auth/validate")
                .param("token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(true)));

        verify(authService).validateToken(token);
    }

    @Test
    void testValidateTokenWithAuthorizationHeader() throws Exception {
        // Arrange
        String token = "valid-token";
        when(authService.validateToken(token)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(get("/api/auth/validate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(true)));

        verify(authService).validateToken(token);
    }

    @Test
    void testValidateTokenInvalid() throws Exception {
        // Arrange
        String token = "invalid-token";
        when(authService.validateToken(token)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(get("/api/auth/validate")
                .param("token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(false)));

        verify(authService).validateToken(token);
    }

    @Test
    void testValidateTokenMissing() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/auth/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(false)));

        verify(authService, never()).validateToken(any());
    }

    @Test
    void testRegisterWithCompanyRole() throws Exception {
        // Arrange
        RegisterRequest companyRequest = RegisterRequest.builder()
                .email("company@example.com")
                .password("password123")
                .name("Company User")
                .role("COMPANY")
                .build();

        UserDTO companyDTO = UserDTO.builder()
                .id("2")
                .email("company@example.com")
                .name("Company User")
                .role("COMPANY")
                .build();

        LoginResponse companyResponse = LoginResponse.builder()
                .token("company-jwt-token")
                .user(companyDTO)
                .role("COMPANY")
                .userId("2")
                .expiresIn(86400000L)
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(companyResponse);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(companyRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role", is("COMPANY")));

        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void testRegisterWithAdminRole() throws Exception {
        // Arrange - ADMIN self-registration should be blocked by service
        RegisterRequest adminRequest = RegisterRequest.builder()
                .email("admin@example.com")
                .password("password123")
                .name("Admin User")
                .role("ADMIN")
                .build();

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid role. Allowed: ORGANIZER, COMPANY"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminRequest)))
                .andExpect(status().isBadRequest());

        verify(authService).register(any(RegisterRequest.class));
    }
}
