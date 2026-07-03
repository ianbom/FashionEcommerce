# PRD - Fashion E-Commerce Shayda

## 1. Ringkasan Produk

Fashion E-Commerce Shayda adalah aplikasi toko online modest fashion berbasis Laravel 13, Inertia React, dan TypeScript. Produk mendukung kategori, koleksi, gambar, varian warna/ukuran, stok, wishlist, cart, checkout, voucher, pembayaran Midtrans, pengiriman Biteship, notifikasi customer, dan dashboard admin operasional.

Dokumen ini dibuat dari codebase saat ini, bukan dari ide fitur baru. Detail admin yang lebih panjang tetap ada di `prd-admin.md`; file ini menjadi PRD produk end-to-end.

## 2. Tujuan Produk

1. Customer dapat menemukan produk modest fashion melalui homepage, katalog, filter, dan detail produk.
2. Customer dapat membuat akun, login, verifikasi email, login Google, mengelola profil, alamat, keamanan, wishlist, cart, checkout, dan order.
3. Sistem dapat menghitung stok tersedia secara akurat dari `stock - reserved_stock`.
4. Sistem dapat membuat order, mengunci stok sementara, membuat transaksi Midtrans, dan memperbarui status melalui webhook.
5. Sistem dapat mengambil ongkir dan membuat pengiriman melalui Biteship.
6. Admin dapat mengelola katalog, stok, order, payment, shipment, customer, voucher, konten, setting, report, dan audit log.
7. Semua transaksi penting harus idempotent, tervalidasi, dan memiliki log audit/webhook.

## 3. Target Pengguna

### Customer

Customer adalah pembeli yang dapat:

- Melihat homepage, katalog produk, detail produk, dan halaman policy.
- Register, login email/password, login Google, verifikasi email, reset password.
- Mengaktifkan 2FA dari halaman security.
- Mengelola profil dan alamat pengiriman.
- Menambahkan produk ke wishlist dan cart.
- Memilih alamat, mengambil ongkir Biteship, memakai voucher, menyetujui no return/refund, lalu checkout via Midtrans.
- Melihat order, detail order, status payment/shipment, dan notifikasi.
- Membatalkan order hanya sebelum pembayaran berhasil.

### Admin

Admin adalah user internal dengan `role = admin` dan `is_active = true` yang dapat:

- Mengakses `/admin/dashboard`.
- Mengelola produk, gambar produk, varian, kategori, koleksi, stok.
- Mengelola order, payment, payment logs, shipment, Biteship webhook logs.
- Mengelola customer, alamat customer, voucher, notifikasi, wishlist insight.
- Mengelola banner, halaman statis, site settings, admin users.
- Melihat report dan audit log.

## 4. Tech Stack

Backend:

- PHP 8.3
- Laravel 13
- Inertia Laravel 3
- Fortify
- Sanctum
- Socialite Google OAuth
- Laravel Wayfinder
- Pest

Frontend:

- React 19
- TypeScript
- Inertia React 3
- Vite
- Tailwind CSS 4
- Radix UI / shadcn-style components
- Lucide React
- Recharts
- TipTap editor
- React Leaflet / Leaflet
- Sonner toast

Integrasi:

- Midtrans Snap dan payment status API
- Biteship area search, shipping rate, order, tracking/webhook
- Laravel Storage public disk

## 5. Modul Customer

### 5.1 Homepage

Route utama: `/`

Homepage menampilkan:

- Hero banners aktif berdasarkan placement.
- Produk featured, new arrival, best seller.
- Koleksi/kategori pilihan.
- Product tile berisi gambar utama, harga, label, badge, dan stock summary.

Acceptance criteria:

- Produk yang tampil hanya `status = published`.
- Produk nonaktif, draft, archived, atau varian tanpa stok tersedia tidak boleh ditawarkan sebagai available.
- Banner mengikuti `placement`, `sort_order`, `is_active`, dan periode aktif.

### 5.2 Product Listing

Route utama: `/list`

Customer dapat:

- Melihat daftar produk published.
- Filter berdasarkan kategori, koleksi, warna, ukuran, availability.
- Sort produk sesuai opsi UI.
- Melihat harga final dari `sale_price` atau `base_price`.

Acceptance criteria:

- Availability dihitung dari varian aktif dengan `stock > reserved_stock`.
- Filter tidak boleh menampilkan produk draft/archived.
- Pagination/filter harus mempertahankan state query.

### 5.3 Product Detail

Route utama: `/detail`

Customer dapat:

- Melihat galeri produk, deskripsi, material, care instruction.
- Memilih varian warna/ukuran.
- Melihat stock tersedia per varian.
- Menambah varian ke cart.
- Menambah/menghapus produk dari wishlist.
- Melihat related/recent products.

Acceptance criteria:

- Tombol add to cart hanya valid untuk varian aktif dengan stok tersedia.
- Quantity cart tidak boleh melebihi stok tersedia.
- Gambar utama dan alt text dipakai dari `product_images`.

### 5.4 Auth dan Security

Fitur:

- Register.
- Login.
- Logout.
- Forgot/reset password.
- Email verification.
- Google OAuth.
- Password confirmation.
- Two-factor challenge.
- Profile update.
- Password update.
- Delete profile.
- Appearance setting.

Acceptance criteria:

- Halaman customer protected membutuhkan `auth` dan `verified`.
- Admin yang masuk `/dashboard` diarahkan ke dashboard admin.
- Customer yang masuk `/dashboard` diarahkan ke `/my-profile`.
- User inactive tidak boleh dipakai untuk operasional admin.

### 5.5 Profile dan Address Book

Routes:

- `/my-profile`
- `/address`
- `/biteship/areas`

Customer dapat:

- Mengubah nama, email, phone, avatar.
- Membuat, mengubah, menghapus alamat.
- Menandai satu alamat default.
- Mencari area Biteship.
- Menyimpan province, city, district, subdistrict, postal code, `biteship_area_id`, latitude, longitude, full address, note.

Acceptance criteria:

- Customer hanya dapat mengelola alamat miliknya sendiri.
- Hanya satu alamat default per customer.
- Alamat checkout harus punya `biteship_area_id`, postal code, dan koordinat yang cukup untuk ongkir.

### 5.6 Wishlist

Route utama: `/wishlist`

Customer dapat:

- Menambah produk ke wishlist dari detail/list.
- Melihat semua wishlist.
- Menghapus wishlist item.

Acceptance criteria:

- Kombinasi `user_id + product_id` unik.
- Wishlist hanya menampilkan produk yang masih dapat dibuka customer.
- Delete hanya boleh untuk owner wishlist.

### 5.7 Cart

Route utama: `/my-cart`

Customer dapat:

- Menambah varian produk ke cart.
- Mengubah quantity cart item.
- Menghapus cart item.
- Melihat summary subtotal.
- Melihat suggested products.

Acceptance criteria:

- Satu user punya satu cart.
- Satu varian hanya boleh muncul sekali dalam cart.
- `price_snapshot` tersimpan saat item masuk cart.
- Quantity divalidasi terhadap `stock - reserved_stock`.

### 5.8 Checkout

Routes:

- `/checkout`
- `/checkout/shipping-rates`
- `/checkout/shipping-rate`
- `/checkout/voucher`
- `/checkout/place-order`

Customer dapat:

- Memilih alamat.
- Mengambil shipping rates dari Biteship.
- Memilih satu shipping rate.
- Apply/remove voucher.
- Menulis notes.
- Menyetujui no return/refund.
- Place order dan diarahkan ke Midtrans Snap redirect URL.

Acceptance criteria:

- Checkout wajib memakai idempotency key.
- Order tidak boleh dibuat jika cart kosong.
- Shipping rate punya TTL dan harus divalidasi ulang ke provider sebelum order dibuat.
- Jika cart berubah, customer harus memilih ulang ongkir.
- Jika harga produk berubah, customer harus review ulang cart.
- Voucher divalidasi ulang dengan lock sebelum order dibuat.
- Saat order dibuat, `reserved_stock` bertambah.
- Jika pembuatan transaksi Midtrans gagal, reserved stock dan voucher usage harus dilepas.
- Checkout berhasil mengosongkan cart dan menyimpan snapshot item/alamat.

### 5.9 Payment Midtrans

Routes/API:

- Payment redirect dari checkout memakai URL Midtrans.
- `/api/payments/midtrans/notification`

Sistem:

- Membuat transaksi Snap.
- Menyimpan token dan redirect URL.
- Menerima webhook.
- Validasi signature.
- Validasi gross amount.
- Menyimpan `payment_logs`.
- Mengabaikan duplicate webhook via `payload_hash`.
- Menerapkan status payment/order.

Status payment:

- `pending`
- `paid`
- `manual_review`
- `failed`
- `cancelled`
- `expired`
- `refunded`
- `partially_refunded`

Acceptance criteria:

- Payment paid mem-finalisasi reserved stock menjadi stock keluar.
- Payment failed/cancelled/expired melepas reserved stock dan voucher usage.
- Paid order tidak boleh mundur ke pending/failed karena webhook terlambat.
- Webhook invalid signature ditolak.
- Nominal mismatch masuk log rejected dan tidak mengubah order.

### 5.10 Order Customer

Routes:

- `/my-order`
- `/my-order/{order}`
- `/my-order/{order}/cancel`

Customer dapat:

- Melihat daftar order.
- Filter order/payment status.
- Melihat detail order, item snapshot, alamat snapshot, payment, shipment, tracking.
- Membuka ulang payment redirect jika masih pending.
- Cancel order sebelum payment berhasil.

Acceptance criteria:

- Customer hanya melihat order miliknya.
- Cancel hanya untuk payment pending.
- Cancel mencoba Midtrans cancel jika transaksi provider sudah ada; fallback local cancel jika belum ada transaksi provider.
- Cancel melepas stok reserved dan voucher usage.

### 5.11 Shipment Biteship

Routes/API:

- Admin create shipment dari order.
- `/api/shipments/biteship/webhook`

Sistem:

- Mengambil shipping rate saat checkout.
- Membuat order Biteship saat admin memproses shipment.
- Menyimpan courier, waybill, tracking ID, label URL, biaya, estimasi, status.
- Menerima webhook tracking.
- Menyimpan `biteship_webhook_logs`.
- Menyimpan timeline `shipment_trackings`.

Shipping status:

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

Acceptance criteria:

- Satu order hanya boleh punya satu shipment.
- Duplicate Biteship webhook diabaikan via hash.
- Tracking event tidak boleh duplikat.
- Delivered mengubah shipment/order menjadi delivered.
- Failed/problem/lost/returned harus terlihat di admin.

### 5.12 Notifications

Routes:

- `/notifications`
- `/notifications/read-all`
- `/notifications/{notification}/read`

Customer dapat:

- Melihat notifikasi order/payment/shipping/promo/system.
- Mark single notification as read.
- Mark all as read.

Acceptance criteria:

- Customer hanya bisa update notifikasi miliknya.
- Payment/shipping/order status penting membuat notifikasi.

### 5.13 Policy Pages

Routes:

- `/privacy-policy`
- `/no-return-policy`
- `/shipping-policy`
- `/terms-conditions`

Acceptance criteria:

- Halaman policy bisa dikelola admin melalui Pages.
- No return/refund agreement wajib di checkout.

## 6. Modul Admin

Admin scope sudah dirinci di `prd-admin.md`. Ringkasan modul aktif:

1. Dashboard overview.
2. Product CRUD, publish, archive, duplicate, delete terbatas.
3. Product images dan variants.
4. Category dan collection CRUD.
5. Stock index, logs, adjustment.
6. Order index/detail/status/notes/create shipment.
7. Payment index/detail/sync.
8. Payment logs read-only.
9. Shipment index/detail/status/refresh tracking.
10. Biteship webhook logs read-only.
11. Customer index/detail/toggle active.
12. Customer address management.
13. Voucher CRUD.
14. Manual notifications.
15. Wishlist insight.
16. Banner CRUD.
17. Pages CRUD.
18. Store/contact/payment/shipping settings.
19. Admin user management.
20. Reports: sales, products, customers, shipments, vouchers.
21. Audit logs.

Admin acceptance criteria:

- Semua route admin memakai `auth`, `verified`, `admin`, dan `admin.activity`.
- Semua write admin memakai Form Request authorization `role = admin` dan `is_active`.
- Aktivitas admin penting masuk `admin_activity_logs`.
- Semua list admin mendukung search/filter/pagination sesuai modul.
- Log webhook/payment/stock/audit tidak boleh diedit dari UI.

## 7. Data Model Utama

Core identity:

- `users`
- `customer_addresses`
- `sessions`
- `personal_access_tokens`

Catalog:

- `categories`
- `collections`
- `products`
- `product_images`
- `product_variants`
- `stock_logs`

Shopping:

- `carts`
- `cart_items`
- `wishlists`
- `vouchers`

Orders:

- `orders`
- `order_items`
- `order_addresses`

Payment:

- `payments`
- `payment_logs`

Shipping:

- `shipments`
- `shipment_trackings`
- `biteship_webhook_logs`

Content/config:

- `banners`
- `pages`
- `site_settings`
- `notifications`
- `admin_activity_logs`

## 8. Critical Business Rules

1. Available stock adalah `stock - reserved_stock`.
2. Cart dan checkout tidak boleh memakai stok mentah tanpa reserved stock.
3. Order menyimpan snapshot produk, varian, harga, berat, dimensi, gambar, dan alamat.
4. Order creation harus transaction-safe.
5. Checkout harus idempotent per user dan idempotency key.
6. Payment webhook harus signature-valid, amount-valid, dan duplicate-safe.
7. Paid order tidak boleh dibatalkan customer.
8. Refund/return ada sebagai status provider/order, tetapi product policy saat ini adalah no return/refund.
9. Voucher usage bertambah saat order dibuat dan dilepas jika payment gagal/cancel/expired.
10. Shipment hanya dibuat satu kali per order.
11. Sensitive provider keys tetap di `.env`, bukan database.
12. File upload wajib validasi image dan size.

## 9. Status Flow

Payment flow:

```text
pending
-> paid
-> manual_review
-> failed
-> cancelled
-> expired
-> refunded / partially_refunded
```

Order happy path:

```text
pending_payment
-> paid
-> processing
-> ready_to_ship
-> shipment_created
-> shipped
-> delivered
-> completed
```

Order failure/issue path:

```text
pending_payment -> payment_failed
pending_payment -> payment_expired
pending_payment -> cancelled
paid/processing -> shipment_failed
shipped -> shipment_problem / lost / returned
paid -> refunded
```

Shipping happy path:

```text
not_created
-> creating
-> confirmed
-> allocated
-> picked
-> in_transit
-> delivered
```

Shipping issue path:

```text
creating -> failed
confirmed/allocated/picked/in_transit -> problem / lost / returned / cancelled
```

## 10. Non-Functional Requirements

Security:

- CSRF protection untuk web routes.
- Fortify untuk auth flow.
- Sanctum token table tersedia.
- Admin middleware wajib di semua route admin.
- Webhook Midtrans wajib validasi signature.
- API key Midtrans/Biteship disimpan di env/config.
- Raw webhook payload hanya untuk admin.

Reliability:

- Database transaction untuk checkout, payment status apply, stock adjustment, shipment creation/status update.
- Webhook idempotent via payload hash.
- Scheduled command `payments:sync-expired-midtrans` berjalan tiap menit tanpa overlap.
- Stok dan voucher release/finalize harus idempotent.

Performance:

- Semua index/list memakai pagination.
- Query katalog memakai eager loading untuk images/variants/category/collection.
- Index status/tanggal dipakai untuk order/payment/shipment/report.
- Report besar diekspor stream CSV.

UX:

- Customer mobile-first untuk katalog, cart, checkout, order, wishlist.
- Admin dense dashboard untuk operasi harian.
- Error validasi harus jelas dalam Bahasa Indonesia bila datang dari Form Request/service.
- Toast/flash untuk action berhasil/gagal.

Compliance/policy:

- No return/refund harus eksplisit di checkout.
- Policy pages harus tersedia sebelum production.
- Data transaksi/log tidak boleh dihapus sembarangan.

## 11. MVP Saat Ini

Termasuk MVP:

1. Customer browsing, product detail, wishlist, cart.
2. Auth, verified customer pages, profile, address.
3. Checkout dengan Biteship rates, voucher, Midtrans Snap.
4. Midtrans webhook dan expiry sync.
5. Customer order history/detail/cancel pending order.
6. Customer notifications.
7. Admin full operational dashboard sesuai modul aktif.
8. Seeder katalog Shayda, banners, pages, settings, users.

Di luar MVP / kandidat next:

1. Multi-role permission selain admin/customer.
2. Full refund/return workflow.
3. Order status history table terpisah.
4. Multi-collection pivot untuk satu produk di banyak koleksi.
5. Export XLSX/PDF.
6. Email/WhatsApp notification.
7. Public dynamic CMS route untuk semua pages.
8. Inventory reservation expiry cleanup khusus selain payment expiry.
9. Advanced search/autocomplete.

## 12. Success Metrics

Produk dianggap berhasil jika:

1. Customer bisa checkout end-to-end sampai menerima Midtrans redirect.
2. Payment webhook paid mengubah order menjadi paid dan stock final benar.
3. Payment expired/cancelled/failed melepas reserved stock dan voucher usage.
4. Admin bisa memproses paid order sampai shipment created/delivered.
5. Customer bisa melihat status order, payment, shipment, dan notifikasi.
6. Produk published tampil di homepage/list/detail; draft/archived tidak tampil.
7. Admin bisa mengelola katalog dan stok tanpa edit database manual.
8. Webhook duplicate tidak membuat stok/payment/shipment berubah dua kali.
9. Report admin dapat membaca revenue hanya dari paid orders.
10. Tidak ada API key atau secret yang tersimpan di repo.

## 13. Referensi Implementasi

File utama:

- `routes/web.php`
- `routes/api.php`
- `routes/settings.php`
- `routes/console.php`
- `app/Models`
- `app/Services/Customer`
- `app/Services/Admin`
- `app/Services/Integrations`
- `app/Actions/Payments`
- `app/Actions/Stock`
- `app/Actions/Vouchers`
- `app/Http/Requests`
- `resources/js/pages`
- `database/migrations`
- `database/seeders`
- `prd-admin.md`
