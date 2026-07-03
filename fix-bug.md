# Fix Bug: Biteship Create Order Courier Price Not Found

## Masalah

Create shipment dari halaman admin shipment detail gagal saat submit ke:

```text
POST /admin/orders/{order}/shipments
```

Error Biteship:

```text
Courier price is not found. Please check your origin and destination location.
```

## Penyebab

Analisis awal menemukan payload Create Order Biteship memakai field koordinat flat:

```text
origin_latitude
origin_longitude
destination_latitude
destination_longitude
```

Padahal dokumentasi Biteship Create Order meminta bentuk nested:

```text
origin_coordinate: { latitude, longitude }
destination_coordinate: { latitude, longitude }
```

Untuk courier instant/same_day, koordinat wajib. Karena payload shape salah, Biteship tidak menemukan harga courier.

Setelah diuji ulang, error masih terjadi untuk `anteraja/same_day` dan `paxel`, sedangkan `jne` berhasil. Ini bukan bug JNE, tetapi bug validasi rate untuk courier same-day/instant dan courier yang sangat bergantung pada area layanan.

- Admin Create Order memakai data shipment/rate yang sudah tersimpan tanpa validasi ulang ke Rates API.
- `raw_rate_response` untuk Anteraja berisi layanan same day area Jakarta, sementara origin dan destination order berada di Surabaya.
- Paxel dan Anteraja lebih sensitif terhadap coverage area, koordinat, area ID, dan collection method dibanding courier reguler.
- Biteship Create Order mencari harga final dari origin/destination saat order dibuat. Jika `courier_company`, `courier_type`, harga, atau lokasi aktual tidak cocok dengan rate aktif, Biteship mengembalikan `Courier price is not found`.
- Untuk Paxel, rate package tier seperti `medium` juga bergantung pada dimensi paket. Order #5 memakai item `36 x 28 x 8 cm`, sementara rate tersimpan `Medium (30 x 20 x 12 cm) Package Shipment`.
- Bug Paxel terjadi karena Rates API sebelumnya tidak menerima `length`, `width`, dan `height`, sedangkan Create Order mengirim dimensi aktual. Akibatnya rate `paxel/medium` bisa tersimpan, tetapi Create Order tidak menemukan harga yang cocok.
- Courier reguler seperti JNE tetap berhasil karena tersedia untuk rute tersebut.

Contoh request yang gagal:

```json
{
  "courier_company": "anteraja",
  "courier_type": "same_day",
  "courier_service_name": "Same Day",
  "estimated_delivery": "8 - 12 hours",
  "waybill_id": ""
}
```

Request ini terlihat valid dari form admin, tetapi belum tentu valid menurut Rates API saat Create Order dilakukan. Karena itu backend tidak boleh langsung percaya field courier dari form atau `raw_rate_response` lama.

## Perbaikan

- Ubah payload create order di `app/Services/Admin/ShipmentManagementService.php`.
- Kirim `origin_coordinate` dan `destination_coordinate` sesuai dokumentasi Biteship.
- Tetap kirim postal code dan area ID jika tersedia.
- Tambahkan `origin_collection_method` dari `raw_rate_response.available_collection_method`, default `pickup`.
- Tambahkan validasi lokal untuk courier `instant` / `same_day` supaya origin dan destination coordinate wajib sebelum request ke Biteship.
- Perbaiki akses optional field `courier_service_name` dan `estimated_delivery` agar tidak memicu undefined array key.
- Tambahkan `origin_area_id` dan `destination_area_id` saat mengambil Rates API.
- Area ID dan koordinat sekarang wajib untuk origin dan destination sebelum mengambil Rates API atau membuat Order Biteship.
- Postal code tetap dikirim sebagai data pendukung, tetapi tidak lagi menjadi fallback jika Area ID atau koordinat kosong.
- Customer/admin address baru wajib memiliki `biteship_area_id`, `latitude`, dan `longitude`.
- Saat admin membuat order Biteship, refresh Rates API terlebih dahulu memakai alamat dan item order aktual.
- Kirim dimensi item (`length`, `width`, `height`) ke Rates API agar hasil rate sama dengan payload Create Order.
- Samakan berat item Rates API dan Create Order sebagai berat per unit, bukan total quantity ganda.
- Create Order hanya dilanjutkan jika fresh rate cocok dengan `courier_company`, `courier_type`, `courier_service_name`, dan harga order.
- Jika fresh rate tidak ditemukan, request `/v1/orders` tidak dikirim; shipment ditandai `failed` dengan pesan lokal: `Kurir tidak tersedia untuk alamat ini. Pilih ulang ongkir atau gunakan kurir lain.`
- Jika Paxel package tier tidak cocok dengan dimensi barang, request `/v1/orders` tidak dikirim; shipment ditandai `failed` dengan pesan lokal: `Paket tidak sesuai dengan layanan Paxel yang dipilih. Pilih ulang ongkir.`
- Tambahkan field admin setting `origin_biteship_area_id` agar origin bisa dipetakan lebih presisi ke area Biteship.

Alur final untuk Paxel dan Anteraja:

1. Admin klik Create Order.
2. Backend validasi Area ID dan koordinat origin/destination untuk semua courier Biteship.
3. Jika `origin_biteship_area_id`, `store_latitude`, `store_longitude`, destination `biteship_area_id`, destination `latitude`, atau destination `longitude` kosong, proses berhenti sebelum request ke Biteship.
4. Backend request ulang ke Biteship Rates API dengan postal code, Area ID, koordinat, courier aktif, dan item order.
5. Backend cari rate yang benar-benar tersedia untuk courier yang dipilih.
6. Jika rate ditemukan, payload Create Order memakai data fresh rate tersebut.
7. Jika rate tidak ditemukan, backend menghentikan proses sebelum `/v1/orders` agar error Biteship tidak muncul lagi.

## Perbaikan Wajib Area ID + Coordinate

Untuk production, pengambilan ongkir dan pembuatan order Biteship sekarang memakai aturan ketat berikut:

```text
origin_area_id wajib
origin_latitude wajib
origin_longitude wajib
destination_area_id wajib
destination_latitude wajib
destination_longitude wajib
postal_code tetap dikirim sebagai pendukung
```

Dampak implementasi:

- `BiteshipService::shippingRates()` menolak request jika origin/destination Area ID atau koordinat kosong.
- Customer checkout tidak bisa mengambil rates jika alamat belum memiliki `biteship_area_id`, `latitude`, dan `longitude`.
- Customer/admin address baru wajib menyimpan `biteship_area_id`, `latitude`, dan `longitude`.
- Admin Create Order tidak boleh lanjut ke Rates API atau `/v1/orders` jika Area ID/koordinat origin atau destination belum lengkap.
- Existing data lama yang belum lengkap tidak dimigrasikan paksa; data tersebut akan diblokir saat dipakai untuk checkout atau shipment sampai dilengkapi.

## Perbaikan Khusus Paxel Dimension Tier

Paxel memakai tier paket seperti `small`, `medium`, atau `large`. Tier ini tidak cukup divalidasi dari area dan harga saja; dimensi barang juga harus sama antara Rates API dan Create Order.

Contoh bug order #5:

```text
Selected courier: paxel / medium / Medium Package
Selected rate description: Medium (30 x 20 x 12 cm) Package Shipment
Actual item dimension: 36 x 28 x 8 cm
```

Perbaikan:

- Checkout Rates API sekarang mengirim `length`, `width`, `height`, `weight`, dan `category` dari produk.
- Admin refresh Rates API sebelum Create Order juga mengirim dimensi dari order items.
- Payload Create Order memakai berat per unit yang sama dengan Rates API.
- Jika fresh Rates API tidak lagi mengembalikan `paxel/medium` untuk dimensi aktual, proses dihentikan sebelum `/v1/orders`.
- Admin akan mendapat pesan lokal: `Paket tidak sesuai dengan layanan Paxel yang dipilih. Pilih ulang ongkir.`
- Sistem tidak auto-upgrade ke tier Paxel lain karena harga order sudah dibayar customer.
## Test

Ditambahkan:

```text
tests/Feature/Admin/BiteshipCreateShipmentTest.php
tests/Feature/Customer/BiteshipShippingRateTest.php
tests/Feature/Customer/ManageAddressTest.php
```

Verifikasi:

```text
php artisan test tests\Feature\Customer\BiteshipShippingRateTest.php tests\Feature\Admin\BiteshipCreateShipmentTest.php tests\Feature\Customer\ManageAddressTest.php --compact
php artisan test --filter=Biteship --compact
php artisan test --filter=Order --compact
vendor\bin\pint --test app\Services\Integrations\BiteshipService.php app\Services\Admin\ShipmentManagementService.php app\Services\Customer\CheckoutService.php app\Http\Requests\Customer\UpsertAddressRequest.php app\Http\Requests\Admin\CustomerAddressRequest.php tests\Feature\Customer\BiteshipShippingRateTest.php tests\Feature\Admin\BiteshipCreateShipmentTest.php tests\Feature\Customer\ManageAddressTest.php
```

Hasil: semua pass.
