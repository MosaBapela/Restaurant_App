# Restaurant App

A full-stack React Native (Expo) restaurant ordering app with Firebase, Redux, and Stripe payments.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 18 |
| npm | >= 9 |
| Expo CLI | bundled via `npx` |
| Git | any |

---

## 1. Clone & Install

```bash
git clone https://github.com/MosaBapela/Restaurant_App.git
cd Restaurant_App
npm install
```

---

## 2. Environment Setup

### App environment (root `.env`)

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Firebase — get these from Firebase Console > Project Settings
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Payment mode: 'stub' (fake, no card needed) or 'stripe' (real Stripe)
EXPO_PUBLIC_PAYMENT_MODE=stub

# Stub server (used when MODE=stub) — use your LAN IP for physical devices
EXPO_PUBLIC_PAYMENT_STUB_URL=http://192.168.x.x:4242/pay
EXPO_PUBLIC_PAYMENT_STUB_KEY=dev_stub_key

# Stripe server (used when MODE=stripe) — use your LAN IP for physical devices
EXPO_PUBLIC_STRIPE_SERVER_URL=http://192.168.x.x:4243
EXPO_PUBLIC_PAYMENT_SERVER_KEY=stripe_server_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> **Physical device tip:** Replace `192.168.x.x` with your machine's LAN IP.
> Run `ipconfig` on Windows or `ifconfig` on Mac/Linux to find it.
> Your phone must be on the same Wi-Fi network.

### Stripe server environment (only needed when `PAYMENT_MODE=stripe`)

```bash
cd serverless/stripe_server
copy .env.example .env    # Windows
# or: cp .env.example .env
```

Edit `serverless/stripe_server/.env`:

```env
STRIPE_SECRET_KEY=sk_test_...   # From dashboard.stripe.com/apikeys
PAYMENT_SERVER_KEY=stripe_server_key
PORT=4243
```

> ⚠️ **Never commit this file** — it contains your Stripe secret key.

---

## 3. Running the App

### Option A — Stub payments (simplest, no Stripe account needed)

Set `EXPO_PUBLIC_PAYMENT_MODE=stub` in your root `.env`, then open **two terminals**:

**Terminal 1 — Payment stub server:**
```bash
npm run start:stub
```
Verify: open `http://localhost:4242/health` — should return `{"status":"ok"}`

**Terminal 2 — Expo app:**
```bash
npx expo start
```

---

### Option B — Real Stripe payments

Set `EXPO_PUBLIC_PAYMENT_MODE=stripe` in your root `.env`, then open **two terminals**:

**Terminal 1 — Stripe server:**
```bash
cd serverless/stripe_server
npm install       # first time only
npm start
```
Verify: open `http://localhost:4243/health` — should return `{"ok":true,"mode":"stripe"}`

**Terminal 2 — Expo app:**
```bash
npx expo start
```

---

### Option C — Run everything in one command

```bash
npm run start:dev
```
Uses `concurrently` to start Expo + the payment stub together in one terminal.

---

## 4. Opening the App

Once Expo is running, press one of these keys in the Expo terminal:

| Key | Action |
|-----|--------|
| `w` | Open in web browser |
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator (Mac only) |
| Scan QR | Open in **Expo Go** app on your phone |

---

## 5. Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start Expo + payment stub as background processes |
| `npm run start:stub` | Start only the payment stub server (port 4242) |
| `npm run start:dev` | Start Expo + stub together via `concurrently` |
| `npm run android` | Start Expo targeting Android |
| `npm run ios` | Start Expo targeting iOS |
| `npm run web` | Start Expo targeting web |
| `npm run lint` | Run ESLint |
| `npm run build:android` | Cloud EAS build — produces an APK (preview profile) |

---

## 6. Project Structure

```
app/
  _layout.tsx              # Root layout (Expo Router)
  index.tsx                # Entry point
  src/
    components/            # Reusable UI components
    data/                  # Mock seed data
    navigation/            # Stack / tab navigators
    redux/                 # Redux store + slices
    screens/               # All app screens (auth, home, cart, admin...)
    services/
      firebase/            # Firestore + Auth services
      payment/             # Payment service (stub or Stripe)
    theme/                 # Colors, spacing, typography
    types/                 # TypeScript types
    utils/                 # Constants, helpers, validation
assets/                    # Images and icons
serverless/
  payment_stub/            # Fake payment server (dev only, port 4242)
  stripe_server/           # Real Stripe server (port 4243)
```

---

## 7. Building a Release APK

Requires an [Expo EAS](https://expo.dev/eas) account:

```bash
npm install -g eas-cli
eas login
npm run build:android
```

The EAS `preview` profile produces a downloadable `.apk` file. Follow any credential prompts for keystore setup.

Classic fallback (deprecated):

```bash
npm run build:android:classic
```

---

## 8. Troubleshooting

| Problem | Fix |
|---------|-----|
| `ERR_CONNECTION_REFUSED` on payment | Make sure the stub or Stripe server terminal is running |
| QR code won't connect on phone | Check your LAN IP in `.env` — phone must be on same Wi-Fi |
| `EADDRINUSE` port 4242/4243 | Kill old process: `taskkill /F /IM node.exe` (Windows) or `npx kill-port 4242` |
| Firebase permission denied | Check Firestore security rules in Firebase Console |
| Expo package version warnings | Run `npm install` and align versions to your Expo SDK |
| EAS build fails | Run `eas login`, check `eas.json`, follow credential prompts |
| Stripe returns 401 Unauthorized | Check `EXPO_PUBLIC_PAYMENT_SERVER_KEY` matches `PAYMENT_SERVER_KEY` in stripe server `.env` |
