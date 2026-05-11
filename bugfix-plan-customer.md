# Plan Perbaikan Bug Frontend Customer Area

## Tujuan
Dokumen ini jadi panduan implementasi perbaikan 8 bug pada area customer agar:
- alur notifikasi lebih tepat,
- empty state lebih konsisten,
- UX mobile lebih lengkap,
- aksi tambah keranjang lebih stabil,
- elemen non-aksi tidak terlihat seperti button,
- hero banner lebih usable,
- validasi form profil lebih tegas di frontend,
- semua pesan validasi tampil dalam bahasa Indonesia.

---

# 1. Detail Notification: klik item cukup ubah status read dari unread

## Masalah
Saat ini item notifikasi pada halaman list:
- langsung mengarah ke `/notifications/{id}`
- sambil memanggil `markAsRead(notification.id)`
- belum ada kepastian flow halaman detail notifikasi sesuai kebutuhan baru

Kebutuhan baru:
- harus ada halaman detail notification
- ketika user klik notifikasi, cukup ubah status dari `unread` menjadi `read`
- status tidak perlu berubah lewat aksi lain yang membingungkan

## File terkait
- `resources/js/pages/customer/notification/list-notification.tsx`
- kemungkinan file detail notification belum ada / perlu dicek
- route/controller notification detail perlu dicek di backend

## Kondisi saat ini
Di `list-notification.tsx`:
- item notifikasi dibungkus `Link` ke `/notifications/${notification.id}`
- `onClick={() => markAsRead(notification.id)}` dipanggil
- belum terlihat halaman detail pada context terlampir

## Rencana implementasi
### Frontend
1. Pastikan route detail notifikasi tersedia dan aktif.
2. Buat halaman detail notifikasi bila belum ada, misal:
   - `resources/js/pages/customer/notification/detail-notification.tsx`
3. Di halaman list:
   - pertahankan klik item menuju halaman detail
   - sebelum / saat transisi, ubah status notifikasi jadi `read` bila sebelumnya `unread`
4. Pastikan item yang sudah `read`:
   - tidak memanggil request mark-as-read lagi
   - tidak menampilkan indicator unread
5. Di halaman detail:
   - tampilkan minimal:
     - title
     - message lengkap
     - type notifikasi
     - waktu
     - status read
     - tombol kembali ke daftar notifikasi
6. Bila ada CTA kontekstual pada notifikasi, siapkan area optional:
   - contoh order → link ke detail order
   - shipping → link ke tracking/order detail
   - promo → link ke list produk/koleksi

### Backend / integrasi
1. Cek endpoint:
   - `POST /notifications/{id}/read`
   - `POST /notifications/read-all`
   - `GET /notifications/{id}`
2. Jika belum ada endpoint detail, buat.
3. Pastikan ketika membuka detail:
   - notifikasi dapat dibaca berdasarkan id dan user login
   - status read aman terhadap akses user lain
4. Pertimbangkan 2 opsi teknis:
   - **Opsi A**: mark as read dari list sebelum pindah halaman
   - **Opsi B**: mark as read saat halaman detail dibuka  
   Rekomendasi: **Opsi B** lebih aman untuk konsistensi data, karena status berubah saat detail benar-benar terbuka.

## Acceptance criteria
- Klik notifikasi unread membuka halaman detail notifikasi.
- Status notifikasi berubah jadi read.
- Klik notifikasi read tidak kirim request read ulang.
- Indicator unread hilang setelah data refresh / revisit.
- User tidak kehilangan akses ke detail notifikasi.

## Risiko
- Double request bila mark read dipanggil dari list dan detail sekaligus.
- Race condition saat navigation cepat.
- Route detail belum ada.

## Rekomendasi teknis
- Pindahkan sumber utama perubahan status `read` ke halaman detail, bukan `onClick` list.
- List tetap navigasi normal ke detail.
- Bila ingin UX cepat, boleh optimistik di list, tapi sumber kebenaran tetap backend detail.

---

# 2. Empty state order: ganti foto dummy jadi icon order kosong

## Masalah
Pada halaman pesanan, saat data kosong masih memakai foto dummy.

## File terkait
- `resources/js/pages/customer/order/my-order.tsx`

## Kondisi saat ini
- memakai `FALLBACK_IMAGE`
- empty state render `<img ... alt="Pesanan kosong" />`

## Rencana implementasi
1. Ganti ilustrasi foto dummy dengan icon yang lebih relevan.
2. Gunakan icon dari `lucide-react`, rekomendasi:
   - `Package`
   - atau kombinasi `PackageX` bila tersedia
3. Buat container empty state konsisten dengan halaman lain:
   - lingkaran background lembut
   - icon di tengah
   - heading
   - deskripsi
   - CTA ke `/list`
4. Ubah copy agar lebih natural:
   - jika hasil search/filter kosong: `"Pesanan tidak ditemukan"`
   - jika memang belum pernah order: `"Belum ada pesanan"`
5. Bila memungkinkan, bedakan empty state berdasarkan konteks:
   - search aktif → “Pesanan tidak ditemukan”
   - search kosong dan order kosong total → “Belum ada pesanan”

## Acceptance criteria
- Empty state tidak lagi memakai foto dummy.
- Empty state pakai icon order kosong.
- Tampilan tetap rapi di mobile dan desktop.
- CTA “Belanja Sekarang” tetap tersedia.

## Rekomendasi copy
- Title default: `Belum ada pesanan`
- Subtitle default: `Pesanan yang kamu buat akan muncul di sini. Yuk mulai belanja sekarang.`
- Title saat pencarian: `Pesanan tidak ditemukan`
- Subtitle saat pencarian: `Coba gunakan kata kunci lain atau cek kembali nomor pesananmu.`

---

# 3. Tambah button logout pada tampilan mobile

## Masalah
Pada tampilan mobile belum ada tombol logout pada halaman profil / area akun.

## File terkait
- `resources/js/pages/customer/profile/my-profile.tsx`
- kemungkinan juga `ProfileLayout` bila menu akun dibangun di sana

## Rencana implementasi
1. Cek apakah logout saat ini hanya tersedia di desktop/navbar.
2. Tambahkan tombol logout khusus mobile pada area yang mudah ditemukan, rekomendasi:
   - bagian bawah halaman profil
   - atau di header action mobile dalam `ProfileLayout`
3. Style tombol:
   - full width
   - kontras jelas
   - aman disentuh
4. Gunakan route logout existing dari sistem auth.
5. Tambahkan state disabled/loading bila submit logout sedang berjalan.
6. Pastikan tombol hanya tampil di mobile bila memang requirement khusus mobile.
   - class Tailwind contoh: `md:hidden`

## Penempatan rekomendasi
### Opsi terbaik
Di halaman `my-profile.tsx`, bagian bawah setelah “Kelola Alamat”:
- mudah ditemukan
- relevan dengan halaman akun
- cepat implementasi

### Opsi reusable
Di `ProfileLayout` mobile navigation:
- lebih konsisten untuk semua halaman akun
- butuh cek struktur layout lebih dalam

## Acceptance criteria
- Pada mobile, user melihat tombol logout.
- Tombol bisa ditekan dengan nyaman.
- Logout berhasil dan redirect sesuai flow auth.
- Desktop tidak terganggu bila tombol memang khusus mobile.

---

# 4. Bug stok tidak cukup: button membesar, layout rusak, perlu alert jelas

## Masalah
Pada halaman detail produk:
- ketika user ingin menambahkan ke keranjang tapi stok tidak cukup
- button “Tambah ke Keranjang” dan “Beli Sekarang” membesar / tidak rapi
- error belum cukup jelas
- perlu alert bahwa stok tidak mencukupi

## File terkait
- `resources/js/pages/customer/products/detail-product.tsx`

## Analisis akar masalah
Kemungkinan penyebab:
1. Text error muncul di dalam flow layout yang mendorong tinggi button container.
2. Error message dari `cartForm.errors.quantity` atau `product_variant_id` memanjang.
3. Grid `grid-cols-2` tidak punya alignment stabil.
4. Button memakai `min-h-12`, tapi parent/form tidak punya struktur tetap.
5. Saat stok tidak cukup, backend kirim message; frontend hanya render text error di bawah form pertama, bikin tinggi kiri beda dengan kanan.

## Rencana implementasi
### A. Stabilkan layout button
1. Bungkus area CTA dengan struktur tetap:
   - dua kolom dengan `items-stretch`
   - setiap button punya tinggi konsisten
2. Form “Tambah ke Keranjang” dan button “Beli Sekarang” harus punya wrapper dengan tinggi seragam.
3. Pindahkan pesan error/alert ke area terpisah di bawah dua button, bukan di dalam satu kolom button saja.
4. Tambahkan:
   - `min-w-0`
   - `w-full`
   - `items-stretch`
   - wrapper alert terpisah

### B. Tambahkan validasi stok di frontend
1. Sebelum submit:
   - cek `selectedVariant`
   - cek `quantity <= selectedVariant.available_stock`
2. Bila melebihi stok:
   - batalkan submit
   - tampilkan alert lokal bahasa Indonesia
3. Tambahkan state lokal misal:
   - `stockAlert`
4. Pesan rekomendasi:
   - `Stok tidak mencukupi untuk jumlah yang dipilih.`
   - atau `Stok tersedia hanya X pcs.`

### C. Tetap tangani validasi backend
1. Backend tetap jadi sumber kebenaran.
2. Bila backend mengembalikan error stok:
   - map pesan ke bahasa Indonesia
   - tampilkan di area alert yang sama
3. Jangan render error panjang di bawah hanya button kiri.

### D. UX tambahan
1. Tampilkan info stok dekat quantity / variant:
   - `Stok tersedia: X`
2. Disable tombol saat:
   - variant belum valid
   - stok 0
3. Saat quantity sudah menyentuh max stok:
   - tombol `+` bisa disable atau tidak menambah lagi
4. Reset alert ketika:
   - variant berubah
   - quantity berubah ke nilai valid

## Acceptance criteria
- Layout dua tombol tetap rapi saat error stok muncul.
- Button tidak membesar liar.
- Alert stok tampil jelas dalam bahasa Indonesia.
- Submit dicegah di frontend bila quantity > available stock.
- Validasi backend tetap tertangani.

## Rekomendasi UI alert
Gunakan alert block di bawah dua tombol:
- background merah muda / kuning muda
- icon kecil warning
- text Indonesia
- padding kecil
- tidak menggeser salah satu button saja

---

# 5. Ubah “Lengkapi pesanan dengan checkout aman” agar bukan button-hover-pointer

## Masalah
Pada halaman detail produk, section:
`Lengkapi pesanan dengan checkout aman`
tampil seperti button interaktif:
- ada `cursor-pointer`
- ada hover effect
- muncul jari saat hover

Padahal requirement:
- jangan jadi button
- jangan terasa clickable

## File terkait
- `resources/js/pages/customer/products/detail-product.tsx`

## Kondisi saat ini
Elemen memakai:
- `cursor-pointer`
- `hover:-translate-y-0.5`
- `hover:shadow-md`

## Rencana implementasi
1. Ubah elemen jadi informational card statis.
2. Hapus class:
   - `cursor-pointer`
   - efek hover transformatif
   - shadow hover
3. Pertahankan visual card bila masih dibutuhkan, tapi non-interaktif.
4. Bila semantic perlu, tetap pakai `<div>` biasa, bukan `<button>` atau link.
5. Pastikan icon panah kanan tidak menyesatkan seolah ada aksi.
   - opsi:
     - hapus `ChevronRight`
     - atau ganti icon info/check/shield
6. Cursor harus default, bukan pointer.

## Acceptance criteria
- Saat hover tidak muncul cursor tangan.
- Tidak ada kesan card bisa diklik.
- Fungsi informatif tetap jelas.

## Rekomendasi
Ganti icon kanan dari `ChevronRight` ke icon yang lebih netral, atau hapus total.

---

# 6. Hero section: klik foto ke `/list`, desktop slide lebih mudah

## Masalah
Pada hero section:
1. saat foto diklik harus menuju `/list`
2. slide desktop masih sulit

## File terkait
- `resources/js/pages/welcome.tsx`
- komponen `HeroSlider`

## Kondisi saat ini
- slider pakai `onPointerDown`, `onPointerMove`, `onPointerUp`
- image belum dibungkus link
- drag manual ada, tapi UX desktop bisa terasa berat / sensitif

## Tantangan teknis
Klik dan drag dalam elemen sama sering bentrok:
- kalau semua slide dibungkus `Link`, drag bisa dianggap click
- kalau semua pointer event dominan, click bisa gagal

## Rencana implementasi
### A. Tambahkan navigasi klik ke `/list`
1. Bungkus setiap slide dengan link ke `/list`
   atau
2. Tangani click manual:
   - bila user tidak drag signifikan → navigate ke `/list`
   - bila user drag → jangan navigate

### B. Bedakan click vs drag
1. Simpan jarak drag:
   - misal threshold `8px` atau `10px`
2. Jika pointer down lalu pointer up dengan pergeseran kecil:
   - anggap click
   - arahkan ke `/list`
3. Jika pergeseran melewati threshold:
   - anggap drag
   - jangan trigger click

### C. Permudah slide desktop
1. Evaluasi class slider:
   - `cursor-grab`
   - `scroll-smooth`
   - `snap-x snap-mandatory`
2. Tambahkan optimasi:
   - threshold drag lebih kecil
   - update current slide setelah drag selesai dengan snap target lebih stabil
3. Tambahkan tombol navigasi desktop:
   - prev / next arrow kiri-kanan
   - ini solusi paling efektif untuk desktop
4. Tambahkan dukungan wheel horizontal bila perlu:
   - mouse wheel vertikal diterjemahkan jadi horizontal pada slider desktop
5. Pertimbangkan `scroll-snap-type: x proximity` bila `mandatory` terasa terlalu kaku

### D. Perbaiki gesture UX
1. Tambahkan `touch-action: pan-y` atau pengaturan serupa bila perlu
2. Pastikan image `draggable={false}` tetap ada
3. Saat drag aktif, nonaktifkan click sementara
4. Tambahkan arrow nav desktop:
   - tampil hanya `md:flex`
   - mobile tetap swipe

## Acceptance criteria
- Klik hero image mengarah ke `/list`.
- Drag horizontal tetap berfungsi.
- Saat user drag, tidak salah redirect.
- Di desktop, slide terasa lebih mudah dipindah.
- Arrow next/prev tersedia di desktop bila diimplementasikan.

## Rekomendasi implementasi terbaik
- Tambah tombol prev/next di desktop
- Tambah threshold pembeda click vs drag
- Navigasi ke `/list` hanya bila gesture dianggap click

---

# 7. Validasi frontend: update nama, email, password tidak boleh kosong

## Masalah
Pada halaman profil:
- update nama, email, password seharusnya tidak boleh kosong
- perlu validasi frontend sebelum request dikirim

## File terkait
- `resources/js/pages/customer/profile/my-profile.tsx`

## Kondisi saat ini
- form memakai `useForm`
- error backend ditampilkan
- belum ada validasi frontend eksplisit untuk field kosong
- input juga belum terlihat memakai `required`

## Rencana implementasi
### A. Validasi form informasi pribadi
Field wajib:
- `name`
- `email`

Langkah:
1. Trim nilai sebelum submit.
2. Bila `name.trim() === ''`:
   - set error frontend: `Nama lengkap tidak boleh kosong`
   - batalkan submit
3. Bila `email.trim() === ''`:
   - set error frontend: `Email tidak boleh kosong`
   - batalkan submit
4. Bila format email invalid:
   - set error frontend: `Format email tidak valid`
5. Tambahkan atribut HTML:
   - `required`
   - untuk email tetap `type="email"`

### B. Validasi form password
Field wajib:
- `current_password`
- `password`
- `password_confirmation`

Langkah:
1. Jika salah satu kosong:
   - tampilkan error Indonesia masing-masing
2. Jika `password_confirmation` tidak sama:
   - tampilkan error `Konfirmasi kata sandi tidak sesuai`
3. Jika panjang password kurang dari 8:
   - tampilkan error `Kata sandi minimal 8 karakter`
4. Batalkan submit bila validasi gagal

### C. Struktur error frontend
Buat state error lokal terpisah dari error backend, misal:
- `profileClientErrors`
- `passwordClientErrors`

Lalu render error prioritas:
1. error frontend dulu
2. bila tidak ada, tampilkan error backend

### D. Reset error frontend
Error frontend perlu dibersihkan saat:
- user mengetik ulang field
- submit sukses
- form reset

## Acceptance criteria
- User tidak bisa submit nama kosong.
- User tidak bisa submit email kosong.
- User tidak bisa submit password kosong.
- Pesan validasi muncul langsung tanpa menunggu response backend.
- Error tampil dalam bahasa Indonesia.

## Catatan
`phone` dari context tampak optional. Jangan dipaksa required kecuali ada kebutuhan baru.

---

# 8. Ubah alert validasi gagal dari bahasa Inggris ke Indonesia

## Masalah
Masih ada alert / pesan validasi gagal berbahasa Inggris.

## File terkait
Dari context, paling terlihat di:
- `resources/js/pages/customer/profile/my-profile.tsx`
- `resources/js/pages/customer/products/detail-product.tsx`
- halaman lain yang memakai error backend default Laravel/Inertia
- kemungkinan form address juga bisa terkena bila backend message belum dilokalkan

## Sumber masalah yang mungkin
1. Message backend validation default Laravel masih English.
2. Frontend menampilkan raw message dari backend tanpa translasi.
3. Static fallback copy di frontend masih English.
4. Sebagian label produk/detail masih English, walau bukan alert.

## Rencana implementasi
### A. Audit semua pesan error yang tampil
Cek pesan berikut:
- required
- invalid email
- password confirmation mismatch
- current password wrong
- stock insufficient
- variant invalid
- address validation
- notification / action errors

### B. Lokalisasi backend validation
1. Cek file language Laravel:
   - `lang/id/validation.php`
   - `lang/en/validation.php`
2. Pastikan locale aplikasi ke `id` bila target utama Indonesia.
3. Tambahkan custom attribute translation:
   - `name` → `nama`
   - `email` → `email`
   - `current_password` → `kata sandi saat ini`
   - `password_confirmation` → `konfirmasi kata sandi`
   - dst

### C. Lokalisasi frontend fallback
1. Bila frontend memetakan message manual, buat helper normalisasi:
   - `"The name field is required."` → `"Nama tidak boleh kosong."`
   - `"The email field is required."` → `"Email tidak boleh kosong."`
   - `"The password field confirmation does not match."` → `"Konfirmasi kata sandi tidak sesuai."`
2. Untuk stok:
   - `"Insufficient stock"` → `"Stok tidak mencukupi."`

### D. Audit copy non-error yang masih English
Pada file context terlihat masih ada beberapa text English non-error, contoh:
- `No notifications yet`
- `Continue Shopping`
- `Notifications`
- `Stay updated with your orders and exclusive offers.`
- fallback deskripsi produk dalam English
- `You Might Also Like`
- `Recent Viewed`
- `Message Support`
- `See more`
- `Learn more`
- `Buy`

Ini bukan semua termasuk alert, tapi baik sekalian dicatat untuk konsistensi bahasa UI.

## Acceptance criteria
- Semua pesan validasi form utama tampil bahasa Indonesia.
- Pesan stok tampil bahasa Indonesia.
- User tidak lagi melihat error validation default English.
- Attribute field pada error juga bahasa Indonesia.

---

# Rencana Kerja Per File

## A. `resources/js/pages/customer/notification/list-notification.tsx`
### Perubahan
- Review flow klik notifikasi.
- Kurangi tanggung jawab `markAsRead` di list bila detail page dijadikan sumber utama.
- Pastikan menuju halaman detail notifikasi.
- Rapikan copy bahasa Indonesia bila sekalian dirapikan.

### Tambahan
- Buat / cek halaman detail notification.

---

## B. `resources/js/pages/customer/order/my-order.tsx`
### Perubahan
- Ganti empty state image dummy dengan icon order kosong.
- Pertimbangkan beda empty state untuk:
  - belum ada order
  - hasil pencarian kosong

---

## C. `resources/js/pages/customer/profile/my-profile.tsx`
### Perubahan
- Tambah tombol logout mobile.
- Tambah validasi frontend `name`, `email`, `current_password`, `password`, `password_confirmation`.
- Ubah seluruh pesan error frontend ke bahasa Indonesia.
- Integrasikan error frontend + backend.

---

## D. `resources/js/pages/customer/products/detail-product.tsx`
### Perubahan
- Ubah card “Lengkapi pesanan dengan checkout aman” jadi non-clickable.
- Perbaiki layout tombol add to cart / buy now agar tidak membesar saat error.
- Tambah alert stok tidak cukup.
- Tambah validasi quantity vs available stock di frontend.
- Normalisasi error ke bahasa Indonesia.

---

## E. `resources/js/pages/welcome.tsx`
### Perubahan
- Hero image klik ke `/list`.
- Bedakan click vs drag.
- Tambah kemudahan slider desktop:
  - prev/next arrow
  - threshold drag
  - evaluasi snap behavior

---

# Prioritas Implementasi

## Prioritas 1 — langsung ganggu transaksi / UX kritis
1. Bug stok tidak cukup pada halaman detail produk
2. Validasi frontend profile/password tidak boleh kosong
3. Alert validasi English → Indonesia

## Prioritas 2 — UX penting
4. Hero section klik ke `/list` + slide desktop lebih mudah
5. Detail notification + mark read flow

## Prioritas 3 — polishing
6. Empty state order icon
7. Tombol logout mobile
8. Ubah card checkout aman jadi non-clickable

---

# Estimasi Task Breakdown

## Task 1 — Notification detail flow
- audit route + page detail
- implement detail page bila belum ada
- refactor mark-as-read flow
- test unread/read state

## Task 2 — Order empty state
- ganti image ke icon
- sesuaikan copy
- test empty data dan search kosong

## Task 3 — Mobile logout
- cari source logout
- tambah tombol mobile
- test redirect/logout state

## Task 4 — Product stock error + button layout
- tambahkan client-side stock validation
- buat alert area terpisah
- rapikan grid CTA
- map error backend ke Indonesia
- test berbagai skenario stok

## Task 5 — Checkout aman non-button
- ubah card statis
- hilangkan hover pointer
- review icon kanan

## Task 6 — Hero slider improvements
- tambah click-to-list
- bedakan drag vs click
- tambah desktop arrows
- test mouse drag, click, wheel, mobile swipe

## Task 7 — Profile frontend validation
- tambah required checks
- tambah email format checks
- tambah password checks
- reset client errors saat edit/reset/success

## Task 8 — Bahasa Indonesia
- audit frontend messages
- audit backend validation locale
- map fallback messages bila perlu

---

# Skenario Testing

## 1. Notification
- klik notifikasi unread
- masuk detail
- status berubah jadi read
- kembali ke list, indicator unread hilang
- klik notifikasi read, tidak ada request read ulang

## 2. Order empty state
- akun tanpa pesanan
- tampil icon order kosong
- CTA ke `/list` jalan
- search order yang tidak ada, copy tetap relevan

## 3. Logout mobile
- buka di viewport mobile
- tombol logout muncul
- klik logout berhasil
- redirect sesuai auth flow

## 4. Product stock
- stok cukup, add to cart normal
- stok tidak cukup, alert muncul
- quantity > stock, submit dicegah
- layout dua tombol tetap sejajar
- pesan error bahasa Indonesia

## 5. Checkout aman card
- hover card tidak muncul jari
- card tidak terlihat clickable
- layout tetap bagus

## 6. Hero slider
- klik hero tanpa drag → ke `/list`
- drag hero → slide pindah, tidak redirect
- arrow desktop berfungsi
- mobile swipe tetap normal

## 7. Profile validation
- kosongkan nama lalu submit → error Indonesia
- kosongkan email → error Indonesia
- email invalid → error Indonesia
- kosongkan password field → error Indonesia
- konfirmasi password beda → error Indonesia

## 8. Bahasa
- semua pesan validasi utama tampil Indonesia
- tidak ada raw error English tersisa pada flow yang diuji

---

# Catatan Teknis Tambahan

## Konsistensi bahasa UI
Di beberapa file masih ada teks English non-error. Walau request utama fokus bug, bagus bila dibuat backlog lanjutan untuk full i18n/ID consistency.

## Rekomendasi helper util
Bagus bila dibuat helper kecil untuk normalisasi pesan error:
- input: backend/raw error
- output: pesan Indonesia siap tampil

Ini bikin:
- detail-product
- my-profile
- manage-address
lebih konsisten.

## Rekomendasi reusable components
Bila waktu cukup, pertimbangkan komponen reusable:
- `EmptyState`
- `FormErrorText`
- `InlineAlert`
- `SectionCard`

Supaya style error/empty state seragam.

---

# Definition of Done
Task dianggap selesai bila:
1. semua 8 bug sudah diimplementasi,
2. tidak ada layout pecah di mobile/desktop,
3. validasi utama tampil bahasa Indonesia,
4. flow notifikasi, order empty state, profil, hero slider, dan produk lolos test manual,
5. tidak ada regression pada checkout, profile update, dan cart action.

---

# Output Implementasi yang Diharapkan
- perubahan file frontend terkait
- kemungkinan penambahan page detail notification
- kemungkinan update route/backend validation locale
- hasil QA manual untuk desktop + mobile
