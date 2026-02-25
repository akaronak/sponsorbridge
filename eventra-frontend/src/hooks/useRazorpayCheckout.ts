import { useCallback, useRef, useState } from 'react';
import { paymentApi } from '../api/payments';
import type {
  CreatePaymentOrderRequest,
  PaymentOrderResponse,
  PaymentDTO,
} from '../types/payment';

// ─── Razorpay global type ───────────────────────────────────

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// ─── Hook state ─────────────────────────────────────────────

interface UseRazorpayCheckoutState {
  /** Currently loading / processing */
  isLoading: boolean;
  /** Error message if checkout failed */
  error: string | null;
  /** The payment order response from our backend */
  orderResponse: PaymentOrderResponse | null;
  /** The verified payment after checkout completes */
  verifiedPayment: PaymentDTO | null;
}

interface UseRazorpayCheckoutReturn extends UseRazorpayCheckoutState {
  /**
   * Initiate the Razorpay checkout flow:
   * 1. Create order on our backend
   * 2. Open Razorpay checkout widget
   * 3. On success, verify payment with our backend
   */
  initiateCheckout: (
    request: CreatePaymentOrderRequest,
    prefill?: { name?: string; email?: string; contact?: string }
  ) => Promise<PaymentDTO | null>;
  /** Reset state for a new checkout */
  reset: () => void;
}

// ─── Script loader ──────────────────────────────────────────

let razorpayScriptLoaded = false;
let razorpayScriptLoading: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (razorpayScriptLoaded) return Promise.resolve();
  if (razorpayScriptLoading) return razorpayScriptLoading;

  razorpayScriptLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      razorpayScriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      razorpayScriptLoading = null;
      reject(new Error('Failed to load Razorpay checkout script'));
    };
    document.body.appendChild(script);
  });

  return razorpayScriptLoading;
}

// ─── Hook ───────────────────────────────────────────────────

export function useRazorpayCheckout(): UseRazorpayCheckoutReturn {
  const [state, setState] = useState<UseRazorpayCheckoutState>({
    isLoading: false,
    error: null,
    orderResponse: null,
    verifiedPayment: null,
  });

  const razorpayRef = useRef<RazorpayInstance | null>(null);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      orderResponse: null,
      verifiedPayment: null,
    });
  }, []);

  const initiateCheckout = useCallback(
    async (
      request: CreatePaymentOrderRequest,
      prefill?: { name?: string; email?: string; contact?: string }
    ): Promise<PaymentDTO | null> => {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      try {
        // 1. Load Razorpay SDK
        await loadRazorpayScript();

        // 2. Create order on our backend
        const orderResponse = await paymentApi.createOrder(request);
        setState((s) => ({ ...s, orderResponse }));

        // 3. Open checkout widget
        return new Promise<PaymentDTO | null>((resolve) => {
          const options: RazorpayOptions = {
            key: orderResponse.razorpayKeyId,
            amount: orderResponse.amount * 100, // paise
            currency: orderResponse.currency,
            name: import.meta.env.VITE_APP_NAME || 'Eventra',
            description: request.description || 'Sponsorship Payment',
            order_id: orderResponse.razorpayOrderId,
            prefill,
            theme: {
              color: '#6366f1', // Indigo to match the app theme
            },
            handler: async (response: RazorpayResponse) => {
              try {
                // 4. Verify payment with our backend
                const verified = await paymentApi.verifyPayment({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                setState((s) => ({
                  ...s,
                  isLoading: false,
                  verifiedPayment: verified,
                }));
                resolve(verified);
              } catch (err) {
                const msg =
                  err instanceof Error ? err.message : 'Payment verification failed';
                setState((s) => ({ ...s, isLoading: false, error: msg }));
                resolve(null);
              }
            },
            modal: {
              ondismiss: () => {
                setState((s) => ({
                  ...s,
                  isLoading: false,
                  error: 'Payment cancelled by user',
                }));
                resolve(null);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          razorpayRef.current = rzp;
          rzp.open();
        });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to initiate payment';
        setState((s) => ({ ...s, isLoading: false, error: msg }));
        return null;
      }
    },
    []
  );

  return { ...state, initiateCheckout, reset };
}
