# PRD 03 — Sales, Order, Payment, Shipment Management

## Scope

PRD ini mencakup order, payment Midtrans, payment log, shipment Biteship, shipment tracking, Biteship webhook log, dan flow operasional transaksi. Modul ini harus satu paket karena shipment hanya boleh dibuat dari paid order, payment webhook memengaruhi order dan stok, serta shipment webhook memengaruhi status shipment dan order.

## Dependency

Harus dikerjakan setelah PRD 01 dan PRD 02. Produk, varian, dan stok harus tersedia sebelum order/payment/shipment dikerjakan.

## 14. Modul 9 — Order Management

### 14.1 Deskripsi

Modul paling penting untuk mengelola pesanan customer.

Database:

```text
orders
order_items
order_addresses
payments
shipments
users
```

Tabel `orders` menyimpan customer info, subtotal, diskon, ongkir, grand total, status pembayaran, status order, status pengiriman, dan persetujuan no return/refund.

### 14.2 Halaman

```text
/admin/orders
/admin/orders/{id}
```

### 14.3 Order List

Kolom:

1. Order number.
2. Customer name.
3. Customer email.
4. Customer phone.
5. Grand total.
6. Payment status.
7. Order status.
8. Shipping status.
9. Created at.
10. Actions.

### 14.4 Filter

1. Search by order number/customer.
2. Payment status:
   - pending
   - paid
   - expired
   - failed
   - cancelled
3. Order status:
   - pending_payment
   - paid
   - processing
   - ready_to_ship
   - shipped
   - delivered
   - completed
   - cancelled
   - expired
4. Shipping status:
   - not_created
   - confirmed
   - allocated
   - picked
   - in_transit
   - delivered
   - cancelled
   - problem
5. Date range.
6. Courier.
7. Voucher code.

### 14.5 Order Detail

Tampilkan:

1. Order summary.
2. Customer info.
3. Order items.
4. Address snapshot.
5. Payment info.
6. Shipment info.
7. Tracking timeline.
8. No return/refund agreement.
9. Internal notes.
10. Order status history, jika nanti ditambahkan.

### 14.6 Actions

Admin dapat:

1. Mark as processing.
2. Mark as ready to ship.
3. Create shipment.
4. Update shipment status manual, jika dibutuhkan.
5. Mark as completed.
6. Cancel order, hanya jika belum paid.
7. Print invoice.
8. Print packing slip.
9. Add internal note.

### 14.7 Status Flow

```text
pending_payment
↓
paid
↓
processing
↓
ready_to_ship
↓
shipped
↓
delivered
↓
completed
```

Alternative flow:

```text
pending_payment → expired
pending_payment → cancelled
paid → processing
```

Karena website tidak menyediakan refund, order yang sudah paid sebaiknya tidak bisa dibatalkan secara bebas dari dashboard.

### 14.8 Acceptance Criteria

- Admin dapat melihat semua order.
- Admin dapat filter order berdasarkan status.
- Admin dapat melihat detail order lengkap.
- Admin dapat mengubah order status sesuai flow.
- Admin tidak dapat membatalkan order paid tanpa permission khusus.
- Admin dapat melihat apakah customer menyetujui no return/refund.

---

## 15. Modul 10 — Payment Management Midtrans

### 15.1 Deskripsi

Modul ini digunakan untuk memantau transaksi pembayaran dari Midtrans.

Database:

```text
payments
payment_logs
orders
```

Tabel `payments` menyimpan provider, payment method, Midtrans order ID, transaction ID, snap token, redirect URL, status transaksi, fraud status, gross amount, currency, dan raw response.

### 15.2 Halaman

```text
/admin/payments
/admin/payments/{id}
```

### 15.3 Payment List

Kolom:

1. Order number.
2. Midtrans order ID.
3. Transaction ID.
4. Customer.
5. Payment method.
6. Gross amount.
7. Transaction status.
8. Fraud status.
9. Paid at.
10. Expired at.
11. Created at.
12. Actions.

### 15.4 Filter

1. Transaction status:
   - pending
   - settlement
   - expire
   - cancel
   - deny
   - failure
2. Payment method.
3. Date range.
4. Gross amount range.

### 15.5 Payment Detail

Tampilkan:

1. Payment summary.
2. Related order.
3. Midtrans transaction data.
4. Raw response.
5. Payment logs.
6. Timeline status.

### 15.6 Actions

1. Sync status from Midtrans.
2. View related order.
3. View logs.

Tidak ada action refund karena sistem tidak menyediakan return/refund.

### 15.7 Acceptance Criteria

- Admin dapat melihat semua transaksi.
- Admin dapat membuka detail pembayaran.
- Admin dapat melihat payment logs.
- Admin dapat melakukan sync status.
- Sistem tidak menampilkan tombol refund.

---

## 16. Modul 11 — Payment Log Management

### 16.1 Deskripsi

Modul untuk melihat log webhook/payment notification.

Database:

```text
payment_logs
```

Tabel `payment_logs` menyimpan provider, event type, transaction status, payload JSON, dan processed timestamp.

### 16.2 Halaman

```text
/admin/payment-logs
/admin/payment-logs/{id}
```

### 16.3 Fitur

1. List webhook logs.
2. View raw JSON payload.
3. Filter by provider.
4. Filter by status.
5. Filter by date.
6. Search by order number.

### 16.4 Acceptance Criteria

- Admin dapat melihat log pembayaran.
- Admin dapat membuka payload JSON.
- Log tidak bisa diedit.
- Log hanya bisa dibaca untuk audit/debugging.

---

## 17. Modul 12 — Shipment Management Biteship

### 17.1 Deskripsi

Modul ini digunakan untuk mengelola pengiriman pesanan melalui Biteship.

Database:

```text
shipments
shipment_trackings
biteship_webhook_logs
orders
order_addresses
order_items
```

Tabel `shipments` menyimpan provider pengiriman, Biteship order ID, tracking ID, waybill ID, kurir, jenis layanan, ongkir, estimasi, shipping status, dan raw response.

### 17.2 Halaman

```text
/admin/shipments
/admin/shipments/{id}
```

### 17.3 Shipment List

Kolom:

1. Order number.
2. Waybill ID.
3. Courier company.
4. Courier type.
5. Courier service name.
6. Shipping cost.
7. Shipping status.
8. Estimated delivery.
9. Shipped at.
10. Delivered at.
11. Actions.

### 17.4 Filter

1. Courier company.
2. Courier type.
3. Shipping status.
4. Date range.
5. Waybill ID.
6. Order number.

### 17.5 Shipment Detail

Tampilkan:

1. Shipment summary.
2. Related order.
3. Recipient address.
4. Courier information.
5. Waybill ID.
6. Tracking timeline.
7. Raw rate response.
8. Raw order response.
9. Biteship webhook logs.

### 17.6 Actions

1. Create shipment dari order paid.
2. Track shipment.
3. Refresh tracking status.
4. Print shipping label, jika tersedia.
5. Mark problem, jika perlu.
6. View related order.

### 17.7 Create Shipment Flow

```text
Admin buka order paid
↓
Admin klik Create Shipment
↓
Sistem membaca order_items dan order_addresses
↓
Sistem membuat request ke Biteship
↓
Response disimpan ke shipments
↓
Status order menjadi ready_to_ship / shipped
↓
Customer mendapat notification
```

### 17.8 Acceptance Criteria

- Admin dapat melihat semua pengiriman.
- Admin dapat membuat shipment dari order paid.
- Shipment tidak bisa dibuat untuk order unpaid.
- Shipment tidak boleh dibuat dua kali untuk order yang sama.
- Admin dapat melihat tracking timeline.
- Webhook Biteship tersimpan di log.

---

## 18. Modul 13 — Shipment Tracking Management

### 18.1 Deskripsi

Modul untuk menampilkan timeline tracking paket.

Database:

```text
shipment_trackings
```

Tabel `shipment_trackings` menyimpan status, deskripsi, lokasi, waktu kejadian, dan raw payload.

### 18.2 Fitur

1. View timeline.
2. Refresh tracking.
3. Filter tracking event by shipment.
4. Store raw payload.

### 18.3 Acceptance Criteria

- Admin dapat melihat timeline pengiriman.
- Customer juga dapat melihat timeline di detail order.
- Tracking tersusun berdasarkan `happened_at`.
- Status terbaru memperbarui `shipments.shipping_status`.

---

## 19. Modul 14 — Biteship Webhook Log Management

### 19.1 Deskripsi

Modul audit/debug untuk semua webhook Biteship.

Database:

```text
biteship_webhook_logs
```

Tabel `biteship_webhook_logs` menyimpan event type, Biteship order ID, tracking ID, waybill ID, payload JSON, dan processed timestamp.

### 19.2 Halaman

```text
/admin/biteship-webhook-logs
/admin/biteship-webhook-logs/{id}
```

### 19.3 Fitur

1. List webhook.
2. View raw payload.
3. Filter by event type.
4. Filter by waybill ID.
5. Filter by date.

### 19.4 Acceptance Criteria

- Admin dapat melihat webhook Biteship.
- Webhook log tidak bisa diedit.
- Payload JSON tampil rapi.
- Log dapat digunakan untuk debugging pengiriman.

---

## 31. Flow Operasional Admin

### 31.1 Flow Mengelola Produk

```text
Admin login
↓
Buka Products
↓
Create Product
↓
Isi data produk
↓
Upload image
↓
Tambah variants
↓
Set stock
↓
Publish product
↓
Produk tampil di customer catalog
```

### 31.2 Flow Memproses Order

```text
Customer checkout
↓
Order masuk dengan status pending_payment
↓
Customer bayar via Midtrans
↓
Webhook Midtrans update payment_status = paid
↓
Admin melihat order paid
↓
Admin ubah status menjadi processing
↓
Admin packing barang
↓
Admin create shipment
↓
Sistem membuat shipment via Biteship
↓
Nomor resi tersimpan
↓
Customer mendapat notifikasi
↓
Tracking update via Biteship
↓
Order delivered
↓
Admin/computer system mark completed
```

### 31.3 Flow Mengelola Stok

```text
Admin buka Stock Management
↓
Pilih varian produk
↓
Input stock adjustment
↓
Sistem update product_variants.stock
↓
Sistem membuat stock_logs
↓
Stok terbaru tampil di dashboard
```

### 31.4 Flow Payment Webhook

```text
Midtrans mengirim webhook
↓
Sistem simpan payload ke payment_logs
↓
Sistem update payments.transaction_status
↓
Sistem update orders.payment_status
↓
Jika paid, sistem mengurangi stok / reserved stock
↓
Sistem membuat notification customer
```

### 31.5 Flow Shipment Webhook

```text
Biteship mengirim webhook
↓
Sistem simpan payload ke biteship_webhook_logs
↓
Sistem update shipments.shipping_status
↓
Sistem update shipment_trackings
↓
Sistem update orders.shipping_status
↓
Jika delivered, orders.order_status menjadi delivered
↓
Sistem membuat notification customer
```

---
