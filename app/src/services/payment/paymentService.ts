/*
  paymentService.ts
  - Provides a simple abstraction for payments.
  - Supports two modes controlled by EXPO_PUBLIC_PAYMENT_MODE: 'stub' or 'stripe'
  - For 'stub' the client calls a local/serverless stub endpoint which simulates a successful payment.
  - For 'stripe' the client will call a configured server endpoint (EXPO_PUBLIC_STRIPE_SERVER_URL) which should
    create/confirm PaymentIntents securely (server must hold Stripe secret).

  Note: This client-side code intentionally keeps the logic simple. For production Stripe integration,
  implement card collection using Stripe Elements/SDK on server and client and never send raw card numbers
  from the client to your server unless you're PCI-compliant or using Stripe's secure tokenization.
*/

type PaymentMode = "stub" | "stripe";

const MODE = (process.env.EXPO_PUBLIC_PAYMENT_MODE as PaymentMode) || "stub";
const STUB_URL =
  process.env.EXPO_PUBLIC_PAYMENT_STUB_URL || "http://localhost:4242/pay";
const STUB_KEY = process.env.EXPO_PUBLIC_PAYMENT_STUB_KEY || "dev_stub_key";
const STRIPE_SERVER_URL =
  process.env.EXPO_PUBLIC_STRIPE_SERVER_URL || "http://localhost:4243";
const STRIPE_SERVER_KEY =
  process.env.EXPO_PUBLIC_PAYMENT_SERVER_KEY || "stripe_server_key";

function buildCandidateUrls(rawUrl: string): string[] {
  const base = String(rawUrl || "").trim();
  if (!base) return [];

  const set = new Set<string>();
  set.add(base);

  // On Android emulator localhost points to emulator itself, not host machine.
  if (/localhost|127\.0\.0\.1/i.test(base)) {
    set.add(base.replace(/localhost|127\.0\.0\.1/gi, "10.0.2.2"));
  }

  // Expo injects host URI in many runtimes; use it to reach host machine from physical devices.
  const hostUri =
    process.env.EXPO_PUBLIC_HOST_URL ||
    process.env.EXPO_PUBLIC_EXPO_HOST ||
    process.env.EXPO_PUBLIC_MANIFEST_HOST;
  if (hostUri) {
    try {
      const host = hostUri
        .replace(/^https?:\/\//, "")
        .split("/")[0]
        .split(":")[0];
      if (host) {
        const candidate = base.replace(
          /localhost|127\.0\.0\.1|10\.0\.2\.2/gi,
          host,
        );
        set.add(candidate);
      }
    } catch {
      // ignore malformed host hints
    }
  }

  return [...set];
}

export interface PaymentCardPayload {
  id?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
}

export interface PaymentResult {
  success: boolean;
  provider: "stub" | "stripe";
  transactionId?: string;
  raw?: any;
}

async function postJson(
  url: string,
  body: any,
  headers: Record<string, string> = {},
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(json?.message || `Request failed: ${res.status}`);
  return json;
}

export async function processPayment(
  amount: number,
  card: PaymentCardPayload | undefined,
  opts?: { currency?: string; orderId?: string },
): Promise<PaymentResult> {
  const currency = opts?.currency || "ZAR";
  const orderId = opts?.orderId;

  if (MODE === "stub") {
    // Call the serverless stub which returns a simulated transaction id.
    const payload = { amount, currency, card: card || null, orderId };
    const headers = { "x-api-key": STUB_KEY };
    const candidates = buildCandidateUrls(STUB_URL);
    let lastErr: unknown;
    let json: any = null;
    for (const url of candidates) {
      try {
        json = await postJson(url, payload, headers);
        break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!json) {
      throw new Error(
        `Payment stub unreachable. Tried: ${candidates.join(", ")}. ${(lastErr as Error)?.message ?? "Network request failed"}`,
      );
    }
    return {
      success: true,
      provider: "stub",
      transactionId: json?.transactionId || `stub_${Date.now()}`,
      raw: json,
    };
  }

  if (MODE === "stripe") {
    const url = `${STRIPE_SERVER_URL.replace(/\/$/, "")}/create-payment-intent`;
    const payload = { amount, currency, orderId, card: card || null };
    const headers = { "x-api-key": STRIPE_SERVER_KEY };
    const json = await postJson(url, payload, headers);
    // Server is expected to return an object with at least { success: boolean, paymentIntentId }
    return {
      success: !!json?.success,
      provider: "stripe",
      transactionId: json?.paymentIntentId || json?.id || undefined,
      raw: json,
    };
  }

  throw new Error("Unsupported payment mode");
}

export default {
  processPayment,
};
