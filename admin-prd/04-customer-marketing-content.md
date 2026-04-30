# PRD 04 — Customer, Marketing, Notification, Content Management

## Scope

PRD ini mencakup customer management, customer address management, voucher, notification, wishlist insight, banner, dan page management. Modul ini aman dikerjakan setelah transaksi inti karena sebagian besar adalah pengelolaan data pendukung, marketing, dan konten.

## Dependency

Dikerjakan setelah PRD 01. Untuk notification otomatis dan voucher usage yang akurat, idealnya dikerjakan setelah PRD 03.

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
