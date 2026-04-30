# PRD 02 — Catalog, Product, Variant, Stock Management

## Scope

PRD ini mencakup fitur catalog management yang harus dikerjakan satu paket: product, product image, product variant, stock, category, dan collection. Jangan memisahkan product dari variant/stock karena produk tidak bisa dibeli tanpa varian dan stok.

## Dependency

Harus dikerjakan setelah PRD 01 karena membutuhkan admin auth, layout, shared components, route convention, dan validation pattern.

## 8. Modul 3 — Product Management

### 8.1 Deskripsi

Modul Product Management digunakan untuk mengelola produk utama yang tampil di katalog customer.

Database utama:

```text
products
product_images
product_variants
categories
collections
```

Tabel `products` menyimpan data utama produk seperti kategori, koleksi, nama, slug, SKU, deskripsi, material, harga, berat, dimensi, status, label featured/new arrival/best seller, serta metadata SEO.

### 8.2 Halaman

```text
/admin/products
/admin/products/create
/admin/products/{id}/edit
/admin/products/{id}
```

### 8.3 Product List

#### Kolom Tabel

1. Thumbnail.
2. Product name.
3. SKU.
4. Category.
5. Collection.
6. Base price.
7. Sale price.
8. Total stock.
9. Status.
10. Featured.
11. New arrival.
12. Best seller.
13. Created at.
14. Actions.

#### Filter

1. Search by name/SKU.
2. Category.
3. Collection.
4. Status:
   - draft
   - published
   - archived
5. Stock status:
   - in stock
   - low stock
   - sold out
6. Featured.
7. New arrival.
8. Best seller.

#### Actions

1. View.
2. Edit.
3. Duplicate.
4. Archive.
5. Publish.
6. Delete, jika belum pernah ada order.

### 8.4 Create/Edit Product Form

#### Field

1. Product name.
2. Slug.
3. SKU.
4. Category.
5. Collection.
6. Short description.
7. Description.
8. Material.
9. Care instruction.
10. Base price.
11. Sale price.
12. Weight.
13. Length.
14. Width.
15. Height.
16. Status.
17. Featured.
18. New Arrival.
19. Best Seller.
20. Meta title.
21. Meta description.

#### Validasi

- `name` wajib.
- `slug` wajib dan unique.
- `base_price` wajib dan minimal 0.
- `sale_price` tidak boleh lebih besar dari `base_price`.
- `weight` wajib minimal 1 gram jika produk published.
- `status` hanya boleh `draft`, `published`, atau `archived`.
- Produk published minimal harus memiliki:
  - satu gambar utama,
  - satu varian aktif,
  - stok valid,
  - harga valid.

### 8.5 Product Detail Admin

Tampilkan:

1. Informasi utama produk.
2. Galeri gambar.
3. Daftar varian.
4. Riwayat stok.
5. Riwayat order yang mengandung produk ini.
6. SEO preview.
7. Status publish.

### 8.6 Acceptance Criteria

- Admin dapat membuat produk.
- Admin dapat mengedit produk.
- Admin dapat mengubah status produk.
- Produk draft tidak tampil di customer catalog.
- Produk published tampil di customer catalog.
- Produk archived tidak tampil di customer catalog.
- Admin tidak boleh menghapus produk yang sudah pernah masuk order; gunakan archive.

---

## 9. Modul 4 — Product Image Management

### 9.1 Deskripsi

Modul ini digunakan untuk mengelola foto produk.

Database:

```text
product_images
```

Tabel `product_images` menyimpan `image_url`, `alt_text`, `sort_order`, dan `is_primary` untuk menentukan galeri dan gambar utama produk.

### 9.2 Fitur

1. Upload multiple images.
2. Set primary image.
3. Edit alt text.
4. Sort image order.
5. Delete image.
6. Preview image.

### 9.3 Validasi

- Format file: jpg, jpeg, png, webp.
- Maksimum ukuran file sesuai setting, misalnya 2 MB.
- Minimal 1 gambar untuk produk published.
- Hanya boleh 1 gambar primary per produk.

### 9.4 Acceptance Criteria

- Admin dapat upload beberapa gambar.
- Admin dapat memilih gambar utama.
- Gambar utama tampil di katalog.
- Urutan gambar mengikuti `sort_order`.

---

## 10. Modul 5 — Product Variant Management

### 10.1 Deskripsi

Modul ini digunakan untuk mengelola varian produk seperti warna, ukuran, SKU, harga tambahan, dan stok.

Database:

```text
product_variants
stock_logs
```

Tabel `product_variants` menyimpan SKU unik, warna, ukuran, harga tambahan, stok, reserved stock, image URL, dan status aktif varian.

### 10.2 Halaman

```text
/admin/products/{product}/variants
/admin/product-variants/{id}/edit
```

### 10.3 Field Varian

1. SKU.
2. Color name.
3. Color hex.
4. Size.
5. Additional price.
6. Stock.
7. Reserved stock.
8. Image.
9. Active status.

### 10.4 Variant List

Kolom:

1. SKU.
2. Color.
3. Size.
4. Additional price.
5. Stock.
6. Reserved stock.
7. Available stock.
8. Status.
9. Actions.

Available stock:

```text
stock - reserved_stock
```

### 10.5 Actions

1. Add variant.
2. Edit variant.
3. Disable variant.
4. Adjust stock.
5. View stock logs.

### 10.6 Validasi

- SKU wajib unique.
- Stock tidak boleh negatif.
- Reserved stock tidak boleh lebih besar dari stock.
- Color hex harus valid jika diisi.
- Varian yang sudah pernah dibeli tidak boleh dihapus permanen, hanya disable.

### 10.7 Acceptance Criteria

- Admin dapat membuat varian.
- Admin dapat mengubah stok.
- Perubahan stok tercatat di `stock_logs`.
- Varian nonaktif tidak tampil di customer.
- Customer hanya bisa membeli varian aktif dengan available stock > 0.

---

## 11. Modul 6 — Stock Management

### 11.1 Deskripsi

Modul ini digunakan untuk monitoring dan audit stok produk.

Database:

```text
product_variants
stock_logs
```

Tabel `stock_logs` menyimpan tipe perubahan stok seperti `in`, `out`, `adjustment`, `order`, dan `cancellation`, termasuk jumlah, stok sebelum, stok sesudah, referensi, dan catatan.

### 11.2 Halaman

```text
/admin/stock
/admin/stock/logs
/admin/product-variants/{id}/stock-adjustment
```

### 11.3 Fitur

1. Melihat semua stok varian.
2. Filter stok rendah.
3. Filter sold out.
4. Manual stock adjustment.
5. Riwayat perubahan stok.
6. Export stock report.

### 11.4 Stock Adjustment Form

Field:

1. Variant.
2. Type:
   - in
   - out
   - adjustment
3. Quantity.
4. Note.

### 11.5 Rule Stok

Saat admin adjustment:

```text
stock_after = stock_before + quantity
```

Untuk pengurangan, quantity bisa negatif atau menggunakan type `out`.

### 11.6 Acceptance Criteria

- Setiap perubahan stok tercatat.
- Admin dapat melihat stok sebelum dan sesudah.
- Admin tidak dapat membuat stok menjadi negatif.
- Stok order harus otomatis tercatat ketika pembayaran berhasil.

---

## 12. Modul 7 — Category Management

### 12.1 Deskripsi

Modul untuk mengelola kategori produk.

Database:

```text
categories
products
```

Tabel `categories` menyimpan nama, slug, deskripsi, gambar, dan status aktif.

### 12.2 Halaman

```text
/admin/categories
/admin/categories/create
/admin/categories/{id}/edit
```

### 12.3 Field

1. Name.
2. Slug.
3. Description.
4. Image.
5. Active status.

### 12.4 Tabel List

Kolom:

1. Image.
2. Name.
3. Slug.
4. Total products.
5. Active status.
6. Created at.
7. Actions.

### 12.5 Validasi

- Name wajib.
- Slug wajib unique.
- Kategori yang masih memiliki produk tidak boleh dihapus permanen.
- Jika kategori nonaktif, produk tetap ada tetapi kategori tidak tampil di filter customer.

### 12.6 Acceptance Criteria

- Admin dapat membuat kategori.
- Admin dapat edit kategori.
- Admin dapat menonaktifkan kategori.
- Admin dapat melihat jumlah produk per kategori.

---

## 13. Modul 8 — Collection Management

### 13.1 Deskripsi

Modul untuk mengelola koleksi atau campaign produk seperti “Ramadan Collection”, “Hajj Series”, atau “New Arrival”.

Database:

```text
collections
products
```

Tabel `collections` memiliki field `banner_desktop_url`, `banner_mobile_url`, `is_featured`, dan `is_active`, sehingga cocok untuk halaman campaign/koleksi.

### 13.2 Halaman

```text
/admin/collections
/admin/collections/create
/admin/collections/{id}/edit
```

### 13.3 Field

1. Name.
2. Slug.
3. Description.
4. Banner desktop.
5. Banner mobile.
6. Featured status.
7. Active status.

### 13.4 Fitur

1. CRUD collection.
2. Assign produk ke collection dari form product.
3. Preview collection landing page.
4. Set featured collection untuk homepage.

### 13.5 Acceptance Criteria

- Admin dapat membuat koleksi.
- Admin dapat upload banner desktop dan mobile.
- Koleksi aktif bisa tampil di customer.
- Koleksi featured bisa tampil di homepage.

---
