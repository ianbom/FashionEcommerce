# Catatan perubahan dan panduan porting AxeGear

## 1. Ruang lingkup

Disusun 12 Oktober 2026 berdasarkan riwayat Git repository ini. Dokumen berdiri sendiri untuk merevisi codebase lain, bukan instruksi menyalin repository tanpa adaptasi.

- Baseline, **tidak termasuk**: `87cca12a7423b9bff6f887375690cbc3f5c57db5`.
- Endpoint, **termasuk**: `3740ad889e2071c953cf0221c6af7e65575bfe19`.
- Rentang: `87cca12..3740ad8`, lima commit sesudah baseline.
- Bukti: diff endpoint/setiap commit, source historis `git show`, tests dan manifest build. Percakapan/pesan commit tidak membuktikan implementasi dengan sendirinya.
- Laporan lama `docs/commit-changes-87cca12-to-5506fb2.md` mencakup empat commit pertama. Keadaan akhir di sini menggantikannya, khususnya ukuran varian, Snap, cancel, pembulatan dan replay webhook.
- Tidak ada perubahan aplikasi, database, konfigurasi aktif atau riwayat Git selama penyusunan laporan. Tidak dilakukan pengujian provider langsung.

### Statistik endpoint

| Ukuran | Nilai |
| --- | ---: |
| Commit | 5 |
| Entri diff dengan deteksi rename | 272 |
| Added / Modified / Deleted / Rename | 59 / 68 / 23 / 122 |
| Tambahan / penghapusan baris, rename-aware | 45.397 / 2.460 |
| Path eksplisit tanpa deteksi rename | 394 |
| Tambahan / penghapusan baris, tanpa rename | 45.668 / 2.731 |
| Entri `public/build` / di luar build | 170 / 102 |

Union path kelima diff individual sama dengan 394 path endpoint tanpa rename: tidak ada path perantara tambahan yang luput. Statistik per commit tidak dijumlahkan sebagai diff akhir karena berkas dapat berubah berulang kali. Rename adalah heuristik kemiripan Git, terutama bundle berhash, bukan bukti rename manual. Binary tidak memiliki angka baris. Transkrip menyumbang 34.265 tambahan baris; besarnya diff bukan ukuran banyaknya logika bisnis.

## 2. Kronologi

Timestamp author Git memakai zona `+07:00`.

| Commit lengkap | Tanggal | Pesan | Pokok perubahan |
| --- | --- | --- | --- |
| `d8229d7e10fa5259b9093d6357c99fa7c3ed61d8` | 2026-10-09 00:45:02 | perbaikan cart dan checkout | Layout cart, copy checkout, preservasi pilihan ongkir saat voucher berubah. |
| `3c26c924d1d0e1e3e162056ea272468095a12a1e` | 2026-10-09 20:47:17 | perbaikan voucher, cart, midtrans | Guard pembayaran/stok, workflow order/shipment, settings canonical, pagination/admin, tests dan build. |
| `c889c1bbab1f56dea68a2365101d7b34a54365f7` | 2026-10-10 00:56:41 | perbaikan fungsi order midtrans | Booking memakai pilihan customer, hasil tidak pasti, kontak, sorting/gallery/produk, validasi form. |
| `5506fb2e75699e8efeb93f2755e539b44bbd7069` | 2026-10-10 03:33:06 | perbaikan webhook biteship dan ongkir sempet salah kirim | Shipping issues, tracking/address, berat per unit/dimensi, estimator ongkir dan tests. |
| `3740ad889e2071c953cf0221c6af7e65575bfe19` | 2026-10-10 16:55:27 | ubah harga ongkir menggunakan produk variant | Ukuran varian, Snap/cancel, IDR, replay Biteship, reserved stock dan UI/test tambahan. |

Commit terakhir mencakup 38 berkas, +2.110/-204 baris; bukan hanya mengganti dimensi. Build terakhir berubah pada `3c26c92`, bukan endpoint. Bagian berikut menjelaskan keadaan **akhir**, kecuali disebut perubahan perantara.

Statistik diff individual: d8229d7 5 berkas/+189/-53; 3c26c92 217/+37.416/-1.776; c889c1b 26/+3.397/-436; 5506fb2 31/+2.385/-91; 3740ad8 38/+2.110/-204. Keanggotaan tiap berkas per commit tersedia dalam lampiran, termasuk file yang berubah pada beberapa tahap.

## 3. Arsitektur dan batas porting

Stack existing: Laravel 13/PHP 8.3, Inertia 3, React 19, TypeScript, Tailwind, Vite, Wayfinder dan Lucide. Tidak ada dependency baru atau perubahan migrations/models/manifest dependency/lockfile. Tidak ada schema baru; field varian, snapshot order, receipt webhook dan settings yang digunakan merupakan prasyarat existing.

Alur: katalog/varian, cart, alamat/quotation, voucher, checkout/reservasi, pembayaran/finalisasi stok, persiapan admin, booking, tracking, delivered, completed. Payment status, order status, shipment status terpisah. Mengganti UI saja tidak memindahkan perlindungan bisnis.

Porting harus menyesuaikan model/relasi, enum, route, session, satuan berat/dimensi, mata uang dan identitas codebase tujuan. Jangan menyalin credentials, transkrip atau bundle berhash. Jika schema tujuan belum memiliki prasyarat, siapkan adaptasi schema terpisah; migration tersebut tidak tersedia dalam rentang ini.

## 4. Checkout, ukuran varian, voucher dan pembulatan

### 4.1 Sumber ukuran dan snapshot

File utama: `app/Services/Customer/CheckoutService.php`, `app/Services/Integrations/BiteshipService.php`, `app/Services/Admin/ShipmentManagementService.php`.

Pada tahap awal, dimensi checkout berasal dari produk utama dan ditambahkan ke quotation/hash. Endpoint menggantinya dengan **varian yang dipilih** untuk weight, length, width, height. Berat cart/snapshot item adalah berat per unit x quantity; panjang/lebar/tinggi tidak dikalikan quantity.

Empat nilai harus positif sebelum quotation, validasi rate terpilih dan dalam transaksi checkout yang mengunci data. Tidak ada fallback ukuran produk utama/berat palsu 1 gram untuk checkout baru. Hash memuat dimensi; perubahan ukuran sesudah memilih ongkir membatalkan binding. Normalisasi item terkunci dibandingkan kembali dengan binding terpilih, bukan percaya validasi sebelum transaksi saja.

Quotation mengubah berat agregat menjadi per unit dengan `intdiv(totalWeight, max(1, quantity))`, quantity dikirim terpisah. Booking memakai **snapshot order_items**, tidak membaca ulang ukuran varian terbaru. Booking historis tetap membagi berat dengan ceil/minimum 1; snapshot lama tidak ditulis ulang. Ini batas validasi checkout baru dan kompatibilitas existing.

Ukuran produk utama tidak dihapus dari schema/form. Root product tetap memerlukan ukuran min 0 dengan aturan publikasi berat minimal 1; estimator admin tetap memakai root dimensions. Jangan menganggap semua pemakaian ukuran root adalah bug atau semua shipment lama harus diubah.

### 4.2 Voucher dan binding

Sebelum rentang, apply/remove voucher menghapus `checkout.shipping_rates`, `checkout.shipping_rate_id`, `checkout.selected_rate_binding`. Sesudahnya data itu dipertahankan; remove voucher membersihkan checkout expired terlebih dahulu. Ownership alamat, expiry, hash/binding dan validasi harga provider tetap berlaku.

**Batas endpoint:** `cartHash()` masih menyertakan kode voucher, tetapi apply/remove tidak memperbarui hash binding tersimpan. Mengganti voucher setelah memilih rate dapat ditolak saat placeOrder dengan `shipping_rate_id: Keranjang berubah. Pilih ulang ongkir.` Jadi yang berubah adalah preservasi session, bukan jaminan bisa langsung checkout memakai binding lama. Temuan source, bukan reproduksi runtime pekerjaan ini; tests voucher belum membuktikan alur lengkap sampai placeOrder setelah voucher berubah.

### 4.3 Rupiah utuh

Backend membulatkan total nonnegatif ke IDR utuh memakai half-up; frontend memakai Math.round untuk nilai nonnegatif. CheckoutSummary menambah `rounding_adjustment?: number`; summary menampilkan adjustment hanya bila bukan nol.

`MidtransService::itemDetails()` menambah item rounding/Pembulatan jika jumlah item x quantity, shipping dan diskon berbeda dari grand total bulat. Tujuannya jumlah item Snap sama dengan nilai transaksi, bukan mengubah harga katalog.

amountMatches menerima integer atau desimal dengan pecahan seluruhnya nol, harus finite dan sama dengan gross lokal yang dibulatkan half-up. `102000` dan `102000.00` dapat cocok; `102000.50` ditolak. Record lama tidak diubah melalui migration. Mata uang pecahan memerlukan keputusan berbeda, bukan menyalin aturan IDR ini.

## 5. Midtrans, idempotensi, stok dan pembatalan

### 5.1 Event pembayaran dan finalisasi

ApplyMidtransPaymentStatusAction, SyncMidtransPaymentAction, MidtransWebhookService/controller menambah guard sebelum metadata/state diganti. Paid tidak diturunkan pending/stale; refunded tidak diproses ulang; partially_refunded hanya refund/partial_refund. Paid menerima settlement, refund/partial_refund atau capture dengan fraud accept. Terminal gagal dapat menerima settlement/capture accept/refund terlambat, bukan pending downgrade. Manual review dengan reservasi released menolak pending/authorize.

Order sudah paid hanya melengkapi paid_at kosong, tidak mengulang stok/notifikasi. Pembayaran baru mengubah ke paid hanya jika order pending_payment; fulfillment yang berjalan tidak direset. Sukses membersihkan failure_reason.

Finalisasi memakai transaksi/lock order dan varian serta invariant stock/reserved stock. Konflik satu item rollback perubahan item lainnya. Reservasi released tidak dapat difinalisasi meskipun settlement terlambat: masuk review, tidak mengambil reservasi order lain.

DomainException konflik stok disimpan sebagai manual_review/reason dan state order sesuai, tanpa notifikasi sukses berulang. Konflik domain terkelola dapat mendapat HTTP 200 agar provider tidak terus retry. **Tidak semua error webhook menjadi 200**: missing required fields, signature, referensi/payment tidak ditemukan dan exception tak terduga tetap jalur error.

Controller sebelumnya mencatat seluruh payload webhook; endpoint hanya mencatat order_id/transaction_status bertipe string serta acknowledgement http_status 200 setelah handle selesai. Signature/customer/payment detail tidak ikut full-payload log ini. Perubahan sanitasi log harus ikut porting, bukan hanya menambah log sukses.

Sync menambah applyPayload untuk payload yang sudah diperoleh. Lock order lalu payment konsisten. Log penolakan reference/amount commit terlebih dahulu; ValidationException dilempar di luar transaksi agar log tidak ikut rollback.

### 5.2 Pembuatan Snap tidak pasti

Endpoint membedakan penolakan terkonfirmasi dari hasil tidak pasti:

| Hasil | Perilaku |
| --- | --- |
| Client error dengan error_messages.0 nonempty, bukan 408/409/429, bukan pesan duplicate/already/used/taken | Confirmed rejection: checkout gagal, reservasi dilepas. |
| Timeout/5xx/malformed/duplicate/status pengecualian | Uncertain: exception khusus, order/payment manual_review, raw_response.snap_creation_uncertain dan failure_reason. |
| HTTP sukses, token kosong atau redirect bukan HTTPS valid | Uncertain, bukan session sukses. |
| Token nonempty, redirect HTTPS valid | Snap session dapat digunakan. |

Uncertain mempertahankan cart, stock reservation dan voucher. Idempotency sama tidak membuat token baru sembarangan; paid concurrent tidak ditimpa gagal. SyncExpiredMidtransPaymentsAction juga memilih manual_review flagged uncertain walaupun belum expired. Admin payment menambah status/filter/count manual_review dan failure_reason untuk rekonsiliasi.

### 5.3 Pembatalan customer

Tidak lagi membatalkan hanya karena payment method belum terisi:

1. Cari status Midtrans. findTransactionStatus null hanya untuk status_code 404 provider pada HTTP 200/404; bukan semua error jaringan/HTTP 404 tanpa payload sesuai.
2. Not-found memerlukan Snap token diketahui dan cancel session sukses dengan canceled_at nonempty. Jika tidak, cancel lokal ditolak tanpa melepas reservasi.
3. Pending/authorize existing harus cancel provider dengan HTTP sukses, status_code 200, transaction_status cancel dan reference/amount cocok.
4. Provider sudah final: apply status terlebih dahulu, lalu tolak cancel customer.
5. Lock/recheck order/payment sebelum cancel lokal; transport uncertain tidak menjadi alasan melepas stok/voucher.

transactionStatus tetap wrapper yang melempar ValidationException untuk not-found. Jangan mengganti semua caller menjadi nullable tanpa menyesuaikan kontraknya.

## 6. Biteship, fulfillment dan alamat

### 6.1 Booking dan quotation

Booking detail order memakai `source=order_detail` dan courier/service pilihan customer. Courier request conditional; server memeriksa eligibility/lock/booking existing untuk menolak ganda. Booking uncertain memblokir retry otomatis; create POST tidak diulang sebagai retry biasa. Respons harus menunjukkan booking nyata, bukan hanya HTTP sukses tanpa identitas provider.

Koordinat **create order** menjadi object origin_coordinate/destination_coordinate; **rates tetap flat**. Helper numeric finite, latitude absolut maksimal 90, longitude 180; gojek/grab perlu origin dan destination. Jangan menyamakan payload kedua API.

Rates membuang harga missing/nonnumeric/nonfinite/negatif; nol eksplisit tetap sah, fallback shipping_fee tersedia. Ukuran mengikuti varian/snapshot bagian 4, estimator mengikuti bagian 8.

### 6.2 Webhook sebelum shipment tersedia

Controller menyimpan receipt memakai firstOrCreate(payload_hash). Duplikat dianggap selesai hanya jika processed_at terisi. processWebhook mengunci receipt, mencocokkan provider order/tracking/waybill, apply payload dan processed_at atomic. Tanpa shipment cocok, receipt tetap pending.

replayWebhooks(?Shipment) membaca pending chunk 50, memproses ulang dan mencatat error per receipt. Booking replay segera setelah shipment tersedia, sebelum email. Command `shipments:replay-biteship-webhooks` dijadwalkan everyTenMinutes/withoutOverlapping, berdampingan payment sync.

Prasyarat porting: receipt/hash/processed_at existing, scheduler aktif dan cache lock sesuai. Controller tanpa service/command meninggalkan pending receipt. Replay bukan retry create provider.

### 6.3 Shipping issue dan fulfillment

Enum/service/frontend membedakan kendala temporary, terminal dan perjalanan retur. Stale/duplicate event tidak menurunkan state atau mengulang efek final. Delivery/returned/lost/failed punya legal transitions dan reason/description. Shipping issue tidak otomatis refund/cancel/release stok.

Admin mendapat server-validated actions, misalnya paid ke processing ke ready_to_ship dan delivered ke completed. Cancellation bukan pilihan status biasa. Histori/actor/reason/stock movements tersedia, timestamp ISO ditampilkan WIB. Helper frontend menghitung tampilan, bukan pengganti validasi bisnis.

OrderStatusRequest menerima processing/ready_to_ship/completed/shipment_failed; reason shipment_failed wajib trimmed nonempty maksimal 1.000 karakter. Penandaan gagal memerlukan terminal issue lost/returned/problem dengan disposed serta lifecycle dan snapshot order/shipment konsisten. Completion memerlukan payment paid dan kedua shipping snapshots delivered, menjaga completed_at pertama. Audit memakai admin_order_failure/actor/reason dan status_history dari AdminActivityLog referensi admin.orders.status. Stock movements hanya StockLog order/varian terkait (quantity/before/after/time), bukan stok saat ini.

ShipmentStatusRequest menerima confirmed/allocated/picked/in_transit/delivered/cancelled/failed/problem/lost/returned, description wajib maksimal 500 dan location optional maksimal 255. Server tetap memeriksa provider booking, paid/state relevan dan legal transition: FormRequest list bukan izin melewati lifecycle. delivered/cancelled timestamp pertama dipertahankan.

Normalisasi provider: courier_assigned/picking_up menjadi allocated; picked_up menjadi picked; dropping_off/on_process/on_delivery/shipped menjadi in_transit; canceled menjadi cancelled; rejected menjadi failed; on_hold/return_in_transit/disposed/damaged/unknown menjadi problem. shipping_issue berisi status/label/description/reason/is_terminal; terminal hanya lost/returned atau problem dengan disposed. Return history mencegah pulih ke pengiriman normal; failed dapat menerima return/lost/disposed tertentu. Guard histori/stale/terminal tetap berlaku di atas tabel enum berikut.

| State saat ini | Target enum transitions |
| --- | --- |
| not_created | creating |
| creating | confirmed, allocated, picked, in_transit, delivered, cancelled, failed, problem |
| confirmed | allocated, picked, in_transit, delivered, cancelled, failed, problem |
| allocated | picked, in_transit, delivered, cancelled, failed, problem |
| picked | in_transit, delivered, failed, problem, lost, returned |
| in_transit | delivered, failed, problem, lost, returned |
| problem | confirmed, allocated, picked, in_transit, delivered, cancelled, failed, lost, returned |
| Lainnya | Tidak ada target umum; event pengecualian diperiksa service. |

### 6.4 Note, subdistrict dan link

Destination snapshot berurutan full_address, lalu ` (note)` jika ada, lalu `, subdistrict` jika ada. destination_note dikirim terpisah. Data alamat/snapshot terkait order, bukan alamat milik customer lain.

**courier.link nonempty pertama dipertahankan** saat webhook/refresh berikutnya kosong atau berbeda. Midtrans tidak menimpa shipment raw response. Tidak ada backfill link yang hilang sebelum perbaikan.

Customer memvalidasi HTTP/HTTPS dan mengaktifkan Lacak Pesanan berdasarkan link usable, bukan status tertentu. Tracking internal tetap untuk progres/admin. Riwayat Pengiriman tidak ada pada baseline/endpoint, sehingga **bukan penghapusan committed** meskipun disebut dalam percakapan.

## 7. Settings canonical dan kontak

SiteSettingService, SettingManagementService, SettingRequest, seeder dan contact memakai key canonical:

| Canonical | Alias legacy |
| --- | --- |
| store_name | shipper_name |
| store_phone | whatsapp_number, contact_phone, shipper_phone |
| store_address | origin_address, contact_address |

Canonical menang termasuk null eksplisit; request legacy tetap diterima. Tidak ada backfill DB otomatis. Seeder mengganti contoh identitas/origin menjadi AxeGear/Tangerang Selatan, postal 15310, koordinat -6.314540/106.699569, courier jnt,jne. `.env.example` mengubah APP_NAME/MAIL_FROM_ADDRESS, bukan `.env` aktif. Sesuaikan identitas bisnis tujuan; jangan seed database aktif hanya untuk menyamakan source.

ContactController baru memberi whitelist settings public pada route contact existing. Halaman memakai identitas, jam, alamat, maps dan sosial dengan URL/email/nomor valid. Maps memakai koordinat/alamat/search fallback. Form nama/pesan maksimal 1.000 karakter membuka WhatsApp dengan pesan encoded, bukan menyimpan DB/mengirim email backend.

Detail order menerima supportPhone. Separator dibuang, awalan lokal 0 menjadi 62, digit internasional divalidasi. Dukungan menuju WhatsApp, bukan notifications; missing/invalid memberi pesan unavailable, tanpa nomor buatan. Product help menuju generated contact route.

## 8. Admin produk, validasi dan estimator

Backend menambah pesan validasi Indonesia, SKU duplicate/index/ownership dan harga varian. Active variant nested/standalone harus empat ukuran positif; inactive boleh null pada backend. Nested sale_price tidak melebihi regular_price varian sendiri; regular wajib bila sale diisi.

Form menambah error summary, invalid markers/ARIA, fokus/scroll field spesifik, pemetaan upload error dan error varian berindeks, membuka dialog invalid serta restore focus saat ditutup. Draft/file tidak dibuang saat gagal validasi.

**Mismatch endpoint:** validator draft frontend meminta empat ukuran juga untuk inactive tetapi menerima 0; backend active minimal 1 dan inactive boleh null. Perlu acceptance test porting, bukan menganggap validator identik. Laporan tidak memperbaiki source ini.

Endpoint baru `POST /admin/products/shipping-estimate` untuk admin aktif, throttle 30/menit, tanpa logging admin.activity. FormRequest ukuran numeric >0 maksimal 1e9. Estimator memakai **ukuran produk utama belum tersimpan**, origin settings, simulasi tujuan 1 km garis lurus ke utara, satu item tanpa asuransi. Rates diurutkan; bukan jarak jalan atau quotation checkout sesungguhnya.

Offset latitude memakai radius bumi 6.371.000 meter, longitude tetap; payload quantity 1/value 0. Koordinat/settings courier/API key/provider error diperiksa. JSON sukses berbentuk `{ rates: [...] }`; connection failure HTTP 503 dengan pesan aman. Checkout tetap memakai alamat/postal tujuan customer, bukan tujuan simulasi estimator.

Komponen memakai debounce 800 ms, AbortController, input signature menolak respons stale, generated POST/same-origin/XSRF, loading/success/empty/error/retry dan live region. Tidak ada dependency baru.

Produk index table-fixed/colgroup, truncate/title/padding proporsional, price/variants didekatkan. Backend mengagregasi reserved_stock varian; kolom Reserved Stock di samping Stock. Detail admin merapikan header/action/statistik/gallery/informasi/deskripsi/tabel varian/related data dengan min-w-0, overflow lokal dan image bounds.

## 9. Frontend customer dan shared admin

### 9.1 Cart dan checkout

Cart dua kolom pada xl, summary maksimal 380 px. Container query 720 px mengatur tabel; track produk/harga/subtotal fleksibel, quantity 128 px/delete 40 px. Mobile memakai label nilai, delete bukan absolute overlay, identitas vertikal, gambar terkontrol, nama truncate/title, angka wrap. Suggested products kartu vertikal. Estimasi shipping/diskon di cart dihapus, bukan kalkulasi checkout.

Copy checkout tidak lagi menyebut provider. Endpoint menambah adjustment pembulatan summary/context tanpa mengganti cart/checkout handler menjadi flow baru.

### 9.2 Detail produk dan semua foto

Desktop: gallery kiri, pembelian kanan, description di bawah gallery. Mobile: gallery, informasi/varian/quantity/Add to Cart, Product Description, Shopping Information. Weight/Length/Width/Height disembunyikan customer, bukan dihapus dari kebutuhan shipping. Product Line/Style Name tampil bila terisi; description/metadata kosong tidak membentuk placeholder kosong.

slice(0,6) dihapus. Seluruh thumbnail produk/varian aktif tampil horizontal mobile/vertical desktop. Previous/next mengubah active index, disabled di batas; effect scroll active thumbnail, alt/lazy/aria-pressed tersedia. Backend test memastikan semua foto tanpa duplicate; mapper existing bukan seluruhnya fitur baru rentang ini.

Shopping Information statis: Secure Shopping/Careful Packaging/Customer Support, Shipping Information/Order Processing, accordion Product Care Guide/Shipping & Delivery/Returns & Exchanges dan Need Help. Ikon outline orange/border tipis, library existing. Accordion collapsed awal, satu terbuka, header button/plus-minus/transisi ringan memakai Collapsible. Tidak ada API/fake request atau kebijakan retur fiktif. Dua placement memakai desktop/mobile visibility; mobile sesudah description.

Commit akhir menghapus button zoom menjadi empty fragment, tanpa zoom alternatif. Import Search tertinggal tidak terpakai: risiko lint, tidak diperbaiki oleh laporan.

### 9.3 Listing dan sort

Backend sebelum pagination: latest desc default, latest asc, name asc/desc, price asc/desc; effective sale price, ID tie-breaker stabil. Options menambah order; frontend select mengirim sort/order bersama, reset products infinite-scroll agar hasil lama tidak bercampur.

Mobile search full row, Filter/Sort berdampingan dengan ikon/native select, label/focus/ARIA. Grid/skeleton dua kolom sampai md lalu tiga/empat; padding gambar/badge/text/price dikompakkan. Card akhir image/nama/collection/colors bila ada/harga normal-diskon; tanpa SKU atau fallback category. Ini tidak menghapus SKU admin/cart.

### 9.4 Order, shipment, pagination, shell

Customer order menambah label/badge/panel shipping issue dan support; progres memakai timestamp payment/shipping/tracking, tidak mengesankan selesai saat issue. Metode Bank Transfer/QRIS atau normalisasi underscore ditampilkan tanpa label provider Midtrans.

Order/shipment admin memakai server actions/eligibility/issue/histori serta helper order-workflow. Cetak lokal dinamai AxeGear Packing Document, bukan label resmi kurir; tombol label membuka provider link, tidak ada endpoint print baru.

lib/pagination dan PaginationLabel mengganti parser tersebar: previous/next English, translation keys, entities/guillemets/arrows; Chevron/sr-only, angka/ellipsis text, tanpa dangerouslySetInnerHTML. Dipakai 12 listing: admin-users, categories, collections, customer-addresses, customers, notifications, orders, payments, product-variants, products, shipments, stock. Shared catalog memakai helper yang sama; per-page existing tetap.

Sidebar menghapus menu Halaman, **bukan route/controller admin pages**. Shell overflow-x-hidden menjadi overflow-x-clip, JSX dirapikan, bukan theme redesign.

## 10. Kontrak yang ikut direvisi

| Area | Kontrak akhir / perhatian porting |
| --- | --- |
| Checkout session | Rates/rate ID/binding/expiry, hash dimensi dan voucher; inconsistency bagian 4.2. |
| Cart/order_items | Berat agregat qty, ukuran varian snapshot; booking historical snapshot. |
| CheckoutSummary | rounding_adjustment optional, IDR utuh, adjustment UI. |
| Payment/raw_response | manual_review/failure_reason/snap_creation_uncertain; paid concurrent terjaga. |
| Midtrans | Nullable status hanya confirmed not-found, Snap cancel, token/HTTPS/amount/cancel validation. |
| Shipment request | source order_detail, courier conditional, eligibility dan booking flags. |
| Biteship | Nested coordinates create/flat rates, note lalu subdistrict, per-unit weight. |
| Webhook receipt | Hash/processed_at, atomic apply/replay, scheduler/cache lock. |
| Order status request | Cancellation bukan dropdown biasa, shipment_failed dan reason conditional. |
| Shipment status request | failed/lost/returned, description dan legal transitions. |
| Admin detail props | Actions/issue/history/stock movements/actor/booking-sync flags/ISO timestamps. |
| Customer detail props | supportPhone/shipping_issue, valid HTTP/HTTPS tracking. |
| Catalog | sort/order, latest desc default, ID ties, reset infinite-scroll. |
| Product admin | reserved_stock total, active dimensions, sale/regular validation. |
| Estimator | Route/request/controller/service/component/XSRF/throttle; root dimensions. |
| Contact/settings | Public contactSettings, canonical identity/legacy aliases/null wins. |

routes/api.php tidak berubah; tidak ada webhook payment endpoint baru. Wayfinder-generated source tidak diedit manual/masuk diff; regenerate dari Laravel routes/controllers saat porting. phpunit.xml memaksa SQLite in-memory/DB_URL kosong dan cache config/routes testing khusus. RefreshDatabase tidak globally enabled di tests/Pest.php; aktifkan per test yang perlu isolasi.

## 11. Urutan porting dan acceptance tests

| Urutan / modul | Tindakan dan prasyarat | Penerimaan yang harus diuji |
| --- | --- | --- |
| 1. Baseline mapping | Cocokkan schema/relasi/enum/unit/route/session/reservasi/receipt/settings. | Field/route/flow lengkap; tanpa credentials/transkrip tersalin. |
| 2. Settings/contact | Canonical/aliases/public whitelist, adaptasi identitas, jangan seed DB aktif. | Null/canonical menang, legacy diterima, invalid phone/URL aman. |
| 3. Ukuran/validasi | Active variant validation/cart/hash/snapshot; root estimator dan old snapshot tetap. | Root berbeda dari varian: rate memakai varian; qty >1 tidak double count; invalid sizes ditolak; old booking tetap snapshot. |
| 4. Voucher/IDR | Selaraskan binding/hash voucher; backend/UI/Snap rounding identik. | Apply/remove setelah select lalu placeOrder; jumlah item sama gross; adjustment nol hidden. |
| 5. Payment/stok | Guard/locks/idempotency/log commit/manual_review/reason. | Duplicate/stale tidak ulang stok/email; konflik rollback semua; late settlement tidak mengambil released reservation. |
| 6. Snap/cancel/sync | Uncertain vs rejected, token/HTTPS, provider status/cancel, sync uncertain. | Timeout/5xx/malformed/duplicate preserve; confirmed reject release; cancel final/unknown ditolak; concurrent paid tetap. |
| 7. Booking | Selected courier/eligibility/duplicate/uncertainty/coordinates/snapshot. | Klik ulang bukan POST kedua; invalid gojek/grab coords ditolak; nol rate valid/invalid price dibuang. |
| 8. Replay | Receipt atomic/matcher/immediate replay/scheduler everyTenMinutes/lock. | Webhook-before-booking diproses; duplicate/stale idempotent; processed_at hanya setelah apply; unmatched pending. |
| 9. Fulfillment/link | Server actions/reason/history/transitions/first link preservation. | Link bertahan Midtrans/refresh/webhook dan clickable shipped; issue tidak auto refund/release; illegal transitions ditolak. |
| 10. Customer/products | Sort backend+frontend/gallery/card/responsive/reserved stock/errors/estimator. | Semua foto/sort seluruh hasil; mobile tanpa overflow; benefits setelah description; existing qty/cart tetap; zero/inactive validation diperiksa. |
| 11. Shared admin | Helper pagination/workflow beserta caller/contact routes. | Previous/next/ellipsis/keyboard/ARIA; actions sesuai server; WhatsApp encoded. |
| 12. Release | Regenerate Wayfinder/build final; scheduler/queue/provider credentials lingkungan. | Manifest sesuai source, lint/types/tests, rendered QA dan sandbox/live delivery logs. |

Ini daftar pengujian yang **diperlukan**, bukan klaim telah lulus. SQLite/HTTP fake dan source-pattern Node tests tidak membuktikan concurrency MySQL/provider live.

## 12. Tests dan artefak

PHP tests meliputi fulfillment/issues, product edit/validation/totals/variant dimensions, estimator/settings/contact, quotation/voucher, Midtrans, support phone, foto/sort/tracking. Node scripts meliputi rounding/contact/workflow/issues/tracking/pagination/description/gallery/mobile/estimator/shopping information/validation. Lampiran memberi tujuan tiap berkas.

Sebagian Node scripts memeriksa pola source/ekstraksi helper, bukan browser E2E. Jalankan isolated tests dan desktop/tablet/mobile browser QA; periksa locking dengan DB engine produksi bila concurrency merupakan acceptance criterion.

Artefak juga committed:

- cartt.png: referensi screenshot cart, bukan QA visual baru.
- Transkrip Codex: 34.265 baris; hanya inventaris/statistik, tidak salin isi yang mungkin sensitif; bukan dependency aplikasi.
- Laporan lama 731 baris: empat commit awal; endpoint butuh laporan terbaru ini.
- docs/integration-recovery.md: safety/release gates integrasi.
- reports/security/axegear-codex-audit.md: initial/incomplete, bukan sertifikasi keamanan.
- product-link.md: lima URL menjadi Markdown links dan local paste-image reference tidak tracked, bukan image loader.
- public/build: 170 entri manifest/chunks/CSS, mapping source di lampiran. R100 berarti konten identik; similarity lebih rendah punya delta.

## 13. Risiko endpoint

1. **Build stale:** terakhir 3c26c92, fitur source berikutnya belum otomatis masuk bundle. Rebuild sebelum release; jangan salin hashed assets sebagai implementasi akhir.
2. **Voucher/hash:** preservasi session bukan bukti binding valid; test sampai placeOrder.
3. **Validator mismatch:** 0/inactive/null frontend dan backend berbeda.
4. **Import Search unused:** lint risk sesudah zoom dihapus; tidak diperbaiki di sini.
5. **Manual review/uncertain:** rekonsiliasi operator/sync diperlukan sebelum melepas stok/booking ulang.
6. **Historical data:** tidak ada backfill link hilang/rewrite order_items lama.
7. **Delivery provider belum terbukti:** static review bukan bukti endpoint production available atau email failure selesai; perlu logs, HTTP status, DNS/TLS/firewall/payload disanitasi.
8. **Keamanan:** transcript/audit bukan config; periksa rahasia sebelum membagikan source; audit initial bukan bebas kerentanan.

## 14. Verifikasi dokumentasi

Inventaris dibangkitkan dari Git, diperiksa terhadap endpoint dan kelima diff. Tiap entri mencakup status/path lama-baru/baris/commit/penjelasan. Coverage rename-aware/path eksplisit/angka baris dicek terpisah.

```powershell
git log --reverse --format="%H %ad %s" --date=iso-strict 87cca12..3740ad8
git diff --name-status -M 87cca12 3740ad8
git diff --numstat -M 87cca12 3740ad8
git diff --name-only --no-renames 87cca12 3740ad8
git diff 5506fb2 3740ad8 -- app resources routes tests
git show 3740ad8:app/Services/Customer/CheckoutService.php
git log -1 --format="%H %s" 3740ad8 -- public/build/manifest.json
```

Pekerjaan dokumentasi menjalankan inventory checks dan git diff --check, **bukan** build/PHP/Node application suite/visual/provider tests. Tidak mengklaim hasil passing aplikasi. Di codebase tujuan: focused tests, lalu composer run ci:check, build dan browser/provider QA; pisahkan existing failure dari regression porting.

## 15. Lampiran seluruh perubahan berkas

Lampiran dihasilkan dari Git. Commit mencakup semua commit yang menyentuh path lama/baru, bukan seluruh fungsi dibuat pada commit itu. Statistik `-` berarti binary. Kedua path rename termasuk coverage 394 path eksplisit.

### 15.1 Backend, routes, settings dan config (36 entri)

| Status | Path lama / path akhir | + | - | Commit | Penjelasan |
| --- | --- | ---: | ---: | --- | --- |
| M | `.env.example` | 2 | 2 | 3c26c92 | Identitas contoh APP_NAME menjadi AxeGear dan MAIL_FROM_ADDRESS toko; tidak mengubah .env aktif atau credentials. |
| M | `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php` | 40 | 12 | 3c26c92, 3740ad8 | Guard event stale/final, paid idempotent, pertahankan fulfillment; konflik stok manual_review/reason; late final event dan released reservation handling. |
| M | `app/Actions/Payments/SyncExpiredMidtransPaymentsAction.php` | 4 | 2 | 3740ad8 | Rekonsiliasi juga memilih manual_review Snap uncertain meskipun belum expired. |
| M | `app/Actions/Payments/SyncMidtransPaymentAction.php` | 20 | 5 | 3c26c92, 3740ad8 | Guard sebelum metadata, applyPayload reusable, lock order lalu payment; commit log rejection reference/amount sebelum exception keluar transaksi. |
| M | `app/Actions/Stock/FinalizeReservedStockAction.php` | 42 | 35 | 3c26c92, 3740ad8 | Transaksi/locks/invariant stok atomic seluruh item, idempotensi; reservasi released tidak difinalisasi atau mengambil reservasi order lain. |
| M | `app/Enums/ShippingStatus.php` | 70 | 0 | 3c26c92, 5506fb2 | Klasifikasi/progres/legal state terkait shipping issues temporary/terminal/return, helper untuk backend dan serialization. |
| M | `app/Http/Controllers/Admin/OrderController.php` | 12 | 3 | c889c1b, 5506fb2 | Hubungkan status/reason admin dengan fulfillment service, expose workflow/action/issue props yang diperluas. |
| M | `app/Http/Controllers/Admin/ProductController.php` | 13 | 0 | 5506fb2 | Action shipping estimate menyambungkan FormRequest dan Biteship service, respons JSON rates simulasi. |
| M | `app/Http/Controllers/Admin/ShipmentController.php` | 12 | 2 | c889c1b | Forward source booking dari detail order dan status description/reason; expose flags/actions shipment. |
| A | `app/Http/Controllers/ContactController.php` | 22 | 0 | c889c1b | Controller baru mengirim contactSettings public whitelist untuk contact Inertia, bukan seluruh setting privat. |
| M | `app/Http/Controllers/Customer/BiteshipWebhookController.php` | 4 | 38 | 5506fb2, 3740ad8 | firstOrCreate payload hash, duplicate hanya processed_at, delegasi atomic processWebhook; hapus matching/mapper lokal ke service. |
| M | `app/Http/Controllers/Customer/MidtransWebhookController.php` | 3 | 1 | 3c26c92 | Ganti full-payload log dengan order_id/transaction_status string saja; log acknowledgement HTTP 200 setelah handle, hindari signature/customer data di log. |
| M | `app/Http/Controllers/Customer/OrderController.php` | 6 | 2 | 5506fb2 | Detail order mengirim supportPhone settings untuk WhatsApp dan data issue dari order service. |
| M | `app/Http/Requests/Admin/CreateShipmentRequest.php` | 3 | 2 | c889c1b | source order_detail diperbolehkan; courier/service kondisional saat menggunakan pilihan checkout customer. |
| M | `app/Http/Requests/Admin/OrderStatusRequest.php` | 12 | 1 | 3c26c92, 5506fb2 | Status fulfillment yang diperbolehkan, reason conditional dan shipping failure; bukan cancellation dropdown bebas. |
| M | `app/Http/Requests/Admin/ProductRequest.php` | 69 | 14 | c889c1b, 3740ad8 | Pesan validasi Indonesia, nested SKU uniqueness/index/ownership, harga varian sendiri; active variant empat ukuran positif, inactive nullable. |
| A | `app/Http/Requests/Admin/ProductShippingEstimateRequest.php` | 33 | 0 | 5506fb2 | Request baru authorized admin untuk empat ukuran numeric >0 maksimal 1e9; bukan quote customer destination. |
| M | `app/Http/Requests/Admin/ProductVariantRequest.php` | 19 | 4 | 3740ad8 | Standalone active variant memerlukan empat ukuran positif, inactive nullable; memperketat sumber data shipping. |
| M | `app/Http/Requests/Admin/SettingRequest.php` | 6 | 6 | 3c26c92 | Terima canonical identity keys melalui normalisasi legacy aliases, menjaga request lama. |
| M | `app/Http/Requests/Admin/ShipmentStatusRequest.php` | 2 | 2 | 3c26c92 | Pilihan failed/lost/returned dan description required untuk perubahan status admin. |
| M | `app/Services/Admin/OrderManagementService.php` | 91 | 30 | 3c26c92, c889c1b, 5506fb2 | Eligibility/actions server, legal fulfillment/issues, audit reason/history, stock movements order, ISO timestamps dan booking flags. |
| M | `app/Services/Admin/PaymentManagementService.php` | 3 | 2 | 3740ad8 | Tambah status/filter manual_review, count juga fraud challenge/deny, failure_reason dalam detail payment. |
| M | `app/Services/Admin/ProductManagementService.php` | 16 | 7 | c889c1b, 3740ad8 | Dukung validasi/edit SKU varian dan aggregate reserved_stock varian untuk produk listing. |
| M | `app/Services/Admin/SettingManagementService.php` | 6 | 7 | 3c26c92 | Simpan setting identity canonical dari request/alias legacy, tidak backfill database otomatis. |
| M | `app/Services/Admin/ShipmentManagementService.php` | 287 | 89 | 3c26c92, c889c1b, 5506fb2, 3740ad8 | Selected courier/booking locks/uncertainty, per-unit snapshot weight, note/subdistrict, first courier link, issue state/props; atomic receipt processing dan replay sebelum email. |
| M | `app/Services/Customer/CheckoutService.php` | 103 | 46 | d8229d7, 5506fb2, 3740ad8 | Preserve voucher shipping session; variant sizes/hash/locked validation/snapshot; IDR rounding; Snap rejection vs uncertain, manual_review dan reservation safety. |
| M | `app/Services/Customer/MidtransWebhookService.php` | 7 | 1 | 3c26c92, 3740ad8 | Guard sebelum metadata/status overwrite; rejected events dan amount validation mengikuti sync/action safety. |
| M | `app/Services/Customer/OrderService.php` | 50 | 8 | 5506fb2, 3740ad8 | Expose issue dan customer data; cancel query status/Snap atau transaction provider dahulu, apply final state dan lock/recheck sebelum local release. |
| M | `app/Services/Customer/ProductBrowsingService.php` | 12 | 7 | c889c1b | Default latest desc; name/price/latest asc-desc, effective sale price dan ID tie-breaker sebelum pagination. |
| M | `app/Services/Integrations/BiteshipService.php` | 64 | 9 | 3c26c92, 5506fb2, 3740ad8 | Dimension/item mapper, root 1 km estimator, coordinate validation/nested create versus flat rate; filter invalid rate prices, preserve zero/shipping_fee fallback. |
| M | `app/Services/Integrations/MidtransService.php` | 54 | 9 | 3740ad8 | Validate Snap token/HTTPS, classify confirmed rejection; findTransactionStatus nullable/Snap cancel/strict transaction cancel; integer IDR amount matching dan rounding item. |
| M | `app/Services/Settings/SiteSettingService.php` | 27 | 1 | 3c26c92 | Canonical store_name/phone/address dengan alias fallback; explicit canonical null menang dan shipper/contact callers kompatibel. |
| M | `database/seeders/SiteSettingSeeder.php` | 12 | 18 | 3c26c92 | Default canonical identity AxeGear/origin Tangerang Selatan/coordinates/couriers; jangan jalankan pada DB aktif untuk porting. |
| M | `phpunit.xml` | 5 | 3 | 3c26c92, c889c1b | Force SQLite in-memory/DB_URL kosong serta config/routes cache testing khusus, memisahkan tests dari runtime DB. |
| M | `routes/console.php` | 7 | 0 | 3740ad8 | Command replay Biteship dan schedule setiap 10 menit withoutOverlapping, payment sync existing tetap. |
| M | `routes/web.php` | 3 | 2 | c889c1b, 5506fb2 | Contact existing diarahkan ContactController; route shipping-estimate admin aktif/throttle30 tanpa admin.activity; endpoint bisnis lain dipertahankan. |

### 15.2 Frontend (31 entri)

| Status | Path lama / path akhir | + | - | Commit | Penjelasan |
| --- | --- | ---: | ---: | --- | --- |
| M | `resources/js/components/app-sidebar.tsx` | 0 | 5 | 3c26c92 | Hapus menu Halaman dari sidebar; route/controller admin pages tidak dihapus. |
| M | `resources/js/contexts/checkout-context.tsx` | 23 | 19 | 3740ad8 | Kontrak rounding_adjustment optional dan kalkulasi grand total rupiah utuh/adjustment bersama frontend. |
| M | `resources/js/layouts/app/app-sidebar-layout.tsx` | 4 | 1 | 3c26c92 | overflow-x-hidden menjadi overflow-x-clip dan rapikan JSX shell; bukan theme baru. |
| A | `resources/js/lib/order-workflow.ts` | 104 | 0 | 3c26c92, 5506fb2 | Helper/type workflow dan ShippingIssue; progres dari payment/shipping/history/tracking, issue tidak dianggap selesai. |
| A | `resources/js/lib/pagination.ts` | 15 | 0 | 3c26c92 | Helper label previous/next translation keys/entities/arrows; parser pagination terpusat. |
| M | `resources/js/pages/admin/admin-users/index.tsx` | 7 | 9 | 3c26c92 | Ganti parser label pagination lokal dengan PaginationLabel shared untuk previous/next/numeric/ellipsis; pertahankan filter/per-page/flow listing admin-users. |
| M | `resources/js/pages/admin/catalog/shared.tsx` | 3 | 7 | 3c26c92 | Hapus parser cleanPageLabel lokal, adopsi shared PaginationLabel; angka/ellipsis aman tanpa HTML injection. |
| M | `resources/js/pages/admin/categories/index.tsx` | 3 | 19 | 3c26c92 | Ganti parser label pagination lokal dengan PaginationLabel shared untuk previous/next/numeric/ellipsis; pertahankan filter/per-page/flow listing categories. |
| M | `resources/js/pages/admin/collections/index.tsx` | 3 | 19 | 3c26c92 | Ganti parser label pagination lokal dengan PaginationLabel shared untuk previous/next/numeric/ellipsis; pertahankan filter/per-page/flow listing collections. |
| M | `resources/js/pages/admin/customer-addresses/index.tsx` | 2 | 18 | 3c26c92 | Ganti parser label pagination lokal dengan PaginationLabel shared untuk previous/next/numeric/ellipsis; pertahankan filter/per-page/flow listing customer-addresses. |
| M | `resources/js/pages/admin/customers/index.tsx` | 2 | 18 | 3c26c92 | Ganti parser label pagination lokal dengan PaginationLabel shared untuk previous/next/numeric/ellipsis; pertahankan filter/per-page/flow listing customers. |
| M | `resources/js/pages/admin/notifications/index.tsx` | 2 | 18 | 3c26c92 | Ganti parser label pagination lokal dengan PaginationLabel shared untuk previous/next/numeric/ellipsis; pertahankan filter/per-page/flow listing notifications. |
| M | `resources/js/pages/admin/orders/index.tsx` | 3 | 19 | 3c26c92 | Ganti parser label pagination lokal dengan PaginationLabel shared untuk previous/next/numeric/ellipsis; pertahankan filter/per-page/flow listing orders. |
| M | `resources/js/pages/admin/orders/show.tsx` | 873 | 198 | 3c26c92, c889c1b, 5506fb2 | Workflow/progres/actions, issue/history/stock movements/reason dialogs, booking pilihan customer, packing document versus label resmi provider. |
| M | `resources/js/pages/admin/pagination.tsx` | 21 | 0 | 3c26c92 | PaginationLabel shared: Chevron previous/next, sr-only dan plain numeric/ellipsis labels. |
| M | `resources/js/pages/admin/payments/index.tsx` | 3 | 19 | 3c26c92 | Ganti parser label pagination lokal dengan PaginationLabel shared untuk previous/next/numeric/ellipsis; pertahankan filter/per-page/flow listing payments. |
| M | `resources/js/pages/admin/payments/show.tsx` | 11 | 2 | 3740ad8 | manual_review label/failure_reason dan generated Wayfinder links, operator dapat melihat rekonsiliasi yang dibutuhkan. |
| M | `resources/js/pages/admin/product-variants/index.tsx` | 8 | 20 | 3c26c92 | Shared PaginationLabel dan line-wrap harga; harga/variant business logic tidak diganti. |
| M | `resources/js/pages/admin/products/form.tsx` | 971 | 107 | c889c1b, 5506fb2, 3740ad8 | Error summary Indonesia/focus/ARIA/variant dialog preservation, shipping estimator integration, local size validation; mismatch 0/inactive dengan backend dicatat. |
| M | `resources/js/pages/admin/products/index.tsx` | 97 | 64 | 3c26c92, 3740ad8 | Table-fixed/colgroup/truncate/spacing/actions accessibility/shared pagination; dekatkan price/variants dan tambah Reserved Stock di samping Stock. |
| A | `resources/js/pages/admin/products/shipping-estimate.tsx` | 205 | 0 | 5506fb2 | Komponen estimator root dimensions unsaved, debounce800/abort/input signature/XSRF/retry/live region; copy simulasi 1 km tanpa asuransi. |
| M | `resources/js/pages/admin/products/show.tsx` | 151 | 128 | 3c26c92 | Reflow header/actions/stats/gallery/deskripsi/variant related tables; min-w-0/overflow/image bounds menjaga responsif. |
| M | `resources/js/pages/admin/shipments/index.tsx` | 3 | 19 | 3c26c92 | Ganti parser label pagination lokal dengan PaginationLabel shared untuk previous/next/numeric/ellipsis; pertahankan filter/per-page/flow listing shipments. |
| M | `resources/js/pages/admin/shipments/show.tsx` | 202 | 116 | 3c26c92 | Progress/issue/action flags/status reason/refresh dan label provider; cetak lokal jelas packing document. |
| M | `resources/js/pages/admin/stock/index.tsx` | 3 | 19 | 3c26c92 | Ganti parser label pagination lokal dengan PaginationLabel shared untuk previous/next/numeric/ellipsis; pertahankan filter/per-page/flow listing stock. |
| M | `resources/js/pages/contact/index.tsx` | 225 | 92 | c889c1b | contactSettings/URL-phone-map validation; nama/pesan encoded WhatsApp client-only, fallback/error states dan konten settings. |
| M | `resources/js/pages/customer/cart/my-cart.tsx` | 49 | 46 | d8229d7 | Container query720/xl summary380, mobile labels/nonoverlay delete/vertical item dan suggested card; hapus estimasi shipping/diskon cart. |
| M | `resources/js/pages/customer/checkout/checkout.tsx` | 11 | 6 | d8229d7, 3740ad8 | Copy bantuan tanpa provider eksplisit dan row Pembulatan jika rounding_adjustment nonzero; flow cart/payment existing tetap. |
| M | `resources/js/pages/customer/order/detail-order.tsx` | 137 | 17 | 5506fb2, 3740ad8 | Shipping issues/progres, HTTP/HTTPS courier link clickable lintas status, support WhatsApp settings, metode bayar tanpa label Midtrans. |
| M | `resources/js/pages/customer/products/detail-product.tsx` | 305 | 145 | 3c26c92, c889c1b, 3740ad8 | Hidden ukuran shipping, desktop/mobile description ordering, semua thumbnails/nav/active scroll; benefits/panel/accordion/help; zoom button dihapus tetapi Search import tersisa. |
| M | `resources/js/pages/customer/products/list-product.tsx` | 82 | 41 | c889c1b, 5506fb2, 3740ad8 | sort+order/latest desc/infinite-scroll reset, toolbar/card mobile dua kolom; card image/name/collection/colors/prices tanpa SKU/category fallback. |

### 15.3 Tests (29 entri)

| Status | Path lama / path akhir | + | - | Commit | Penjelasan |
| --- | --- | ---: | ---: | --- | --- |
| A | `tests/Feature/Admin/OrderFulfillmentWorkflowTest.php` | 768 | 0 | 3c26c92, c889c1b, 5506fb2, 3740ad8 | Server fulfillment actions/legal transitions/history/stock movements dan courier choice/booking idempotency/uncertainty; perluas safety provider dan reservation cases. |
| A | `tests/Feature/Admin/OrderShippingIssueTest.php` | 235 | 0 | 5506fb2 | Temporary/terminal/return issue dan legal admin transitions/reason; tidak otomatis refund/cancel/release. |
| M | `tests/Feature/Admin/ProductEditTest.php` | 4 | 1 | 3740ad8 | Regression edit product/nested variants, menyesuaikan fixture ukuran varian agar memenuhi active positive dimensions. |
| A | `tests/Feature/Admin/ProductShippingEstimateTest.php` | 114 | 0 | 5506fb2 | Endpoint estimator auth/validation/destination 1 km/rate sort serta provider fake; bukan bukti ongkir live. |
| A | `tests/Feature/Admin/ProductStockTotalsTest.php` | 39 | 0 | 3740ad8 | Aggregate stock/reserved_stock varian dan props product listing. |
| A | `tests/Feature/Admin/ProductValidationTest.php` | 115 | 0 | c889c1b, 3740ad8 | Pesan/error indeks/SKU duplicate-ownership, harga nested serta active/inactive dimension validation. |
| M | `tests/Feature/Admin/ShipmentCreatedMailTest.php` | 16 | 8 | 3c26c92 | Mail shipment masih terkirim setelah booking, payload/courier fixtures dan provider calls sesuai kontrak baru. |
| A | `tests/Feature/Admin/SiteSettingsTest.php` | 109 | 0 | 3c26c92 | Canonical settings/legacy aliases/null precedence serta request/seeder compatibility. |
| A | `tests/Feature/Admin/VariantShippingDimensionsTest.php` | 55 | 0 | 3740ad8 | Standalone variant active sizes positive/required, inactive nullable sesuai backend. |
| A | `tests/Feature/ContactPageTest.php` | 67 | 0 | c889c1b | Contact props settings/whitelist/fallback dan route, bukan backend contact message. |
| M | `tests/Feature/Customer/BiteshipShippingRateTest.php` | 377 | 2 | 5506fb2, 3740ad8 | Quote/booking weight per unit dan snapshot dimensions; varian berbeda/invalid/berubah sesudah rate, root berubah tidak invalidate quote, locked recheck dan provider price berubah; HTTP fake. |
| A | `tests/Feature/Customer/CheckoutVoucherShippingTest.php` | 135 | 0 | d8229d7 | Apply/remove voucher menjaga rates/selection/binding session; belum membuktikan placeOrder setelah voucher berubah. |
| A | `tests/Feature/Customer/MidtransWebhookTest.php` | 490 | 0 | 3c26c92, 5506fb2, 3740ad8 | Duplicate/stale/final/refund/stock conflict/payment safety, signatures/reference/amount dan extended Snap uncertain/cancel/rounding cases. |
| A | `tests/Feature/Customer/OrderSupportPhoneTest.php` | 53 | 0 | 5506fb2 | Support phone detail order dari canonical settings/legacy compatibility. |
| M | `tests/Feature/Customer/ProductDetailCartStateTest.php` | 35 | 0 | c889c1b | State cart produk tetap dan seluruh foto produk/varian aktif tanpa duplicate; tambah regression gallery dataset. |
| A | `tests/Feature/Customer/ProductListSortingTest.php` | 77 | 0 | c889c1b | Default latest desc serta name/price/latest dua arah, effective sale price dan pagination sorting. |
| A | `tests/Feature/Customer/ShipmentTrackingLinkTest.php` | 159 | 0 | 5506fb2 | Link pertama diterima bila kosong, tidak tertimpa link missing/berbeda pada metadata/webhook/refresh; completed order tetap menyimpan link dan terminal state. |
| A | `tests/checkout-rounding.test.mjs` | 49 | 0 | 3740ad8 | Check pure/frontend total IDR/rounding adjustment dan keselarasan summary melalui script Node, bukan browser E2E. |
| A | `tests/contact-page.test.mjs` | 217 | 0 | c889c1b | Check helper/contact source untuk phone/URL/maps/WhatsApp encoding/form fallback. |
| A | `tests/order-shipping-issue.test.mjs` | 241 | 0 | 5506fb2 | Check frontend issue/status/progress/display yang tidak salah menganggap order selesai. |
| A | `tests/order-tracking.test.mjs` | 237 | 0 | 5506fb2, 3740ad8 | Check HTTP/HTTPS tracking URL/support phone/link availability dan label metode payment tanpa Midtrans. |
| A | `tests/order-workflow.test.mjs` | 154 | 0 | 3c26c92 | Check helper workflow progression, timestamps/tracking serta shipping issues. |
| A | `tests/pagination.test.mjs` | 32 | 0 | 3c26c92 | Check previous/next label normalization dan safe numeric/ellipsis rendering. |
| A | `tests/product-description.test.mjs` | 72 | 0 | c889c1b | Check source responsive description position/metadata dan tidak menampilkan ukuran shipping. |
| A | `tests/product-gallery.test.mjs` | 97 | 0 | c889c1b | Check unrestricted thumbnails, navigation/disabled bounds/active-thumb scrolling/accessibility. |
| A | `tests/product-list-mobile.test.mjs` | 87 | 0 | 5506fb2, 3740ad8 | Check mobile toolbar/grid/card/sort source; regression card tanpa SKU/category fallback. |
| A | `tests/product-shipping-estimate.test.mjs` | 182 | 0 | 5506fb2 | Check input validation/debounce/abort/signature/retry/API/XSRF dan simulation copy estimator. |
| A | `tests/product-shopping-information.test.mjs` | 152 | 0 | c889c1b | Check static benefits/panels/accordion/help contact/desktop-mobile order tanpa backend changes. |
| A | `tests/product-validation.test.mjs` | 435 | 0 | c889c1b, 5506fb2, 3740ad8 | Check field/error focus, variant dialog/index/preservation serta local shipping size validator. |

### 15.4 Dokumen dan binary (6 entri)

| Status | Path lama / path akhir | + | - | Commit | Penjelasan |
| --- | --- | ---: | ---: | --- | --- |
| A | `cartt.png` | - | - | d8229d7 | Binary screenshot referensi layout cart; tidak berperan dalam runtime aplikasi atau membuktikan QA baru. |
| A | `codex-session-01a11536-86f5-70a3-bb2f-1faed94b9b70.md` | 34265 | 0 | 3c26c92 | Transkrip sesi 34.265 baris, artefak nonruntime berpotensi sensitif; isi tidak direplikasi dan bukan spesifikasi porting. |
| A | `docs/commit-changes-87cca12-to-5506fb2.md` | 731 | 0 | 3740ad8 | Laporan 731 baris untuk empat commit awal; source/reference historis, beberapa kesimpulan superseded oleh endpoint 3740ad8. |
| A | `docs/integration-recovery.md` | 13 | 0 | 3740ad8 | Pedoman integration recovery, uncertainty/reservation safety dan release gates; bukan bukti provider live terverifikasi. |
| M | `product-link.md` | 5 | 5 | 3c26c92 | Lima URL gambar diformat Markdown dengan local paste-image reference tidak tracked; bukan perubahan katalog/image loader. |
| A | `reports/security/axegear-codex-audit.md` | 32 | 0 | 3740ad8 | Audit keamanan awal/incomplete; evidence dan gaps, bukan klaim seluruh repository aman. |

### 15.5 Generated build (170 entri)

| Status | Path lama / path akhir | + | - | Commit | Penjelasan |
| --- | --- | ---: | ---: | --- | --- |
| R097 | `public/build/assets/CartController-Bq1IDy7R.js` menjadi `public/build/assets/CartController-BnFanuIi.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `CartController`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/OrderController-C8FgXqWo.js` menjadi `public/build/assets/OrderController-BdzcQ3G5.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `OrderController`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/ProfileController-C5GQ0GG1.js` menjadi `public/build/assets/ProfileController-PZmgzUSR.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `ProfileController`. Build berhenti di 3c26c92; jangan port manual. |
| R093 | `public/build/assets/SecurityController-DlLWXfQm.js` menjadi `public/build/assets/SecurityController-CnxvwwJl.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 093%. Entry/modul: `SecurityController`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/WishlistController-BNMxl-Ln.js` menjadi `public/build/assets/WishlistController-C1egh8Ce.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `WishlistController`. Build berhenti di 3c26c92; jangan port manual. |
| R098 | `public/build/assets/about-rYj-u-Rm.js` menjadi `public/build/assets/about-DIcNLPcv.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 098%. Entry/modul: `resources/js/pages/about/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/adjustment-CsZW0eEy.js` menjadi `public/build/assets/adjustment-BH0bW8lK.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/admin/stock/adjustment.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/admin-users-DDi-cz3q.js` menjadi `public/build/assets/admin-users-DmUJRI1r.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `resources/js/pages/admin/admin-users/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/app-BbEr6vPV.css` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/css/app.css`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/app-U5-JBmFY.css` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/css/app.css`. Build berhenti di 3c26c92; jangan port manual. |
| R084 | `public/build/assets/app--FryCRWw.js` menjadi `public/build/assets/app-teBmEQ78.js` | 3 | 3 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 084%. Entry/modul: `resources/js/app.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R091 | `public/build/assets/appearance-DtZk0Q1a.js` menjadi `public/build/assets/appearance-DjLmzi-w.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 091%. Entry/modul: `resources/js/pages/settings/appearance.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/audit-logs-D7Yw4f4N.js` menjadi `public/build/assets/audit-logs-BxGL9EB9.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/admin/audit-logs/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/badge-B4CqK8eB.js` menjadi `public/build/assets/badge-CNEzsEEw.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `badge`. Build berhenti di 3c26c92; jangan port manual. |
| R094 | `public/build/assets/banners-Rl--j4PK.js` menjadi `public/build/assets/banners-DNq5v_AH.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 094%. Entry/modul: `resources/js/pages/admin/banners/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/biteship-webhook-logs-CeTdiS4G.js` menjadi `public/build/assets/biteship-webhook-logs-wk6TaZZu.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `resources/js/pages/admin/biteship-webhook-logs/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R098 | `public/build/assets/blog-DaXUqLQl.js` menjadi `public/build/assets/blog-OSbSktkX.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 098%. Entry/modul: `resources/js/pages/blog/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R094 | `public/build/assets/blogs-BtnhtniC.js` menjadi `public/build/assets/blogs-BX-fYS23.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 094%. Entry/modul: `resources/js/pages/admin/blogs/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/card-I1Qi8fQI.js` menjadi `public/build/assets/card-DC-ua9w4.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `card`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/categories-DHTxfbnh.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/categories/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/categories-QXqx_wvB.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/categories/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/checkout-Bpcf_jQe.js` | 0 | 2 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/customer/checkout/checkout.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/checkout-d4v9-KkZ.js` | 2 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/customer/checkout/checkout.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/collections-BfgM4Dbb.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/collections/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/collections-CW7XYLfh.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/collections/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R082 | `public/build/assets/confirm-cxc7_f4z.js` menjadi `public/build/assets/confirm-DOA3LfW1.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 082%. Entry/modul: `confirm`. Build berhenti di 3c26c92; jangan port manual. |
| R081 | `public/build/assets/confirm-password-CnZHlOao.js` menjadi `public/build/assets/confirm-password-DQcNpy1S.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 081%. Entry/modul: `resources/js/pages/auth/confirm-password.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/contact-D3jsuVKK.js` menjadi `public/build/assets/contact-C46m7fpI.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/contact/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/customer-addresses-V_7BCBmF.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/customer-addresses/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/customer-addresses-pTLLHRIN.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/customer-addresses/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/customers-BiG_mq4C.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/customers/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/customers-DPqcxbsO.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/customers/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R099 | `public/build/assets/dashboard-DZn5k3i-.js` menjadi `public/build/assets/dashboard-D-uuIkTg.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 099%. Entry/modul: `resources/js/pages/admin/dashboard.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/dashboard-yZ2lz7iG.js` menjadi `public/build/assets/dashboard-Dq_dzROF.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/dashboard.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R098 | `public/build/assets/detail-order-4htp1rZW.js` menjadi `public/build/assets/detail-order-CsQTxgjn.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 098%. Entry/modul: `resources/js/pages/customer/order/detail-order.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R098 | `public/build/assets/detail-product-hgsAPXfu.js` menjadi `public/build/assets/detail-product-B4YLDmg3.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 098%. Entry/modul: `resources/js/pages/customer/products/detail-product.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R098 | `public/build/assets/dialog-UQ3tSPM_.js` menjadi `public/build/assets/dialog-Dh9Xd6SU.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 098%. Entry/modul: `dialog`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/dist-DiuNxDTW.js` menjadi `public/build/assets/dist-BIXyC_S_.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `dist`. Build berhenti di 3c26c92; jangan port manual. |
| R087 | `public/build/assets/forgot-password-Cw16wpAM.js` menjadi `public/build/assets/forgot-password-B5-Y6W-6.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 087%. Entry/modul: `resources/js/pages/auth/forgot-password.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/form-ByHHbVsC.js` menjadi `public/build/assets/form-6oPtXbc1.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/admin/vouchers/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/form-DbAY6r-V.js` menjadi `public/build/assets/form-BTxoqx2U.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/admin/new-product/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R094 | `public/build/assets/form-BW7J1-hu.js` menjadi `public/build/assets/form-BgD9LJ46.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 094%. Entry/modul: `resources/js/pages/admin/gallery/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/form-BIcbaJzC.js` menjadi `public/build/assets/form-BqRsL0_-.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/admin/admin-users/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/form-wd45QOyK.js` menjadi `public/build/assets/form-C7ekMRL4.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/admin/blogs/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/form-CSmLHMaJ2.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/product-variants/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/form-DLqhbAWA2.js` menjadi `public/build/assets/form-C__GmReb.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `resources/js/pages/admin/pages/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R099 | `public/build/assets/form-DMqiARkW2.js` menjadi `public/build/assets/form-CqtZ0N1V2.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 099%. Entry/modul: `resources/js/pages/admin/products/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/form-CngdZSKT.js` menjadi `public/build/assets/form-D7AF2I3G.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `resources/js/pages/admin/categories/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/form-DAyt3la3.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/product-variants/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R094 | `public/build/assets/form-D5lYJYKU.js` menjadi `public/build/assets/form-DPuhTws3.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 094%. Entry/modul: `resources/js/pages/admin/customer-addresses/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/form-BQqtowLk.js` menjadi `public/build/assets/form-DTbM5P5l.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/admin/collections/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/form-BSauZO8Z.js` menjadi `public/build/assets/form-DbHDXTBB.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `resources/js/pages/admin/banners/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/form-C-ig-Rip.js` menjadi `public/build/assets/form-DzI3XNtM.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `resources/js/pages/admin/notifications/form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R098 | `public/build/assets/gallery-DIDzRAV6.js` menjadi `public/build/assets/gallery-D_cEE2Ee.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 098%. Entry/modul: `resources/js/pages/gallery/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R093 | `public/build/assets/gallery-dpEFPKQ6.js` menjadi `public/build/assets/gallery-X6W9n5Te.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 093%. Entry/modul: `resources/js/pages/admin/gallery/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/info-BD1IplB9.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `info`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/input-error-BNTVjSsa.js` menjadi `public/build/assets/input-error-BgiFyWBr.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `input-error`. Build berhenti di 3c26c92; jangan port manual. |
| R093 | `public/build/assets/label-C44ZW4qy.js` menjadi `public/build/assets/label-BhkwT3cf.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 093%. Entry/modul: `label`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/leaflet-src-D4vjCzAM.js` menjadi `public/build/assets/leaflet-src-ueQd6cnR.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `leaflet-src`. Build berhenti di 3c26c92; jangan port manual. |
| R098 | `public/build/assets/lib-CSeRu9ad.js` menjadi `public/build/assets/lib-DoxUgxkw.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 098%. Entry/modul: `node_modules/react-leaflet/lib/index.js`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/list-notification-Bv6gK-cF.js` menjadi `public/build/assets/list-notification-9WRr2G0U.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/customer/notification/list-notification.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R098 | `public/build/assets/list-product-BlfVdkoU.js` menjadi `public/build/assets/list-product-PrsAcl7K.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 098%. Entry/modul: `resources/js/pages/customer/products/list-product.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/loader-circle-BkD9DrgV.js` menjadi `public/build/assets/loader-circle-BrALDrv6.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `loader-circle`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/lock-CDTt-EPR.js` menjadi `public/build/assets/lock-cRNyqhPT.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `lock`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/login-e_WC3B0t.js` menjadi `public/build/assets/login-yLmAo6ro.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/auth/login.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/logs-CXFbYnfH.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/stock/logs.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/logs-IqxTwT2K.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/stock/logs.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/mail-Cxl3RCoL.js` menjadi `public/build/assets/mail-DCO1lxbt.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `mail`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/manage-address-CHsLuD74.js` menjadi `public/build/assets/manage-address-BqHwuPSm.js` | 2 | 2 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/customer/manage-address/manage-address.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/map-pin-CKYcN5RD.js` menjadi `public/build/assets/map-pin-BZ8eLfgS.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `map-pin`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/message-circle-Bm8G7_yg.js` menjadi `public/build/assets/message-circle-CNuin-wp.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `message-circle`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/minus-ClVKb5mE.js` menjadi `public/build/assets/minus-lMrH8XF4.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `minus`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/my-cart-734a8RwT.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/customer/cart/my-cart.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/my-cart-DAE8GF6-.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/customer/cart/my-cart.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/my-order-DSt8iwtw.js` menjadi `public/build/assets/my-order-D0Jl-F93.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/customer/order/my-order.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/my-profile-BnK-2MYi.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/customer/profile/my-profile.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/my-profile-ziqXgCTu.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/customer/profile/my-profile.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/my-wishlist-8ukQDuE-.js` menjadi `public/build/assets/my-wishlist-D8aztZ1b.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/customer/wishlist/my-wishlist.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R099 | `public/build/assets/new-product-CJmazxry.js` menjadi `public/build/assets/new-product-FS04ydcW.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 099%. Entry/modul: `resources/js/pages/new-product/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/no-return-policy-Pd5SLDoK.js` menjadi `public/build/assets/no-return-policy-Bctk6UR8.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/customer/policy/no-return-policy.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/notifications-SG62a0Ze.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/notifications/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/notifications-q3iV-nSL.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/notifications/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/orders-B0GbZIR_.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `orders`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/orders-DVpzKgSV.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/orders/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/orders-eboA25Xl.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/orders/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/package-check-CBEwUNLQ.js` menjadi `public/build/assets/package-check-CGbsTFZG.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `package-check`. Build berhenti di 3c26c92; jangan port manual. |
| R094 | `public/build/assets/pages-toICL_ac.js` menjadi `public/build/assets/pages-DJP4_fqZ.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 094%. Entry/modul: `resources/js/pages/admin/pages/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/pagination-DnMy-okO.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `pagination`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/pagination-Qdkh1d9k.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `pagination`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/password-DRfuwdJG.js` menjadi `public/build/assets/password-BDgDevSy.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `password`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/password-input-CYdK3Nla.js` menjadi `public/build/assets/password-input-Dq3SOREf.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `password-input`. Build berhenti di 3c26c92; jangan port manual. |
| R094 | `public/build/assets/payment-logs-B8FLXJtQ.js` menjadi `public/build/assets/payment-logs-DCjU9b5-.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 094%. Entry/modul: `resources/js/pages/admin/payment-logs/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/payments-CRtvW7FB.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/payments/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/payments-Caanu7lk.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `payments`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/payments-IG-17-gR.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/payments/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/pencil-BZOzUmad.js` menjadi `public/build/assets/pencil-Cr94VSKw.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `pencil`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/plus-BXmLLPNt.js` menjadi `public/build/assets/plus-Bgh1CWnc.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `plus`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/power-BvsPBJmY.js` menjadi `public/build/assets/power-BkUug2nh.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `power`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/privacy-policy-BTks-pOX.js` menjadi `public/build/assets/privacy-policy-D_QCfVuk.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/customer/policy/privacy-policy.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/product-variants-BjH0_GtR.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/product-variants/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/product-variants-CtzXOKcc.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/product-variants/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/products-Bkfew8X2.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/products/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/products-qSBXs3aB.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/products/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R093 | `public/build/assets/profile-B6SMf8dY.js` menjadi `public/build/assets/profile-CEXUeLnd.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 093%. Entry/modul: `resources/js/pages/settings/profile.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/profile-layout-Ch0O9pFE.js` menjadi `public/build/assets/profile-layout-CJh6CuYP.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `profile-layout`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/quote-DGgd3xoT.js` menjadi `public/build/assets/quote-BNVYRwXc.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `quote`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/refresh-cw-DtGmJJD8.js` menjadi `public/build/assets/refresh-cw-DuxRN0Jh.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `refresh-cw`. Build berhenti di 3c26c92; jangan port manual. |
| R094 | `public/build/assets/register-BFtzB7ht.js` menjadi `public/build/assets/register-hKkwxgwM.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 094%. Entry/modul: `resources/js/pages/auth/register.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/reports-D3edPoix.js` menjadi `public/build/assets/reports-DOzR9fs6.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/admin/reports/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R091 | `public/build/assets/reset-password-DRGu29_U.js` menjadi `public/build/assets/reset-password-BwhHMANv.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 091%. Entry/modul: `resources/js/pages/auth/reset-password.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/resource-form-Dk_VmDPd.js` menjadi `public/build/assets/resource-form-Bx1l3grw.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/admin/resource-form.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R098 | `public/build/assets/resource-index-D5y12usn.js` menjadi `public/build/assets/resource-index-CybHSHJ8.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 098%. Entry/modul: `resources/js/pages/admin/resource-index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R098 | `public/build/assets/resource-show-oWtmgj7u.js` menjadi `public/build/assets/resource-show-BkwRIY54.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 098%. Entry/modul: `resources/js/pages/admin/resource-show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/rotate-ccw-BZNJ4Nn3.js` menjadi `public/build/assets/rotate-ccw-D9oHrMC2.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `rotate-ccw`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/save-CdBpbluD.js` menjadi `public/build/assets/save-DDWVI0jP.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `save`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/search-BwrIKJUU.js` menjadi `public/build/assets/search-ZAQ35Rhv.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `search`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/security-CrihRBRm.js` menjadi `public/build/assets/security-dWoSLTlk.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/settings/security.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/select-BEEo7lUf.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `select`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/send-DDiZ47xL.js` menjadi `public/build/assets/send-Cm5I8edX.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `send`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/settings-B9GCtZET.js` menjadi `public/build/assets/settings-KNHu6rg3.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `resources/js/pages/admin/settings/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/share-2-Cauiggmv.js` menjadi `public/build/assets/share-2-DjATskOT.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `share-2`. Build berhenti di 3c26c92; jangan port manual. |
| R091 | `public/build/assets/shared-BgrovJpa.js` menjadi `public/build/assets/shared-BWsEYQjl.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 091%. Entry/modul: `resources/js/pages/admin/marketing/shared.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/shared-B8l0pN9-.js` menjadi `public/build/assets/shared-DaIxxlwR.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `shared`. Build berhenti di 3c26c92; jangan port manual. |
| R091 | `public/build/assets/shared-DLZ9me8P.js` menjadi `public/build/assets/shared-IxzDxM_f.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 091%. Entry/modul: `resources/js/pages/admin/sales/shared.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/shipments-C7i2GIVN.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/shipments/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/shipments-rUjtQP6_.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `shipments`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/shipments-yfWwXKMn.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/shipments/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/shipping-policy-TFIcCr9H.js` menjadi `public/build/assets/shipping-policy-Deq7EAyL.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/customer/policy/shipping-policy.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R099 | `public/build/assets/shop-layout-DOEQNfQC.js` menjadi `public/build/assets/shop-layout-BodGLqwD.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 099%. Entry/modul: `shop-layout`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/shopping-cart-Bh6D2v-H.js` menjadi `public/build/assets/shopping-cart-DJ9rIOuC.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `shopping-cart`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/show-2hMXRzFe.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/orders/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R090 | `public/build/assets/show-tSEyKX9r.js` menjadi `public/build/assets/show-B5YzLknI.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 090%. Entry/modul: `resources/js/pages/admin/payment-logs/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R093 | `public/build/assets/show-LFpeZ6EO.js` menjadi `public/build/assets/show-BIMDIb9-.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 093%. Entry/modul: `resources/js/pages/admin/customers/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/show-B_Si00kW.js` menjadi `public/build/assets/show-Bp_eUYib.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/blog/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/show-C_Y-Sgge.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/orders/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/show-D-amdPzA.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/products/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/show-DAqmUfwP.js` | 0 | 106 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/shipments/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/show-BtSbOr0p.js` menjadi `public/build/assets/show-DGekKlXq.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `resources/js/pages/admin/payments/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/show-DS8kShaB.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/products/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R092 | `public/build/assets/show-CK96TvvQ.js` menjadi `public/build/assets/show-DUcodppb.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 092%. Entry/modul: `resources/js/pages/admin/biteship-webhook-logs/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R093 | `public/build/assets/show-CWuBdkGB.js` menjadi `public/build/assets/show-ID6h0C0P.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 093%. Entry/modul: `resources/js/pages/admin/customer-addresses/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/show-WMnZysvy.js` | 106 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/shipments/show.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/sliders-horizontal-BCxTnLDM.js` menjadi `public/build/assets/sliders-horizontal-DK8mo_x0.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `sliders-horizontal`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/slug-BVqCWxmP.js` menjadi `public/build/assets/slug-CQPoLqU3.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `slug`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/sparkles-CVEqi_Od.js` menjadi `public/build/assets/sparkles-DLNKsuQv.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `sparkles`. Build berhenti di 3c26c92; jangan port manual. |
| R072 | `public/build/assets/spinner-CF04sGFh.js` menjadi `public/build/assets/spinner-B9xCeGLb.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 072%. Entry/modul: `spinner`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/square-pen-C7PcKzWh.js` menjadi `public/build/assets/square-pen-BJeBLo5w.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `square-pen`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/star-DuOe28vE.js` menjadi `public/build/assets/star-ChJftSyS.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `star`. Build berhenti di 3c26c92; jangan port manual. |
| D | `public/build/assets/stock-BiamxQ_p.js` | 0 | 1 | 3c26c92 | Asset generated baseline dihapus/digantikan saat rebuild; bukan penghapusan halaman source. Entry/modul: `resources/js/pages/admin/stock/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| A | `public/build/assets/stock-C7OJr1ih.js` | 1 | 0 | 3c26c92 | Asset generated baru pada build tersimpan. Entry/modul: `resources/js/pages/admin/stock/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/tag-Di6Aogbg.js` menjadi `public/build/assets/tag-B-VpGwsX.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `tag`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/term-condition-BD_PlSd-.js` menjadi `public/build/assets/term-condition-BiYozruI.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/customer/policy/term-condition.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/text-link-hfYR9aWv.js` menjadi `public/build/assets/text-link-C28MeyEg.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `text-link`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/trash-2-BIWh3pkr.js` menjadi `public/build/assets/trash-2-CYRG8mhz.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `trash-2`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/trending-down-BNL440i-.js` menjadi `public/build/assets/trending-down-GdGVGbgT.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `trending-down`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/trending-up-DXZx7iR2.js` menjadi `public/build/assets/trending-up-CNj771iY.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `trending-up`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/triangle-alert-CymyJXny.js` menjadi `public/build/assets/triangle-alert-CCKrNsMK.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `triangle-alert`. Build berhenti di 3c26c92; jangan port manual. |
| R093 | `public/build/assets/two-factor-challenge-BCSE0deS.js` menjadi `public/build/assets/two-factor-challenge-C5xuuURp.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 093%. Entry/modul: `resources/js/pages/auth/two-factor-challenge.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/upload-WbmA1zR2.js` menjadi `public/build/assets/upload-CGD7BbC5.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `upload`. Build berhenti di 3c26c92; jangan port manual. |
| R099 | `public/build/assets/use-two-factor-auth-ZiJQR0v-.js` menjadi `public/build/assets/use-two-factor-auth-DPYJv-VG.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 099%. Entry/modul: `use-two-factor-auth`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/user-check-A_78_x-P.js` menjadi `public/build/assets/user-check-DYkbVctU.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `user-check`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/user-round-PNO4MNYN.js` menjadi `public/build/assets/user-round-CdT8euY7.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `user-round`. Build berhenti di 3c26c92; jangan port manual. |
| R095 | `public/build/assets/verification-D0NW5KP4.js` menjadi `public/build/assets/verification-hZ5aYcU3.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 095%. Entry/modul: `verification`. Build berhenti di 3c26c92; jangan port manual. |
| R092 | `public/build/assets/verify-email-D9AfSH6O.js` menjadi `public/build/assets/verify-email-CYRSMV3W.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 092%. Entry/modul: `resources/js/pages/auth/verify-email.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R094 | `public/build/assets/vouchers-DpThR_y3.js` menjadi `public/build/assets/vouchers-C6v29k9j.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 094%. Entry/modul: `resources/js/pages/admin/vouchers/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R100 | `public/build/assets/wayfinder-OywH38PV.js` menjadi `public/build/assets/wayfinder-CYS5mbhQ.js` | 0 | 0 | 3c26c92 | Rename berhash, konten identik menurut Git; mapping/import build berubah, bukan fitur source baru. Entry/modul: `wayfinder`. Build berhenti di 3c26c92; jangan port manual. |
| R097 | `public/build/assets/welcome-BNJoGNCz.js` menjadi `public/build/assets/welcome-pwJY9hCX.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 097%. Entry/modul: `resources/js/pages/welcome.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R096 | `public/build/assets/wishlists-BdqmYaXc.js` menjadi `public/build/assets/wishlists-CMkhcNGR.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 096%. Entry/modul: `resources/js/pages/admin/wishlists/index.tsx`. Build berhenti di 3c26c92; jangan port manual. |
| R093 | `public/build/assets/with-selector-CdoCgsfV.js` menjadi `public/build/assets/with-selector-D_-J-x-G.js` | 1 | 1 | 3c26c92 | Rename berhash dengan delta bundle/import; kemiripan 093%. Entry/modul: `with-selector`. Build berhenti di 3c26c92; jangan port manual. |
| M | `public/build/manifest.json` | 662 | 667 | 3c26c92 | Manifest Vite remap entry/imports/chunks ke hashed assets build 3c26c92; bukan build source endpoint, regenerate saat deploy. |

### 15.6 Hasil pemeriksaan kelengkapan

- 272 baris inventaris; A59/M68/D23/R122; setiap entri dijelaskan dan terhubung ke commit.
- 102 entri non-build dan 170 build; mapping build memakai manifest baseline/endpoint jika tersedia.
- 394 path eksplisit persis sama dengan diff tanpa rename dan union kelima diff commit; 0 path perantara di luar inventaris.
- Jumlah numstat rename-aware +45.397/-2.460; binary dikecualikan dari angka baris.
- Semua path historis diverifikasi keberadaannya pada snapshot yang tepat; R100 diverifikasi blob identik.
- Manifest terakhir berubah pada 3c26c92: tidak mengklaim bundle mencakup source commit berikutnya.
