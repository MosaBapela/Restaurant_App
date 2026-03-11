# Stripe Server

A minimal, secure Node/Express server that creates Stripe `PaymentIntent`s.  
Matches the contract expected by `app/src/services/payment/paymentService.ts` when `EXPO_PUBLIC_PAYMENT_MODE=stripe`.

## Quick Start

```bash
cd serverless/stripe_server
npm install
cp .env.example .env
# Edit .env and set your STRIPE_SECRET_KEY
node index.js
```

## Endpoints

| Method | Path                      | Description                               |
| ------ | ------------------------- | ----------------------------------------- |
| `GET`  | `/health`                 | Health check                              |
| `POST` | `/create-payment-intent`  | Creates a Stripe PaymentIntent            |
| `POST` | `/confirm-payment-intent` | Retrieves/confirms a PaymentIntent status |

### POST `/create-payment-intent`

**Request body:**

```json
{
  "amount": 172.5,
  "currency": "ZAR",
  "orderId": "abc123"
}
```

**Response:**

```json
{
  "success": true,
  "paymentIntentId": "pi_xxxx",
  "clientSecret": "pi_xxxx_secret_yyyy"
}
```

**Headers required:**

```
x-api-key: <PAYMENT_SERVER_KEY from .env>
```

## App .env settings

Once this server is running (e.g. at `http://192.168.1.50:4243`), update your root `.env`:

```bash
EXPO_PUBLIC_PAYMENT_MODE=stripe
EXPO_PUBLIC_STRIPE_SERVER_URL=http://192.168.1.50:4243
```

## Security Notes

- **NEVER** put `STRIPE_SECRET_KEY` inside the Expo app or any client-side code.
- Only `STRIPE_PUBLISHABLE_KEY` (`pk_test_...`) can be in the client.
- In production: add HTTPS, restrict CORS to your domain, and add rate limiting.
- The `x-api-key` header prevents random requests from hitting your endpoint in dev.
