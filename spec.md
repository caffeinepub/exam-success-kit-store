# Exam Success Kit Store

## Current State
- Three product editions: Base (₹499), Premium (₹599), Elite Custom (₹799)
- Landing page with edition cards, early bird pricing, order modal
- OrderModal: UPI-only, no COD, glass UI
- AdminPage: single-passcode gate ("RDS"), full dashboard with stats, orders table, business toolkit
- TrackOrderPage: phone number search, open to everyone
- No sign-in system; anyone can place an order

## Requested Changes (Diff)

### Add
- Frontend-only auth context (`AuthContext`) storing: `isLoggedIn`, `userEmail`, `userPhone`, `signIn()`, `signOut()`
- Sign-in modal (`SignInModal`) accessible from navbar "Sign In" button:
  - Two tabs: "Email" and "Phone Number"
  - Email tab: email + password fields. Hardcoded admin account: `rudraansh.dev.singh@gmail.com` / `RDS@2012`. For all other emails, accept any non-empty password (guest sign-in)
  - Phone tab: 10-digit phone number input. Accept any valid phone as guest sign-in
  - "Forgot Password?" link on email tab: shows a recovery code input field. If user types `Inanis`, it signs in as the admin account
  - On sign-in, persist session in `sessionStorage` so refresh keeps user logged in
- Navbar: show "Sign In" button when not logged in; show user avatar/indicator + "Sign Out" when logged in
- Admin nav link: hidden from navbar unless the currently logged-in user's email is `rudraansh.dev.singh@gmail.com`
- Order placement gate: clicking "Order Now" or any edition CTA when not signed in opens the SignInModal first; after sign-in, opens OrderModal. When signed in, opens OrderModal directly
- Admin page: existing RDS passcode gate remains as second factor after the admin email is confirmed via auth context. If user is not logged in as admin email, show "Access Denied" with a sign-in prompt
- Clear History in admin: add a "Clear All Orders" button in admin dashboard. Requires typing `Inanis` in a confirmation dialog before wiping

### Modify
- Navbar: replace always-visible "Admin" link with conditional rendering (only shown to admin email)
- OrderModal: no functional change, but it receives signed-in user's email/phone as pre-fill hints (optional UX improvement)
- AdminPage: add clear-history button + confirmation dialog with `Inanis` passcode

### Remove
- Nothing removed from existing functionality

## Implementation Plan
1. Create `src/frontend/src/context/AuthContext.tsx` with AuthProvider, useAuth hook, sessionStorage persistence
2. Create `src/frontend/src/components/SignInModal.tsx` with email+phone tabs, forgot password, hardcoded admin check
3. Update `App.tsx`: wrap in AuthProvider, conditionally render Admin nav link, show Sign In / Sign Out in navbar, gate Order Now button
4. Update `AdminPage.tsx`: check auth context for admin email before showing passcode gate; add Clear History button with Inanis confirmation dialog
5. No backend changes needed (backend is already open-access)
