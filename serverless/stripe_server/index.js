#!/usr/bin/env node
/**
 * Stripe Payment Server
 * Matches the contract expected by app/src/services/payment/paymentService.ts (MODE='stripe').
 *
 * Client calls:
 *   POST /create-payment-intent  { amount, currency, orderId, card }
 *
 * Server responds:
 *   { success: true, paymentIntentId, clientSecret }
 *   or
 *   { success: false, message }
 *
 * Setup:
 *   1. Copy .env.example -> .env and fill STRIPE_SECRET_KEY
 *   2. npm install
 *   3. node index.js
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

// ─── CORS ────────────────────────────────────────────────────────────────────
// In production restrict this to your app domain / Expo deployment URL.
app.use(cors({ origin: "*" }));

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4243;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const API_KEY = process.env.PAYMENT_SERVER_KEY || "stripe_server_key";

if (!STRIPE_SECRET_KEY) {
  console.error("[stripe-server] ERROR: STRIPE_SECRET_KEY is not set in .env");
  console.error(
    "[stripe-server] Copy .env.example -> .env and fill STRIPE_SECRET_KEY",
  );
  process.exit(1);
}

const Stripe = require("stripe");
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireApiKey(req, res, next) {
  const key = req.header("x-api-key");
  if (!key || key !== API_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get("/health", (_req, res) => res.json({ ok: true, mode: "stripe" }));

/**
 * POST /create-payment-intent
 *
 * Body: { amount: number, currency?: string, orderId?: string, card?: object }
 *
 * - amount is expected in the currency's major unit (e.g. 150.00 ZAR).
 * - Stripe requires amounts in the smallest unit (cents/pence), so we multiply by 100.
 * - orderId is stored in metadata for traceability.
 * - card is ignored on the server (should use Stripe.js / Elements on client for PCI compliance).
 *
 * Returns: { success, paymentIntentId, clientSecret }
 */
app.post("/create-payment-intent", requireApiKey, async (req, res) => {
  const { amount, currency = "ZAR", orderId } = req.body || {};

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or missing amount" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      // Convert to smallest currency unit (cents). Multiply by 100 then round.
      amount: Math.round(Number(amount) * 100),
      currency: currency.toLowerCase(),
      // automatic_payment_methods lets Stripe decide the best payment flow.
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: orderId ? String(orderId) : "",
        source: "restaurant_app",
      },
    });

    return res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("[stripe-server] paymentIntents.create failed:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create payment intent",
    });
  }
});

/**
 * POST /confirm-payment-intent  (optional — used if confirming from server)
 *
 * Body: { paymentIntentId: string }
 * Returns: { success, status, paymentIntentId }
 */
app.post("/confirm-payment-intent", requireApiKey, async (req, res) => {
  const { paymentIntentId } = req.body || {};

  if (!paymentIntentId) {
    return res
      .status(400)
      .json({ success: false, message: "paymentIntentId is required" });
  }

  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    return res.json({
      success: pi.status === "succeeded",
      status: pi.status,
      paymentIntentId: pi.id,
    });
  } catch (err) {
    console.error(
      "[stripe-server] paymentIntents.retrieve failed:",
      err.message,
    );
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[stripe-server] Listening on http://localhost:${PORT}`);
  console.log(
    `[stripe-server] Stripe mode active (key: ${STRIPE_SECRET_KEY.slice(0, 12)}...)`,
  );
});
