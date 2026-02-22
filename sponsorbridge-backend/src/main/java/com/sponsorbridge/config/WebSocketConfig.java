package com.sponsorbridge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration using STOMP protocol.
 * 
 * Architecture:
 * - /ws → WebSocket handshake endpoint (with SockJS fallback)
 * - /topic → Broadcast messages (typing indicators, notifications)
 * - /queue → User-specific messages (direct message delivery)
 * - /app → Application-destination prefix for client-to-server messages
 *
 * Topic structure:
 * - /topic/conversation/{id} → Messages for a specific conversation
 * - /topic/conversation/{id}/typing → Typing indicators
 * - /queue/notifications → Per-user notification queue
 * - /queue/messages → Per-user message delivery
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory broker for topic & queue destinations
        // In production, replace with RabbitMQ or ActiveMQ for clustering
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefix for messages FROM clients TO the server
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefix for user-specific destinations (/user/{userId}/queue/...)
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint with SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        // Raw WebSocket endpoint (no SockJS) for native WebSocket clients
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }
}
