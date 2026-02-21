/**
 * Payment Service — MTN MoMo & Orange Money (Cameroon)
 *
 * MTN MoMo API Docs: https://developers.mtn.com/products/collection
 * Orange Money Docs: https://developer.orange.com/apis/om-api-cm
 *
 * Flow:
 *  1. Create API user (MTN sandbox only, done once via provisioning)
 *  2. Create API key
 *  3. Request payment → user receives USSD push prompt
 *  4. Poll transaction status → resolve on successful payment
 */

const MTN_API_URL = import.meta.env.VITE_MTN_MOMO_API_URL || 'https://sandbox.momodeveloper.mtn.com';
const MTN_COLLECTION_API_KEY = import.meta.env.VITE_MTN_MOMO_COLLECTION_API_KEY || '';
const MTN_USER_ID = import.meta.env.VITE_MTN_MOMO_COLLECTION_USER_ID || '';
const MTN_ENV = import.meta.env.VITE_MTN_MOMO_ENVIRONMENT || 'sandbox';

const ORANGE_API_URL = import.meta.env.VITE_ORANGE_MONEY_API_URL || 'https://api.orange.com/orange-money-webpay/cm/v1';
const ORANGE_TOKEN_URL = import.meta.env.VITE_ORANGE_MONEY_ACCESS_TOKEN_URL || 'https://api.orange.com/oauth/v3/token';
const ORANGE_CLIENT_ID = import.meta.env.VITE_ORANGE_MONEY_CLIENT_ID || '';
const ORANGE_CLIENT_SECRET = import.meta.env.VITE_ORANGE_MONEY_CLIENT_SECRET || '';
const ORANGE_MERCHANT_KEY = import.meta.env.VITE_ORANGE_MONEY_MERCHANT_KEY || '';

export type PaymentProvider = 'mtn' | 'orange' | 'auto';

export interface PaymentRequest {
  phone: string;     // 9-digit Cameroon number (e.g. 677123456)
  amount: number;    // in XAF
  currency?: string; // defaults to 'XAF'
  description?: string;
  provider?: PaymentProvider;
  language?: 'en' | 'fr';
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  provider: PaymentProvider;
  error?: string;
}

// Detect provider from phone number prefix
const detectProvider = (phone: string): 'mtn' | 'orange' => {
  const prefix = phone.substring(0, 2);
  // MTN: 65, 67, 68 | Orange: 69, 55, 56, 57
  return ['65', '67', '68'].includes(prefix) ? 'mtn' : 'orange';
};

// ---- MTN Mobile Money ----
const getMtnAccessToken = async (): Promise<string> => {
  const credentials = btoa(`${MTN_USER_ID}:${MTN_COLLECTION_API_KEY}`);
  const resp = await fetch(`${MTN_API_URL}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': MTN_COLLECTION_API_KEY,
    },
  });
  if (!resp.ok) throw new Error(`MTN token error: ${resp.status}`);
  const data = await resp.json() as { access_token: string };
  return data.access_token;
};

const requestMtnPayment = async (req: PaymentRequest): Promise<string> => {
  const token = await getMtnAccessToken();
  const referenceId = crypto.randomUUID();
  const phone = `237${req.phone}`; // Add Cameroon country code

  const resp = await fetch(`${MTN_API_URL}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': MTN_ENV,
      'Ocp-Apim-Subscription-Key': MTN_COLLECTION_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: req.amount.toString(),
      currency: req.currency || 'XAF',
      externalId: Date.now().toString(),
      payer: { partyIdType: 'MSISDN', partyId: phone },
      payerMessage: req.description || 'Vantage Match Subscription',
      payeeNote: 'Abonnement Vantage Match',
    }),
  });

  if (!resp.ok && resp.status !== 202) {
    throw new Error(`MTN payment initiation failed: ${resp.status}`);
  }
  return referenceId;
};

const pollMtnStatus = async (referenceId: string, token: string): Promise<string> => {
  for (let attempt = 0; attempt < 12; attempt++) {
    await new Promise(r => setTimeout(r, 5000)); // Poll every 5 seconds
    const resp = await fetch(`${MTN_API_URL}/collection/v1_0/requesttopay/${referenceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Target-Environment': MTN_ENV,
        'Ocp-Apim-Subscription-Key': MTN_COLLECTION_API_KEY,
      },
    });
    if (!resp.ok) continue;
    const data = await resp.json() as { status: string; financialTransactionId?: string };
    if (data.status === 'SUCCESSFUL') return data.financialTransactionId || referenceId;
    if (data.status === 'FAILED') throw new Error('MTN payment was declined or cancelled');
  }
  throw new Error('Payment timed out — please try again');
};

// ---- Orange Money ----
const getOrangeAccessToken = async (): Promise<string> => {
  const credentials = btoa(`${ORANGE_CLIENT_ID}:${ORANGE_CLIENT_SECRET}`);
  const resp = await fetch(ORANGE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!resp.ok) throw new Error(`Orange token error: ${resp.status}`);
  const data = await resp.json() as { access_token: string };
  return data.access_token;
};

const requestOrangePayment = async (req: PaymentRequest): Promise<string> => {
  const token = await getOrangeAccessToken();
  const phone = `+237${req.phone}`;

  const resp = await fetch(`${ORANGE_API_URL}/webpayment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchant_key: ORANGE_MERCHANT_KEY,
      currency: 'XAF',
      order_id: `VMT-${Date.now()}`,
      amount: req.amount,
      return_url: `${window.location.origin}/payment/success`,
      cancel_url: `${window.location.origin}/payment/cancel`,
      notif_url: `${window.location.origin}/api/payment/webhook`,
      lang: req.language === 'fr' ? 'fr' : 'en',
      reference: phone,
    }),
  });

  if (!resp.ok) throw new Error(`Orange Money initiation failed: ${resp.status}`);
  const data = await resp.json() as { payment_url?: string; pay_token?: string };
  return data.pay_token || Date.now().toString();
};

// ---- Simulation fallback ----
const simulatePayment = async (req: PaymentRequest): Promise<PaymentResult> => {
  const provider = detectProvider(req.phone);
  console.log(`[Payment Simulation] ${provider.toUpperCase()} request for ${req.amount} XAF to +237${req.phone}`);
  await new Promise(r => setTimeout(r, 3000));
  const success = Math.random() > 0.1;
  if (!success) throw new Error(req.language === 'fr' ? 'Paiement refusé ou expiré' : 'Payment declined or timed out');
  return {
    success: true,
    transactionId: `${provider.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    provider,
  };
};

// ---- Main entry point ----
export const processMoMoPayment = async (
  phoneOrReq: string | PaymentRequest,
  amountArg?: number,
): Promise<PaymentResult> => {
  // Support both old signature (phone, amount) and new PaymentRequest object
  const req: PaymentRequest = typeof phoneOrReq === 'string'
    ? { phone: phoneOrReq.replace(/\D/g, ''), amount: amountArg || 0 }
    : { ...phoneOrReq, phone: phoneOrReq.phone.replace(/\D/g, '') };

  const provider = req.provider === 'auto' || !req.provider ? detectProvider(req.phone) : req.provider;

  // If no API credentials are set, fall back to simulation
  const isRealPayment = provider === 'mtn'
    ? !!MTN_COLLECTION_API_KEY && !!MTN_USER_ID
    : !!ORANGE_CLIENT_ID && !!ORANGE_CLIENT_SECRET;

  if (!isRealPayment) return simulatePayment(req);

  try {
    if (provider === 'mtn') {
      const token = await getMtnAccessToken();
      const refId = await requestMtnPayment(req);
      const txId = await pollMtnStatus(refId, token);
      return { success: true, transactionId: txId, provider: 'mtn' };
    } else {
      const payToken = await requestOrangePayment(req);
      return { success: true, transactionId: payToken, provider: 'orange' };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payment failed';
    return { success: false, error: message, provider };
  }
};