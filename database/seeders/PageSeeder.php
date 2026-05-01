<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        DB::table('pages')->insert([
            // ─── Privacy Policy ──────────────────────────────────────────────────
            [
                'title'            => 'Kebijakan Privasi',
                'slug'             => 'privacy-policy',
                'content'          => $this->privacyPolicyContent(),
                'type'             => 'policy',
                'meta_title'       => 'Kebijakan Privasi — Auréa Syar\'i',
                'meta_description' => 'Pelajari bagaimana Auréa Syar\'i melindungi dan mengelola data pribadi pelanggan kami.',
                'is_active'        => true,
                'created_at'       => $now,
                'updated_at'       => $now,
            ],

            // ─── No Return Policy ────────────────────────────────────────────────
            [
                'title'            => 'Kebijakan Tidak Ada Pengembalian',
                'slug'             => 'no-return-policy',
                'content'          => $this->noReturnPolicyContent(),
                'type'             => 'policy',
                'meta_title'       => 'Kebijakan Pengembalian Barang — Auréa Syar\'i',
                'meta_description' => 'Informasi lengkap mengenai kebijakan pengembalian dan penukaran produk di Auréa Syar\'i.',
                'is_active'        => true,
                'created_at'       => $now,
                'updated_at'       => $now,
            ],

            // ─── Shipping Policy ─────────────────────────────────────────────────
            [
                'title'            => 'Kebijakan Pengiriman',
                'slug'             => 'shipping-policy',
                'content'          => $this->shippingPolicyContent(),
                'type'             => 'policy',
                'meta_title'       => 'Kebijakan Pengiriman — Auréa Syar\'i',
                'meta_description' => 'Informasi mengenai metode pengiriman, estimasi waktu, dan biaya pengiriman di Auréa Syar\'i.',
                'is_active'        => true,
                'created_at'       => $now,
                'updated_at'       => $now,
            ],

            // ─── Terms & Conditions ──────────────────────────────────────────────
            [
                'title'            => 'Syarat & Ketentuan',
                'slug'             => 'terms-conditions',
                'content'          => $this->termsContent(),
                'type'             => 'policy',
                'meta_title'       => 'Syarat & Ketentuan — Auréa Syar\'i',
                'meta_description' => 'Syarat dan ketentuan penggunaan layanan dan pembelian produk di Auréa Syar\'i.',
                'is_active'        => true,
                'created_at'       => $now,
                'updated_at'       => $now,
            ],

            // ─── About Us ────────────────────────────────────────────────────────
            [
                'title'            => 'Tentang Kami',
                'slug'             => 'about-us',
                'content'          => $this->aboutUsContent(),
                'type'             => 'about',
                'meta_title'       => 'Tentang Auréa Syar\'i — Fashion Muslimah Premium',
                'meta_description' => 'Auréa Syar\'i adalah brand fashion muslimah premium yang menghadirkan koleksi abaya, khimar, dan busana modest berkualitas tinggi.',
                'is_active'        => true,
                'created_at'       => $now,
                'updated_at'       => $now,
            ],

            // ─── FAQ ─────────────────────────────────────────────────────────────
            [
                'title'            => 'Pertanyaan yang Sering Diajukan',
                'slug'             => 'faq',
                'content'          => $this->faqContent(),
                'type'             => 'faq',
                'meta_title'       => 'FAQ — Auréa Syar\'i',
                'meta_description' => 'Temukan jawaban atas pertanyaan umum seputar produk, pemesanan, pembayaran, dan pengiriman di Auréa Syar\'i.',
                'is_active'        => true,
                'created_at'       => $now,
                'updated_at'       => $now,
            ],

            // ─── Care Guide ──────────────────────────────────────────────────────
            [
                'title'            => 'Panduan Perawatan Pakaian',
                'slug'             => 'care-guide',
                'content'          => $this->careGuideContent(),
                'type'             => 'guide',
                'meta_title'       => 'Panduan Perawatan — Auréa Syar\'i',
                'meta_description' => 'Tips dan panduan merawat produk fashion muslimah Auréa Syar\'i agar tetap awet dan indah.',
                'is_active'        => true,
                'created_at'       => $now,
                'updated_at'       => $now,
            ],

            // ─── Size Guide ──────────────────────────────────────────────────────
            [
                'title'            => 'Panduan Ukuran',
                'slug'             => 'size-guide',
                'content'          => $this->sizeGuideContent(),
                'type'             => 'guide',
                'meta_title'       => 'Panduan Ukuran — Auréa Syar\'i',
                'meta_description' => 'Tabel ukuran lengkap untuk membantu Anda memilih size yang tepat.',
                'is_active'        => true,
                'created_at'       => $now,
                'updated_at'       => $now,
            ],
        ]);
    }

    private function privacyPolicyContent(): string
    {
        return <<<HTML
<h2>1. Informasi yang Kami Kumpulkan</h2>
<p>Auréa Syar'i mengumpulkan informasi yang Anda berikan secara langsung, termasuk nama lengkap, alamat email, nomor telepon, alamat pengiriman, dan informasi pembayaran saat Anda melakukan pembelian atau mendaftar sebagai anggota.</p>

<h2>2. Penggunaan Informasi</h2>
<p>Informasi yang kami kumpulkan digunakan untuk memproses pesanan, mengirimkan konfirmasi pembelian, mengupdate status pengiriman, memberikan layanan pelanggan, serta mengirimkan informasi promosi (jika Anda menyetujuinya).</p>

<h2>3. Keamanan Data</h2>
<p>Kami berkomitmen menjaga keamanan data pribadi Anda. Semua transaksi pembayaran diproses melalui saluran terenkripsi menggunakan teknologi SSL. Kami tidak menyimpan informasi kartu kredit Anda di server kami.</p>

<h2>4. Berbagi Informasi</h2>
<p>Kami tidak menjual, memperdagangkan, atau memindahtangankan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali diperlukan untuk memproses pesanan (misalnya layanan kurir pengiriman).</p>

<h2>5. Cookie</h2>
<p>Website kami menggunakan cookie untuk meningkatkan pengalaman berbelanja Anda. Cookie membantu kami mengingat preferensi Anda dan mempersonalisasi tampilan toko online kami.</p>

<h2>6. Perubahan Kebijakan</h2>
<p>Kami berhak memperbarui kebijakan privasi ini sewaktu-waktu. Perubahan akan diinformasikan melalui website resmi kami. Terakhir diperbarui: 1 Mei 2026.</p>

<h2>7. Hubungi Kami</h2>
<p>Jika Anda memiliki pertanyaan mengenai kebijakan privasi kami, silakan hubungi kami melalui email: <strong>privacy@aureasyrari.com</strong></p>
HTML;
    }

    private function noReturnPolicyContent(): string
    {
        return <<<HTML
<h2>Kebijakan Penjualan Akhir</h2>
<p>Demi menjaga kualitas dan kebersihan produk fashion muslimah kami, Auréa Syar'i menerapkan kebijakan <strong>no-return & no-exchange</strong> setelah produk diterima oleh pelanggan.</p>

<h2>Pengecualian</h2>
<p>Pengembalian hanya dapat dilakukan dalam kondisi berikut:</p>
<ul>
  <li>Produk yang diterima tidak sesuai dengan pesanan (item salah / ukuran berbeda dari yang dipesan)</li>
  <li>Produk diterima dalam kondisi cacat produksi (bukan akibat pemakaian)</li>
  <li>Produk rusak selama proses pengiriman (disertai foto/video bukti saat unboxing)</li>
</ul>

<h2>Prosedur Klaim</h2>
<ol>
  <li>Hubungi customer service kami dalam <strong>24 jam</strong> setelah produk diterima</li>
  <li>Sertakan foto atau video produk yang bermasalah</li>
  <li>Sertakan nomor pesanan dan bukti pembelian</li>
  <li>Tim kami akan merespons dalam 1–2 hari kerja</li>
</ol>

<h2>Catatan Penting</h2>
<p>Produk yang sudah dicuci, dipakai, atau tidak dalam kondisi original (tag masih terpasang) tidak dapat diklaim. Pastikan Anda memeriksa produk segera setelah menerimanya.</p>
HTML;
    }

    private function shippingPolicyContent(): string
    {
        return <<<HTML
<h2>Metode Pengiriman</h2>
<p>Auréa Syar'i bekerja sama dengan mitra kurir terpercaya untuk mengantarkan pesanan Anda:</p>
<ul>
  <li><strong>JNE</strong> — Reguler (2–5 hari kerja), YES (1–2 hari kerja)</li>
  <li><strong>J&T Express</strong> — Reguler (2–4 hari kerja)</li>
  <li><strong>SiCepat</strong> — Reguler (2–4 hari kerja), HALU (1 hari)</li>
  <li><strong>AnterAja</strong> — Same Day (area tertentu)</li>
</ul>

<h2>Estimasi Pengiriman</h2>
<p>Pesanan diproses dalam <strong>1–2 hari kerja</strong> setelah pembayaran dikonfirmasi. Estimasi pengiriman tidak termasuk hari Minggu dan hari libur nasional.</p>

<h2>Biaya Pengiriman</h2>
<p>Biaya pengiriman dihitung berdasarkan berat paket dan lokasi tujuan. Estimasi biaya akan ditampilkan saat proses checkout sebelum Anda melakukan pembayaran.</p>

<h2>Gratis Ongkir</h2>
<p>Nikmati <strong>gratis ongkir</strong> untuk pembelian minimum Rp 300.000 ke seluruh wilayah Indonesia (syarat & ketentuan berlaku, berlaku untuk kurir tertentu).</p>

<h2>Pengiriman ke Luar Negeri</h2>
<p>Saat ini kami belum melayani pengiriman internasional. Kami akan mengumumkan jika layanan ini tersedia di masa mendatang.</p>

<h2>Pelacakan Pesanan</h2>
<p>Nomor resi pengiriman akan dikirimkan melalui email dan dapat dilacak melalui halaman <strong>Pesanan Saya</strong> di akun Anda.</p>
HTML;
    }

    private function termsContent(): string
    {
        return <<<HTML
<h2>1. Penerimaan Syarat</h2>
<p>Dengan mengakses dan menggunakan layanan Auréa Syar'i, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini. Jika Anda tidak menyetujui, harap tidak menggunakan layanan kami.</p>

<h2>2. Akun Pengguna</h2>
<p>Anda bertanggung jawab menjaga kerahasiaan akun dan kata sandi Anda. Segala aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya. Harap segera hubungi kami jika mendeteksi penggunaan tidak sah.</p>

<h2>3. Pemesanan & Pembayaran</h2>
<p>Semua harga tercantum dalam Rupiah Indonesia (IDR) dan sudah termasuk PPN. Pemesanan bersifat mengikat setelah pembayaran dikonfirmasi. Kami berhak membatalkan pesanan yang terindikasi penipuan.</p>

<h2>4. Ketersediaan Produk</h2>
<p>Kami berupaya menjaga akurasi stok produk. Namun, dalam kondisi tertentu produk mungkin habis setelah pesanan diterima. Dalam kasus ini, kami akan segera menghubungi Anda untuk penyelesaian terbaik.</p>

<h2>5. Hak Kekayaan Intelektual</h2>
<p>Seluruh konten di website ini — termasuk foto produk, deskripsi, logo, dan desain — merupakan hak milik Auréa Syar'i dan dilindungi oleh hukum hak cipta Indonesia. Dilarang keras menyalin atau menggunakan tanpa izin tertulis.</p>

<h2>6. Perubahan Syarat</h2>
<p>Auréa Syar'i berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan efektif berlaku sejak dipublikasikan di website. Terakhir diperbarui: 1 Mei 2026.</p>
HTML;
    }

    private function aboutUsContent(): string
    {
        return <<<HTML
<h2>Kisah Kami</h2>
<p>Auréa Syar'i lahir dari kecintaan mendalam terhadap keindahan dan kesopanan dalam berpakaian. Didirikan pada tahun 2022, kami hadir untuk menjawab kebutuhan wanita muslimah modern yang ingin tampil elegan tanpa mengorbankan nilai-nilai syar'i.</p>

<h2>Visi Kami</h2>
<p>Menjadi brand fashion muslimah nomor satu di Indonesia yang menghadirkan koleksi berkualitas premium dengan harga yang terjangkau, serta menginspirasi wanita muslimah untuk percaya diri dalam berbusana.</p>

<h2>Misi Kami</h2>
<ul>
  <li>Menghadirkan koleksi fashion muslimah yang mengikuti tren global namun tetap syar'i</li>
  <li>Menggunakan material pilihan yang nyaman dipakai di iklim tropis Indonesia</li>
  <li>Memberikan pengalaman berbelanja yang menyenangkan dan terpercaya</li>
  <li>Mendukung pengrajin lokal Indonesia dalam setiap produksi kami</li>
</ul>

<h2>Mengapa Auréa Syar'i?</h2>
<p>Setiap helai kain yang kami pilih, setiap jahitan yang kami buat, dan setiap desain yang kami hadirkan mencerminkan komitmen kami terhadap kualitas dan keindahan. Kami percaya bahwa berpakaian syar'i adalah ekspresi iman sekaligus gaya hidup yang indah.</p>

<h2>Koleksi Kami</h2>
<p>Dari abaya klasik hingga khimar modern, dari syal mewah hingga gamis casual — setiap produk Auréa Syar'i dirancang dengan penuh cinta untuk menemani perjalanan hidup Anda, dari momen sehari-hari hingga hari-hari istimewa.</p>
HTML;
    }

    private function faqContent(): string
    {
        return <<<HTML
<h2>Pemesanan</h2>

<h3>Bagaimana cara memesan?</h3>
<p>Pilih produk yang Anda inginkan, pilih ukuran dan warna, klik "Tambah ke Keranjang", lalu lanjutkan ke proses checkout. Ikuti langkah pembayaran yang tersedia.</p>

<h3>Apakah saya perlu membuat akun untuk berbelanja?</h3>
<p>Ya, Anda perlu membuat akun untuk dapat berbelanja dan melacak status pesanan Anda. Pendaftaran gratis dan hanya memerlukan email.</p>

<h2>Pembayaran</h2>

<h3>Metode pembayaran apa saja yang tersedia?</h3>
<p>Kami menerima pembayaran melalui Transfer Bank (BCA, Mandiri, BNI, BRI), Virtual Account, GoPay, OVO, dan Dana.</p>

<h3>Apakah transaksi aman?</h3>
<p>Ya, semua transaksi diproses melalui payment gateway tersertifikasi dengan enkripsi SSL. Data pembayaran Anda aman bersama kami.</p>

<h2>Ukuran & Produk</h2>

<h3>Bagaimana cara memilih ukuran yang tepat?</h3>
<p>Silakan kunjungi halaman <a href="/size-guide">Panduan Ukuran</a> kami. Kami menyediakan tabel ukuran lengkap untuk setiap jenis produk.</p>

<h3>Apakah warna produk sama persis dengan foto?</h3>
<p>Kami berusaha menampilkan warna seakurat mungkin. Namun, warna bisa sedikit berbeda tergantung kalibrasi layar perangkat Anda.</p>

<h2>Pengiriman & Pengembalian</h2>

<h3>Berapa lama proses pengiriman?</h3>
<p>Pesanan diproses 1–2 hari kerja. Estimasi pengiriman 2–5 hari kerja tergantung lokasi dan kurir yang dipilih.</p>

<h3>Bisakah saya melacak pesanan saya?</h3>
<p>Ya! Setelah pesanan dikirim, nomor resi akan tersedia di halaman "Pesanan Saya" di akun Anda.</p>
HTML;
    }

    private function careGuideContent(): string
    {
        return <<<HTML
<h2>Panduan Umum Perawatan</h2>
<p>Untuk menjaga kualitas dan keindahan produk Auréa Syar'i, ikuti panduan perawatan berikut:</p>

<h2>Mencuci</h2>
<ul>
  <li>Cuci dengan tangan atau gunakan mode gentle/delicate pada mesin cuci</li>
  <li>Gunakan air dingin (maksimal 30°C) untuk menjaga warna dan bentuk kain</li>
  <li>Gunakan deterjen lembut yang tidak mengandung pemutih</li>
  <li>Pisahkan pakaian berwarna gelap dan terang saat mencuci</li>
  <li>Balik pakaian sebelum dicuci untuk melindungi permukaan luar</li>
</ul>

<h2>Mengeringkan</h2>
<ul>
  <li>Jangan diperas terlalu kuat — peras perlahan atau gulung dengan handuk</li>
  <li>Keringkan di tempat teduh, hindari sinar matahari langsung yang dapat memudarkan warna</li>
  <li>Gantung dalam posisi yang benar sesuai bentuk pakaian</li>
</ul>

<h2>Menyetrika</h2>
<ul>
  <li>Sesuaikan suhu setrika dengan jenis kain yang tertera di label produk</li>
  <li>Gunakan kain pelindung (pressing cloth) untuk kain yang sensitif seperti satin dan chiffon</li>
  <li>Setrika dalam kondisi sedikit lembap untuk hasil yang lebih rapi</li>
</ul>

<h2>Penyimpanan</h2>
<ul>
  <li>Simpan di tempat kering dan berventilasi baik</li>
  <li>Gunakan hanger untuk abaya dan gamis agar tidak kusut</li>
  <li>Jauhkan dari paparan cahaya langsung dalam jangka panjang</li>
  <li>Gunakan kamper atau cedar block untuk mencegah ngengat</li>
</ul>
HTML;
    }

    private function sizeGuideContent(): string
    {
        return <<<HTML
<h2>Panduan Ukuran Auréa Syar'i</h2>
<p>Gunakan tabel berikut sebagai referensi. Untuk hasil terbaik, ukur tubuh Anda dan bandingkan dengan tabel di bawah.</p>

<h2>Cara Mengukur</h2>
<ul>
  <li><strong>Lingkar Dada:</strong> Ukur bagian terlebar dada, melingkar di bawah ketiak</li>
  <li><strong>Lingkar Pinggang:</strong> Ukur bagian terkecil pinggang</li>
  <li><strong>Lingkar Pinggul:</strong> Ukur bagian terlebar pinggul</li>
  <li><strong>Panjang Badan:</strong> Ukur dari bahu hingga mata kaki</li>
</ul>

<h2>Tabel Ukuran Abaya & Gamis</h2>
<table border="1" cellpadding="8" cellspacing="0">
  <thead>
    <tr>
      <th>Size</th><th>Lingkar Dada (cm)</th><th>Lingkar Pinggang (cm)</th><th>Lingkar Pinggul (cm)</th><th>Panjang (cm)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>S</td><td>88–92</td><td>68–72</td><td>92–96</td><td>140–143</td></tr>
    <tr><td>M</td><td>92–96</td><td>72–76</td><td>96–100</td><td>143–146</td></tr>
    <tr><td>L</td><td>96–102</td><td>76–82</td><td>100–106</td><td>146–149</td></tr>
    <tr><td>XL</td><td>102–108</td><td>82–88</td><td>106–112</td><td>149–152</td></tr>
    <tr><td>XXL</td><td>108–116</td><td>88–96</td><td>112–120</td><td>152–155</td></tr>
  </tbody>
</table>

<h2>Tabel Ukuran Khimar</h2>
<table border="1" cellpadding="8" cellspacing="0">
  <thead>
    <tr>
      <th>Ukuran</th><th>Panjang Depan (cm)</th><th>Panjang Belakang (cm)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Regular</td><td>100</td><td>120</td></tr>
    <tr><td>Panjang</td><td>115</td><td>135</td></tr>
    <tr><td>Maxi</td><td>130</td><td>150</td></tr>
  </tbody>
</table>

<p><em>Jika ukuran Anda berada di antara dua size, kami merekomendasikan untuk memilih size yang lebih besar.</em></p>
HTML;
    }
}
