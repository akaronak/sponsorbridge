package com.eventra.service;

import com.eventra.config.PaymentProperties;
import com.eventra.dto.CreatePaymentOrderRequest;
import com.eventra.dto.PaymentDTO;
import com.eventra.dto.PaymentOrderResponse;
import com.eventra.dto.PaymentVerificationRequest;
import com.eventra.entity.*;
import com.eventra.exception.BadRequestException;
import com.eventra.exception.PaymentException;
import com.eventra.exception.ResourceNotFoundException;
import com.eventra.exception.UnauthorizedException;
import com.eventra.infrastructure.IdempotencyService;
import com.eventra.repository.*;
import com.razorpay.Order;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService")
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private SponsorshipRequestRepository requestRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private OrganizerRepository organizerRepository;
    @Mock private RazorpayGatewayService razorpayGateway;
    @Mock private IdempotencyService idempotencyService;
    @Mock private PaymentProperties paymentProperties;

    @InjectMocks
    private PaymentService paymentService;

    private SponsorshipRequest sponsorshipRequest;
    private Company company;
    private CreatePaymentOrderRequest createOrderRequest;

    @BeforeEach
    void setUp() {
        sponsorshipRequest = SponsorshipRequest.builder()
                .id("req-1")
                .companyId("company-1")
                .organizerId("organizer-1")
                .status(RequestStatus.ACCEPTED)
                .build();

        company = Company.builder()
                .id("company-1")
                .userId("user-1")
                .companyName("Test Corp")
                .build();

        createOrderRequest = CreatePaymentOrderRequest.builder()
                .requestId("req-1")
                .amount(BigDecimal.valueOf(5000))
                .currency("INR")
                .description("Sponsorship payment")
                .build();
    }

    // ═══════════════════════════════════════════════════
    //  Order Creation
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("createOrder")
    class CreateOrder {

        @Test
        @DisplayName("Successfully creates order and returns response")
        void success() throws Exception {
            when(requestRepository.findById("req-1")).thenReturn(Optional.of(sponsorshipRequest));
            when(companyRepository.findById("company-1")).thenReturn(Optional.of(company));
            when(paymentRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
            when(paymentProperties.getMaxPaymentAmount()).thenReturn(BigDecimal.valueOf(10000000));
            when(paymentProperties.getCommissionPercent()).thenReturn(BigDecimal.valueOf(10));

            Payment savedPayment = Payment.builder()
                    .id("pay-1")
                    .amount(BigDecimal.valueOf(5000))
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .build();
            when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);

            Order mockRazorpayOrder = mock(Order.class);
            when(mockRazorpayOrder.get("id")).thenReturn("order_rzp_123");
            when(razorpayGateway.createOrder(anyLong(), anyString(), anyString(), any(JSONObject.class)))
                    .thenReturn(mockRazorpayOrder);
            when(razorpayGateway.getKeyId()).thenReturn("rzp_test_key");

            PaymentOrderResponse response = paymentService.createOrder("user-1", createOrderRequest);

            assertNotNull(response);
            assertEquals("pay-1", response.getPaymentId());
            verify(paymentRepository, times(2)).save(any(Payment.class));
            verify(razorpayGateway).createOrder(eq(500000L), eq("INR"), eq("pay-1"), any(JSONObject.class));
        }

        @Test
        @DisplayName("Rejects payment for non-ACCEPTED request")
        void rejectNonAccepted() {
            sponsorshipRequest.setStatus(RequestStatus.PENDING);
            when(requestRepository.findById("req-1")).thenReturn(Optional.of(sponsorshipRequest));

            assertThrows(BadRequestException.class,
                    () -> paymentService.createOrder("user-1", createOrderRequest));
        }

        @Test
        @DisplayName("Throws if request not found")
        void requestNotFound() {
            when(requestRepository.findById("req-1")).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> paymentService.createOrder("user-1", createOrderRequest));
        }

        @Test
        @DisplayName("Rejects unauthorized user")
        void unauthorizedUser() {
            when(requestRepository.findById("req-1")).thenReturn(Optional.of(sponsorshipRequest));
            when(companyRepository.findById("company-1")).thenReturn(Optional.empty());

            assertThrows(UnauthorizedException.class,
                    () -> paymentService.createOrder("wrong-user", createOrderRequest));
        }

        @Test
        @DisplayName("Returns existing payment for duplicate idempotency key")
        void idempotencyDuplicate() {
            createOrderRequest.setIdempotencyKey("idem-123");
            when(requestRepository.findById("req-1")).thenReturn(Optional.of(sponsorshipRequest));
            when(companyRepository.findById("company-1")).thenReturn(Optional.of(company));

            Payment existingPayment = Payment.builder()
                    .id("pay-existing")
                    .razorpayOrderId("order_rzp_existing")
                    .amount(BigDecimal.valueOf(5000))
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .build();
            when(paymentRepository.findByIdempotencyKey("idem-123")).thenReturn(Optional.of(existingPayment));
            when(razorpayGateway.getKeyId()).thenReturn("rzp_test_key");

            PaymentOrderResponse response = paymentService.createOrder("user-1", createOrderRequest);

            assertEquals("pay-existing", response.getPaymentId());
            verify(razorpayGateway, never()).createOrder(anyLong(), anyString(), anyString(), any());
        }

        @Test
        @DisplayName("Rejects amount exceeding max limit (fraud guard)")
        void exceedsMaxAmount() {
            when(requestRepository.findById("req-1")).thenReturn(Optional.of(sponsorshipRequest));
            when(companyRepository.findById("company-1")).thenReturn(Optional.of(company));
            when(paymentRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
            when(paymentProperties.getMaxPaymentAmount()).thenReturn(BigDecimal.valueOf(100));

            createOrderRequest.setAmount(BigDecimal.valueOf(999999));

            assertThrows(BadRequestException.class,
                    () -> paymentService.createOrder("user-1", createOrderRequest));
        }
    }

    // ═══════════════════════════════════════════════════
    //  Payment Verification
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("verifyPayment")
    class VerifyPayment {

        @Test
        @DisplayName("Verifies signature and transitions to AUTHORIZED")
        void success() {
            PaymentVerificationRequest verifyReq = PaymentVerificationRequest.builder()
                    .razorpayOrderId("order_rzp_123")
                    .razorpayPaymentId("pay_rzp_456")
                    .razorpaySignature("valid_sig")
                    .build();

            when(razorpayGateway.verifyPaymentSignature("order_rzp_123", "pay_rzp_456", "valid_sig"))
                    .thenReturn(true);

            Payment payment = Payment.builder()
                    .id("pay-1")
                    .requestId("req-1")
                    .companyId("company-1")
                    .organizerId("organizer-1")
                    .amount(BigDecimal.valueOf(5000))
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .build();
            when(paymentRepository.findByRazorpayOrderId("order_rzp_123")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            PaymentDTO dto = paymentService.verifyPayment(verifyReq);

            assertNotNull(dto);
            verify(paymentRepository).save(any(Payment.class));
        }

        @Test
        @DisplayName("Throws on invalid signature")
        void invalidSignature() {
            PaymentVerificationRequest verifyReq = PaymentVerificationRequest.builder()
                    .razorpayOrderId("order_rzp_123")
                    .razorpayPaymentId("pay_rzp_456")
                    .razorpaySignature("bad_sig")
                    .build();

            when(razorpayGateway.verifyPaymentSignature(any(), any(), any())).thenReturn(false);

            assertThrows(PaymentException.class, () -> paymentService.verifyPayment(verifyReq));
        }
    }

    // ═══════════════════════════════════════════════════
    //  Webhook Processing
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("processWebhookEvent")
    class WebhookProcessing {

        @Test
        @DisplayName("payment.captured: transitions CREATED → IN_ESCROW and creates audit trail")
        void paymentCaptured() {
            JSONObject payload = createCapturedPayload("pay_rzp_1", "order_rzp_1", 500000L);

            when(idempotencyService.markWebhookProcessed("captured:pay_rzp_1")).thenReturn(true);

            Payment payment = Payment.builder()
                    .id("pay-1")
                    .requestId("req-1")
                    .companyId("company-1")
                    .organizerId("organizer-1")
                    .amount(BigDecimal.valueOf(5000))
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .platformCommission(BigDecimal.valueOf(500))
                    .commissionRate(BigDecimal.valueOf(0.1))
                    .organizerPayout(BigDecimal.valueOf(4500))
                    .build();
            when(paymentRepository.findByRazorpayOrderId("order_rzp_1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
            when(paymentProperties.getEscrowHoldDays()).thenReturn(7);

            paymentService.processWebhookEvent("payment.captured", payload);

            assertEquals(PaymentStatus.IN_ESCROW, payment.getStatus());
            verify(transactionRepository, times(3)).save(any()); // CAPTURE + ESCROW_HOLD + COMMISSION
        }

        @Test
        @DisplayName("payment.captured: rejects amount mismatch (fraud guard)")
        void capturedAmountMismatch() {
            // Payload says 999999 paise but payment amount is 5000 rupees (500000 paise)
            JSONObject payload = createCapturedPayload("pay_rzp_1", "order_rzp_1", 999999L);

            when(idempotencyService.markWebhookProcessed("captured:pay_rzp_1")).thenReturn(true);

            Payment payment = Payment.builder()
                    .id("pay-1")
                    .amount(BigDecimal.valueOf(5000))
                    .status(PaymentStatus.CREATED)
                    .build();
            when(paymentRepository.findByRazorpayOrderId("order_rzp_1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            paymentService.processWebhookEvent("payment.captured", payload);

            assertEquals(PaymentStatus.FAILED, payment.getStatus());
        }

        @Test
        @DisplayName("payment.captured: idempotent — skips duplicate event")
        void capturedDuplicate() {
            JSONObject payload = createCapturedPayload("pay_rzp_1", "order_rzp_1", 500000L);
            when(idempotencyService.markWebhookProcessed("captured:pay_rzp_1")).thenReturn(false);

            paymentService.processWebhookEvent("payment.captured", payload);

            verify(paymentRepository, never()).findByRazorpayOrderId(any());
        }

        @Test
        @DisplayName("payment.failed: marks payment as FAILED")
        void paymentFailed() {
            JSONObject payload = createFailedPayload("pay_rzp_1", "order_rzp_1", "Card declined");

            when(idempotencyService.markWebhookProcessed("failed:pay_rzp_1")).thenReturn(true);

            Payment payment = Payment.builder()
                    .id("pay-1")
                    .amount(BigDecimal.valueOf(5000))
                    .status(PaymentStatus.CREATED)
                    .build();
            when(paymentRepository.findByRazorpayOrderId("order_rzp_1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            paymentService.processWebhookEvent("payment.failed", payload);

            assertEquals(PaymentStatus.FAILED, payment.getStatus());
        }

        @Test
        @DisplayName("Unknown event type is ignored")
        void unknownEvent() {
            paymentService.processWebhookEvent("order.created", new JSONObject());
            verifyNoInteractions(paymentRepository);
        }
    }

    // ═══════════════════════════════════════════════════
    //  Queries
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("Queries")
    class Queries {

        @Test
        @DisplayName("getPaymentById returns DTO")
        void getById() {
            Payment payment = Payment.builder()
                    .id("pay-1")
                    .requestId("req-1")
                    .companyId("company-1")
                    .organizerId("organizer-1")
                    .amount(BigDecimal.valueOf(5000))
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .build();
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));

            PaymentDTO dto = paymentService.getPaymentById("pay-1");

            assertEquals("pay-1", dto.getId());
            assertEquals(BigDecimal.valueOf(5000), dto.getAmount());
        }

        @Test
        @DisplayName("getPaymentById throws when not found")
        void getByIdNotFound() {
            when(paymentRepository.findById("missing")).thenReturn(Optional.empty());
            assertThrows(ResourceNotFoundException.class, () -> paymentService.getPaymentById("missing"));
        }

        @Test
        @DisplayName("getPaymentsByCompany returns paginated results")
        void byCompany() {
            Payment payment = Payment.builder()
                    .id("pay-1")
                    .requestId("req-1")
                    .companyId("company-1")
                    .organizerId("organizer-1")
                    .amount(BigDecimal.valueOf(5000))
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .build();
            Page<Payment> page = new PageImpl<>(List.of(payment));
            when(paymentRepository.findByCompanyIdOrderByCreatedAtDesc(eq("company-1"), any()))
                    .thenReturn(page);

            Page<PaymentDTO> result = paymentService.getPaymentsByCompany("company-1", PageRequest.of(0, 20));

            assertEquals(1, result.getTotalElements());
        }
    }

    // ═══════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════

    private JSONObject createCapturedPayload(String paymentId, String orderId, long amountPaise) {
        JSONObject entity = new JSONObject();
        entity.put("id", paymentId);
        entity.put("order_id", orderId);
        entity.put("amount", amountPaise);
        entity.put("method", "card");

        JSONObject paymentObj = new JSONObject();
        paymentObj.put("entity", entity);

        JSONObject payloadObj = new JSONObject();
        payloadObj.put("payment", paymentObj);

        JSONObject event = new JSONObject();
        event.put("payload", payloadObj);
        return event;
    }

    private JSONObject createFailedPayload(String paymentId, String orderId, String errorDesc) {
        JSONObject entity = new JSONObject();
        entity.put("id", paymentId);
        entity.put("order_id", orderId);
        entity.put("error_description", errorDesc);

        JSONObject paymentObj = new JSONObject();
        paymentObj.put("entity", entity);

        JSONObject payloadObj = new JSONObject();
        payloadObj.put("payment", paymentObj);

        JSONObject event = new JSONObject();
        event.put("payload", payloadObj);
        return event;
    }
}
