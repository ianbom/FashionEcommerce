# Fitur Tambahan

## Admin Shipping Settings

- Input `Store Postal Code` menjadi input utama untuk konfigurasi origin pengiriman.
- Province, city, district, dan `Origin Biteship Area ID` otomatis terisi dari hasil pencarian area Biteship berdasarkan postal code.
- Field origin otomatis dibuat readonly agar data origin konsisten dengan Area ID Biteship.
- Latitude dan longitude toko dipilih lewat map Leaflet, termasuk opsi gunakan lokasi saat ini.
- Payload settings dinormalisasi menjadi teks sebelum disimpan agar validasi Laravel tidak gagal saat postal code dari Biteship berbentuk angka.
