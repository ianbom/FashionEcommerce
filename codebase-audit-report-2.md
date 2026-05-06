# Codebase Audit Report

## 1. Executive Summary

Project has solid base shape: Laravel services, Form Requests, Inertia React pages, separate customer/admin areas, stock reservation concept, Midtrans and Biteship service classes, and some auth/address/shipping tests.

Production readiness: not ready for real money orders yet.

Biggest risks:

- Payment finalization can mark risky Midtrans `capture` payments as paid without checking `fraud_status`.
- Midtrans webhook does not verify paid amount against local payment amount before fulfillment.
- Biteship webhook fails open when secret missing and accepts secret in query string.
- Checkout shipping rate can be calculated for one address and applied to another address.
- Voucher limits can be oversold under concurrency.
- Admin role model is too broad: every active admin can access sensitive modules and create/update admins.
- Webhook idempotency is missing, causing duplicate logs/tracking and risky repeated processing.
- Stock can remain reserved forever when pending payments never reach terminal webhook.
- Tests do not cover Midtrans webhook safety, order lifecycle, checkout concurrency, voucher limits, or admin authorization.

Correct business flow should be stricter:

1. Cart prices and stock must be revalidated server-side at order creation.
2. Shipping quote must be bound to selected address, courier service, cart weight, and quote timestamp.
3. Order/payment creation must be idempotent per checkout session/cart.
4. Payment webhooks must validate signature, amount, payment identity, status transition, fraud status, and duplicate event identity before mutating order.
5. Shipping webhooks must be authenticated, idempotent, and mapped through explicit shipment state machine.
6. Admin features must use capability-based authorization, not only `role = admin`.

## 2. Critical Issues

| Issue | Impact | File/Area | Recommended Fix |
|------|--------|-----------|-----------------|
| Midtrans `capture` marks payment paid without `fraud_status` check | Fraud-challenge transaction can fulfill order and reduce reserved stock | `app/Services/Customer/MidtransWebhookService.php:55-58` | For `capture`, mark paid only when `fraud_status === 'accept'`; send `challenge` to review/pending; fail `deny` |
| Midtrans webhook does not validate gross amount before paid transition | Valid Midtrans notification with mismatched amount could mark local payment paid | `app/Services/Customer/MidtransWebhookService.php:26-63`, `app/Services/Integrations/MidtransService.php:51-60` | Compare normalized `payload.gross_amount` to `payments.gross_amount`; validate `order_id`, currency, status code, and payment identity before any order mutation |
| Biteship webhook authentication fails open when secret missing | Production misconfiguration allows anyone to forge shipment/tracking/order status updates | `app/Http/Controllers/Customer/BiteshipWebhookController.php:56-62` | Fail closed in production; require `BITESHIP_WEBHOOK_SECRET`; allow bypass only in local/testing with explicit config |
| Biteship webhook accepts secret in query string | Webhook secret leaks through access logs, proxies, analytics, and replay URLs | `app/Http/Controllers/Customer/BiteshipWebhookController.php:64-67` | Remove query fallback; accept only signed header or bearer header; add timestamp/HMAC replay protection |

## 3. High Priority Issues

| Issue | Impact | File/Area | Recommended Fix |
|------|--------|-----------|-----------------|
| Checkout shipping rate can be reused with different address | Customer can quote cheap address A, order to address B, and underpay shipping | `app/Services/Customer/CheckoutService.php:49-63`, `105-110`, `401-409` | Store quote with address/cart hash; in `placeOrder`, require selected address equals quoted address; recalculate or validate rate server-side |
| Voucher usage limit race | Multiple concurrent paid orders can exceed voucher usage cap | `app/Services/Customer/CheckoutService.php:135-141`, `352-364`; `app/Services/Customer/MidtransWebhookService.php:105` | Lock voucher row; reserve voucher on order creation; release on expiry/cancel; add voucher reservation table if needed |
| Admin role separation too coarse | Any admin can manage admin users, settings, payments, orders, reports, and audit logs | `routes/web.php:84-198`, `app/Http/Requests/Admin/StoreAdminUserRequest.php:10-13`, `app/Services/Admin/AdminUserManagementService.php:36-43`, `resources/js/components/app-sidebar.tsx:49-215` | Add granular permissions and policies; restrict admin users/settings/payment logs/reports to superadmin/finance roles |
| Duplicate Midtrans webhook not idempotent | Retries create duplicate logs and can re-run failure/release paths | `app/Services/Customer/MidtransWebhookService.php:32-39`; `database/migrations/2026_04_30_000015_create_payment_logs_table.php:11-24` | Add event fingerprint/hash unique index; return success for duplicate events without reprocessing |
| Stale Midtrans webhook can overwrite current metadata | Late pending/challenge events can replace settled canonical transaction metadata | `app/Services/Customer/MidtransWebhookService.php:41-47` | Implement payment state machine; reject downgrades after terminal states; keep all raw events in logs only |
| Midtrans status mapping incomplete | `authorize`, `refund`, `partial_refund`, `chargeback`, unknown statuses are ignored or mishandled | `app/Services/Customer/MidtransWebhookService.php:55-62` | Explicitly map every Midtrans status; alert admin for refund/chargeback; ignore unknown statuses without mutating order |
| Duplicate Biteship webhook not idempotent | Duplicate webhook retries create duplicate logs and shipment tracking rows | `app/Http/Controllers/Customer/BiteshipWebhookController.php:27-33`, `app/Services/Admin/ShipmentManagementService.php:247-253`; `database/migrations/2026_04_30_000018_create_biteship_webhook_logs_table.php:11-25` | Store provider event ID or payload hash; add unique index; upsert tracking by event identity |
| Biteship webhook can update wrong shipment through loose OR matching | Colliding `order_id`, tracking ID, or waybill can update first matching shipment | `app/Http/Controllers/Customer/BiteshipWebhookController.php:37-45`; `database/migrations/2026_04_30_000016_create_shipments_table.php:33-35` | Match by `shipping_provider = biteship`; prefer strongest ID; detect conflicts; add unique nullable indexes when guaranteed |
| Unknown Biteship status becomes `confirmed` | Unknown/malformed webhook can move shipment/order forward | `app/Services/Admin/ShipmentManagementService.php:383-393` | Default unknown to no-op/current status; log warning; never advance order on unmapped provider status |
| Stock reservations can remain forever | Pending orders without terminal webhook permanently reduce sellable stock | `app/Services/Customer/CheckoutService.php:201`; `app/Services/Customer/MidtransWebhookService.php:109-140` | Add scheduled expiry job for stale pending payments/orders; release reserved stock once with idempotent guard |
| Frontend checkout can double-submit order | Fast double click/Enter can create multiple place-order requests | `resources/js/contexts/checkout-context.tsx:243-278` | Add client guard plus backend idempotency key per checkout session/cart; reject duplicate open payment/order |
| Payment redirect URL trusted by frontend | Tainted/stored URL can send customer to phishing/payment spoof page | `resources/js/pages/customer/checkout/checkout.tsx:70-75`, `resources/js/pages/customer/order/detail-order.tsx:417-423` | Backend should return sanitized payment URL only; whitelist Midtrans domains; use environment-specific base URL |
| Tracking URL trusted from raw provider payload | Poisoned provider/webhook data can expose malicious external link | `resources/js/pages/customer/order/detail-order.tsx:394-410`, `445-510` | Parse and sanitize tracking URL server-side; prefer trusted Biteship tracking page/proxy |
| Dangerous admin order transitions one-click | Admin can mark completed before payment/shipment or send conflicting transitions | `resources/js/pages/admin/orders/show.tsx:430-451`, `362-368` | Enforce backend state machine; disable invalid buttons; require confirmation for terminal statuses |
| Biteship order creation retry can duplicate external shipment | Retried non-idempotent `POST /v1/orders` can create duplicate Biteship orders | `app/Services/Integrations/BiteshipService.php:138-143`, `92-103`; `app/Services/Admin/ShipmentManagementService.php:109-126` | Split retry policy; no retry for create unless idempotency key supported; lock shipment/order and reconcile existing provider order |

## 4. Medium Priority Issues

| Issue | Impact | File/Area | Recommended Fix |
|------|--------|-----------|-----------------|
| Admin unauthorized middleware redirects back | Non-admin users can hit confusing redirects/loops instead of clear denial | `app/Http/Middleware/EnsureUserIsAdmin.php:15-17` | Use `abort(403)` or deterministic redirect to customer home/admin login |
| Admin login route lacks explicit throttle | Brute force protection unclear on custom admin login | `routes/web.php:79-82`, `app/Http/Controllers/Admin/Auth/LoginController.php:24-48` | Add `throttle:admin-login` keyed by email + IP |
| Webhook routes lack rate limits | Flooding can fill logs and trigger DB work | `routes/api.php:12-13` | Add provider-specific throttles and payload size limits; queue heavy work |
| External Midtrans Snap call inside DB transaction | Long upstream call holds DB locks and reduces checkout throughput | `app/Services/Customer/CheckoutService.php:107-237`, especially `225` | Commit local pending order/payment first; call Midtrans after short transaction; update payment after response |
| Cart price snapshot can be stale until cart update | Customer can checkout old lower price after product price changes | `app/Services/Customer/CartService.php:70-80`, `app/Services/Customer/CheckoutService.php:132`, `192-194` | Recalculate price from canonical product/variant during `placeOrder` or expire cart price snapshots |
| Buy-now uses GET query for product/variant/quantity | User can tamper query; flow bypasses cart validation shape | `resources/js/pages/customer/products/detail-product.tsx:210-216`, `579-588` | Create server-side checkout intent via POST; validate variant-product relationship, stock, active status, quantity |
| Product detail route without product falls back to first item | `/detail` without query can show arbitrary product; weak SEO/cache semantics | `routes/web.php:40`, `app/Services/Customer/ProductBrowsingService.php:80-92` | Use `/products/{slug}` and 404 when missing/invalid |
| Customer order exposes Snap token after order detail load | Token/redirect can remain visible after terminal status or be shared | `app/Services/Customer/OrderService.php:166-178` | Return payment token/url only for pending owner order; hide after paid/expired/cancelled |
| Admin activity log stores broad request values | Sensitive fields/PII/secrets may enter audit logs | `app/Http/Middleware/LogAdminActivity.php:25-33` | Use allowlist or broader redaction for tokens, keys, secrets, phone/address, uploaded files |
| `role` fillable on User model | Future mass-assignment path can allow self-promotion | `app/Models/User.php:17` | Remove `role` from `$fillable`; assign roles only through trusted service methods |
| Address stores client-supplied region fields | User can tamper `province`, `city`, `district`, postal, coordinates | `resources/js/pages/customer/manage-address/manage-address.tsx:111-127`; `app/Http/Requests/Customer/UpsertAddressRequest.php:27-31` | Backend should derive/verify region data from `biteship_area_id`; ignore mismatched client region text |
| Checkout UI clears shipping price before rate reload | Summary can temporarily show lower total after address change | `resources/js/contexts/checkout-context.tsx:164-189` | Add shipping pending state; suppress final total until selected rate belongs to selected address |
| Voucher apply/remove frontend has race/error gaps | Spam clicks and unhandled remove errors can desync checkout summary | `resources/js/contexts/checkout-context.tsx:222-241`; `resources/js/pages/customer/checkout/checkout.tsx:276-293` | Disable while processing; trim/normalize code; catch remove errors; refresh canonical summary |
| Checkout pay button missing complete eligibility checks | User can attempt pay during address/rate/voucher/cart invalid states | `resources/js/pages/customer/checkout/checkout.tsx:429-438` | Compute `canPay` from cart non-empty, address selected, rate selected, no loading, all items available, agreed |
| Shipment creation UI lacks visible safety gates | Admin can create shipment before paid/shippable or duplicate shipment | `resources/js/pages/admin/orders/show.tsx:354-359` | Disable unless paid and shippable; backend enforce one active shipment and complete address/weight |
| Product form stores blob preview as image URL | Blob URL meaningless after browser session and can pollute payload assumptions | `resources/js/pages/admin/products/form.tsx:331-337` | Keep preview separate from payload; submit only file or persisted URL |
| Product variant draft lacks local validation | Invalid SKU/price/stock/options added, errors delayed to full submit | `resources/js/pages/admin/products/form.tsx:331-351` | Validate variant draft before adding; enforce unique SKU/options and nonnegative stock/prices |
| Hardcoded frontend routes drift from Laravel routes | Route rename breaks navigation/forms silently | `resources/js/components/Navbar.tsx:32-86`, `resources/js/components/app-sidebar.tsx:55-210`, `resources/js/pages/admin/orders/show.tsx:349-356` | Use generated Wayfinder route helpers consistently |
| Midtrans service uses direct `env()` fallback | Config cache/env handling inconsistent | `app/Services/Integrations/MidtransService.php:105` | Use `config('services.midtrans.*')` only; fail when required keys missing |
| Biteship service uses direct `env()` fallback | Config cache/env handling inconsistent | `app/Services/Integrations/BiteshipService.php:132` | Use config only; validate required config at boot/health check |

## 5. Low Priority Improvements

| Issue | Benefit | File/Area | Recommendation |
|------|---------|-----------|----------------|
| Status columns lack DB constraints | Prevent invalid status persistence | `database/migrations/2026_04_30_000011_create_orders_table.php:26-28`, `2026_04_30_000014_create_payments_table.php:20-21` | Add PHP enums and DB check constraints where supported |
| Stock columns allow invalid values at DB level | Prevent negative or impossible stock/reserved stock | `database/migrations/2026_04_30_000006_create_product_variants_table.php:19-20` | Use unsigned/check constraints: `stock >= 0`, `reserved_stock >= 0`, `reserved_stock <= stock` |
| Checkout request validates IDs as integers only | Better user errors and earlier validation | `app/Http/Requests/Customer/PlaceOrderRequest.php:17-18`, `app/Http/Requests/Customer/ShippingRateRequest.php:17-18` | Add ownership-aware exists validation or custom rules |
| Public admin-looking route outside admin middleware | Reduce confusion and accidental exposure | `routes/web.php:48` | Move `/admin/order-detail` under admin middleware or remove |
| Policy agreement text not linked | Better consent UX and legal clarity | `resources/js/pages/customer/checkout/checkout.tsx:330-343` | Link terms, privacy, shipping/no-return policies |
| Empty address checkout state weak | Better first-purchase conversion | `resources/js/pages/customer/checkout/checkout.tsx:164-199` | Show “Add address” primary CTA when no addresses exist |
| Cart checkout link enabled with unavailable items | Prevent broken checkout path | `resources/js/pages/customer/cart/my-cart.tsx:383-388` | Disable checkout until unavailable items fixed |
| Size Guide link points to product list | Avoid misleading UI | `resources/js/pages/customer/products/detail-product.tsx:477-488` | Add real size guide page/modal or remove link |
| Message Support button has no action | Avoid fake UI controls | `resources/js/pages/customer/products/detail-product.tsx:637-644` | Link to support channel with product context or hide |
| Product rail arrows do nothing | Better UI polish | `resources/js/pages/customer/products/detail-product.tsx:681-689` | Wire scroll buttons or hide arrows |
| Wishlist/heart icons appear functional but do nothing | Better trust and clarity | `resources/js/components/Navbar.tsx:26-30`, product detail wishlist UI | Implement wishlist or mark disabled/hide |
| Address UI exposes raw Biteship Area ID | Cleaner customer UX | `resources/js/pages/customer/manage-address/manage-address.tsx:649-653` | Show area name, hide provider ID from customers |
| Order detail “Support” links notifications | Better customer support flow | `resources/js/pages/customer/order/detail-order.tsx:523-527` | Link to real support/contact with order number context |
| “Buy Again” links generic list | Avoid misleading feature label | `resources/js/pages/customer/order/detail-order.tsx:505-528` | Rename “Shop Again” or implement reorder with stock validation |

## 6. Missing Features or Business Rules

- Payment state machine covering pending, paid, authorized, review/challenge, failed, expired, cancelled, refunded, chargeback, partial refund.
- Shipment state machine covering provider-specific Biteship states and preventing unknown statuses from advancing orders.
- Order state machine enforcing allowed transitions based on payment and shipment state.
- Idempotency key for checkout order creation.
- Webhook idempotency for Midtrans and Biteship.
- Scheduled expiry job for stale pending payments and stock reservation release.
- Voucher reservation lifecycle: reserved, used, released, expired.
- Per-admin permissions and policies for catalog, fulfillment, finance, support, settings, reports, admin user management.
- Superadmin-only controls for creating/updating admins and editing payment/shipping settings.
- Server-side binding between shipping quote, customer address, courier/service, cart contents, weight, and quote expiry.
- Recalculation or expiration of cart price snapshots at checkout.
- Business rule for maximum order quantity per variant/customer/order.
- Business rule for inactive products/variants already in cart.
- Business rule for payment retry after expired/failed payment.
- Business rule for order cancellation before/after payment.
- Refund/return/no-return operational flow in admin and customer UI.
- Admin support workflow for payment challenge, chargeback, failed shipment, returned shipment.
- Customer support/contact feature linked from order detail.
- Customer search feature in main navigation.
- Real wishlist implementation or removal of wishlist UI.
- Product size guide page/modal.
- Shipping label vs tracking link separation.
- Notification action URL sanitation and internal route policy.
- Audit log retention/redaction policy.
- Webhook payload retention/redaction policy.

## 7. Architecture and Code Structure Review

Controllers:

- Customer and admin controllers are thin in many places, with business logic extracted into services. This is good.
- `BiteshipWebhookController` still performs auth, parsing, lookup, logging, and processing orchestration directly. Split into request validator/authenticator plus webhook service.
- `MidtransWebhookController` delegates to service, but lacks structured exception logging for rejected webhooks.

Services:

- `CheckoutService` centralizes checkout, but currently mixes cart validation, order creation, stock reservation, voucher logic, payment creation, and external Midtrans call in one long transaction. Split into smaller actions: validate checkout, reserve stock, create order snapshot, create payment intent.
- `MidtransWebhookService` needs explicit state machine and amount validation. Current simple `if in_array` mapping is not safe enough for money flow.
- `ShipmentManagementService` handles admin shipment creation and Biteship webhook status mapping. Mapping default to `confirmed` is unsafe. Introduce provider status mapper with no-op unknown default.
- `BiteshipService` applies retry broadly. Non-idempotent create-order calls need different HTTP policy than rate/area lookup.
- Admin management services exist for many modules, but authorization appears route/middleware based rather than policy/capability based.

Models:

- Models exist for core entities: `Order`, `OrderItem`, `Payment`, `Shipment`, `ShipmentTracking`, `Cart`, `CartItem`, `Voucher`, `Product`, `ProductVariant`, `CustomerAddress`, `PaymentLog`, `BiteshipWebhookLog`.
- `User` has fillable `role`, which weakens future mass-assignment safety.
- Domain statuses should be enums/casts with transition methods instead of raw strings spread across services/UI.

Requests:

- Form Requests exist for many admin/customer flows. This is good.
- Checkout/shipping requests validate primitive shape but need stronger ownership/business rules.
- Address request should not trust client-supplied region metadata without provider verification.
- Admin order/shipment requests must enforce state-sensitive validation, not only field shape.

Policies/Authorization:

- No granular permission model was evident in inspected routes/UI. `admin` middleware is too broad.
- Admin nav renders all modules for admin path. UI should consume server-provided abilities and backend policies must enforce same abilities.

Jobs/Events:

- Missing scheduled job for expiring pending orders/payments and releasing stock.
- Webhook work is synchronous. If provider payload volume grows, enqueue processing after lightweight authentication/idempotency insert.
- Payment/shipping state changes should emit domain events for notifications, inventory logs, admin alerts.

Frontend pages/components:

- Customer checkout flow is functional but trusts too much local state for display and lacks robust blocking states.
- Admin order screen exposes high-risk transitions without enough confirmation/disable rules.
- Several UI controls appear clickable but are not wired, hurting customer trust.
- Many routes are hardcoded despite Wayfinder route generation existing.

Maintainability:

- Main risk is not Laravel syntax; risk is missing domain invariants and state machines.
- Introduce central enums and transition services before adding more features.
- Keep external provider integration code small and provider-specific.

## 8. Database Review

Relationships and snapshots:

- Order snapshots exist through order items and order addresses, which is correct for ecommerce history.
- Cart items store snapshot prices, but checkout must revalidate or intentionally honor snapshot with expiry.
- Payments and shipments store provider payloads/logs, but need idempotency and retention rules.

Indexes and uniqueness:

- `shipments` indexes Biteship identifiers but does not enforce uniqueness: `database/migrations/2026_04_30_000016_create_shipments_table.php:33-35`.
- `payment_logs` has no unique event fingerprint: `database/migrations/2026_04_30_000015_create_payment_logs_table.php:11-24`.
- `biteship_webhook_logs` has no event ID/hash uniqueness: `database/migrations/2026_04_30_000018_create_biteship_webhook_logs_table.php:11-25`.
- Add unique constraints carefully for nullable provider IDs, or enforce conflict detection in service layer.

Constraints:

- Order/payment/shipment statuses are string fields without DB check constraints.
- Product variant stock/reserved stock needs DB-level nonnegative constraints.
- Voucher usage counters need safe locking/reservation design.

Soft deletes:

- Users have deleted_at migration. Need verify business behavior around soft-deleted customers with historical orders.
- Product/category deletions must not break order history because snapshots exist. Admin UI should prefer archive/inactive over destructive delete for products with orders.

Data consistency:

- Payment status and order status can diverge without formal transition map.
- Shipment status and order status can diverge or be advanced by unknown Biteship status.
- Stock reservation lifecycle depends on webhook success; missing expiry job creates drift.
- Address/provider area consistency depends on client-submitted fields; backend should provider-verify.

## 9. Integration Review

Midtrans:

- Good: signature verification uses `hash_equals` and documented SHA512 material shape in `app/Services/Integrations/MidtransService.php:51-60`.
- Bad: webhook service does not validate amount, currency, or strict payment identity before marking paid.
- Bad: `capture` ignores `fraud_status` and can fulfill challenge transactions.
- Bad: duplicate event idempotency is missing.
- Bad: late/stale event ordering is not guarded by state machine.
- Bad: refund/chargeback statuses are not modeled.
- Risk: Snap create occurs inside DB transaction, holding locks during external HTTP.
- Risk: direct `env()` fallback appears in service code and should be config-only.
- Correct approach: authenticate webhook, validate payload schema, validate signature, lock payment, check amount/order/currency, dedupe event, apply state transition, write log, emit domain event.

Biteship:

- Good: service has timeout/connect timeout for Biteship requests.
- Critical bad: webhook accepts unauthenticated requests if secret missing.
- Bad: query-string secret is accepted.
- Bad: no webhook event idempotency.
- Bad: shipment lookup ORs several identifiers and can update wrong shipment on collision.
- Bad: unknown status maps to `confirmed`.
- Bad: create-order retry can duplicate non-idempotent external orders.
- Correct approach: fail-closed authentication, HMAC/timestamp if supported, event dedupe, strict provider identifier lookup, no-op unknown statuses, explicit status map, and no retry for create unless idempotency key exists.

## 10. Testing Recommendations

Add Pest feature tests:

- Midtrans valid signature accepted.
- Midtrans invalid signature rejected.
- Midtrans gross amount mismatch rejected and order remains unpaid.
- Midtrans `settlement` marks payment/order paid once.
- Midtrans `capture` with `fraud_status=accept` marks paid.
- Midtrans `capture` with `fraud_status=challenge` does not mark paid and creates review/admin alert.
- Midtrans duplicate webhook is idempotent.
- Midtrans late `pending` cannot downgrade paid payment.
- Midtrans `expire/cancel/deny/failure` releases reserved stock once.
- Midtrans refund/chargeback creates admin alert and does not silently ignore.
- Biteship webhook valid secret accepted.
- Biteship webhook invalid secret rejected.
- Biteship missing secret in production fails closed.
- Biteship query-string secret rejected.
- Biteship duplicate webhook does not duplicate tracking rows.
- Biteship unknown status does not advance shipment/order.
- Biteship conflicting identifiers do not update arbitrary shipment.
- Checkout quote for address A cannot be used with address B.
- Checkout double-submit creates one order/payment only.
- Checkout revalidates current stock and price.
- Voucher usage limit cannot be exceeded under concurrent payments.
- Pending payment expiry releases reserved stock.
- Admin non-superadmin cannot manage admin users/settings/payment logs.
- Admin invalid order transitions return forbidden/validation error.
- Customer cannot access another customer order/address/cart item.
- Product inactive/variant inactive cannot be added to cart or checked out.
- Address Biteship area mismatch rejected.

Add browser/UI tests:

- Customer checkout: no address, stale shipping, unavailable item, voucher error, successful redirect.
- Product detail: out-of-stock variant disables buy/add controls.
- Admin order page: invalid transition buttons disabled and backend rejects forced request.
- Main customer pages have no JavaScript console errors.

Add architecture tests:

- No direct `env()` outside config files.
- Admin controllers/routes require policy/middleware.
- Money/status fields use enums or constants, not arbitrary literals.
- No hardcoded app URLs in React when route helpers exist.

## 11. Prioritized Fix Plan

Phase 1: Critical safety fixes

1. Fix Midtrans webhook paid logic: amount validation, `fraud_status` handling, strict payload validation, state machine guard.
2. Make Biteship webhook fail closed and remove query-string secret.
3. Add webhook idempotency for Midtrans and Biteship with unique event hash/index.
4. Fix checkout shipping quote/address binding.
5. Add checkout idempotency key to prevent duplicate order/payment creation.
6. Add scheduled stale-payment expiry and stock reservation release.
7. Stop mapping unknown Biteship statuses to `confirmed`.
8. Add high-risk webhook and checkout tests before deployment.

Phase 2: Business flow completeness

1. Implement order/payment/shipment state machines with allowed transitions.
2. Add voucher reservation lifecycle with locking and release.
3. Revalidate product/variant price, active status, and stock at `placeOrder`.
4. Add admin permission model and protect admin-user/settings/payment/report modules.
5. Add refund/chargeback/payment challenge admin workflows.
6. Add payment retry/expired/cancelled customer flows.
7. Add support/contact workflow from order detail.
8. Add address provider verification through Biteship area lookup.

Phase 3: Refactor and maintainability

1. Split `CheckoutService` into checkout validator, order creator, stock reserver, payment intent creator.
2. Extract Midtrans and Biteship webhook processors into dedicated services with state mappers.
3. Move external HTTP calls out of long DB transactions.
4. Replace hardcoded routes in React with generated Wayfinder helpers.
5. Replace raw status strings with enums/constants and transition methods.
6. Remove `role` from `User::$fillable` and assign roles through trusted admin service.
7. Add config-only provider settings and health checks for required keys.
8. Add audit/webhook log redaction and retention policy.

Phase 4: UI/UX and performance improvements

1. Disable checkout when cart has unavailable items; show direct cart-fix action.
2. Add checkout empty/error states for no address, stale rate, voucher failure, and shipping loading.
3. Sanitize and whitelist payment/tracking/action URLs before rendering.
4. Add confirmations and loading states to admin destructive/status actions.
5. Implement or remove fake wishlist/support/size-guide/carousel controls.
6. Add real customer search in navigation.
7. Improve mobile checkout CTA.
8. Add product detail slug route for SEO and stable caching.
9. Add client-side validation for address, voucher, notes, variant draft, and shipment forms while preserving backend validation as source of truth.
