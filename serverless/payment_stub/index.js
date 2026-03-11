#!/usr/bin/env node
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.json());

// Allow CORS from any origin for local development (preflight & simple requests)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

const PORT = process.env.PORT || 4242;
const API_KEY = process.env.PAYMENT_STUB_KEY || "dev_stub_key";

// simple auth middleware
function requireApiKey(req, res, next) {
  const key = req.header("x-api-key");
  if (!key || key !== API_KEY) {
    return res.status(401).json({ success: false, message: "Invalid API key" });
  }
  next();
}

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Simulated pay endpoint (used by client stub mode)
app.post("/pay", requireApiKey, (req, res) => {
  const { amount, currency, card, orderId } = req.body || {};
  // Basic validation
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  // Simulate processing delay
  setTimeout(() => {
    const transactionId = `stub_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    return res.json({
      success: true,
      transactionId,
      amount,
      currency,
      orderId,
    });
  }, 500);
});

// Create payment intent (optional Stripe support)
app.post("/create-payment-intent", requireApiKey, async (req, res) => {
  const { amount, currency, orderId } = req.body || {};
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  // If STRIPE_SECRET is present try to create a real PaymentIntent
  const stripeSecret = process.env.STRIPE_SECRET;
  if (stripeSecret) {
    try {
      const Stripe = require("stripe");
      const stripe = new Stripe(stripeSecret, { apiVersion: "2022-11-15" });
      const pi = await stripe.paymentIntents.create({
        amount: Math.round(Number(amount) * 100), // assume amount in currency units
        currency: (currency || "zar").toLowerCase(),
        metadata: { orderId: orderId || "" },
      });
      return res.json({
        success: true,
        paymentIntentId: pi.id,
        clientSecret: pi.client_secret,
      });
    } catch (err) {
      console.error("Stripe create failed", err);
      return res
        .status(500)
        .json({ success: false, message: "Stripe error", error: String(err) });
    }
  }

  // Fallback: return a simulated payment intent
  const paymentIntentId = `pi_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  return res.json({
    success: true,
    paymentIntentId,
    clientSecret: `cs_${paymentIntentId}`,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`Payment stub listening on http://0.0.0.0:${PORT}`);
  console.log(`LAN access: http://192.168.89.212:${PORT}`);
  console.log(`Use x-api-key: ${API_KEY}`);
});
