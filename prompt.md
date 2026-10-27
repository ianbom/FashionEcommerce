# Implementasi Pemilihan Metode Pembayaran Sebelum Checkout Midtrans

Implementasikan fitur berikut pada repository website yang sedang terbuka. Kerjakan frontend, backend, persistence, dan regression tests sesuai arsitektur project; jangan berhenti pada mockup atau rencana saja.

## Tujuan dan Batas Fitur

Customer wajib memilih satu metode pembayaran di halaman checkout sebelum menekan tombol bayar. Backend menyimpan pilihan tersebut sebelum meminta token Midtrans Snap, lalu membatasi Snap agar hanya menawarkan kanal yang dipilih.

Gunakan **Snap redirect**, bukan migrasi ke Core API atau direct charge. Pemilihan lokal dan pembuatan token Snap **tidak sama dengan charge** dan tidak menjamin webhook langsung dikirim. Status pembayaran tetap berasal dari notifikasi atau sinkronisasi server yang tervalidasi, bukan dari pilihan customer atau callback browser.

Perilaku acuan berasal dari halaman `resources/js/pages/customer/checkout/checkout.tsx` pada project FashionECommerce. Path dan source project acuan mungkin tidak tersedia di repository tujuan. Gunakan spesifikasi dalam prompt ini; cari implementasi setara di project tujuan, jangan mengasumsikan framework atau nama file sama.

## 1. Pemeriksaan Sebelum Mengubah Kode

- Baca `AGENTS.md` dan dokumentasi project yang relevan. Catat status Git; pertahankan perubahan existing pengguna.
- Telusuri checkout sampai pembuatan order/payment, reservasi stok, voucher, ongkir, request Snap, webhook, sinkronisasi, serta detail pesanan customer/admin.
- Periksa dependency, schema/migrations, routes, validasi, autentikasi, CSRF, idempotensi, dan konfigurasi testing. Gunakan CodeGraph jika tersedia dan terindeks.
- Periksa dokumentasi resmi Midtrans terbaru untuk `enabled_payments`, ID kanal, respons Snap, dan webhook. Jangan mengandalkan kesamaan nama antara kanal Snap dan `payment_type` provider.
- Gunakan komponen dan dependency existing. Jangan menyalin branding, alamat, nomor kontak, kebijakan bisnis, atau layout lain dari project acuan.

## 2. Katalog Metode dan Kontrak Data

Gunakan satu katalog backend sebagai sumber validasi dan daftar pilihan frontend. Kandidat kanal mengikuti fitur acuan:

| Metode | ID kanal Snap |
| --- | --- |
| BCA Virtual Account | `bca_va` |
| BNI Virtual Account | `bni_va` |
| BRI Virtual Account | `bri_va` |
| Mandiri Bill Payment | `echannel` |
| Permata Virtual Account | `permata_va` |
| QRIS | `other_qris` |
| GoPay | `gopay` |
| ShopeePay | `shopeepay` |

- Verifikasi ID melalui dokumentasi resmi. Tampilkan hanya kanal yang diaktifkan dan didukung konfigurasi merchant project tujuan. Jika informasi aktivasi belum tersedia, nyatakan sebagai prasyarat UAT; jangan mengklaim merchant mendukung semuanya.
- Request checkout mengirim `payment_method` sebagai satu ID kanal, bersama payload checkout existing dan idempotency key. Tolak nilai kosong, array, ID tidak dikenal, dan kanal di luar allowlist server sebelum terjadi efek samping.
- Simpan pilihan pada snapshot terpisah, misalnya `payments.requested_payment_method`. Jangan mengisi kolom metode terkonfirmasi provider hanya berdasarkan input customer.
- Contoh: pilihan `bca_va` dapat dikonfirmasi sebagai `bank_transfer`; `other_qris` atau `gopay` dapat dikonfirmasi sebagai `qris`. Jangan mengharuskan kedua identifier identik.
- Gunakan penyimpanan existing jika sudah memenuhi kontrak snapshot immutable. Jika perlu kolom baru, buat migration additive nullable, tanpa backfill paksa. Snapshot tidak boleh hilang ketika webhook/sync mengganti raw response.

## 3. Tampilan Checkout

- Letakkan pemilih metode tepat di atas tombol **Bayar Sekarang** dalam ringkasan pesanan.
- Tampilkan grid tiga kolom berisi kartu kotak, menggunakan logo metode saja tanpa caption nama dan tanpa kategori VA/QRIS/E-wallet. Sesuaikan warna, font, dan jarak dengan desain website tujuan.
- Gunakan aset logo autentik yang disimpan lokal; gunakan aset existing jika tersedia. Jangan memakai hotlink, logo rekaan, atau dependency baru hanya untuk logo.
- Pilihan aktif memiliki border yang jelas dan indikator centang. Pertahankan radio native atau kontrol aksesibel setara, accessible name berisi nama lengkap metode, fokus keyboard terlihat, navigasi keyboard, dan pesan validasi terkait melalui ARIA.
- Jangan memilih metode secara otomatis. Tombol tetap nonaktif sampai metode dan semua prasyarat checkout existing terpenuhi. Cegah double submit sejak sebelum operasi async dimulai, bukan hanya mengandalkan perubahan state render.
- Pertahankan pilihan saat customer mengubah alamat, ongkir, catatan, atau apply/remove voucher. Menonaktifkan kontrol selama submit tidak boleh menghapus pilihannya.
- Gunakan istilah umum pembayaran/pengiriman pada copy checkout. Jangan menambahkan panel promosi Midtrans Snap atau instruksi mengirim bukti transfer WhatsApp pada alur gateway ini. Jangan mengubah identitas provider dalam payload, log internal, atau konfigurasi.
- Tampilkan error yang dapat ditindaklanjuti tanpa membocorkan SQL, stack trace, token, atau credentials. Pastikan tampilan tidak overflow pada desktop maupun mobile 320 px.

## 4. Backend, Snap, dan Idempotensi

- Validasi metode di endpoint serta entrypoint service/action yang dapat dipanggil langsung. Pertahankan seluruh validasi dan otorisasi checkout existing.
- Dalam transaksi lokal, simpan order/payment dan snapshot metode bersama perubahan stok/voucher yang memang diperlukan oleh model bisnis project. Jangan menambahkan sistem reservasi baru jika project menggunakan mekanisme setara yang sudah benar.
- Bangun request Snap dari order/payment yang sudah tersimpan, bukan dari nilai frontend yang diteruskan langsung. Sertakan tepat satu kanal:

```json
{
  "enabled_payments": ["bca_va"]
}
```

- Contoh tersebut hanya bagian tambahan payload. Pertahankan transaction details, item details, customer details, expiry, dan callback existing. Harga/total harus berasal dari server. Untuk IDR, pastikan jumlah item Snap tepat sama dengan `gross_amount`, termasuk ongkir, diskon, dan pembulatan yang relevan.
- Idempotency key yang sama harus merujuk order/payment yang sama. Jika snapshot metode non-null berbeda dari request ulang, tolak dengan error validasi yang jelas dan arahkan customer melanjutkan melalui detail pesanan. Jangan diam-diam mengganti metode, membuat order baru, atau mereset idempotency key.
- Periksa aturan metode pada semua jalur reuse order, termasuk pemeriksaan ulang di dalam transaksi/lock. Lindungi request paralel agar tidak menggandakan order, reservasi, atau POST Snap.
- Pertahankan mekanisme claim/lock pembuatan Snap. Hindari menahan transaksi DB selama request jaringan; jangan mengorbankan idempotensi saat memisahkannya.
- Snapshot null pada pembayaran historis tetap kompatibel. Jangan memaksa filter baru pada token lama, mengarang metode historis, atau mengonversi pembayaran manual lama.
- Bedakan penolakan provider yang terkonfirmasi dari timeout, 5xx, respons malformed, atau duplicate reference yang belum jelas. Untuk hasil uncertain, pertahankan status/reservasi aman dan lakukan rekonsiliasi; jangan otomatis mengirim POST baru atau menganggap pembayaran gagal/berhasil.
- Validasi token dan URL redirect HTTPS terhadap host Snap sesuai environment. Tolak host asing, userinfo, dan port yang tidak diizinkan; jangan mempercayai redirect dari input customer.

## 5. Webhook dan Detail Pesanan

- Pertahankan verifikasi signature, referensi transaksi/order, nominal, mata uang sesuai kontrak integrasi, serta legalitas perubahan status. Notifikasi duplikat atau stale tidak boleh memfinalisasi stok/notifikasi dua kali atau menurunkan pembayaran final.
- Callback browser hanya membuka halaman hasil/detail; parameter browser tidak boleh menjadikan order paid.
- Webhook/sync memperbarui metode terkonfirmasi tanpa menimpa snapshot pilihan checkout. Tampilkan keduanya secara terpisah pada detail customer/admin bila data tersedia; data historis null tidak menyebabkan error.
- Pertahankan kebijakan refund, pembatalan, late settlement, dan manual review existing. Status Core not-found saja tidak membuktikan token Snap tidak dapat dibayar. Jangan melepas reservasi hanya berdasarkan waktu lokal atau kegagalan jaringan.
- Server key tetap di backend. Gunakan konfigurasi environment existing; jangan menambah duplikasi setting atau mengekspos rahasia ke frontend/log.

## 6. Schema, Deployment, dan Batas Keamanan

- Jika ada migration baru, sertakan urutan deployment dan perintah aktual project. Verifikasi schema sebelum kode checkout baru menerima traffic; jangan membiarkan insert gagal karena kolom snapshot belum ada.
- Jangan menutupi schema yang belum siap dengan menghilangkan snapshot atau menonaktifkan validasi metode.
- Buat migration bila diperlukan, tetapi **jangan menjalankannya pada database aplikasi aktif tanpa persetujuan eksplisit**. Jangan menjalankan reset database, `migrate:fresh`, seeding ulang, backfill, atau perubahan destruktif.
- Jangan membaca/menyalin nilai `.env`, credentials, atau transkrip sesi. Jangan melakukan transaksi/provider call sandbox maupun production tanpa izin. Gunakan synthetic credentials dan HTTP fakes untuk pengujian lokal.
- Jangan commit, checkout, reset Git, menambah dependency, atau memperbaiki modul di luar kebutuhan fitur ini tanpa permintaan.

## 7. Acceptance Tests

Tambahkan regression tests dengan tooling existing dan database yang terbukti terisolasi. Cakup:

1. Metode hilang, kosong, array, tidak dikenal, atau tidak diizinkan ditolak tanpa order/payment, mutasi stok/voucher/cart, atau request Snap.
2. Setiap kanal yang diizinkan menyimpan snapshot sebelum HTTP dan mengirim `enabled_payments` tepat satu elemen sesuai snapshot.
3. Retry metode sama memakai order/payment lama; metode berbeda pada key sama ditolak pada jalur normal maupun jalur pemeriksaan ulang terkunci. Tidak ada duplikasi POST/reservasi.
4. Snapshot bertahan setelah timeout, rekonsiliasi, webhook valid, dan webhook duplikat; metode terkonfirmasi provider boleh berbeda identifier.
5. Pembayaran historis bersnapshot null dan pembayaran manual lama tetap berjalan tanpa perubahan paksa.
6. Validasi nominal/reference/signature dan perilaku stock/payment existing tidak mengalami regresi. Callback browser bukan bukti paid.
7. Browser: delapan kandidat atau subset yang diizinkan tampil sesuai katalog, tanpa pilihan awal; klik/keyboard berfungsi, accessible name tersedia, logo termuat, hanya satu metode aktif, dan pemilih berada tepat di atas tombol.
8. Browser: pilihan bertahan setelah perubahan voucher/ongkir; tombol mengikuti prasyarat; submit ganda dicegah; layout 1440, 390, dan 320 px tidak overflow.

Temukan perintah tests, lint, format check, typecheck, dan build dari repository; jangan mengasumsikan nama script. Jalankan pemeriksaan relevan tanpa mengubah file unrelated. Source-pattern tests hanya bukti tambahan, bukan pengganti pengujian perilaku atau browser.

## Hasil Akhir

Laporkan singkat file yang diubah, alur yang diimplementasikan, hasil pemeriksaan yang benar-benar dijalankan, migration/prasyarat deployment, dan keterbatasan yang belum terverifikasi. Pisahkan hasil HTTP fake dari UAT merchant sandbox nyata. Jangan mengklaim webhook publik, pembayaran nyata, konkurensi produksi, atau bebas bug tanpa bukti.
