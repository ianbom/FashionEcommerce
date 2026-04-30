# PRD 00 — Master Implementation Plan Admin Dashboard E-Commerce

## Tujuan Pemecahan PRD

Dokumen ini memecah PRD Admin Dashboard menjadi beberapa bagian yang aman dikerjakan bertahap oleh Codex. Pemecahan dilakukan berdasarkan **dependency fitur**, bukan sekadar jumlah modul, agar tidak terjadi kondisi fitur setengah jadi yang menyebabkan error atau bug.

## Prinsip Pemecahan

1. Modul yang saling bergantung kuat harus dikerjakan dalam satu PRD.
2. Modul transaksi tidak boleh dipisah dari data pendukung yang dibutuhkan untuk menjaga konsistensi status.
3. Modul produk tidak boleh dipisah dari varian dan stok, karena customer membeli varian, bukan hanya produk utama.
4. Modul shipment tidak boleh dikerjakan sebelum order dan payment flow tersedia.
5. Dashboard overview dan report dikerjakan setelah data utama tersedia.
6. Webhook/log harus dibuat bersama modul transaksi agar idempotency dan audit aman.

## Urutan Implementasi yang Disarankan

### Phase 1 — Foundation, Auth, Layout, Settings

File:

```text
01-foundation-auth-layout-settings.md
```

Tujuan:

- Menyiapkan struktur folder Laravel + Inertia React TypeScript.
- Menyiapkan admin middleware.
- Menyiapkan layout admin.
- Menyiapkan shared components dasar.
- Menyiapkan settings dasar.
- Menyiapkan admin user management.
- Menyiapkan non-functional rules seperti security, pagination, validation, soft delete, dan index.

Modul ini wajib dikerjakan pertama karena semua modul admin bergantung pada auth, route, middleware, layout, dan shared component.

### Phase 2 — Catalog, Product, Variant, Stock

File:

```text
02-catalog-product-variant-stock.md
```

Tujuan:

- Category management.
- Collection management.
- Product management.
- Product image management.
- Product variant management.
- Stock management.
- Stock logs.

Modul ini harus satu paket karena:

- Produk membutuhkan kategori dan koleksi.
- Produk membutuhkan gambar agar bisa publish.
- Produk membutuhkan varian agar bisa dibeli.
- Stok berada di varian, bukan hanya produk.
- Perubahan stok harus tercatat di stock_logs.

### Phase 3 — Sales, Order, Payment, Shipment

File:

```text
03-sales-order-payment-shipment.md
```

Tujuan:

- Order management.
- Payment management Midtrans.
- Payment logs.
- Shipment management Biteship.
- Shipment tracking.
- Biteship webhook logs.
- Status flow order, payment, dan shipment.

Modul ini harus satu paket karena:

- Shipment hanya boleh dibuat dari order yang sudah paid.
- Payment webhook mengubah status order dan stok.
- Shipment webhook mengubah status shipment dan order.
- Semua status harus konsisten agar tidak terjadi double shipment, double stock decrease, atau order paid tanpa shipment.

### Phase 4 — Customer, Marketing, Content

File:

```text
04-customer-marketing-content.md
```

Tujuan:

- Customer management.
- Customer address management.
- Voucher management.
- Notification management.
- Wishlist insight.
- Banner management.
- Page management.

Modul ini aman dipisah dari transaksi inti karena sebagian besar bersifat pengelolaan data pendukung dan konten. Namun notification tetap mengikuti event dari Phase 3.

### Phase 5 — Dashboard Overview, Reports, Audit

File:

```text
05-dashboard-reports-audit.md
```

Tujuan:

- Dashboard overview.
- Sales report.
- Product report.
- Customer report.
- Shipment report.
- Voucher report.
- Payment webhook log view.
- Biteship webhook log view.
- Admin activity log recommendation.

Modul ini dikerjakan terakhir karena membutuhkan data dari produk, order, payment, shipment, customer, voucher, dan stock log.

## Dependency Map

```text
Foundation/Auth/Layout
        ↓
Catalog/Product/Variant/Stock
        ↓
Sales/Order/Payment/Shipment
        ↓
Customer/Marketing/Content
        ↓
Dashboard/Reports/Audit
```

## Modul yang Tidak Boleh Dipisah

### Product tidak boleh dipisah dari Variant dan Stock

Alasan:

- Produk tanpa varian tidak bisa dibeli.
- Stok berada pada product_variants.
- Publish product harus memeriksa gambar, varian aktif, dan stok.

### Order tidak boleh dipisah dari Payment dan Shipment

Alasan:

- Payment status menentukan order status.
- Shipment hanya boleh dibuat jika order paid.
- Status order harus konsisten dari checkout sampai delivered/completed.

### Webhook tidak boleh dipisah dari Payment/Shipment

Alasan:

- Webhook harus idempotent.
- Log harus tersimpan saat status berubah.
- Tanpa log, debugging pembayaran dan pengiriman sulit.

## Global Database Rules

### Soft Delete Recommended

Gunakan soft delete pada:

```text
users
customer_addresses
categories
collections
products
product_images
product_variants
vouchers
notifications
banners
pages
```

Opsional:

```text
carts
cart_items
wishlists
site_settings
```

Jangan gunakan soft delete pada:

```text
orders
order_items
order_addresses
payments
payment_logs
shipments
shipment_trackings
biteship_webhook_logs
stock_logs
```

Alasan: tabel transaksi, payment, shipment, webhook log, dan stock log harus immutable untuk audit.

## Global Status Rules

### Product Status

```text
draft
published
archived
```

### Payment Status Internal

```text
pending
paid
expired
failed
cancelled
```

### Order Status

```text
pending_payment
paid
processing
ready_to_ship
shipped
delivered
completed
cancelled
expired
```

### Shipping Status

```text
not_created
confirmed
allocated
picked
in_transit
delivered
cancelled
problem
```

## Global Technical Requirements

1. Semua halaman admin wajib berada di prefix `/admin`.
2. Semua route admin wajib menggunakan middleware `auth` dan `admin`.
3. Semua tabel admin wajib memiliki pagination.
4. Semua form wajib menggunakan Form Request Validation.
5. Semua proses transaksi penting wajib menggunakan database transaction.
6. Semua webhook wajib idempotent.
7. Semua API key sensitif disimpan di `.env`, bukan database.
8. Semua tabel transaksi/log tidak boleh diedit langsung dari UI.
9. Semua action berisiko wajib menggunakan confirmation dialog.
10. Semua status wajib ditampilkan menggunakan badge yang konsisten.

## Output Akhir yang Diharapkan

Setelah seluruh PRD selesai diimplementasikan, dashboard admin dapat digunakan untuk:

1. Mengelola produk sampai tampil di katalog customer.
2. Mengelola stok varian secara akurat.
3. Melihat dan memproses order.
4. Memantau pembayaran Midtrans.
5. Membuat shipment Biteship dari order paid.
6. Melihat tracking shipment.
7. Mengelola customer, voucher, notification, banner, dan pages.
8. Melihat dashboard overview dan reports.
9. Melacak log payment, shipment, stock, dan aktivitas admin.
10. Menjaga sistem tetap aman tanpa fitur return/refund.
