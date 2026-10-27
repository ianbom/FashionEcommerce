# Analisis Arsitektur dan Codebase FashionECommerce

Dokumen analisis komprehensif sistem FashionECommerce (Laravel 13 + Inertia React).

---

## 1. Ikhtisar Stack Teknologi

- **Backend Framework**: Laravel 13 (PHP ^8.3)
- **Frontend Layer**: Inertia.js React 3.0 (`@inertiajs/react`), React 19, TypeScript
- **Styling & UI Primitives**: Tailwind CSS v4 (`@tailwindcss/vite`), Radix UI, Headless UI, Lucide React
- **Rich Text / CMS**: Tiptap Suite (`@tiptap/react`, `@tiptap/starter-kit`, extension highlight/placeholder/underline)
- **Maps & Geolocation**: Leaflet & React-Leaflet (estimasi jarak rute, koordinat toko & pembeli)
- **Routing & Type Generation**: Laravel Wayfinder (`@laravel/vite-plugin-wayfinder`, `laravel/wayfinder`)
- **Autentikasi & Otorisasi**: Laravel Fortify (Email/Password, 2FA, email verification), Laravel Socialite (Google OAuth), Laravel Sanctum (API token), kustom middleware role admin (`EnsureUserIsAdmin`, `LogAdminActivity`)
- **Integrasi Eksternal**:
  - **Midtrans Snap & Core API**: Payment gateway (Virtual Account BCA/BNI/BRI/Permata, Mandiri E-Channel, QRIS, GoPay, ShopeePay)
  - **Biteship API**: Logistik pihak ketiga (Pencarian area `/v1/maps/areas`, cek ongkir kurir `/v1/rates/couriers`, booking order pengiriman `/v1/orders`, live tracking)
- **Testing & Quality Assurance**: Pest 4, Pest Plugin Laravel, PHP Pint, ESLint 9, Prettier

---

## 2. Struktur Direktori dan Modul

```
FashionECommerce/
├── app/
│   ├── Actions/               # Atomic business operations
│   │   ├── Fortify/           # Registrasi & reset password
│   │   ├── Payments/          # Snap creation, status sync, manual confirmation
│   │   ├── Stock/             # Finalize & release reservasi stok
│   │   └── Vouchers/          # Release reservasi voucher
│   ├── Enums/                 # Domain state enums (OrderStatus, PaymentStatus, dll.)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/         # 21 Controller panel admin
│   │   │   ├── Auth/          # GoogleAuthController & auth handlers
│   │   │   ├── Customer/      # 11 Controller etalase, checkout, & webhook
│   │   │   └── Settings/      # Profil & keamanan akun
│   │   └── Middleware/        # Admin gate, Inertia shared props, audit log
│   ├── Jobs/                  # Background jobs (SyncExpiredMidtransPaymentsJob)
│   ├── Models/                # 25 Eloquent Models
│   └── Services/              # Domain logic services
│       ├── Admin/             # Layanan pengelolaan CRUD admin & reporting
│       ├── Customer/          # Checkout, cart, order, wishlist, browsing
│       ├── Integrations/      # MidtransService & BiteshipService
│       ├── Notifications/     # Notification dispatching
│       ├── Settings/          # Key-value site settings service
│       └── Stock/             # Stock reservation & ledger logs
├── database/
│   ├── factories/             # Model factories untuk testing
│   ├── migrations/            # Skema tabel database (termasuk audit & constraints)
│   └── seeders/               # Database seeder default & demo (ShaydaSeeder)
├── resources/
│   ├── css/                   # Stylesheet & Tailwind configuration
│   └── js/
│       ├── actions/           # Generated Wayfinder action callers
│       ├── components/        # Reusable UI & Layout components
│       ├── contexts/          # React contexts (CheckoutContext, dll.)
│       ├── hooks/             # Custom React hooks
│       ├── layouts/           # App, Admin Sidebar, Shop, & Auth Layouts
│       ├── pages/             # Inertia Page Components (Admin, Auth, Customer, Settings)
│       ├── routes/            # Generated Wayfinder route definitions
│       └── types/             # TypeScript definitions
├── routes/
│   ├── web.php                # Rute etalase customer, Inertia policy, & admin prefix
│   ├── api.php                # Endpoint Webhook publik (Midtrans & Biteship)
│   ├── settings.php           # Profil, keamanan, & appearance setting
│   └── console.php            # Scheduled console commands
└── tests/
    ├── Feature/               # Feature tests (Admin, Customer, Payments, Auth)
    ├── Unit/                  # Unit tests
    └── Concurrency/           # Concurrency race-condition test runner
```

---

## 3. Skema Data & Relasi Entitas (Database Schema)

Aplikasi memiliki 25 tabel inti yang saling terikat dengan foreign key dan integritas ketat:

1. **Pengguna & Akses**:
   - `users`: Kolom `role` (`admin` / `customer`), `google_id`, `deleted_at` (soft deletes), 2FA columns.
   - `admin_activity_logs`: Mencatat aktivitas mutasi oleh admin (HTTP method, target URL, IP, user-agent).
2. **Katalog & Inventaris Produk**:
   - `categories` & `collections`: Pengelompokan taksonomi produk dengan slug dan status aktif.
   - `products`: Informasi dasar produk, `base_price`, status `is_published`, rich guide `size_guide`.
   - `product_variants`: SKU unik, kombinasi `size` & `color`, `additional_price`, `stock`, `reserved_stock`, `alert_threshold`.
   - `product_images`: Multi-gambar produk, penanda `is_primary`, dan urutan `sort_order`.
   - `stock_logs`: Ledger mutasi stok (in, out, reserve, finalize, release) dengan referensi polimorfik.
3. **Keranjang & Promosi**:
   - `carts` & `cart_items`: Keranjang belanja per user dengan item merujuk ke `product_variants`.
   - `vouchers`: Kode promo diskon nominal/persentase, kuota pemakaian, minimum transaksi, masa berlaku, `usage_limit`, `used_count`, dan `reserved_count`.
4. **Transaksi & Pemesanan**:
   - `orders`: `order_number` unik, referensi customer, rincian biaya (`subtotal`, `shipping_cost`, `discount_amount`, `grand_total`), status order (`pending_payment`, `paid`, `processing`, `ready_to_ship`, `shipped`, `delivered`, `completed`, `cancelled`, `expired`), tanggal lunas & selesai.
   - `order_items`: Snapshot nama produk, varian, harga beli saat transaksi, dan kuantitas.
   - `order_addresses`: Snapshot alamat kirim pembeli, termasuk koordinat latitude/longitude dan `biteship_area_id`.
   - `payments`: Relasi 1-to-1 dengan order. Menyimpan `requested_payment_method` (metode yang dipilih customer), `snap_token`, `snap_redirect_url`, status Midtrans, payload log, dan tanggal jatuh tempo.
   - `payment_logs`: Jejak audit setiap perubahan/event webhook pembayaran.
5. **Logistik & Pengiriman**:
   - `shipments`: Menyimpan kurir (`courier_code`, `courier_service`), `tracking_number`, `biteship_order_id`, `biteship_tracking_id`, `waybill_id`, status pengiriman, ongkir, serta URL resi pengiriman (`label_url`).
   - `shipment_trackings`: Timeline pelacakan kurir dari webhook Biteship.
   - `biteship_webhook_logs`: Log payload asli webhook Biteship.
6. **Konten & Pengaturan Toko**:
   - `banners`: Banner promosi beranda.
   - `pages`: Halaman statis custom (Kebijakan privasi, terms, dsb.) dengan editor WYSIWYG Tiptap.
   - `site_settings`: Konfigurasi global berbasis key-value: alamat asal toko, koordinat toko (lat/lng), kurir aktif, durasi kedaluwarsa pembayaran Midtrans, nomor kontak WA toko.
   - `wishlists` & `notifications`: Favorit produk pembeli dan inbox notifikasi sistem.

---

## 4. Alur Bisnis Utama (Core Workflows)

### A. Alur Checkout & Reservasi Stok
1. **Validasi Keranjang & Alamat**: Customer memilih item keranjang dan alamat tujuan pengiriman.
2. **Kalkulasi Ongkir**: `CheckoutService::shippingRates()` memanggil `BiteshipService::shippingRates()` dengan koordinat/kode pos asal toko (dari `site_settings`) ke alamat tujuan.
3. **Aplikasi Voucher**: `CheckoutService::applyVoucher()` memvalidasi kuota dan syarat minimum order.
4. **Pemesanan (`placeOrder`)**:
   - Dijalankan dalam database transaction dengan lock pesimistik.
   - Varian stok diverifikasi: `stock - reserved_stock >= qty`.
   - Stok dicadangkan: `reserved_stock += qty` dan `StockLog` dicatat bertipe `reserve`.
   - Kuota voucher dicadangkan: `reserved_count += 1`.
   - Record `Order` dan `Payment` dibuat. Kolom `payments.requested_payment_method` diisi sesuai pilihan (BCA VA, QRIS, GoPay, dsb.).
   - `CreateMidtransSnapAction` memanggil Midtrans Snap API dengan parameter `enabled_payments` yang dibatasi pada metode yang dipilih. URL redirect dan snap token dikembalikan ke frontend.

### B. Alur Siklus Pembayaran (Payment Lifecycle)
1. **Pembayaran Berhasil via Webhook**:
   - Endpoint: `POST /api/payments/midtrans/notification`.
   - Signature SHA-512 divalidasi (`hash('sha512', order_id + status_code + gross_amount + server_key)`).
   - `ApplyMidtransPaymentStatusAction` mengubah status payment menjadi `paid`.
   - `FinalizeReservedStockAction` memotong stok fisik secara permanen (`stock -= qty`, `reserved_stock -= qty`).
   - Voucher dikonversi menjadi `used_count += 1`, `reserved_count -= 1`.
   - Status pesanan bergeser ke `paid`.
2. **Kedaluwarsa / Pembatalan**:
   - Jika pembayaran kedaluwarsa atau dibatalkan oleh customer/admin:
   - `ReleaseStockReservationAction` mengembalikan reservasi: `reserved_stock -= qty`.
   - `ReleaseVoucherReservationAction` mengembalikan kuota: `reserved_count -= 1`.
   - Status order menjadi `cancelled` atau `expired`.
3. **Background Job Sync**:
   - `SyncExpiredMidtransPaymentsJob` dijalankan terjadwal untuk memeriksa transaksi Midtrans yang kedaluwarsa di server gateway tanpa menunggu webhook masuk.

### C. Alur Pengiriman & Pemenuhan (Fulfillment)
1. Pesanan `paid` masuk ke antrean order admin.
2. Admin mengemas barang dan mengubah status ke `processing` lalu `ready_to_ship`.
3. Admin menekan tombol "Buat Pengiriman": `ShipmentController::createFromOrder()` memanggil `ShipmentManagementService::createFromOrder()`.
4. Sistem memanggil Biteship API `/v1/orders` untuk order pickup kurir otomatis.
5. Mendapatkan `waybill_id` (nomor resi), `biteship_order_id`, dan URL cetak label pengiriman.
6. Webhook Biteship (`POST /api/shipments/biteship/webhook`) menerima update pelacakan kurir real-time dan menyinkronkan status pesanan (`shipped` -> `delivered` -> `completed`).

---

## 5. Ringkasan Keamanan & Ketahanan (Safety & Resilience)

1. **Idempotensi & Concurrency**:
   - Tabel `orders` dan `payments` memiliki locking ketat dan penanganan race condition untuk mencegah double checkout atau double decrement stok.
   - Verifikasi hash SHA-512 pada webhook Midtrans mencegah spoofing status pembayaran.
2. **Pencegahan Data Loss**:
   - Penggunaan transaksi database (`DB::transaction`) di seluruh mutasi stok, checkout, dan pembayaran.
   - Soft deletes pada entitas `User` menjaga riwayat transaksi historis.
3. **Pemisahan Hak Akses**:
   - Customer dibatasi pada resource miliknya via Eloquent scoping (`user_id = auth()->id()`).
   - Panel admin diproteksi middleware `auth`, `admin`, dan `admin.activity`.
