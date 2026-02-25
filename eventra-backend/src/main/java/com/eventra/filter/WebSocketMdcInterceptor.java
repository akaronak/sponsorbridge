package com.eventra.filter;

import org.slf4j.MDC;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

import java.security.Principal;
import java.util.UUID;

/**
 * STOMP channel interceptor that injects WebSocket correlation context into MDC.
 *
 * <h3>MDC fields set per STOMP frame:</h3>
 * <ul>
 *   <li><b>wsSessionId</b> — WebSocket session ID</li>
 *   <li><b>requestId</b>   — Per-message correlation ID</li>
 *   <li><b>userId</b>      — Authenticated user (from STOMP principal)</li>
 *   <li><b>stompCmd</b>    — STOMP command (CONNECT, SEND, SUBSCRIBE, etc.)</li>
 *   <li><b>destination</b> — STOMP destination</li>
 * </ul>
 *
 * <p>Registered in {@link com.eventra.config.ObservabilityConfig} as an
 * inbound channel interceptor, ordered after the auth interceptor.</p>
 */
public class WebSocketMdcInterceptor implements ChannelInterceptor {

    private static final String MDC_WS_SESSION = "wsSessionId";
    private static final String MDC_REQUEST_ID = "requestId";
    private static final String MDC_USER_ID = "userId";
    private static final String MDC_STOMP_CMD = "stompCmd";
    private static final String MDC_DESTINATION = "destination";

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        StompCommand command = accessor.getCommand();

        // Set session-level MDC
        String sessionId = accessor.getSessionId();
        if (sessionId != null) {
            MDC.put(MDC_WS_SESSION, sessionId);
        }

        // Per-message correlation ID
        MDC.put(MDC_REQUEST_ID, UUID.randomUUID().toString().replace("-", "").substring(0, 16));

        // Command
        if (command != null) {
            MDC.put(MDC_STOMP_CMD, command.name());
        }

        // Destination
        String destination = accessor.getDestination();
        if (destination != null) {
            MDC.put(MDC_DESTINATION, destination);
        }

        // User from principal (set by WebSocketAuthConfig on CONNECT)
        Principal principal = accessor.getUser();
        if (principal != null) {
            MDC.put(MDC_USER_ID, principal.getName());
        }

        return message;
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel,
                                     boolean sent, Exception ex) {
        // Clear MDC after message processing to prevent thread-pool leakage
        MDC.remove(MDC_WS_SESSION);
        MDC.remove(MDC_REQUEST_ID);
        MDC.remove(MDC_USER_ID);
        MDC.remove(MDC_STOMP_CMD);
        MDC.remove(MDC_DESTINATION);
    }
}
