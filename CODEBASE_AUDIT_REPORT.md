# Fashion E-Commerce Codebase Audit Report

## 1. Executive Summary

Overall readiness level: **not production ready**.

Codebase has good progress: Laravel services exist, admin/customer separation exists, Midtrans Snap created, Midtrans signature checked, Biteship rates and shipment creation exist, stock reservation exists, snapshots exist, admin dashboard broad modules exist.

Biggest risks:

- Payment webhook can mark fraudulent `capture` as paid.
- Midtrans webhook does not validate `gross_amount` against local payment.
- Stock can oversell or remain reserved forever in admin failure path.
- Checkout calls Midtrans inside DB transaction.
- Biteship shipment creation calls external API inside DB transaction.
- Biteship webhook can be unauthenticated if secret missing.
- Status values are raw strings and inconsistent.
- Admin payment sync does not actually sync with Midtrans API.
- Shipment creation duplicate race possible.
- Checkout uses stale session shipping rate without binding to address/cart.

Most urgent fixes:

- Harden Midtrans webhook: signature, amount, status mapping, fraud handling, idempotency, no state regression.
- Fix stock reservation/release invariants.
- Add DB constraints and unique keys for `payments.order_id`, `shipments.order_id`, statuses, money, stock.
- Move external API calls outside DB transactions.
- Fail closed on Biteship webhook auth.
- Add status enums/state machine.
- Add critical tests for checkout, webhook, stock, voucher race, shipment.

Production safety: **not safe enough for production**. Real-world impact: fake or challenged payment can ship goods, inventory can corrupt, admin cannot reliably reconcile payment/shipment, shipment webhook can be forged if config missing.

---

## 2. Critical Issues

| No | Issue | Risk | Impact | File/Area | Recommended Fix |
|----|-------|------|--------|-----------|-----------------|
| 1 | Midtrans `capture` always marked paid; `fraud_status` ignored | Critical | Fraud-challenged card payment can reduce stock and become shippable | `app/Services/Customer/MidtransWebhookService.php:55-58`, `app/Services/Admin/PaymentManagementService.php:94-96` | Mark paid on `settlement`; mark `capture` paid only when `fraud_status === accept`; keep `challenge` pending/manual review |
| 2 | Midtrans webhook does not compare payload `gross_amount` to local `payments.gross_amount` | Critical | Wrong amount transaction can mark order paid | `app/Services/Customer/MidtransWebhookService.php:20-47`, `app/Services/Integrations/MidtransService.php:51-60` | After signature check, normalize and compare `gross_amount`; reject/log mismatch |
| 3 | Stock paid handler clamps stock with `max(0, stock - qty)` | Critical | Oversell hidden; stock audit says normal | `app/Services/Customer/MidtransWebhookService.php:82-87`, `app/Services/Admin/PaymentManagementService.php:140-145` | Under row lock, require `stock >= qty` and `reserved_stock >= qty`; fail/alert if invariant broken |
| 4 | Admin failed payment sync does not release `reserved_stock` | Critical | Inventory locked forever after admin failure/expiry sync | `app/Services/Admin/PaymentManagementService.php:167-184` | Mirror webhook failure release logic under transaction and locks |
| 5 | Checkout calls Midtrans Snap inside DB transaction | Critical | Long locks, deadlocks, checkout contention, inconsistent rollback under API timeout | `app/Services/Customer/CheckoutService.php:107-237`, especially `225` | Create order/reservation/payment in short transaction, commit, call Midtrans, update payment separately |
| 6 | Biteship order API called inside DB transaction | Critical | External shipment can exist while local DB rolls back; duplicate/orphan shipment risk | `app/Services/Admin/ShipmentManagementService.php:115-163`, especially `125` | Mark shipment `creating`, commit, call Biteship outside transaction, persist response in new transaction |
| 7 | Biteship webhook auth bypass if secret missing | Critical | Anyone can forge shipment status and mark delivered/cancelled | `app/Http/Controllers/Customer/BiteshipWebhookController.php:56-62`, `routes/api.php:13` | Fail closed in non-local env; require header/HMAC secret; remove query secret |
| 8 | Shipment creation duplicate race, no unique `shipments.order_id` | Critical | Two admin clicks can create duplicate Biteship shipments | `app/Services/Admin/ShipmentManagementService.php:101-163`, `database/migrations/2026_04_30_000016_create_shipments_table.php:13` | Unique `order_id`; lock order row; use provider reference/idempotency |
| 9 | Voucher usage check not atomic | Critical | Usage limit can be exceeded under concurrent payments | `app/Services/Customer/CheckoutService.php:352-367`, `app/Services/Customer/MidtransWebhookService.php:105`, `database/migrations/2026_04_30_000010_create_vouchers_table.php:20-21` | Lock voucher row or guarded atomic increment; add voucher redemption table |
| 10 | Status fields raw strings, inconsistent values | Critical | Wrong dashboard counts, invalid transitions, bad operational decisions | `app/Services/Admin/OrderManagementService.php:14-18`, `app/Services/Admin/ShipmentManagementService.php:21,59-62`, `database/migrations/2026_04_30_000011_create_orders_table.php:26-28` | Add PHP enums/constants and DB checks; one shared status map |
| 11 | `payments.order_id` not unique but model uses `HasOne` | Critical | Multiple payments per order possible; webhook/admin sync can affect unexpected payment | `database/migrations/2026_04_30_000014_create_payments_table.php:13`, `app/Models/Order.php:53-65` | Add unique `payments.order_id` or convert to `hasMany/latestPayment` |
| 12 | `shipments.order_id` not unique but model uses `HasOne` | Critical | Multiple shipment rows per order possible | `database/migrations/2026_04_30_000016_create_shipments_table.php:13`, `app/Models/Order.php:53-65` | Add unique `shipments.order_id` or model many shipments intentionally |

---

## 3. High Priority Issues

| No | Issue | Risk | Impact | File/Area | Recommended Fix |
|----|-------|------|--------|-----------|-----------------|
| 1 | Admin payment sync does not call Midtrans status API | High | Admin thinks payment reconciled, but status remains stale | `app/Services/Admin/PaymentManagementService.php:79-101` | Add `/v2/{order_id}/status` call, validate, reuse webhook state machine |
| 2 | Checkout selected shipping rate not bound to selected address | High | Rate for address A can be used for order address B | `app/Services/Customer/CheckoutService.php:61-63,108-110,401-409`, `app/Http/Requests/Customer/PlaceOrderRequest.php:17-18` | Store address ID/cart hash/rate timestamp; validate at `placeOrder()` |
| 3 | Session-stored Biteship rate can go stale | High | Customer pays old/wrong shipping cost | `app/Services/Customer/CheckoutService.php:61-77,392-409` | Revalidate/recalculate rate at checkout; expire rates by TTL |
| 4 | Payment expiry relies on webhook only | High | Reserved stock stays forever if webhook missing | `app/Services/Customer/CheckoutService.php:201-223`, `app/Services/Customer/MidtransWebhookService.php:109-141` | Add scheduled expiry job; query Midtrans and release reservations |
| 5 | Payment status can regress after paid | High | Payment row can show failed/cancelled while order paid | `app/Services/Customer/MidtransWebhookService.php:41-62` | Add allowed transition state machine; ignore late regressive notifications |
| 6 | Product variant `reserved_stock > stock` allowed | High | Negative available stock, broken checkout/admin stock | `app/Http/Requests/Admin/ProductRequest.php:59-60`, `app/Services/Admin/ProductManagementService.php:226-227`, `database/migrations/2026_04_30_000006_create_product_variants_table.php:19-20` | Validate `reserved_stock <= stock`; add DB checks |
| 7 | Admin stock adjustment can reduce below reserved stock | High | Paid order settlement can fail or oversell | `app/Services/Stock/StockService.php:78-107` | Enforce `new_stock >= reserved_stock` under lock |
| 8 | Order status transition missing full validation | High | Admin can manually skip business states except few guarded flows | `app/Services/Admin/OrderManagementService.php:82-112`, `app/Services/Admin/ShipmentManagementService.php:166-204` | Central state machine with transition guards |
| 9 | Biteship status mapping defaults unknown to `confirmed` | High | Lost/returned/problem statuses hidden as normal | `app/Services/Admin/ShipmentManagementService.php:383-393` | Explicit map all provider statuses; unknown => `problem` or no-op with alert |
| 10 | Biteship webhook updates stale model, no row lock | High | Concurrent admin refresh/webhook can overwrite newer status | `app/Http/Controllers/Customer/BiteshipWebhookController.php:37-50`, `app/Services/Admin/ShipmentManagementService.php:225-270` | Re-query shipment with `lockForUpdate()` inside apply method; ignore older events |
| 11 | Admin login has no explicit throttle | High | Admin brute force/password spraying | `app/Http/Controllers/Admin/Auth/LoginController.php:24-44`, `routes/web.php:79-82` | Add throttle/rate limiter to `POST /admin/login` |
| 12 | Admin role middleware redirects back instead of 403/login | High | Bad access-control behavior, redirect loops, weak API signal | `app/Http/Middleware/EnsureUserIsAdmin.php:15-17` | Unauthenticated => admin login; authenticated non-admin/inactive => `abort(403)` |
| 13 | Global `User` fillable includes `role`, `is_active` | High | Future mass-assignment misuse can escalate role | `app/Models/User.php:17` | Remove from fillable; set explicitly in admin-only code |
| 14 | Admin product nested IDs not ownership-scoped | High | Request can reference image/variant IDs from other products | `app/Http/Requests/Admin/ProductRequest.php:46,53` | Add `Rule::exists()->where('product_id', route product id)` |
| 15 | Mutating admin actions rendered as GET links | High | Admin payment sync, shipment refresh, customer toggle broken | `resources/js/pages/admin/payments/index.tsx`, `show.tsx`; `admin/shipments/index.tsx`, `show.tsx`; `admin/customers/index.tsx`, `show.tsx`; routes `web.php:134,141,147` | Replace `<Link href>` with button + `router.post()` |
| 16 | Checkout place order lacks client and server idempotency | High | Double-click can submit duplicate order attempts | `resources/js/contexts/checkout-context.tsx`, `app/Services/Customer/CheckoutService.php:105-237` | Add client guard and server idempotency key/unique checkout token |
| 17 | Biteship rate item weight may be total weight while quantity also sent | High | Provider can calculate weight twice | `app/Services/Customer/CheckoutService.php:319-327`, `app/Services/Admin/ShipmentManagementService.php:310-318` | Send unit item weight with `quantity`; verify Biteship contract |
| 18 | Product form can submit blob preview as `image_url` | High | Invalid blob URL can persist or fail upload | `resources/js/pages/admin/products/form.tsx` | Keep preview state separate; submit file only |

---

## 4. Medium Priority Issues

| No | Issue | Risk | Impact | File/Area | Recommended Fix |
|----|-------|------|--------|-----------|-----------------|
| 1 | Cart price snapshot used at checkout without refresh | Medium | Customer can checkout old catalog price after price changes | `app/Services/Customer/CheckoutService.php:132,192-194`, `app/Services/Customer/CartService.php:70,114` | Decide policy; if current price required, recalc under lock at checkout |
| 2 | Product image upload lacks explicit MIME whitelist | Medium | Broader image types than intended | `app/Http/Requests/Admin/ProductRequest.php:48,62` | Add `mimes:jpg,jpeg,png,webp` |
| 3 | Existing `image_url` arbitrary string accepted | Medium | External tracking/malformed URL risk | `app/Services/Admin/ProductImageService.php:30-32,93-99` | Allow local `/storage/...` only or upload-managed paths |
| 4 | Customer order payload exposes `midtrans_snap_token` | Medium | Payment token exposed longer than needed | `app/Services/Customer/OrderService.php:166-179` | Return only redirect URL when needed |
| 5 | Customer order detail exposes `raw_order_response` | Medium | Provider fields/address/debug data leak | `app/Services/Customer/OrderService.php:187-205` | Expose curated shipment fields only |
| 6 | Admin activity log stores raw request data with denylist | Medium | Secrets/tokens/signatures can be logged | `app/Http/Middleware/LogAdminActivity.php:31` | Redact `token|secret|key|signature|authorization|credential`; prefer allowlists |
| 7 | Admin login failure messages leak inactive/non-admin state | Medium | Admin email enumeration | `app/Http/Controllers/Admin/Auth/LoginController.php:32-38` | Generic failure for all auth failures |
| 8 | Biteship webhook accepts query string secret | Medium | Secret leaks via logs/proxies/history | `app/Http/Controllers/Customer/BiteshipWebhookController.php:64-67` | Header/HMAC only |
| 9 | `midtrans_transaction_id` not indexed/unique | Medium | Slow lookup, weak idempotency | `database/migrations/2026_04_30_000014_create_payments_table.php:16-17` | Add index/unique depending provider guarantee |
| 10 | Webhook logs lack event ID/hash uniqueness | Medium | Duplicate logs and weak idempotency evidence | `database/migrations/2026_04_30_000015_create_payment_logs_table.php`, `2026_04_30_000018_create_biteship_webhook_logs_table.php` | Store event ID or payload hash; add unique key |
| 11 | Product primary image not unique | Medium | `primaryImage()` can return arbitrary row | `database/migrations/2026_04_30_000005_create_product_images_table.php:17,21`, `app/Models/Product.php:64-67` | Enforce one primary per product |
| 12 | Default address not unique per user | Medium | Race can create multiple default addresses | `database/migrations/2026_04_30_000001_create_customer_addresses_table.php:27,31` | Transaction lock or partial unique default |
| 13 | Money/quantity fields lack DB checks | Medium | Negative/zero values can corrupt totals | `database/migrations/2026_04_30_000004_create_products_table.php`, `000010_create_vouchers_table.php`, `000011_create_orders_table.php`, `000012_create_order_items_table.php` | Add check constraints |
| 14 | Voucher code allowed in place order request but ignored by service | Medium | API behavior confusing | `app/Http/Requests/Customer/PlaceOrderRequest.php:19`, `app/Services/Customer/CheckoutService.php:135-141` | Remove field or apply payload voucher consistently |
| 15 | Order stats count `shipping_status = shipped`, but allowed values use `in_transit` | Medium | Dashboard undercounts shipped orders | `app/Services/Admin/OrderManagementService.php:56-63`, `ShipmentManagementService.php:59-62` | Use shared enum/status groups |
| 16 | Admin can cancel pending order without stock release path in `OrderManagementService` | Medium | Reserved stock may remain if order manually cancelled before webhook | `app/Services/Admin/OrderManagementService.php:82-112` | Release reservations on cancellation if unpaid |
| 17 | Shipping address route missing redirect handling | Medium | Checkout with no address weak flow | `resources/js/pages/customer/checkout/checkout.tsx`, `routes/web.php:73-76` | Add empty-state CTA and `redirect_to` handling |
| 18 | Frontend shipping/address search race | Medium | Wrong rates/areas displayed | `resources/js/contexts/checkout-context.tsx`, `resources/js/pages/customer/manage-address/manage-address.tsx` | Add abort/request ID and disable while loading |
| 19 | Buy Now route query not integrated with checkout cart | Medium | Customer expects direct checkout but sees stale/empty cart | `resources/js/pages/customer/products/detail-product.tsx`, `routes/web.php:60` | Add buy-now endpoint/session or add-to-cart then redirect |
| 20 | `any` used in admin stats/notification icon components | Medium | Type safety gaps | `resources/js/pages/admin/notifications/index.tsx`, `customer-addresses/index.tsx`, `customers/index.tsx`, customer notification pages | Define typed props |

---

## 5. Low Priority Issues / Improvements

| No | Issue | Benefit | File/Area | Recommendation |
|----|-------|---------|-----------|----------------|
| 1 | Entire authenticated `User` model shared to Inertia | Reduce data exposure | `app/Http/Middleware/HandleInertiaRequests.php:44-46` | Share explicit safe subset |
| 2 | `/dashboard` auth route not role-specific | Cleaner navigation | `routes/web.php:49-51` | Redirect by role or remove |
| 3 | Customer `postal_code` missing explicit string rule | Preserve leading zero | `app/Http/Requests/Customer/UpsertAddressRequest.php:27` | Use `required|string|max:20` |
| 4 | Admin audit logs cascade delete with user | Keep audit trail | `database/migrations/2026_05_01_000000_create_admin_activity_logs_table.php:13` | Use `nullOnDelete()` or restrict deletion |
| 5 | Stock logs cascade delete with variant | Keep inventory audit | `database/migrations/2026_04_30_000007_create_stock_logs_table.php:13` | Use `nullOnDelete()` plus SKU snapshot |
| 6 | Wishlist buttons/heart icons appear dead | Avoid misleading UI | `resources/js/pages/customer/products/detail-product.tsx`, `list-product.tsx` | Wire wishlist feature or remove controls |
| 7 | Cart remove has no confirmation/undo | Better UX | `resources/js/pages/customer/cart/my-cart.tsx` | Add confirm modal or undo toast |
| 8 | Footer links to auth-only pages for guests | Better guest flow | `resources/js/components/Footer.tsx` | Hide or preserve intended redirect |
| 9 | Checkout policy text not linked | Better compliance UX | `resources/js/pages/customer/checkout/checkout.tsx` | Link Terms, Privacy, No Return, Shipping |
| 10 | Admin generic resource form weak loading/error states | Better admin UX | `resources/js/pages/admin/resource-form.tsx` | Use `useForm`, errors, disabled submit |
| 11 | Hardcoded frontend URLs | Route safety | Many React pages | Use Wayfinder/Ziggy generated actions |
| 12 | Product `create-product.tsx` appears mock/duplicate | Reduce confusion | `resources/js/pages/admin/products/create-product.tsx` | Remove if unused or replace with real form |

---

## 6. Missing Features

### Admin Missing Features

| Feature | Why It Is Needed | Priority |
|---------|------------------|----------|
| Real Midtrans status sync | Admin needs reliable payment reconciliation | Critical |
| Failed payment dashboard/action queue | Staff must see payments needing intervention | High |
| Failed shipment dashboard/action queue | Staff must retry/cancel/resolve shipping problems | High |
| Manual payment review for `fraud_status=challenge` | Avoid shipping fraudulent orders | High |
| Shipment creation retry/idempotency UI | Biteship failures need safe retry | High |
| Order/payment/shipping status history timeline | Audit trail for disputes and ops | High |
| Stock reservation overview | Admin must see reserved vs available stock | High |
| Low-stock alerts | Inventory ops need restock signal | Medium |
| Bulk order export with item/address/payment/shipment fields | Ops/accounting/reporting | Medium |
| Refund/return/manual intervention flow | Needed for real commerce incidents | Medium |
| Delivery problem/lost/returned management | Needed for courier exception handling | Medium |
| Notification read/detail management for admin | Operational alerts need lifecycle | Medium |
| Product delete restrictions if order history exists | Prevent historical data damage | Medium |

### Customer Missing Features

| Feature | Why It Is Needed | Priority |
|---------|------------------|----------|
| Reliable Buy Now flow | Current query-only flow likely broken/stale | High |
| Checkout no-address CTA | New customer blocked with weak guidance | High |
| Payment expiry display/timer | Customer must know deadline | Medium |
| Track shipment with normalized timeline | Customer needs shipping visibility | Medium |
| Customer cancellation rules | Pending unpaid orders need cancel flow | Medium |
| Wishlist action | UI shows wishlist affordance but not wired | Medium |
| Checkout retry payment if Snap creation fails | Customer recovery | Medium |
| Clear empty/error/loading states on async actions | Avoid abandoned checkout | Medium |
| Notification entity links | Customer should jump to order/payment/shipment | Low |

### System/Internal Missing Features

| Feature | Why It Is Needed | Priority |
|---------|------------------|----------|
| Central status enums/state machine | Prevent invalid transitions | Critical |
| Idempotency keys for checkout/webhooks/shipment creation | Prevent duplicates | Critical |
| Scheduled payment expiry sync | Release stock when webhook missing | Critical |
| Status history tables | Audit and debugging | High |
| Payment attempt/history model | Real Midtrans lifecycle can have retries | High |
| Shipment idempotency/reference constraints | Avoid duplicate Biteship orders | High |
| External API failure logs with context | Support retry/debug | High |
| Queue jobs for external API calls | Keep requests fast and resilient | Medium |
| DB check constraints | Protect data beyond request layer | Medium |
| Browser/e2e checkout tests | Catch broken payment/shipping UI flows | Medium |

---

## 7. Payment Flow Review

Current payment flow based on code:

1. Customer has cart rows with `price_snapshot`.
2. Customer requests Biteship rates; rates stored in session.
3. Customer places order.
4. `CheckoutService::placeOrder()` starts DB transaction.
5. Locks cart rows and variants.
6. Validates published product, active variant, available stock.
7. Creates order, order address, order items, shipment row, payment row.
8. Increments `reserved_stock`.
9. Calls Midtrans Snap inside same DB transaction.
10. Stores Snap token/redirect URL.
11. Deletes cart and clears checkout session.
12. Midtrans webhook verifies signature and updates payment/order.
13. On `settlement` or `capture`, stock decreases and reserved stock releases.
14. On `expire/cancel/deny/failure`, reserved stock releases.

Problems found:

- `capture` marked paid without fraud check.
- `gross_amount` not validated against local payment.
- Payment state can regress after paid.
- Webhook duplicates logged but no provider event id/hash idempotency.
- Admin sync does not call Midtrans at all.
- Admin failed sync does not release reserved stock.
- Snap API call inside DB transaction.
- No scheduled expiry sync if webhook missing.
- Voucher increment not atomic.
- Stock decrement clamps to zero and hides oversell.
- Payment one-to-one not enforced by DB.
- No payment state machine/enum.

Correct recommended payment flow:

1. Start checkout with idempotency key.
2. Lock cart, variants, voucher.
3. Validate current stock, product active, variant active, price policy, shipping rate/address/cart hash.
4. Create pending order/payment and reserve stock in short transaction.
5. Commit.
6. Create Midtrans Snap outside transaction.
7. Update payment with Snap token and expiry.
8. If Snap creation fails, mark payment/order failed and release reservations or schedule retry.
9. On webhook, verify signature and amount.
10. Lock payment/order/variants.
11. Store webhook log with event hash/idempotency key.
12. Apply state machine only if transition allowed.
13. On paid, decrement stock once and release reservation once.
14. On expired/cancelled/failed, release reservation once.
15. Scheduled job reconciles expired/pending payments with Midtrans.

How to prevent fake/duplicate webhook updates:

- Keep `hash_equals()` signature check.
- Require `order_id`, `status_code`, `gross_amount`, `signature_key`.
- Compare payload `gross_amount` to `Payment::gross_amount`.
- Verify `order_id === payments.midtrans_order_id`.
- Store event ID or payload hash unique in `payment_logs`.
- Lock payment/order with `lockForUpdate()`.
- Ignore late regressive statuses after paid.
- Make stock decrement/release idempotent by checking order payment status and reservation state.
- Never trust frontend amount or status.

Recommended Midtrans status mapping:

| Midtrans transaction_status | fraud_status | Local payment_status | Local order_status |
|----------------------------|--------------|----------------------|--------------------|
| `pending` | any/null | `pending` | `pending_payment` |
| `capture` | `accept` | `paid` | `paid` |
| `capture` | `challenge` | `pending` or `manual_review` | `pending_payment` |
| `capture` | `deny` | `failed` | `cancelled` |
| `settlement` | any/null | `paid` | `paid` |
| `deny` | any/null | `failed` | `cancelled` |
| `cancel` | any/null | `cancelled` | `cancelled` |
| `expire` | any/null | `expired` | `expired` |
| `failure` | any/null | `failed` | `cancelled` |
| `refund` | any/null | `refunded` | `refunded` or `cancelled` |
| `partial_refund` | any/null | `partially_refunded` | current order status plus refund flag |
| `authorize` | any/null | `pending` | `pending_payment` |

Files needing changes:

- `app/Services/Customer/MidtransWebhookService.php`
- `app/Services/Admin/PaymentManagementService.php`
- `app/Services/Integrations/MidtransService.php`
- `app/Services/Customer/CheckoutService.php`
- `database/migrations/2026_04_30_000014_create_payments_table.php`
- `database/migrations/2026_04_30_000015_create_payment_logs_table.php`
- New action: `app/Actions/Payments/HandleMidtransWebhookAction.php`
- New job: `app/Jobs/Payments/SyncExpiredMidtransPayments.php`
- New enum: `app/Enums/PaymentStatus.php`, `app/Enums/MidtransTransactionStatus.php`

---

## 8. Shipping Flow Review

Current shipping flow based on code:

1. Customer selects address.
2. Backend calls Biteship rate API using destination postal code and cart items.
3. Rates stored in session.
4. Checkout stores selected rate into order shipment row as `not_created`.
5. After payment is paid, admin can create Biteship order from admin route.
6. `ShipmentManagementService::createFromOrder()` checks order `payment_status === paid`.
7. It builds Biteship payload and calls Biteship create order inside DB transaction.
8. Saves Biteship identifiers and status into `shipments`.
9. Admin can refresh tracking.
10. Biteship webhook can update shipment/order status if it finds by order/tracking/waybill ID.
11. Admin can manually update shipping status.

Problems found:

- Biteship webhook unauthenticated if secret missing.
- Webhook secret allowed in query string.
- Create shipment external API inside DB transaction.
- Duplicate shipment race due no unique `shipments.order_id`.
- Webhook/update lacks row lock and event ordering.
- Status mapping incomplete; unknown becomes `confirmed`.
- Rate can be stale and not bound to cart/address.
- Item weight likely multiplied twice.
- No unique Biteship identifiers.
- No webhook event uniqueness.
- No full handling for returned/lost/failed/on-hold statuses.
- Admin frontend refresh tracking uses GET link for POST route, broken.
- No queue/retry strategy for failed Biteship create/refresh.

Correct recommended Biteship flow:

1. During checkout, calculate rates using current cart, address, origin.
2. Store rate with `address_id`, `cart_hash`, `expires_at`, normalized courier code/type/service.
3. Revalidate rate during order placement.
4. Create local shipment row as `not_created` after order creation.
5. Only create Biteship order after payment is paid and order is `processing` or `ready_to_ship`.
6. Lock order/shipment; mark shipment `creating`; commit.
7. Call Biteship create order outside DB transaction with `reference_id = order_number`.
8. Persist identifiers and provider response in new transaction.
9. Use unique `order_id`, `biteship_order_id`, `biteship_tracking_id`, `waybill_id` where possible.
10. Webhook must require secret/HMAC and replay protection.
11. Webhook must lock shipment, compare event timestamp/status rank, then update.
12. Unknown provider statuses become `problem` and alert admin.
13. Admin can manually update only safe statuses with audit reason.

When shipment should be created:

- Not during checkout.
- Not before payment.
- After payment `paid`, order `processing` or `ready_to_ship`.
- Prefer admin action or queued job after payment paid, depending operational model.

Tracking sync:

- Webhook primary.
- Admin refresh fallback via Biteship retrieve order.
- Scheduled sync for active shipments every N minutes/hours.
- Store raw event + normalized tracking timeline.
- Ignore stale/duplicate events.

Statuses admin may update manually:

- `processing`
- `ready_to_ship`
- `confirmed`
- `allocated`
- `picked`
- `in_transit`
- `problem`
- `delivered`
- `cancelled` with reason
- `lost` with reason
- `returned` with reason

Recommended Biteship status mapping:

| Biteship status | Local shipping_status | Local order_status |
|-----------------|----------------------|--------------------|
| `confirmed` | `confirmed` | `ready_to_ship` |
| `allocated` | `allocated` | `ready_to_ship` |
| `courier_assigned` | `allocated` | `ready_to_ship` |
| `picking_up` | `picked` or `allocated` | `ready_to_ship` |
| `picked` | `picked` | `shipped` |
| `picked_up` | `picked` | `shipped` |
| `dropping_off` | `in_transit` | `shipped` |
| `on_process` | `in_transit` | `shipped` |
| `on_delivery` | `in_transit` | `shipped` |
| `delivered` | `delivered` | `delivered` |
| `cancelled` / `canceled` | `cancelled` | `cancelled` or `shipment_failed` |
| `returned` | `returned` | `returned` |
| `lost` | `lost` | `lost` |
| `disposed` | `lost` or `problem` | `lost` |
| `on_hold` | `problem` | `shipment_problem` |
| unknown | `problem` | current status + admin alert |

Files needing changes:

- `app/Services/Customer/CheckoutService.php`
- `app/Services/Admin/ShipmentManagementService.php`
- `app/Services/Integrations/BiteshipService.php`
- `app/Http/Controllers/Customer/BiteshipWebhookController.php`
- `database/migrations/2026_04_30_000016_create_shipments_table.php`
- `database/migrations/2026_04_30_000017_create_shipment_trackings_table.php`
- `database/migrations/2026_04_30_000018_create_biteship_webhook_logs_table.php`
- `resources/js/pages/admin/shipments/index.tsx`
- `resources/js/pages/admin/shipments/show.tsx`

---

## 9. Order Status Lifecycle Recommendation

Clean lifecycle:

```text
cart
→ checkout_started
→ pending_payment
→ paid
→ processing
→ ready_to_ship
→ shipment_created
→ picked
→ shipped
→ delivered
→ completed
```

Failure branches:

```text
pending_payment
→ payment_expired
→ stock_released
```

```text
pending_payment
→ payment_failed
→ stock_released
```

```text
pending_payment
→ cancelled
→ stock_released
```

```text
paid
→ processing
→ shipment_failed
→ manual_intervention
```

```text
shipped
→ delivery_failed
→ manual_intervention
```

```text
shipped
→ lost
→ manual_intervention
```

```text
delivered
→ returned
→ manual_intervention
```

Transition triggers:

| From | To | Trigger |
|------|----|---------|
| `cart` | `pending_payment` | Customer places order and stock reserved |
| `pending_payment` | `paid` | Valid Midtrans settlement/capture accept |
| `pending_payment` | `payment_expired` | Midtrans expire webhook or scheduled sync |
| `pending_payment` | `payment_failed` | Midtrans deny/failure/cancel |
| `pending_payment` | `cancelled` | Customer/admin cancels unpaid order |
| `paid` | `processing` | Admin starts fulfillment |
| `processing` | `ready_to_ship` | Admin packs order |
| `ready_to_ship` | `shipment_created` | Biteship order created |
| `shipment_created` | `picked` | Courier pickup event |
| `picked` | `shipped` | In transit event |
| `shipped` | `delivered` | Courier delivered event |
| `delivered` | `completed` | Customer confirms or auto-complete job |
| `shipment_created/shipped` | `shipment_failed` | Biteship failure/cancel/problem |
| `shipped` | `lost` | Courier lost event |
| `delivered/shipped` | `returned` | Return event/manual admin |

Rules:

- Cannot ship before `payment_status = paid`.
- Cannot complete before `shipping_status = delivered`.
- Cannot cancel paid order without refund/manual flow.
- Expire/cancel unpaid order must release reserved stock.
- Paid transition must reduce stock once.
- All transitions must write status history.

---

## 10. Database Recommendations

| Table | Recommendation | Reason | Priority |
|-------|----------------|--------|----------|
| `orders` | Add DB checks for `payment_status`, `order_status`, `shipping_status` | Prevent invalid raw status strings | Critical |
| `orders` | Add `payment_expires_at`, `auto_completed_at`, `refund_status` | Payment expiry and post-delivery lifecycle | High |
| `orders` | Snapshot voucher type/value/max/min/name | Historical discount audit | Medium |
| `order_items` | Add checks `quantity > 0`, `price >= 0`, `subtotal >= 0` | Prevent corrupt totals | High |
| `order_items` | Confirm weight semantics: unit vs total | Biteship payload correctness | High |
| `payments` | Add unique `order_id` if one payment per order | Match `HasOne` model | Critical |
| `payments` | Add index/unique `midtrans_transaction_id` | Reconciliation/idempotency | Medium |
| `payments` | Add `expires_at`, `last_synced_at`, `failure_reason` | Payment ops visibility | High |
| `payment_logs` | Add `event_id` or `payload_hash` unique | Duplicate webhook detection | High |
| `shipments` | Add unique `order_id` | Prevent duplicate shipment | Critical |
| `shipments` | Add unique/index provider IDs | Correct webhook lookup | High |
| `shipments` | Add `creating_at`, `failed_reason`, `last_synced_at` | Retry and ops | Medium |
| `shipment_trackings` | Add provider event ID/hash and `provider_happened_at` | Ignore duplicates/stale events | High |
| `biteship_webhook_logs` | Add `event_id` or payload hash unique | Idempotency | High |
| `product_variants` | Add checks `stock >= 0`, `reserved_stock >= 0`, `reserved_stock <= stock` | Inventory correctness | Critical |
| `products` | Add checks money/dimensions non-negative and `sale_price <= base_price` | Catalog integrity | Medium |
| `product_images` | Enforce one primary image per product | Stable storefront image | Medium |
| `customer_addresses` | Enforce one default address per user | Avoid checkout ambiguity | Medium |
| `vouchers` | Add checks for usage/money/date/percentage | Discount integrity | High |
| `vouchers` | Add `voucher_redemptions` table | Atomic per-order usage | High |
| `users` | Add role enum/check and `role,is_active` index | Role consistency and filtering | Medium |
| `admin_activity_logs` | Use `nullOnDelete()` user FK | Preserve audit trail | Low |
| `stock_logs` | Use `nullOnDelete()` and snapshot SKU/product | Preserve inventory audit | Low |
| `order_status_histories` | New table | Full lifecycle audit | High |
| `payment_status_histories` | New table | Payment audit/reconciliation | High |
| `shipment_status_histories` | New table | Shipping audit/reconciliation | High |

---

## 11. Backend Refactor Recommendations

Current structure has many services, good start. Main problem: domain logic duplicated and status transitions spread across customer/admin services.

Recommended structure:

```text
app/
  Actions/
    Checkout/
      PlaceOrderAction.php
      ReserveStockAction.php
      ReleaseStockReservationAction.php
    Payments/
      CreateMidtransSnapAction.php
      HandleMidtransWebhookAction.php
      SyncMidtransPaymentAction.php
      MarkPaymentPaidAction.php
      MarkPaymentFailedAction.php
    Shipments/
      CreateBiteshipShipmentAction.php
      HandleBiteshipWebhookAction.php
      RefreshBiteshipTrackingAction.php
      ApplyShipmentStatusAction.php
    Orders/
      TransitionOrderStatusAction.php
      CompleteDeliveredOrderAction.php

  Enums/
    OrderStatus.php
    PaymentStatus.php
    ShippingStatus.php
    MidtransTransactionStatus.php
    BiteshipStatus.php

  Services/
    Checkout/
      CheckoutPricingService.php
      CheckoutSessionService.php
    Payment/
      MidtransService.php
      PaymentStateMachine.php
    Shipping/
      BiteshipService.php
      ShippingRateService.php
      ShipmentStateMachine.php
    Stock/
      StockReservationService.php
      StockService.php
    Admin/
      ProductManagementService.php
      OrderManagementService.php
    Customer/
      CartService.php
      ProductBrowsingService.php

  Http/
    Requests/
      Customer/
        PlaceOrderRequest.php
        ShippingRateRequest.php
      Admin/
        ProductRequest.php
        OrderStatusRequest.php
        CreateShipmentRequest.php

  Jobs/
    Payments/
      SyncExpiredPaymentsJob.php
      CreateMidtransSnapJob.php
    Shipments/
      SyncActiveShipmentsJob.php
      CreateBiteshipShipmentJob.php

  Events/
    OrderPaid.php
    OrderCancelled.php
    ShipmentDelivered.php
    PaymentFailed.php

  Listeners/
    SendOrderNotification.php
    AlertAdminForPaymentFailure.php
    AlertAdminForShipmentProblem.php

  Policies/
    OrderPolicy.php
    ProductPolicy.php
    CustomerAddressPolicy.php
    ShipmentPolicy.php
```

Specific recommendations:

- Controllers stay thin.
- `CheckoutService::placeOrder()` split into `PlaceOrderAction`, `ReserveStockAction`, `CreateMidtransSnapAction`.
- `MidtransWebhookService` and `PaymentManagementService` share one payment state action.
- `ShipmentManagementService` split provider integration from status state machine.
- Form Requests for every mutation, already mostly present.
- Policies for admin/customer access instead of repeated role checks.
- Enums drive validation and DB checks.
- Jobs handle external calls and reconciliation.
- Events/listeners handle notifications after commit.

---

## 12. Frontend Refactor Recommendations

Inertia pages:

- Replace hardcoded mutation URLs with Wayfinder/Ziggy generated actions.
- Replace mutating `<Link>` with `<button>` plus `router.post/put/delete`.
- Add per-action processing states, not one global state.
- Add error states for all external API interactions.
- Add empty states for checkout no address, no shipping rates, no cart items, admin no rows.
- Add request cancellation/request IDs for Biteship area search and shipping rates.
- Reset page to 1 when product/order filters change.

Admin layout:

- Add action-needed dashboard cards:
  - pending payments
  - fraud challenges
  - failed payments
  - paid orders awaiting processing
  - shipment failed/problem
  - low stock
  - stale pending payments
- Add confirmation dialogs for destructive actions.
- Add audit/status timeline in order detail.

Customer layout:

- Add clear checkout blocked states.
- Add payment deadline and retry pay action.
- Add order shipment timeline.
- Fix Buy Now to add selected variant to cart or create buy-now checkout session.
- Wire wishlist or remove dead heart icons.

Forms:

- `resources/js/pages/admin/products/form.tsx`: remove `any`, keep image preview separate, extract `submitProduct()`.
- `resources/js/pages/customer/manage-address/manage-address.tsx`: prevent accidental modal close with dirty form.
- `resources/js/pages/customer/checkout/checkout.tsx`: voucher buttons disabled while processing.
- `resources/js/contexts/checkout-context.tsx`: guard double submit and stale shipping rates.

TypeScript:

- Replace `Record<string, any>` stats with explicit `Stat` type.
- Replace `React.ComponentType<any>` icons with `LucideIcon` or SVG props.
- Type server props per page.

---

## 13. Security Recommendations

Checklist:

- [ ] Verify Midtrans webhook signature. Current exists in `app/Services/Integrations/MidtransService.php:51-60`; keep and test.
- [ ] Validate Midtrans `gross_amount` against `payments.gross_amount` in `app/Services/Customer/MidtransWebhookService.php`.
- [ ] Validate Midtrans `fraud_status` for `capture` in `MidtransWebhookService` and `PaymentManagementService`.
- [ ] Protect admin routes. Current `routes/web.php:84-198` protected, but fix `EnsureUserIsAdmin.php`.
- [ ] Prevent IDOR with policies. Cart/address/order services guard ownership; add formal policies.
- [ ] Validate uploads with MIME whitelist in `app/Http/Requests/Admin/ProductRequest.php`.
- [ ] Hide API keys. Ensure only `config/services.php` and server env use keys; do not share settings containing secrets to frontend.
- [ ] Add rate limiting to `POST /admin/login`, checkout place-order, shipping rates, voucher apply.
- [ ] Add policy checks for admin/customer entity access.
- [ ] Prevent mass assignment by removing `role`, `is_active` from `User::$fillable`.
- [ ] Sanitize/curate raw provider payloads before sending to frontend.
- [ ] Fail closed for Biteship webhook secret in `BiteshipWebhookController`.
- [ ] Remove query-string webhook secret.
- [ ] Redact admin activity logs in `LogAdminActivity.php`.
- [ ] Add event id/hash uniqueness for webhook logs.
- [ ] Return `403` for authenticated non-admin access, not redirect back.
- [ ] Generic admin login error to avoid account enumeration.

Specific files:

- `app/Services/Customer/MidtransWebhookService.php`
- `app/Services/Integrations/MidtransService.php`
- `app/Http/Controllers/Customer/BiteshipWebhookController.php`
- `app/Http/Middleware/EnsureUserIsAdmin.php`
- `app/Http/Middleware/LogAdminActivity.php`
- `app/Models/User.php`
- `app/Http/Requests/Admin/ProductRequest.php`
- `routes/web.php`
- `routes/api.php`

---

## 14. Performance Recommendations

Checklist:

- [ ] Fix N+1 queries. Most listing services use eager loading, but review admin detail payloads as rows grow.
- [ ] Add eager loading where relationship props used in pagination transformations.
- [ ] Add pagination. Admin/customer lists mostly paginate; verify report exports chunk large data.
- [ ] Add indexes:
  - `payments.midtrans_transaction_id`
  - `payments.transaction_status,created_at`
  - `shipments.shipping_status,created_at`
  - `users.role,is_active`
  - provider IDs on shipments
- [ ] Optimize dashboard queries in `app/Services/Admin/DashboardService.php` / `AdminDashboardService.php`: use aggregate queries instead of many counts when data grows.
- [ ] Optimize product images: use thumbnails/webp, not original uploads in listings.
- [ ] Cache stable shipping/location data:
  - Biteship area search short TTL
  - shipping courier settings
  - store origin settings
- [ ] Avoid repeated external API calls:
  - cache rate result with cart/address hash
  - queue shipment refresh
  - scheduled sync active shipments
- [ ] Move external API calls out of DB transactions:
  - `CheckoutService::placeOrder()`
  - `ShipmentManagementService::createFromOrder()`
- [ ] Use queue for slow provider calls and retries:
  - Midtrans Snap creation optional async/retry
  - Biteship create/retrieve
  - payment expiry reconciliation
- [ ] Use `lockForUpdate()` only around short local updates.

Exact areas/files:

- `app/Services/Customer/CheckoutService.php`
- `app/Services/Admin/ShipmentManagementService.php`
- `app/Services/Integrations/BiteshipService.php`
- `app/Services/Integrations/MidtransService.php`
- `app/Services/Admin/OrderManagementService.php`
- `app/Services/Admin/PaymentManagementService.php`
- `app/Services/Admin/DashboardService.php`
- `app/Services/AdminDashboardService.php`

---

## 15. Testing Recommendations

| Test Case | Type | Priority |
|----------|------|----------|
| Midtrans webhook rejects invalid signature | Feature | Critical |
| Midtrans webhook rejects amount mismatch | Feature | Critical |
| Midtrans `capture` + `fraud_status=challenge` does not mark paid | Feature | Critical |
| Midtrans `settlement` marks paid once and decrements stock once | Feature | Critical |
| Duplicate Midtrans webhook is idempotent | Feature | Critical |
| Late `expire` after paid does not regress payment/order | Feature | Critical |
| Expired payment releases reserved stock | Feature/Job | Critical |
| Admin payment sync calls Midtrans API and releases stock on failure | Feature | Critical |
| Checkout cannot use shipping rate from another address | Feature | Critical |
| Checkout cannot submit stale shipping rate/cart hash | Feature | High |
| Checkout double-submit creates one order | Feature | Critical |
| Checkout with inactive product blocked | Feature | High |
| Checkout with insufficient stock blocked | Feature | High |
| Voucher usage limit cannot exceed under concurrency | Feature/Concurrency | Critical |
| Admin cannot ship unpaid order | Feature | Critical |
| Biteship webhook rejects missing secret in production | Feature | Critical |
| Biteship webhook duplicate event id ignored | Feature | High |
| Biteship unknown status maps to `problem` | Unit | High |
| Shipment creation duplicate requests create one provider shipment | Feature/Concurrency | Critical |
| Shipment creation failure does not orphan local state | Feature | High |
| Status transition invalid path rejected | Unit/Feature | High |
| Admin routes reject customer with 403 | Feature | High |
| Customer cannot access another customer order/address/cart | Feature | High |
| Product validation rejects sale price greater than base price | Feature | Medium |
| Product validation rejects duplicate SKU/slug | Feature | Medium |
| Product primary image uniqueness enforced | Feature | Medium |
| Product delete with order history blocked/soft handled | Feature | Medium |
| Admin mutation buttons use correct HTTP method | Browser | High |
| Checkout no-address shows CTA and blocks submit | Browser | Medium |
| Shipping rate request race does not show stale rates | Browser | Medium |
| Biteship area search race does not show stale areas | Browser | Medium |
| Product Buy Now adds selected variant or creates buy-now session | Browser/Feature | High |

Existing tests found:

- `tests/Feature/Customer/ManageAddressTest.php`
- `tests/Feature/Customer/BiteshipShippingRateTest.php`
- Auth/settings tests
- No meaningful checkout/payment/webhook/stock/order transition coverage yet.

---

## 16. Suggested Fix Plan

### Phase 1 — Critical Production Safety

| Task | Files/Area | Expected Result |
|------|------------|-----------------|
| Harden Midtrans webhook amount/fraud/status/idempotency | `MidtransWebhookService.php`, `MidtransService.php`, `payment_logs` migration | Fake/wrong/challenged payments cannot mark orders paid |
| Share one payment state machine between webhook and admin sync | `MidtransWebhookService.php`, `PaymentManagementService.php`, new actions/enums | Consistent paid/failed handling |
| Release reserved stock on all failure/cancel/expire paths | `PaymentManagementService.php`, `OrderManagementService.php`, stock service | No stuck inventory |
| Remove stock clamp and enforce stock invariants | `MidtransWebhookService.php`, `PaymentManagementService.php`, migrations | Oversell becomes detected error, not hidden |
| Move Midtrans Snap call outside DB transaction | `CheckoutService.php` | Checkout locks shortened; fewer deadlocks |
| Fail closed Biteship webhook auth | `BiteshipWebhookController.php`, config | Fake shipment updates blocked |
| Add unique one-payment/one-shipment constraints | payment/shipment migrations | Duplicate payment/shipment rows prevented |
| Add checkout idempotency key | `CheckoutService.php`, request/frontend context, DB column/table | Double-click does not create duplicate order |
| Add critical tests | `tests/Feature/*` | Regression protection for payment/stock/webhook |

### Phase 2 — Operational Completeness

| Task | Files/Area | Expected Result |
|------|------------|-----------------|
| Implement real Midtrans status sync | `MidtransService.php`, `PaymentManagementService.php` | Admin can reconcile stale payments |
| Add scheduled payment expiry sync | new job/command/schedule | Stock released if webhook missing |
| Refactor Biteship create order outside transaction | `ShipmentManagementService.php` | No orphan/duplicate shipment from DB rollback |
| Add shipment idempotency/reference handling | migrations, `ShipmentManagementService.php` | Safe retry |
| Expand Biteship status mapping | `ShipmentManagementService.php`, enums | Returned/lost/problem handled correctly |
| Add admin action-needed dashboard cards | admin dashboard service/pages | Staff sees urgent operations |
| Add status history tables | migrations/actions | Full audit trail |
| Add notification events/listeners | services/events/listeners | Customers/admins alerted consistently |

### Phase 3 — Code Quality & Refactor

| Task | Files/Area | Expected Result |
|------|------------|-----------------|
| Add enums for statuses | `app/Enums/*`, FormRequests, services | No divergent string lists |
| Split checkout/payment/shipment actions | `app/Actions/*` | Smaller, testable code |
| Add policies | `app/Policies/*`, controllers | Consistent authorization |
| Add DB check constraints | migrations | Bad data rejected at database level |
| Reduce raw provider payload exposure | order/payment/shipment services | Safer frontend props |
| Remove risky mass assignment | `app/Models/User.php` | Lower privilege escalation risk |
| Redact admin activity logs | `LogAdminActivity.php` | Secrets not stored in logs |

### Phase 4 — UX & Performance

| Task | Files/Area | Expected Result |
|------|------------|-----------------|
| Fix admin POST actions rendered as links | admin payments/shipments/customers pages | Buttons work, no 405 |
| Fix Buy Now flow | product detail, cart/checkout backend | Selected variant reaches checkout |
| Add checkout empty/loading/error states | checkout context/page | Clear customer flow |
| Add request cancellation for Biteship area/rates | checkout/address pages | No stale rates/areas |
| Add image optimization | upload/display pipeline | Faster product pages |
| Cache stable Biteship area/rate data | `BiteshipService`, cache | Fewer external calls |
| Optimize dashboard/report queries | dashboard/report services | Faster admin under data growth |

---

## 17. Final Recommendation

Website status: **Not ready for production**.

Reason:

- Payment and shipping integrations exist, but critical safeguards are incomplete.
- Midtrans webhook can mark unsafe `capture` as paid and does not validate local amount.
- Stock reservation/release has critical failure paths.
- External API calls happen inside DB transactions.
- Biteship webhook can be unauthenticated when secret missing.
- Status lifecycle is not strongly modeled.
- DB constraints do not enforce core business invariants.
- Important admin actions are broken in frontend due wrong HTTP method.
- Tests do not cover checkout/payment/webhook/stock/shipping critical paths.

Safe next milestone: **ready for limited internal testing only after Phase 1 fixes and tests pass**. Production should wait until Phase 2 operational gaps are closed.
