/**
 * Fapshi Payment Service — Cameroon's #1 Payment API
 * Docs: https://docs.fapshi.com/en/api-reference
 * Supports: MTN Mobile Money & Orange Money via Fapshi gateway
 *
 * Auth: Pass `apiuser` and `apikey` as request headers.
 * Endpoints:
 *   POST /direct-pay    → Request payment from user's phone (USSD push)
 *   GET  /payment-status/:transId → Poll transaction status
 *
 * Environments:
 *   Sandbox: https://sandbox.fapshi.com
 *   Live:    https://live.fapshi.com
 */

const FAPSHI_API_USER = import.meta.env.VITE_FAPSHI_API_USER || '';
const FAPSHI_API_KEY = import.meta.env.VITE_FAPSHI_API_KEY || '';
const FAPSHI_ENV = import.meta.env.VITE_FAPSHI_ENV || 'sandbox'; // 'sandbox' | 'live'

const FAPSHI_BASE_URL =
    FAPSHI_ENV === 'live'
        ? 'https://live.fapshi.com'
        : 'https://sandbox.fapshi.com';

const fapshiHeaders = () => ({
    'Content-Type': 'application/json',
    'apiuser': FAPSHI_API_USER,
    'apikey': FAPSHI_API_KEY,
});

const isConfigured = () => !!FAPSHI_API_USER && !!FAPSHI_API_KEY;

// ---- Types ----
export interface FapshiPaymentRequest {
    amount: number;        // Minimum 100 XAF
    phone: string;         // 9-digit Cameroon number (e.g. "677123456")
    medium?: 'mobile money' | 'orange money'; // auto-detected if omitted
    name?: string;         // Payer name (for receipt)
    email?: string;        // Payer email (for receipt)
    userId?: string;       // Your internal user ID
    externalId?: string;   // Your order/transaction ID
    message?: string;      // Reason shown to payer (e.g. "Amoura - Account Verification")
}

export interface FapshiPaymentResponse {
    message: string;
    transId: string;
    dateInitiated: string;
}

export type FapshiTransactionStatus =
    | 'CREATED'
    | 'PENDING'
    | 'SUCCESSFUL'
    | 'FAILED'
    | 'EXPIRED';

export interface FapshiStatusResponse {
    transId: string;
    status: FapshiTransactionStatus;
    amount: number;
    medium: string;
    dateInitiated: string;
    dateConfirmed?: string;
}

export interface PaymentResult {
    success: boolean;
    transId?: string;
    error?: string;
}

// Auto-detect mobile money provider from Cameroon phone prefix
const detectMedium = (phone: string): 'mobile money' | 'orange money' => {
    const prefix = phone.replace(/\D/g, '').slice(0, 2);
    // MTN prefixes: 65, 67, 68
    return ['65', '67', '68'].includes(prefix) ? 'mobile money' : 'orange money';
};

// ---- Step 1: Initiate payment ----
const initiateDirectPay = async (
    req: FapshiPaymentRequest,
): Promise<FapshiPaymentResponse> => {
    const phone = req.phone.replace(/\D/g, ''); // Strip non-digits
    const medium = req.medium ?? detectMedium(phone);

    const body: Record<string, string | number> = {
        amount: req.amount,
        phone,
        medium,
    };
    if (req.name) body.name = req.name;
    if (req.email) body.email = req.email;
    if (req.userId) body.userId = req.userId;
    if (req.externalId) body.externalId = req.externalId;
    if (req.message) body.message = req.message;

    const resp = await fetch(`${FAPSHI_BASE_URL}/direct-pay`, {
        method: 'POST',
        headers: fapshiHeaders(),
        body: JSON.stringify(body),
    });

    if (!resp.ok) {
        const err = await resp.json() as { message?: string };
        throw new Error(err.message || `Fapshi error ${resp.status}`);
    }

    return resp.json() as Promise<FapshiPaymentResponse>;
};

// ---- Step 2: Poll payment status ----
export const getPaymentStatus = async (
    transId: string,
): Promise<FapshiStatusResponse> => {
    const resp = await fetch(
        `${FAPSHI_BASE_URL}/payment-status/${transId}`,
        { headers: fapshiHeaders() },
    );
    if (!resp.ok) {
        const err = await resp.json() as { message?: string };
        throw new Error(err.message || `Status check failed: ${resp.status}`);
    }
    return resp.json() as Promise<FapshiStatusResponse>;
};

// ---- Step 3: Poll until resolved (max ~90 seconds) ----
const pollUntilResolved = async (transId: string): Promise<void> => {
    for (let attempt = 0; attempt < 18; attempt++) {
        await new Promise(r => setTimeout(r, 5000)); // every 5s
        const status = await getPaymentStatus(transId);
        if (status.status === 'SUCCESSFUL') return;
        if (status.status === 'FAILED' || status.status === 'EXPIRED') {
            throw new Error(`Payment ${status.status.toLowerCase()}. Please try again.`);
        }
    }
    throw new Error('Payment timed out. Please check your phone and try again.');
};

// ---- Simulation fallback (no credentials set) ----
const simulateFapshi = async (req: FapshiPaymentRequest): Promise<PaymentResult> => {
    const medium = detectMedium(req.phone.replace(/\D/g, ''));
    console.log(`[Fapshi Simulation] ${medium} — ${req.amount} XAF to +237${req.phone}`);
    console.log(`[Fapshi Simulation] Message: "${req.message}"`);
    await new Promise(r => setTimeout(r, 3000));
    if (Math.random() > 0.08) {
        return { success: true, transId: `FAPSHI-SIM-${Date.now()}` };
    }
    throw new Error('Simulated payment failed — please try again.');
};

// ---- Main entry: process any payment via Fapshi ----
export const processFapshiPayment = async (
    req: FapshiPaymentRequest,
): Promise<PaymentResult> => {
    if (req.amount < 100) throw new Error('Minimum payment amount is 100 XAF');

    if (!isConfigured()) {
        console.warn('[Fapshi] No credentials set — running in simulation mode.');
        return simulateFapshi(req);
    }

    try {
        const { transId } = await initiateDirectPay(req);
        await pollUntilResolved(transId);
        return { success: true, transId };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Payment failed';
        return { success: false, error: message };
    }
};

// ---- Convenience: Account Verification Payment (100 XAF) ----
export const processVerificationPayment = async (
    phone: string,
    userName: string,
    userId?: string,
): Promise<PaymentResult> => {
    return processFapshiPayment({
        amount: 100,
        phone,
        name: userName,
        userId,
        externalId: `VER-${userId ?? Date.now()}-${Date.now()}`,
        message: 'Amoura — Account Verification (100 XAF refundable on first match)',
    });
};

// ---- Convenience: Subscription Payment ----
// Signature: (phone, tierName, amount, userName?, userId?)
export const processSubscriptionPayment = async (
    phone: string,
    tierName: string,
    amount: number,
    userName?: string,
    userId?: string,
): Promise<PaymentResult> => {
    return processFapshiPayment({
        amount,
        phone,
        name: userName,
        userId,
        externalId: `SUB-${tierName.toUpperCase()}-${Date.now()}`,
        message: `Amoura — ${tierName} Subscription`,
    });
};

// Legacy export alias for backward-compat with existing momoService calls
export const processMoMoPayment = async (
    phone: string,
    amount: number,
): Promise<PaymentResult> => {
    return processFapshiPayment({ phone, amount, message: 'Amoura Payment' });
};
