# Manual Transfer WhatsApp Payment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace checkout-time Midtrans payment with manual bank transfer and redirect completed orders to the store WhatsApp with a complete order template.

**Architecture:** Preserve the existing `Payment` abstraction and Midtrans integration for future reuse, but create new orders as `manual_transfer` payments. Generate WhatsApp messages server-side from persisted order snapshots. Admin confirmation finalizes reserved stock; cancellation releases stock and voucher reservations.

**Tech Stack:** Laravel 13, PHP 8.3, Inertia.js 3, React 19, TypeScript, Pest 4, Tailwind CSS 4.

**Spec:** Approved design in conversation on 2026-08-19.

## Global Constraints

- WhatsApp destination: `6285736426304 `, configurable through site settings.
- Manual payments have no automatic expiry.
- Bank name, account number, account holder, and WhatsApp number are editable in admin payment settings.
- Existing Midtrans services, webhook routes, jobs, and database columns remain available for future activation.
- Modify existing migrations only; do not create a migration file.
- Preserve checkout idempotency, stock reservation, voucher reservation, Biteship rates, and cart clearing.

---

### Task 1: Manual payment domain and persistence

**Files:**
- Modify: existing payment/site-setting migrations under `database/migrations/`
- Modify: `database/seeders/SiteSettingSeeder.php`
- Modify: `app/Models/Payment.php`
- Test: `tests/Feature/Customer/ManualTransferCheckoutTest.php`

**Interfaces:**
- Produces payment fields `payment_provider=manual`, `payment_method=bank_transfer`, `transaction_status=pending`.
- Produces settings `payment_provider`, `payment_whatsapp_number`, `bank_name`, `bank_account_number`, `bank_account_name`.

- [ ] Write a failing checkout test asserting a manual payment record, nullable expiry, and no Midtrans identifiers.
- [ ] Run `php artisan test tests/Feature/Customer/ManualTransferCheckoutTest.php` and confirm failure.
- [ ] Extend the existing migration constraints/columns only where required for manual provider values.
- [ ] Seed manual-payment defaults, including WhatsApp `6285736426304 ` and blank bank details.
- [ ] Update model fillable/casts only if required by existing schema.
- [ ] Re-run the focused test.

### Task 2: Server-side WhatsApp order message

**Files:**
- Create: `app/Services/Customer/WhatsAppOrderMessage.php`
- Modify: `app/Services/Customer/CheckoutService.php`
- Test: `tests/Feature/Customer/ManualTransferCheckoutTest.php`

**Interfaces:**
- Produces: `WhatsAppOrderMessage::url(Order $order): string`.
- URL format: `https://wa.me/{digits}?text={urlencoded-message}`.
- Message includes order code, each persisted order item and variant, subtotal, discount, shipping, service fee, grand total, and bank destination.

- [ ] Add failing assertions for the redirect host, destination number, order number, products, shipping, discount, total, and bank details.
- [ ] Run the focused test and confirm failure.
- [ ] Implement `WhatsAppOrderMessage` using persisted order/item snapshots and `SiteSettingService`.
- [ ] Replace Midtrans Snap creation in `CheckoutService::placeOrder()` with manual payment creation and generated WhatsApp URL.
- [ ] Make idempotent retries return the same generated WhatsApp URL.
- [ ] Keep cart clearing and checkout-session cleanup after successful persistence.
- [ ] Re-run the focused test.

### Task 3: Checkout manual-transfer interface

**Files:**
- Modify: `app/Services/Customer/CheckoutService.php`
- Modify: `resources/js/contexts/checkout-context.tsx`
- Modify: `resources/js/pages/customer/checkout/checkout.tsx`

**Interfaces:**
- Checkout page props add `manualPayment: { whatsapp_number: string; bank_name: string; bank_account_number: string; bank_account_name: string }`.
- `placeOrder()` continues returning a redirect URL, now WhatsApp.

- [ ] Expose sanitized manual-payment settings from `CheckoutService::pageData()`.
- [ ] Type the props in checkout context.
- [ ] Add an accessible bank-transfer panel to checkout.
- [ ] Replace Midtrans wording with manual-transfer and WhatsApp wording.
- [ ] Keep submit loading/error behavior and redirect using the returned URL.
- [ ] Run `npm run types:check`.

### Task 4: Admin payment confirmation and cancellation

**Files:**
- Create: `app/Actions/Payments/ConfirmManualPaymentAction.php`
- Modify: `app/Services/Admin/PaymentManagementService.php`
- Modify: `app/Http/Controllers/Admin/PaymentController.php`
- Modify: `routes/web.php`
- Modify: `resources/js/pages/admin/payments/show.tsx`
- Test: `tests/Feature/Payments/ManualPaymentConfirmationTest.php`

**Interfaces:**
- Produces `POST admin/payments/{payment}/confirm`.
- Produces `POST admin/payments/{payment}/cancel`.
- Confirmation finalizes stock once, marks payment/order paid, sets both paid timestamps, and emits notification.
- Cancellation releases stock/voucher once and marks payment/order cancelled.

- [ ] Write failing tests for authorized confirmation, idempotency, stock finalization, cancellation, and reservation release.
- [ ] Run the focused test and confirm failure.
- [ ] Implement the manual confirmation action using `FinalizeReservedStockAction` and existing notification patterns.
- [ ] Implement cancellation using existing release actions.
- [ ] Add controller routes and Wayfinder generation.
- [ ] Add confirm/cancel controls visible only for pending manual payments.
- [ ] Re-run focused tests and TypeScript checks.

### Task 5: Admin-configurable bank and WhatsApp settings

**Files:**
- Modify: `app/Services/Admin/SettingManagementService.php`
- Modify: relevant admin setting request/controller validation
- Modify: `resources/js/pages/admin/settings/index.tsx` or existing payment-settings component
- Test: `tests/Feature/Admin/ManualPaymentSettingsTest.php`

**Interfaces:**
- Payment settings accept bank name, account number, account holder, and normalized WhatsApp digits.
- Checkout and message generator consume the same settings.

- [ ] Write failing validation and persistence tests.
- [ ] Run the focused test and confirm failure.
- [ ] Add backend validation and persistence through existing site-setting patterns.
- [ ] Add payment-setting form fields with labels and validation messages.
- [ ] Re-run focused tests and frontend typecheck.

### Task 6: Regression cleanup and full verification

**Files:**
- Modify only failing Midtrans-specific tests whose assumptions no longer represent default checkout.

**Interfaces:**
- Midtrans webhook/sync remain functional for records whose provider is Midtrans.
- Manual payments are ignored by Midtrans sync/expiry paths.

- [ ] Add a regression assertion that Midtrans sync cannot process manual payments.
- [ ] Run payment, checkout, stock, voucher, order, shipment, and settings test groups.
- [ ] Run `php artisan wayfinder:generate` if routes changed and commit generated route helpers to the working tree.
- [ ] Run `composer ci:check`.
- [ ] Run `npm run build`.
- [ ] Inspect `git diff --check` and `git diff` for accidental changes or secrets.
