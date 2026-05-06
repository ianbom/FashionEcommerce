# High Priority Issues Remediation Plan

Source audit: `CODEBASE_AUDIT_REPORT.md`
Scope: all items in `## 3. High Priority Issues`.
Goal: close operational, security, checkout, shipment, and admin UX risks after critical issue remediation.

## Summary

High priority issues focus on production operability after critical safety fixes:

- Admin payment reconciliation must call Midtrans API, not reuse stale local status.
- Checkout shipping rates must bind to address/cart and expire.
- Payment expiry must not rely on webhook only.
- Stock and status transitions need stronger guards.
- Admin/security controls need throttling, safe authorization behavior, and mass-assignment hardening.
- Admin mutation links must use mutation methods.
- Checkout and shipment flows need idempotency and provider payload correctness.
- Product form image handling must avoid persisting blob preview URLs.

## Remediation Principles

- Keep external API calls outside database transactions.
- Use shared enums and state actions instead of raw status strings.
- Prefer fail-closed behavior for security-sensitive flows.
- Store enough audit metadata to diagnose provider failures.
- Make user-triggered mutations idempotent.
- Add tests for each behavior before marking issue closed.

## Phase Order

1. Payment reconciliation and expiry jobs.
2. Checkout shipping-rate binding, TTL, and idempotency.
3. Stock and status transition guards.
4. Biteship status, webhook locking, and weight correctness.
5. Admin security hardening.
6. Frontend mutation method fixes.
7. Product form image safety.
8. Regression tests and verification.

## Issue 1: Admin Payment Sync Does Not Call Midtrans Status API

### Risk

Admin thinks payment was synced, but local state may still be stale.

### Target Files

- `app/Services/Admin/PaymentManagementService.php`
- `app/Services/Integrations/MidtransService.php`
- `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php`
- `database/migrations/*payments*` if extra columns needed
- `tests/Feature/Admin/PaymentSyncTest.php`

### Technical Plan

1. Add Midtrans status API method:

```php
public function transactionStatus(string $midtransOrderId): array
```

2. Call endpoint:

```text
GET /v2/{order_id}/status
```

3. Validate response has:

- `order_id`
- `transaction_status`
- `gross_amount`
- `status_code`
- optional `fraud_status`

4. Compare provider `order_id` with `payments.midtrans_order_id`.

5. Compare provider `gross_amount` with `payments.gross_amount` using same normalization as webhook.

6. Reuse `ApplyMidtransPaymentStatusAction` for local status mutation.

7. Store sync log in `payment_logs`:

- `event_type = admin_sync`
- `transaction_status`
- payload from Midtrans
- `processed_at`

8. Update `payments.last_synced_at` and `payments.raw_response`.

9. On amount/reference mismatch:

- Do not mutate order/payment.
- Write rejected log.
- Show admin error.

### Acceptance Criteria

- Admin sync calls Midtrans HTTP API.
- Wrong amount response does not mark paid.
- Sync uses same state machine as webhook.
- Failed/expired provider status releases reserved stock.
- `last_synced_at` updates after successful sync.

### Tests

- Admin sync calls `/v2/{order_id}/status`.
- Admin sync rejects amount mismatch.
- Admin sync settlement marks paid and finalizes stock once.
- Admin sync expire releases reserved stock.
- Late expire after paid does not regress state.

## Issue 2: Checkout Selected Shipping Rate Not Bound To Selected Address

### Risk

Rate calculated for address A can be used while placing order for address B.

### Target Files

- `app/Services/Customer/CheckoutService.php`
- `app/Http/Requests/Customer/PlaceOrderRequest.php`
- `resources/js/contexts/checkout-context.tsx`
- `tests/Feature/Customer/CheckoutShippingRateTest.php`

### Technical Plan

1. When shipping rates are fetched, store session payload:

```php
session([
    'checkout.shipping_rates' => $rates,
    'checkout.customer_address_id' => $address->id,
    'checkout.cart_hash' => $this->cartHash($items),
    'checkout.rates_generated_at' => now()->toIso8601String(),
]);
```

2. Add `cartHash()` helper based on stable cart fields:

- cart item IDs
- product variant IDs
- quantities
- price snapshots
- selected voucher code if included in shipping-relevant calculation

3. During `selectShippingRate()`, persist selected rate plus binding:

- `shipping_rate_id`
- `customer_address_id`
- `cart_hash`
- `selected_at`

4. During `placeOrder()` validate:

- payload `customer_address_id` equals session `checkout.customer_address_id`
- current cart hash equals session `checkout.cart_hash`
- selected rate exists in session and matches `shipping_rate_id`

5. If mismatch, reject with validation message requiring customer to recalculate shipping.

### Acceptance Criteria

- Rate for address A cannot be used with address B.
- Cart quantity change invalidates selected rate.
- Cart item removal invalidates selected rate.
- Customer gets clear “Pilih ulang ongkir” message.

### Tests

- Place order rejects shipping rate from another address.
- Place order rejects rate after cart quantity changes.
- Place order succeeds when address/cart hash matches.

## Issue 3: Session-Stored Biteship Rate Can Go Stale

### Risk

Customer pays old/wrong shipping cost.

### Target Files

- `app/Services/Customer/CheckoutService.php`
- `config/services.php` or site settings
- `tests/Feature/Customer/CheckoutShippingRateTest.php`

### Technical Plan

1. Add configurable TTL:

```env
CHECKOUT_SHIPPING_RATE_TTL_MINUTES=15
```

2. Store `checkout.rates_expires_at` when rates generated.

3. In `placeOrder()`, reject if current time is after expiry.

4. Optional stronger mode: re-fetch selected Biteship rate at checkout and compare price/courier fields.

5. If revalidation API fails:

- fail safe and ask user to retry shipping rate.
- do not place order with stale rate.

### Acceptance Criteria

- Expired rate cannot be used.
- Missing rate timestamp cannot be used.
- User must recalculate shipping after TTL.

### Tests

- Checkout rejects expired rate.
- Checkout rejects missing selected rate.
- Checkout accepts fresh rate.

## Issue 4: Payment Expiry Relies On Webhook Only

### Risk

Reserved stock stays forever if Midtrans expiry webhook never arrives.

### Target Files

- `app/Jobs/Payments/SyncExpiredMidtransPaymentsJob.php`
- `app/Console/Kernel.php` or `routes/console.php`, depending Laravel version
- `app/Services/Integrations/MidtransService.php`
- `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php`
- `tests/Feature/Payments/PaymentExpirySyncTest.php`

### Technical Plan

1. Ensure payment expiry timestamp exists:

- use `payments.expired_at` if semantically provider expiry.
- add `payments.expires_at` if needed to avoid confusion with actual expired event time.

2. Add job:

```php
SyncExpiredMidtransPaymentsJob
```

3. Query pending/manual-review payments older than expiry threshold:

- `transaction_status in pending/authorize`
- `payment_status in pending/manual_review` via order relation
- not paid
- not terminal failed/cancelled/expired

4. For each payment:

- call Midtrans status API
- validate order ID and amount
- apply shared status action
- update `last_synced_at`

5. If provider API unavailable:

- log failure
- leave state unchanged
- retry later

6. Schedule job every 5-15 minutes:

```php
Schedule::job(new SyncExpiredMidtransPaymentsJob)->everyTenMinutes()->withoutOverlapping();
```

### Acceptance Criteria

- Expired provider payment releases stock without webhook.
- Job does not regress paid orders.
- Job is safe to run repeatedly.
- External API errors do not corrupt local state.

### Tests

- Scheduled sync expires pending payment and releases reserved stock.
- Paid order ignored by expiry job.
- Duplicate job run is idempotent.

## Issue 5: Payment Status Can Regress After Paid

### Risk

Payment/order can become failed/cancelled after already paid due late webhook.

### Target Files

- `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php`
- `app/Enums/PaymentStatus.php`
- `app/Enums/MidtransTransactionStatus.php`
- `tests/Feature/Payments/PaymentStateMachineTest.php`

### Technical Plan

1. Define allowed transitions in one class/action:

```php
PaymentStateMachine
```

2. Terminal paid rules:

- `paid` cannot move to `pending`, `expired`, `cancelled`, `failed`.
- `paid` can move only to `refunded` or `partially_refunded` if refund flow accepted.

3. Manual review rules:

- `manual_review` can move to `paid` only after `settlement` or `capture accept`.
- `manual_review` can move to failed/cancelled if provider says deny/cancel/expire.

4. Write ignored transition logs:

- event type `ignored_regressive_transition`
- current status
- attempted status

5. Keep state machine used by webhook, admin sync, expiry job.

### Acceptance Criteria

- Late `expire` after paid ignored.
- Late `cancel` after paid ignored.
- Refund after paid allowed only through explicit mapping.
- Ignored transition gets logged.

### Tests

- Paid order ignores expire/cancel/deny/failure.
- Pending order can expire.
- Manual review can become paid on settlement.

## Issue 6: Product Variant `reserved_stock > stock` Allowed

### Risk

Available stock becomes negative and checkout/admin stock becomes unreliable.

### Target Files

- `app/Http/Requests/Admin/ProductRequest.php`
- `app/Services/Admin/ProductManagementService.php`
- `database/migrations/*product_variants*`
- `tests/Feature/Admin/ProductVariantValidationTest.php`

### Technical Plan

1. In product request validation, validate each variant:

- `stock >= 0`
- `reserved_stock >= 0`
- `reserved_stock <= stock`

2. Add request `after()` validation if nested array rules need cross-field comparison.

3. In product management service, enforce before save as defense-in-depth.

4. Confirm DB check exists:

```sql
reserved_stock <= stock
```

5. If DB check already exists in critical migration, add tests to prove it.

### Acceptance Criteria

- Admin cannot save variant with reserved stock greater than stock.
- Existing data violating invariant blocks migration/deployment or is cleaned before constraints.
- Error message points to offending variant row.

### Tests

- Product create rejects `reserved_stock > stock`.
- Product update rejects `reserved_stock > stock`.
- Valid variant passes.

## Issue 7: Admin Stock Adjustment Can Reduce Below Reserved Stock

### Risk

Admin can reduce stock below already reserved amount, causing paid settlement failure or oversell.

### Target Files

- `app/Services/Stock/StockService.php`
- `app/Http/Requests/Admin/StockAdjustmentRequest.php` if exists
- `tests/Feature/Admin/StockAdjustmentTest.php`

### Technical Plan

1. Under `lockForUpdate()`, calculate target stock.

2. Reject if:

```php
$newStock < $variant->reserved_stock
```

3. Return validation/domain error:

```text
Stock tidak boleh lebih kecil dari reserved stock.
```

4. Log rejected stock adjustment with admin ID, variant ID, old stock, target stock, reserved stock.

5. Preserve ability to increase stock.

### Acceptance Criteria

- Admin cannot reduce stock below reserved stock.
- Admin can reduce stock down to exactly reserved stock.
- Stock adjustment uses row lock.

### Tests

- Reject target stock below reserved.
- Accept target stock equal reserved.
- Accept increase stock.

## Issue 8: Order Status Transition Missing Full Validation

### Risk

Admin can skip business states and create invalid operational state.

### Target Files

- `app/Services/Admin/OrderManagementService.php`
- `app/Services/Admin/ShipmentManagementService.php`
- New: `app/Actions/Orders/TransitionOrderStatusAction.php`
- New: `app/Services/Orders/OrderStateMachine.php`
- `tests/Feature/Admin/OrderStatusTransitionTest.php`

### Technical Plan

1. Create central order transition action.

2. Define allowed order transitions:

| From | To | Guard |
|---|---|---|
| `pending_payment` | `paid` | payment paid action only |
| `pending_payment` | `payment_expired` | payment expired/cancelled action |
| `pending_payment` | `cancelled` | unpaid only |
| `paid` | `processing` | payment_status paid |
| `processing` | `ready_to_ship` | payment_status paid |
| `ready_to_ship` | `shipment_created` | shipment exists/creating/confirmed |
| `shipment_created` | `shipped` | provider/admin shipment picked/in_transit |
| `shipped` | `delivered` | shipping_status delivered |
| `delivered` | `completed` | delivered only |

3. Define forbidden transitions:

- ship before payment paid.
- complete before delivered.
- cancel paid without refund/manual flow.
- move backwards from delivered/completed without explicit return/refund flow.

4. Make admin order update use this action.

5. Make shipment status application update order through same action or shared mapping.

### Acceptance Criteria

- Invalid admin transition rejected with clear message.
- Shipment events cannot make unpaid order shipped.
- Completed only after delivered.
- Paid cancellation blocked unless refund flow exists.

### Tests

- Admin cannot move pending payment to shipped.
- Admin cannot complete before delivered.
- Admin can move paid to processing.
- Admin unpaid cancellation releases stock.

## Issue 9: Biteship Status Mapping Defaults Unknown To `confirmed`

### Risk

Lost/returned/problem statuses are hidden as normal fulfillment.

### Target Files

- `app/Services/Admin/ShipmentManagementService.php`
- `app/Enums/ShippingStatus.php`
- Optional: `app/Enums/BiteshipStatus.php`
- `tests/Unit/BiteshipStatusMappingTest.php`

### Technical Plan

1. Create explicit map for provider statuses:

| Biteship Status | Local Shipping Status | Local Order Status |
|---|---|---|
| `confirmed` | `confirmed` | `ready_to_ship` |
| `allocated` | `allocated` | `ready_to_ship` |
| `courier_assigned` | `allocated` | `ready_to_ship` |
| `picking_up` | `allocated` or `picked` | `ready_to_ship` |
| `picked` | `picked` | `shipped` |
| `picked_up` | `picked` | `shipped` |
| `dropping_off` | `in_transit` | `shipped` |
| `on_process` | `in_transit` | `shipped` |
| `on_delivery` | `in_transit` | `shipped` |
| `delivered` | `delivered` | `delivered` |
| `cancelled` / `canceled` | `cancelled` | `shipment_failed` or `cancelled` by policy |
| `returned` | `returned` | `returned` |
| `lost` | `lost` | `lost` |
| `disposed` | `problem` or `lost` | `shipment_problem` or `lost` |
| `on_hold` | `problem` | `shipment_problem` |
| unknown | `problem` | `shipment_problem` |

2. Never default unknown to `confirmed`.

3. Log unknown provider status.

4. Notify admin for `problem`, `lost`, `returned`, `failed`, `cancelled`.

### Acceptance Criteria

- Unknown Biteship status maps to `problem`.
- Lost maps to `lost`.
- Returned maps to `returned`.
- On-hold maps to `problem`.

### Tests

- Unit mapping tests for every known status.
- Unknown status creates problem mapping.

## Issue 10: Biteship Webhook Updates Stale Model, No Row Lock

### Risk

Concurrent admin refresh/webhook can overwrite newer status.

### Target Files

- `app/Http/Controllers/Customer/BiteshipWebhookController.php`
- `app/Services/Admin/ShipmentManagementService.php`
- `database/migrations/*shipment_trackings*`
- `tests/Feature/Customer/BiteshipWebhookTest.php`

### Technical Plan

1. Controller can find shipment by identifiers, but mutation service must re-query with lock.

2. In `applyBiteshipPayload()`:

```php
$shipment = Shipment::query()
    ->with('order')
    ->whereKey($shipment->id)
    ->lockForUpdate()
    ->firstOrFail();
```

3. Store provider event timestamp if available:

- `provider_happened_at`
- `event_id` or payload hash

4. Ignore stale event if provider timestamp older than latest tracking event.

5. If no timestamp exists, rely on status rank only for forward movement unless status is terminal problem/lost/returned.

6. Add duplicate payload hash/event ID guard.

### Acceptance Criteria

- Webhook applies update under row lock.
- Older provider event does not overwrite newer shipment state.
- Duplicate event ignored.
- Concurrent refresh/webhook cannot regress delivered to in_transit.

### Tests

- Webhook locks and updates shipment.
- Stale event ignored.
- Delivered shipment does not regress to in_transit.

## Issue 11: Admin Login Has No Explicit Throttle

### Risk

Admin brute force/password spraying.

### Target Files

- `routes/web.php`
- `app/Http/Controllers/Admin/Auth/LoginController.php`
- `app/Providers/AppServiceProvider.php` or `RouteServiceProvider` depending version
- `tests/Feature/Admin/AdminLoginThrottleTest.php`

### Technical Plan

1. Add rate limiter:

```php
RateLimiter::for('admin-login', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip().'|'.Str::lower($request->input('email')));
});
```

2. Attach middleware to `POST /admin/login`:

```php
->middleware('throttle:admin-login')
```

3. Return generic failure response for throttled attempts.

4. Keep normal Laravel auth throttling if present, but explicit route throttle must exist.

### Acceptance Criteria

- More than allowed failed attempts get HTTP 429.
- Throttle key includes IP and email.
- Successful login still works.

### Tests

- 6 failed attempts trigger 429.
- Attempts for different email/IP have separate limits where testable.

## Issue 12: Admin Role Middleware Redirects Back Instead Of 403/Login

### Risk

Bad access-control behavior, redirect loops, weak API signal.

### Target Files

- `app/Http/Middleware/EnsureUserIsAdmin.php`
- `routes/web.php`
- `tests/Feature/Admin/AdminAccessTest.php`

### Technical Plan

1. If unauthenticated:

- redirect to admin login for web requests.
- return 401 JSON for JSON/API requests.

2. If authenticated but not admin or inactive:

- `abort(403)`.

3. Do not redirect back for forbidden users.

4. Ensure inactive admin also receives 403 or logout+login by chosen policy.

### Acceptance Criteria

- Guest admin page redirects to admin login.
- Customer account gets 403 on admin page.
- Inactive admin gets 403.
- No redirect loop.

### Tests

- Guest redirected.
- Customer forbidden.
- Inactive admin forbidden.
- Active admin allowed.

## Issue 13: Global `User` Fillable Includes `role`, `is_active`

### Risk

Future mass assignment misuse can escalate role or activate accounts.

### Target Files

- `app/Models/User.php`
- Admin user/customer services using user creation/update
- `tests/Feature/Admin/UserMassAssignmentTest.php`

### Technical Plan

1. Remove from `$fillable`:

- `role`
- `is_active`

2. Set role and active status explicitly in trusted admin-only flows:

```php
$user->forceFill(['role' => 'admin'])->save();
```

or explicit service assignment after authorization.

3. Review all `User::create($request->validated())` and `$user->update($request->validated())` flows.

4. Ensure registration creates customer role through model default or explicit action.

### Acceptance Criteria

- Public registration cannot set role/admin active fields.
- Generic `$user->update($request->validated())` cannot change role.
- Admin-only service can still manage activation if authorized.

### Tests

- Registration payload with `role=admin` still creates customer.
- Profile update cannot change role/is_active.
- Admin-approved action can toggle active status.

## Issue 14: Admin Product Nested IDs Not Ownership-Scoped

### Risk

Request can reference image/variant IDs from other products.

### Target Files

- `app/Http/Requests/Admin/ProductRequest.php`
- `app/Services/Admin/ProductManagementService.php`
- `tests/Feature/Admin/ProductNestedOwnershipTest.php`

### Technical Plan

1. In update request, resolve route product ID.

2. Validate nested image IDs:

```php
Rule::exists('product_images', 'id')->where('product_id', $productId)
```

3. Validate nested variant IDs:

```php
Rule::exists('product_variants', 'id')->where('product_id', $productId)
```

4. Service layer should still query/update through product relationships:

```php
$product->variants()->whereKey($id)->firstOrFail()
```

5. Never update nested records by global ID only.

### Acceptance Criteria

- Product A update cannot mutate Product B variant/image.
- Invalid nested ID returns validation error.
- Product update continues working for owned nested IDs.

### Tests

- Reject foreign variant ID.
- Reject foreign image ID.
- Accept own variant/image ID.

## Issue 15: Mutating Admin Actions Rendered As GET Links

### Risk

Admin sync/refresh/toggle actions broken or unsafe; CSRF semantics wrong.

### Target Files

- `resources/js/pages/admin/payments/index.tsx`
- `resources/js/pages/admin/payments/show.tsx`
- `resources/js/pages/admin/shipments/index.tsx`
- `resources/js/pages/admin/shipments/show.tsx`
- `resources/js/pages/admin/customers/index.tsx`
- `resources/js/pages/admin/customers/show.tsx`
- `routes/web.php`

### Technical Plan

1. Replace mutation `<Link href>` with `<button>`.

2. Use Inertia router mutation methods:

```tsx
router.post(url, {}, { preserveScroll: true })
```

3. Add per-row/per-action loading state.

4. Disable button while processing.

5. Keep read-only navigation as `<Link>`.

6. Confirm backend routes use POST/PATCH/DELETE for mutations.

### Acceptance Criteria

- Payment sync uses POST.
- Shipment refresh uses POST.
- Customer toggle uses PATCH/POST.
- No mutation action uses GET link.
- Buttons show loading/disabled state.

### Tests

- Browser/feature test confirms GET mutation route not allowed.
- Component smoke test if available.

## Issue 16: Checkout Place Order Lacks Client And Server Idempotency

### Risk

Double-click can submit duplicate order attempts.

### Target Files

- `resources/js/contexts/checkout-context.tsx`
- `resources/js/pages/customer/checkout/checkout.tsx`
- `app/Http/Requests/Customer/PlaceOrderRequest.php`
- `app/Services/Customer/CheckoutService.php`
- `database/migrations/*checkout_idempotency*` or orders column migration
- `tests/Feature/Customer/CheckoutIdempotencyTest.php`

### Technical Plan

1. Add server idempotency key to place order request:

```php
'idempotency_key' => ['required', 'string', 'max:100']
```

2. Store key in database:

Option A: add `orders.checkout_idempotency_key` unique per user.

Option B: add `checkout_attempts` table with:

- user_id
- idempotency_key
- order_id
- status
- response snapshot

3. Recommended minimal approach:

- `orders.user_id, checkout_idempotency_key` unique composite.

4. In `placeOrder()`:

- check if order exists for same user/key.
- if exists and payment has redirect URL, return existing response.
- if exists but failed, return safe error or retry policy.
- if not exists, create order with key.

5. Frontend:

- generate key once when checkout page loads.
- store in component state/session storage.
- submit key with order.
- disable submit button while processing.

6. Clear idempotency key only after successful redirect response or cart reset.

### Acceptance Criteria

- Double-click creates one order.
- Retry same key returns same order/payment response.
- New cart checkout gets new key.
- Server protects even if client guard fails.

### Tests

- Same idempotency key creates one order.
- Same key returns existing redirect response.
- Different key can create new order only after business-valid flow.

## Issue 17: Biteship Rate Item Weight May Be Total Weight While Quantity Also Sent

### Risk

Provider may calculate item weight twice.

### Target Files

- `app/Services/Customer/CheckoutService.php`
- `app/Services/Admin/ShipmentManagementService.php`
- `app/Services/Integrations/BiteshipService.php`
- `tests/Unit/BiteshipPayloadTest.php`

### Technical Plan

1. Confirm Biteship contract:

- If API expects unit weight plus quantity, send unit weight.
- If API expects total package item weight, send quantity 1 or do not multiply.

2. Recommended likely fix:

- cart/rate item `weight = product.weight` per unit.
- order item snapshot may store unit weight and quantity separately.

3. In shipping rate payload:

```php
'weight' => max(1, (int) $product->weight),
'quantity' => $item->quantity,
```

4. In shipment create payload:

```php
'weight' => max(1, (int) $item->weight),
'quantity' => $item->quantity,
```

where `order_items.weight` must be unit weight.

5. If existing `order_items.weight` stores total weight, migrate naming or divide safely:

```php
unit_weight = max(1, intdiv(total_weight, quantity))
```

6. Prefer adding `unit_weight` column if historical clarity needed.

### Acceptance Criteria

- Payload does not multiply item weight twice.
- Shipping rate and shipment creation use same semantics.
- Tests document chosen Biteship contract.

### Tests

- Quantity 3, product weight 500 sends weight 500 and quantity 3.
- Shipment payload matches rate payload semantics.

## Issue 18: Product Form Can Submit Blob Preview As `image_url`

### Risk

Invalid blob URL can persist or fail upload.

### Target Files

- `resources/js/pages/admin/products/form.tsx`
- `app/Http/Requests/Admin/ProductRequest.php`
- `app/Services/Admin/ProductImageService.php`
- `tests/Feature/Admin/ProductImageUploadTest.php`

### Technical Plan

1. Separate preview state from form payload.

2. Use fields like:

```tsx
previewUrl
imageFile
existingImageUrl
```

3. Never submit `blob:` URL as `image_url`.

4. When user selects file:

- set preview URL with `URL.createObjectURL(file)`.
- store actual `File` object in form data.

5. On submit:

- send file field only.
- send existing server image path only if unchanged.

6. Backend validation:

- reject `image_url` starting with `blob:`.
- allow only local storage path or uploaded file.

7. Revoke object URL on cleanup:

```tsx
URL.revokeObjectURL(previewUrl)
```

### Acceptance Criteria

- Blob URL never persisted.
- New image uploads use file upload.
- Existing image URL remains unchanged when no new file selected.
- Backend rejects blob URL defensively.

### Tests

- Product update rejects `blob:` image URL.
- Product upload stores file path.
- Existing image retained if no new upload.

## Cross-Cutting Database Plan

### New/Confirmed Columns

- `payments.last_synced_at`
- `payments.failure_reason`
- `orders.payment_expires_at` or `payments.expires_at`
- `orders.checkout_idempotency_key` or `checkout_attempts.idempotency_key`
- `shipment_trackings.provider_happened_at`
- `shipment_trackings.payload_hash` or `event_id`
- optional `order_items.unit_weight`

### Indexes

- `orders(user_id, checkout_idempotency_key)` unique if using order column.
- `payments(transaction_status, created_at)` for expiry sync.
- `payments(last_synced_at)` for reconciliation queue.
- `shipment_trackings(shipment_id, provider_happened_at)`.
- `shipment_trackings(payload_hash)` unique if used.

## Suggested PR Breakdown

### PR 1: Payment Reconciliation And Expiry

- Midtrans status API method.
- Admin sync real API call.
- Scheduled expiry job.
- Payment state transition tests.

### PR 2: Checkout Rate Binding And Idempotency

- Cart hash helper.
- Shipping rate address/cart/TTL binding.
- Server idempotency key.
- Client double-submit guard.
- Checkout tests.

### PR 3: Stock And Status Guards

- Product variant reserved stock validation.
- Admin stock adjustment guard.
- Central order transition action.
- Related tests.

### PR 4: Shipment Robustness

- Biteship explicit status mapping.
- Webhook row locking and stale event handling.
- Weight semantics fix.
- Shipment tests.

### PR 5: Admin Security And UI Mutations

- Admin login throttle.
- Admin middleware 403/login behavior.
- Remove `role` and `is_active` from fillable.
- Fix admin mutation buttons.
- Security/admin tests.

### PR 6: Product Form Image Safety

- Separate image preview state.
- Backend blob URL rejection.
- Product image tests.

## Verification Commands

Run full suite:

```bash
php artisan test
```

Run focused suites:

```bash
php artisan test --filter=PaymentSync
php artisan test --filter=PaymentExpiry
php artisan test --filter=CheckoutShippingRate
php artisan test --filter=CheckoutIdempotency
php artisan test --filter=StockAdjustment
php artisan test --filter=OrderStatusTransition
php artisan test --filter=Biteship
php artisan test --filter=AdminLoginThrottle
php artisan test --filter=ProductImageUpload
```

If using MySQL test database, ensure `.env.testing` points to dedicated disposable database:

```env
APP_ENV=testing
DB_CONNECTION=mysql
DB_DATABASE=fashion_ecommerce_test
```

## Deployment Notes

1. Deploy payment sync and expiry jobs after critical payment webhook fixes are stable.
2. Ensure scheduler runs in target environment.
3. Set safe rate TTL before enforcing stale-rate rejection.
4. Add idempotency column/table before frontend starts sending idempotency keys.
5. Monitor logs for rejected payment sync, stale shipment events, invalid transitions, and stock adjustment rejects.
6. Keep provider API keys in `.env`, not frontend props.

## Completion Definition

High priority remediation is complete when:

- Admin payment sync calls Midtrans and validates amount/reference.
- Pending/expired payments are reconciled by scheduled job.
- Shipping rate is bound to address/cart and expires.
- Checkout has server and client idempotency.
- Payment/order/shipment transitions reject unsafe state changes.
- Product and admin stock flows enforce `reserved_stock <= stock`.
- Biteship unknown/problem statuses do not become normal statuses.
- Biteship webhook updates are locked and stale-safe.
- Admin login is throttled.
- Admin role middleware returns correct redirect/403 behavior.
- `role` and `is_active` are not mass assignable globally.
- Product nested IDs are ownership-scoped.
- Admin mutation actions use POST/PATCH/DELETE, not GET links.
- Biteship item weight semantics are correct and tested.
- Product form cannot persist blob preview URLs.
- All high priority tests pass.
