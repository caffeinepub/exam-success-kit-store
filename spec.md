# Exam Success Kit Store

## Current State
- Three-edition exam planner store (Base ₹499, Premium ₹599, Elite ₹799)
- Backend has strict admin-only access guards on getAllOrders, getStats, updateOrderStatus, clearOrders, getAllCancelRequests, updateCancelRequest
- Admin is handled frontend-only with passcode "RDS@2012" — no Internet Identity
- Because the actor is always anonymous, backend admin calls fail with "Unauthorized" → orders never appear in admin, stats are empty, order status cannot be updated, clear history fails
- getOrdersByPhone and getOrdersByEmail require user profiles to exist, blocking customer order tracking
- Order IDs are plain numbers (1, 2, 3…) and not displayed prominently after placing an order
- Landing page early bird badge shows static text, not remaining count
- Admin has no Order ID search capability

## Requested Changes (Diff)

### Add
- `getOrderById(orderId: Text) -> async ?Order` backend function (no auth) so admin can search by Order ID
- `getEarlyBirdCount() -> async Nat` backend function (no auth) to show remaining early birds on landing page
- Early birds remaining counter on landing page hero ("X of 20 early bird spots left")
- Order ID search box in admin Orders tab
- Order ID format changed to "ORD-N" (e.g. ORD-1, ORD-2) for readability

### Modify
- **Backend auth guards removed**: getAllOrders, getStats, updateOrderStatus, clearOrders, getAllCancelRequests, updateCancelRequest — all become public with no caller-based auth check
- **Backend getOrdersByPhone and getOrdersByEmail**: remove user profile requirement, just filter by phone/email directly (no auth check)
- **Backend placeOrder**: orderId now formatted as "ORD-" + nextOrderId
- useQueries.ts: wrap getAllOrders and getStats in try/catch to handle errors gracefully
- useQueries.ts: add useGetOrderById hook
- useQueries.ts: add useGetEarlyBirdCount hook
- OrderModal.tsx: show order ID prominently in the confirmation screen (already present but needs to be large/bold with copy button)
- AdminPage.tsx: add search input in Orders tab to filter by Order ID
- LandingPage.tsx: show "X early bird spots left" using getEarlyBirdCount

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate backend (main.mo) with all auth guards removed from admin functions; add getOrderById and getEarlyBirdCount; format order IDs as "ORD-N"
2. Update useQueries.ts to add useGetOrderById and useGetEarlyBirdCount hooks, wrap getStats/getAllOrders in try/catch
3. Update AdminPage.tsx to add Order ID search filter in Orders tab
4. Update LandingPage.tsx to show early bird spots remaining using getEarlyBirdCount
5. Update OrderModal.tsx to show Order ID prominently with copy-to-clipboard button
