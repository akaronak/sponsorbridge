package com.eventra.controller;

import com.eventra.dto.LoginRequest;
import com.eventra.dto.LoginResponse;
import com.eventra.dto.RegisterRequest;
import com.eventra.dto.UserDTO;
import com.eventra.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Register a new user (auto-login after registration)
     * @param request the registration request with @Valid annotation
     * @return 201 Created with LoginResponse (token + user)
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login user with email and password
     * @param request the login request with @Valid annotation
     * @return 200 OK with LoginResponse containing JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Validate JWT token
     * @param token the JWT token as query parameter or header
     * @return 200 OK with validation result
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(
            @RequestParam(value = "token", required = false) String queryToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        String token = queryToken;
        
        // If token not in query param, try to extract from Authorization header
        if (token == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        
        Map<String, Object> response = new HashMap<>();
        
        if (token == null || token.isEmpty()) {
            response.put("valid", false);
            return ResponseEntity.ok(response);
        }
        
        boolean isValid = authService.validateToken(token);
        response.put("valid", isValid);
        
        if (isValid) {
            response.put("userId", null); // Will be populated if needed
            response.put("role", null);   // Will be populated if needed
        }
        
        return ResponseEntity.ok(response);
    }
}
