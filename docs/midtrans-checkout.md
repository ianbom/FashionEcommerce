# Checkout Midtrans

Implementasi 21 Oktober 2026 pada branch `revisi`, baseline HEAD
`059ca88a653e034502dfd4dc9a0bc537311fe95b`.
Dokumen ini menggantikan keputusan checkout manual untuk **pesanan baru**.
Pesanan manual lama, kontak, identitas toko, dimensi produk, tambahan harga
varian, serta pilihan kurir customer tetap dipertahankan. Integrasi awal tidak
memerlukan migration; penambahan pilihan metode pada 25 Oktober memerlukan
kolom nullable baru seperti dijelaskan berikut. Tidak ada backfill.

## Pilihan Metode Checkout (25 Oktober 2026)

- Customer wajib memilih satu metode sebelum checkout: BCA/BNI/BRI/Permata VA,
  Mandiri Bill Payment, QRIS, GoPay, atau ShopeePay. Katalog berasal dari enum
  `MidtransPaymentMethod`, dipakai bersama oleh validasi backend dan frontend.
- Snapshot `payments.requested_payment_method` disimpan sebelum request Snap.
  Snap tetap redirect, dibatasi dengan satu elemen `enabled_payments` dari
  snapshot: `bca_va`, `bni_va`, `bri_va`, `echannel`, `permata_va`, `other_qris`,
  `gopay`, atau `shopeepay`. Metode harus aktif pada merchant Midtrans.
- Pilihan checkout terpisah dari `payment_method` yang dikonfirmasi provider.
  Contohnya VA dapat dikonfirmasi sebagai `bank_transfer`, sedangkan pilihan
  GoPay dapat dikonfirmasi sebagai `qris`. Webhook/sync tidak menimpa snapshot.
- Retry idempotency key yang sama tidak boleh mengganti pilihan non-null atau
  membuat order/reservasi/Snap kedua. Pilihan null pada pembayaran historis
  tetap null dan tidak memaksa filter baru pada sesi lama. Pembayaran manual
  lama tidak dikonversi. Detail customer/admin menampilkan kedua nilai terpisah.
- Membatasi kanal Snap tidak menciptakan charge langsung dan tidak menjamin
  webhook ketika token dibuat. Notifikasi bergantung pada transaksi/progres
  provider. Callback browser tetap bukan bukti paid; signature, reference,
  amount, idempotensi dan rekonsiliasi server tetap berlaku.

### Prasyarat Deployment

Terapkan migration additive berikut sebelum menerima checkout dengan kode baru;
perintah ini **belum dijalankan pada database aplikasi**:

```sh
php artisan migrate --path=database/migrations/2026_10_25_000001_add_requested_payment_method_to_payments_table.php --force
```

Kolom string nullable menjaga kompatibilitas data lama. Tidak ada migrasi data
historis atau perubahan kolom metode terkonfirmasi. Deployment source/backend,
bundle frontend, dan schema harus dikoordinasikan; jangan mengaktifkan source
baru tanpa kolom tersebut.

### Verifikasi Penambahan Metode

- `php vendor/bin/pest --compact`: 284 tes, 1539 assertions, lulus. Mencakup
  delapan kanal, validasi HTTP/service, snapshot sebelum HTTP, idempotensi,
  metode berbeda pada dua jalur pemeriksaan order, legacy null, uncertain
  creation, sync dan duplicate signed settlement. SQLite memory, provider fake.
- `php tests/Concurrency/run.php`: tujuh skenario lulus pada MySQL disposable;
  checkout paralel mempertahankan snapshot BCA, satu reservasi dan satu POST
  Snap dengan `enabled_payments` tepat. Database aplikasi tidak digunakan.
- PHP lint dan Pint, ESLint dan Prettier file berubah, `npm run types:check`,
  serta build dengan `ISOLATED_BUILD=1`: lulus. Tidak ada dependency baru.
- Browser terisolasi: delapan radio awalnya kosong; alamat/ongkir/persetujuan
  saja belum mengaktifkan bayar. Semua pilihan mengaktifkan bayar setelah
  prasyarat lengkap; keyboard mengganti pilihan. Apply/remove voucher menjaga
  pilihan. Layout 1440x1000 dan 390x1000 tanpa overflow horizontal, screenshot
  diperiksa. Provider diblokir; tidak ada pembayaran eksternal diselesaikan.
- Aktivasi kanal merchant, pembayaran sandbox nyata, delivery webhook publik,
  scheduler/queue deployment tetap gate UAT, bukan hasil verifikasi lokal.

## Konfigurasi Deployment

- Server key berasal dari `config('services.midtrans.server_key')`, dipetakan
  dari `MIDTRANS_SERVER_KEY` pada konfigurasi Laravel. Tidak dikirim ke frontend.
- Environment hanya `config('services.midtrans.environment')`, dipetakan dari
  `MIDTRANS_ENVIRONMENT` konfigurasi server; default `sandbox`.
  Server key harus sesuai environment. Jangan mengganti environment ketika
  masih ada pembayaran tertunda; selesaikan rekonsiliasi merchant lama dahulu.
- Admin Payment Settings menyediakan `payment_expiry_duration`
  dalam menit, rentang 1-10080, default 1440. Masa berlaku dimulai dari waktu
  pembuatan order, bukan dari waktu retry HTTP.
- Merchant Dashboard harus mengarah ke endpoint HTTPS publik
  `POST /api/payments/midtrans/notification` di domain deployment yang benar.
  `APP_URL` harus domain aplikasi HTTPS untuk callback detail order.
- Jalankan scheduler Laravel melalui cron `php artisan schedule:run` setiap
  menit. Rekonsiliasi pembayaran dijadwalkan setiap lima menit dengan
  `withoutOverlapping()`. Pastikan scheduler, shared lock/cache, dan worker
  notifikasi berjalan sesuai konfigurasi deployment.
- Redirect Snap tidak memerlukan popup atau client key pada browser.
  Aktivasi merchant/metode pembayaran tetap dilakukan di dashboard Midtrans.

## Kontrak dan Pemulihan

1. Checkout memvalidasi alamat, harga, varian, stok, voucher, dan ongkir customer.
   Transaksi lokal menyimpan snapshot order, reservasi stok/voucher, payment
   Midtrans, dan mengeluarkan item yang dipesan dari cart.
2. `CreateMidtransSnapAction` mengklaim pembuatan sesi dengan lock, lalu mengirim
   satu POST di luar transaksi DB. Retry idempotency key memakai order/payment
   sama. Klaim `creating` tidak boleh mengirim POST kedua.
3. Respons checkout memuat `order_id`, `payment_id`, `payment_state`, dan
   `redirect_url`. `ready` menuju HTTPS Snap sesuai environment; `processing`
   menuju detail order; `failed` menuju cart; `final` menuju detail order.
4. Penolakan pembuatan yang eksplisit melepaskan reservasi dan mengembalikan
   kuantitas item sekali saja, menambahkan ke item cart yang lebih baru tanpa
   menimpa harga barunya. Item yang sudah tidak tersedia tidak direka ulang;
   snapshot dan jumlah `unrestorable_items` tetap tersimpan pada payment.
5. Timeout, 5xx, throttling, duplicate reference, malformed/contradictory response,
   token hilang, dan redirect tidak aman berarti **uncertain**, bukan gagal atau
   berhasil. Reservasi tetap dipertahankan. Tidak ada retry POST otomatis.
6. Callback browser hanya membuka detail order. Pembayaran paid berasal dari
   webhook bertanda tangan atau sinkronisasi server yang memvalidasi reference,
   amount, dan metadata status. Item Snap ditambah `rounding_adjustment` agar
   jumlah IDR integer tepat sama dengan `gross_amount`.
7. Customer dapat memperbarui status melalui
   `POST /my-order/{order}/payment/sync`, dengan ownership, CSRF, dan throttle
   enam request per menit. Tombol bayar/batal/sync mengikuti kemampuan server;
   sesi expired/uncertain tidak menawarkan pembayaran ulang. Bukti pembayaran
   tidak tersedia sebelum paid. Konfirmasi manual admin hanya untuk manual.
8. Core status 404 saja tidak membuktikan sesi Snap tidak dapat dibayar.
   Pembatalan sesi yang belum charged harus mengonfirmasi Snap cancellation,
   lalu memeriksa Core lagi. In-progress/malformed/timeout mempertahankan
   reservasi. Settlement bersamaan tidak boleh diturunkan menjadi cancelled.
9. Scheduler menyinkronkan expiry, uncertain, dan klaim creating yang melewati
   satu menit. Tidak melepas stok hanya karena waktu lokal lewat. Jika token
   belum tersimpan dan Core 404, pertahankan reservasi; operator perlu bukti
   merchant/provider sebelum keputusan pemulihan. Jangan menghapus metadata
   klaim atau mencoba POST baru secara manual tanpa rekonsiliasi.
10. Late settlement setelah reservasi dilepas masuk `manual_review`, bukan
    mengambil ulang stok. Booking Biteship tetap tindakan fulfillment admin
    setelah paid; webhook pembayaran tidak langsung membuat pengiriman.

## Verifikasi Integrasi Awal (21 Oktober 2026)

- `php vendor/bin/pest --compact`: **233 tes, 1085 assertions, lulus**.
  Bootstrap melewati `.env`, memakai SQLite memory, synthetic keys, dan
  `Http::preventStrayRequests()`; seluruh provider HTTP memakai fakes.
- `php tests/Concurrency/run.php`: **7 skenario MySQL disposable lulus**:
  duplicate manual confirmation, manual cancel/confirm, idempotent checkout
  dengan satu POST Snap, duplicate booking, atomic webhook receipt, duplicate
  Midtrans settlement, serta Midtrans settlement/cancel. Database acak khusus
  testing dibuat/dihapus runner; DB aplikasi tidak digunakan.
- `node --experimental-strip-types tests/Unit/http-url.test.mjs`: lulus.
- `npm run types:check`: lulus. Pint, PHP lint, ESLint dan Prettier terfokus
  pada file implementasi Midtrans: lulus.
- PowerShell `$env:ISOLATED_BUILD='1'; npm run build`: lulus; Wayfinder
  menggunakan bootstrap `tests/console.php`, bukan DB/config aplikasi aktif.
  Bundle dan manifest dibangun ulang dari source terbaru.
- Browser Chrome terisolasi, fixture SQLite memory per request: checkout,
  detail Midtrans pending, dan admin Payment Settings pada 1440x900 dan 390x844;
  tanpa horizontal overflow. Memilih JNE dan menyetujui kebijakan mengaktifkan
  tombol bayar pada kedua ukuran; link resume mengarah ke sandbox yang benar.
  Tidak mengklik link provider atau menyelesaikan pembayaran eksternal.

## Batas Verifikasi dan Gate Rilis

- Browser fixture menginisialisasi DB per request, bukan E2E pembayaran durable.
  Tidak ada klaim settlement nyata, autentikasi merchant, provider sandbox/live,
  keterjangkauan webhook publik, atau cron/queue deployment telah terbukti.
- ESLint global masih memiliki masalah di luar file checkout/order yang diubah;
  baseline terakhir 270 errors dan 4 warnings setelah koreksi formatting test
  URL. Tidak diubah massal dalam pekerjaan integrasi ini.
- Sebelum rilis: cocokkan merchant key/environment, buktikan webhook HTTPS,
  callback HTTPS, scheduler dan worker aktif; jalankan UAT sandbox berizin untuk
  settlement, expiry, cancel, challenge, refund, dan failure matrix. Tidak ada
  provider API yang dihubungi selama verifikasi implementasi ini.
- Laporan audit referensi tetap dokumen historis parsial; implementasi Midtrans
  ini bukan klaim bahwa seluruh checklist audit sebelumnya sudah ditutup.

## Referensi Kontrak Provider

- https://docs.midtrans.com/docs/snap-snap-integration-guide
- https://docs.midtrans.com/reference/cancel-a-snap-session
- https://docs.midtrans.com/reference/json-objects
- https://docs.midtrans.com/docs/https-notification-webhooks
- https://docs.midtrans.com/reference/request-body-json-parameter
- https://docs.midtrans.com/reference/other-qris

Kontrak cancellation Snap diperiksa pada dokumentasi publik: Authorization
memakai raw merchant server key; `canceled_at` atau pesan token already canceled
adalah acknowledgement. Transaction is on progress bukan bukti pembatalan.
