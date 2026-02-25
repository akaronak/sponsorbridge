package com.eventra.config;

import io.micrometer.core.instrument.Counter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Listens to WebSocket session lifecycle events and updates metrics.
 *
 * <h3>Events handled:</h3>
 * <ul>
 *   <li>{@link SessionConnectEvent}    — Increments active session gauge</li>
 *   <li>{@link SessionDisconnectEvent} — Decrements active session gauge, logs disconnect reason</li>
 * </ul>
 */
@Component
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final AtomicLong activeSessions;
    private final Counter connectionErrors;

    public WebSocketEventListener(
            @Qualifier("activeWebSocketSessions") AtomicLong activeSessions,
            @Qualifier("wsConnectionErrorCounter") Counter connectionErrors) {
        this.activeSessions = activeSessions;
        this.connectionErrors = connectionErrors;
    }

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        long count = activeSessions.incrementAndGet();
        Principal user = event.getUser();
        String userId = user != null ? user.getName() : "anonymous";

        MDC.put("wsSessionId", extractSessionId(event));
        MDC.put("userId", userId);

        log.info("WebSocket CONNECT — user={}, activeSessions={}", userId, count);

        MDC.remove("wsSessionId");
        MDC.remove("userId");
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        long count = activeSessions.decrementAndGet();
        Principal user = event.getUser();
        String userId = user != null ? user.getName() : "anonymous";
        String closeStatus = event.getCloseStatus() != null
                ? event.getCloseStatus().toString()
                : "unknown";

        MDC.put("wsSessionId", event.getSessionId());
        MDC.put("userId", userId);

        // Track abnormal closures as connection errors
        if (event.getCloseStatus() != null && event.getCloseStatus().getCode() >= 1002) {
            connectionErrors.increment();
            log.warn("WebSocket DISCONNECT (abnormal) — user={}, status={}, activeSessions={}",
                    userId, closeStatus, count);
        } else {
            log.info("WebSocket DISCONNECT — user={}, status={}, activeSessions={}",
                    userId, closeStatus, count);
        }

        MDC.remove("wsSessionId");
        MDC.remove("userId");
    }

    private String extractSessionId(SessionConnectEvent event) {
        try {
            return event.getMessage().getHeaders().get("simpSessionId", String.class);
        } catch (Exception e) {
            return "unknown";
        }
    }
}
