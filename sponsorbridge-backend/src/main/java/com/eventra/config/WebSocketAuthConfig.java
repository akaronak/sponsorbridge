package com.eventra.config;

import com.eventra.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

/**
 * WebSocket authentication interceptor.
 * Validates JWT tokens on CONNECT frames and sets the security principal.
 */
@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketAuthConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Extract token from STOMP headers
                    String token = null;
                    List<String> authorization = accessor.getNativeHeader("Authorization");
                    if (authorization != null && !authorization.isEmpty()) {
                        String bearerToken = authorization.get(0);
                        if (bearerToken.startsWith("Bearer ")) {
                            token = bearerToken.substring(7);
                        } else {
                            token = bearerToken;
                        }
                    }

                    // Also check 'token' header as fallback (for SockJS)
                    if (token == null) {
                        List<String> tokenHeader = accessor.getNativeHeader("token");
                        if (tokenHeader != null && !tokenHeader.isEmpty()) {
                            token = tokenHeader.get(0);
                        }
                    }

                    if (token != null && jwtTokenProvider.validateToken(token)) {
                        Long userId = jwtTokenProvider.getUserIdFromToken(token);
                        String role = jwtTokenProvider.getRoleFromToken(token);

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userId.toString(),
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                                );

                        accessor.setUser(auth);
                    }
                }

                return message;
            }
        });
    }
}
