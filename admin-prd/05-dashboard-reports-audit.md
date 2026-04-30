# PRD 05 — Dashboard Overview, Reports, Audit, Logs

## Scope

PRD ini mencakup dashboard overview, reports, audit/logs, success metrics, rekomendasi tabel tambahan, dan kesimpulan. Modul ini dikerjakan terakhir karena membutuhkan data dari product, stock, order, payment, shipment, customer, voucher, dan notification.

## Dependency

Dikerjakan setelah PRD 01, PRD 02, PRD 03, dan PRD 04 agar data agregasi dashboard dan reports valid.

## 7. Modul 2 — Dashboard Overview

### 7.1 Deskripsi

Halaman utama dashboard menampilkan ringkasan kondisi toko secara cepat.

### 7.2 Data yang Digunakan

```text
orders
order_items
products
product_variants
users
payments
shipments
stock_logs
```

Tabel `orders` menyimpan total belanja, status pembayaran, status order, status pengiriman, dan timestamp penting seperti `paid_at`, `cancelled_at`, `expired_at`, dan `completed_at`.

### 7.3 Komponen UI

#### A. Summary Cards

Tampilkan kartu statistik:

1. Total Revenue Hari Ini.
2. Total Revenue Bulan Ini.
3. Total Order Hari Ini.
4. Total Order Pending Payment.
5. Total Order Paid.
6. Total Order Processing.
7. Total Order Shipped.
8. Total Order Completed.
9. Total Customer.
10. Total Product Published.
11. Low Stock Variants.
12. Sold Out Variants.

#### B. Sales Chart

Grafik penjualan:

- Harian.
- Mingguan.
- Bulanan.
- Custom date range.

Data dihitung dari:

```text
orders.grand_total
orders.payment_status = paid
orders.paid_at
```

#### C. Order Status Chart

Menampilkan distribusi order:

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

#### D. Payment Status Chart

Menampilkan distribusi pembayaran:

```text
pending
paid
expired
failed
cancelled
```

#### E. Recent Orders

Tabel 10 order terbaru:

- Order number.
- Customer.
- Grand total.
- Payment status.
- Order status.
- Shipping status.
- Created at.
- Action detail.

#### F. Low Stock Products

Tabel produk dengan stok rendah:

- Product name.
- Variant SKU.
- Color.
- Size.
- Stock.
- Reserved stock.
- Available stock.

Available stock:

```text
available_stock = stock - reserved_stock
```

#### G. Latest Payment Logs

Menampilkan log pembayaran terbaru dari Midtrans.

#### H. Latest Shipment Status

Menampilkan status pengiriman terbaru.

### 7.4 Filter

Dashboard overview harus memiliki filter:

```text
Today
Last 7 Days
Last 30 Days
This Month
Custom Range
```

### 7.5 Acceptance Criteria

- Admin dapat melihat ringkasan penjualan.
- Admin dapat melihat order terbaru.
- Admin dapat melihat produk stok rendah.
- Admin dapat melihat grafik revenue.
- Data berubah sesuai filter tanggal.
- Revenue hanya dihitung dari order dengan `payment_status = paid`.

---

## 29. Modul 24 — Reports

### 29.1 Deskripsi

Modul Reports digunakan untuk menganalisis performa toko.

Database:

```text
orders
order_items
products
product_variants
users
payments
shipments
vouchers
```

### 29.2 Sales Report

Metric:

1. Gross revenue.
2. Net revenue.
3. Total shipping cost.
4. Total discount.
5. Total service fee.
6. Total orders.
7. Average order value.
8. Paid orders.
9. Cancelled orders.
10. Expired orders.

Filter:

1. Date range.
2. Payment status.
3. Order status.
4. Category.
5. Collection.

### 29.3 Product Report

Metric:

1. Best selling products.
2. Best selling variants.
3. Revenue per product.
4. Sold quantity per product.
5. Low stock products.
6. Sold out products.

### 29.4 Customer Report

Metric:

1. New customers.
2. Repeat customers.
3. Top customers by total spending.
4. Customers with most orders.
5. Customer city distribution.

### 29.5 Shipment Report

Metric:

1. Total shipments.
2. Shipment by courier.
3. Shipment by status.
4. Delivered shipments.
5. Problem shipments.
6. Average delivery duration, jika data tracking lengkap.

### 29.6 Voucher Report

Metric:

1. Most used voucher.
2. Total discount given.
3. Voucher conversion.
4. Voucher usage count.

### 29.7 Export

Format:

```text
CSV
XLSX
PDF optional
```

### 29.8 Acceptance Criteria

- Admin dapat melihat laporan berdasarkan filter tanggal.
- Admin dapat export laporan.
- Revenue hanya menghitung order paid.
- Report produk menggunakan data snapshot dari `order_items`.

---

## 30. Modul 25 — Audit & Logs

### 30.1 Deskripsi

Audit digunakan untuk membantu debugging dan monitoring operasional.

Database yang sudah ada:

```text
payment_logs
biteship_webhook_logs
stock_logs
```

### 30.2 Fitur

1. Payment webhook logs.
2. Biteship webhook logs.
3. Stock movement logs.
4. Admin activity logs, disarankan tambah tabel baru.

### 30.3 Rekomendasi Tabel Tambahan

Untuk production, sebaiknya tambahkan:

```dbml
Table admin_activity_logs {
  id bigint [pk, increment]
  user_id bigint [not null]
  action varchar(150) [not null]
  module varchar(100) [not null]
  reference_type varchar(100)
  reference_id bigint
  old_values json
  new_values json
  ip_address varchar(45)
  user_agent text
  created_at timestamp
}
```

Contoh aktivitas:

```text
Admin membuat produk
Admin mengubah stok
Admin mengubah status order
Admin membuat shipment
Admin mengubah banner
```

### 30.4 Acceptance Criteria

- Log penting tidak dapat diedit.
- Admin dapat melihat log untuk debugging.
- Aktivitas sensitif sebaiknya tercatat.

---

## 38. Success Metrics

Fitur dashboard admin dianggap berhasil jika:

1. Admin dapat mengelola produk sampai tampil di katalog customer.
2. Admin dapat melihat dan memproses order.
3. Status payment dari Midtrans dapat dipantau.
4. Admin dapat membuat shipment Biteship dari order paid.
5. Customer menerima update order melalui notification.
6. Stok produk akurat setelah order berhasil.
7. Admin dapat mengelola banner dan halaman statis tanpa mengubah kode.
8. Dashboard overview menampilkan data bisnis yang relevan.
9. Tidak ada order paid yang kehilangan data produk, alamat, payment, atau shipment.
10. Tidak ada fitur refund/return yang muncul di admin dashboard.

---

## 39. Catatan Revisi Database yang Disarankan

Database sudah cukup lengkap untuk dashboard admin. Namun untuk dashboard production, disarankan menambahkan beberapa tabel ini.

### 39.1 `order_status_histories`

Agar perubahan status order tercatat.

```dbml
Table order_status_histories {
  id bigint [pk, increment]
  order_id bigint [not null]
  user_id bigint
  from_status varchar(50)
  to_status varchar(50) [not null]
  note text
  created_at timestamp
}
```

### 39.2 `admin_activity_logs`

Agar aktivitas admin tercatat.

```dbml
Table admin_activity_logs {
  id bigint [pk, increment]
  user_id bigint [not null]
  action varchar(150) [not null]
  module varchar(100) [not null]
  reference_type varchar(100)
  reference_id bigint
  old_values json
  new_values json
  ip_address varchar(45)
  user_agent text
  created_at timestamp
}
```

### 39.3 `product_collection`

Jika satu produk bisa masuk ke banyak collection.

Saat ini `products.collection_id` hanya memungkinkan satu produk punya satu collection. Kalau nanti satu produk bisa masuk ke “New Arrival”, “Ramadan Collection”, dan “Best Seller Campaign” sekaligus, gunakan pivot table:

```dbml
Table product_collection {
  id bigint [pk, increment]
  product_id bigint [not null]
  collection_id bigint [not null]
  created_at timestamp

  indexes {
    (product_id, collection_id) [unique]
  }
}
```

### 39.4 `order_notes`

Jika admin perlu menambahkan catatan internal lebih dari satu.

```dbml
Table order_notes {
  id bigint [pk, increment]
  order_id bigint [not null]
  user_id bigint [not null]
  note text [not null]
  is_internal boolean [not null, default: true]
  created_at timestamp
  updated_at timestamp
}
```

---

## 41. Kesimpulan

Dashboard admin yang perlu dibuat bukan hanya halaman statistik, tetapi sistem operasional penuh untuk mengelola e-commerce. Berdasarkan database yang tersedia, dashboard admin idealnya mencakup:

```text
Dashboard Overview
Product Management
Variant & Stock Management
Category Management
Collection Management
Order Management
Payment Management
Shipment Management
Customer Management
Voucher Management
Notification Management
Banner Management
Page Management
Site Settings
Reports
Logs
```

Untuk tahap MVP, fokus utama adalah **produk, stok, order, payment, shipment, customer, banner, pages, dan settings**. Setelah itu baru tambahkan fitur lanjutan seperti report detail, voucher, wishlist insight, export, dan admin activity logs.
