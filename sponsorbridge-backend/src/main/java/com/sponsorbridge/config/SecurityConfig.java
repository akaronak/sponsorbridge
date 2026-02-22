package com.sponsorbridge.config;

import com.sponsorbridge.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Configure BCrypt password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configure authentication manager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configure HTTP security
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for stateless API
                .csrf(csrf -> csrf.disable())

                // Set session management to stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configure endpoint authorization
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/validate").permitAll()
                        .requestMatchers("/api/companies/search").permitAll()
                        .requestMatchers("/api/companies/{id}").permitAll()
                        .requestMatchers("/api/organizers/{id}").permitAll()

                        // WebSocket endpoints (auth handled at STOMP level)
                        .requestMatchers("/ws/**").permitAll()

                        // Conversation & messaging endpoints
                        .requestMatchers("/api/conversations/**").authenticated()
                        .requestMatchers("/api/notifications/**").authenticated()

                        // Company endpoints - require COMPANY role
                        .requestMatchers(HttpMethod.POST, "/api/companies").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.PUT, "/api/companies/{id}").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.GET, "/api/requests/company/{companyId}").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.PUT, "/api/requests/{id}/status").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.GET, "/api/export/company/{companyId}/requests").hasRole("COMPANY")

                        // Organizer endpoints - require ORGANIZER role
                        .requestMatchers(HttpMethod.POST, "/api/organizers").hasRole("ORGANIZER")
                        .requestMatchers(HttpMethod.PUT, "/api/organizers/{id}").hasRole("ORGANIZER")
                        .requestMatchers(HttpMethod.POST, "/api/requests").hasRole("ORGANIZER")
                        .requestMatchers(HttpMethod.GET, "/api/requests/organizer/{organizerId}").hasRole("ORGANIZER")
                        .requestMatchers(HttpMethod.POST, "/api/email-template").hasRole("ORGANIZER")
                        .requestMatchers(HttpMethod.GET, "/api/export/organizer/{organizerId}/requests").hasRole("ORGANIZER")

                        // Admin endpoints - require ADMIN role
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // AI endpoints - require authentication
                        .requestMatchers("/api/ai/**").authenticated()

                        // Message endpoints - require authentication
                        .requestMatchers("/api/messages/**").authenticated()
                        .requestMatchers("/api/requests/{id}").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                // Add JWT filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
