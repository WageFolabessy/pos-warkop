# Apple Standard Design System — POS Warkop Specification

## Version 1.0 — POS Edition

Dokumen ini adalah acuan konstitusi desain (**Enforcement Constitution**) resmi untuk proyek **POS Warkop (Ratu KOPI Pontianak)**. Seluruh komponen antarmuka (UI) baru, modifikasi, dan refaktorisasi **WAJIB** mematuhi aturan di bawah ini tanpa pengecualian.

---

## 1. Filosofi Desain

1. **Hierarchy over decoration**  
   Kepentingan visual harus mencerminkan fungsi kerja operasional. Penekanan dibangun melalui tipografi dan tata letak, bukan warna-warni dekoratif.
2. **Clarity beats density**  
   Layar POS warkop digunakan di lingkungan cepat dan sering pada layar sentuh (tablet/smartphone). Hindari antarmuka yang sesak; berikan ruang sentuh yang lapang (*touch targets*).
3. **Consistency is more important than cleverness**  
   Gunakan pola komponen yang sama di semua peran (Kasir, Pelayan, Dapur, Owner). Jangan membuat varian visual acak untuk satu halaman tertentu.

---

## 2. Sistem Warna (Color System Hard Constraints)

### 2.1 Aksen Utama (Satu-satunya Warna Aksen)
* **Apple Blue**: `#0071e3`
* **Hover State**: `#0077ED`
* **Active State**: `#0064c8`
* **Focus Ring**: `ring-2 ring-[#0071e3]`

> [!IMPORTANT]
> **#0071e3** adalah SATU-SATUNYA warna aksen di seluruh aplikasi. Digunakan secara eksklusif untuk tombol aksi utama (*Primary CTA*), tombol terpilih (*active mobile tabs*), badge keranjang, dan fokus navigasi.

### 2.2 Warna Bahaya / Error (Destructive Only)
* **Red-600**: `#dc2626` (Tombol hapus/reset/destructive)
* **Red-700**: `#b91c1c` (Hover destructive)
* **Red-50**: `#fef2f2` (Latar pesan error / zona bahaya)
* **Red-200**: `#fecaca` (Border kotak error)
* **Red-950**: `#450a0a` (Teks judul kotak error)

### 2.3 Palet Warna Netral (Allowed Palette)
Aplikasi hanya boleh menggunakan rentang warna netral berikut:
* `white`: `#ffffff`
* `gray-50`: `#f9fafb` (Latar halaman & latar section sekunder)
* `gray-100`: `#f3f4f6` (Latar hover, container pill switcher)
* `gray-200`: `#e5e7eb` (Border standar & garis pemisah tabel)
* `gray-300`: `#d1d5db` (Status dot non-aktif)
* `gray-400`: `#9ca3af` (Ikon default, teks placeholder, teks disabled)
* `gray-500`: `#6b7280` (Teks sekunder & deskripsi)
* `gray-600`: `#4b5563` (Teks label & tombol sekunder)
* `gray-700`: `#374151` (Teks judul kecil & header tabel)
* `gray-800`: `#1f2937` (Teks tebal sekunder)
* `gray-900`: `#111827` (Teks utama, judul H1/H2, tombol aktif gelap)
* `black`: `#000000`

### 2.4 Warna yang DILARANG KERAS (Strictly Forbidden)
* ❌ **Semua warna tema coffee-shop gelap:** `stone-*` (kecuali struk fisik)
* ❌ **Semua warna amber/emas:** `amber-*`
* ❌ **Semua warna hijau:** `emerald-*`, `green-*`
* ❌ **Semua warna oranye:** `orange-*`
* ❌ **Semua warna biru lain:** `blue-*` (selain `#0071e3`)
* ❌ **Semua warna ungu/kuning:** `purple-*`, `yellow-*`

### 2.5 Pengecualian Khusus yang Disetujui (Exceptions)
1. **Struk Thermal 58mm (`#thermal-receipt` di `ReceiptModal.tsx`):**  
   Merupakan dokumen fisik printer kasir. Menggunakan tipografi monospace (`font-thermal`) dan warna monokrom cetak. Tidak diubah menjadi styling digital Apple DS.
2. **Kotak SVG QRIS (`PaymentModal.tsx`):**  
   Mempertahankan latar belakang hitam (`#000000` / `stone-900`) agar kamera pemindai perbankan/e-wallet dapat mengenali pola QR secara instan.

---

## 3. Tipografi (Typography Lockdown)

### 3.1 Font Family
Wajib menggunakan *System Font Stack*:
```css
-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif
```
*Catatan:* `font-mono` dan `tabular-nums` diizinkan khusus untuk nominal angka rupiah (`formatIDR`) dan jam agar angka tidak bergeser (*alignment* rapi).

### 3.2 Bobot Huruf (Hanya 3 Weight yang Diizinkan)
1. **`font-normal` (400):** Teks biasa, deskripsi, catatan pesanan.
2. **`font-medium` (500):** Label input, opsi filter tidak aktif, teks sekunder penekanan.
3. **`font-semibold` (600):** Judul halaman, nama menu, harga, tombol, status penekanan.

> [!CAUTION]
> **DILARANG:** `font-bold` (700), `font-extrabold` (800), dan `font-black` (900).  
> Jangan gunakan bobot tebal ekstrem untuk menarik perhatian. Gunakan ukuran font (`text-base`, `text-lg`, `text-xl`) dan spasi.

---

## 4. Komponen & Bentuk (Component Constraints)

### 4.1 Tombol (Buttons)
* **Bentuk:** Wajib kapsul **`rounded-full`** untuk semua tombol aksi.
* **Target Sentuh Minimum:** Minimal `min-h-10` (40px) atau `min-h-11` (44px) untuk kemudahan operasional layar sentuh.
* **Varian Tombol:**
  - **Primary Action (Maks. 1 per Tampilan):**  
    `bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0064c8] text-white font-semibold rounded-full`
  - **Secondary Action:**  
    `border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-full`
  - **Ghost Action:**  
    `bg-transparent hover:bg-gray-100 text-gray-600 font-medium rounded-full`
  - **Destructive Action:**  
    `bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full`

### 4.2 Kartu & Kontainer (Cards & Panels)
* **Latar:** `bg-white` atau `bg-gray-50`.
* **Sudut:** `rounded-xl`.
* **Border:** `border border-gray-200` (halus dan netral).
* **Bayangan (Shadows):** **TIDAK BOLEH** menggunakan bayangan tebal (`shadow-md`, `shadow-lg`, `shadow-2xl`). Kontainer dipisahkan oleh garis batas (*border*), bukan elevasi bayangan.

### 4.3 Modal & Bottom Sheet
* **Backdrop:** `bg-black/50 backdrop-blur-xs`.
* **Dialog Box:** `bg-white border border-gray-200 rounded-xl overflow-hidden`.
* **Header Modal:** Latar putih atau abu-abu terang dengan border bawah tipis `border-b border-gray-200`.

### 4.4 Badge & Indikator Status
* **Dilarang badge warna-warni:** Jangan gunakan badge hijau untuk "Selesai" atau badge kuning untuk "Menunggu".
* **Format yang Benar:**
  - Teks netral: `text-gray-600 text-xs font-medium`
  - Badge kapsul netral: `bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full`
  - Titik status (*dot*): `bg-gray-900` (terisi/aktif) vs `bg-gray-300` (kosong/non-aktif).

---

## 5. Ikonografi & Larangan Emoji

1. **Permanently Banned:** EMOJI DILARANG TOTAL pada seluruh UI struktural (header, tombol, label, badge, alert).
2. **Library Ikon:** Wajib menggunakan **Lucide React**.
3. **Ukuran Ikon:**
   - Di dalam tombol / inline teks: `w-3.5 h-3.5` atau `w-4 h-4`.
   - Header kartu / navigasi: `w-5 h-5`.
4. **Warna Ikon:** Mengikuti teks netral (`text-gray-400`, `text-gray-500`) atau `text-white` pada tombol primer. Tidak boleh ada ikon berwarna-warni.

---

## 6. Standar Antarmuka per Peran (Role Guidelines)

### 6.1 Layar Kasir (Cashier Flow)
* **Katalog Menu:** Kartu menu berlatar putih dengan border tipis, in-cart counter menggunakan pill biru `#0071e3`.
* **Active Order Panel:** Stepper kuantitas berlatar `bg-gray-50 rounded-full`, tombol "Bayar Sekarang" menggunakan `#0071e3`.
* **Split Bill (Pisah Tagihan):** Selector segmented control Apple di bagian atas modal bayar, daftar item terpilih dengan checkbox minimalis dan stepper.

### 6.2 Layar Pelayan (Waiter Flow)
* **Daftar Meja:** Kartu meja responsif tanpa banner instruksi berlebih. Indikator meja terisi menggunakan dot abu-abu gelap `bg-gray-900`.
* **Review Drawer:** Bottom sheet geser dengan grab-bar `bg-gray-200 rounded-full`, tombol kirim pesanan menggunakan `#0071e3`.

### 6.3 Layar Dapur (Kitchen KDS Flow)
* **Tanpa Warna Lampu Lalu Lintas:** Status antrean dapur (*Menunggu*, *Diracik*, *Siap Saji*) dibedakan melalui:
  - Posisi tab filter stasiun kerja.
  - Penekanan border hitam `border-gray-900` pada tiket siap saji vs `border-gray-200` pada tiket antre.
  - Teks status monokromatik netral.

### 6.4 Layar Owner (Rekap Kas & Laporan)
* **Metrik Keuangan:** Kotak ringkasan omzet berlatar putih `rounded-xl border border-gray-200` dengan tipografi monokrom yang tegas.
* **Tabel Penjualan:** Header abu-abu `bg-gray-50`, tanpa baris belang warna-warni (*no colored striped rows*).
* **Zona Reset Data:** Menggunakan latar peringatan `bg-red-50 border border-red-200` dengan tombol hapus `bg-red-600`.

---

## 7. Audit & Checklist Verifikasi Kode

Sebelum menyelesaikan perubahan kode UI, jalankan audit berikut:

```bash
# 1. Pastikan tidak ada warna yang dilarang (stone, amber, emerald, orange, blue selain #0071e3)
grep -rn "stone-\|amber-\|emerald-\|orange-\|blue-[0-9]" components/ app/ | grep -v "#thermal-receipt\|text-stone-900\|bg-stone-900"

# 2. Pastikan tidak ada bobot font terlarang (bold, extrabold, black)
grep -rn "font-bold\|font-black\|font-extrabold" components/ app/ | grep -v "ReceiptModal"

# 3. Pastikan tidak ada drop shadow berlebih
grep -rn "shadow-lg\|shadow-xl\|shadow-2xl" components/ app/ | grep -v "ReceiptModal\|backdrop"

# 4. Pastikan tidak ada error TypeScript
npx tsc --noEmit --project tsconfig.json
```
