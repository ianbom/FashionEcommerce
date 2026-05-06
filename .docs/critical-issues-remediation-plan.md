# Critical Issues Remediation Plan

Source audit: `CODEBASE_AUDIT_REPORT.md`
Scope: all items in `## 2. Critical Issues` plus direct dependencies required to fix them safely.
Goal: make checkout, payment, stock, and shipment flows safe enough for limited internal testing after completion.

## Current Risk Summary

Application is not production ready because critical business invariants are not enforced consistently:

- Unsafe Midtrans webhook handling can mark fraudulent or wrong-amount transactions as paid.
- Stock can oversell silently or remain reserved forever.
- External API calls happen inside database transactions, creating lock and rollback hazards.
- Biteship webhook can be unauthenticated when secret is missing.
- Duplicate payment and shipment rows can exist despite one-to-one model relationships.
- Voucher usage limits can be exceeded under concurrent checkout/payment flows.
- Status values are raw strings spread across services, creating invalid transitions and inconsistent dashboards.

## Remediation Principles

- Fail closed for security-sensitive webhook paths.
- Enforce invariants at both application and database layers.
- Keep database transactions short and local-only.
- Never trust provider payload fields without signature, amount, and reference validation.
- Centralize status transitions and stock side effects.
- Make all webhook and external-provider operations idempotent.
- Add tests before or alongside risky changes.

## Phase Order

1. Add shared enums/state maps and database constraints foundation.
2. Harden Midtrans webhook and admin payment sync paths.
3. Fix stock reservation and release invariants.
4. Refactor checkout transaction boundaries and idempotency.
5. Harden Biteship webhook and shipment creation.
6. Fix voucher atomic usage.
7. Add critical regression test coverage.
8. Run verification and deployment readiness checks.

## Issue 1: Midtrans `capture` Marked Paid Without Fraud Check

### Risk

Fraud-challenged card captures can become paid orders and shippable orders.

### Target Files

- `app/Services/Customer/MidtransWebhookService.php`
- `app/Services/Admin/PaymentManagementService.php`
- New: `app/Enums/PaymentStatus.php`
- New: `app/Enums/OrderStatus.php`
- New: `app/Enums/MidtransTransactionStatus.php`
- New: `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php`

### Technical Plan

1. Create `MidtransTransactionStatus` enum with at least:
   - `pending`
   - `capture`
   - `settlement`
   - `deny`
   - `cancel`
   - `expire`
   - `failure`
   - `refund`
   - `partial_refund`
   - `authorize`

2. Create `PaymentStatus` enum with at least:
   - `pending`
   - `paid`
   - `failed`
   - `cancelled`
   - `expired`
   - `manual_review`
   - `refunded`
   - `partially_refunded`

3. Create `OrderStatus` enum with payment-related states:
   - `pending_payment`
   - `paid`
   - `processing`
   - `cancelled`
   - `expired`
   - `refunded`

4. Implement one mapping function in `ApplyMidtransPaymentStatusAction`:

| Midtrans Status | Fraud Status | Local Payment Status | Local Order Status | Side Effect |
|---|---|---|---|---|
| `settlement` | any | `paid` | `paid` or `processing` | finalize stock once |
| `capture` | `accept` | `paid` | `paid` or `processing` | finalize stock once |
| `capture` | `challenge` | `manual_review` or `pending` | `pending_payment` | no stock decrement |
| `capture` | `deny` | `failed` | `cancelled` | release reservation |
| `pending` | any | `pending` | `pending_payment` | no-op |
| `authorize` | any | `pending` | `pending_payment` | no-op |
| `deny` | any | `failed` | `cancelled` | release reservation |
| `cancel` | any | `cancelled` | `cancelled` | release reservation |
| `expire` | any | `expired` | `expired` | release reservation |
| `failure` | any | `failed` | `cancelled` | release reservation |
| `refund` | any | `refunded` | `refunded` or current safe status | no automatic stock mutation unless refund flow exists |
| `partial_refund` | any | `partially_refunded` | current safe status | no stock mutation |

5. Replace duplicated mapping in webhook and admin payment sync with this action.

6. Add guard: if current payment status is `paid`, ignore `pending`, `expire`, `cancel`, `deny`, and `failure` unless explicit refund flow applies.

### Acceptance Criteria

- `capture` + `fraud_status=accept` marks payment paid.
- `capture` + `fraud_status=challenge` does not mark payment paid.
- `capture` + `fraud_status=deny` fails/cancels payment and releases reservation.
- Late `expire` after `paid` does not regress payment or order.
- Webhook and admin sync use same status mapping.

## Issue 2: Midtrans Webhook Does Not Validate `gross_amount`

### Risk

Wrong-amount transaction can mark local order as paid.

### Target Files

- `app/Services/Customer/MidtransWebhookService.php`
- `app/Services/Integrations/MidtransService.php`
- `database/migrations/2026_04_30_000015_create_payment_logs_table.php`

### Technical Plan

1. Keep existing Midtrans signature validation.

2. Require payload fields before processing:
   - `order_id`
   - `status_code`
   - `gross_amount`
   - `signature_key`
   - `transaction_status`

3. Resolve local payment by exact Midtrans order reference:
   - Prefer `payments.midtrans_order_id` if present.
   - If not present, use existing local field that stores Midtrans `order_id`.
   - Do not rely on order number if provider order ID has separate column.

4. Normalize amount comparison:
   - Convert provider `gross_amount` string to decimal with 2 places.
   - Compare against `payments.gross_amount` decimal with 2 places.
   - Use strict decimal string compare or integer minor-unit compare.

5. Reject mismatch:
   - Store log row with status `rejected_amount_mismatch`.
   - Do not mutate `payments`, `orders`, stock, voucher, or shipment.
   - Alert admin via log/notification if notification system exists.

6. Add helper in `MidtransService`:
   - `validateNotificationSignature(array $payload): bool`
   - `amountMatches(string|float $payloadAmount, Payment $payment): bool`

### Acceptance Criteria

- Valid signature with mismatched amount is rejected.
- Mismatched amount creates audit log.
- Mismatched amount does not decrement stock.
- Mismatched amount does not change order/payment status.

## Issue 3: Stock Paid Handler Clamps Stock With `max(0, stock - qty)`

### Risk

Oversell is hidden. Stock audit appears normal while actual inventory is corrupt.

### Target Files

- `app/Services/Customer/MidtransWebhookService.php`
- `app/Services/Admin/PaymentManagementService.php`
- `app/Services/Stock/StockService.php`
- `database/migrations/2026_04_30_000006_create_product_variants_table.php`

### Technical Plan

1. Replace all paid-finalization stock mutation with shared action/service:
   - `app/Actions/Stock/FinalizeReservedStockAction.php`

2. Under DB transaction and row locks:
   - Lock order.
   - Lock order items.
   - Lock each related product variant with `lockForUpdate()`.

3. For each item, enforce:
   - `variant.stock >= item.quantity`
   - `variant.reserved_stock >= item.quantity`

4. If invariant fails:
   - Throw domain exception.
   - Mark payment/order as `manual_review` if safe and needed.
   - Write alert log.
   - Do not clamp to zero.

5. If invariant passes:
   - `stock = stock - quantity`
   - `reserved_stock = reserved_stock - quantity`

6. Ensure action runs only once per order:
   - Use payment/order status transition guard.
   - Optional add `stock_finalized_at` to orders if status alone is insufficient.

7. Add DB check constraints for `product_variants`:
   - `stock >= 0`
   - `reserved_stock >= 0`
   - `reserved_stock <= stock`

### Acceptance Criteria

- Oversell condition raises error and is logged.
- Stock is decremented once for paid order.
- Reserved stock is released/decremented once for paid order.
- Duplicate paid webhook does not decrement stock twice.

## Issue 4: Admin Failed Payment Sync Does Not Release `reserved_stock`

### Risk

Inventory remains locked forever when admin sync marks payment failed/expired/cancelled.

### Target Files

- `app/Services/Admin/PaymentManagementService.php`
- New/shared: `app/Actions/Stock/ReleaseStockReservationAction.php`
- New/shared: `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php`

### Technical Plan

1. Implement shared release action:
   - Lock order.
   - Lock variants for order items.
   - Only run when order has unpaid reserved stock.
   - Decrement `reserved_stock` by order item quantity.
   - Never decrement below zero.
   - Log invariant failure if `reserved_stock < quantity`.

2. Call release action from all failure paths:
   - Customer Midtrans webhook `expire`, `cancel`, `deny`, `failure`, fraud deny.
   - Admin payment sync failure/expiry/cancel paths.
   - Admin unpaid order cancellation if included in same phase.

3. Add idempotency guard:
   - If payment already terminal failed/expired/cancelled and reservation already released, no-op.
   - Prefer explicit column such as `stock_released_at` on orders or use status transition plus stock invariant.

### Acceptance Criteria

- Admin sync to `expired` releases reserved stock.
- Admin sync to `failed` releases reserved stock.
- Re-running admin sync does not release twice.
- Webhook and admin sync produce identical stock outcomes.

## Issue 5: Checkout Calls Midtrans Snap Inside DB Transaction

### Risk

Long DB locks, deadlocks, checkout contention, and inconsistent rollback when Midtrans API times out.

### Target Files

- `app/Services/Customer/CheckoutService.php`
- `app/Services/Integrations/MidtransService.php`
- Optional new: `app/Actions/Checkout/PlaceOrderAction.php`
- Optional new: `app/Actions/Payments/CreateMidtransSnapAction.php`

### Technical Plan

1. Split checkout into two stages.

2. Stage A: local transaction only.
   - Lock cart rows.
   - Lock variants.
   - Validate product/variant active.
   - Validate stock availability.
   - Validate shipping rate binding and TTL.
   - Validate voucher atomically if used.
   - Create order.
   - Create order items.
   - Create shipment row as `not_created`.
   - Create payment row as `pending`.
   - Reserve stock.
   - Commit.

3. Stage B: external Midtrans call outside transaction.
   - Build Snap request from committed order/payment snapshot.
   - Call Midtrans Snap API.
   - Update payment row in short transaction with Snap token, redirect URL, expiry.

4. If Snap creation fails:
   - Mark payment `failed` or `snap_failed` depending enum design.
   - Mark order `cancelled` or `payment_failed` if no retry flow exists.
   - Release stock reservation.
   - Keep order/payment visible to admin for diagnosis.
   - Return safe customer error.

5. Ensure cart/session cleanup occurs after Snap success.
   - If Snap failure should allow retry, keep cart/session or create retry endpoint.
   - If order is failed immediately, cart can remain for customer retry.

6. Add server-side checkout idempotency key in same phase or before frontend double-submit fix.

### Acceptance Criteria

- No external Midtrans API call inside DB transaction.
- DB locks cover only local writes.
- Snap failure releases reservation or leaves safe retry state.
- Cart is not lost on Snap failure unless recoverable retry exists.
- Checkout still returns Snap redirect/token on success.

## Issue 6: Biteship Order API Called Inside DB Transaction

### Risk

External shipment can exist while local DB rolls back. Duplicate/orphan shipment risk.

### Target Files

- `app/Services/Admin/ShipmentManagementService.php`
- `app/Services/Integrations/BiteshipService.php`
- `database/migrations/2026_04_30_000016_create_shipments_table.php`
- Optional new: `app/Actions/Shipments/CreateBiteshipShipmentAction.php`

### Technical Plan

1. Split shipment creation into three steps.

2. Step A: local preparation transaction.
   - Lock order row with `lockForUpdate()`.
   - Lock shipment row with `lockForUpdate()`.
   - Verify payment is `paid`.
   - Verify shipment status is `not_created`, `failed`, or safe retry state.
   - Set shipment status to `creating`.
   - Store `creating_at` timestamp.
   - Commit.

3. Step B: external Biteship call outside transaction.
   - Build payload from committed order snapshot.
   - Use stable idempotency/reference field:
     - `reference_id = order.order_number`
     - If Biteship supports idempotency key/header, use deterministic key from order/shipment ID.
   - Call create order API.

4. Step C: local persistence transaction.
   - Lock shipment row again.
   - Persist provider IDs, waybill, tracking ID, courier data, raw response.
   - Set normalized shipping status from provider response.
   - Set order status accordingly.
   - Commit.

5. If Biteship call fails:
   - Mark shipment `failed` or `create_failed`.
   - Store failure reason.
   - Keep order paid and unshipped.
   - Allow safe retry.

6. Add duplicate guard:
   - Unique `shipments.order_id`.
   - Unique/index provider IDs where available.
   - Lock order/shipment before changing `creating` state.

### Acceptance Criteria

- No Biteship API call inside DB transaction.
- Double-click admin create shipment cannot create duplicate local shipment rows.
- Failed Biteship call leaves retryable state.
- Provider response is persisted in separate short transaction.

## Issue 7: Biteship Webhook Auth Bypass If Secret Missing

### Risk

Anyone can forge shipment status and mark orders delivered/cancelled.

### Target Files

- `app/Http/Controllers/Customer/BiteshipWebhookController.php`
- `routes/api.php`
- `config/services.php`
- `.env.example` if present

### Technical Plan

1. Fail closed outside local/test environments.

2. Required config:
   - `services.biteship.webhook_secret`

3. If secret missing:
   - In `local` or `testing`: allow only if explicitly configured for test bypass.
   - In `production`, `staging`, or any non-local env: return `401` or `403`, log security warning, do not process.

4. Remove query string secret support.

5. Require header-based authentication:
   - Preferred: HMAC signature header if Biteship supports it.
   - Acceptable fallback: static shared secret header, e.g. `X-Biteship-Webhook-Secret`.

6. Use `hash_equals()` for secret comparison.

7. Add replay protection if payload has event ID or timestamp:
   - Store payload hash/event ID in webhook log.
   - Ignore duplicates.

### Acceptance Criteria

- Missing secret in production rejects webhook.
- Wrong secret rejects webhook.
- Query string secret no longer authenticates webhook.
- Valid header secret processes webhook.
- Duplicate event is ignored if event ID/hash exists.

## Issue 8: Shipment Creation Duplicate Race, No Unique `shipments.order_id`

### Risk

Two admin clicks can create duplicate local/provider shipments.

### Target Files

- `app/Services/Admin/ShipmentManagementService.php`
- `database/migrations/2026_04_30_000016_create_shipments_table.php`
- `app/Models/Order.php`
- `app/Models/Shipment.php`

### Technical Plan

1. Confirm intended model: one shipment per order.

2. Add DB unique constraint:
   - `shipments.order_id` unique.

3. Add provider identifier constraints/indexes:
   - `biteship_order_id` unique nullable if provider guarantees uniqueness.
   - `biteship_tracking_id` indexed or unique nullable depending provider behavior.
   - `waybill_id` indexed or unique nullable depending courier/provider behavior.

4. In shipment creation service:
   - Lock order row.
   - Use existing shipment row or create one with unique constraint handling.
   - Transition `not_created/failed` to `creating` before external call.
   - Reject or no-op if current status is `creating`, `confirmed`, `allocated`, `picked`, `in_transit`, `delivered`.

5. Handle unique violation gracefully:
   - Re-query shipment.
   - Return existing shipment state.
   - Do not call provider again.

### Acceptance Criteria

- DB prevents multiple shipment rows for one order.
- Concurrent create requests result in one active shipment.
- Existing shipment in `creating` prevents second provider call.
- Admin receives clear current state.

## Issue 9: Voucher Usage Check Not Atomic

### Risk

Voucher usage limit can be exceeded under concurrent payments/checkouts.

### Target Files

- `app/Services/Customer/CheckoutService.php`
- `app/Services/Customer/MidtransWebhookService.php`
- `database/migrations/2026_04_30_000010_create_vouchers_table.php`
- New optional: `database/migrations/*_create_voucher_redemptions_table.php`

### Technical Plan

1. Choose redemption timing:
   - Preferred: reserve/redeem voucher at checkout order creation, release on payment failure/expiry if business wants unpaid orders not to consume usage.
   - Alternative: increment usage only when payment becomes paid, with strict lock.

2. Recommended design: add `voucher_redemptions` table.

3. `voucher_redemptions` columns:
   - `id`
   - `voucher_id`
   - `order_id`
   - `user_id`
   - `status` (`reserved`, `redeemed`, `released`)
   - `discount_amount`
   - `reserved_at`
   - `redeemed_at`
   - `released_at`
   - timestamps

4. Constraints:
   - unique `order_id`
   - index `voucher_id,status`
   - optional unique per user/voucher/order policy

5. Atomic checkout reservation:
   - Lock voucher row with `lockForUpdate()`.
   - Count usage/reserved according to business policy.
   - Ensure limit not exceeded.
   - Create redemption row as `reserved`.
   - Increment `used_count` only if this remains current denormalized source.

6. Payment paid:
   - Transition redemption `reserved` to `redeemed`.
   - No second increment if increment already happened at reservation.

7. Payment failed/expired/cancelled:
   - Transition redemption `reserved` to `released`.
   - Decrement `used_count` if reservation increments it.

8. Minimal alternative if table deferred:
   - Inside checkout transaction, lock voucher row.
   - Guarded update: `whereColumn('used_count', '<', 'usage_limit')` or equivalent.
   - Check affected row count.
   - Roll back if zero.

### Acceptance Criteria

- Concurrent checkouts cannot exceed voucher usage limit.
- Failed/expired unpaid order does not permanently consume voucher unless business explicitly wants that.
- Duplicate webhook does not double-increment usage.
- Voucher usage state is auditable per order.

## Issue 10: Status Fields Raw Strings, Inconsistent Values

### Risk

Invalid transitions, wrong dashboard counts, bad operational decisions.

### Target Files

- `app/Services/Admin/OrderManagementService.php`
- `app/Services/Admin/ShipmentManagementService.php`
- `app/Services/Customer/MidtransWebhookService.php`
- `app/Services/Admin/PaymentManagementService.php`
- `database/migrations/2026_04_30_000011_create_orders_table.php`
- `database/migrations/2026_04_30_000014_create_payments_table.php`
- `database/migrations/2026_04_30_000016_create_shipments_table.php`
- New: `app/Enums/OrderStatus.php`
- New: `app/Enums/PaymentStatus.php`
- New: `app/Enums/ShippingStatus.php`

### Technical Plan

1. Add enums for all core statuses.

2. `PaymentStatus` values:
   - `pending`
   - `paid`
   - `manual_review`
   - `failed`
   - `cancelled`
   - `expired`
   - `refunded`
   - `partially_refunded`

3. `OrderStatus` values:
   - `pending_payment`
   - `paid`
   - `processing`
   - `ready_to_ship`
   - `shipment_created`
   - `shipped`
   - `delivered`
   - `completed`
   - `cancelled`
   - `payment_failed`
   - `payment_expired`
   - `shipment_failed`
   - `shipment_problem`
   - `lost`
   - `returned`
   - `refunded`

4. `ShippingStatus` values:
   - `not_created`
   - `creating`
   - `confirmed`
   - `allocated`
   - `picked`
   - `in_transit`
   - `delivered`
   - `cancelled`
   - `failed`
   - `problem`
   - `lost`
   - `returned`

5. Replace string arrays in services with enum methods:
   - `PaymentStatus::terminalFailureStatuses()`
   - `ShippingStatus::activeStatuses()`
   - `OrderStatus::fulfillmentStatuses()`

6. Add transition guards:
   - Payment cannot regress from `paid` to unpaid failure states.
   - Order cannot ship before payment paid.
   - Order cannot complete before shipment delivered.
   - Unpaid cancellation/expiry must release stock.

7. Add DB check constraints when supported by DB platform.

8. If SQLite tests or MySQL versions differ, add app-layer validation plus conditional migration support.

### Acceptance Criteria

- No duplicated hardcoded status lists remain in critical services.
- Invalid payment/order/shipment transitions are rejected or ignored safely.
- Dashboard status counts use shared enum status groups.
- DB prevents invalid status strings where supported.

## Issue 11: `payments.order_id` Not Unique But Model Uses `HasOne`

### Risk

Multiple payments per order can exist; webhook/admin sync may update unexpected payment.

### Target Files

- `database/migrations/2026_04_30_000014_create_payments_table.php`
- `app/Models/Order.php`
- `app/Models/Payment.php`
- Payment lookup services

### Decision Needed

Recommended for current code: enforce one payment per order because model uses `HasOne` and checkout appears designed for one payment row.

### Technical Plan

1. Before adding unique constraint, add data cleanup migration or deployment pre-check:
   - Find duplicate `payments.order_id` groups.
   - Abort deployment or consolidate manually if production data exists.

2. Add unique index:
   - `payments.order_id` unique.

3. Add unique/index for provider reference:
   - `midtrans_order_id` unique if present.
   - `midtrans_transaction_id` indexed or unique depending Midtrans behavior.

4. Update creation flow:
   - Use `firstOrCreate` or explicit unique handling around payment creation.
   - Do not create second payment for same order.

5. Update webhook lookup:
   - Resolve by Midtrans order ID first.
   - Ensure resolved payment belongs to expected order.

### Acceptance Criteria

- DB prevents more than one payment per order.
- Checkout duplicate submission does not create two payment rows.
- Webhook lookup is deterministic.
- Admin payment pages do not show duplicate payment ambiguity.

## Issue 12: `shipments.order_id` Not Unique But Model Uses `HasOne`

### Risk

Multiple shipment rows per order can exist; status updates become ambiguous.

### Target Files

- `database/migrations/2026_04_30_000016_create_shipments_table.php`
- `app/Models/Order.php`
- `app/Models/Shipment.php`
- `app/Services/Admin/ShipmentManagementService.php`

### Decision Needed

Recommended for current code: enforce one shipment per order because model uses `HasOne` and checkout creates one shipment row.

### Technical Plan

1. Before adding unique constraint, add pre-check:
   - Find duplicate `shipments.order_id` groups.
   - Abort deployment or require manual cleanup if duplicates exist.

2. Add unique index:
   - `shipments.order_id` unique.

3. Update checkout:
   - Create one `not_created` shipment row per order.

4. Update admin shipment creation:
   - Reuse existing shipment row.
   - Do not create new shipment row if one exists.

5. Update webhook lookup:
   - Find by provider IDs first.
   - Fall back to order reference only if unambiguous.

### Acceptance Criteria

- DB prevents more than one shipment per order.
- Concurrent shipment creation cannot produce duplicates.
- Webhook updates exactly one shipment.

## Database Migration Plan

### New Constraints

Add migrations instead of editing historical migrations if database may already be installed.

Required constraints/indexes:

- `payments.order_id` unique.
- `shipments.order_id` unique.
- `product_variants.stock >= 0` check.
- `product_variants.reserved_stock >= 0` check.
- `product_variants.reserved_stock <= product_variants.stock` check.
- `orders.payment_status` allowed values check.
- `orders.order_status` allowed values check.
- `orders.shipping_status` allowed values check.
- `payments.payment_status` allowed values check.
- `shipments.shipping_status` allowed values check.
- `payment_logs.payload_hash` unique or indexed unique if event ID absent.
- `biteship_webhook_logs.payload_hash` unique or indexed unique if event ID absent.

### New Columns To Consider

- `orders.stock_reserved_at`
- `orders.stock_released_at`
- `orders.stock_finalized_at`
- `payments.expires_at`
- `payments.last_synced_at`
- `payments.failure_reason`
- `shipments.creating_at`
- `shipments.failed_reason`
- `shipments.last_synced_at`

### Pre-Deployment Data Checks

Run before unique constraints:

```sql
SELECT order_id, COUNT(*) FROM payments GROUP BY order_id HAVING COUNT(*) > 1;
SELECT order_id, COUNT(*) FROM shipments GROUP BY order_id HAVING COUNT(*) > 1;
SELECT id, stock, reserved_stock FROM product_variants WHERE stock < 0 OR reserved_stock < 0 OR reserved_stock > stock;
SELECT id, payment_status, order_status, shipping_status FROM orders WHERE payment_status IS NULL OR order_status IS NULL OR shipping_status IS NULL;
```

If any query returns rows, fix data before applying constraints.

## Refactor Architecture

### New Shared Actions

Add focused actions so webhook/admin/checkout paths cannot diverge:

- `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php`
- `app/Actions/Stock/FinalizeReservedStockAction.php`
- `app/Actions/Stock/ReleaseStockReservationAction.php`
- `app/Actions/Shipments/CreateBiteshipShipmentAction.php`
- `app/Actions/Shipments/ApplyBiteshipShipmentStatusAction.php`

### Transaction Rules

- Local DB state changes: inside transaction.
- External API calls: outside transaction.
- `lockForUpdate()`: only inside short transactions.
- Provider webhook handlers: validate first, then lock local rows, then mutate.

### Idempotency Rules

- Midtrans webhook: unique event ID or payload hash.
- Biteship webhook: unique event ID or payload hash.
- Checkout: server idempotency key or unique checkout token.
- Shipment creation: unique `shipments.order_id` plus `creating` state guard.
- Stock finalization/release: guarded by order columns or state transitions.

## Testing Plan

Use Pest feature/unit tests for critical behavior.

### Payment Tests

- Midtrans webhook rejects invalid signature.
- Midtrans webhook rejects amount mismatch.
- Midtrans `capture` + `fraud_status=challenge` does not mark paid.
- Midtrans `capture` + `fraud_status=accept` marks paid.
- Midtrans `settlement` marks paid once.
- Duplicate paid webhook does not decrement stock twice.
- Late `expire` after `paid` does not regress state.
- Admin payment sync uses same payment state action.
- Admin payment sync failure releases reserved stock.

### Stock Tests

- Paid finalization requires `stock >= quantity`.
- Paid finalization requires `reserved_stock >= quantity`.
- Oversell invariant failure is not clamped.
- Failed payment releases reserved stock once.
- Duplicate failure webhook does not release twice.

### Checkout Tests

- Checkout does not call Midtrans inside transaction.
- Snap creation failure leaves safe order/payment state.
- Snap creation failure releases reservation or preserves retry state according to chosen policy.
- Double submit with same idempotency key creates one order/payment.
- Checkout cannot use stale shipping rate.
- Checkout cannot use shipping rate from another address/cart hash.

### Shipment Tests

- Biteship webhook rejects missing secret in non-local env.
- Biteship webhook rejects query secret.
- Biteship webhook accepts valid header secret.
- Duplicate Biteship webhook event is ignored.
- Unknown Biteship status maps to `problem`.
- Shipment creation external API is outside DB transaction.
- Concurrent shipment creation creates one local shipment.
- Failed shipment creation is retryable.

### Database Tests

- `payments.order_id` unique constraint works.
- `shipments.order_id` unique constraint works.
- `product_variants.reserved_stock <= stock` constraint works where supported.
- Invalid status strings are rejected where supported.

## Implementation Checklist

### Payment Hardening

- [ ] Add payment/order/Midtrans enums.
- [ ] Add shared Midtrans status apply action.
- [ ] Validate required webhook payload fields.
- [ ] Validate signature before lookup/mutation.
- [ ] Validate `gross_amount` against local payment.
- [ ] Add fraud-status-aware `capture` mapping.
- [ ] Prevent paid state regression.
- [ ] Add payment webhook payload hash/event idempotency.
- [ ] Reuse same action from admin payment sync.

### Stock Safety

- [ ] Add shared reservation release action.
- [ ] Add shared reserved-stock finalization action.
- [ ] Remove `max(0, stock - qty)` clamp.
- [ ] Enforce row locks for variants.
- [ ] Add idempotency guard for stock finalization/release.
- [ ] Add DB stock check constraints.

### Checkout Transaction Safety

- [ ] Split local order creation transaction from Midtrans Snap call.
- [ ] Handle Snap success in separate short transaction.
- [ ] Handle Snap failure with stock release or retry state.
- [ ] Add server idempotency key.
- [ ] Add frontend double-submit guard if touching checkout UI.

### Biteship Security And Idempotency

- [ ] Fail closed when webhook secret missing outside local/testing.
- [ ] Remove query-string secret support.
- [ ] Require header/HMAC auth.
- [ ] Add Biteship webhook event hash/idempotency.
- [ ] Add shipping enums/status mapping.
- [ ] Map unknown provider statuses to `problem`.

### Shipment Creation Safety

- [ ] Add unique `shipments.order_id`.
- [ ] Add provider ID indexes/unique constraints as safe.
- [ ] Lock order/shipment before setting `creating`.
- [ ] Call Biteship outside DB transaction.
- [ ] Persist provider response in new transaction.
- [ ] Store failure reason and allow retry.

### Voucher Atomicity

- [ ] Add `voucher_redemptions` table or guarded atomic voucher update.
- [ ] Lock voucher row during checkout/payment transition.
- [ ] Make redemption/release idempotent.
- [ ] Add concurrency test.

### Status Consistency

- [ ] Add order/payment/shipping enums.
- [ ] Replace raw status arrays in services.
- [ ] Add state transition guards.
- [ ] Add DB status check constraints.
- [ ] Update dashboard status groups to use enum methods.

## Suggested Pull Request Breakdown

### PR 1: Status And Constraint Foundation

- Add enums.
- Add DB pre-checks/constraints.
- Add unique payment/shipment order constraints.
- Add basic enum tests.

Reason: reduces invalid data before behavior changes.

### PR 2: Payment And Stock Safety

- Add shared payment state action.
- Harden Midtrans webhook.
- Reuse action in admin payment sync.
- Add stock release/finalize actions.
- Add payment/stock tests.

Reason: highest financial/inventory risk.

### PR 3: Checkout Transaction Refactor

- Move Midtrans Snap outside DB transaction.
- Add checkout idempotency.
- Add Snap failure handling.
- Add checkout tests.

Reason: reduces lock/deadlock risk after payment logic is safe.

### PR 4: Shipment And Biteship Safety

- Fail closed webhook auth.
- Move Biteship create outside DB transaction.
- Add shipment idempotency and duplicate guards.
- Add Biteship status mapping.
- Add shipment/webhook tests.

Reason: prevents forged and duplicate shipment state.

### PR 5: Voucher Atomicity And Final Regression

- Add voucher redemption or atomic update.
- Add concurrency/idempotency tests.
- Run full regression suite.

Reason: closes remaining critical race.

## Verification Commands

Run after each PR or phase:

```bash
php artisan test
```

If project uses Pest directly:

```bash
./vendor/bin/pest
```

Run targeted tests during development:

```bash
php artisan test --filter=Midtrans
php artisan test --filter=Checkout
php artisan test --filter=Stock
php artisan test --filter=Biteship
php artisan test --filter=Shipment
php artisan test --filter=Voucher
```

Run migration checks in disposable database before production deployment:

```bash
php artisan migrate:fresh --seed
php artisan test
```

## Deployment Plan

1. Deploy code with backward-compatible enum readers if existing rows use current strings.
2. Run pre-deployment data checks for duplicate payment/shipment rows and invalid stock.
3. Fix any invalid data manually or with audited migration.
4. Apply new migrations.
5. Enable webhook secret in environment before enabling Biteship webhook route in non-local env.
6. Verify Midtrans webhook with sandbox event.
7. Verify Biteship webhook with sandbox/test event.
8. Run smoke checkout in staging:
   - Create cart.
   - Select address/rate.
   - Place order.
   - Complete Midtrans settlement.
   - Confirm stock finalization.
   - Create shipment.
   - Apply shipment webhook.
9. Monitor logs for:
   - `amount_mismatch`
   - `invalid_signature`
   - `stock_invariant_failed`
   - `duplicate_webhook_ignored`
   - `shipment_create_failed`

## Rollback Plan

Security-sensitive changes should not be rolled back blindly.

If deployment fails before migrations:

- Revert application deployment.
- Keep webhook secrets configured.

If deployment fails after constraints:

- Do not drop constraints unless confirmed they block valid data.
- Patch application code forward when possible.
- If unique constraints fail during migration, stop deployment and clean duplicate data.

If Midtrans webhook hardening rejects legitimate sandbox events:

- Inspect logged normalized payload.
- Validate amount formatting and order ID mapping.
- Patch normalization/lookup.
- Do not disable signature or amount checks in production.

If Biteship webhook auth rejects legitimate events:

- Verify header name and secret.
- Patch accepted header/HMAC format.
- Do not re-enable query-string secret in production.

## Completion Definition

Critical remediation is complete when:

- All 12 critical audit issues have code fixes merged.
- DB constraints protect payment/shipment uniqueness and stock invariants.
- Midtrans webhook validates signature, amount, fraud status, idempotency, and state transitions.
- Stock finalize/release logic is shared, locked, and idempotent.
- Checkout and shipment creation no longer call external APIs inside DB transactions.
- Biteship webhook fails closed without valid auth.
- Voucher usage is atomic under concurrency.
- Status enums/state guards replace raw string logic in critical flows.
- Critical tests pass reliably.
- Staging smoke test passes from checkout through payment and shipment.

## Out Of Scope For This Critical Plan

These should be handled after critical fixes:

- Admin action-needed dashboard cards.
- Full status history timeline UI.
- Refund/return operational workflow.
- Buy Now feature cleanup.
- Wishlist wiring.
- Product image optimization.
- General TypeScript `any` cleanup.
- Non-critical UX empty states.
