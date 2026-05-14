# Laporan Pengujian E2E Customer Role

## 1. Ringkasan Pengujian

- Website: `http://127.0.0.1:8000/`
- Role yang Diuji: Customer
- Kredensial: `i.alehansyah@gmail.com` / `ianbom123`
- Tanggal Pengujian: 14 Mei 2026
- Status Keseluruhan: **Sebagian Lulus / Partially Passed**

Catatan utama: beberapa fitur customer dasar berjalan, tetapi alur belanja inti belum siap produksi karena halaman katalog default, add-to-cart, cart consistency, logout, checkout/payment terblokir.

---

## 2. Fitur yang Diuji

| Fitur | Status | Catatan |
|---|---|---|
| Login | Sebagian Lulus | Login valid berhasil. Validasi field kosong muncul. Login salah tidak menampilkan error jelas. |
| Homepage | Sebagian Lulus | Homepage tampil. Link dan section utama terlihat. Link `BELANJA SEMUA` ke `/list` sempat menghasilkan blank page. |
| Product Catalog | Sebagian Lulus | `/list?category=accessories` tampil. Search/filter tersedia. Empty result kurang informatif. |
| Product Detail | Gagal | Detail produk tampil, varian tampil, tetapi tombol tambah ke keranjang tidak berdampak. |
| Cart | Gagal | Setelah add-to-cart, cart tetap kosong. Badge cart sempat menampilkan angka tidak konsisten. |
| Wishlist | Sebagian Lulus | Toggle wishlist terlihat di katalog. Direct URL `/my-wishlist` menghasilkan 404. |
| Address | Sebagian Lulus | Halaman alamat tampil. Validasi required muncul. Pembuatan alamat baru tidak diselesaikan untuk menghindari data permanen. |
| Checkout | Terblokir | Tidak dapat diuji karena produk tidak berhasil masuk cart. |
| Payment | Terblokir | Tidak dapat diuji dari order baru. Existing orders hanya dicek tampilan status. |
| Orders | Lulus dengan Catatan | List/detail order tampil. Status expired/paid terlihat. |
| Notifications | Lulus | List notifikasi pembayaran tampil. Filter tersedia. |
| Profile | Sebagian Lulus | Data profil dan form password tampil. Logout tidak bekerja. |
| Authorization | Lulus | `/admin/dashboard` menghasilkan 403, `/admin` 404. |
| Responsive Design | Belum Lengkap | Pengujian desktop dilakukan. Mobile/tablet belum komprehensif karena keterbatasan tooling viewport. |

---

## 3. Bug yang Ditemukan

### Bug ID: CUST-001

**Severity:** Critical  
**Fitur:** Product Catalog  
**Page URL:** `http://127.0.0.1:8000/list`  
**Status:** Open

**Langkah Reproduksi:**
1. Login sebagai customer.
2. Buka homepage.
3. Klik navbar `BELANJA SEMUA`.

**Expected Result:**  
Halaman katalog produk tampil normal.

**Actual Result:**  
Halaman blank dengan DOM kosong: `<html><head></head><body></body></html>`.

**Evidence:**  
URL: `http://127.0.0.1:8000/list`, title `Shayda`, body kosong.

**Suggested Fix:**  
Perbaiki render route `/list` tanpa query. Tambahkan fallback loading/error state dan tangani error JavaScript yang tidak tertangkap.

---

### Bug ID: CUST-002

**Severity:** Critical  
**Fitur:** Product Detail / Cart  
**Page URL:** `http://127.0.0.1:8000/detail?product=kufah-khimar`  
**Status:** Open

**Langkah Reproduksi:**
1. Login sebagai customer.
2. Buka detail produk `Kufah Khimar`.
3. Pilih warna `Dark Plum`.
4. Pilih ukuran `Long+`.
5. Klik `TAMBAH KE KERANJANG`.
6. Buka `/my-cart`.

**Expected Result:**  
Produk masuk ke keranjang dengan varian dan quantity yang dipilih.

**Actual Result:**  
Keranjang tetap kosong.

**Evidence:**  
`/my-cart` menampilkan `Keranjangmu kosong` setelah add-to-cart.

**Suggested Fix:**  
Periksa API add-to-cart, mapping variant ID, validasi auth/session, serta tampilkan toast success/error. Tambahkan disabled/loading state saat request berlangsung.

---

### Bug ID: CUST-003

**Severity:** High  
**Fitur:** Login  
**Page URL:** `http://127.0.0.1:8000/login`  
**Status:** Open

**Langkah Reproduksi:**
1. Masukkan email `wrong@example.com`.
2. Masukkan password `badpass`.
3. Klik `Masuk`.

**Expected Result:**  
Muncul pesan error kredensial tidak valid.

**Actual Result:**  
Tidak ada pesan error yang terlihat; halaman tetap sama.

**Evidence:**  
Body text tidak berubah, tidak ada alert/toast/error message pada halaman.

**Suggested Fix:**  
Tampilkan error autentikasi di bawah form atau toast. Pertahankan input email agar user tidak perlu mengetik ulang.

---

### Bug ID: CUST-004

**Severity:** High  
**Fitur:** Logout  
**Page URL:** `http://127.0.0.1:8000/my-profile`  
**Status:** Open

**Langkah Reproduksi:**
1. Login sebagai customer.
2. Buka halaman profile.
3. Klik tombol `Keluar`.

**Expected Result:**  
Session berakhir dan user diarahkan ke homepage/login.

**Actual Result:**  
User tetap berada di halaman profile; session tidak berubah.

**Evidence:**  
URL tetap `http://127.0.0.1:8000/my-profile` setelah klik logout.

**Suggested Fix:**  
Pastikan tombol logout terhubung ke endpoint logout, melakukan invalidasi session/token, clear cache auth state, lalu redirect.

---

### Bug ID: CUST-005

**Severity:** Medium  
**Fitur:** Wishlist  
**Page URL:** `http://127.0.0.1:8000/my-wishlist`  
**Status:** Open

**Langkah Reproduksi:**
1. Login sebagai customer.
2. Tambahkan produk ke wishlist.
3. Akses langsung `/my-wishlist`.

**Expected Result:**  
Halaman wishlist tampil.

**Actual Result:**  
Halaman 404.

**Evidence:**  
Page title `Not Found`, heading `404`.

**Suggested Fix:**  
Samakan route sidebar/profile dengan route wishlist sebenarnya. Tambahkan alias route bila perlu.

---

### Bug ID: CUST-006

**Severity:** Medium  
**Fitur:** Product Catalog Search  
**Page URL:** `http://127.0.0.1:8000/list?category=accessories`  
**Status:** Open

**Langkah Reproduksi:**
1. Buka katalog kategori accessories.
2. Search keyword `zzzzzz`.
3. Tekan Enter.

**Expected Result:**  
Muncul empty state yang jelas, misalnya “Produk tidak ditemukan”.

**Actual Result:**  
Produk hilang dan hanya tombol `Atur Ulang Filter` yang terlihat tanpa penjelasan hasil kosong.

**Evidence:**  
Heading tetap `Semua Produk`, tidak ada pesan empty result.

**Suggested Fix:**  
Tambahkan empty state informatif, rekomendasi reset filter, dan saran keyword lain.

---

### Bug ID: CUST-007

**Severity:** Medium  
**Fitur:** Cart Badge  
**Page URL:** Navbar pada halaman order/profile  
**Status:** Open

**Langkah Reproduksi:**
1. Coba add-to-cart dari product detail.
2. Buka `/my-cart`, cart kosong.
3. Buka order detail/profile.
4. Lihat badge cart di navbar.

**Expected Result:**  
Badge cart sesuai jumlah item aktual di cart.

**Actual Result:**  
Badge cart sempat menampilkan `19`, sedangkan cart kosong.

**Evidence:**  
Order detail navbar menampilkan badge `19`; `/my-cart` menampilkan cart kosong.

**Suggested Fix:**  
Sinkronkan sumber data cart count dengan cart page. Refresh cart state setelah mutasi dan saat load halaman.

---

### Bug ID: CUST-008

**Severity:** Low  
**Fitur:** Footer Link  
**Page URL:** Homepage  
**Status:** Open

**Langkah Reproduksi:**
1. Buka homepage.
2. Inspect/click link footer `Cara Membeli`.

**Expected Result:**  
Mengarah ke halaman panduan pembelian.

**Actual Result:**  
Mengarah ke `/list`.

**Evidence:**  
Footer link map menunjukkan `Cara Membeli` → `/list`.

**Suggested Fix:**  
Arahkan ke halaman panduan belanja/CMS yang benar atau sembunyikan jika belum tersedia.

---

## 4. Edge Case Issues

- Add-to-cart tanpa memilih varian tidak menampilkan validasi yang jelas.
- Add-to-cart setelah memilih varian tetap tidak menampilkan success/error.
- Search tanpa hasil tidak memiliki empty state yang cukup informatif.
- Login dengan kredensial salah gagal secara silent.
- Cart badge tidak konsisten dengan isi cart.
- Direct route umum ecommerce seperti `/products`, `/shop`, `/my-wishlist` menghasilkan 404.
- Route `/list` tanpa query bermasalah, sedangkan `/list?category=accessories` tampil.

---

## 5. Security / Authorization Issues

| Skenario | Hasil |
|---|---|
| Akses `/my-profile` sebelum login | Redirect ke login, sesuai ekspektasi. |
| Akses `/login` saat sudah login | Redirect ke `/my-profile`, sesuai ekspektasi. |
| Akses `/admin/dashboard` sebagai customer | 403 Forbidden, sesuai ekspektasi. |
| Akses `/admin` sebagai customer | 404 Not Found, masih aman. |
| IDOR order/address/notification | Belum diuji penuh karena membutuhkan ID user lain/data pembanding. |
| CSRF/session form | Tidak ditemukan indikasi langsung, tetapi logout no-op perlu dicek implementation-nya. |

Tidak ditemukan akses admin terbuka untuk customer selama pengujian.

---

## 6. UI/UX Issues

- Feedback error/success tidak jelas pada login salah, logout, dan add-to-cart.
- Empty state katalog kurang jelas saat hasil search/filter kosong.
- Route wishlist tidak konsisten dengan ekspektasi user.
- Footer link `Cara Membeli` tidak sesuai konteks.
- Cart badge mismatch membuat user tidak percaya status cart.
- Tombol add-to-cart tidak menunjukkan loading/disabled state.
- Beberapa icon/button tidak memiliki label teks jelas di snapshot accessibility.

---

## 7. Performance / Stability Issues

- `/list` default mengalami blank page total, ini termasuk masalah stabilitas kritikal.
- Tidak ada broken image yang jelas dari snapshot; sebagian besar image memiliki alt text.
- Pengukuran network/performance mendalam tidak berhasil dilakukan penuh karena keterbatasan environment/tooling.
- Halaman utama dan detail produk secara umum load, namun route tertentu crash/blank.

---

## 8. Prioritas Perbaikan

| Priority | Issue | Alasan |
|---|---|---|
| P0 | `/list` blank page | Entry utama belanja tidak dapat digunakan. |
| P0 | Add-to-cart tidak bekerja | Memblokir cart, checkout, dan payment. |
| P0 | Logout tidak bekerja | Masalah kepercayaan dan keamanan session. |
| P1 | Login salah tanpa error | User tidak tahu penyebab gagal login. |
| P1 | Cart badge mismatch | Status cart tidak akurat dan membingungkan. |
| P1 | Wishlist route 404 | Fitur akun customer rusak/tidak konsisten. |
| P2 | Empty search UX lemah | Pengalaman katalog kurang baik. |
| P2 | Footer link salah | Navigasi/help content perlu dirapikan. |

---

## 9. Rekomendasi Akhir

Website **belum siap untuk production / real users**. Alur ecommerce inti belum stabil karena customer tidak dapat menambahkan produk ke cart, route katalog default bermasalah, logout tidak bekerja, dan cart state tidak konsisten.

Rekomendasi sebelum release:

1. Perbaiki seluruh P0: `/list`, add-to-cart, logout.
2. Perbaiki P1: error login, cart badge, wishlist route.
3. Jalankan ulang regression test untuk cart → checkout → shipping Biteship → payment Midtrans sandbox.
4. Tambahkan automated E2E test untuk happy path dan negative path utama.
5. Tambahkan monitoring console/API errors di environment staging.

Setelah perbaikan selesai, lakukan re-test penuh termasuk mobile/tablet responsive, checkout address/rates, Midtrans success/pending/failed, dan authorization IDOR antar user.
