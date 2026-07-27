/**
 * paystack-server.ts
 *
 * Server-only functions that use the PAYSTACK_SECRET_KEY.
 * These run on the server (Node / Cloudflare Worker) via createServerFn,
 * so the secret key is NEVER sent to the browser unless supplied explicitly.
 */
import { createServerFn } from "@tanstack/react-start";

// ─── Paystack API shapes ──────────────────────────────────────────────────────

export interface PaystackTx {
  id: number;
  domain: string;
  status: string; // "success" | "failed" | "abandoned"
  reference: string;
  amount: number; // in minor units (pesewas for GHS)
  currency: string;
  channel: string; // "card", "mobile_money", "bank", etc.
  paid_at: string;
  createdAt: string;
  customer: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
  };
  metadata: Record<string, unknown> | null;
}

interface PaystackListResponse {
  status: boolean;
  message: string;
  data: PaystackTx[];
  meta?: { total: number; skipped: number; perPage: number; page: number; pageCount: number };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: PaystackTx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSecretKey(): string {
  return process.env["PAYSTACK_SECRET_KEY"] ?? "";
}

export function isValidSecretKey(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  const clean = key.trim();
  if (clean.includes("REPLACE") || clean.includes("YOUR_SECRET_KEY") || clean.length < 20) {
    return false;
  }
  return clean.startsWith("sk_live_") || clean.startsWith("sk_test_");
}

// ─── Server Functions ─────────────────────────────────────────────────────────

export const fetchPaystackTransactions = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: boolean; transactions?: PaystackTx[]; error?: string }> => {
    const secretKey = getSecretKey().trim();

    if (!isValidSecretKey(secretKey)) {
      return {
        ok: false,
        error: "PAYSTACK_SECRET_KEY is missing or invalid in .env. Please set your secret key (sk_live_...) in your .env file.",
      };
    }

    try {
      // Page 1: up to 100 transactions
      const res1 = await fetch("https://api.paystack.co/transaction?perPage=100&page=1", {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!res1.ok) {
        if (res1.status === 401) {
          return {
            ok: false,
            error: "Paystack API returned 401 Invalid Key. Your secret key (sk_live_...) is incorrect or expired. Please verify your Secret Key at https://dashboard.paystack.com/#/settings/developer",
          };
        }
        const errBody = await res1.text().catch(() => "");
        return { ok: false, error: `Paystack API HTTP ${res1.status}: ${errBody}` };
      }

      const json1: PaystackListResponse = await res1.json();
      if (!json1.status) {
        return { ok: false, error: `Paystack response: ${json1.message}` };
      }

      let allTx = json1.data ?? [];

      // Fetch page 2 if total > 100
      const total = json1.meta?.total ?? allTx.length;
      if (total > 100) {
        const res2 = await fetch("https://api.paystack.co/transaction?perPage=100&page=2", {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
        });
        if (res2.ok) {
          const json2: PaystackListResponse = await res2.json();
          if (json2.status && json2.data) {
            allTx = [...allTx, ...json2.data];
          }
        }
      }

      // Filter successful transactions
      const successful = allTx.filter((tx) => tx.status === "success");
      return { ok: true, transactions: successful };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

/**
 * Verify a single Paystack transaction reference.
 */
export const verifyPaystackRef = createServerFn({ method: "GET" })
  .validator((payload: { reference: string; secretKey?: string }) => payload)
  .handler(async ({ data: { reference, secretKey: secretKeyOverride } }): Promise<PaystackVerifyResponse> => {
    let secretKey = getSecretKey().trim();
    if (secretKeyOverride && isValidSecretKey(secretKeyOverride)) {
      secretKey = secretKeyOverride.trim();
    }

    if (!isValidSecretKey(secretKey)) {
      return { status: false, message: "PAYSTACK_SECRET_KEY not configured or invalid." };
    }

    try {
      const res = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      const json: PaystackVerifyResponse = await res.json();
      return json;
    } catch (err) {
      return { status: false, message: String(err) };
    }
  });
