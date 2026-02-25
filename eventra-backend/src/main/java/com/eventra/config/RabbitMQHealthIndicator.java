package com.eventra.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;

/**
 * Custom actuator health indicator for the RabbitMQ STOMP relay.
 * 
 * Reports UP when the STOMP port (61613) on the configured relay host is reachable.
 * Only active when {@code stomp.broker.relay.enabled=true}.
 *
 * Exposed at: GET /actuator/health → "rabbitMQStomp": { "status": "UP", ... }
 */
@Component("rabbitMQStomp")
@ConditionalOnProperty(name = "stomp.broker.relay.enabled", havingValue = "true")
public class RabbitMQHealthIndicator implements HealthIndicator {

    @Value("${stomp.broker.relay.host:localhost}")
    private String relayHost;

    @Value("${stomp.broker.relay.port:61613}")
    private int relayPort;

    @Value("${stomp.broker.relay.virtual-host:/}")
    private String virtualHost;

    @Override
    public Health health() {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(relayHost, relayPort), 3000);
            return Health.up()
                    .withDetail("host", relayHost)
                    .withDetail("stompPort", relayPort)
                    .withDetail("virtualHost", virtualHost)
                    .withDetail("protocol", "STOMP 1.2")
                    .build();
        } catch (IOException e) {
            return Health.down()
                    .withDetail("host", relayHost)
                    .withDetail("stompPort", relayPort)
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
