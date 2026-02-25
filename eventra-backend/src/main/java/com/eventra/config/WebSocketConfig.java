package com.eventra.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
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
 * Topic structure (preserved across simple & relay broker):
 * - /topic/conversation/{id}          → Messages for a specific conversation
 * - /topic/conversation/{id}/typing   → Typing indicators
 * - /topic/conversation/{id}/read     → Read receipts
 * - /user/{userId}/queue/messages     → Per-user message delivery
 * - /user/{userId}/queue/notifications → Per-user notification queue
 *
 * Broker modes:
 *   stomp.broker.relay.enabled=true  → RabbitMQ STOMP relay (production / Docker)
 *   stomp.broker.relay.enabled=false → In-memory simple broker (standalone dev)
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebSocketConfig.class);

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;

    // ── Broker relay toggle ──────────────────────────────────────
    @Value("${stomp.broker.relay.enabled:false}")
    private boolean relayEnabled;

    // ── RabbitMQ connection (only used when relay is enabled) ────
    @Value("${stomp.broker.relay.host:localhost}")
    private String relayHost;

    @Value("${stomp.broker.relay.port:61613}")
    private int relayPort;

    @Value("${stomp.broker.relay.login:guest}")
    private String relayLogin;

    @Value("${stomp.broker.relay.passcode:guest}")
    private String relayPasscode;

    @Value("${stomp.broker.relay.virtual-host:/}")
    private String relayVirtualHost;

    // ── Heartbeat & tuning ───────────────────────────────────────
    @Value("${stomp.broker.heartbeat.send:10000}")
    private long heartbeatSend;

    @Value("${stomp.broker.heartbeat.receive:10000}")
    private long heartbeatReceive;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        if (relayEnabled) {
            configureStompBrokerRelay(config);
        } else {
            configureSimpleBroker(config);
        }

        // Prefix for messages FROM clients TO the server
        config.setApplicationDestinationPrefixes("/app");

        // Prefix for user-specific destinations (/user/{userId}/queue/...)
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Production mode: external RabbitMQ STOMP broker relay.
     * Enables horizontal scaling — multiple backend instances share a single broker.
     */
    private void configureStompBrokerRelay(MessageBrokerRegistry config) {
        log.info("╔══════════════════════════════════════════════════════╗");
        log.info("║  STOMP broker relay → RabbitMQ @ {}:{}  ║", relayHost, relayPort);
        log.info("║  Virtual host: {}                                   ║", relayVirtualHost);
        log.info("╚══════════════════════════════════════════════════════╝");

        config.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost(relayHost)
                .setRelayPort(relayPort)
                .setClientLogin(relayLogin)
                .setClientPasscode(relayPasscode)
                .setSystemLogin(relayLogin)
                .setSystemPasscode(relayPasscode)
                .setVirtualHost(relayVirtualHost)
                .setSystemHeartbeatSendInterval(heartbeatSend)
                .setSystemHeartbeatReceiveInterval(heartbeatReceive)
                .setAutoStartup(true);
    }

    /**
     * Standalone dev mode: in-memory simple broker.
     * No external dependency required — single instance only.
     */
    private void configureSimpleBroker(MessageBrokerRegistry config) {
        log.info("╔══════════════════════════════════════════════════════╗");
        log.info("║  STOMP simple broker (in-memory, single instance)   ║");
        log.info("╚══════════════════════════════════════════════════════╝");

        ThreadPoolTaskScheduler heartbeatScheduler = new ThreadPoolTaskScheduler();
        heartbeatScheduler.setPoolSize(1);
        heartbeatScheduler.setThreadNamePrefix("ws-heartbeat-");
        heartbeatScheduler.initialize();

        config.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[]{heartbeatSend, heartbeatReceive})
                .setTaskScheduler(heartbeatScheduler);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint with SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins.split(","))
                .withSockJS()
                .setHeartbeatTime(25000);  // SockJS heartbeat (keep-alive for proxies)
        
        // Raw WebSocket endpoint (no SockJS) for native WebSocket clients
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins.split(","));
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration
                .setMessageSizeLimit(128 * 1024)    // 128 KB max message
                .setSendBufferSizeLimit(512 * 1024)  // 512 KB send buffer
                .setSendTimeLimit(20 * 1000);        // 20s max send time
    }
}
