# Admin Task Implementation Plan

## Tujuan

Merapikan beberapa flow admin: filter tanggal, table selection, product detail/form, payment search, shipment label redirect, dan integrasi Tiptap editor.

## File Utama Yang Akan Diedit

- `resources/js/pages/admin/dashboard.tsx`
- `app/Services/Admin/DashboardService.php`
- `resources/js/pages/admin/products/index.tsx`
- `resources/js/pages/admin/product-variants/index.tsx`
- `resources/js/pages/admin/categories/index.tsx`
- `resources/js/pages/admin/collections/index.tsx`
- `resources/js/pages/admin/orders/index.tsx`
- `resources/js/pages/admin/payments/index.tsx`
- `app/Http/Controllers/Admin/PaymentController.php`
- `resources/js/pages/admin/shipments/show.tsx`
- `resources/js/pages/admin/products/show.tsx`
- `resources/js/pages/admin/products/form.tsx`
- `package.json`

## File Pendukung Yang Mungkin Perlu Dicek

- `app/Http/Controllers/Admin/DashboardController.php`
- `app/Http/Controllers/Admin/OrderController.php`
- `app/Http/Controllers/Admin/ProductController.php`
- `routes/web.php`
- `resources/js/components/ui/input.tsx`
- `resources/js/components/ui/button.tsx`
- `resources/js/components/ui/textarea.tsx`
- `resources/css/app.css`

## 1. Dashboard Filter Rentang Tanggal

### Target

Filter dashboard bisa memakai `date_from` dan `date_to`, bukan hanya data default.

### File Diedit

- `resources/js/pages/admin/dashboard.tsx`
- `app/Services/Admin/DashboardService.php`

### Langkah

1. Tambah tipe `filters` pada props dashboard:
   - `date_from: string`
   - `date_to: string`
2. Tambah form filter tanggal di header dashboard.
3. Gunakan `router.get('/admin/dashboard', filters, { preserveState: true, replace: true })`.
4. Tambah reset filter untuk kembali ke default.
5. Update service dashboard agar semua query summary/chart/list memakai rentang tanggal.
6. Validasi backend input tanggal memakai `$request->date()` atau validasi ringan sesuai pola existing.
7. Pastikan `date_to` mencakup akhir hari bila query pakai timestamp.

### Catatan Implementasi

- `DashboardController.php` hanya pass-through ke `DashboardService`, kemungkinan tidak perlu diubah.
- Jika service sekarang memakai hari ini/default period, ubah menjadi:
  - default `date_from` = awal hari ini / sesuai logic existing
  - default `date_to` = akhir hari ini / sesuai logic existing
  - bila request ada tanggal, gunakan tanggal user.

## 2. Product Index Hapus Import Export

### Target

Button import/export pada index product dihapus.

### File Diedit

- `resources/js/pages/admin/products/index.tsx`

### Langkah

1. Hapus button `Import` dan `Export` di header/action area.
2. Hapus import icon `Download` dan `Upload` jika tidak dipakai lagi.
3. Cek apakah ada export/import dropdown lain di bagian bawah table; hapus hanya yang terkait import/export product.

### Catatan Implementasi

- Search existing: `Download`, `Upload`, teks `Import`, `Export` ada di file ini.
- Jangan hapus action product seperti edit/show/publish/archive/duplicate/delete.

## 3. Hapus Checkbox Table Product, Variant, Categories, Collections

### Target

Tidak ada checkbox select all/select row di table index:

- Products
- Product Variants
- Categories
- Collections

### File Diedit

- `resources/js/pages/admin/products/index.tsx`
- `resources/js/pages/admin/product-variants/index.tsx`
- `resources/js/pages/admin/categories/index.tsx`
- `resources/js/pages/admin/collections/index.tsx`

### Langkah Umum

1. Hapus import `Checkbox` dari `@/components/ui/checkbox`.
2. Hapus state `selected`.
3. Hapus computed `allSelected`.
4. Hapus function `toggleAll` dan `toggleOne`.
5. Hapus table header column checkbox.
6. Hapus table body cell checkbox.
7. Hapus selected bulk/action banner jika ada.
8. Sesuaikan `colSpan` empty state bila jumlah kolom berubah.
9. Pastikan hover/action row tetap jalan.

### Catatan Per File

- `products/index.tsx`: ada selected banner dan beberapa reference `selected.length`; bersihkan semua.
- `product-variants/index.tsx`: checkbox ada di header/body; cek `selected.includes`.
- `categories/index.tsx`: selected banner + checkbox.
- `collections/index.tsx`: selected banner + checkbox.

## 4. Perbaiki Input Filter Dates Di Index Order

### Target

Filter tanggal order lebih stabil untuk `date_from` dan `date_to`.

### File Diedit

- `resources/js/pages/admin/orders/index.tsx`
- `app/Http/Controllers/Admin/OrderController.php` jika backend belum benar.

### Langkah

1. Review input `type="date"` existing pada bagian `Dates`.
2. Pastikan value selalu string kosong bila null/undefined.
3. Pastikan `date_from` dan `date_to` dikirim bersama filter lain tanpa menghapus filter aktif.
4. Tambah validasi prevent invalid range di UI atau biarkan backend handle, minimal jangan crash.
5. Jika backend query belum pakai inclusive range:
   - `whereDate('created_at', '>=', date_from)`
   - `whereDate('created_at', '<=', date_to)`
6. Update reset tanggal bila user clear input.

### Catatan Implementasi

- Existing props sudah punya `date_from` dan `date_to`.
- Fokus perbaikan kemungkinan di UX submit/perubahan langsung, formatting value, dan inclusive filter.

## 5. Index Payments Ubah Jadi Search By Order

### Target

Search/filter utama payment berdasarkan order number.

### File Diedit

- `resources/js/pages/admin/payments/index.tsx`
- `app/Http/Controllers/Admin/PaymentController.php`

### Langkah Frontend

1. Tambah field `order` atau `order_number` ke `useForm` payment filter.
2. Tambah input search dengan label jelas: `Search Order` / `Nomor Order`.
3. Placeholder: `Cari nomor order...`.
4. Submit GET `/admin/payments` tetap preserve state.
5. Pastikan reset menghapus search order.

### Langkah Backend

1. Di `PaymentController@index`, join/where relation order bila belum ada.
2. Filter payment berdasarkan `orders.order_number` atau relation `order.order_number`.
3. Pertahankan filter existing: status, method, date range, amount min/max.
4. Pastikan query eager load order agar tidak N+1.

### Catatan Implementasi

- Existing FE punya `Payment.order_number` di row.
- Existing `useForm` belum terlihat punya `search/order_number`.

## 6. Show Shipments: Button Cetak Resi Redirect Ke Biteship

### Target

Button `Cetak Resi Biteship` redirect ke URL label Biteship, bukan membuat print lokal.

### File Diedit

- `resources/js/pages/admin/shipments/show.tsx`

### Langkah

1. Gunakan `shipment.label_url` sebagai target redirect/open.
2. Ubah button utama `Cetak Resi Biteship` menjadi link eksternal:
   - `asChild` + `<a href={labelUrl} target="_blank" rel="noreferrer">`
   - atau `window.open(labelUrl, '_blank', 'noopener,noreferrer')`.
3. Jika `label_url` kosong, disable button seperti existing behavior.
4. Hapus/abaikan pemanggilan `printBiteshipLabel` untuk button Biteship.
5. Pertahankan `Cetak Resi Lokal` bila masih dibutuhkan untuk fallback lokal.

### Catatan Implementasi

- `getLabelUrl(shipment)` sudah ada.
- `printBiteshipLabel(shipment)` sekarang membuat HTML lokal; ini hanya untuk lokal/fallback, bukan Biteship redirect.

## 7. Product Show Hapus SEO, Ubah Jadi Care And Materials

### Target

Detail product tidak menampilkan SEO metadata. Section tersebut menjadi `Care & Materials`.

### File Diedit

- `resources/js/pages/admin/products/show.tsx`

### Langkah

1. Hapus render `meta_title` dan `meta_description` dari UI show product.
2. Ubah title section dari `Care & SEO` menjadi `Care & Materials`.
3. Tampilkan `material` dan `care_instruction` di section tersebut.
4. Jika `material` saat ini sudah tampil di overview/spec card lain, hindari duplikasi berlebihan atau pindahkan ke section baru.
5. Update conditional render agar section muncul bila ada `material` atau `care_instruction`.
6. Tipe `Product` boleh tetap menyimpan `meta_title/meta_description` bila backend masih mengirim, tapi tidak dirender.

### Catatan Implementasi

- Existing lines terkait: section `Care & SEO`, fields `care_instruction`, `meta_title`, `meta_description`.

## 8. Product Description Pakai Tiptap Editor React

### Target

Input deskripsi product berubah dari textarea biasa menjadi rich text custom berbasis Tiptap React.

### File Diedit

- `resources/js/pages/admin/products/form.tsx`
- `package.json`
- Kemungkinan `resources/css/app.css`

### Dependency

Tambahkan dependency bila belum ada:

- `@tiptap/react`
- `@tiptap/starter-kit`
- Opsional: `@tiptap/extension-placeholder`
- Opsional: `@tiptap/extension-link`

### Langkah

1. Install dependency Tiptap.
2. Buat komponen editor lokal di `products/form.tsx` atau komponen reusable baru bila perlu.
3. Ganti field `description` dari `<Textarea>` menjadi `<ProductDescriptionEditor />`.
4. Editor menerima props:
   - `value: string`
   - `onChange: (html: string) => void`
   - `error?: string`
5. Gunakan `useEditor` dan `EditorContent`.
6. Update `setData('description', html)` saat editor update.
7. Pastikan initial value dari `product?.description` masuk ke editor saat edit.
8. Tambah toolbar minimal:
   - bold
   - italic
   - bullet list
   - ordered list
   - heading / paragraph
   - clear formatting
9. Styling editor mengikuti card/form existing Tailwind.
10. Pastikan HTML hasil Tiptap tetap compatible dengan show product yang render `dangerouslySetInnerHTML`.
11. Jika backend validasi description membatasi plain text, sesuaikan agar menerima HTML aman.

### Catatan Implementasi

- Existing product show sudah render `description` sebagai HTML.
- `package.json` belum punya Tiptap dependency.
- Perlu jalankan install package sebelum implement penuh.

## Urutan Pengerjaan Disarankan

1. Hapus import/export product.
2. Hapus checkbox di 4 table index.
3. Perbaiki dates order index.
4. Ubah payment search by order.
5. Ubah shipment Biteship print redirect.
6. Ubah product show `Care & Materials`.
7. Dashboard date range filter.
8. Tiptap editor product description.

## Validasi

Jalankan setelah implement:

```bash
npm run types:check
npm run lint:check
npm run build
php artisan test
```

Jika test suite terlalu besar, minimal validasi manual halaman:

- `/admin/dashboard`
- `/admin/products`
- `/admin/product-variants`
- `/admin/categories`
- `/admin/collections`
- `/admin/orders`
- `/admin/payments`
- `/admin/shipments/{id}`
- `/admin/products/{id}`
- `/admin/products/create`
- `/admin/products/{id}/edit`

## Risiko

- Date range dashboard bisa mengubah angka summary secara signifikan jika default period berubah.
- Payment search perlu query order relation yang benar agar tidak konflik dengan filter Midtrans.
- Menghapus checkbox harus ikut menghapus semua state selected agar TypeScript bersih.
- Redirect label Biteship tergantung `shipment.label_url`; perlu fallback disabled bila null.
- Tiptap menyimpan HTML; validasi/backend sanitasi perlu dipastikan agar aman dan tidak memotong tag.
