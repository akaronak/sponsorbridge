package com.eventra.scheduler;

import com.eventra.service.DisputeService;
import com.eventra.service.EscrowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled jobs for automated payment lifecycle management.
 *
 * <h3>Jobs:</h3>
 * <ul>
 *   <li><b>Escrow auto-release</b>: Releases payments whose hold period has expired (every hour)</li>
 *   <li><b>Dispute auto-resolve</b>: Resolves expired disputes in organizer's favor (every 4 hours)</li>
 * </ul>
 *
 * <h3>Concurrency safety:</h3>
 * Safe in multi-instance deployments because the underlying services use Redis distributed
 * locks for each payment/dispute. Duplicate processing is a no-op.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class PaymentScheduler {

    private final EscrowService escrowService;
    private final DisputeService disputeService;

    /**
     * Auto-release escrow payments whose hold period has expired.
     * Runs every hour.
     */
    @Scheduled(cron = "${payment.escrow-release-cron:0 0 * * * *}")
    public void autoReleaseEscrow() {
        log.info("Starting scheduled escrow auto-release scan");
        try {
            int released = escrowService.autoReleaseEligiblePayments();
            log.info("Scheduled escrow auto-release completed: {} payments released", released);
        } catch (Exception e) {
            log.error("Escrow auto-release job failed: {}", e.getMessage(), e);
        }
    }

    /**
     * Auto-resolve expired disputes in organizer's favor.
     * Runs every 4 hours.
     */
    @Scheduled(cron = "${payment.dispute-resolve-cron:0 0 */4 * * *}")
    public void autoResolveDisputes() {
        log.info("Starting scheduled dispute auto-resolution scan");
        try {
            int resolved = disputeService.autoResolveExpiredDisputes();
            log.info("Scheduled dispute auto-resolution completed: {} disputes resolved", resolved);
        } catch (Exception e) {
            log.error("Dispute auto-resolution job failed: {}", e.getMessage(), e);
        }
    }
}
