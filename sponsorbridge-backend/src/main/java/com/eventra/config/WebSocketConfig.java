package com.eventra.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

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
 * - /topic/conversation/{id}          → Messages for a specific conversation
 * - /topic/conversation/{id}/typing   → Typing indicators
 * - /topic/conversation/{id}/read     → Read receipts
 * - /user/{userId}/queue/messages     → Per-user message delivery
 * - /user/{userId}/queue/notifications → Per-user notification queue
 *
 * Production note:
 *   Replace enableSimpleBroker() with enableStompBrokerRelay() backed by
 *   RabbitMQ / ActiveMQ for horizontal scaling across multiple instances.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory broker for topic & queue destinations
        // In production, replace with:
        //   config.enableStompBrokerRelay("/topic", "/queue")
        //         .setRelayHost("rabbitmq-host")
        //         .setRelayPort(61613);
        config.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[]{10000, 10000})  // server→client, client→server (10s)
                .setTaskScheduler(new org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler() {{
                    setPoolSize(1);
                    setThreadNamePrefix("ws-heartbeat-");
                    initialize();
                }});
        
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
                .withSockJS()
                .setHeartbeatTime(25000);  // SockJS heartbeat (keep-alive for proxies)
        
        // Raw WebSocket endpoint (no SockJS) for native WebSocket clients
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration
                .setMessageSizeLimit(128 * 1024)    // 128 KB max message
                .setSendBufferSizeLimit(512 * 1024)  // 512 KB send buffer
                .setSendTimeLimit(20 * 1000);        // 20s max send time
    }
}
