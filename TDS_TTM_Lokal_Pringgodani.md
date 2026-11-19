# Test Design Specification (TDS) & Test Traceability Matrix (TTM)
## Pengujian Fungsionalitas Frontend Aplikasi Web "Lokal Pringgodani"
**Target URL:** `http://localhost:3000`  
**Lingkungan Pengujian:** Next.js 16 (App Router) + React 19 + TypeScript + Vitest / Playwright  
**Tanggal Verifikasi:** 21 Oktober 2026  

---

## 1. Temuan Kesesuaian Aplikasi (Hasil Verifikasi Nyata Kode vs Requirement)

Pemeriksaan mendalam telah dilakukan terhadap kode komponen frontend pada workspace `frontend-pkpl` yang aktif berjalan di port 3000. Berikut adalah analisis kesesuaian antara batasan aturan (*requirements*) dengan implementasi nyata pada kode sumber:

| Requirement ID | Batasan Kebutuhan (*Rule Specification*) | Lokasi Komponen Kode Sumber | Implementasi & Perilaku Aktual | Status Kesesuaian |
|---|---|---|---|---|
| **RQ-001** | **Login:** Pembatasan minimal 5 karakter pada input identitas pengguna/admin. | `src/app/admin/login/page.tsx` | Elemen input `<input id="username" ... minLength={5} maxLength={50} required />` membatasi pengisian kurang dari 5 karakter. Didukung validasi `process.env.NODE_ENV === "development"` yang mengizinkan alias `"admin"` (5 karakter) atau email berformat valid. Upaya submit dengan karakter `< 5` langsung dicegat oleh validasi form HTML5 dan state `fieldErrors`. | **SESUAI (PASS)** |
| **RQ-002** | **Register:** Batasan BVA (*Boundary Value Analysis*) minimal 10 dan maksimal 50 karakter pada input Nama Lengkap. | `src/app/admin/register/page.tsx` | Input `fullName` menerapkan batasan atribut `minLength={10}` dan `maxLength={50}`. Handler `onChange` dan `handleSubmit` memverifikasi rentang karakter `fullName.trim().length < 10 || fullName.length > 50` dengan pesan *"Nama lengkap harus terdiri dari 10–50 karakter."* serta dilengkapi counter live `{fullName.length}/50 karakter (minimal 10)`. | **SESUAI (PASS)** |
| **RQ-003** | **Forgot Password:** Validasi format email kaku menggunakan regex (*Regular Expression*). | `src/app/admin/forgot-password/page.tsx` | Menggunakan ekspresi reguler baku kaku: `const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);`. Jika format email tidak memenuhi pola (misal tanpa `@`, tanpa domain, spasi di dalam), sistem memunculkan pesan error *"Masukkan email dengan format yang valid."* dan mencegah pengiriman request API `/auth/forgot-password`. | **SESUAI (PASS)** |
| **RQ-004** | **CRUD Berita:** Operasi tambah, baca, edit, dan hapus artikel warta desa. | `src/views/admin-berita/admin-berita-list.tsx`<br>`src/views/admin-berita/admin-berita-editor.tsx`<br>`src/app/admin/berita/` | Fungsionalitas CRUD lengkap tersedia:<br>1. **Create:** Halaman `/admin/berita/new` dengan editor blok narasi, auto-excerpt, cover upload, dan draf otomatis.<br>2. **Read:** Tabel daftar warta desa dengan filter status (`ALL`, `PUBLISHED`, `PENDING`, `DRAFT`, `REJECTED`) dan pencarian.<br>3. **Update:** Tombol *"Sunting"* menuju `/admin/berita/[id]/edit` serta tombol cepat *"Terbitkan"*.<br>4. **Delete:** Tombol *"Hapus"* dengan dialog konfirmasi `window.confirm` dan notifikasi toast status penghapusan. | **SESUAI (PASS)** |
| **RQ-005** | **CRUD UMKM:** Validasi harga tidak boleh bernilai negatif (`min={0}`). | `src/views/admin-umkm/admin-umkm-editor.tsx`<br>`src/entities/umkm/model/register-umkm.schema.ts` | Input harga varian produk UMKM pada baris 1209–1225 menggunakan `<input id="field-product-price-${idx}" type="number" min={0} max={MAX_PRODUCT_PRICE} step={1} ... />`. Pada level validasi script terdapat pengecekan `!Number.isInteger(product.price) \|\| product.price < 0` yang memunculkan pesan *"Harga harus berupa angka bulat antara 0 dan 999999999999."*. Nilai negatif diblokir baik di level UI maupun handler. | **SESUAI (PASS)** |
| **RQ-006** | **Validasi Pengajuan:** Perubahan status pengajuan data warga via tombol aksi. | `src/views/admin-pengajuan/admin-pengajuan-page.tsx`<br>`src/views/admin-pengajuan/components/submission-review-modal.tsx` | Sistem antrean persetujuan warga menyediakan tab *Berita* dan *UMKM*. Tombol aksi *"Tinjau & Pratinjau"* membuka modal split-view. Di dalam modal tersedia tombol aksi *"Setujui & Publikasikan"* (`updateStatus: PUBLISHED/APPROVED`) dan *"Tolak Pengajuan"* (`updateStatus: REJECTED`) dengan pengisian alasan penolakan. Mengubah status secara instan via API dan merefresh antrean. | **SESUAI (PASS)** |
| **RQ-007** | **Pencarian:** Query pencarian data UMKM berdasarkan parameter dan kategori dusun/wilayah. | `src/views/umkm-list/umkm-list-page.tsx`<br>`src/widgets/search-box/search-box.tsx`<br>`src/features/search-umkm/ui/umkm-search-input.tsx`<br>`src/entities/umkm/api/umkm.service.ts` | Komponen pencarian terintegrasi dengan URL Query String `?cari=<keyword>`. Pencarian teks bebas mencakup nama usaha, deskripsi, dan alamat dusun (misal: "Dusun Krajan"). Input didebounce 400ms dan reset halaman otomatis ke halaman 1 saat filter/kategori diubah. Didukung filter kategori berbasis chip (`?kategori=<slug>`). | **SESUAI (PASS)** |
| **RQ-008** | **Transparansi:** Pengelolaan kontak WhatsApp dengan karakter numerik saja. | `src/views/admin-umkm/admin-umkm-editor.tsx`<br>`src/views/submit-umkm/submit-umkm-form.tsx`<br>`src/entities/umkm/model/whatsapp-link.ts` | Input nomor kontak telepon/WA (`#field-phone`) menerapkan validasi ketat: `pattern="(0[0-9]{9,13}\|62[0-9]{8,12}\|[+]62[0-9]{8,12})"`, `inputMode="numeric"`, dan regex JS `/^(?:0\d{9,13}\|62\d{8,12}\|[+]62\d{8,12})$/`. Karakter huruf/simbol non-angka ditolak dengan pesan error *"Nomor kontak harus berupa 10–15 karakter numerik dan diawali 0 atau 62"*. Modul `whatsapp-link.ts` membersihkan karakter non-angka (`replace(/\D/g, "")`) sebelum membentuk URL `https://wa.me/`. | **SESUAI (PASS)** |

---

## 2. Daftar Feature Sets (FS)

Berdasarkan arsitektur modular dan domain fungsional sistem "Lokal Pringgodani", modul pengujian dikelompokkan ke dalam 8 Feature Sets dengan tingkatan prioritas:

| Feature Set ID | Nama Feature Set | Ruang Lingkup Fungsional | Tingkat Prioritas |
|---|---|---|---|
| **FS-001** | Autentikasi Admin & Kontrol Akses Login | Form login admin, restriksi minimal karakter identifier/email, proteksi input password, proteksi brute-force/busy status. | **High** |
| **FS-002** | Registrasi Akun Administrator Baru | Pendaftaran admin baru, validasi batasan nilai batas (BVA) nama lengkap (10–50 karakter), verifikasi email, konfirmasi kata sandi. | **High** |
| **FS-003** | Pemulihan Kredensial (Forgot Password) | Pengiriman tautan reset kata sandi, validasi sintaks format email menggunakan regex kaku, umpan balik keberhasilan/kegagalan. | **Medium** |
| **FS-004** | Manajemen Konten Warta Desa (CRUD Berita) | Operasi Create, Read, Update, Delete artikel publikasi berita, filter status penerbitan, penataan kategori, cover image upload. | **High** |
| **FS-005** | Pengelolaan Direktori UMKM & Validasi Harga | Formulir master katalog UMKM, validasi batas harga produk minimal non-negatif (`min={0}`), penanganan koordinat peta dan galeri. | **High** |
| **FS-006** | Otorisasi & Validasi Pengajuan Warga | Antrean verifikasi liputan berita dan UMKM mandiri warga, modal pratinjau live split-view, tombol aksi persetujuan (*approval*) dan penolakan (*rejection*). | **High** |
| **FS-007** | Pencarian & Filter Katalog Publik | Mesin pencarian teks bebas berbasis URL query parameter `?cari=`, filter kategori dusun/wilayah dan kategori sektor usaha, debounce state. | **Medium** |
| **FS-008** | Transparansi & Standardisasi Kontak WhatsApp | Validasi input nomor kontak telepon/WhatsApp numerik murni, batasan panjang 10–15 digit, normalisasi tautan *direct-to-WhatsApp*. | **Medium** |

---

## 3. Tabel Test Conditions (TDS)

| ID | Feature Set | Description | Priority | Traceability |
|---|---|---|---|---|
| **TC-001** | FS-001 | Memverifikasi penolakan login ketika identifier/username memiliki panjang kurang dari 5 karakter (< 5 karakter). | High | RQ-001 |
| **TC-002** | FS-001 | Memverifikasi penerimaan login ketika identifier memenuhi syarat minimal 5 karakter (misal: "admin" atau email valid). | High | RQ-001 |
| **TC-003** | FS-002 | Memverifikasi penolakan registrasi saat nama lengkap berada di bawah batas minimum BVA (9 karakter). | High | RQ-002 |
| **TC-004** | FS-002 | Memverifikasi penerimaan registrasi saat nama lengkap berada tepat pada batas minimum BVA (10 karakter). | High | RQ-002 |
| **TC-005** | FS-002 | Memverifikasi penerimaan registrasi saat nama lengkap berada tepat pada batas maksimum BVA (50 karakter). | High | RQ-002 |
| **TC-006** | FS-002 | Memverifikasi penolakan/pemotongan saat nama lengkap melebihi batas maksimum BVA (51 karakter). | High | RQ-002 |
| **TC-007** | FS-003 | Memverifikasi penolakan pengiriman form lupa kata sandi dengan format email tidak valid (tanpa `@`, tanpa domain, karakter spasi). | Medium | RQ-003 |
| **TC-008** | FS-003 | Memverifikasi penerimaan pengiriman form lupa kata sandi dengan format email valid sesuai regex (`user@domain.id`). | Medium | RQ-003 |
| **TC-009** | FS-004 | Memverifikasi penambahan artikel berita baru (Create) beserta blok konten dan foto banner. | High | RQ-004 |
| **TC-010** | FS-004 | Memverifikasi pembacaan daftar berita desa (Read) dan penyaringan berdasarkan status publikasi. | High | RQ-004 |
| **TC-011** | FS-004 | Memverifikasi penyuntingan konten berita (Update) dan perubahan status cepat menjadi `PUBLISHED`. | High | RQ-004 |
| **TC-012** | FS-004 | Memverifikasi penghapusan artikel berita (Delete) melalui dialog konfirmasi tindakan. | High | RQ-004 |
| **TC-013** | FS-005 | Memverifikasi penolakan input harga produk negatif pada form UMKM (`min={0}`). | High | RQ-005 |
| **TC-014** | FS-005 | Memverifikasi penerimaan harga produk nol (Rp 0 / gratis) dan harga positif normal. | High | RQ-005 |
| **TC-015** | FS-006 | Memverifikasi pembukaan modal pratinjau live split-view untuk pengajuan data warga yang berstatus pending. | High | RQ-006 |
| **TC-016** | FS-006 | Memverifikasi perubahan status pengajuan menjadi `PUBLISHED`/`APPROVED` melalui tombol aksi "Setujui & Publikasikan". | High | RQ-006 |
| **TC-017** | FS-006 | Memverifikasi perubahan status pengajuan menjadi `REJECTED` beserta alasan melalui tombol aksi "Tolak Pengajuan". | High | RQ-006 |
| **TC-018** | FS-007 | Memverifikasi pemfilteran katalog UMKM melalui input pencarian dengan parameter URL `?cari=<nama_dusun>`. | Medium | RQ-007 |
| **TC-019** | FS-007 | Memverifikasi kombinasi query pencarian dusun dan filter chip kategori sektor usaha UMKM. | Medium | RQ-007 |
| **TC-020** | FS-008 | Memverifikasi penolakan nomor telepon/WhatsApp yang mengandung karakter huruf atau simbol non-numerik. | Medium | RQ-008 |
| **TC-021** | FS-008 | Memverifikasi penerimaan nomor telepon/WhatsApp numerik berawalan 0 atau 62 dengan panjang 10–15 digit. | Medium | RQ-008 |

---

## 4. Tabel Coverage Items (TDS)

| ID | Description | Related Test Condition | Priority | Traceability |
|---|---|---|---|---|
| **CI-001** | Mengirimkan input username dengan nilai 4 karakter (misal: "user") dan memastikan muncul pesan error / pemblokiran submit. | TC-001 | High | RQ-001 |
| **CI-002** | Mengirimkan input username dengan 5 karakter valid ("admin") pada lingkungan development dan memastikan proses verifikasi berlanjut. | TC-002 | High | RQ-001 |
| **CI-003** | Menginput nama lengkap 9 karakter ("Budi Sant") pada registrasi dan memverifikasi error "Nama minimal 10 karakter". | TC-003 | High | RQ-002 |
| **CI-004** | Menginput nama lengkap 10 karakter ("Budi Setya") dan memverifikasi tidak ada error validasi panjang minimal. | TC-004 | High | RQ-002 |
| **CI-005** | Menginput nama lengkap tepat 50 karakter dan memverifikasi counter menunjukkan 50/50 serta lolos validasi. | TC-005 | High | RQ-002 |
| **CI-006** | Mencoba menginput karakter ke-51 pada form nama lengkap dan memverifikasi atribut `maxLength={50}` menahan input. | TC-006 | High | RQ-002 |
| **CI-007** | Mengisi email forgot password dengan nilai tanpa domain ("admin@") atau tanpa TLD ("admin@pringgodani") dan memverifikasi pesan format tidak valid. | TC-007 | Medium | RQ-003 |
| **CI-008** | Mengisi email forgot password dengan format standar RFC/regex ("admin@pringgodani.desa.id") dan memverifikasi tombol kirim aktif tanpa pesan error. | TC-008 | Medium | RQ-003 |
| **CI-009** | Mengakses `/admin/berita/new`, mengisi judul 10–50 karakter, kategori, blok teks narasi, dan melakukan penyimpanan artikel berita. | TC-009 | High | RQ-004 |
| **CI-010** | Mengakses tabel `/admin/berita`, mengklik filter status "PUBLISHED", "PENDING", "DRAFT", dan memastikan data terfilter dengan tepat. | TC-010 | High | RQ-004 |
| **CI-011** | Mengklik tombol "Sunting" pada artikel berita, mengubah salah satu blok teks, dan menekan tombol publikasikan ulang. | TC-011 | High | RQ-004 |
| **CI-012** | Mengklik tombol "Hapus" pada salah satu baris berita, mengonfirmasi modal `window.confirm`, dan memverifikasi notifikasi toast sukses. | TC-012 | High | RQ-004 |
| **CI-013** | Mengisi nilai `-5000` pada input harga produk UMKM dan memastikan ditolak oleh atribut `min={0}` serta pesan validasi angka bulat non-negatif. | TC-013 | High | RQ-005 |
| **CI-014** | Mengisi nilai `0` dan `25000` pada harga produk UMKM dan memastikan input diterima tanpa error. | TC-014 | High | RQ-005 |
| **CI-015** | Mengklik tombol "Tinjau & Pratinjau" pada daftar pengajuan warga dan memverifikasi terbukanya modal detail pengajuan. | TC-015 | High | RQ-006 |
| **CI-016** | Menekan tombol "Setujui & Publikasikan" pada modal pengajuan dan memastikan status berubah menjadi disetujui serta data hilang dari antrean pending. | TC-016 | High | RQ-006 |
| **CI-017** | Menekan tombol "Tolak Pengajuan", mengisi alasan penolakan pada input teks, menekan "Konfirmasi Penolakan", dan memverifikasi status ditolak. | TC-017 | High | RQ-006 |
| **CI-018** | Memasukkan kata kunci dusun (contoh: "Krajan") pada kolom pencarian katalog UMKM dan memeriksa URL berubah menjadi `?cari=Krajan`. | TC-018 | Medium | RQ-007 |
| **CI-019** | Memilih chip filter kategori "Kuliner" saat query pencarian dusun aktif dan memverifikasi URL menjadi `?cari=Krajan&kategori=kuliner`. | TC-019 | Medium | RQ-007 |
| **CI-020** | Menginput teks berkarakter huruf/simbol ("0812-ABCD-EFGH") pada field WhatsApp dan memeriksa pesan peringatan numerik 10–15 digit. | TC-020 | Medium | RQ-008 |
| **CI-021** | Menginput nomor valid ("081234567890") pada field WhatsApp dan memastikan sistem menormalisasi nomor menjadi tautan wa.me standar. | TC-021 | Medium | RQ-008 |

---

## 5. Tabel Test Traceability Matrix (TTM)

Matriks penelusuran (*traceability*) berikut memetakan keterkaitan langsung antara kebutuhan bisnis/aturan (*Requirements*), modul fungsional (*Feature Sets*), kondisi uji (*Test Conditions*), dan item cakupan pengujian (*Coverage Items*):

| Requirement ID | Feature Set ID | Test Condition ID | Coverage Item ID |
|---|---|---|---|
| **RQ-001** (Login Min 5 Karakter) | **FS-001** (Admin Authentication) | **TC-001**<br>**TC-002** | **CI-001**<br>**CI-002** |
| **RQ-002** (Register BVA 10–50 Karakter) | **FS-002** (Admin Registration) | **TC-003**<br>**TC-004**<br>**TC-005**<br>**TC-006** | **CI-003**<br>**CI-004**<br>**CI-005**<br>**CI-006** |
| **RQ-003** (Forgot Password Strict Regex) | **FS-003** (Password Recovery) | **TC-007**<br>**TC-008** | **CI-007**<br>**CI-008** |
| **RQ-004** (CRUD Berita Warta Desa) | **FS-004** (News Management) | **TC-009**<br>**TC-010**<br>**TC-011**<br>**TC-012** | **CI-009**<br>**CI-010**<br>**CI-011**<br>**CI-012** |
| **RQ-005** (CRUD UMKM Harga Min 0) | **FS-005** (UMKM Price Validation) | **TC-013**<br>**TC-014** | **CI-013**<br>**CI-014** |
| **RQ-006** (Validasi Pengajuan Aksi Tombol) | **FS-006** (Submission Review & Workflow) | **TC-015**<br>**TC-016**<br>**TC-017** | **CI-015**<br>**CI-016**<br>**CI-017** |
| **RQ-007** (Pencarian Berdasarkan Dusun/Kategori) | **FS-007** (Catalog Search & Filter) | **TC-018**<br>**TC-019** | **CI-018**<br>**CI-019** |
| **RQ-008** (Transparansi Kontak WA Numerik) | **FS-008** (WhatsApp Numeric Validation) | **TC-020**<br>**TC-021** | **CI-020**<br>**CI-021** |

---

## 6. Tabel Test Design Technique Summary

| Test Condition ID | Test Design Technique | Rationale |
|---|---|---|
| **TC-001, TC-002** | **Equivalence Partitioning (EP) & Boundary Testing** | Membagi kelas partisi panjang string ke dalam partisi tidak valid (< 5 karakter) dan partisi valid (≥ 5 karakter) guna menjamin batas minimal terpenuhi. |
| **TC-003, TC-004, TC-005, TC-006** | **Boundary Value Analysis (BVA) 2-Value Approach** | Menguji nilai batas kritis secara tepat pada titik batas: *Lower Boundary - 1* (9 char), *Lower Boundary* (10 char), *Upper Boundary* (50 char), dan *Upper Boundary + 1* (51 char) sesuai spesifikasi BVA. |
| **TC-007, TC-008** | **Syntax Testing & Equivalence Partitioning** | Menguji format masukan teks terhadap ekspresi reguler formal `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` untuk memastikan hanya alamat email dengan struktur sintaks valid yang diterima. |
| **TC-009, TC-010, TC-011, TC-012** | **CRUD Analysis & State Transition Testing** | Menguji daur hidup penuh entitas artikel berita (Create, Read, Update, Delete) serta transisi state status publikasi (`DRAFT` → `PENDING` → `PUBLISHED` / `REJECTED`). |
| **TC-013, TC-014** | **Boundary Value Analysis & Error Guessing** | Menguji nilai batas bawah absolut untuk mata uang/harga (`0` sebagai gratis, `>= 1` sebagai nominal sah, `< 0` sebagai anomali negatif yang wajib dicegah oleh `min={0}`). |
| **TC-015, TC-016, TC-017** | **Use Case Testing & State Transition Testing** | Menguji alur kerja administratif peninjauan (*review workflow*) pengajuan warga dari keadaan *Pending* menuju keadaan *Approved* atau *Rejected* dengan catatan alasan. |
| **TC-018, TC-019** | **Combinatorial / Query String Partitioning** | Menguji kombinasi parameter URL pencarian teks bebas (query dusun) dengan filter faset kategori untuk memastikan sinkronisasi state dan reset penomoran halaman. |
| **TC-020, TC-021** | **Input Domain Testing & Regular Expression Matching** | Memvalidasi integritas tipe data input telepon/WhatsApp agar murni numerik (hanya angka) dengan format awalan `0` atau `62` serta panjang rentang digit 10–15. |

---
**Dokumen ini disusun sebagai artefak jaminan mutu perangkat lunak (Software Quality Assurance) proyek Frontend Lokal Pringgodani.**
