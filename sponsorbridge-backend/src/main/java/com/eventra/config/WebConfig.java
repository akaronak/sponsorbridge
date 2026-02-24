package com.eventra.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Web MVC configuration.
 *
 * <p>Rate limiting is now handled by {@link com.eventra.filter.RateLimitFilter}
 * as a servlet filter (not an interceptor), which provides:</p>
 * <ul>
 *   <li>Access to SecurityContext (runs after auth filter)</li>
 *   <li>Consistent behavior across all request types</li>
 *   <li>Distributed state via Redis</li>
 * </ul>
 *
 * <p>CORS is configured via {@link CorsConfigurationSource} bean to avoid
 * Spring Boot 3.4+ conflict between default allowedOrigins and allowCredentials.
 * In production behind ALB/CloudFront, CORS should be handled at the reverse proxy level.</p>
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of(
                "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
