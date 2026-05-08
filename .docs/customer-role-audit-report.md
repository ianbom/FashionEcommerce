# Customer Role Audit Report

## 1. Executive Summary

Customer side has solid backend ownership checks for cart, address, order, notification, Midtrans webhook signature, payment amount match, stock locking, and Biteship rate revalidation. Core checkout math is mostly server-owned.

Not production-ready yet. Biggest risks: broken "Buy It Now", unverified users can reach checkout/payment, customer receives provider/raw shipment data, payment retry/status UX incomplete, weak throttling on customer mutation/API endpoints, and missing DB invariants for customer money/quantity/default-address rules.

## 2. Critical Issues

| Issue | Impact on Customer | File/Area | Recommended Fix |
|------|--------------------|-----------|-----------------|
| None confirmed in customer flow | No direct confirmed customer data takeover or price/payment manipulation found | Customer backend | Keep ownership/payment tests strict |

## 3. High Priority Issues

| Issue | Impact on Customer | File/Area | Recommended Fix |
|------|--------------------|-----------|-----------------|
| "Buy It Now" links to checkout with query params, but backend ignores them | Customer expects selected product to checkout, but checkout only reads cart | `resources/js/pages/customer/products/detail-product.tsx`, `CheckoutController`, `CheckoutService` | Either add selected variant to cart before redirect, or create server-side buy-now checkout session |
| Customer checkout allowed without email verification | Fraud/typo email can receive payment/order flow; customer may miss Midtrans/order updates | `routes/web.php`, `config/fortify.php`, `app/Models/User.php` | Enable `Features::emailVerification()`, implement `MustVerifyEmail`, add `verified` to checkout/order routes |
| Customer order detail exposes raw Biteship response | Customer can see provider internals/metadata not needed for UX | `app/Services/Customer/OrderService.php`, `resources/js/pages/customer/order/detail-order.tsx` | Return only sanitized tracking URL/status/events, never `raw_order_response` |
| Payment retry flow missing for failed/expired/snap_failed | Customer cannot recover cleanly after payment creation failure/expiry | `CheckoutService`, `OrderService`, customer order pages | Add backend retry endpoint that creates fresh Midtrans transaction only for owned pending/expired failed orders |
| Customer-facing Biteship area search has no throttle | Logged-in user can spam external Biteship API and burn quota/cost | `routes/web.php`, `BiteshipAreaController` | Add throttle middleware, short cache, debounce guard server-side |

## 4. Medium Priority Issues

| Issue | Impact on Customer | File/Area | Recommended Fix |
|------|--------------------|-----------|-----------------|
| Wishlist can store unpublished/inactive products | Hidden/unpublished products can be wishlisted by guessed ID | `WishlistController`, `WishlistService::addProduct` | Require `status='published'`; remove stale unpublished items from response |
| Shared Inertia `auth.user` sends whole user model | Unneeded fields like role/is_active/email_verified_at leak to every customer page | `HandleInertiaRequests.php` | Share explicit safe shape only: id, name, email, avatar_url |
| No customer sync/refresh payment action | UI may show stale payment pending after Midtrans status changed | `OrderService`, order pages | Add owned payment sync endpoint or polling for pending orders |
| Cart checkout entry does not block unavailable items until checkout page | Customer can click checkout then see later failure | `my-cart.tsx`, `CartService` | Disable checkout if any cart item unavailable; show repair/remove action |
| Address stores free-form Biteship area data without backend verification | Customer can submit mismatched postal/area fields | `UpsertAddressRequest`, `AddressService` | Validate selected `biteship_area_id` against Biteship/cached area payload |
| Customer order cancel depends on local Midtrans heuristics | Cancel may fail or diverge if Midtrans state changed | `OrderService::cancel` | Sync status first, then cancel only allowed owned unpaid transaction |
| Frontend uses `alert()` for cancel errors | Poor mobile/error UX | `detail-order.tsx` | Replace with inline error/toast state |
| No review/testimonial flow found | Customer cannot review delivered products | No customer review files/models found | Add review model tied to paid delivered order item |

## 5. Low Priority Improvements

| Issue | Benefit | File/Area | Recommendation |
|------|---------|-----------|----------------|
| Product detail fallback text invents product copy | More accurate catalog | `detail-product.tsx` | Show empty/"No description" state instead |
| Hardcoded support button has no action | Better support flow | `detail-product.tsx`, `detail-order.tsx` | Link to real WhatsApp/help route |
| Order list tracking progress is static | Less misleading tracking | `my-order.tsx` | Build progress from actual shipment status |
| Product list search fires only submit | Better UX | `list-product.tsx` | Add debounced search or explicit submit icon |
| Mixed Indonesian/English labels | More polished UX | Customer pages | Pick one locale per customer surface |

## 6. Customer Flow Review

- Browse product: works; only published products shown via `ProductBrowsingService`.
- Product detail: works; variants active-only; stock shown. "Buy It Now" is broken because query params are unused.
- Cart: backend validates published product, active variant, stock, price snapshot. UX should block checkout earlier when item invalid.
- Address: ownership safe; default logic is app-level only, with no DB single-default guarantee.
- Checkout: strong server-side stock/price/voucher/shipping validation. Empty cart handled. Needs verified email and better retry.
- Shipping: Biteship rate selection revalidated on place order. Area search is not throttled/cached.
- Payment: Midtrans amount/signature handled server-side. Frontend redirects; no robust failed/expired retry UX.
- Order list/detail: ownership checks present. Detail leaks raw shipment response.
- Tracking: basic tracking events shown; external tracking derived from raw response.
- Notification: ownership checks present; no bulk delete/preferences.

## 7. Customer Security Review

IDOR: cart, address, order, notification ownership checks are present (`ownedCartItem`, `ownedAddress`, `whereBelongsTo`, `abort_unless`). Wishlist delete ownership is present.

Manipulation: price, stock, shipping cost, payment amount are mostly server-owned. Checkout rechecks current price, stock locks variants, validates Biteship rate freshness, validates Midtrans signature and gross amount.

Weak points: unverified checkout, raw provider data exposure, unthrottled Biteship area search, wishlist unpublished product storage, no sanitized `auth.user`, no customer payment status sync/retry endpoint.

Unsafe upload: avatar upload validates image/mime/size in `ProfileValidationRules`; acceptable baseline.

Rate limiting: login/password exist, but customer cart/wishlist/address/checkout/shipping-rate endpoints lack explicit throttles.

## 8. Customer Database Review

Good: unique cart per user, unique cart item per variant, unique wishlist per user/product, unique payment/shipment per order, stock check constraints, status check constraints, idempotency key unique per user.

Missing DB rules:

| Missing Constraint | Why It Matters | Priority |
|---|---|---|
| Single default address per user | App logic can race and create two defaults | Medium |
| `quantity > 0` on cart/order items | Prevent invalid totals | Medium |
| `base_price >= 0`, `sale_price >= 0`, `sale_price <= base_price` | Prevent bad catalog pricing | Medium |
| `grand_total = subtotal + shipping + fee - discount` invariant | Detect money corruption | High |
| Order address required after order creation | Prevent checkout records without shipping snapshot | Medium |
| Indexes for product search name/sku | Faster catalog search | Low |

## 9. Customer Frontend Review

Good: many empty/loading states exist for product list, cart, checkout shipping loading, address empty, orders empty. Forms generally disable while processing.

Broken/incomplete: Buy It Now, payment retry/expired states, Biteship failure recovery, stale pending payment display, static tracking progress, alert-based errors, possible mobile overflow in dense order/detail tables, duplicated money formatting, loose `unknown` raw shipment typing.

## 10. Midtrans Customer Flow Review

Backend remains source of truth. Good: Snap created server-side, gross amount from order, webhook signature validated, amount matched, paid status finalizes stock, failed/expired releases stock/voucher.

Problems: customer UI only redirects to `midtrans_redirect_url`; no owned status refresh, no retry endpoint, no clear expired/failed recovery path, snap token exposed in order props though only redirect URL is needed.

## 11. Biteship Customer Flow Review

Good: customer cannot submit shipping price; backend stores session rates, binds rate to address/cart hash, TTL, then revalidates against Biteship before order creation.

Problems: area search unthrottled; address area/postal data not revalidated on save; customer order detail uses raw Biteship response to derive tracking URL; unavailable courier UX is minimal.

## 12. Missing Customer Features or Business Rules

| Missing Item | Why It Matters | Priority |
|-------------|----------------|----------|
| Verified email before checkout | Payment/order communication reliability | High |
| Buy-now server flow | Core ecommerce conversion | High |
| Payment retry for expired/failed order | Revenue recovery | High |
| Customer payment status refresh | Prevent stale pending UI | Medium |
| Review per delivered order item | Trust and product feedback | Medium |
| Single default address DB guarantee | Data consistency | Medium |
| Rate limits on checkout/address/shipping APIs | Cost and abuse control | Medium |
| Return/no-return policy version snapshot | Legal auditability | Low |

## 13. Testing Recommendations

| Test Case | Type | Priority |
|----------|------|----------|
| Customer cannot view/cancel another customer order | Feature | Critical |
| Customer cannot edit/delete another customer address | Feature | Critical |
| Customer cannot update/delete another customer cart item | Feature | Critical |
| Checkout rejects client price/shipping tampering | Feature | Critical |
| Checkout rejects inactive/out-of-stock variant | Feature | Critical |
| Midtrans webhook rejects bad signature/amount | Feature | Critical |
| Biteship selected rate is revalidated before order | Feature | High |
| Expired shipping rate forces reselect | Feature | High |
| Buy It Now creates expected checkout state | Feature | High |
| Payment expired/failed retry flow | Feature | High |
| Notification ownership for show/read-all/read-one | Feature | High |
| Product list only published products | Feature | Medium |
| Mobile checkout/order pages no overflow | Browser | Medium |

## 14. Prioritized Fix Plan

- Phase 1: Critical customer safety fixes: sanitize shared user/order props, remove raw Biteship response from customer props, add throttles, enforce email verification for checkout/payment/order.
- Phase 2: Checkout and payment reliability: fix Buy It Now, add payment retry endpoint, add customer payment sync/polling, improve expired/failed payment states.
- Phase 3: Customer UX completeness: better shipping errors, unavailable cart repair, tracking timeline from real statuses, proper support links, review flow.
- Phase 4: Performance and maintainability: DB invariants, search indexes, Biteship area cache, stricter TypeScript types, focused customer feature/browser tests.

No code changed beyond this audit document.
