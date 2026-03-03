# Premium Exam Success Kit – Selling Website

## Current State
New project. No existing code. Hero image generated at /assets/generated/exam-kit-hero.dim_800x600.jpg

## Requested Changes (Diff)

### Add

**Two product editions:**
- Base Eco Edition – ₹499 (B&W print, kraft cover, 3 stickers, eco wrap)
- Premium Color Edition – ₹599 (full color, bold cover, 8 stickers, ribbon, colored tabs, premium eco box)

**Early Bird pricing** (first 20 orders):
- Base ₹449, Premium ₹549

**Public landing page:**
- Hero section: headline, tagline, product image
- Edition comparison table (Base vs Premium feature-by-feature)
- What's inside (100-page breakdown: 10 sections)
- Eco brand message (recycled paper, no plastic, aqueous coating, paper packaging)
- Testimonials placeholder
- "Order Now" CTA with edition selector

**Order flow:**
- Edition selector (Base ₹499 / Premium ₹599) with early bird badge
- Order form: name, phone, address, pincode, payment (UPI / COD)
- Order confirmation page with order ID

**Admin dashboard (password-protected):**
- Stats: total orders, revenue, profit, break-even progress (33 units)
- Orders table with status management (Pending → Shipped → Delivered)
- Edition breakdown (how many Base vs Premium sold)

**Business Toolkit (admin tabs):**
- Cost structure for both editions
- 90-day execution plan (Month 1/2/3)
- Scaling roadmap (Stage 1–5)
- Instagram content calendar (30 days)
- Market research tracker
- Student ambassador program tracker
- Paid ads plan

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Product editions enum (Base/Premium), Order data model (id, name, phone, address, pincode, paymentMethod, edition, status, timestamp, earlyBird), placeOrder, getOrders (admin), updateOrderStatus, getStats (totalOrders, revenue by edition, total profit, breakEvenProgress)
2. Landing page: hero, edition comparison cards, inside-the-planner breakdown, eco pledge section, order CTA
3. Order modal: edition toggle, form fields, submit → confirmation
4. Admin: password gate, stats cards, orders table with status dropdown, toolkit tabs
