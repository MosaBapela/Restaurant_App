# Restaurant_App — Expo (project-specific README)

This repository contains an Expo-managed React Native application (web + native) for a restaurant ordering demo. It includes the app UI, Redux state, Firebase services, and a lightweight local payment stub for development.

This README documents the project-specific developer workflow, scripts, environment variables, and build instructions.

## Quick start

1. Install dependencies

```powershell
npm install
```

2. Copy environment variables

```powershell
copy .env.example .env
# Edit .env and fill Firebase keys and any other values required for your environment.
```

3. Start the project (Expo + local payment stub)

```powershell
npm run start
```

Notes:
- The repo `start` script runs `node ./scripts/start-with-stub.js` which spawns Expo and the payment stub as detached background processes and writes their PIDs to `.tmp/pids.json`.
- If you prefer to run Expo interactively (to see logs inline) run:

```powershell
set "EXPO_ROUTER_APP_ROOT=app/src/screens" && expo start
```

Or to start the stub only:

```powershell
npm run start:stub
```

## Available scripts

- `npm run start` — start Expo and the payment stub as background processes (detached).
- `npm run start:stub` — start only the payment stub (Express server at serverless/payment_stub).
- `npm run start:dev` — historical convenience script that uses `concurrently` to run both in the foreground.
- `npm run android` / `npm run ios` / `npm run web` — start Expo for the specified platform.
- `npm run lint` — run linter.
- `npm run build:android` — cloud EAS build (recommended) using the `preview` profile (produces an APK).
- `npm run build:android:classic` — legacy `expo build:android -t apk` fallback.

## Environment variables

Copy `.env.example` to `.env` and set these values as needed (do not commit secrets):

- Firebase keys: EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, EXPO_PUBLIC_FIREBASE_PROJECT_ID, etc.
- Payment stub settings (development): EXPO_PUBLIC_PAYMENT_MODE (stub|stripe), EXPO_PUBLIC_PAYMENT_STUB_URL, EXPO_PUBLIC_PAYMENT_STUB_KEY

See `.env.example` for the full list.

## Local payment stub

Path: `serverless/payment_stub/index.js`

Purpose: a small local Express server that simulates payments for development. Endpoints:

- `GET /health` — health check
- `POST /pay` — simulate a payment (used when EXPO_PUBLIC_PAYMENT_MODE=stub)
- `POST /create-payment-intent` — helper endpoint for Stripe server workflows

Default: listens on port 4242 and expects header `x-api-key: dev_stub_key` unless configured otherwise via env vars.

Security: The stub is strictly for local development. Do not use it in production.

## Firebase integration

The app uses Firebase Auth and Firestore. Add your Firebase config to `.env` and confirm `app/src/services/firebase/config.ts` is reading those variables.

The app includes an initializer that seeds Firestore with bundled mock data if the `foods` collection is empty.

## Image persistence

To work on web and native without relying on Firebase Storage, the app attempts to convert uploaded images to stable data URLs before writing them to Firestore and provides a migration helper to convert existing ephemeral URIs.

## Building Android APK

Recommended: EAS Build (cloud). Prereqs:

- Install EAS CLI: `npm install -g eas-cli`
- Login: `eas login`
- (Optional) Configure project with `eas build:configure` if you haven't already

Build (preview profile produces an APK):

```bash
npm run build:android
```

## Download APK

(Donload .apk link) https://expo.dev/accounts/mossman2/projects/Restaurant_App/builds/7d0dd272-b33c-4cef-8358-61e09adb56e4


Classic (deprecated) fallback:

```bash
npm run build:android:classic
```

Local native build (advanced):

```bash
npx expo prebuild
cd android
# Windows
.\gradlew assembleRelease
# result: android\app\build\outputs\apk\release\app-release.apk
```

EAS will guide you through managing credentials (keystore) if needed.

## Managing background processes

The `start` helper writes PIDs to `.tmp/pids.json`. To stop processes manually, use PowerShell:

```powershell
Stop-Process -Id <PID> -Force
```

If you want, I can add `npm run stop` to automate killing the background processes and/or add log redirection so you can tail logs for Expo and the stub.

## Troubleshooting

- If you see `ERR_CONNECTION_REFUSED` for payment requests, ensure the stub is running (`npm run start` or `npm run start:stub`).
- If EAS build fails, ensure you're logged in (`eas login`) and that `eas.json` is configured. Check the EAS build logs for credential prompts.
- If Expo warnings appear about package versions, run `npm install` and consider aligning package versions to your Expo SDK.

## Project layout / notes

- App entry: `app/src/index.tsx` and routes under `app/src/screens`
- Redux slices: `app/src/redux/slices`
- Firebase services: `app/src/services/firebase`
- Admin screens include migration tools to fix image URIs

If you'd like, I can add `npm run stop`, log files for detached processes, or help configure a production EAS profile that builds an AAB for Play Store uploads.


- Building a release APK with EAS may require Android keystore configuration and setting up credentials. Follow the EAS docs if prompted.
- For production-ready Play Store releases, you'll typically produce an AAB (`buildType: app-bundle`) and follow Play Store publication steps.
