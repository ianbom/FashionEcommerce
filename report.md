# Codebase Audit Report

Tanggal audit: 2026-07-04

## Executive Summary

Audit ini berbasis analisis statis codebase, bukan testing. Fokus temuan: area yang berpotensi menyebabkan bug produksi, data hilang, checkout gagal, atau quality gate gagal saat CI/release.

Kondisi repo saat audit: worktree berisi banyak perubahan uncommitted dan file baru. Kesimpulan di bawah berlaku untuk state lokal saat ini.

## Findings

### 1. Medium - State produk detail rawan tidak sinkron

Evidence:
- `resources/js/pages/customer/products/detail-product.tsx:345-348` mengubah `selectedVariantId` dan `isWishlisted` di `useEffect`.
- `resources/js/pages/customer/products/detail-product.tsx:350-358` mengubah `quantity` dan `stockAlert` dari derived value.
- `resources/js/pages/customer/products/detail-product.tsx:360-376` mengubah form data dan `mainImage` dari state lain.
- `resources/js/pages/customer/products/detail-product.tsx:202` menghitung `addableStock`, tetapi nilainya tidak dipakai.

Impact:
- Saat produk, varian, gallery, atau wishlist berubah lewat Inertia navigation, UI bisa menampilkan gambar, quantity, alert stok, atau status wishlist yang tertinggal dari data terbaru.
- Synchronous state update di effect juga meningkatkan risiko render berantai dan behavior sulit diprediksi.

Recommendation:
- Kurangi state turunan. Hitung value seperti selected image, max quantity, dan alert eligibility dari `product`, `selectedVariant`, dan `quantity`.
- Pakai state hanya untuk input user yang benar-benar editable.
- Hapus `addableStock` bila tidak dipakai, atau gunakan untuk membatasi tombol tambah sesuai stok tersisa setelah isi cart.

### 2. Medium - Checkout bergantung pada koordinat yang mudah belum terisi

Evidence:
- `app/Services/Customer/CheckoutService.php:73-79` menolak alamat tanpa postal code atau koordinat.
- `app/Services/Integrations/BiteshipService.php:47-68` juga menolak konfigurasi toko tanpa postal code, latitude, dan longitude.

Impact:
- Customer tidak bisa mengambil ongkir bila alamat atau konfigurasi toko belum lengkap.
- Risiko ini biasanya muncul setelah deploy atau setelah admin mengubah setting toko, bukan saat compile.

Recommendation:
- Validasi koordinat toko di flow admin/settings sebelum checkout dipakai.
- Tampilkan status konfigurasi shipping yang eksplisit di admin.
- Pastikan buku alamat customer selalu menyimpan latitude dan longitude dari hasil Biteship area search, bukan input manual parsial.

### 3. Medium - Sync image produk bisa menghapus file jika payload parsial

Evidence:
- `app/Services/Admin/ProductImageService.php:17-20` hanya mempertahankan image yang punya stored URL atau file upload.
- `app/Services/Admin/ProductImageService.php:59-63` menghapus semua image product yang tidak ada di `$keptIds`.

Impact:
- Jika UI edit produk mengirim daftar image parsial, image yang tidak ikut payload akan dihapus dari database dan storage.
- Ini bisa menjadi data loss pada bug frontend, request retry yang tidak lengkap, atau perubahan form di masa depan.

Recommendation:
- Tegaskan kontrak request: field `images` harus full replacement.
- Bila kontraknya bukan full replacement, ganti mekanisme menjadi explicit delete IDs.
- Tambahkan guard agar payload kosong tidak otomatis menghapus seluruh gallery kecuali user memang memilih hapus semua.

### 4. Medium - Sync variant produk bisa menghapus atau menonaktifkan variant jika payload parsial

Evidence:
- `app/Services/Admin/ProductManagementService.php:239-249` mempertahankan variant hanya bila ID variant ikut payload.
- `app/Services/Admin/ProductManagementService.php:259-268` menonaktifkan variant yang punya order item, atau menghapus variant yang tidak punya order item.

Impact:
- Request edit produk yang tidak membawa semua variant dapat menonaktifkan atau menghapus variant aktif.
- Efeknya langsung ke katalog, stok, cart, dan checkout.

Recommendation:
- Dokumentasikan dan validasi bahwa update variant adalah full replacement.
- Untuk flow yang lebih aman, pakai explicit delete action per variant.
- Tolak payload variant kosong untuk produk yang sebelumnya punya variant, kecuali ada flag eksplisit seperti `replace_variants=true`.

### 5. Medium - Quality gate lint/style sedang tidak bersih

Evidence:
- `composer lint:check` sebelumnya menemukan banyak issue Pint.
- `npm run lint:check` sebelumnya menemukan banyak issue ESLint, termasuk di `taildashboard/`.
- Folder `taildashboard/` berisi app/frontend terpisah: `taildashboard/package.json`, `taildashboard/src`, `taildashboard/node_modules`.

Impact:
- CI/release bisa gagal walaupun aplikasi utama berjalan.
- Folder template atau app sampingan yang ikut lint root membuat sinyal error bercampur dengan aplikasi utama.

Recommendation:
- Putuskan status `taildashboard/`: production code, template, atau artifact.
- Jika bukan bagian aplikasi utama, exclude dari lint root atau pindahkan keluar repo.
- Bersihkan Pint/ESLint secara terpisah dari bugfix fungsional agar diff tetap kecil.

### 6. Low - Logging payment/order terlalu noisy

Evidence:
- `app/Services/Customer/OrderService.php:154` log `midtrans_order_id`.
- `app/Services/Customer/OrderService.php:161-165` log local cancellation detail.

Impact:
- Log produksi bisa penuh event operasional normal.
- `midtrans_order_id` bukan secret utama, tetapi tetap identifier transaksi yang sebaiknya tidak dilog tanpa konteks kebutuhan observability.

Recommendation:
- Turunkan log debug-only ke level `debug`, atau hapus jika tidak dipakai untuk incident handling.
- Untuk cancellation, log event bisnis yang terstruktur dan minim identifier sensitif.

## Verification Snapshot

Informasi ini hanya konteks tambahan, bukan dasar utama audit:
- `php artisan test --compact` sebelumnya pass: 70 tests, 367 assertions.
- `npm run types:check` sebelumnya pass.
- `composer lint:check` sebelumnya fail karena Pint style issues.
- `npm run lint:check` sebelumnya fail karena ESLint issues.

## Recommended Next Steps

1. Perbaiki kontrak update image dan variant lebih dulu karena berisiko data loss.
2. Kunci validasi konfigurasi shipping agar checkout tidak gagal di produksi.
3. Refactor state turunan di halaman detail produk.
4. Bersihkan quality gate lint/style, mulai dari menentukan nasib `taildashboard/`.
5. Kurangi log payment/order yang tidak diperlukan.

## Assumptions

- Audit dilakukan dari pembacaan kode dan metadata repo lokal.
- Tidak ada test baru yang dijalankan untuk membuat laporan ini.
- Temuan dengan severity Medium adalah risiko bug yang masuk akal, bukan bukti insiden produksi.
