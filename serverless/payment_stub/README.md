Payment stub
=================

This simple Express server simulates payments for local/demo testing.

Endpoints
- GET /health - quick healthcheck
- POST /pay - simulate a payment; requires header `x-api-key`
- POST /create-payment-intent - returns a simulated PaymentIntent; if environment variable `STRIPE_SECRET` is set and the `stripe` package is installed, it will create a real PaymentIntent.

Run locally

1. Install dependencies:

```bash
npm install express body-parser
# optionally: npm install stripe
```

2. Start server (set API key):

```bash
export PAYMENT_STUB_KEY=dev_stub_key
node index.js
```

On Windows (PowerShell):

```powershell
$env:PAYMENT_STUB_KEY = 'dev_stub_key'; node index.js
```

Client: Use header `x-api-key` with the same value.

Security notes
- This stub is for local/demo use only. Don't expose it to the public.
- For production, implement a secure server that integrates with Stripe and keeps the secret key on the server only.
