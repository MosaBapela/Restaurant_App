# Fixing Issues Tracker

Short progress log of bugs fixed and behavior updates.

## Done ✅

1. **Register reset warning (`RESET` not handled)**
   - **Issue:** Register flow tried to reset to `Main` from an auth-local navigator.
   - **Fix:** Switched to `navigation.replace('Login')` after successful signup.
   - **Result:** No unhandled `RESET` warning during register flow.

2. **Payment `Network request failed` in checkout**
   - **Issue:** Payment stub used `localhost`, which fails on many emulator/device setups.
   - **Fix:** Added payment URL fallback resolution (`localhost`, `10.0.2.2`, host-derived URL).
   - **Result:** Stub payment is more reliable across web/emulator/device.

3. **Profile email update not syncing with Firebase Auth**
   - **Issue:** Edit profile updated Firestore only.
   - **Fix:** Added `updateAuthEmail(...)` and called it before `updateUserProfile(...)` when email changes.
   - **Result:** Auth email and profile email now stay in sync.

4. **Admin order status not reflected on user side**
   - **Issue:** User order history relied only on local Redux state.
   - **Fix:** `OrderHistoryScreen` now fetches latest user orders from Firestore on mount and pull-to-refresh.
   - **Result:** Admin status updates are visible to users after refresh/re-entry.

5. **Realtime order status sync (no manual refresh needed)**
   - **Issue:** User had to refresh/re-enter to see status changes.
   - **Fix:** Added Firestore `onSnapshot` subscription for user orders and wired it to Redux.
   - **Result:** Order status updates now appear live on the user side.

6. **Edit profile email field locked (read-only)**
   - **Issue:** Email could be edited from profile update screen.
   - **Fix:** Set email input to non-editable and preserve current auth email on save.
   - **Result:** Email can no longer be changed from Edit Profile.

7. **Startup/logout `RESET` warning for `Auth -> Closing`**
   - **Issue:** Navigation reset targeted routes not owned by the active navigator.
   - **Fix:** Changed logout flow to `navigate('Auth', { screen: 'Closing' })` and made `ClosingScreen` reset locally to `Welcome`.
   - **Result:** No unhandled `RESET` warning in logout/startup flow.

8. **Stripe secret key accidentally in root `.env`**
   - **Issue:** `STRIPE_SERVER_URL` was set to the Stripe secret key value — a critical security mistake.
   - **Fix:** Moved secret key to `serverless/stripe_server/.env` only. Root `.env` now only holds the publishable key.
   - **Result:** Secret key no longer exposed to the Expo client bundle.

9. **Added secure Stripe payment server**
   - **Issue:** No real Stripe server existed; app only had a mock stub.
   - **Fix:** Created `serverless/stripe_server/` — a minimal Express server that creates Stripe PaymentIntents.
   - **Result:** App can now process real Stripe payments when `EXPO_PUBLIC_PAYMENT_MODE=stripe`.

10. **Manage Cards / Manage Addresses UX improvements**
    - **Issues:**
      - CVV field was too narrow to display 3 digits comfortably.
      - Expiry date had no auto-formatting (user had to type `/` manually).
      - No way to edit an existing card or address.
      - No way to set a card or address as default.
    - **Fixes:**
      - Expiry field now auto-inserts `/` after 2 digits (MM/YY format).
      - CVV field uses `flex: 1` in a half-row layout — same width as Expiry.
      - Added **Edit** button under each card → opens pre-filled modal → calls `updatePaymentCard`.
      - Added **★ Set as Default** button under non-default cards → calls `setDefaultPaymentCard`.
      - Added **Edit** button on each address card (via `onEdit` prop) → calls `updateUserAddress`.
      - Added **★ Set as Default** button under non-default addresses → calls `setDefaultAddress`.
      - Added `updatePaymentCard`, `setDefaultPaymentCard`, `setDefaultAddress` to `profileService.ts`.
    - **Result:** Users can now edit and set defaults for both cards and addresses from the profile section.

11. **Delete food item navigates to Edit screen instead of deleting**
    - **Issue:** Tapping the trash icon on a food card also triggered the parent card's `onPress` (edit navigation) due to React Native's touch event bubbling. The item appeared not to be deleted, and the "successfully added" alert from `AddEditFoodScreen` showed instead.
    - **Fix:** Split the food card layout in `ManageFoodScreen` — the image + info area is now a separate inner `TouchableOpacity` (`foodCardInner`) for edit navigation, while the action buttons (edit/delete) live in a sibling `View` outside the tappable area. Added `foodCardInner` style.
    - **Result:** Tapping the trash icon now exclusively triggers delete. The item is immediately removed from both Firestore and the Redux list.

## Notes

- Some unrelated lint issues still exist in the project and can be cleaned up in a separate pass.
- For physical devices, update `EXPO_PUBLIC_STRIPE_SERVER_URL` to your LAN IP (e.g. `http://192.168.1.50:4243`).
- **Never commit** `serverless/stripe_server/.env` — it contains your Stripe secret key.
