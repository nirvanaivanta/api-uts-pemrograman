# Plan 14 - README & Finalisasi Repository

## 1. Objective

Menulis `README.md` yang lengkap sesuai spesifikasi, melakukan pengecekan akhir seluruh repository, dan memastikan project siap untuk dikumpulkan ke GitHub.

## 2. Context

README adalah dokumen wajib yang dinilai sebagai bagian dari rubrik. README harus memuat cara menjalankan server, rancangan tabel, daftar endpoint, keputusan desain, dan tangkapan layar. Selain itu, repository harus bersih: tidak ada `.env`, tidak ada `node_modules/`, dan semua file yang diperlukan sudah ada.

## 3. Prerequisites

- **Plan 1–13 selesai** – Seluruh kode, Postman collection, dan screenshot sudah ada.

## 4. Tasks

### README.md

- [ ] **Task 1** – Buat `README.md` dengan bagian-bagian berikut (urutan sesuai spesifikasi):

  **1. Judul & Deskripsi Singkat**
  - Nama project: UTS Pemrograman API - Toko Online
  - Teknologi: Express.js, PostgreSQL, Node.js

  **2. Cara Menjalankan Server**
  - Prasyarat (Node.js, PostgreSQL)
  - Clone repository
  - `npm install`
  - Buat `.env` berdasarkan `.env.example`
  - Buat database: `psql -U postgres -c "CREATE DATABASE db_uts;"`
  - Jalankan schema: `psql -U postgres -d db_uts -f sql/schema.sql`
  - Jalankan seed: `psql -U postgres -d db_uts -f sql/seed.sql`
  - `npm run dev` atau `npm start`

  **3. Rancangan Tabel dan Relasinya**
  - Tabel `kategori` (kolom, constraint, keterangan)
  - Tabel `produk` (kolom, constraint, keterangan)
  - Relasi: one-to-many, `produk.kategori_id` → `kategori.id`
  - Diagram sederhana atau tabel Markdown

  **4. Daftar Endpoint Beserta Contoh Body**
  - Semua 12+ endpoint dalam format tabel
  - Contoh request body untuk POST, PUT, PATCH
  - Kode status yang mungkin untuk setiap endpoint

  **5. Keputusan Desain: Alasan Memilih PUT dan PATCH**
  - PUT: digunakan untuk **replace** seluruh resource. Semua field wajib dikirim. Cocok ketika client memiliki data lengkap.
  - PATCH: digunakan untuk **update parsial**. Hanya field yang ingin diubah yang dikirim. Lebih efisien untuk perubahan kecil.
  - Keduanya hanya beroperasi pada produk aktif (deleted_at IS NULL).

  **6. Perilaku Soft Delete terhadap UNIQUE dan Foreign Key**
  - **UNIQUE**: `kode_produk` milik produk soft-deleted tetap menempati slot UNIQUE. Upaya membuat produk baru dengan kode yang sama akan menghasilkan 409. Ini disengaja agar tidak ada dua produk (aktif maupun terhapus) dengan kode yang sama, menjaga integritas data historis.
  - **Foreign Key**: Produk soft-deleted tetap ada sebagai baris di tabel `produk`. Kolom `kategori_id`-nya tetap aktif sebagai referensi ke `kategori`. Oleh karena itu, hard delete kategori yang masih dirujuk produk (meski sudah soft-deleted) tetap gagal dengan 409. Untuk menghapus kategori tersebut, semua produk yang merujuknya (termasuk yang soft-deleted) harus di-hard delete terlebih dahulu.

  **7. Alasan Hard Delete pada Tabel Induk (Kategori)**
  - Kategori adalah data master yang tidak memiliki kebutuhan riwayat historis di level tabel ini.
  - Hard delete dipilih untuk menjaga tabel `kategori` tetap bersih dari data usang.
  - Proteksi integritas tetap ada melalui foreign key constraint: kategori tidak bisa dihapus selama masih dirujuk produk.

  **8. Tangkapan Layar**
  - Screenshot hasil Collection Runner Folder 1: `![Folder 1 Runner](screenshots/04-runner-folder1-hasil.png)`
  - Screenshot hasil Collection Runner Folder 2: `![Folder 2 Runner](screenshots/05-runner-folder2-hasil.png)`
  - Screenshot bukti soft delete: `![Soft Delete](screenshots/01-soft-delete-deleted-at-terisi.png)`
  - Screenshot bukti restore: `![Restore](screenshots/02-restore-deleted-at-null.png)`
  - Screenshot bukti hard delete: `![Hard Delete](screenshots/03-hard-delete-kategori-hilang.png)`

### Pengecekan Akhir Repository

- [ ] **Task 2** – Verifikasi semua file yang diperlukan ada:
  ```
  api-uts/
  ├── .env.example          ✓
  ├── .gitignore            ✓
  ├── package.json          ✓
  ├── README.md             ✓
  ├── uts.postman_collection.json  ✓
  ├── sql/
  │   ├── schema.sql        ✓
  │   └── seed.sql          ✓
  ├── screenshots/
  │   ├── 01-...png         ✓
  │   ├── 02-...png         ✓
  │   ├── 03-...png         ✓
  │   ├── 04-...png         ✓
  │   └── 05-...png         ✓
  └── src/
      ├── app.js            ✓
      ├── server.js         ✓
      ├── config/db.js      ✓
      ├── routes/           ✓
      ├── middlewares/      ✓
      ├── controllers/      ✓
      └── repositories/     ✓
  ```

- [ ] **Task 3** – Jalankan `git status` dan pastikan:
  - `.env` **tidak** ter-track.
  - `node_modules/` **tidak** ter-track.
  - Semua file penting ter-track.

- [ ] **Task 4** – Jalankan `npm install` dari awal (hapus `node_modules/` sementara, install ulang) untuk memastikan `package.json` mencukupi.

- [ ] **Task 5** – Jalankan `npm start` (bukan `npm run dev`) dan pastikan server berjalan di production mode.

- [ ] **Task 6** – Jalankan Collection Runner untuk Folder 1 dan Folder 2 sekali lagi dari state database yang bersih (dengan seed) untuk memastikan semua test hijau.

### Git & GitHub

- [ ] **Task 7** – Pastikan semua perubahan ter-commit di branch `main`.
- [ ] **Task 8** – Verifikasi judul commit terakhir dan history commit masuk akal.
- [ ] **Task 9** – Push ke GitHub di branch `main`.
- [ ] **Task 10** – Buka repository GitHub dan verifikasi:
  - `.env` tidak ada.
  - `node_modules/` tidak ada.
  - `README.md` tampil dengan benar.
  - Semua file yang diperlukan ada.

## 5. Expected Files

| File | Aksi |
|---|---|
| `README.md` | Dibuat |

## 6. Requirements & Constraints

**README wajib memuat (berdasarkan spesifikasi):**
- [ ] Cara menjalankan server
- [ ] Rancangan tabel dan relasinya
- [ ] Daftar endpoint beserta contoh body
- [ ] Keputusan desain: alasan memilih PUT dan PATCH
- [ ] Perilaku soft delete terhadap UNIQUE dan foreign key
- [ ] Alasan hard delete pada tabel induk
- [ ] Tangkapan layar: hasil Collection Runner (Folder 1 & 2) dan bukti database (Folder 3)

**Repository harus:**
- Cabang: `main`
- Tanpa `.env` dan `node_modules/`
- Berisi `package.json`, `.env.example`, `.gitignore`
- Berisi `sql/schema.sql` dan `sql/seed.sql`
- Berisi `uts.postman_collection.json`

**Judul pengumpulan:** `UTS-PemrogAPI-[namakelompok]`

## 7. Acceptance Criteria

- `README.md` memuat semua 7 bagian yang diwajibkan.
- Semua tangkapan layar tercantum di README dan file PNG-nya ada.
- Repository GitHub bersih: tidak ada `.env` atau `node_modules/`.
- `npm install` + `npm start` berjalan tanpa error dari clone baru.
- Semua test Postman Collection Runner hijau.

## 8. Testing & Verification

```bash
# Simulasi fresh install
# (Hapus node_modules sementara, install ulang)
Remove-Item -Recurse -Force node_modules
npm install
npm start
# Server harus berjalan

# Verifikasi git
git status        # .env dan node_modules tidak muncul
git log --oneline # History commit masuk akal
```

Verifikasi manual:
1. Buka GitHub repository, cek semua file ada dan `.env` tidak ada.
2. Baca README di GitHub, semua bagian ada dan screenshot tampil.

## 9. Definition of Done

- [ ] `README.md` lengkap dengan semua 7 bagian.
- [ ] Semua screenshot tersedia dan tercantum di README.
- [ ] Repository bersih dari `.env` dan `node_modules/`.
- [ ] `npm install` + `npm start` berjalan dari clone baru.
- [ ] Collection Runner Folder 1 dan 2: 0 test gagal.
- [ ] Repository di-push ke GitHub di branch `main`.
- [ ] Siap untuk dikumpulkan dengan judul `UTS-PemrogAPI-[namakelompok]`.

---

**🎉 Project UTS Pemrograman API selesai.**
