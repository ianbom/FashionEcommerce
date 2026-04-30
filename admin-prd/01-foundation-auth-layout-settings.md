# PRD 01 — Foundation, Admin Auth, Layout, Settings

## Scope

PRD ini menjadi fondasi awal yang harus dikerjakan sebelum modul lain. Bagian ini mencakup ringkasan produk, tujuan, target pengguna, tech stack, sidebar, admin authentication & authorization, site settings, admin user management, arsitektur Laravel/Inertia, route dasar, permission matrix, non-functional requirements, index database, dan rekomendasi soft delete.

## Dependency

Tidak bergantung pada PRD lain. Ini adalah phase pertama.

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
Zod / Valibot optional
Recharts
```

### 4.3 Database

```text
MySQL / PostgreSQL
```

### 4.4 Integrasi

```text
Midtrans
Biteship
Laravel Storage / S3-compatible storage optional
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
