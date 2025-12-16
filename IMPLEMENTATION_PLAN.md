# Implementation Plan — Remaining Work

This document lists the remaining implementation tasks for the Restaurant_App project, grouped by priority, with file pointers, estimated effort, success criteria, and recommended next actions.

Estimated project completion: **~75%** (UI and Redux cores present; backend, payments, persistence, tests, and final QA remain).

---

## High Priority (must implement)

1) Firebase environment & end-to-end wiring (3–6 hrs)
   - Files: `app/src/services/firebase/config.ts`, `app/src/services/firebase/*.ts` (authService, profileService, foodService, orderService, storageService)
   - Tasks:
     - Add `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, etc. (see `.env.example` below)
     - Initialize Firebase in `config.ts` and confirm services read/write to Firestore/Storage.
   - Success: Register/login persist to Firebase Auth; Firestore reads/writes succeed; storage upload returns valid URLs.

2) Replace mocks with real persistence (4–8 hrs)
   - Files: `RegisterScreen.tsx`, `LoginScreen.tsx`, `EditProfileScreen.tsx`, `CheckoutScreen.tsx`, `AddEditFoodScreen.tsx`, `ManageAddressesScreen.tsx`, `ManageCardsScreen.tsx`
   - Tasks:
     - Replace local/mock dispatches with async thunks that call firebase services.
     - Properly handle loading and server errors, update Redux state on success.
   - Success: Actions persist to Firestore and UI reflects saved data after refresh.

3) Payment integration or secure serverless stub (8–24 hrs)
   - Files: `app/src/services/payment/paymentService.ts`, `CheckoutScreen.tsx`, `orderService.ts`
   - Options:
     - Integrate Stripe PaymentIntents (recommended for production) — requires a small secure server or serverless function to create PaymentIntent.
     - Or implement a secure serverless stub to simulate successful payments (quick path for demo).
   - Success: Checkout records payment result, orders marked paid in Firestore.

4) Admin image upload & food CRUD verification (2–6 hrs)
   - Files: `AddEditFoodScreen.tsx`, `storageService.ts`, `foodService.ts`, `ManageFoodScreen.tsx`
   - Tasks:
     - Ensure selected images are uploaded to Firebase Storage.
     - Store and use returned download URL in Firestore food documents.
   - Success: Admin can upload/change images and the app shows the stored images robustly.

---

## Medium Priority (UX & parity)

5) Order status updates & admin actions (2–4 hrs)
   - Files: `OrderManagementScreen.tsx`, `orderService.ts`, `OrderHistoryScreen.tsx`
   - Tasks: allow admin to change order status and persist to Firestore; optionally notify users.

6) Persist favorites, addresses, cards (2–4 hrs)
   - Files: `favoritesSlice.ts`, `profileService.ts`, `ManageAddressesScreen.tsx`, `ManageCardsScreen.tsx`
   - Tasks: CRUD operations in Firestore and keep Redux store in sync.

7) Form validation & consistent loading/error states (3–6 hrs)
   - Files: `validation.ts`, auth and profile screens, checkout
   - Tasks: centralize validation rules and show inline errors & spinners.

8) Web scroll parity and small UI fixes (1–2 hrs)
   - Files: multiple screens (`ScrollView` fixes already applied to many screens)
   - Tasks: manual QA on web to find remaining non-scrollable pages; adjust padding/flexGrow where necessary.

---

## Low Priority (polish, docs, tests)

9) README, .env.example & seed data (1–2 hrs)
   - Add `README.md` usage + env template and optional seed script to populate Firestore with sample data.

10) Tests & CI (1–3 days)
    - Add unit tests for slices and services; set up a simple CI workflow.

11) Accessibility & responsive polish (2–6 hrs)

---

## Expo-router warnings

You may see route-scan warnings during dev: "Route '...' is missing the required default export." These are caused by the router scanning files it expects to be route components. Mitigation:
- Set `EXPO_ROUTER_APP_ROOT` to `app/src/screens` in your `package.json` start scripts (Windows syntax used earlier). Restart the dev server.
- Move non-route files outside the routes folder, or add `export default` where a file is intended to be a route component.

## Rough timeline (single developer, AI-assisted)
- Minimal demo-ready: 6–12 hours (wire Firebase, persist core flows, stub payments)
- Production-ready (payments + tests + polish): 2–5 days (16–40 hours)

---

## Quick .env.example (add to repo root)
Create a file named `.env.example` with the following variables and fill with your Firebase project values:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Optional: Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SERVER_URL=
```

---

## Recommended next actions (pick one)
1. I will create `.env.example` and a short README + seed script — quick and safe. (Recommended first step)
2. I will wire Firebase config + one sample flow (e.g., Register -> Firestore create user). (Good second step)
3. I will scaffold a Stripe serverless PaymentIntent example and client integration. (If you want real payments)

If you want, tell me which to start with (1/2/3) and I will implement it now and run quick checks.

---

Created by the assistant on December 15, 2025 — branch: `fix_scrollability`
