# PRD — Admin Dashboard E-Commerce Fashion

## 1. Ringkasan Produk

Admin Dashboard adalah sistem internal untuk mengelola seluruh operasional e-commerce, mulai dari produk, stok, kategori, koleksi, pesanan, pembayaran Midtrans, pengiriman Biteship, customer, voucher, banner, halaman statis, notifikasi, hingga pengaturan website.

Dashboard ini hanya dapat diakses oleh user dengan role:

```text
admin
```

Customer tidak boleh mengakses area admin.

---

## 2. Tujuan Fitur

Tujuan utama Admin Dashboard adalah:

1. Memudahkan admin mengelola produk dan varian.
2. Memantau stok produk secara real-time.
3. Memproses pesanan customer dari checkout sampai selesai.
4. Memantau status pembayaran dari Midtrans.
5. Mengelola pengiriman menggunakan Biteship.
6. Mengelola tampilan homepage seperti banner, koleksi, dan produk unggulan.
7. Mengelola customer dan notifikasi.
8. Mengelola halaman statis seperti Terms, Privacy Policy, Shipping Policy, dan No Return / Refund Policy.
9. Menampilkan statistik penjualan, order, customer, dan stok.
10. Menjadi pusat operasional admin toko.

---

## 3. Target Pengguna

### 3.1 Admin

Admin adalah pengguna internal yang dapat:

- Login ke dashboard.
- Mengelola produk.
- Mengelola kategori dan koleksi.
- Mengelola stok.
- Melihat dan memproses order.
- Memantau pembayaran.
- Membuat pengiriman.
- Melihat customer.
- Mengelola voucher.
- Mengelola banner.
- Mengelola halaman statis.
- Mengelola pengaturan website.

### 3.2 Customer

Customer tidak memiliki akses ke dashboard admin. Customer hanya muncul sebagai data yang dikelola admin melalui menu customer, order, dan notification.

---

## 4. Tech Stack

### 4.1 Backend

```text
Laravel
Laravel Breeze / Fortify / Sanctum
Eloquent ORM
Form Request Validation
Service Layer
Policy / Gate Authorization
Queue Job
Scheduler
```

### 4.2 Frontend

```text
Inertia.js
React
TypeScript
Tailwind CSS
shadcn/ui
TanStack Table
React Hook Form
Recharts
```

### 4.3 Database

```text
MySQL
```

### 4.4 Integrasi

```text
Midtrans
Biteship
Laravel Storage
```

---

## 5. Struktur Sidebar Admin

Rekomendasi struktur menu dashboard:

```text
Dashboard

Catalog Management
- Products
- Product Variants
- Categories
- Collections
- Stock Logs

Sales Management
- Orders
- Payments
- Shipments
- Vouchers

Customer Management
- Customers
- Customer Addresses
- Notifications

Content Management
- Banners
- Pages

Reports
- Sales Report
- Product Report
- Customer Report
- Shipment Report

Settings
- Store Settings
- SEO Settings
- Payment Settings
- Shipping Settings
- Admin Users
```

---

## 6. Modul 1 — Admin Authentication & Authorization

### 6.1 Deskripsi

Admin harus login terlebih dahulu sebelum mengakses dashboard. Hanya user dengan `role = admin` yang boleh masuk.

Database utama:

```text
users
```

Pada tabel `users`, role disimpan dalam field `role`, dengan nilai default `customer`, dan dapat digunakan untuk membedakan admin dan customer.

### 6.2 Fitur

1. Login admin.
2. Logout admin.
3. Cek role admin.
4. Redirect customer jika mencoba masuk ke dashboard.
5. Menonaktifkan akun admin/customer dengan `is_active`.

### 6.3 Route

```php
GET  /admin/login
POST /admin/login
POST /admin/logout
GET  /admin/dashboard
```

### 6.4 Acceptance Criteria

- Admin dapat login jika email dan password benar.
- User dengan role `customer` tidak dapat masuk dashboard.
- User dengan `is_active = false` tidak dapat login.
- Setelah login berhasil, admin diarahkan ke `/admin/dashboard`.
- Setelah logout, admin diarahkan ke halaman login.

---

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

## 8. Modul 3 — Product Management

### 8.1 Deskripsi

Modul Product Management digunakan untuk mengelola produk utama yang tampil di katalog customer.

Database utama:

```text
products
product_images
product_variants
categories
collections
```

Tabel `products` menyimpan data utama produk seperti kategori, koleksi, nama, slug, SKU, deskripsi, material, harga, berat, dimensi, status, label featured/new arrival/best seller, serta metadata SEO.

### 8.2 Halaman

```text
/admin/products
/admin/products/create
/admin/products/{id}/edit
/admin/products/{id}
```

### 8.3 Product List

#### Kolom Tabel

1. Thumbnail.
2. Product name.
3. SKU.
4. Category.
5. Collection.
6. Base price.
7. Sale price.
8. Total stock.
9. Status.
10. Featured.
11. New arrival.
12. Best seller.
13. Created at.
14. Actions.

#### Filter

1. Search by name/SKU.
2. Category.
3. Collection.
4. Status:
   - draft
   - published
   - archived
5. Stock status:
   - in stock
   - low stock
   - sold out
6. Featured.
7. New arrival.
8. Best seller.

#### Actions

1. View.
2. Edit.
3. Duplicate.
4. Archive.
5. Publish.
6. Delete, jika belum pernah ada order.

### 8.4 Create/Edit Product Form

#### Field

1. Product name.
2. Slug.
3. SKU.
4. Category.
5. Collection.
6. Short description.
7. Description.
8. Material.
9. Care instruction.
10. Base price.
11. Sale price.
12. Weight.
13. Length.
14. Width.
15. Height.
16. Status.
17. Featured.
18. New Arrival.
19. Best Seller.
20. Meta title.
21. Meta description.

#### Validasi

- `name` wajib.
- `slug` wajib dan unique.
- `base_price` wajib dan minimal 0.
- `sale_price` tidak boleh lebih besar dari `base_price`.
- `weight` wajib minimal 1 gram jika produk published.
- `status` hanya boleh `draft`, `published`, atau `archived`.
- Produk published minimal harus memiliki:
  - satu gambar utama,
  - satu varian aktif,
  - stok valid,
  - harga valid.

### 8.5 Product Detail Admin

Tampilkan:

1. Informasi utama produk.
2. Galeri gambar.
3. Daftar varian.
4. Riwayat stok.
5. Riwayat order yang mengandung produk ini.
6. SEO preview.
7. Status publish.

### 8.6 Acceptance Criteria

- Admin dapat membuat produk.
- Admin dapat mengedit produk.
- Admin dapat mengubah status produk.
- Produk draft tidak tampil di customer catalog.
- Produk published tampil di customer catalog.
- Produk archived tidak tampil di customer catalog.
- Admin tidak boleh menghapus produk yang sudah pernah masuk order; gunakan archive.

---

## 9. Modul 4 — Product Image Management

### 9.1 Deskripsi

Modul ini digunakan untuk mengelola foto produk.

Database:

```text
product_images
```

Tabel `product_images` menyimpan `image_url`, `alt_text`, `sort_order`, dan `is_primary` untuk menentukan galeri dan gambar utama produk.

### 9.2 Fitur

1. Upload multiple images.
2. Set primary image.
3. Edit alt text.
4. Sort image order.
5. Delete image.
6. Preview image.

### 9.3 Validasi

- Format file: jpg, jpeg, png, webp.
- Maksimum ukuran file sesuai setting, misalnya 2 MB.
- Minimal 1 gambar untuk produk published.
- Hanya boleh 1 gambar primary per produk.

### 9.4 Acceptance Criteria

- Admin dapat upload beberapa gambar.
- Admin dapat memilih gambar utama.
- Gambar utama tampil di katalog.
- Urutan gambar mengikuti `sort_order`.

---

## 10. Modul 5 — Product Variant Management

### 10.1 Deskripsi

Modul ini digunakan untuk mengelola varian produk seperti warna, ukuran, SKU, harga tambahan, dan stok.

Database:

```text
product_variants
stock_logs
```

Tabel `product_variants` menyimpan SKU unik, warna, ukuran, harga tambahan, stok, reserved stock, image URL, dan status aktif varian.

### 10.2 Halaman

```text
/admin/products/{product}/variants
/admin/product-variants/{id}/edit
```

### 10.3 Field Varian

1. SKU.
2. Color name.
3. Color hex.
4. Size.
5. Additional price.
6. Stock.
7. Reserved stock.
8. Image.
9. Active status.

### 10.4 Variant List

Kolom:

1. SKU.
2. Color.
3. Size.
4. Additional price.
5. Stock.
6. Reserved stock.
7. Available stock.
8. Status.
9. Actions.

Available stock:

```text
stock - reserved_stock
```

### 10.5 Actions

1. Add variant.
2. Edit variant.
3. Disable variant.
4. Adjust stock.
5. View stock logs.

### 10.6 Validasi

- SKU wajib unique.
- Stock tidak boleh negatif.
- Reserved stock tidak boleh lebih besar dari stock.
- Color hex harus valid jika diisi.
- Varian yang sudah pernah dibeli tidak boleh dihapus permanen, hanya disable.

### 10.7 Acceptance Criteria

- Admin dapat membuat varian.
- Admin dapat mengubah stok.
- Perubahan stok tercatat di `stock_logs`.
- Varian nonaktif tidak tampil di customer.
- Customer hanya bisa membeli varian aktif dengan available stock > 0.

---

## 11. Modul 6 — Stock Management

### 11.1 Deskripsi

Modul ini digunakan untuk monitoring dan audit stok produk.

Database:

```text
product_variants
stock_logs
```

Tabel `stock_logs` menyimpan tipe perubahan stok seperti `in`, `out`, `adjustment`, `order`, dan `cancellation`, termasuk jumlah, stok sebelum, stok sesudah, referensi, dan catatan.

### 11.2 Halaman

```text
/admin/stock
/admin/stock/logs
/admin/product-variants/{id}/stock-adjustment
```

### 11.3 Fitur

1. Melihat semua stok varian.
2. Filter stok rendah.
3. Filter sold out.
4. Manual stock adjustment.
5. Riwayat perubahan stok.
6. Export stock report.

### 11.4 Stock Adjustment Form

Field:

1. Variant.
2. Type:
   - in
   - out
   - adjustment
3. Quantity.
4. Note.

### 11.5 Rule Stok

Saat admin adjustment:

```text
stock_after = stock_before + quantity
```

Untuk pengurangan, quantity bisa negatif atau menggunakan type `out`.

### 11.6 Acceptance Criteria

- Setiap perubahan stok tercatat.
- Admin dapat melihat stok sebelum dan sesudah.
- Admin tidak dapat membuat stok menjadi negatif.
- Stok order harus otomatis tercatat ketika pembayaran berhasil.

---

## 12. Modul 7 — Category Management

### 12.1 Deskripsi

Modul untuk mengelola kategori produk.

Database:

```text
categories
products
```

Tabel `categories` menyimpan nama, slug, deskripsi, gambar, dan status aktif.

### 12.2 Halaman

```text
/admin/categories
/admin/categories/create
/admin/categories/{id}/edit
```

### 12.3 Field

1. Name.
2. Slug.
3. Description.
4. Image.
5. Active status.

### 12.4 Tabel List

Kolom:

1. Image.
2. Name.
3. Slug.
4. Total products.
5. Active status.
6. Created at.
7. Actions.

### 12.5 Validasi

- Name wajib.
- Slug wajib unique.
- Kategori yang masih memiliki produk tidak boleh dihapus permanen.
- Jika kategori nonaktif, produk tetap ada tetapi kategori tidak tampil di filter customer.

### 12.6 Acceptance Criteria

- Admin dapat membuat kategori.
- Admin dapat edit kategori.
- Admin dapat menonaktifkan kategori.
- Admin dapat melihat jumlah produk per kategori.

---

## 13. Modul 8 — Collection Management

### 13.1 Deskripsi

Modul untuk mengelola koleksi atau campaign produk seperti “Ramadan Collection”, “Hajj Series”, atau “New Arrival”.

Database:

```text
collections
products
```

Tabel `collections` memiliki field `banner_desktop_url`, `banner_mobile_url`, `is_featured`, dan `is_active`, sehingga cocok untuk halaman campaign/koleksi.

### 13.2 Halaman

```text
/admin/collections
/admin/collections/create
/admin/collections/{id}/edit
```

### 13.3 Field

1. Name.
2. Slug.
3. Description.
4. Banner desktop.
5. Banner mobile.
6. Featured status.
7. Active status.

### 13.4 Fitur

1. CRUD collection.
2. Assign produk ke collection dari form product.
3. Preview collection landing page.
4. Set featured collection untuk homepage.

### 13.5 Acceptance Criteria

- Admin dapat membuat koleksi.
- Admin dapat upload banner desktop dan mobile.
- Koleksi aktif bisa tampil di customer.
- Koleksi featured bisa tampil di homepage.

---

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

## 20. Modul 15 — Customer Management

### 20.1 Deskripsi

Modul untuk melihat dan mengelola data customer.

Database:

```text
users
customer_addresses
orders
wishlists
notifications
```

Tabel `users` menyimpan data customer dan admin, sedangkan `customer_addresses` menyimpan alamat customer yang dapat digunakan saat checkout.

### 20.2 Halaman

```text
/admin/customers
/admin/customers/{id}
```

### 20.3 Customer List

Kolom:

1. Name.
2. Email.
3. Phone.
4. Total orders.
5. Total spent.
6. Active status.
7. Registered at.
8. Actions.

### 20.4 Filter

1. Search by name/email/phone.
2. Active status.
3. Date registered.
4. Total spent range.

### 20.5 Customer Detail

Tampilkan:

1. Profile info.
2. Addresses.
3. Order history.
4. Wishlist products.
5. Notifications.
6. Total spent.
7. Last order.

### 20.6 Actions

1. View customer.
2. Activate/deactivate customer.
3. View orders.
4. Add internal note, jika nanti ditambahkan.
5. Send notification, jika diperlukan.

### 20.7 Acceptance Criteria

- Admin dapat melihat semua customer.
- Admin tidak dapat melihat password customer.
- Admin dapat menonaktifkan customer.
- Customer nonaktif tidak dapat login.
- Admin dapat melihat alamat dan riwayat order customer.

---

## 21. Modul 16 — Customer Address Management

### 21.1 Deskripsi

Modul untuk melihat alamat customer. Admin biasanya tidak perlu sering mengubah alamat, tetapi berguna untuk bantuan customer service.

Database:

```text
customer_addresses
```

### 21.2 Fitur

1. View addresses.
2. Filter by city/province.
3. View default address.
4. Edit alamat, jika customer meminta bantuan.
5. Delete alamat, jika belum dipakai order.

### 21.3 Acceptance Criteria

- Admin dapat melihat alamat customer.
- Admin dapat melihat alamat default.
- Admin dapat mencari alamat berdasarkan customer/city.
- Alamat yang sudah dipakai order tidak mengubah snapshot order lama.

---

## 22. Modul 17 — Voucher Management

### 22.1 Deskripsi

Modul untuk mengelola kode promo.

Database:

```text
vouchers
orders
```

Tabel `vouchers` menyimpan kode unik, nama, deskripsi, jenis diskon, nilai diskon, maksimum diskon, minimal order, limit penggunaan, jumlah penggunaan, tanggal mulai/berakhir, dan status aktif.

### 22.2 Halaman

```text
/admin/vouchers
/admin/vouchers/create
/admin/vouchers/{id}/edit
```

### 22.3 Field

1. Code.
2. Name.
3. Description.
4. Discount type:
   - fixed
   - percentage
5. Discount value.
6. Max discount.
7. Minimum order amount.
8. Usage limit.
9. Starts at.
10. Ends at.
11. Active status.

### 22.4 Validasi

- Code wajib unique.
- Discount type hanya `fixed` atau `percentage`.
- Jika percentage, value maksimal 100.
- Ends at tidak boleh lebih awal dari starts at.
- Voucher expired tidak bisa digunakan.
- Voucher inactive tidak bisa digunakan.

### 22.5 Acceptance Criteria

- Admin dapat membuat voucher.
- Admin dapat mengedit voucher.
- Admin dapat menonaktifkan voucher.
- Voucher dapat digunakan pada checkout jika valid.
- `used_count` bertambah setelah order paid, bukan saat pending payment.

---

## 23. Modul 18 — Notification Management

### 23.1 Deskripsi

Modul untuk melihat dan membuat notifikasi untuk customer.

Database:

```text
notifications
users
orders
```

Tabel `notifications` menyimpan title, message, type, reference type, reference ID, read status, dan read timestamp.

### 23.2 Halaman

```text
/admin/notifications
/admin/notifications/create
```

### 23.3 Fitur

1. List notifications.
2. Send notification to one customer.
3. Send notification to all customers.
4. Send notification by segment, misalnya customer aktif.
5. Filter by type:
   - order
   - payment
   - shipping
   - promo
   - system
6. Filter read/unread.

### 23.4 Auto Notification Events

Sistem otomatis membuat notifikasi saat:

1. Order dibuat.
2. Payment berhasil.
3. Order diproses.
4. Shipment dibuat.
5. Paket dikirim.
6. Paket delivered.
7. Promo baru aktif.

### 23.5 Acceptance Criteria

- Admin dapat melihat notifikasi.
- Admin dapat mengirim notifikasi manual.
- Notifikasi otomatis dibuat berdasarkan event order/payment/shipping.
- Customer dapat melihat notifikasi di halaman notification.

---

## 24. Modul 19 — Wishlist Management

### 24.1 Deskripsi

Modul ini bersifat read-only untuk admin agar bisa melihat produk yang banyak disukai customer.

Database:

```text
wishlists
products
users
```

Tabel `wishlists` memiliki unique index `user_id` dan `product_id`, sehingga satu customer tidak bisa menyimpan produk yang sama lebih dari sekali.

### 24.2 Fitur

1. Lihat produk paling banyak masuk wishlist.
2. Lihat wishlist customer tertentu.
3. Filter berdasarkan produk/kategori.
4. Insight untuk produk favorit.

### 24.3 Acceptance Criteria

- Admin dapat melihat produk favorit customer.
- Admin tidak perlu mengubah wishlist customer kecuali untuk kebutuhan support.
- Data wishlist dapat digunakan untuk insight produk populer.

---

## 25. Modul 20 — Banner Management

### 25.1 Deskripsi

Modul untuk mengelola banner landing page, promo, dan collection.

Database:

```text
banners
```

Tabel `banners` mendukung title, subtitle, image desktop, image mobile, button text, button URL, placement, sort order, active status, start time, dan end time.

### 25.2 Halaman

```text
/admin/banners
/admin/banners/create
/admin/banners/{id}/edit
```

### 25.3 Field

1. Title.
2. Subtitle.
3. Image desktop.
4. Image mobile.
5. Button text.
6. Button URL.
7. Placement:
   - homepage
   - collection
   - promo
8. Sort order.
9. Active status.
10. Starts at.
11. Ends at.

### 25.4 Validasi

- Title wajib.
- Desktop image wajib.
- Button URL harus valid jika diisi.
- Ends at tidak boleh sebelum starts at.
- Banner hanya tampil jika:
  - `is_active = true`
  - sekarang berada dalam range starts_at dan ends_at, jika diisi.

### 25.5 Acceptance Criteria

- Admin dapat membuat banner.
- Admin dapat upload desktop dan mobile banner.
- Admin dapat mengatur urutan banner.
- Banner aktif tampil di customer landing page.

---

## 26. Modul 21 — Page Management

### 26.1 Deskripsi

Modul untuk mengelola halaman statis.

Database:

```text
pages
```

Tabel `pages` menyimpan title, slug, content, type, meta title, meta description, dan active status. Type dapat berupa about, contact, FAQ, terms, privacy, shipping policy, no return/refund policy, dan size guide.

### 26.2 Halaman

```text
/admin/pages
/admin/pages/create
/admin/pages/{id}/edit
```

### 26.3 Page Types

```text
about
contact
faq
terms_conditions
privacy_policy
shipping_policy
no_return_refund_policy
size_guide
```

### 26.4 Field

1. Title.
2. Slug.
3. Type.
4. Content.
5. Meta title.
6. Meta description.
7. Active status.

### 26.5 Fitur

1. Rich text editor.
2. Preview page.
3. SEO fields.
4. Activate/deactivate page.

### 26.6 Acceptance Criteria

- Admin dapat membuat halaman statis.
- Admin dapat mengedit konten halaman.
- Halaman inactive tidak tampil di customer.
- Slug harus unique.
- Halaman no return/refund wajib tersedia sebelum website production.

---

## 27. Modul 22 — Site Settings

### 27.1 Deskripsi

Modul untuk mengelola pengaturan umum website.

Database:

```text
site_settings
```

Tabel `site_settings` menggunakan model key-value dengan field `key`, `value`, dan `type`, sehingga fleksibel untuk menyimpan pengaturan website.

### 27.2 Halaman

```text
/admin/settings
/admin/settings/store
/admin/settings/seo
/admin/settings/payment
/admin/settings/shipping
```

### 27.3 Store Settings

Field:

1. Store name.
2. Store email.
3. Store phone.
4. WhatsApp number.
5. Store address.
6. Store logo.
7. Store favicon.
8. Instagram URL.
9. TikTok URL.
10. Footer text.

### 27.4 SEO Settings

Field:

1. Default meta title.
2. Default meta description.
3. Open Graph image.
4. Default keywords.

### 27.5 Payment Settings

Field non-sensitive dapat disimpan di database:

1. Midtrans environment:
   - sandbox
   - production
2. Midtrans client key.
3. Payment expiry duration.
4. Payment service fee.

Data sensitif seperti Midtrans Server Key sebaiknya tetap di `.env`, bukan database.

### 27.6 Shipping Settings

Field:

1. Origin address.
2. Origin province.
3. Origin city.
4. Origin district.
5. Origin postal code.
6. Origin Biteship area ID.
7. Shipper name.
8. Shipper phone.
9. Enabled couriers.

Data sensitif seperti Biteship API Key sebaiknya tetap di `.env`.

### 27.7 Acceptance Criteria

- Admin dapat mengubah informasi toko.
- Admin dapat mengubah SEO default.
- Admin dapat mengubah origin shipping.
- API key sensitif tidak ditampilkan secara penuh.
- Perubahan setting langsung mempengaruhi tampilan website.

---

## 28. Modul 23 — Admin User Management

### 28.1 Deskripsi

Modul untuk mengelola akun admin.

Database:

```text
users
```

### 28.2 Halaman

```text
/admin/admin-users
/admin/admin-users/create
/admin/admin-users/{id}/edit
```

### 28.3 Field

1. Name.
2. Email.
3. Phone.
4. Password.
5. Avatar.
6. Active status.

Role otomatis:

```text
admin
```

### 28.4 Fitur

1. Create admin.
2. Edit admin.
3. Deactivate admin.
4. Reset password.
5. Change avatar.

### 28.5 Rule

- Admin tidak boleh menghapus dirinya sendiri.
- Admin tidak boleh menonaktifkan dirinya sendiri.
- Email harus unique.
- Password minimal 8 karakter.
- Minimal harus ada 1 admin aktif.

### 28.6 Acceptance Criteria

- Admin dapat membuat admin lain.
- Admin dapat menonaktifkan admin lain.
- Sistem mencegah kondisi tidak ada admin aktif.
- Admin customer dipisahkan berdasarkan `role`.

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

## 32. Rekomendasi Arsitektur Laravel

### 32.1 Folder Controller

```text
app/Http/Controllers/Admin/DashboardController.php
app/Http/Controllers/Admin/ProductController.php
app/Http/Controllers/Admin/ProductVariantController.php
app/Http/Controllers/Admin/CategoryController.php
app/Http/Controllers/Admin/CollectionController.php
app/Http/Controllers/Admin/OrderController.php
app/Http/Controllers/Admin/PaymentController.php
app/Http/Controllers/Admin/ShipmentController.php
app/Http/Controllers/Admin/CustomerController.php
app/Http/Controllers/Admin/VoucherController.php
app/Http/Controllers/Admin/BannerController.php
app/Http/Controllers/Admin/PageController.php
app/Http/Controllers/Admin/SettingController.php
app/Http/Controllers/Admin/ReportController.php
```

### 32.2 Service Layer

```text
app/Services/ProductService.php
app/Services/StockService.php
app/Services/OrderService.php
app/Services/Payment/MidtransService.php
app/Services/Shipping/BiteshipService.php
app/Services/ReportService.php
app/Services/NotificationService.php
```

### 32.3 Request Validation

```text
app/Http/Requests/Admin/ProductRequest.php
app/Http/Requests/Admin/ProductVariantRequest.php
app/Http/Requests/Admin/CategoryRequest.php
app/Http/Requests/Admin/CollectionRequest.php
app/Http/Requests/Admin/OrderStatusRequest.php
app/Http/Requests/Admin/VoucherRequest.php
app/Http/Requests/Admin/BannerRequest.php
app/Http/Requests/Admin/PageRequest.php
app/Http/Requests/Admin/SettingRequest.php
```

### 32.4 Frontend Pages

```text
resources/js/Pages/Admin/Dashboard/Index.tsx

resources/js/Pages/Admin/Products/Index.tsx
resources/js/Pages/Admin/Products/Create.tsx
resources/js/Pages/Admin/Products/Edit.tsx
resources/js/Pages/Admin/Products/Show.tsx

resources/js/Pages/Admin/Categories/Index.tsx
resources/js/Pages/Admin/Collections/Index.tsx

resources/js/Pages/Admin/Orders/Index.tsx
resources/js/Pages/Admin/Orders/Show.tsx

resources/js/Pages/Admin/Payments/Index.tsx
resources/js/Pages/Admin/Shipments/Index.tsx

resources/js/Pages/Admin/Customers/Index.tsx
resources/js/Pages/Admin/Customers/Show.tsx

resources/js/Pages/Admin/Vouchers/Index.tsx
resources/js/Pages/Admin/Banners/Index.tsx
resources/js/Pages/Admin/Pages/Index.tsx
resources/js/Pages/Admin/Settings/Index.tsx
resources/js/Pages/Admin/Reports/Index.tsx
```

### 32.5 Shared Components

```text
resources/js/Components/Admin/AdminLayout.tsx
resources/js/Components/Admin/Sidebar.tsx
resources/js/Components/Admin/Header.tsx
resources/js/Components/Admin/DataTable.tsx
resources/js/Components/Admin/StatusBadge.tsx
resources/js/Components/Admin/StatCard.tsx
resources/js/Components/Admin/DateRangePicker.tsx
resources/js/Components/Admin/ImageUploader.tsx
resources/js/Components/Admin/ConfirmDialog.tsx
resources/js/Components/Admin/RichTextEditor.tsx
```

---

## 33. Rekomendasi Route Laravel

```php
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::resource('products', ProductController::class);
    Route::resource('product-variants', ProductVariantController::class)->only(['store', 'update', 'destroy']);
    Route::post('product-variants/{variant}/adjust-stock', [StockController::class, 'adjust'])->name('variants.adjust-stock');

    Route::resource('categories', CategoryController::class);
    Route::resource('collections', CollectionController::class);

    Route::get('stock', [StockController::class, 'index'])->name('stock.index');
    Route::get('stock/logs', [StockController::class, 'logs'])->name('stock.logs');

    Route::resource('orders', OrderController::class)->only(['index', 'show', 'update']);
    Route::post('orders/{order}/status', [OrderStatusController::class, 'update'])->name('orders.status');
    Route::post('orders/{order}/create-shipment', [ShipmentController::class, 'createFromOrder'])->name('orders.create-shipment');

    Route::resource('payments', PaymentController::class)->only(['index', 'show']);
    Route::post('payments/{payment}/sync', [PaymentController::class, 'sync'])->name('payments.sync');
    Route::get('payment-logs', [PaymentLogController::class, 'index'])->name('payment-logs.index');

    Route::resource('shipments', ShipmentController::class)->only(['index', 'show']);
    Route::post('shipments/{shipment}/refresh-tracking', [ShipmentController::class, 'refreshTracking'])->name('shipments.refresh-tracking');

    Route::resource('customers', CustomerController::class)->only(['index', 'show', 'update']);

    Route::resource('vouchers', VoucherController::class);
    Route::resource('notifications', NotificationController::class)->only(['index', 'create', 'store']);
    Route::resource('banners', BannerController::class);
    Route::resource('pages', PageController::class);
    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');

    Route::get('reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
    Route::get('reports/products', [ReportController::class, 'products'])->name('reports.products');
    Route::get('reports/customers', [ReportController::class, 'customers'])->name('reports.customers');
});
```

---

## 34. Permission Matrix

| Modul | Admin |
|---|---|
| Dashboard Overview | Full Access |
| Products | Create, Read, Update, Archive |
| Product Images | Create, Read, Update, Delete |
| Product Variants | Create, Read, Update, Disable |
| Stock | Read, Adjust |
| Categories | CRUD |
| Collections | CRUD |
| Orders | Read, Update Status |
| Payments | Read, Sync |
| Refund | No Access / Not Available |
| Shipments | Create, Read, Track |
| Customers | Read, Activate/Deactivate |
| Vouchers | CRUD |
| Notifications | Create, Read |
| Banners | CRUD |
| Pages | CRUD |
| Settings | Update |
| Reports | Read, Export |

---

## 35. Non-Functional Requirements

### 35.1 Security

1. Dashboard hanya untuk admin.
2. Gunakan middleware `auth` dan `admin`.
3. Gunakan CSRF protection.
4. Gunakan Laravel Policy/Gate untuk module sensitif.
5. API key Midtrans/Biteship disimpan di `.env`.
6. Jangan tampilkan password atau token.
7. Validasi semua input menggunakan Form Request.
8. File upload harus divalidasi.
9. Batasi akses raw payload webhook hanya untuk admin.

### 35.2 Performance

1. Gunakan pagination pada semua tabel.
2. Gunakan eager loading untuk relasi.
3. Gunakan index untuk field status dan tanggal.
4. Dashboard aggregate dapat dicache beberapa menit.
5. Report besar diproses dengan queue/export job.

### 35.3 UX

1. Semua tabel memiliki search, filter, sorting, pagination.
2. Status menggunakan badge warna.
3. Form memiliki validation error jelas.
4. Gunakan confirm dialog untuk action penting.
5. Gunakan toast notification setelah action berhasil/gagal.
6. Gunakan skeleton loading untuk data berat.
7. Layout responsive untuk tablet/laptop.

### 35.4 Reliability

1. Webhook harus idempotent.
2. Update order dan stok harus menggunakan database transaction.
3. Create shipment tidak boleh double.
4. Payment success tidak boleh mengurangi stok dua kali.
5. Semua log webhook harus disimpan.

---

## 36. Index Database yang Disarankan

Agar dashboard cepat, tambahkan index berikut:

```text
users.role
users.email
users.is_active

products.slug
products.status
products.category_id
products.collection_id

product_variants.product_id
product_variants.sku
product_variants.stock
product_variants.is_active

orders.order_number
orders.user_id
orders.payment_status
orders.order_status
orders.shipping_status
orders.created_at
orders.paid_at

payments.order_id
payments.midtrans_order_id
payments.transaction_status

shipments.order_id
shipments.waybill_id
shipments.shipping_status
shipments.courier_company

notifications.user_id
notifications.is_read
notifications.type

stock_logs.product_variant_id
stock_logs.created_at
```

---

## 37. MVP Scope Dashboard Admin

Untuk tahap awal, modul yang wajib dibuat:

1. Admin login.
2. Dashboard overview.
3. Product management.
4. Product image management.
5. Product variant management.
6. Category management.
7. Collection management.
8. Stock management.
9. Order management.
10. Payment management.
11. Shipment management.
12. Customer management.
13. Banner management.
14. Page management.
15. Site settings.

Modul yang bisa dibuat setelah MVP:

1. Voucher management.
2. Report advanced.
3. Wishlist insight.
4. Manual notification.
5. Admin activity logs.
6. Export Excel/PDF.
7. Advanced role permission.

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

## 40. Rekomendasi Soft Delete

Soft delete sebaiknya tidak digunakan di semua tabel. Gunakan soft delete untuk data master atau data yang masih mungkin dipulihkan, tetapi jangan gunakan soft delete untuk data transaksi/log yang harus immutable.

### 40.1 Tabel yang Disarankan Menggunakan Soft Delete

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

### 40.2 Tabel Opsional Menggunakan Soft Delete

```text
carts
cart_items
wishlists
site_settings
```

### 40.3 Tabel yang Tidak Disarankan Menggunakan Soft Delete

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

Alasannya, tabel transaksi, pembayaran, shipment, webhook log, dan stock log harus tetap utuh untuk audit dan laporan.

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

