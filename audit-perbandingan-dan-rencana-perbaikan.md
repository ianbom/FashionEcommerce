# Audit Perbandingan dan Rencana Perbaikan

## 1. Ringkasan

**Status: AUDIT STATIS PARSIAL, bukan audit runtime, sertifikasi keamanan, atau implementasi perbaikan.** Tanggal: 20 Oktober 2026, zona kerja Asia/Bangkok (+07:00). Semua usulan kode dalam laporan ini **USULAN BELUM DITERAPKAN/BELUM DIUJI**.

### Baseline

| Elemen | Hasil pemeriksaan lokal |
| --- | --- |
| Repository | `E:\laragon\www\FashionECommerce` |
| Branch | `master` |
| HEAD | `059ca88a653e034502dfd4dc9a0bc537311fe95b` |
| Perubahan tracked/staged pada awal | Tidak ada |
| Untracked existing | `commit-changes-87cca12-to-3740ad8.md`; milik pengguna, dipertahankan |
| SHA-256 referensi | `E70166857103CC6861D6613A16CE56285C4546831C4C981E1111E44B297D57C4` |
| Objek historis `87cca12` / `3740ad8` | Tidak tersedia menurut `git cat-file -t`; tidak melakukan fetch |
| CodeGraph | `.codegraph/` tersedia; digunakan untuk entrypoint, caller, dan source simbol; hasil tidak lengkap dilengkapi pembacaan rentang source |
| Keadaan yang diaudit | Source working tree, bukan asumsi source AxeGear. Karena tidak ada perubahan aplikasi lokal, source tracked yang diperiksa sama dengan HEAD |

Referensi 629 baris ditelaah mencakup bagian 1-15, kontrak, acceptance tests, risiko endpoint, serta inventaris non-build dan generated build. Lampiran generated diperlakukan sebagai metadata perubahan, bukan source untuk disalin. Isi file transkrip yang disebut referensi tidak dibaca. `AGENTS.md`, manifest/lockfile, PRD bagian alur bisnis, konfigurasi testing/build, struktur schema dan routes diperiksa. `db.md` dan `design.md` tidak ditemukan pada root; tidak menganggap rekomendasi PRD sebagai schema aktual.

**Perbedaan terpenting:** checkout aktif membuat payment `manual` lalu redirect WhatsApp, bukan Snap. Varian lokal memakai `additional_price`; tidak mempunyai empat kolom ukuran atau pasangan regular/sale price sendiri. Ukuran root product adalah kontrak lokal yang dipakai tests existing. Karena itu mengaktifkan Snap, menambahkan ukuran varian, estimator admin, contact page, dan mengganti branding bukan perbaikan wajib otomatis.

### Hasil

Matriks memuat **130 butir**: **45 PERLU DIPERBAIKI**, **29 SEBAGIAN**, **28 SUDAH SETARA**, **19 TIDAK RELEVAN**, dan **9 BELUM TERVERIFIKASI**. Jumlah baris bukan jumlah bug: beberapa baris mempunyai akar masalah sama, sebagian merupakan fitur/operasional, dan dua bug tambahan lokal dicatat terpisah dari butir referensi.

- **21 temuan bug `static-confirmed`** (`BUG-01` sampai `BUG-21`); **0 reproduced**. Beberapa hanya berlaku pada jalur Midtrans legacy yang masih mempunyai endpoint/scheduler. Keberadaan data legacy aktif tidak diketahui karena database tidak dibuka.
- Empat kelompok pekerjaan operasional (`OPS-01` sampai `OPS-04`) dan sembilan kelompok non-bug/opsional (`OPSIONAL-01` sampai `OPSIONAL-09`) dipisahkan dari jumlah bug.
- Risiko utama P1: finalisasi memakai reservasi yang sudah dilepas; edit admin menimpa reservasi; pembatalan admin tidak melepas reservasi; booking ganda/uncertain; receipt pending tidak dapat dipulihkan; event pembayaran/finalisasi yang tidak monotonic; checkout tidak membandingkan ulang paket terkunci.
- `php -l` terhadap **238 file** di `app`, `routes`, `database/migrations`, `tests`, dan `config`: **0 kegagalan sintaks**. Ini bukan pengujian perilaku.
- Tidak menjalankan Pest, Node tests, lint/formatter frontend, build, generator, browser, provider, atau concurrency tests. Tidak ada klaim lulus untuk aktivitas tersebut.

### Cakupan dan batas kesimpulan

Inventaris mencakup 154 file `app`, 4 routes, 38 migrations, 11 seeders, 1 factory, 77 file pages (termasuk JSON), 58 components, 10 layouts, 1 context, 2 lib, 8 hooks, 6 types, 29 file tests, 13 config, CSS dan Blade. Struktur kelas/metode controller, request, model, service, serta tabel migration dipetakan. Alur pembayaran, stok, checkout, booking, webhook, produk, sorting, tracking, dan contracts terkait diperiksa mendalam secara statis pada lokasi yang dirinci di bawah.

**Belum selesai:** pembacaan body setiap CRUD/komponen/hook first-party di luar alur tersebut; semua interaksi browser dan 12 caller pagination secara rendered; full regression assertions seluruh suite; pemeriksaan deployment aktual. Inventaris atau PHP lint tidak dihitung sebagai pemeriksaan perilaku lengkap. Daftar sisa pekerjaan terdapat pada bagian 8. Status `SUDAH SETARA` berarti bukti source untuk perilaku terbatas itu ditemukan, bukan seluruh modul terbukti bebas bug.

## 2. Pemetaan Arsitektur dan Prasyarat

### Kontrak lokal versus referensi

| Area | Implementasi lokal dan konsekuensi audit |
| --- | --- |
| Dependency terkunci | Laravel `v13.6.0`, Inertia Laravel `v3.0.6`, Fortify `v1.36.2`, Wayfinder `v0.1.16`, Pest `v4.6.3`, Pint `v1.29.1`; package-lock: React `19.2.6`, Inertia React `3.1.1`, Vite `8.0.11`, TypeScript `5.9.3`, Tailwind `4.2.4`. Tidak ada instalasi/update dependency |
| Harga | `products.base_price/sale_price + product_variants.additional_price`; `CheckoutService::currentUnitPrice` baris 500. Bukan harga regular/sale per varian seperti referensi |
| Ukuran | Gram dan cm pada root `products`; varian hanya warna/size/stock/additional_price. Buktinya migration `2026_04_30_000006_create_product_variants_table.php:11`, model `ProductVariant.php:10`, request nested/standalone. Empat ukuran varian membutuhkan fitur/schema tersendiri, tidak dipaksakan dalam rencana bugfix |
| Snapshot | `order_items` menyimpan berat agregat quantity dan dimensi root saat checkout; booking/rates shipment membaca snapshot, bukan produk terbaru. Data historis tidak boleh ditulis ulang |
| Reservasi | Counter `product_variants.reserved_stock` dan marker order `stock_released_at/stock_finalized_at`; tidak ditemukan tabel `inventory_reservations`. Jangan mengarang dependensi tabel tersebut |
| Constraint | Unique payment/order dan shipment/order; unique provider order ID; unique receipt/tracking payload hash; unique `(user_id, checkout_idempotency_key)`. CHECK status dan invariant stok hanya ditambahkan untuk driver tertentu; SQLite bukan bukti perilaku engine produksi |
| Pembayaran aktif | `CheckoutService::placeOrder:302` membuat provider `manual`, method `bank_transfer`; `WhatsAppOrderMessage` membangun redirect. `ManageManualPaymentAction` mengonfirmasi/membatalkan melalui admin |
| Midtrans legacy | `/api/payments/midtrans/notification`, admin sync, customer cancel, command/job masih terjangkau. `createSnapTransaction` hanya mempunyai caller test, bukan checkout produksi saat ini. Jangan mengembalikan Snap melalui porting buta |
| Session | `checkout.shipping_rates`, address ID, cart hash, selected binding, rate/session expiry, voucher code. Hash saat ini memasukkan voucher tetapi tidak ukuran. Voucher server menghapus selection, context React tidak menyelaraskan selection |
| Uang | Order/payment decimal 15,2, currency IDR; display checkout dan pesan WhatsApp tanpa pecahan. Field database `rounding_adjustment` tidak ada dan tidak diperlukan untuk prop adjustment hasil perhitungan |
| Integrasi Biteship | Rates memakai koordinat flat; create sudah nested. `BiteshipService::client` mempunyai retry shared yang juga berlaku pada create POST. Response booking belum dibuktikan memiliki ID sebelum dianggap confirmed |
| Receipt | `biteship_webhook_logs.payload_hash` unique dan `processed_at` sudah ada. Tidak perlu migration baru untuk receipt replay. Controller memiliki dedupe awal tetapi pending tidak direplay |
| Status/fulfillment | Order/payment/shipment status terpisah. Enum menyediakan lost/returned/problem; service belum memberlakukan keseluruhan legal transition. Histori request admin existing di `AdminActivityLog`, tracking di `ShipmentTracking`, stok di `StockLog` |
| Notifikasi | `NotificationService::forOrder` membuat row database. Tidak ditemukan modul email shipment/payment first-party atau event/listener terkait; acceptance email referensi bukan fitur lokal yang rusak |
| Settings | Key store, shipper, origin, contact, WhatsApp disimpan terpisah. Tidak ada kontrak canonical alias/null seperti referensi. Sebagian dapat sengaja berbeda; konsolidasi harus mempertahankan identitas/nomor pembayaran lokal |
| Contact | Tidak ada route/controller/page contact public setara referensi; ada settings contact admin dan Footer. Ketiadaan public contact adalah fitur opsional, bukan route rusak |
| Authorization | Grup admin memakai `auth`, `admin`, `admin.activity`; middleware memeriksa role admin aktif. Customer checkout memakai `auth,verified`; ownership alamat/order diperiksa service. API webhook memakai signature/secret, bukan CSRF browser |
| Testing | `phpunit.xml:21` menetapkan testing, SQLite memory/DB_URL kosong, mail array, cache array, queue sync. `tests/Pest.php:16` mengaktifkan `RefreshDatabase` global Feature, berbeda dari referensi. Tidak ada `force=true` atau cache config/routes khusus testing; cache aktif tidak ditemukan saat audit |
| Build/Wayfinder | Vite menjalankan plugin Wayfinder dengan `formVariants`; build bisa menulis generated source. Manifest lokal tracked, `public/hot` ada; itu tidak membuktikan deployment aktual atau build stale. Generated helpers tidak diedit/disalin |
| Scheduler/queue | `routes/console.php:11`: expiry Midtrans setiap 5 menit dengan `withoutOverlapping`. Tidak ada replay shipment. Job sync tersedia; proses worker, cron, cache lock, env dan provider aktual tidak diperiksa |

### Alias source untuk matriks

Alias hanya mempersingkat kolom; lokasi lengkap dan simbol perubahan diberikan pada detail temuan.

| Alias | File lokal |
| --- | --- |
| CK | `app/Services/Customer/CheckoutService.php` |
| BS | `app/Services/Integrations/BiteshipService.php` |
| SH | `app/Services/Admin/ShipmentManagementService.php` |
| OS | `app/Services/Customer/OrderService.php` |
| PAY | `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php` |
| FIN | `app/Actions/Stock/FinalizeReservedStockAction.php` |
| MAN | `app/Actions/Payments/ManageManualPaymentAction.php` |
| SYNC | `app/Actions/Payments/SyncMidtransPaymentAction.php` |
| EXP | `app/Actions/Payments/SyncExpiredMidtransPaymentsAction.php` |
| MW | `app/Services/Customer/MidtransWebhookService.php` |
| BW | `app/Http/Controllers/Customer/BiteshipWebhookController.php` |
| OM | `app/Services/Admin/OrderManagementService.php` |
| PM | `app/Services/Admin/PaymentManagementService.php` |
| PR | `app/Http/Requests/Admin/ProductRequest.php` |
| PV | `app/Http/Requests/Admin/ProductVariantRequest.php` |
| PROD | `app/Services/Admin/ProductManagementService.php` |
| BR | `app/Services/Customer/ProductBrowsingService.php` |
| SET | `app/Services/Settings/SiteSettingService.php` |
| WA | `app/Services/Customer/WhatsAppOrderMessage.php` |
| CX | `resources/js/contexts/checkout-context.tsx` |
| FORM | `resources/js/pages/admin/products/form.tsx` |
| PD | `resources/js/pages/customer/products/detail-product.tsx` |
| PL | `resources/js/pages/customer/products/list-product.tsx` |
| OD | `resources/js/pages/customer/order/detail-order.tsx` |

## 3. Matriks Seluruh Butir Referensi

ID stabil mengikuti kelompok perilaku, bukan satu ID per rename bundle. Butir berulang pada kontrak, acceptance tests, dan lampiran digabung dengan butir perilaku asal. Bagian 8 memetakan seluruh kelompok lampiran; generated/binary/dokumentasi bukan bug aplikasi tersendiri. Status tidak relevan selalu merujuk prasyarat atau keputusan bisnis lokal, bukan pengabaian risiko pada jalur yang masih tersedia.

| ID | Bagian referensi | Perilaku yang diperiksa | File/simbol lokal | Status | Bukti | ID temuan/tindakan |
| --- | --- | --- | --- | --- | --- | --- |
| REF-001 | 4.1, 8, 10 | Sumber empat ukuran varian | CK:349; `ProductVariant` | TIDAK RELEVAN | Schema varian tidak memiliki ukuran; root adalah model existing | OPSIONAL-01 |
| REF-002 | 4.1 | Validasi berat positif checkout baru | CK:349,280; PR:88 | SEBAGIAN | Publikasi memeriksa root weight; checkout menyamarkan invalid menjadi 1 gram | BUG-01 |
| REF-003 | 4.1 | Berat snapshot agregat quantity | CK:280 | SUDAH SETARA | Root weight dikalikan quantity sekali | Pertahankan |
| REF-004 | 4.1, 6.1 | Berat rates/create per unit | CK:413; SH:409,518 | SUDAH SETARA | Berat agregat dibagi quantity; quantity dikirim terpisah | Pertahankan kompatibilitas |
| REF-005 | 4.1, 10 | Hash mengikat ukuran paket | CK::cartHash:534 | PERLU DIPERBAIKI | Hash hanya ID/variant/qty/price/voucher | BUG-01 |
| REF-006 | 4.1, 11 | Recheck binding terhadap data terkunci | CK::placeOrder:178 | PERLU DIPERBAIKI | Validasi provider/hash selesai sebelum lock; tidak dibandingkan lagi | BUG-01 |
| REF-007 | 4.1, 10 | Snapshot order_items saat order dibuat | CK:266 | SUDAH SETARA | Harga, qty, root ukuran, identitas disimpan | Pertahankan model root |
| REF-008 | 4.1 | Booking memakai snapshot historis | SH::biteshipOrderPayload:402 | SUDAH SETARA | Membaca order items, bukan varian saat booking | Pertahankan |
| REF-009 | 4.1, 13 | Tidak rewrite/backfill snapshot lama | Migrations; SH:409 | SUDAH SETARA | Adapter ceil/minimum 1 untuk snapshot existing | Tanpa backfill |
| REF-010 | 4.1, 6.1 | Menyimpan kurir pilihan customer | CK:289 | SUDAH SETARA | Snapshot company/type/service/rate dibuat saat checkout | Pertahankan |
| REF-011 | 6.1, 10 | Booking order detail otomatis memakai pilihan customer | SH:132; admin orders show:396 | BELUM TERVERIFIKASI | UI booking meminta kurir manual; kebijakan override belum diketahui | OPSIONAL-03 |
| REF-012 | 4.1, 8 | Root dimensions tetap untuk estimator | Routes; PR:43 | TIDAK RELEVAN | Root form tetap ada, estimator belum ada | OPSIONAL-01 |
| REF-013 | 4.2 | Preservasi rates/rate ID/binding ketika voucher berubah | CK:137,148; CX:304 | PERLU DIPERBAIKI | Server menghapus, client tetap memegang currentRate | BUG-02 |
| REF-014 | 4.2, 13.2 | Menyelaraskan hash setelah apply/remove | CK::cartHash; CK:136 | PERLU DIPERBAIKI | Voucher bagian hash; tidak cukup sekadar menghapus forget | BUG-02 |
| REF-015 | 4.2 | Cleanup checkout expired sebelum remove voucher | CK::removeVoucher:145 | PERLU DIPERBAIKI | Tidak memanggil forgetExpiredCheckoutSession | BUG-02 |
| REF-016 | 4.2 | Ownership alamat, TTL, provider recheck | CK:421,451 | SUDAH SETARA | Ownership/expiry/rate/current provider diperiksa sebelum transaksi | BUG-01 memperkuat lock |
| REF-017 | 4.2, 11 | Voucher berubah lalu langsung placeOrder | CK:176; CX:304 | PERLU DIPERBAIKI | Binding server hilang tetapi selection UI tersisa | BUG-02 |
| REF-018 | 4.3 | Grand total IDR utuh konsisten | CK:240,569; WA:70 | PERLU DIPERBAIKI | Persist pecahan; WhatsApp dan checkout display tanpa pecahan | BUG-17 |
| REF-019 | 4.3, 10 | rounding_adjustment dan tampilan bila nonzero | CX::CheckoutSummary:69 | SEBAGIAN | Prop dan kalkulasi adjustment tidak ada | BUG-17 |
| REF-020 | 4.3 | Jumlah item Snap sama gross_amount | MidtransService::itemDetails:114 | TIDAK RELEVAN | Create Snap tidak dipanggil checkout; gap dormant dicatat | OPSIONAL-02 |
| REF-021 | 4.3 | amountMatches finite/integer IDR | MidtransService::amountMatches:104 | SEBAGIAN | Membandingkan cents float tanpa bentuk nominal strict | BUG-17, OPSIONAL-02 |
| REF-022 | 5.1 | Dedupe webhook payload identik | MW:32,38 | SUDAH SETARA | Hash diperiksa di bawah lock payment; unique migration tersedia | Pertahankan |
| REF-023 | 5.1 | Guard paid sebelum metadata stale ditulis | MW:69; SYNC:52; PAY:32 | PERLU DIPERBAIKI | Metadata ditulis sebelum guard action | BUG-04 |
| REF-024 | 5.1 | Refund final tidak kembali paid/pending | PAY:32,36,86 | PERLU DIPERBAIKI | Tidak ada guard refunded | BUG-04 |
| REF-025 | 5.1 | Partial refund hanya menerima refund/partial_refund | PAY::execute | PERLU DIPERBAIKI | Settlement/pending masih diproses | BUG-04 |
| REF-026 | 5.1 | Terminal gagal tidak dihidupkan pending | PAY::markPending:86 | PERLU DIPERBAIKI | Semua non-paid diubah pending_payment | BUG-04 |
| REF-027 | 5.1 | Paid berulang tidak ulang notifikasi/reset fulfillment | PAY::markPaid:54 | PERLU DIPERBAIKI | forOrder selalu dipanggil; processing/completed tidak dipertahankan | BUG-04 |
| REF-028 | 5.1 | Bersihkan failure_reason setelah sukses | PAY:73; MAN:39 | SEBAGIAN | Field ada, lifecycle reason belum dikelola | BUG-05 |
| REF-029 | 5.1 | Lock order/payment/variant konsisten | MAN:29; SYNC:28; FIN:14 | SEBAGIAN | Payment dikunci lebih dahulu; order tidak seragam | BUG-03, BUG-05 |
| REF-030 | 5.1 | Konflik satu item rollback seluruh finalisasi | FIN; callers DB::transaction | SUDAH SETARA | Caller existing membungkus transaksi dan exception keluar | Pertahankan; BUG-05 butuh savepoint |
| REF-031 | 5.1 | Released reservation tidak difinalisasi | FIN:16,27 | PERLU DIPERBAIKI | Hanya finalized dan total counter diperiksa | BUG-03 |
| REF-032 | 5.1 | Konflik stok menetap manual_review/reason | PAY:61; MW:31 | PERLU DIPERBAIKI | Update review kemudian throw; rollback caller menghapus update | BUG-05 |
| REF-033 | 5.1 | Domain conflict terkelola diack setelah review commit | PAY:64; MidtransWebhookController | PERLU DIPERBAIKI | DomainException lolos sebagai error; bukan review tersimpan | BUG-05 |
| REF-034 | 5.1 | Invalid signature/field/reference tetap error | MW:21,27,36 | SUDAH SETARA | 422/403/firstOrFail tetap ada | Pertahankan; jangan blanket 200 |
| REF-035 | 5.1 | Tidak log raw webhook sebelum validasi | MidtransWebhookController:14 | SUDAH SETARA | Controller tidak mencatat payload; test security tersedia | ACK log opsional |
| REF-036 | 5.1 | Log sync mismatch tidak ikut rollback | SYNC:30,36 | PERLU DIPERBAIKI | logRejected diikuti throw dalam transaksi sama | BUG-20 |
| REF-037 | 5.1, 6.2 | Email payment/shipment sekali, replay sebelum email | NotificationService::forOrder | TIDAK RELEVAN | Notifikasi lokal database, bukan email shipment/payment | Uji row notifikasi |
| REF-038 | 5.1 | Manual confirm setelah cancel ditolak | MAN::confirm:32 | PERLU DIPERBAIKI | Hanya paid ditolak/dianggap selesai; cancelled masih finalisasi | BUG-03 |
| REF-039 | 5.1, 6.3 | Semua cancellation melepaskan reservasi aman | OM::updateStatus:103 | PERLU DIPERBAIKI | Dropdown admin mengubah status tanpa stock/voucher release | BUG-06 |
| REF-040 | 5.1, 8 | Reservasi tidak ditimpa form admin | PROD::syncVariants:258 | PERLU DIPERBAIKI | Counter dari payload draft ditulis langsung | BUG-19; tambahan lokal |
| REF-041 | 5.2 | Snap confirmed rejection berbeda uncertain | MidtransService::createSnapTransaction | TIDAK RELEVAN | Tidak ada caller aplikasi untuk create baru | OPSIONAL-02 |
| REF-042 | 5.2 | Timeout/5xx/malformed/duplicate preserve cart/reservation | CK::placeOrder; MidtransService | TIDAK RELEVAN | Checkout manual tidak membuat Snap; jangan mengaktifkan flow baru | OPSIONAL-02 |
| REF-043 | 5.2 | Token nonempty dan redirect HTTPS | MidtransService:49-53 | TIDAK RELEVAN | Validasi belum ada pada metode dormant; gate bila diaktifkan | OPSIONAL-02 |
| REF-044 | 5.2, 11 | Replay checkout idempotency key | CK:162; unique orders migration | SEBAGIAN | Replay sequential ada, pemulihan race unique conflict belum diuji | BUG-01; acceptance concurrency |
| REF-045 | 5.2 | Sync manual_review Snap uncertain sebelum expired | EXP:24 | SEBAGIAN | Query hanya pending/authorize tanpa provider lookup | BUG-08; data legacy belum diketahui |
| REF-046 | 5.2, 5.3 | Expiry lokal bukan bukti provider tidak paid | EXP:49-70 | PERLU DIPERBAIKI | Melepas reservasi berdasar expires_at dan metadata kosong | BUG-08 |
| REF-047 | 5.3 | Query status provider sebelum cancel legacy | OS::cancelMidtransOrLocal:149 | PERLU DIPERBAIKI | Belum memilih metode dianggap aman cancel lokal | BUG-07 |
| REF-048 | 5.3 | Confirmed not-found ketat | MidtransService::transactionStatus:56 | PERLU DIPERBAIKI | Tidak ada jalur nullable not-found tervalidasi | BUG-07 |
| REF-049 | 5.3 | Cancel Snap session historical sebelum release | OS:157; MidtransService | SEBAGIAN | Bisa cancel lokal ketika token lama masih usable; tidak ada cancel session | BUG-07; bukan aktivasi Snap |
| REF-050 | 5.3 | Cancel provider cocok reference/amount/status | MidtransService::cancelTransaction:67; OS:133 | PERLU DIPERBAIKI | Semua HTTP sukses diterima tanpa validasi kontrak cancel | BUG-07 |
| REF-051 | 5.3 | Recheck concurrent paid sebelum local mutation | OS:119 | PERLU DIPERBAIKI | Payment di-lock, tetapi order pending tidak direcheck sebelum metadata ditulis | BUG-07 |
| REF-052 | 5.3 | Apply final provider lalu tolak cancel customer | OS:117,146 | PERLU DIPERBAIKI | Tidak query status dan selalu pesan sukses sesudah handler | BUG-07 |
| REF-053 | 5.3, 10 | Wrapper status non-null untuk caller existing | MidtransService::transactionStatus; SYNC:19 | SEBAGIAN | Array kontrak existing; adaptasi find nullable harus terpisah | BUG-07 |
| REF-054 | 5.2, 10 | Filter/count/manual_review/failure_reason admin | PM:46,53,58 | PERLU DIPERBAIKI | Count hanya fraud challenge/deny; reason tidak diproyeksikan | BUG-05 |
| REF-055 | 6.1 | Booking harus payment paid | SH:114 | SUDAH SETARA | Paid guard dalam lock order | Pertahankan |
| REF-056 | 6.1 | Booking harus lifecycle layak | SH:111-134 | SEBAGIAN | Hanya paid/retryable; belum order lifecycle dan uncertainty | BUG-09, BUG-11 |
| REF-057 | 6.1 | Tolak double booking dan existing provider ID | SH:128,146 | PERLU DIPERBAIKI | Tidak ada ID guard; state creating ditulis setelah lock awal dilepas | BUG-09 |
| REF-058 | 6.1 | Uncertain booking tidak menjadi retryable failed | SH:161 | PERLU DIPERBAIKI | Semua Throwable menandai failed yang boleh retry | BUG-09 |
| REF-059 | 6.1 | Create POST tanpa transport retry otomatis | BS::client:170; BS::createOrder | PERLU DIPERBAIKI | Shared retry berlaku juga pada POST create | BUG-09 |
| REF-060 | 6.1 | HTTP sukses harus membuktikan booking beridentitas | SH:175-190; BS:149 | PERLU DIPERBAIKI | ID null diterima; fallback status confirmed | BUG-09 |
| REF-061 | 6.1 | Nested coordinate create versus flat rates | SH:385,394; BS:85-90 | SUDAH SETARA | Payload lokal sudah berbeda sesuai operasi | Jangan menyalin fix yang sudah ada |
| REF-062 | 6.1 | Koordinat numeric finite dan range | BS:175; SH:427; SettingRequest | SEBAGIAN | Address request punya range; settings/helper hanya is_numeric | BUG-13 |
| REF-063 | 6.1 | Tolak missing/nonnumeric/nonfinite/negative rate | BS:107,116 | PERLU DIPERBAIKI | Missing/nonnumeric di-cast 0; inf bisa gagal serialisasi | BUG-13 |
| REF-064 | 6.1 | Rate nol eksplisit sah | BS:107,116 | SUDAH SETARA | 0 diterima; perbaikan tidak boleh memakai filter truthy | BUG-13 mempertahankan |
| REF-065 | 6.1 | Fallback shipping_fee tersedia | BS:107 | SUDAH SETARA | Null-coalescing price/shipping_fee sudah ada | Pertahankan |
| REF-066 | 6.2 | Receipt firstOrCreate aman saat duplicate concurrent | BW:25-43 | PERLU DIPERBAIKI | exists lalu create terpisah; unique constraint dapat menjadi exception | BUG-10 |
| REF-067 | 6.2 | Duplicate selesai hanya jika processed_at terisi | BW:25 | PERLU DIPERBAIKI | Pending ikut dianggap duplicate selesai | BUG-10 |
| REF-068 | 6.2 | Receipt lock/apply/processed_at atomic | BW:60-64; SH:277 | PERLU DIPERBAIKI | Apply commit terpisah dari update processed_at | BUG-10 |
| REF-069 | 6.2 | Matching provider order/tracking/waybill | BW:46-59 | SUDAH SETARA | Tiga identifier dipakai; tidak match seluruh tabel tanpa identifier | Pertahankan |
| REF-070 | 6.2 | Pending replay chunked dengan error per receipt | SH; app/Console/Commands | PERLU DIPERBAIKI | Tidak ditemukan processor/replay/command | BUG-10 |
| REF-071 | 6.2 | Immediate replay setelah provider ID tersimpan | SH:195-210 | PERLU DIPERBAIKI | Tidak ada replay sebelum notifikasi | BUG-10 |
| REF-072 | 6.2 | Replay schedule dan lock | routes/console.php:11 | SEBAGIAN | Schedule lock payment ada; replay shipment tidak ada | BUG-10, OPS-04 |
| REF-073 | 6.3 | Duplicate/stale/terminal shipment tidak regresi | SH:281-303 | SEBAGIAN | Dedupe/timestamp ada; guard hanya sebagian regresi delivered | BUG-11 |
| REF-074 | 6.3 | Temporary/terminal/return issue terpisah | ShippingStatus; SH:344 | SEBAGIAN | Enum issue ada; problem/return-history/terminal policy belum ada | BUG-11 |
| REF-075 | 6.3 | Shipping issue tidak otomatis refund/release stock | SH::applyBiteshipPayload | SUDAH SETARA | Tidak memanggil action refund/release; jangan menambahnya | Pertahankan |
| REF-076 | 6.3 | Order transitions divalidasi server | OM:89 | SEBAGIAN | Processing/ready punya guard; completion/cancel/locking belum aman | BUG-06, BUG-11 |
| REF-077 | 6.3 | Completion memerlukan paid dan kedua snapshot delivered | OM:92,108 | PERLU DIPERBAIKI | Hanya order_status delivered/completed yang diperiksa | BUG-11 |
| REF-078 | 6.3 | shipment_failed memerlukan terminal issue dan reason | OrderStatusRequest; OM | SEBAGIAN | Enum ada, request/service alasan belum tersedia | BUG-11 |
| REF-079 | 6.3 | Manual shipment status legal, reason wajib | SH:216; ShipmentStatusRequest:22 | PERLU DIPERBAIKI | Arbitrary status list dapat melewati paid/booking/lifecycle | BUG-11 |
| REF-080 | 6.3 | Normalisasi assigned/picking/picked/problem | SH::normalizeShippingStatus:563 | PERLU DIPERBAIKI | allocated/picking_up/picked_up semua menjadi confirmed | BUG-11 |
| REF-081 | 6.3 | Audit actor/reason/history/stock movements terkait order | LogAdminActivity; OM::detail | SEBAGIAN | Audit request ada, props histori/reason/stock movements belum lengkap | BUG-11 |
| REF-082 | 6.3 | Timestamp delivered/cancelled/completed pertama dipertahankan | SH:227,316; OM:109 | PERLU DIPERBAIKI | Event berulang menulis now lagi | BUG-11 |
| REF-083 | 6.4 | Note/subdistrict pada destination snapshot string | SH:369,390 | SEBAGIAN | note dikirim terpisah; alamat tidak dikomposisi seperti referensi | OPSIONAL-03; bukan bug terbukti |
| REF-084 | 6.4 | courier.link pertama tidak hilang/ditimpa | BW::toOrderPayload; SH:314 | PERLU DIPERBAIKI | Mapper membuang link; raw response diganti penuh | BUG-12 |
| REF-085 | 6.4 | Payment tidak menimpa raw shipment | PAY; MW | SUDAH SETARA | Tidak ada update shipment raw oleh payment action | Pertahankan |
| REF-086 | 6.4, 9.4 | Tracking usable HTTP/HTTPS, clickable lintas status | OS:327; OD:416,590 | SEBAGIAN | Tombol tidak dibatasi status, tetapi URL tidak divalidasi | BUG-12 |
| REF-087 | 7 | Canonical store identity dan alias request legacy | SET; SettingRequest; SH:374 | SEBAGIAN | Key independen; nilai shipper dapat mengalahkan store | OPSIONAL-04; konfirmasi kebijakan |
| REF-088 | 7 | Explicit canonical null menang atas alias/default | SET:11,19 | SEBAGIAN | value null memakai default; first melewati nilai kosong | OPSIONAL-04 |
| REF-089 | 7 | Public contactSettings whitelist | routes/web.php; HandleInertiaRequests | TIDAK RELEVAN | Tidak ada contact public; tidak ditemukan expose seluruh settings ke public | OPSIONAL-05 |
| REF-090 | 7 | Contact form/maps/URL/email fallback | Footer; settings contact | TIDAK RELEVAN | Halaman/form referensi tidak tersedia lokal | OPSIONAL-05 |
| REF-091 | 7 | Validasi dan normalisasi nomor support/payment | WA:16; OS:348; SettingRequest | PERLU DIPERBAIKI | Payment nomor lokal tidak diubah 0 ke 62; invalid support tetap menjadi URL | BUG-18 |
| REF-092 | 7 | Encoding pesan WhatsApp | WA:65; OS:358 | SUDAH SETARA | rawurlencode digunakan pada pesan | Pertahankan |
| REF-093 | 7 | Pertahankan identitas bisnis lokal | Seeders/settings/Footer | SUDAH SETARA | Tidak ada alasan menyalin AxeGear atau menjalankan seeder | Tidak ada perubahan identitas |
| REF-094 | 8 | Ownership ID varian nested pada edit | PR:23-28; PROD:266 | SUDAH SETARA | exists dibatasi product_id; persistence melalui relasi produk | Pertahankan |
| REF-095 | 8 | SKU uniqueness setiap varian dan pesan berindeks | PROD:304; PR:64 | SEBAGIAN | Guard mengecualikan seluruh produk dan soft-deleted rows | BUG-14 |
| REF-096 | 8 | Harga regular/sale per varian | PV:28; CK:502 | TIDAK RELEVAN | Model harga lokal berupa additional_price | Tidak mengubah model harga |
| REF-097 | 8 | Active variant empat ukuran positif backend | PV; ProductVariant migration | TIDAK RELEVAN | Field ukuran varian tidak tersedia | OPSIONAL-01 |
| REF-098 | 8, 13.3 | Mismatch frontend 0/inactive/null | FORM::Variant; PV | TIDAK RELEVAN | Validator ukuran varian referensi tidak ada di kedua sisi lokal | Jangan mewarisi validator referensi |
| REF-099 | 4.1, 8 | Root min 0 dan publishing weight minimal 1 | PR:43,88; PROD:112 | SUDAH SETARA | Existing rule dan guard publish tersedia | BUG-01 recheck saat checkout |
| REF-100 | 8 | Error nested/upload/index terlihat | FORM:479,1410,1626 | PERLU DIPERBAIKI | Hanya error group images/variants; indexed error tidak dipetakan | BUG-15 |
| REF-101 | 8 | Summary, focus/scroll, ARIA invalid/error | FORM::FieldGroup:199; submit:587 | PERLU DIPERBAIKI | Label tidak terhubung ke input; tidak ada summary/onError focus | BUG-15 |
| REF-102 | 8 | Draft/file terjaga saat validasi gagal | FORM:560-599 | SEBAGIAN | useForm mempertahankan data; dialog ditutup/reset sebelum error server | BUG-15 |
| REF-103 | 8 | Aggregate reserved_stock pada tabel produk | PROD:42,374 | SEBAGIAN | total_stock tersedia, total_reserved_stock belum diproyeksikan | OPSIONAL-06 |
| REF-104 | 8 | Endpoint estimator root unsaved/admin/throttle | routes/web.php:97 | TIDAK RELEVAN | Endpoint/request/controller estimator tidak ada | OPSIONAL-01 |
| REF-105 | 8 | Estimator debounce/abort/stale/XSRF/live region | FORM; routes | TIDAK RELEVAN | Belum ada fitur estimator; bukan request bocor/race existing | OPSIONAL-01 |
| REF-106 | 9.1 | Cart responsive tanpa overflow desktop/mobile | customer/cart/my-cart.tsx:205,433 | BELUM TERVERIFIKASI | Ada layout responsive existing; tidak dilakukan rendered QA | OPSIONAL-07, OPS-04 |
| REF-107 | 9.1 | Checkout mengikuti provider lokal dan summary | customer/checkout/checkout.tsx:235 | SUDAH SETARA | Copy transfer manual/WhatsApp cocok dengan checkout aktif | BUG-17 hanya uang |
| REF-108 | 9.2 | Layout description, metadata, hidden ukuran | PD:414,814 | TIDAK RELEVAN | Layout/metadata customer berbeda; bukan cacat program terbukti | OPSIONAL-07 |
| REF-109 | 9.2 | Seluruh foto produk/varian aktif tanpa duplikasi | BR:251; PD:122,426 | SUDAH SETARA | Mapper merge unique; gallery.map tidak membatasi enam | Pertahankan |
| REF-110 | 9.2 | Nav gallery/batas/active-thumb/aria-pressed | PD:426 | SEBAGIAN | Tombol thumbnail ada; navigasi/selected ARIA referensi belum ada | OPSIONAL-07 |
| REF-111 | 9.3 | Default latest desc versus featured lokal | BR:326; PL:94 | TIDAK RELEVAN | Featured existing adalah pilihan merchandising, bukan sort bug | Pertahankan default lokal |
| REF-112 | 9.3 | Sort sebelum pagination, effective sale price | BR:94,98,344 | SUDAH SETARA | Query server sort lebih dulu; coalesce sale/base | Pertahankan additional_price model |
| REF-113 | 9.3 | Tie-breaker ID stabil untuk setiap sort | BR::applySort:339 | PERLU DIPERBAIKI | Tidak ada ID terakhir untuk nilai sort yang sama | BUG-16 |
| REF-114 | 9.3 | Sort/order dan infinite-scroll reset | PL:164,177,285,306 | SUDAH SETARA | Form sort/order terpisah; reset products saat navigasi | Pertahankan |
| REF-115 | 9.3 | Mobile toolbar/grid/card reference | PL; product card | BELUM TERVERIFIKASI | Perbedaan desain terlihat dari source, usability perlu browser | OPSIONAL-07 |
| REF-116 | 9.4 | Pagination tanpa raw HTML, parser shared | admin/pagination.tsx; listing admin | SEBAGIAN | PerPageSelect shared; label parser tersebar dan sebagian raw HTML | OPSIONAL-08; bukan XSS tereproduksi |
| REF-117 | 9.4, 10 | Props/types actions sesuai server workflow | OM::detail; admin orders/shipments show | SEBAGIAN | UI memakai options/status, belum server eligibility/actions | BUG-11 |
| REF-118 | 9.4 | Sidebar Halaman, overflow clip, packing document branding | app-sidebar; app-sidebar-layout:16 | TIDAK RELEVAN | Perubahan navigasi/branding/layout opsional; jangan hapus route lokal | OPSIONAL-07 |
| REF-119 | 10, 12 | Testing terisolasi dari DB/integrasi aktif | phpunit.xml; tests/Pest.php | SEBAGIAN | Memory DB/global RefreshDatabase ada; force/cache/stray HTTP gate belum ada | OPS-01 |
| REF-120 | 11, 12 | Regression coverage perbaikan referensi | tests/Feature; 27 suite Feature/Unit files | SEBAGIAN | Happy-path/rates/manual tests ada; kasus BUG belum tercakup memadai | OPS-02 |
| REF-121 | 12 | Source-pattern tests bukan E2E | tests/Feature/Payments/MidtransWebhookSecurityTest.php | SUDAH SETARA | Tidak menganggap assertion log atau pencarian pola sebagai bukti browser/concurrency | OPS-02 |
| REF-122 | 12, 13.1 | Konsistensi source/build lokal | vite.config.ts; public/build/manifest.json | BELUM TERVERIFIKASI | Manifest tersedia; tidak rebuild atau membandingkan hasil compile | OPS-03 |
| REF-123 | 6.2, 11 | Scheduler/queue/cache lock deployment aktif | routes/console.php; job sync | BELUM TERVERIFIKASI | Hanya deklarasi source yang diketahui, bukan worker/cron aktual | OPS-04 |
| REF-124 | 11, 12 | Concurrency dengan engine DB produksi terisolasi | Action locks dan unique migrations | BELUM TERVERIFIKASI | Tidak menjalankan DB atau dua koneksi paralel | OPS-04 |
| REF-125 | 11-13 | Provider sandbox, DNS/TLS/delivery | BS; MidtransService | BELUM TERVERIFIKASI | Tidak menghubungi provider; HTTP fake existing bukan bukti live | OPS-04 |
| REF-126 | 10, 11 | Generated Wayfinder/types sinkron dengan routes | vite.config.ts:25; generated helpers | BELUM TERVERIFIKASI | Tidak regenerate/typecheck; kontrak perubahan harus diverifikasi kemudian | OPS-03 |
| REF-127 | 3, 10 | Schema prasyarat versus migration spekulatif | 38 migrations; models | SUDAH SETARA | Safety fixes memakai kolom existing; fitur ukuran varian terpisah | Tidak ada migration/backfill wajib |
| REF-128 | 1-3, 14 | Bukti commit/diff historis lokal | git cat-file 87cca12/3740ad8 | BELUM TERVERIFIKASI | Objek tidak tersedia; dokumen bukan diff historis yang direproduksi | OPSIONAL-09 |
| REF-129 | 12, 15.4 | Screenshot, transkrip, dokumen, binary | Lampiran referensi | TIDAK RELEVAN | Bukan source runtime; isi transkrip tidak dibaca/disalin | OPSIONAL-09 |
| REF-130 | 15.5-15.6 | 170 generated entries/272 inventaris historis | Manifest referensi dan metadata | TIDAK RELEVAN | Rename/hash/statistik bukan 170 fitur atau bukti bug lokal | OPSIONAL-09 |

## 4. Detail Temuan dan Perubahan Kode

Semua temuan berikut berkategori **Bug/koreksi program**, kecuali `BUG-19` dan `BUG-21` yang juga ditandai **temuan lokal tambahan di luar referensi**. Tingkat bukti seluruhnya **static-confirmed**, bukan reproduced. Skenario di bawah adalah penelusuran source/acceptance yang belum dijalankan. Prioritas P1 berarti risiko integritas uang/stok/order atau duplikasi provider; P2 berarti cacat fungsi, aksesibilitas, konsistensi, atau observability tanpa bukti kehilangan finansial langsung. Tidak menetapkan P0 tanpa bukti eksploitasi/insiden aktual.

### BUG-01 - Binding paket tidak lengkap dan tidak direcheck di bawah lock (P1)

- **Referensi:** 4.1, 10, 11; REF-002/005/006/044. **Lokasi:** `app/Services/Customer/CheckoutService.php:176` (`placeOrder`), `app/Services/Customer/CheckoutService.php:328` (`cartItems`), `app/Services/Customer/CheckoutService.php:534` (`cartHash`), `app/Services/Customer/CartService.php:38` (mutasi cart).
- **Sekarang/akar masalah:** hash tidak memuat berat/dimensi; validasi provider berjalan sebelum transaksi. Setelah itu quantity/ukuran/alamat bisa berubah tanpa pembandingan ulang snapshot terkunci. Berat invalid disamarkan menjadi 1, bukan error. Root dimensions tetap model lokal yang sah; ketiadaan ukuran varian bukan akar bug ini.
- **Pemicu/dampak:** pilih ongkir, ubah root weight/dimensi atau ubah cart setelah provider recheck sebelum lock; order dapat menyimpan paket berbeda dari quotation. Pada replay concurrent, unique key mencegah order ganda tetapi recovery response tidak terjamin.
- **Perubahan minimum:** ubah `cartHash`, normalisasi paket, `placeOrder`, serta locking seluruh mutator `CartService`. Parent cart menjadi titik serialisasi bersama; lock product/variant berurutan ID dan baca ulang cart setelah lock. Bandingkan paket/harga/quantity/alamat terkunci dengan binding sebelum membuat order/reservasi. Jangan melakukan HTTP provider dalam critical section panjang. Jika binding berbeda, batalkan tanpa order/payment/voucher mutation. Validasi weight root positif; dimensi root yang dipakai provider harus bernilai numeric finite nonnegatif sesuai kontrak lokal. Memaksa empat dimensi wajib adalah fitur terpisah, bukan bagian fix ini.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - pseudocode spesifik alur lokal, bukan patch siap pakai:**

```text
Sekarang: validateSelectedShippingRate(); transaction(lock items/variants; create order)
Usulan:   validateSelectedShippingRate(); simpan paket + alamat yang diverifikasi
          transaction(lock parent cart; lock root products/variants ID ascending;
                      reload cart/address; bandingkan dengan paket dan hash binding;
                      recheck idempotency key setelah serialisasi;
                      create snapshot/reservation hanya jika sama)
          hapus hanya item snapshot checkout berhasil, bukan item concurrent yang baru
cartHash.items += weight, length, width, height dalam normalisasi null/integer konsisten
```

- **Kontrak/data lama:** gunakan ukuran root existing, gram agregat/per-unit tetap; snapshot order lama tidak diubah. Binding session lama wajib quotation ulang sekali setelah hash berubah. Bentuk response manual/WhatsApp tetap.
- **Dependensi/risiko:** desain hash diselesaikan bersama BUG-02, bukan dua patch yang berlawanan. Audit lock order dengan CartService/admin product writers; BUG-19 menjaga stok ketika admin mengedit. Keanggotaan cart concurrent perlu regression nyata, bukan SQLite saja.
- **Acceptance:** qty 3 x weight 200 menghasilkan rates/create weight 200 dan snapshot 600; perubahan ukuran setelah select atau setelah fake recheck menolak sebelum order/reservasi/voucher bertambah; perubahan alamat milik user lain ditolak; 2 request key sama menghasilkan satu order/payment dan response replay yang sama, bukan uncaught unique exception; item yang ditambah sesudah checkout tidak ikut terhapus.

### BUG-02 - Voucher menghilangkan binding server tetapi UI masih memilih ongkir (P2)

- **Referensi:** 4.2, 13.2; REF-013/014/015/017. **Lokasi:** `app/Services/Customer/CheckoutService.php:128` (`applyVoucher`), `app/Services/Customer/CheckoutService.php:145` (`removeVoucher`), `app/Services/Customer/CheckoutService.php:534` (`cartHash`), `resources/js/contexts/checkout-context.tsx:304`.
- **Sekarang/penelusuran:** select membuat `selected_rate_binding`; apply/remove menghapusnya; context hanya mengganti voucher/summary, tidak `currentRate`. Place order mengirim rate ID lama lalu ditolak di baris 428. Menghapus dua `forget` saja akan mewarisi bug referensi karena voucher masih berada dalam hash.
- **Diharapkan:** voucher yang hanya mengubah discount tidak membatalkan quotation paket yang masih identik; expiry/ownership/provider recheck tetap wajib.
- **File/simbol diubah:** CK::applyVoucher/removeVoucher/cartHash, CX::applyVoucher/removeVoucher bila diperlukan konsistensi error. Pilihan minimum: pisahkan shipping binding dari voucher, bukan menyelaraskan hash dengan cart yang mungkin sudah berubah tanpa validasi.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - potongan diff lokal, satu perubahan bersama BUG-01:**

```diff
 public function removeVoucher(User $user): array
 {
+    $this->forgetExpiredCheckoutSession();
     session()->forget('checkout.voucher_code');
-    session()->forget(['checkout.shipping_rates', 'checkout.shipping_rate_id', 'checkout.selected_rate_binding']);
```

Hapus `forget` yang sama pada applyVoucher. Pada `cartHash`, hapus entry `'voucher'` dan variabel lokal `$voucherCode`; tambahkan field paket melalui BUG-01. Voucher tetap divalidasi ulang dan dikunci di placeOrder. Jangan mengganti hash binding dengan hash cart terkini tanpa membuktikan paket tetap sama.

- **Kontrak/compatibility:** harga barang, service fee, shipping provider payload tidak berubah hanya karena voucher. Quotation lama reselect sekali setelah versi hash berubah; diskon lama pada order tidak diubah. Tidak perlu migration.
- **Dependensi/risiko:** BUG-01 dan BUG-17; preserve session bukan izin memakai ongkir expired. Tangani rejected remove request sebagai error UI, bukan unhandled Promise.
- **Acceptance:** select -> apply voucher -> placeOrder berhasil satu order; select -> remove -> placeOrder berhasil; total berubah hanya sebesar discount/pembulatan; qty/ukuran berubah tetap ditolak; remove setelah expiry menghapus session expired dan memerlukan quotation baru.

### BUG-03 - Finalisasi dapat mengambil reservasi order lain; manual confirm menerima order cancelled (P1)

- **Referensi:** 5.1, 11; REF-029/031/038. **Lokasi:** `app/Actions/Stock/FinalizeReservedStockAction.php:14` (`execute`), `app/Actions/Payments/ManageManualPaymentAction.php:24` (`confirm`), `app/Actions/Stock/ReleaseStockReservationAction.php:15`.
- **Akar/pemicu:** order A sudah `stock_released_at`, order B mereservasi varian sama. FIN hanya mengecek total `reserved_stock >= qty A`, sehingga confirm/settlement A dapat mengambil counter milik B. MAN hanya short-circuit paid, tidak mensyaratkan pending/pending_payment atau menolak released.
- **Diharapkan:** marker released milik order mengalahkan total counter; manual confirm non-pending ditolak tanpa perubahan. Settlement legacy terlambat masuk review melalui BUG-05, bukan mengambil reservasi baru.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - diff guard setelah early return stock_finalized_at:**

```diff
+if ($order->stock_released_at) {
+    throw new DomainException('Order stock reservation has been released.');
+}
 foreach ($order->items as $item) {
```

Pada MAN::confirm, dalam transaksi ambil ulang dan lock **order dahulu, payment kemudian**, validasi provider dari row terkunci, lalu pastikan payment_status pending, order_status pending_payment dan stock_released_at null. Paid replay sah tetap no-op; cancelled/expired/refunded bukan replay paid. Terapkan urutan order -> payment -> variant ID ascending yang sama pada caller PAY/SYNC/MW/cancel; jangan sekadar menambah lock berlawanan.

- **Kontrak/data lama:** tidak ada schema/relasi baru. Released historical tidak dipulihkan otomatis. Menolak confirm historis yang sudah dibatalkan adalah koreksi safety; rekonsiliasi manual operator terpisah.
- **Dependensi/risiko:** BUG-05 menangani exception FIN tanpa rollback review; BUG-19 menjaga counter dari edit admin. Pertahankan rollback seluruh item dan idempotensi paid.
- **Acceptance:** A cancelled/released + B reserved: confirm A ditolak, stok/counter B tidak berubah; settlement A menjadi manual_review sekali; paid ulang tidak membuat StockLog/notifikasi tambahan; dua confirm paralel memotong stock tepat satu kali; paid versus cancel menghasilkan satu state konsisten.

### BUG-04 - Event Midtrans mengubah metadata final, menghidupkan refund, dan mengulang notifikasi (P1)

- **Referensi:** 5.1; REF-023 sampai REF-027. **Lokasi:** `app/Services/Customer/MidtransWebhookService.php:69`, `app/Actions/Payments/SyncMidtransPaymentAction.php:52`, `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php:23` (`execute`), `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php:54` (`markPaid`). Jalur legacy masih mempunyai endpoint publik, terlepas dari checkout manual baru.
- **Sekarang/akar:** MW/SYNC menulis transaction_status/raw metadata sebelum guard PAY. Guard hanya sebagian event ketika order paid. Refund/partial_refund tidak absorbing; settlement berulang dengan hash berbeda selalu membuat notifikasi dan mereset processing/completed menjadi paid.
- **Penelusuran:** settlement -> webhook pending: order tetap paid tetapi payment transaction_status menjadi pending; refund -> pending: order kembali pending_payment; processing/completed + settlement baru: fulfillment turun dan notifikasi bertambah. Hash identik memang didedupe, tetapi event berbeda bukan duplicate byte-identical.
- **File/simbol diubah:** ketiga caller/action tersebut. Usulkan satu predicate status di PAY yang dipakai sebelum metadata di MW/SYNC; bukan tiga tabel aturan berbeda. Paid replay hanya melengkapi paid_at yang kosong dan metadata final yang sah, tanpa efek finalisasi/notifikasi.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - before/after perilaku lokal:**

```text
Sebelum: update metadata -> PAY.execute -> guard sebagian status paid
Sesudah: lock order/payment -> validasi reference/amount -> predicate event
         rejected/stale: log aman, tidak mengubah metadata/state/stock/notifikasi
         refunded: tolak semua perubahan non-idempotent
         partially_refunded: hanya refund/partial_refund
         paid: settlement/capture accept idempotent atau refund/partial_refund
         terminal gagal: tolak pending/authorize; final sukses masuk BUG-03/05
         paid replay: paid_at ?? now; jangan reset fulfillment
```

- **Kontrak/data:** enum existing cukup; refund tidak otomatis menambah stok atau mengubah kebijakan no-return lokal. Simpan event penolakan untuk audit tanpa membocorkan signature. Jangan menganggap signature valid menjamin event terbaru.
- **Dependensi/risiko:** BUG-03/05, BUG-20; preserve state order selain pending_payment ketika pembayaran pertama sukses, termasuk processing/completed/issues. Manual payment tidak dialihkan ke Midtrans.
- **Acceptance:** seluruh pasangan event paid/pending/authorize/cancel/expire, refund/settlement, partial_refund/pending diuji; metadata dan order sama-sama monotonic; 2 settlement berbeda hash menghasilkan satu StockLog per item dan satu notifikasi payment; processing/completed/issue tidak direset.

### BUG-05 - Review konflik stok hilang karena rollback; operator tidak mendapat reason (P1)

- **Referensi:** 5.1-5.2, 10; REF-028/029/032/033/054. **Lokasi:** `app/Actions/Payments/ApplyMidtransPaymentStatusAction.php:61`, `app/Services/Customer/MidtransWebhookService.php:31`, `app/Actions/Payments/SyncMidtransPaymentAction.php:27`, `app/Actions/Stock/FinalizeReservedStockAction.php:20`, `app/Services/Admin/PaymentManagementService.php:46` dan `resources/js/pages/admin/payments/show.tsx`.
- **Akar:** catch DomainException menulis manual_review lalu melempar lagi. Transaksi caller rollback update review itu beserta log; failure_reason tidak diisi. Admin count mengandalkan fraud_status, bukan transaction_status manual_review, dan detail tidak memproyeksikan reason.
- **Pemicu/dampak:** satu varian kekurangan stock/reserved_stock saat settlement valid. Webhook menjadi exception, review tidak menetap dan operator tidak mempunyai alasan rekonsiliasi. Menghapus `throw` saja berbahaya: item sebelumnya dalam loop FIN dapat ikut commit meskipun item berikut gagal.
- **Perubahan minimum:** FIN mempunyai transaksi/savepoint sendiri untuk seluruh loop setelah lock order. PAY menangkap hanya DomainException **sesudah rollback savepoint FIN**, menyimpan payment/order review serta reason aman dalam transaksi luar dan return terkelola. Error database/tidak terduga tetap throw. Manual admin confirm tanpa bukti provider sukses boleh tetap ditolak dengan ValidationException dan rollback, bukan dianggap transfer berhasil.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - pseudocode transaksi lokal:**

```text
outer transaction(lock order -> payment):
    try FIN.execute = nested transaction(lock variants asc; finalize seluruh item)
    catch DomainException:
        payment.update(transaction_status=manual_review, failure_reason=reason internal aman)
        order.update(payment_status=manual_review; jangan reset fulfillment berjalan)
        log review; return hasil handled; jangan throw keluar outer transaction
    sukses: paid, failure_reason=null; notifikasi hanya pada transisi pertama
commit -> controller memberi 200 hanya untuk event valid/handled
```

- **Kontrak/compatibility:** `failure_reason` dan manual_review sudah tersedia; tidak perlu migration. Tambahkan reason/status/filter/count pada PM dan props/types/UI payment. Jangan hanya menambahkan label UI tanpa persistensi.
- **Dependensi/risiko:** setelah BUG-03, bersamaan BUG-04/20. Reason dipilih dari alasan domain yang aman, bukan raw provider response atau stack trace. Notifikasi sukses tidak boleh dikirim pada konflik.
- **Acceptance:** order 2 item, item kedua konflik: kedua stok/counter/StockLog tetap sebelum request; review + reason + log menetap; webhook valid mendapat 200; invalid signature tetap 403, missing field 422; operator melihat filter/count/reason; retry tidak menggandakan notifikasi atau memotong stok.

### BUG-06 - Pembatalan melalui status admin membocorkan reservasi stok dan voucher (P1)

- **Referensi:** 5.1, 6.3; REF-039/076. **Lokasi:** `app/Http/Requests/Admin/OrderStatusRequest.php:22`, `app/Services/Admin/OrderManagementService.php:83` (`updateStatus`), `app/Http/Controllers/Admin/OrderController.php:26` dan `resources/js/pages/admin/orders/show.tsx`.
- **Penelusuran/akar:** pending order memiliki reserved_stock dan used_count voucher. Admin mengirim status cancelled; OM hanya mengubah order payment_status/order_status/cancelled_at, tidak payment row, marker release, stock counter, atau used_count. Tidak ada transaksi/recheck yang setara dedicated payment cancellation.
- **Diharapkan/perubahan:** cancellation bukan pilihan fulfillment dropdown. Hapus target cancelled dari request dan guard service; arahkan UI manual payment ke dedicated cancel existing agar release action dijalankan. Jangan membuat bypass provider untuk order Midtrans legacy. Dedicated legacy admin cancellation baru bukan kebutuhan bugfix ini.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - potongan request dan langkah pendamping:**

```diff
-'status' => ['required', Rule::in(['processing', 'ready_to_ship', 'completed', 'cancelled'])],
+'status' => ['required', Rule::in(['processing', 'ready_to_ship', 'completed'])],
```

Hilangkan cabang cancellation OM::updateStatus dan opsi cancel pada form fulfillment; dedicated MAN::cancel tetap dipakai dengan lock/recheck BUG-03/07. BUG-11 kemudian menambah shipment_failed/reason secara terpisah, bukan mengembalikan cancelled.

- **Kontrak/data:** dedicated manual payment cancel dan customer cancel tetap tersedia; jangan menghapus kemampuan pembatalan customer secara keseluruhan. Kebocoran counter existing tidak dibetulkan dengan backfill spekulatif; perlukan daftar order/counter yang telah direkonsiliasi operator sebelum koreksi data terpisah.
- **Dependensi/risiko:** BUG-03/07, kemudian BUG-11. Seluruh opsi UI harus mengikuti endpoint yang benar; filter listing status cancelled tetap sah dan tidak dihapus.
- **Acceptance:** POST status cancelled ditolak 422 tanpa perubahan; cancel payment manual pending melepaskan stock/voucher tepat sekali dan menyamakan order/payment; paid cancel ditolak; klik ulang tidak mengurangi reserved_stock order lain.

### BUG-07 - Cancel customer memakai asumsi provider kosong dan tidak merecheck paid (P1)

- **Referensi:** 5.3, 10, 13.5; REF-047 sampai REF-053. **Lokasi:** `app/Services/Customer/OrderService.php:98` (`cancel`), `app/Services/Customer/OrderService.php:149` (`cancelMidtransOrLocal`), `app/Services/Integrations/MidtransService.php:56` (`transactionStatus`), `app/Services/Integrations/MidtransService.php:67` (`cancelTransaction`).
- **Akar/pemicu:** payment_method/transaction_id kosong diperlakukan sebagai bukti transaksi provider tidak ada. Cancel response hanya harus HTTP sukses; reference/gross/status tidak dibandingkan. Pada race pending -> paid, transaksi lokal tetap menulis payment status cancel sebelum PAY menolak downgrade order; endpoint bahkan dapat mengembalikan pesan cancelled ketika order masih paid. Error cancel juga mencatat full response/body ke log.
- **Diharapkan:** provider manual dipisahkan eksplisit dari provider Midtrans; manual cancellation tidak menghubungi provider. Midtrans legacy memerlukan status/cancel terkonfirmasi, bukan metadata kosong. Unknown tetap preserve reservasi/voucher; final provider diaplikasikan lalu cancellation ditolak. Response terminal yang telah diproses tidak boleh dirollback oleh exception penolakan customer.
- **File/simbol diubah:** OS cancel helpers, MidtransService, reusable SYNC::applyPayload yang diusulkan untuk payload tervalidasi, MAN cancel bila dipakai ulang oleh OS. Lock/recheck order dahulu lalu payment sesudah operasi provider, sebelum metadata/release lokal.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - pseudocode, bukan patch API provider siap pakai:**

```text
manual: dedicated local cancel dengan pending recheck di bawah lock
midtrans:
    findTransactionStatus: null hanya HTTP 200/404 + body status_code 404 yang cocok
    pending/authorize -> cancelTransaction; validasi sukses + code 200 + cancel + ID + amount
    not-found -> token historis harus diketahui; cancel Snap harus terbukti canceled_at
    final -> commit applyPayload; sesudah commit tolak permintaan cancel
    timeout/5xx/malformed/response bertentangan -> error aman, jangan release
local commit: reload lock order/payment; jika sudah paid/final jangan tulis cancel
transactionStatus existing tetap wrapper array yang throw untuk confirmed not-found
```

- **Informasi yang kurang:** kontrak provider Snap cancel/confirmed-not-found aktual belum diverifikasi sandbox; jangan menyalin endpoint atau klasifikasi error referensi sebagai jaminan. Sebelum integrasi, cocokkan ID/status/amount dan bentuk canceled_at dengan kontrak provider yang disetujui. Sampai itu terverifikasi, gagal tertutup tanpa release.
- **Kontrak/data/risiko:** melindungi token historical tanpa mengaktifkan Snap checkout baru. Log hanya ID internal, provider HTTP status, dan kode error aman; bukan raw body/signature/customer. BUG-03/04/05/20 menjadi prasyarat state dan commit.
- **Acceptance:** manual pending tidak mengirim HTTP; provider timeout/404 tanpa body sesuai/5xx/malformed/amount-ID mismatch tidak release; confirmed cancel tepat sekali; concurrent settlement tidak mengubah payment/order paid menjadi cancel dan tidak memberi pesan sukses palsu; final provider tetap tersimpan meskipun cancellation customer ditolak.

### BUG-08 - Expiry legacy melepas stok tanpa mengetahui keadaan provider (P1, bersyarat data legacy)

- **Referensi:** 5.2-5.3, 11; REF-045/046. **Lokasi:** `app/Actions/Payments/SyncExpiredMidtransPaymentsAction.php:24` (`execute`), `app/Console/Commands/SyncExpiredMidtransPaymentsCommand.php:10`, `routes/console.php:11`, `tests/Feature/Payments/SyncExpiredMidtransPaymentsTest.php:37`.
- **Akar/penelusuran:** query memilih pending/authorize yang expires_at lewat, transaction_id/payment_method kosong, lalu langsung apply expire dan release. Metadata kosong tidak membuktikan Snap tidak pernah dibayar atau session mati; pembayaran bisa sedang settled tanpa webhook diterima. Action tidak mengambil status provider dan tidak memilih manual_review uncertain. Test existing justru mengunci asumsi expiry lokal; bukan bukti asumsi itu aman.
- **Diharapkan/perubahan:** gunakan MidtransService status lookup dan SYNC::applyPayload dari BUG-07 untuk record Midtrans legacy. Confirmed terminal diterapkan; status pending atau hasil unknown tetap reservasi/review, bukan expiry buatan. Pelepasan pada not-found hanya setelah session cancellation terbukti. Tambahkan pilihan manual_review dengan flag uncertainty yang benar-benar ada pada raw response; jangan menyatakan flag tersebut telah diproduksi checkout lokal.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - before/after alur:**

```text
Sebelum: expires_at <= now + metadata kosong -> expire lokal -> release
Sesudah: kandidat legacy -> provider status tervalidasi -> apply final terkonfirmasi
         unknown/no reference/session belum terbukti mati -> review, preserve reservation
         hasil tidak pasti tidak menaikkan statistik expired/synced sebagai sukses
```

- **Kontrak/data:** provider manual tetap dikecualikan; jangan menambah auto-expiry transfer manual tanpa keputusan bisnis. Ubah deskripsi command dan statistik agar sesuai reconciliation sebenarnya. Tidak ada migration. Tidak diketahui apakah database aktif mempunyai kandidat, karena audit tidak membaca DB.
- **Dependensi/risiko:** BUG-03/04/05/07/20. Panggilan provider baru dilakukan hanya pada implementasi/sandbox yang disetujui, di luar lock panjang; recheck final lokal sebelum apply.
- **Acceptance:** old Snap sudah settlement tetapi metadata lokal kosong: tidak ada release; transport gagal preserve; confirmed expire/cancel melepaskan sekali; manual payment tidak tersentuh; flagged uncertain diproses sebelum expiry; statistics merepresentasikan hasil nyata.

### BUG-09 - Booking ganda, retry unsafe, dan sukses tanpa identitas provider (P1)

- **Referensi:** 6.1, 10, 11; REF-056 sampai REF-060. **Lokasi:** `app/Services/Admin/ShipmentManagementService.php:104` (`createFromOrder`), `app/Services/Admin/ShipmentManagementService.php:146`, `app/Services/Admin/ShipmentManagementService.php:161`, `app/Services/Integrations/BiteshipService.php:121` dan `app/Services/Integrations/BiteshipService.php:159` (`client`), `app/Enums/ShippingStatus.php:25` (`retryableValues`).
- **Akar/penelusuran:** request A/B sama-sama melewati lock awal ketika shipment not_created; creating baru ditulis pada transaksi terpisah tanpa recheck. Keduanya bisa POST. Shared retry mengulangi create saat transport gagal. Semua Throwable ditandai failed, yang retryable, walaupun provider mungkin telah menerima booking. HTTP 2xx `{}` menghasilkan identifiers null dan fallback confirmed. Failed/problem dengan provider ID lama juga boleh dibooking ulang.
- **Diharapkan:** klaim attempt tunggal atomik di bawah lock order/shipment, periksa paid/lifecycle/ID/state. Network tidak berada di dalam lock panjang; uncertain membekukan retry sampai rekonsiliasi. Unique provider ID tidak mencegah dua booking provider dengan ID berbeda.
- **File/simbol diubah:** SH createFromOrder/freshRatePayload/flags, BS client/createOrder/response validation, request dan dua admin detail pages untuk eligibility/error. Snapshot kurir customer tetap dipertahankan; perubahan default override terpisah OPSIONAL-03.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - pseudocode safety attempt:**

```text
transaction(lock order -> shipment):
    require paid + order layak + no provider booking ID + not creating/uncertain
    claim creating + creating_at; commit
quotation/recheck -> POST create tepat sekali (client dasar tanpa retry create)
    identity provider valid -> simpan hasil, commit; immediate replay BUG-10
    rejection yang benar-benar terbukti -> failed retryable tanpa provider ID
    timeout/5xx/malformed/duplicate/tidak ada identity -> tetap creating,
        raw_order_response.booking_creation_uncertain=true, failed_reason aman
UI menerima can_create/can_retry/requires_reconciliation dari server
```

- **Kontrak/schema:** gunakan creating_at/failed_reason/raw_order_response existing; tidak menambah kolom tanpa kebutuhan. Hilangkan retry dari client dasar; retry hanya dipasang eksplisit pada operasi baca/quotation yang aman. Bentuk ID/error provider yang dapat dianggap rejection terkonfirmasi masih harus dibuktikan; jika tidak diketahui, default uncertain, bukan failed bebas retry.
- **Dependensi/risiko:** BUG-11 menetapkan lifecycle; BUG-10 replay setelah identitas commit; BUG-13 numeric boundaries. Crash sesudah POST sebelum commit harus tetap memblokir retry, bukan disimpulkan provider gagal. Rekonsiliasi tidak boleh membuat POST baru otomatis.
- **Acceptance:** dua request paralel menghasilkan satu create HTTP; retry HTTP connection/5xx tidak mengirim POST kedua; 2xx tanpa ID menjadi uncertain; existing ID/creating/uncertain menolak booking; confirmed rejection dapat retry setelah perbaikan; booking sukses satu tracking/notifikasi; provider call count diassert, bukan hanya jumlah row shipment.

### BUG-10 - Receipt pending hilang dari pemrosesan dan processing tidak atomic (P1)

- **Referensi:** 6.2, 10, 11; REF-066/067/068/070/071/072. **Lokasi:** `app/Http/Controllers/Customer/BiteshipWebhookController.php:25` (`__invoke`), `app/Services/Admin/ShipmentManagementService.php:275` (`applyBiteshipPayload`), `routes/console.php:11`, `app/Models/BiteshipWebhookLog.php:13`.
- **Akar/penelusuran:** webhook sebelum provider ID tersimpan membuat receipt pending. Pengiriman ulang payload sama dihentikan exists check, meski processed_at null. Tidak ada replay command/schedule/caller. exists/create juga race pada unique hash. Apply shipment commit lebih dulu daripada processed_at sehingga crash meninggalkan receipt ambigu.
- **Perubahan minimum:** controller hanya autentikasi/normalisasi dan `firstOrCreate(payload_hash)` lalu delegasi. Tambahkan SH::processWebhook(receipt) dan SH::replayWebhooks(?Shipment) memakai receipt existing; satu transaksi lock receipt, match identifier, lock order/shipment, apply dan processed_at. Tanpa match biarkan null. Mapper shared tidak membuang courier.link (BUG-12).

**USULAN BELUM DITERAPKAN/BELUM DIUJI - before/after spesifik:**

```text
Sebelum: if exists(hash) return duplicate; create; apply(); update processed_at
Sesudah: receipt = firstOrCreate(hash, sanitized envelope + payload)
         processWebhook(receipt): transaction(lock receipt;
             jika processed_at ada return; cari shipment berdasar 3 identifier;
             jika tidak cocok return pending; apply payload; set processed_at)
         replayWebhooks: pending chunkById(50), catch error per receipt, jangan tandai sukses
```

- **File baru yang diusulkan, bukan dibuat:** `app/Console/Commands/ReplayBiteshipWebhooksCommand.php`, signature `shipments:replay-biteship-webhooks`; tambahkan schedule setiap 10 menit `withoutOverlapping`. Booking memanggil replay untuk shipment **sesudah transaksi penyimpanan ID commit**, sebelum notifikasi lanjutan. Ini tidak pernah memanggil create provider.
- **Kontrak/compatibility:** receipt/hash/processed_at/unique index sudah ada; pending historis bisa diproses tanpa rewrite snapshot. Payload stale/duplicate yang telah dievaluasi sah boleh dianggap handled, tetapi kegagalan apply tidak boleh mendapat processed_at. Sanitasi log metadata, bukan dump payload.
- **Dependensi/risiko:** BUG-09/11/12; processor receipt mengambil lock sebelum order/shipment, dan booking tidak memanggil replay sambil memegang lock shipment agar tidak menciptakan siklus. Cache lock runtime masih perlu OPS-04.
- **Acceptance:** webhook-before-booking tetap pending lalu immediate/scheduled replay memproses satu kali; duplicate pending dicoba ulang; duplicate processed no-op; race receipt menghasilkan satu row tanpa 500; exception apply rollback shipment dan processed_at; unmatched tetap pending; satu receipt error tidak menghentikan chunk lainnya.

### BUG-11 - Fulfillment belum mempunyai legal transitions lintas snapshot yang aman (P1)

- **Referensi:** 6.3, 9.4, 10; REF-056/073/074/076-082/117. **Lokasi:** `app/Services/Admin/ShipmentManagementService.php:216` (`updateStatus`), `app/Services/Admin/ShipmentManagementService.php:275` (`applyBiteshipPayload`), `app/Services/Admin/ShipmentManagementService.php:563` (`normalizeShippingStatus`), `app/Services/Admin/OrderManagementService.php:83` (`updateStatus`), `app/Http/Requests/Admin/ShipmentStatusRequest.php:22`, `app/Http/Requests/Admin/OrderStatusRequest.php:22`, `app/Enums/ShippingStatus.php`.
- **Akar/penelusuran:** admin dapat mengirim delivered untuk shipment belum dibooking/tidak paid; OM completion hanya memerlukan order_status delivered/completed, bukan paid + dua snapshot shipping delivered. Webhook completed -> delivered kembali menurunkan order, timestamp final ditulis now lagi. Status allocated/picking_up/picked_up justru dinormalisasi confirmed. Lost/returned/problem tidak mempunyai histori return/terminal guard yang lengkap; guard stale hanya efektif bila timestamp provider tersedia.
- **Diharapkan:** satu aturan server berlaku untuk manual update, webhook, refresh, dan props actions. UI bukan sumber izin. Issue tidak otomatis refund/release/cancel order finansial; reason/audit wajib untuk tindakan terminal manual.
- **Perubahan minimum/file:** SH/OM/ShippingStatus dan kedua requests/controllers/detail pages. Tambahkan predicate transisi server, issue descriptor, available_actions/booking flags, dan timestamps ISO pada serializer existing; tidak perlu membangun sistem workflow baru. Pakai tabel transisi referensi 6.3 sebagai daftar kandidat, **tambahkan** invariant lokal paid/booking/snapshot/history dan jangan menganggap enum list sebagai izin global.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - contoh diff normalisasi dan aturan pendamping:**

```diff
-'confirmed', 'allocated', 'picking_up', 'picked_up' => 'confirmed',
-'courier_assigned' => 'allocated',
-'picked' => 'picked',
+'confirmed' => 'confirmed',
+'allocated', 'picking_up', 'courier_assigned' => 'allocated',
+'picked', 'picked_up' => 'picked',
```

```text
Manual status: lock order -> shipment; paid + provider booking + legal transition;
               trim description wajib <=500; location <=255; same state no efek berulang
Order status:  processing hanya paid; ready_to_ship hanya processing;
               completed hanya payment paid + order.shipping_status delivered
               + shipment.shipping_status delivered; completed_at ?? now
shipment_failed: hanya issue terminal lost/returned atau disposed yang terbukti,
                 reason trimmed 1..1000; konsistensi snapshot; audit actor/reason
Provider:      stale/duplicate no downgrade; return_in_transit tidak pulih normal;
               lost/returned/disposed terminal; timestamp pertama tidak ditimpa
```

- **Histori/kontrak:** pakai `AdminActivityLog` existing dengan route/reference order, user actor, dan reason; tampilkan stock movements dari `StockLog` reference order serta variant terkait, bukan stok saat ini. Jangan mengklaim generic request log membuktikan domain transition berhasil. Tambahkan props/types UI order/shipment/customer untuk shipping_issue dan aksi yang benar-benar diizinkan; label issue tidak mengesankan selesai. Jangan menghapus status/filter bisnis existing secara membabi buta.
- **Dependensi/risiko:** BUG-03/04/06/09/10. Cancel dipisahkan BUG-06; tidak diselundupkan kembali ke dropdown. Booking attempt dan webhook memakai urutan lock seragam. Provider status tanpa timestamp tidak otomatis terbaru; legal transition tetap berlaku.
- **Acceptance:** unpaid/unbooked delivered ditolak tanpa tracking/notifikasi; completed mensyaratkan kedua snapshot delivered + paid; completed replay mempertahankan timestamp dan state; setiap edge legal dan contoh edge ilegal diuji; lost/returned/disposed tidak kembali normal; issue temporary tidak auto-refund/release; reason whitespace ditolak; audit actor/reason dan movement order tidak mencampur order lain.

### BUG-12 - Link tracking hilang saat merge, URL eksternal belum divalidasi (P2)

- **Referensi:** 6.4, 9.4; REF-084/086. **Lokasi:** `app/Http/Controllers/Customer/BiteshipWebhookController.php:87` (`toOrderPayload`), `app/Services/Admin/ShipmentManagementService.php:309`, `app/Services/Customer/OrderService.php:327` (`trackingUrl`), `resources/js/pages/customer/order/detail-order.tsx:416` (`getBiteshipTrackingUrl`).
- **Akar/penelusuran:** controller membangun ulang courier tanpa link; SH mengganti raw_order_response penuh. Jika label_url kosong dan refresh pernah menyimpan courier.link, webhook berikut tanpa link menghilangkannya. Jika create mengisi label_url dengan link, jalur itu lebih terlindungi; **bukan semua order pasti kehilangan link**. Backend/frontend menerima sembarang string nonempty sebagai href tanpa validasi protokol.
- **Diharapkan/perubahan:** pertahankan link pertama nonempty pada raw response; merge courier metadata tanpa membuang field. Pilih kandidat URL pertama yang **valid HTTP/HTTPS absolut**, bukan kandidat pertama nonempty. Label upload lokal tidak otomatis menjadi link tracking. Pertahankan tombol yang sudah clickable lintas status; jangan menambah gate shipped-only.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - potongan pseudocode SH::applyBiteshipPayload:**

```text
before: raw_order_response = payload
after:  firstLink = existing.raw.courier.link yang nonempty
                  atau incoming.courier.link yang nonempty
        raw = merge payload dengan courier metadata + firstLink
        update raw; jangan mengubah label upload yang berbeda fungsi
OS/OD:  coba setiap candidate; parse URL; hanya scheme http/https + host nonempty
        invalid/missing -> null + tombol unavailable yang aksesibel
```

- **Kontrak/data:** tidak ada backfill link historis yang sudah hilang, tidak memerlukan kolom baru. Midtrans lokal sudah tidak menulis shipment raw, sehingga jangan menyentuh jalur itu untuk menyalin fix yang tidak diperlukan. Ini validasi trust boundary, bukan klaim XSS berhasil dieksploitasi.
- **Dependensi/risiko:** gabungkan mapper dengan BUG-10 dan serializer BUG-11. Jangan memakai merge recursive yang mengubah nilai scalar menjadi array atau menimpa ID/status yang telah divalidasi.
- **Acceptance:** label_url null + refresh link A + webhook missing/B tetap A; pertama kali link tersedia dapat disimpan; `javascript:`, `data:`, relative path, malformed dan whitespace tidak menjadi href; HTTP/HTTPS valid usable walau state shipped/issue/completed; label upload tetap tersedia pada aksi label yang sesuai.

### BUG-13 - Harga rate invalid dianggap gratis; koordinat settings hanya numeric (P1)

- **Referensi:** 6.1, 8; REF-062/063. **Lokasi:** `app/Services/Integrations/BiteshipService.php:99` (`shippingRates`), `app/Services/Integrations/BiteshipService.php:175` (`coordinate`), `app/Services/Admin/ShipmentManagementService.php:427` (`coordinatePair`), `app/Http/Requests/Admin/SettingRequest.php:28`.
- **Akar/penelusuran:** `{company,type}` tanpa price, atau price string nonnumeric, menjadi `(float) 0` dan lolos filter `>=0`; order dapat menerima ongkir gratis palsu. Nilai numeric `1e309` menjadi infinity dan bisa gagal JSON; store_latitude string 999 diterima settings/helper. Address customer sudah mempunyai between range; jangan menyatakan semua jalur tidak memvalidasi koordinat.
- **File/simbol/perubahan:** validasi field rate sebelum cast dan sebelum membuat hash. Bedakan null/missing dari nol eksplisit; fallback shipping_fee bila price null sesuai kontrak existing. Samakan finite/range helper rates/create serta request settings coordinate; jangan mengubah nested versus flat payload yang sudah benar.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - inti guard rate sebelum payload dibentuk:**

```php
$price = $rate['price'] ?? $rate['shipping_fee'] ?? null;
if (! is_numeric($price) || ! is_finite((float) $price) || (float) $price < 0) {
    return null;
}
```

Mapper kemudian memakai `$price` tervalidasi dan membuang hasil null secara eksplisit. Coordinate finite harus mempunyai abs(latitude)<=90 dan abs(longitude)<=180 pada kedua integrasi; request settings memakai nullable numeric/between, bukan string bebas. Missing coordinates tidak disamarkan menjadi 0.

- **Kontrak/data:** zero sah dipertahankan; harga tidak diciptakan ketika provider tidak memberikannya. Nilai settings lama invalid harus menghasilkan pesan aman sebelum provider call, bukan normalisasi diam-diam ke lokasi lain. Tidak perlu migration.
- **Dependensi/risiko:** BUG-01/09. Harga IDR dinormalisasi bersama BUG-17; jangan mengambil rate pertama setelah filter jika company/service tidak cocok.
- **Acceptance:** missing/nonnumeric/null tanpa fallback/negative/infinite rate dibuang; 0 eksplisit dan shipping_fee 0 diterima; price null + shipping_fee valid tetap diterima; lat 90/lng 180 sah, nilai di luar batas/infinity/NaN/blank ditolak sebelum HTTP; coordinates create tetap nested dan rates tetap flat.

### BUG-14 - SKU nested tidak divalidasi terhadap row pemilik sebenarnya (P2)

- **Referensi:** 8; REF-094/095. **Lokasi:** `app/Http/Requests/Admin/ProductRequest.php:63`, `app/Services/Admin/ProductManagementService.php:236` (`syncVariants`), `app/Services/Admin/ProductManagementService.php:304` (`assertVariantSkusAreUnique`), `database/migrations/2026_04_30_000006_create_product_variants_table.php:14`.
- **Akar/pemicu:** service mengecualikan seluruh product_id ketika memeriksa incoming SKU. Produk memiliki A/SKU-A; payload mengganti A dengan varian baru id null/SKU-A. Guard lolos, insert berjalan sebelum remove existing dan terkena unique DB. SKU row soft-deleted juga luput dari Eloquent query padahal unique index tetap berlaku. Ownership existing ID sendiri sudah dibatasi dengan baik dan tidak perlu diganti.
- **Diharapkan/perubahan:** validasi uniqueness per row, hanya mengecualikan ID milik produk yang benar-benar diedit, termasuk row soft-deleted dalam pencarian. Error harus `variants.{index}.sku`. Pemeriksaan duplicate batch tetap ada dan harus sesuai semantik collation DB; jangan mengasumsikan case-sensitive di semua engine.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - pseudocode guard lokal:**

```text
Sebelum: whereIn(sku, incoming) -> where(product_id != edited product)
Sesudah: untuk setiap original index:
         resolve row ID melalui relasi product yang diizinkan
         ProductVariant.withTrashed().where(sku, incomingSKU)
             .exclude(hanya ID row tersebut).exists -> variants.index.sku error
         tangkap hanya unique violation index SKU yang dikenali sebagai validation race
```

- **Kontrak/data:** SKU unchanged milik row yang sama tetap sah. Tolak penggantian/swapping SKU yang menabrak row lain dengan pesan jelas; jangan menambah mekanisme swap sementara atau restore soft-deleted SKU tanpa kebutuhan. Pasangan harga varian referensi tidak ditambahkan; additional_price lokal tetap.
- **Dependensi/risiko:** BUG-15 menampilkan error indeks, BUG-19 mengunci persistence varian. Error database selain unique SKU tidak disembunyikan sebagai validation error.
- **Acceptance:** edit unchanged SKU sukses; SKU produk lain, soft-deleted SKU, varian baru yang memakai SKU row existing, duplicate batch dan ID lintas produk ditolak terarah; tidak ada 500 unique constraint; stock/image tidak berubah ketika validasi gagal.

### BUG-15 - Error nested produk tidak terlihat dan field tidak terhubung secara aksesibel (P2)

- **Referensi:** 8, 9.4; REF-100/101/102. **Lokasi:** `resources/js/pages/admin/products/form.tsx:199` (`FieldGroup`), `resources/js/pages/admin/products/form.tsx:479` (`fieldError`), `resources/js/pages/admin/products/form.tsx:560` (`saveVariantDraft`), `resources/js/pages/admin/products/form.tsx:587` (`submit`), `resources/js/pages/admin/products/form.tsx:1626`.
- **Penelusuran/akar:** backend dapat mengembalikan `variants.0.reserved_stock`; form menampilkan hanya `fieldError('variants')`, bukan indeks itu. Dialog sudah ditutup setelah draft disimpan ke data. Error upload berindeks juga tidak dipetakan. `Label` FieldGroup tidak mempunyai htmlFor dan pesan error tidak mempunyai ID/aria-describedby; tidak ada summary/focus onError. **Tidak ditemukan bukti semua File/draft hilang:** useForm mempertahankan data utama, sehingga jangan mengganti handler dengan reset global.
- **Perubahan minimum/file:** hanya form produk aktif, bukan halaman `create-product.tsx` yang tidak dipakai controller. Tambahkan summary seluruh error, target field stabil, error per image/variant original index, onError membuka dialog varian terkait dan fokus sesudah mount, restore focus saat ditutup. Pertahankan File dan semua data saat error; jangan mereplikasi validator ukuran varian referensi yang tidak sesuai schema.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - before/after handler:**

```text
Sebelum: post(url, { forceFormData: true }); hanya error group variants/images
Sesudah: post(url, { forceFormData: true, onError(errors):
             tampilkan semua key/pesan dalam summary role=alert;
             map variants.i.field/images.i.field ke kontrol yang benar;
             buka dialog terkait, lalu focus/scroll field invalid;
             tanpa reset data atau File })
FieldGroup: label htmlFor=inputId; error id=inputId-error;
            input aria-invalid + aria-describedby; summary links ke target
```

- **Kontrak/data:** backend validation tetap otoritatif; Indonesian message memperbaiki UX tanpa melonggarkan rules. `is_active` dan null/0 harus mengikuti field lokal, bukan mengimpor aturan empat ukuran yang belum ada.
- **Dependensi/risiko:** BUG-14/19; browser keyboard/reader check wajib, static grep bukan bukti fokus benar. Hindari revoke object URL yang masih digunakan oleh draft/File tersimpan.
- **Acceptance:** error SKU/reserved_stock/upload indeks ke-2 tampak dengan teks lengkap; summary membuka dialog dan memfokuskan kontrol; Escape/close mengembalikan fokus; input label terkait; submission gagal mempertahankan nilai, urutan varian, dan File; submit koreksi sukses tidak mengganti varian lain.

### BUG-16 - Sorting pagination tidak deterministik ketika nilai sama (P2)

- **Referensi:** 9.3, 10; REF-113. **Lokasi:** `app/Services/Customer/ProductBrowsingService.php:339` (`applySort`), `resources/js/pages/customer/products/list-product.tsx:164`.
- **Akar/penelusuran:** latest/name/price/featured/best_seller tidak diakhiri unique ID. Dua halaman query dengan banyak harga/nama/waktu sama tidak mempunyai urutan total yang dijamin; infinite-scroll dapat menggandakan/melewatkan row ketika execution plan berubah. Ini temuan determinisme statis, bukan klaim duplicate sudah tereproduksi.
- **Diharapkan/perubahan:** tambahkan ID tie-breaker setelah seluruh sort utama server. Pertahankan featured desc default dan options bisnis lokal; tidak memindahkan sort ke client atau menghapus additional_price model. UI sort/order dan reset products sudah tersedia.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - sesudah match pada applySort:**

```php
$query->orderBy('products.id', $order);
```

- **Kontrak/data:** primary ordering tidak berubah; arah tie mengikuti order query existing. Tidak ada migration. Offset pagination masih dapat berubah saat data katalog dimutasi concurrent; tie-breaker bukan snapshot isolation.
- **Dependensi/risiko:** independen dari payment/stock. Jangan mengganti default menjadi latest hanya demi menyamai AxeGear.
- **Acceptance:** >2 halaman produk dengan timestamp/harga/nama sama menghasilkan ID stabil tanpa overlap pada dataset tidak berubah, untuk setiap sort/order; sale_price efektif tetap dipakai; default featured tetap; perubahan filter/sort tidak menggabungkan halaman lama.

### BUG-17 - Nominal tersimpan berbeda dari instruksi transfer IDR yang ditampilkan (P2)

- **Referensi:** 4.3, 10; REF-018/019/021. **Lokasi:** `app/Services/Customer/CheckoutService.php:240` (`placeOrder`), `app/Services/Customer/CheckoutService.php:559` (`summary`), `resources/js/contexts/checkout-context.tsx:69` dan `resources/js/contexts/checkout-context.tsx:291`, `resources/js/pages/customer/checkout/checkout.tsx:40`, `app/Services/Customer/WhatsAppOrderMessage.php:68` (`money`).
- **Akar/penelusuran:** base/sale/additional/service fee dan persentase voucher dapat menghasilkan pecahan; grand_total/gross_amount menyimpan desimal, sementara checkout dan WhatsApp menggunakan nol digit pecahan. Misalnya total mentah 10000.50 tersimpan demikian tetapi instruksi transfer menjadi Rp10.001. Ini mismatch manual payment aktif; tidak perlu mengaktifkan Snap untuk membuktikannya secara statis.
- **Diharapkan/perubahan:** normalisasi komponen sesuai presisi decimal 15,2, kemudian total nonnegatif half-up ke IDR utuh; backend menjadi otoritas order/payment/summary. Tambahkan prop optional rounding_adjustment dan row nonzero pada checkout. Kalkulasi optimistik context mengikuti total bulat nonnegatif. Harga katalog dan snapshot historis tidak diubah.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - inti kalkulasi CK::summary dan placeOrder:**

```php
$rawTotal = max(0, $subtotal + $shipping + $serviceFee - $discount);
$grandTotal = round($rawTotal, 0, PHP_ROUND_HALF_UP);
$roundingAdjustment = $grandTotal - $rawTotal;
```

Komponen terlebih dahulu dinormalisasi pada presisi persistence agar summary tidak berbeda dari penjumlahan nilai yang disimpan. Gunakan grandTotal yang sama pada order dan payment. Prop `rounding_adjustment?: number`; UI tidak menampilkan baris Rp0 semu akibat noise float. Tests harus mengunci boundary .49/.50, discount persen, dan representasi serialisasi, bukan hanya pola `Math.round`.

- **Midtrans legacy:** `app/Services/Integrations/MidtransService.php:104` memakai float cents coercion. Tambahkan guard bentuk angka/finite sebelum membandingkan; jangan menafsirkan string invalid sebagai nol. Record legacy pecahan harus dibandingkan terhadap nominal tersimpan yang benar, bukan dibulatkan diam-diam sehingga pembayaran lama sah ditolak. Kebijakan integer strict dan balancing item Snap adalah release gate OPSIONAL-02 bila create diaktifkan lagi.
- **Dependensi/risiko:** BUG-02; perubahan kontrak summary menyentuh context dan UI, tanpa kolom adjustment/migration. Persetujuan nominal untuk transaksi lama merupakan rekonsiliasi, bukan rewrite otomatis.
- **Acceptance:** total .49 turun, .50 naik; grand_total baru = payment gross = display/WhatsApp integer; jumlah komponen plus adjustment sesuai total dalam toleransi presisi persistence; zero adjustment tersembunyi; invalid/nonfinite amount ditolak; legacy snapshot tetap identik. Bila Snap kelak aktif, jumlah item x qty + shipping/fee/discount/rounding harus tepat gross, diuji terpisah sebelum release.

### BUG-18 - Nomor WhatsApp lokal/invalid dapat menghasilkan tujuan pembayaran atau support tidak usable (P2)

- **Referensi:** 7; REF-091. **Lokasi:** `app/Services/Customer/WhatsAppOrderMessage.php:12` (`url`), `app/Services/Customer/CheckoutService.php:49`, `app/Services/Customer/OrderService.php:346` (`whatsappUrl`), `app/Http/Requests/Admin/SettingRequest.php:34`, `app/Services/Admin/SettingManagementService.php:82`.
- **Akar/pemicu:** payment setting menerima nomor berawalan 0, persistence membuang separator tetapi tidak mengonversi 0 menjadi 62; WA langsung memakai digit tersebut pada wa.me. Support mengonversi 0 tetapi menerima digit terlalu pendek/invalid karena hanya memeriksa nonempty. Fallback nomor literal existing bukan bukti nomor baru boleh diciptakan; kepemilikannya belum diverifikasi dan nilainya tidak direplikasi di laporan.
- **Diharapkan/perubahan/file:** tambah normalisasi kecil `SiteSettingService::normalizePhone(?string): ?string` untuk pemakaian existing WA/OS; terima separator telepon yang diketahui, konversi lokal 0 ke 62, validasi digit internasional 8-15 dan awalan bukan nol. Pertahankan key `payment_whatsapp_number` yang dapat sengaja berbeda dari support/store. `WhatsAppOrderMessage` harus menyediakan nomor tervalidasi sebelum order creation, bukan gagal baru setelah reservasi commit.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - normalisasi inti setelah input karakter di-whitelist:**

```php
$digits = preg_replace('/\D+/', '', $value);
if (str_starts_with($digits, '0')) {
    $digits = '62'.substr($digits, 1);
}
return preg_match('/^[1-9][0-9]{7,14}$/', $digits) ? $digits : null;
```

- **Kontrak/data:** invalid support menjadi unavailable/null; invalid payment menjadi error konfigurasi aman sebelum order/reservation. Jika mengubah tipe return url, sesuaikan CK/props/UI; pilihan minimum tetap string untuk URL valid dan ValidationException untuk payment invalid. Jangan mengganti nomor/alamat bisnis dengan identitas referensi. Verifikasi fallback existing dengan pemilik bisnis sebelum mempertahankan atau menghapusnya.
- **Dependensi/risiko:** tidak bergantung konsolidasi canonical OPSIONAL-04; rawurlencode existing tetap. Jangan mengirim pesan WhatsApp atau menghubungi nomor apa pun selama verifikasi otomatis.
- **Acceptance:** nomor sintetis lokal dan format +62/separator menghasilkan digit internasional konsisten; blank/terlalu pendek/terlalu panjang/huruf ditolak; missing support tidak memakai nomor buatan; pesan dengan `&`, `+`, newline dan Unicode tetap encoded; payment invalid tidak membuat order/payment/reservasi.

### BUG-19 - Edit/create/duplicate admin dapat menimpa atau menciptakan reservasi tanpa order (P1, tambahan lokal)

- **Referensi terkait:** invariant stok 5.1/8; REF-040. Bukan klaim semua celah ini telah diperbaiki endpoint referensi. **Lokasi:** `app/Services/Admin/ProductManagementService.php:251` (`syncVariants`), `app/Services/Admin/ProductManagementService.php:126` (`duplicate`, replicate varian baris 141), `app/Services/Admin/ProductVariantService.php:52` (`create`), `app/Services/Admin/ProductVariantService.php:64` (`update`), `app/Http/Requests/Admin/ProductRequest.php:70`, `app/Http/Requests/Admin/ProductVariantRequest.php:30`.
- **Akar/penelusuran:** form lama membawa reserved_stock=0; checkout menaikkannya menjadi 1; admin submit menulis 0 kembali tanpa lock/recheck. CHECK reserved<=stock masih lolos, tetapi reservasi order hilang dan stok tersedia menjadi berlebih. Create dapat mengisi reserved_stock tanpa order; duplicate mereplikasi counter dari varian sumber padahal order reservation tidak ikut diduplikasi.
- **Diharapkan/perubahan:** reserved_stock merupakan counter milik alur reservasi, read-only pada form produk/varian. Update memuat row fresh dengan lock, mempertahankan counter aktual, dan menolak stock baru < reserved aktual. Varian baru dan hasil duplicate selalu reserved_stock=0. Koreksi reservasi operasional terpisah harus mempunyai rekonsiliasi/order audit, bukan kolom form bebas.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - inti persistence, bukan patch seluruh caller:**

```text
syncVariants/update:
    lock parent sesuai urutan BUG-01; lock variant fresh ID ascending
    payload.reserved_stock = existing.reserved_stock; validasi stock >= nilai fresh
create/duplicate:
    reserved_stock = 0, jangan replicate counter reservasi sumber
request/form:
    tampilkan counter readonly; payload reserved_stock lama tidak mengubah counter
```

- **Kontrak/data:** stock biasa tetap dapat dikelola admin dengan audit existing; jalur StockService::adjust yang sudah lock/reject below reserved dipertahankan. Tidak ada recalculation/backfill aktif otomatis. Request lama dapat diterima sementara dengan reserved_stock diabaikan, agar tidak mematahkan draft lama; respons/form menampilkan nilai server aktual.
- **Dependensi/risiko:** BUG-01/03/05; sentuh kedua form aktif produk dan standalone varian serta duplicate, bukan hanya satu endpoint. Stock log before/after harus berasal row fresh, bukan model sebelum transaksi.
- **Acceptance:** stale edit tidak menurunkan counter checkout; stock < reserved fresh ditolak; create dengan payload reserved>0 tidak membuat ghost reservation; duplicate varian reserved>0 menghasilkan counter copy 0 dan source tidak berubah; race admin edit versus payment finalize menjaga counter/StockLog konsisten dengan DB produksi terisolasi.

### BUG-20 - Log penolakan reference/amount sync ikut rollback (P2)

- **Referensi:** 5.1, 10; REF-036. **Lokasi:** `app/Actions/Payments/SyncMidtransPaymentAction.php:27` (`execute`), `app/Actions/Payments/SyncMidtransPaymentAction.php:65` (`logRejected`).
- **Penelusuran/akar:** payload ID/amount salah -> logRejected membuat row -> ValidationException dilempar dari closure DB::transaction yang sama -> row penolakan rollback. Operator kehilangan bukti provider response ditolak, walau nama event terlihat di source.
- **Perubahan minimum:** closure mengembalikan hasil penolakan setelah menulis log tanpa mengganti metadata/order; commit lebih dahulu, lempar ValidationException di luar. Jangan memindahkan mutasi payment sebelum validasi hanya demi mempertahankan log.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - struktur lokal:**

```text
rejection = DB.transaction(lock order/payment;
    jika reference/amount mismatch: logRejected(...); return pesan penolakan
    selain itu apply payload valid; return null)
if rejection != null: throw ValidationException.payment(rejection)
```

- **Kontrak/data:** tetap error validation bagi caller; log tersimpan sebagai hasil audit penolakan, bukan pembayaran sukses. Pseudocode perlu diterapkan dengan penyesuaian return type closure yang saat ini void. Tidak ada schema baru.
- **Dependensi/risiko:** refactor applyPayload pada BUG-07/08 harus mempertahankan commit boundary ini; BUG-04 guard metadata tetap sebelum update. Hindari mencatat raw response ke log aplikasi umum.
- **Acceptance:** mismatch ID dan amount masing-masing menghasilkan exception validation **dan satu PaymentLog menetap**, sementara payment/order/stock/notifikasi identik; payload valid mengikuti handler; exception database tidak dinyatakan sukses.

### BUG-21 - Refresh price_snapshot dibatalkan oleh exception dalam transaksi yang sama (P2, tambahan lokal)

- **Referensi:** temuan lokal tambahan saat menelusuri recheck harga checkout; terkait batas checkout 4.1, bukan bukti patch referensi. **Lokasi:** `app/Services/Customer/CheckoutService.php:178` (`placeOrder`), `app/Services/Customer/CheckoutService.php:203`, `app/Services/Customer/CartService.php:161` (`cartItems`).
- **Akar/penelusuran:** harga baru berbeda -> forceFill price_snapshot/save -> throw ValidationException di closure transaksi -> save dirollback. Cart display memakai price_snapshot lama, bukan harga varian terkini. Reload/retry tanpa mengubah quantity tidak memulihkan harga yang diminta untuk direview. Cart mutation quantity kebetulan memperbarui harga, tetapi bukan alur review yang benar.
- **Diharapkan/perubahan:** commit refresh harga cart sebelum melempar pesan review, tetapi jangan commit order/reservasi/voucher ketika harga berubah. Minimum: fase validasi item dalam transaksi mengumpulkan perubahan harga, lalu **return hasil price_changed sebelum blok voucher/order**; di luar transaksi invalidate quotation dan throw validation. Tetap recheck availability/ownership di bawah lock BUG-01.

**USULAN BELUM DITERAPKAN/BELUM DIUJI - before/after closure lokal:**

```text
Sebelum: update snapshot; throw di dalam DB.transaction -> update hilang
Sesudah: update snapshot semua item yang berubah; tandai price_changed
         sebelum voucher/order: return {price_changed:true}; commit hanya cart
         di luar transaction: jika price_changed, invalidasi binding lalu throw review
         jika tidak berubah: hasil tetap Payment dan flow manual existing berlanjut
```

- **Kontrak/data:** tipe internal hasil transaksi perlu diadaptasi dari Payment menjadi Payment/hasil review; respons publik tetap validation error atau payload manual yang sama. Snapshot order historis tidak berubah, tidak ada migration. Jangan sekadar menghapus throw lalu melanjutkan pembelian tanpa persetujuan harga baru.
- **Dependensi/risiko:** BUG-01/02 mengatur hash/invalidation dan mutasi cart; BUG-17 kalkulasi nominal. Tidak boleh ada increment voucher/reserved_stock sebelum keputusan price_changed.
- **Acceptance:** ubah harga setelah cart: submit pertama ditolak review, cart sesudah reload menunjukkan harga baru, order/payment/reservasi/used_count tetap; quote ulang lalu submit sukses tanpa harus mengubah quantity; semua item harga berubah ter-refresh; harga baru yang belum disetujui tidak pernah menjadi order diam-diam.

### Pekerjaan Operasional yang Bukan Bug Runtime Terkonfirmasi

| ID/prioritas | Bukti, perubahan minimum, dan acceptance |
| --- | --- |
| OPS-01 / P1 sebelum tests | `phpunit.xml:21`, `tests/Pest.php:16`, `tests/TestCase.php:8`: SQLite memory/global RefreshDatabase sudah benar, tetapi env tidak force dan tidak ada cache path khusus/stray HTTP guard global. **Bukti statis atas keterbatasan konfigurasi**, bukan bukti database aktif telah tercemar. USULAN BELUM DITERAPKAN/BELUM DIUJI: runner testing menetapkan force env, cache config/routes testing khusus, HTTP stray prevention/fakes, mail array dan queue aman; assert effective config sebelum memakai RefreshDatabase. Acceptance: tidak memakai runtime DB/cache; provider tak difake harus gagal; tidak mengirim email/job eksternal. Tidak membaca .env untuk membuktikan isolasi |
| OPS-02 / P1 per tranche | `tests/Feature/Payments/SyncExpiredMidtransPaymentsTest.php:37` mengunci expiry lokal; manual checkout test hanya menguji pesan WhatsApp; tidak ada suite lengkap untuk matrix failure/race. USULAN BELUM DITERAPKAN/BELUM DIUJI: tambah regression terarah per BUG, koreksi test asumsi unsafe, pertahankan test happy-path. Acceptance: setiap bug mempunyai red/green assertion perilaku/side effect dan request count; source-pattern assertion tidak disebut E2E. Ini kekurangan coverage, bukan klaim semua tests existing gagal |
| OPS-03 / P2 sebelum release | `vite.config.ts:25` menjalankan Wayfinder saat build; package scripts tersedia. Manifest tracked terakhir disentuh pada HEAD, `public/hot` ada. **Tidak ada bukti cukup build lokal stale**, apalagi sama stale dengan referensi. USULAN BELUM DITERAPKAN/BELUM DIUJI: build/regenerate di workspace implementasi, periksa source endpoint, helpers, manifest/import assets dan deployment yang disajikan. Acceptance: typecheck/build/rendered request memakai commit/source yang benar; generated source tidak diedit manual |
| OPS-04 / P1 release gate | `routes/console.php:11`, job sync dan cache lock hanya deklarasi; worker/cron/engine DB/provider tidak diamati. USULAN BELUM DITERAPKAN/BELUM DIUJI: verifikasi scheduler/queue/cache lock, dua koneksi paralel DB engine produksi pada DB disposable, sandbox provider dengan data sintetis dan persetujuan khusus. Acceptance: no duplicate booking/finalisasi, replay berjalan, uncertain direkonsiliasi; bukti HTTP/status/log disanitasi. Tidak menggunakan DB produksi aktif untuk concurrency test |

## 5. Perubahan Non-Bug

Seluruh item berikut opsional, tidak dihitung dalam 21 bug. Perbedaan desain/fitur yang belum dibangun tidak menjadi alasan memperluas scope implementasi wajib. Potongan langkah di sini juga **USULAN BELUM DITERAPKAN/BELUM DIUJI**.

| ID | Kategori, relevansi, lokasi | Usulan minimum, dependensi, penerimaan |
| --- | --- | --- |
| OPSIONAL-01 | Fitur tambahan: empat ukuran varian dan estimator root. Schema `product_variants` tidak memiliki ukuran; PR/PV/FORM mengikuti root model. Tidak ada endpoint shipping-estimate | Default **tidak ditambahkan**. Jika kebutuhan ukuran berbeda per varian dikonfirmasi, rancang schema/model/request/form/hash/snapshot terpisah; alasan migration adalah field benar-benar belum ada, bukan menyalin migration khayalan. Old order_items tetap immutable. Estimator opsional memakai root unsaved, auth admin aktif, throttle 30, tanpa activity-log simulasi, finite positive <=1e9, simulasi 1 km bukan quotation customer. Acceptance bila dipilih: backend/frontend sepakat active/inactive/0/null; XSRF/generated POST/same-origin, debounce 800 ms, abort/stale signature/live region dan failure 503 aman. Sampai dipilih, tidak ada migration/backfill |
| OPSIONAL-02 | Fitur/integrasi dormant: aktivasi ulang Snap. `MidtransService::createSnapTransaction:17` hanya dipanggil test callback | Default **jangan aktifkan**. Sebelum aktivasi: classify confirmed rejection versus unknown, token nonempty/HTTPS, uncertainty flags, preserve cart/reservation/voucher, idempotent retry, balancing item Snap/gross dan sync/cancel aman. BUG-03/04/05/07/08/17 menjadi gate. Acceptance: timeout/5xx/408/409/429/malformed/duplicate tidak dianggap reject/sukses; verified reject saja release; paid concurrent tidak ditimpa. Metode dormant sekarang belum memenuhi kontrak tersebut; bukan klaim provider aman |
| OPSIONAL-03 | Fitur/kontrak fulfillment dan UI/konten: booking default kurir customer; komposisi alamat note/subdistrict. SH:132/369/390, admin orders show:396 | Booking saat ini input manual, sedangkan pilihan customer tersimpan. Konfirmasi apakah override operator memang kebutuhan bisnis; default pertahankan pilihan tersimpan dan jangan override diam-diam. Jika otomatisasi dipilih, `source=order_detail` mengambil snapshot, request courier conditional, UI menampilkan pilihan customer; override explicit/audited bila disetujui. Note sudah dikirim terpisah; menambahkan note/subdistrict ke destination string perlu mencegah duplikasi dengan full_address. Acceptance snapshot lama/alamat sendiri tetap; tidak menambah biaya tanpa persetujuan |
| OPSIONAL-04 | Fitur/konsolidasi settings, bukan bukti bug identitas. SET::get/first; SettingManagementService; SettingRequest; SH::setting | Canonical aliases dan explicit-null precedence belum setara, tetapi shipper/origin/payment contact dapat sengaja berbeda. Jika dipilih, gunakan array_key_exists/existence row agar null eksplisit menang, aliases request kompatibel, update callers bersama, whitelist public. Jangan menggabungkan payment_whatsapp_number ke support, mengubah alamat, atau seed DB aktif. Acceptance canonical termasuk null mengalahkan alias hanya pada key yang disepakati; identitas/nilai lokal tidak diganti AxeGear |
| OPSIONAL-05 | Fitur contact public, maps/social/form WhatsApp. Route/page/controller setara referensi tidak ada | Default tidak dibuat. Jika diperlukan, tambah controller contact dengan whitelist public saja dan route Wayfinder; validasi URL/email/phone/maps fallback; nama/pesan max1000 dan encoded WhatsApp, bukan fake backend request. Acceptance private integration keys tidak masuk props, invalid links unavailable, identitas lokal dipertahankan |
| OPSIONAL-06 | UI/observability reserved totals. PROD::indexData:42 hanya withSum stock; row:374 tidak memuat reserved total | Menambah withSum variants reserved_stock + prop/type + kolom di samping Stock boleh dilakukan sebagai peningkatan admin, bukan memperbaiki counter itu sendiri. BUG-19 tetap wajib terpisah. Acceptance total sama sum varian pada dataset uji, tidak menghitung soft-deleted varian tanpa keputusan bisnis |
| OPSIONAL-07 | UI/konten/aksesibilitas tambahan: cart layout, product description/shopping information, gallery navigation, mobile toolbar/cards, sidebar/shell, packing label | Tidak memaksakan layout referensi, menghapus SKU/fitur/route Halaman, atau mengganti packing document menjadi AxeGear. Semua foto sudah tersedia; previous/next/aria-pressed/active-scroll boleh ditambahkan terarah. Shopping information tidak boleh mengarang retur/garansi. Import Search pada detail produk lokal **tidak ada**, sehingga jangan menyalin penghapusan impor yang tidak diperlukan. Acceptance jika perubahan UI dipilih: browser 360/390/768/1440, keyboard/focus, tanpa overflow, cart/qty tetap; BUG-15 memperbaiki aksesibilitas error yang sudah terbukti |
| OPSIONAL-08 | Hardening/konsolidasi shared pagination. PerPageSelect ada; parser label tersebar, sebagian listing memakai dangerouslySetInnerHTML; catalog shared memakai plain text | Belum terbukti ada input penyerang pada label Laravel, jadi **bukan temuan XSS terkonfirmasi**. Usulkan helper normalisasi previous/next/key terjemahan/entities/arrows, plain text angka/ellipsis, Chevron + sr-only; adopsi 12 caller tanpa mengganti per-page/filter. Acceptance malicious label hanya teks, no raw HTML; previous/next/ellipsis/keyboard benar. Tidak menambahkan sanitizer dependency hanya untuk label pagination |
| OPSIONAL-09 | Dokumentasi/artefak historis: commit statistics, screenshot, laporan lama, integration-recovery, security report incomplete, product-link dan generated build | Bukan patch aplikasi. Historical objects tidak tersedia, statistik referensi tidak direproduksi sebagai fakta Git lokal. Jangan menyalin transkrip, binary atau hashed bundle. Referensi mengatakan build endpoint stale; **itu tidak membuktikan build lokal stale**. Acceptance laporan mengaitkan perilaku ke source lokal dan tetap menyatakan keterbatasan bukti |

## 6. Rencana Implementasi Bertahap

**Rencana saja; seluruh langkah berikut belum diterapkan/belum diuji.** Pisahkan perubahan per akar masalah, tetapi rilis alur yang saling bergantung sebagai satu kesatuan. Jangan menyalin source referensi atau mengaktifkan fitur dormant sebagai jalan pintas.

| Tahap | Pekerjaan, urutan internal, dan dependensi | Gate selesai |
| --- | --- | --- |
| 0 - Pengamanan verifikasi | OPS-01 lebih dahulu: runner/database/cache/integrasi terisolasi. Konfirmasi keberadaan dan masa retensi transaksi Midtrans legacy melalui operator berwenang, bukan membaca database aktif dalam audit ini. Tetapkan invariant dan urutan lock konsisten lintas checkout, stok, pembayaran, pembatalan, serta admin edit | Runner gagal sebelum RefreshDatabase bila bukan database disposable; semua HTTP provider difake/dilarang. Tidak ada perubahan nilai bisnis/credential |
| 1 - Uang dan reservasi | BUG-03 dan BUG-05: finalisasi all-or-nothing, guard released, failure_reason/review tetap committed melalui batas transaksi yang benar. BUG-19 menjaga counter reserved fresh pada create/update/duplicate. BUG-06 menghapus jalur cancellation yang melewati service pembatalan; BUG-04 membuat event final monotonic dan notifikasi idempotent | Finalisasi gagal pada item terakhir tidak mengurangi satu item pun; paid/duplicate/refund tidak membangkitkan order atau mengirim ulang notifikasi; edit stok tidak menghilangkan reservasi. Manual confirm/cancel bersaing tidak memakai reservasi order lain |
| 2 - Legacy provider safety | Setelah tahap 1, BUG-07/08/20: reference/amount/status terverifikasi, uncertain dipertahankan, not-found harus confirmed, paid dicek ulang di bawah lock. Expiry lokal bukan bukti provider expire. Persist log penolakan di luar transaksi yang dibatalkan, sanitasi data log | Timeout/5xx/malformed tidak melepas stok/voucher; confirmed terminal menerapkan tepat sekali; cancel/sync versus paid tidak menurunkan status. Jika legacy tidak digunakan, nonaktifkan entrypoint hanya lewat keputusan bisnis terpisah, bukan asumsi audit |
| 3 - Checkout aktif | BUG-01/02/21/17/18: satu kontrak paket root-product dan hash; quote/voucher binding konsisten; compare snapshot fresh saat lock; commit refresh cart sebelum meminta konfirmasi ulang; uang IDR konsisten; nomor pembayaran valid sebelum mutasi order. BUG-13 untuk validasi rate/koordinat | Quote identik lolos, perubahan fisik/harga/quantity memaksa re-quote/review; voucher apply/remove tidak menyisakan pilihan ongkir palsu; nilai order, instruksi transfer, dan tampilan sama. Tidak menambah ukuran varian atau mengaktifkan Snap |
| 4 - Booking dan webhook | BUG-09 mengklaim attempt sebelum POST tanpa memegang lock selama jaringan. BUG-10 menambah processor atomic untuk receipt existing, replay immediate after commit serta scheduler berkunci. BUG-11 mengatur transisi legal dan snapshot lintas order/shipment; BUG-12 merge link tervalidasi. Rilis consumer replay sebelum mengandalkan replay pada booking | Dua worker tidak melakukan dua POST; uncertain tidak otomatis retry; webhook lebih awal diproses setelah binding order; duplicate receipt dan pending replay tidak double-apply; timestamp pertama/link lama tetap; paid/cancel guard berasal server |
| 5 - Admin dan katalog | BUG-14/15 setelah invariant reserved tahap 1; BUG-16 sorting deterministik. Kontrak props/errors/types diubah bersamaan. OPSIONAL-06/08 hanya bila disetujui; bukan prasyarat uang/stok | SKU conflict menghasilkan error field, bukan DB exception; nested error dapat ditemukan keyboard/screen reader tanpa kehilangan draft; halaman katalog tidak mengulang/melewatkan row pada tie dengan dataset tidak berubah |
| 6 - Release | OPS-02/03/04: focused regression, full suite, frontend checks, build/Wayfinder di workspace implementasi, QA browser, concurrency DB engine produksi yang terisolasi, sandbox berizin, verifikasi deployment | Bukti per acceptance tercatat; source/build/manifest/route yang dilayani konsisten; scheduler dan worker/cache lock efektif; tidak ada klaim lulus hanya dari pattern matching atau SQLite |

### Prasyarat schema dan kompatibilitas

- Schema sudah mempunyai counter reservasi, marker release/finalize, `failure_reason`, receipt `payload_hash`/`processed_at`, serta metadata provider. **Tidak ada migration/backfill wajib yang terbukti untuk 21 bug ini.** Verifikasi ulang tipe/nullability/unique index sebelum implementasi; gunakan kolom existing, bukan tabel reservasi baru tanpa kebutuhan.
- Receipt replay memakai row existing sebagai unit kerja. Penambahan index hanya dipertimbangkan setelah query dan volume nyata menunjukkan kebutuhan; bukan syarat audit ini. Recovery receipt lama harus dry-run/review dahulu, bukan memutar ulang seluruh webhook aktif tanpa batas.
- Order lama boleh tidak mempunyai snapshot fisik dan mempunyai pecahan nominal. Fallback historis tidak mengambil dimensi/harga produk terkini diam-diam. Pembulatan kontrak baru tidak mengubah nominal pembayaran lama atau menolak settlement valid hanya karena record historis fractional.
- Penambahan ukuran/harga mandiri varian, estimator, canonical settings, public contact, dan Snap merupakan keputusan fitur pada bagian 5. Jika dipilih, barulah spesifikasi schema, migrasi kompatibel, dan tests dibuat terpisah. Tidak menjalankan seeder/backfill terhadap database aktif.
- Pilihan kurir customer, identitas toko, kontak pembayaran/support, root dimensions, dan fitur admin lokal dipertahankan sampai ada keputusan bisnis eksplisit. Gate P1 bukan alasan merombak desain.

## 7. Rencana Verifikasi

### Bukti yang benar-benar diperoleh

| Aktivitas | Hasil aktual dan batas |
| --- | --- |
| Git read-only | Branch/HEAD/status, objek historis, dan metadata build diperiksa. Tidak commit/checkout/reset/fetch |
| Pembacaan lokal | Referensi lengkap; source statis, manifest/lockfile, schema, routes, konfigurasi testing/build, dan coverage sebagaimana bagian 8. Tidak bootstrap Laravel atau membuka database |
| PHP syntax | `php -l` terhadap 238 file PHP pada `app`, `routes`, `database/migrations`, `tests`, `config`; 0 kegagalan. Tidak mengeksekusi body aplikasi atau membuktikan class/SQL/provider contract benar |
| Tests/lint/typecheck/build | **Tidak dijalankan**. Isolasi runtime belum dibuktikan; dokumentasi ini tidak boleh menghasilkan cache/build/generator atau mengubah file lain |
| Browser/provider/concurrency/deployment | **Tidak dijalankan/dihubungi**. Tidak ada hasil sandbox/live, screenshot QA, atau jaminan row-lock dari DB produksi |

### Gate isolasi sebelum tests

1. Gunakan workspace verifikasi yang diizinkan dan DB **disposable**, bukan database aktif. Jangan menjalankan `composer setup`, migration, seeding, atau `composer test` untuk membuktikan isolasi: `composer test` menjalankan `config:clear`, sedangkan global `RefreshDatabase` sudah aktif pada feature tests.
2. Dalam runner yang belum dibuat (OPS-01), tetapkan environment testing secara paksa dan cache config/routes khusus testing sebelum bootstrap. `phpunit.xml` saat ini menetapkan SQLite `:memory:`, `DB_URL` kosong, mail/cache/session array dan queue sync, tetapi tanpa `force="true"`. Pastikan effective config sesuai sebelum trait menyentuh DB; jangan membaca/menampilkan `.env`, URL DB rahasia, atau token untuk memeriksanya.
3. Pasang guard HTTP stray dan fake semua request Midtrans/Biteship; fake notifikasi/mail/storage/queue yang mempunyai side effect. Queue `sync` bukan isolasi provider karena job tetap dapat berjalan. Gunakan nilai sintetis, tidak ada token nyata. Jangan menganggap `APP_ENV=testing` sendirian membuktikan aman.
4. Setelah guard aktif, pastikan effective DB bukan koneksi operasional, cache path tidak memuat cache aplikasi, dan outgoing HTTP tak terdaftar gagal. Uji penolakan guard terlebih dahulu pada lingkungan disposable. Baru jalankan focused tests berikut.

Tidak ada guard/perintah runner baru yang dipresentasikan sebagai sudah tersedia. `bootstrap/cache/config.php` tidak ada dan tidak ditemukan route cache saat inspeksi; keadaan sesaat itu tidak menggantikan gate runner di atas.

### Focused regression yang diusulkan

Perintah berasal dari runner/file yang ada. **BELUM DIJALANKAN; hanya sesudah gate isolasi.** Tambahkan skenario BUG pada suite relevan; nama file baru untuk test yang belum ada diputuskan saat implementasi. Path existing bukan bukti sudah mencakup acceptance yang diminta.

```powershell
php artisan test tests/Feature/Admin/ManualOrderPaymentVerificationTest.php
php artisan test tests/Feature/Payments/MidtransWebhookSecurityTest.php
php artisan test tests/Feature/Payments/SyncExpiredMidtransPaymentsTest.php
php artisan test tests/Feature/Customer/BiteshipShippingRateTest.php
php artisan test tests/Feature/Customer/ManualTransferCheckoutTest.php
php artisan test tests/Feature/Admin/BiteshipCreateShipmentTest.php
php artisan test tests/Feature/Customer/OrderTrackingLinksTest.php
php artisan test tests/Feature/Admin/ProductCreateTest.php
php artisan test tests/Feature/Payments/MidtransSnapCallbackTest.php
```

`ManualTransferCheckoutTest` existing hanya menguji URL/pesan, bukan keseluruhan reserve/placeOrder. `MidtransSnapCallbackTest` memanggil metode Snap secara test, bukan membuktikan checkout aktif memakai Snap. `SyncExpiredMidtransPaymentsTest` harus dikoreksi terhadap perilaku unsafe, tidak sekadar dipertahankan agar suite hijau.

| Cluster | Assertions minimum tambahan |
| --- | --- |
| BUG-03/04/05/06/19 | Order/payment/variant snapshots before-after; gagal di item terakhir rollback seluruh item; release/finalize/voucher tepat sekali; terminal refund tetap; reason/review persisted; notifikasi tepat sekali; create/duplicate tidak membuat reservasi; stale admin edit tidak menimpa counter |
| BUG-07/08/20 | Kombinasi status provider, reference/amount salah, timeout, 5xx, malformed, not-found confirmed versus ambigu; concurrent paid tetap paid; log penolakan persisted tanpa payload sensitif; uncertain tidak melepas resource |
| BUG-01/02/13/17/18/21 | Root dimensions + quantity, finite positif, missing/nonnumeric price versus nol eksplisit; physical/hash mutation; voucher apply/remove sampai placeOrder; harga berubah commits refresh cart tetapi tidak order; IDR display/persistence sama; invalid payment phone tidak memutasi order |
| BUG-09/10/11/12 | Assert jumlah POST; worker bersaing; request unknown tidak retry otomatis; 2xx tanpa ID bukan sukses; receipt duplicate/pending/pre-booking replay; failure rollback apply dan processed_at bersama; legal transition; timestamp pertama/link tervalidasi dipertahankan |
| BUG-14/15/16 | SKU milik row sendiri/row lain/soft-delete/duplicate payload; nested variant dan upload error terlihat/focusable; draft/File diperiksa browser; ties sorting pada harga efektif dan ID, filter/sort mereset infinite-scroll |

Jangan mengganti assertions persistence/HTTP/UI dengan tes pencarian string source. Source-pattern tests dapat memeriksa invariant struktural kecil, tetapi tidak membuktikan atomisitas, state transition, response provider, atau validasi form berjalan.

### Pemeriksaan kualitas dan build setelah implementasi

Perintah berikut **USULAN, BELUM DIJALANKAN**, di workspace implementasi yang diizinkan. Jangan menjalankan formatter/build/generator pada tahap laporan ini.

```powershell
Get-ChildItem app,routes,database/migrations,tests,config -Recurse -Filter *.php -File | ForEach-Object { php -l $_.FullName }
composer lint:check
npm run lint:check
npm run format:check
npm run types:check
php artisan test
npm run build
```

- Script aktual: `lint:check` PHP memakai `pint --parallel --test`; frontend memakai `eslint .`, `prettier --check resources/`, dan `tsc --noEmit`. `npm run build` ialah `vite build`; `build:ssr` ialah `vite build && vite build --ssr`, diperlukan hanya jika SSR memang dideploy.
- Vite mengaktifkan Wayfinder dengan `formVariants: true`; build dapat menghasilkan helpers/artefak. Verifikasi helper endpoint, HTTP method, props/types dan XSRF setelah perubahan route/signature; jangan mengedit generated output manual atau mengarang perintah generator yang tidak ditemukan.
- `composer test` mengubah cache lewat `config:clear`; `composer ci:check` memanggil frontend checks lalu script test tersebut. Keduanya bukan perintah read-only audit. `composer lint`, `npm run format`, `npm run lint` bersifat mutating dan tidak dijalankan.
- Workflow `.github/workflows/tests.yml` menjalankan install/build/Pest; `.github/workflows/lint.yml` memakai formatter/fixer mutating. Keberadaan workflow bukan bukti CI lulus, checkout bersih, atau isolasi provider/database efektif.
- Setelah build, cocokkan manifest dan asset yang dilayani dengan source commit, endpoint rates/order, Wayfinder, serta mode `public/hot`. Jangan menyimpulkan stale hanya karena hashed filename atau timestamp. Tidak ditemukan suite Node/QA referensi sebagai script lokal yang siap dijalankan.

### Browser, concurrency, sandbox, dan operasional

- **Browser QA usulan:** viewport 360/390/768/1440; cart/checkout harga/quantity/voucher/rate/payment; refresh/back navigation; nested errors/upload draft; keyboard/focus/ARIA; tracking/support URL; seluruh foto; pagination/filter/sort/infinite-scroll reset; action admin hanya yang diizinkan server. Responsif tidak dinyatakan lulus dari JSX/CSS saja.
- **Concurrency usulan:** dua koneksi/proses pada **DB disposable dengan engine dan isolation level setara produksi**. Sinkronkan race cancel versus paid, expiry versus settlement, dua finalisasi, admin stok versus checkout, dua booking, webhook versus immediate/scheduled replay. Ukur HTTP count, jumlah notifikasi, used_count, reservasi/stok semua item, status final, dan receipt processed tepat sekali. SQLite memory tidak menguji row-lock produksi. Engine produksi aktual belum diketahui.
- **Provider sandbox usulan, memerlukan izin terpisah:** payload/response sintetis untuk confirmed rejection, timeout/408/409/429/5xx/malformed/duplicate, not-found authoritative, amount/reference mismatch, callback terlambat, serta booking uncertain. Tidak menganggap ketidakpastian sebagai keberhasilan maupun penolakan. Simpan bukti tersanitasi; jangan mencantumkan credential, nomor pelanggan, alamat pribadi, atau raw payload sensitif.
- **Operasional usulan:** verifikasi cron memanggil Laravel scheduler; expiry existing setiap 5 menit memakai lock cache yang efektif; usulan replay setiap 10 menit serta immediate replay sesudah booking commit tidak saling mengulang side effect. Command replay belum tersedia. Periksa worker untuk job queued yang benar-benar digunakan dan kebijakan retry; keberadaan kelas job tidak membuktikan deployment menjalankannya.
- Release hanya setelah acceptance prioritas P1 terpenuhi. Jika lingkungan/sandbox belum tersedia, dokumentasikan test tertunda dan mitigasi/penahanan fitur; jangan mengubah label menjadi lulus.

## 8. Lampiran Coverage dan Pertanyaan Terbuka

### Arti kedalaman

**Mendalam statis:** body alur terdampak dan caller/dependensi relevan ditelusuri; tetap bukan reproduksi. **Struktur:** file/kelas/metode/relasi/rules/routes diinventarisasi; body tidak seluruhnya ditinjau. **Metadata:** manifest/workflow/artefak diperiksa untuk kontrak delivery; tidak diperlakukan sebagai source implementasi. **Belum:** tidak ada bukti cukup untuk klaim perilaku.

| Modul/file first-party | Kedalaman dan tanggung jawab yang diperiksa | Batas/sisa |
| --- | --- | --- |
| `app/Actions/Payments/` (4), `app/Actions/Stock/` (2), `app/Actions/Vouchers/` (1) | Mendalam statis: manual verification/cancel, Midtrans apply/sync/expiry, finalize/release reservasi stok dan voucher; BUG-03/04/05/06/07/08/20 | Belum race multi-koneksi, provider atau runtime transaction/savepoint |
| `app/Actions/Fortify/` (2), `app/Concerns/` (2), response auth, providers (2) | Struktur entrypoint/registrasi/auth dan dependency; bukan transfer implementasi referensi | Body auth/reset/two-factor seluruhnya dan threat model auth di luar alur uang belum diaudit lengkap |
| `app/Services/Customer/CheckoutService.php`, `CartService.php`, `WhatsAppOrderMessage.php` | Mendalam statis: props/session, quote/voucher, hash, cart/pricing, locks/reserve/order snapshot, manual payment/message | Belum execution browser dan request end-to-end; BUG-01/02/17/18/21 |
| `app/Services/Customer/OrderService.php`, `MidtransWebhookService.php`, `AddressService.php`, `ProductBrowsingService.php` | Mendalam statis pada cancel/sync/tracking, webhook security, rate destination, root dimensions, catalog sort/pagination/gallery | CRUD address penuh/rendered katalog belum seluruhnya; BUG-07/12/16/18 |
| `app/Services/Customer/WishlistService.php`, `app/Services/Profile/ProfileService.php`, `app/Services/AdminDashboardService.php` | Struktur tanggung jawab/caller | Body penuh wishlist/profile/dashboard belum ditinjau |
| `app/Services/Integrations/BiteshipService.php`, `MidtransService.php` | Mendalam statis: rate/create/cancel/status, coordinate shape, retry/errors, Snap item/token, kontrak response | Tidak ada network/provider live; Snap creation dormant dalam aplikasi; BUG-09/13 dan OPSIONAL-02 |
| `app/Services/Admin/OrderManagementService.php`, `PaymentManagementService.php`, `ShipmentManagementService.php`, `BiteshipWebhookLogService.php` | Mendalam statis: actions/props, booking/status/sync/webhook mutation/tracking | Audit seluruh export/packing/rendered admin belum lengkap; BUG-06/09/10/11/12 |
| `app/Services/Stock/StockService.php`, `StockLogService.php`, `app/Services/Notifications/NotificationService.php` | Mendalam statis pada lock/reserved guard/log dan notifikasi transaksi | Belum delivery/failure/retry runtime; tidak menyamakan DB notification dengan mail |
| `app/Services/Admin/ProductManagementService.php`, `ProductVariantService.php`, `ProductImageService.php` | Mendalam statis pada nested SKU/ownership/pricing/sync/duplicate/reserved/image flows | Keseluruhan media lifecycle/file storage belum diuji; BUG-14/19 |
| `app/Services/Settings/SiteSettingService.php`, `app/Services/Admin/SettingManagementService.php` | Mendalam statis pada akses settings/public whitelist/phone/coordinates/aliases | Nilai DB sengaja tidak dibaca; canonical identity merupakan keputusan bisnis, bukan disalin |
| Services admin lain | Struktur: AdminUser, Banner, Category, Collection, CustomerAddress, Customer, Page, Voucher, Report, Dashboard, AuditLog, PaymentLog, AdminNotification, WishlistInsight; traits `ResolvesAdminPagination`, `StoresUploadedFiles` | Bukan klaim semua CRUD/report/export/permission/media error telah diperiksa mendalam |
| `app/Http/Controllers/` (38), `app/Http/Requests/` (27), `app/Http/Middleware/` (4) | Struktur seluruh entrypoint/validasi/middleware; mendalam controllers/requests checkout, webhook, shipment, order/payment, product/variant/settings terkait matriks; akses admin/XSRF/throttle routes diperiksa statis | Body endpoint CRUD tak terdampak belum lengkap; tidak ada penetrasi request runtime |
| `app/Models/` (25), `app/Enums/` (4) | Struktur relasi/casts/fillable/status dan kontrak persistence terkait cart/order/payment/shipment/receipt/product/variant/settings/voucher/audit. Enum: OrderStatus, PaymentStatus, ShippingStatus, MidtransTransactionStatus | Tidak menyebut enum UserRole yang tidak ada; belum memvalidasi data aktual atau seluruh observer/event runtime |
| `app/Jobs/Payments/SyncExpiredMidtransPaymentsJob.php`, `app/Console/Commands/`, `routes/console.php` | Mendalam statis pemanggilan expiry dan definisi scheduler/lock | Cron/worker/cache lock deployment belum diamati; replay command belum ada |
| `routes/web.php`, `routes/api.php`, `routes/settings.php` | Struktur route graph customer/admin/settings, webhook, authorize/middleware/throttle; caller terkait ditelusuri | Tidak menjalankan route:list/bootstrap atau mengetes seluruh permission |
| `database/migrations/` (38) | Struktur seluruh tabel/index/foreign key/check; mendalam schema physical product, variant reserved, order snapshots/markers, payment/receipt/history/settings | Tidak menjalankan migration, introspeksi DB, backfill atau query data |
| `database/seeders/` (11), `database/factories/UserFactory.php` | Struktur kelas/model; SiteSettingSeeder dan kontrak root dimensions relevan ditelaah tanpa menjalankan | Tidak membaca/menyalin default credential; konsistensi seluruh data seed dan isi factory bukan hasil audit mendalam |
| `resources/js/contexts/checkout-context.tsx`, customer cart/checkout/order/product pages | Mendalam statis: session/selection/amount, handlers, tracking/support, effective price/sorting/infinite scroll, photos/gallery | Tidak ada browser desktop/mobile; seluruh focus/scroll/visual behavior belum terbukti |
| Admin product form, order/payment/shipment views dan types terkait | Mendalam statis errors/payload/actions dan contracts backend; BUG-15/19/11 | Label/error semantics diperiksa source; preservation upload/File dan focus memerlukan browser |
| Pages (77 termasuk JSON), components (58), layouts (10), hooks (8), lib (2), contexts (1), types (6) | Inventaris struktur; shared pagination, header/footer/support, money dan consumers relevan diperiksa statis | Banyak body komponen UI dasar/CRUD/dashboard/auth/hooks belum lengkap; bukan 77 halaman lolos QA |
| `resources/css/app.css`, `resources/views/app.blade.php`, entrypoint app/SSR, build config | Struktur dan kontrak Inertia/assets/styles | Tidak menyimpulkan fidelity/responsive/hydration/SSR dari source saja |
| `tests/` (29 file: 26 Feature + 1 Unit + Pest/TestCase) | Inventaris semua tests, setup/trait/config diperiksa; assertions shipping/manual payment/Midtrans/product/tracking relevan ditelaah | Seluruh assertion suite belum dibaca lengkap/dieksekusi. Bukan 29 tests dari referensi sudah diport |
| `config/` (13), manifest/lockfile, PHPUnit/ESLint/Prettier/TypeScript/Vite dan `.github/workflows/` | Struktur/metadata build/testing/integrasi; isolation dan script aktual dicatat | Tidak membaca `.env`/credentials; effective runtime/deployment tidak diketahui |

Tidak ditemukan direktori first-party `app/Policies`, `app/Events`, `app/Listeners`, `app/Mail`, atau `app/Notifications` pada inventaris. Tidak berarti Laravel tidak mempunyai event/mail; alur notifikasi lokal memakai service dan auth framework. Estimator produk dan public contact setara referensi juga tidak ditemukan; diklasifikasikan fitur, bukan bug otomatis.

### Cakupan lampiran referensi

| Kelompok referensi | Hasil pemetaan |
| --- | --- |
| Bagian 1-3, konteks dan ringkasan perubahan | Dibedakan dari baseline lokal. Statistical commit/source history tidak direkonstruksi karena kedua objek Git tidak tersedia |
| Bagian checkout/voucher/money/payment/Snap (4-5 dan kontrak terkait) | REF pada matriks memetakan perilaku, bukan nama file. Manual checkout lokal tetap aktif; dormant Snap diberi syarat, legacy endpoint/scheduler tetap masuk risiko |
| Biteship/fulfillment/settings/product/frontend (6-9) | Pemetaan source lokal, caller dan kontrak tersedia di matriks/detail; absence contact/estimator/variant dimensions tidak dianggap bug |
| Kontrak, tests, risiko endpoint, prioritas dan risiko tersisa (10-15) | Mapped ke acceptance per BUG, OPS, opsi dan batas verification. Kelemahan referensi tidak diadopsi sebagai kontrak benar |
| 36 path backend non-build lampiran | Dipetakan secara fungsional ke service/action/request/controller/model/schema lokal di atas; nama/arsitektur berbeda tidak dipaksakan. Contact/estimator tak tersedia tetap fitur opsional |
| 31 path frontend non-build lampiran | Konteks checkout, produk, admin workflow, tracking dan shared pagination dipetakan; 12 caller pagination dibedakan, 11 admin index menggunakan raw label HTML. Belum terbukti label dikuasai penyerang. Contact absen, layout/branding bukan bug |
| 29 path tests referensi | Dipetakan sebagai perilaku acceptance, bukan klaim test file referensi ada lokal. Jumlah 29 file tests lokal kebetulan sama tetapi komposisinya berbeda, termasuk setup files |
| 6 dokumen/binary dan 170 entri generated build referensi | Inventaris metadata saja; transkrip, screenshot binary, bundle hasil build tidak dibaca sebagai source implementasi atau disalin |

### Pemeriksaan eksplisit kelemahan referensi

- **Voucher/hash:** perubahan voucher pada referensi tidak otomatis menyelaraskan binding lama. BUG-02 mengusulkan satu kontrak hash ongkir independen diskon dengan preserve selection; bukan menyalin penghapusan session invalidate tanpa perbaikan hash.
- **Dimensi 0/inactive/null:** backend/frontend lokal harus tetap diperiksa menurut root-product schema. Tidak menganggap validator varian referensi benar atau menambahkan kolom varian hanya untuk menirunya. Rate/koordinat finite dibahas BUG-13; ekspansi schema/validator fitur di OPSIONAL-01.
- **Import Search:** detail produk lokal tidak mempunyai import Search yang dimaksud kelemahan referensi. Tidak ada patch penghapusan import yang diperlukan di sana.
- **Bundle stale:** referensi sendiri memperingatkan mismatch source/build. Lokal belum terverifikasi, bukan otomatis stale; OPS-03 meminta bukti manifest/deployment setelah implementasi.
- **Provider uncertain:** timeout/5xx/malformed/duplicate bukan bukti sukses atau reject. Usulan BUG-07/08/09 mempertahankan state/reconciliation, tidak melepas stok atau retry booking otomatis hanya karena response tak pasti.

### Dikecualikan dari audit source

`vendor`, `node_modules`, `.git` contents selain operasi Git read-only, cache/log/runtime storage, binary/media, transkrip/sesi, `.env`/credentials, dan generated bundles. Wayfinder generated helpers dan manifest diperiksa sebatas kontrak/metadata terkait delivery; bukan source untuk dipindahkan. Tidak ada provider pembayaran/pengiriman yang dihubungi.

### Pertanyaan terbuka dan bukti yang diperlukan

1. Adakah order/payment Midtrans legacy nonfinal atau webhook masih aktif? Perlu agregat tersanitasi dari operator; tidak perlu dump data/credential. Menentukan urgensi operasional BUG-04/07/08/20, bukan menghapus cacat source-nya.
2. Engine DB/isolation level produksi, dukungan savepoint, cache lock antar-worker dan jalur deployment apa yang dipakai? Perlu konfigurasi tersanitasi dan DB disposable setara untuk menguji transaksi/concurrency.
3. Apa response/status authoritative Midtrans/Biteship untuk confirmed not-found, rejection, duplicate/uncertain, dan reference/amount? Perlu dokumentasi kontrak provider serta fixture/sandbox berizin. Audit ini tidak memverifikasi dokumentasi online/provider terkini.
4. Apakah operator boleh override kurir pilihan customer, dan dalam kondisi apa? Perlu kebijakan bisnis; jangan menghapus kemampuan atau mengganti biaya diam-diam.
5. Apakah store phone, payment WhatsApp, support, shipper/origin sengaja berbeda? Apakah fallback lokal masih dimiliki bisnis? Perlu konfirmasi pemilik; laporan tidak menyalin nomor/alamat referensi atau menampilkan nilai rahasia.
6. Berapa banyak order historis tanpa snapshot fisik atau dengan nominal pecahan, dan bagaimana rekonsiliasinya? Perlu statistik sintetis/tersanitasi dan aturan bisnis sebelum perubahan money/fallback; tidak ada backfill otomatis dalam rencana wajib.
7. Adakah booking uncertain/pending receipt existing yang memerlukan recovery? Perlu daftar ID tersanitasi, status provider terverifikasi, dan dry-run berizin sebelum replay operasional.
8. Asset mana yang benar-benar dilayani deployment, apakah SSR digunakan, dan apakah cron/queue menjalankan job existing? Perlu bukti deploy/HTTP tersanitasi, bukan hanya timestamp Git/manifest.

### Checklist sisa pekerjaan: audit tetap parsial

- [ ] Baca seluruh body first-party CRUD/service/controller/request/model yang baru diinventarisasi, termasuk report/export/media/auth yang tidak terdampak langsung.
- [ ] Baca seluruh body komponen/layout/hooks dan seluruh assertion tests yang belum ditelaah; perluas matriks bila ditemukan perilaku alternatif yang mengubah kesimpulan.
- [ ] Setelah runner aman, reproduksi 21 BUG dan ubah status bukti dari static-confirmed hanya jika ada hasil runtime yang terdokumentasi; catat temuan yang terbantahkan juga.
- [ ] Uji semua caller pagination dan alur admin/customer secara rendered, ukuran mobile/desktop, keyboard/screen-reader dan preservation draft/File.
- [ ] Jalankan concurrency pada DB disposable engine produksi, HTTP fake failure matrix, serta sandbox provider berizin; jangan memakai DB produksi aktif.
- [ ] Buktikan source/build/Wayfinder/manifest/deployment, scheduler/worker/locks dan recovery receipt sesuai rencana release.
- [ ] Tutup pertanyaan bisnis/legacy data dan sembilan butir BELUM TERVERIFIKASI; jangan mengganti status hanya karena implementasi mirip referensi.

### Batas perubahan artefak

Satu-satunya artefak audit yang ditambahkan adalah `audit-perbandingan-dan-rencana-perbaikan.md`. File referensi untracked existing dipertahankan. Tidak ada perbaikan source/tests/config/schema, generator/build, dependency, database, atau riwayat Git yang diterapkan. Hasil pemeriksaan status/diff akhir dicatat sebagai verifikasi scope, bukan verifikasi perilaku aplikasi.

Pemeriksaan akhir: branch/HEAD tetap seperti baseline; `git diff --stat` dan `git diff --cached --stat` kosong; `git diff --check` tidak melaporkan masalah tracked. `git status --short` hanya menampilkan dua file untracked: laporan baru dan referensi existing. SHA-256 referensi tetap sama dengan baseline. Validasi laporan terpisah menemukan 130 ID REF unik, 21 judul BUG, delapan bagian utama, fence berpasangan, dan tanpa trailing whitespace; `git diff --check` sendiri tidak memeriksa file untracked.
