# Plan 3 - Database Connection & Application Skeleton

## 1. Objective

Membuat koneksi database menggunakan `pg Pool`, menyusun skeleton `app.js` (Express app tanpa route bisnis), dan `server.js` (HTTP listener). Setelah tahap ini, server bisa berjalan dan merespons request dasar.

## 2. Context

Koneksi PostgreSQL menggunakan `pg.Pool` yang diinstansiasi **sekali** di `config/db.js` dan diekspor. Semua lapisan lain yang perlu query akan mengimpor pool ini. Konfigurasi koneksi dibaca dari file `.env` via `dotenv`.

`app.js` bertanggung jawab menyusun aplikasi Express (middleware, router, error handler). `server.js` hanya memanggil `app.listen()`. Pemisahan ini memudahkan testing dan menjaga tanggung jawab tiap file tetap tunggal (Single Responsibility Principle).

## 3. Prerequisites

- **Plan 1 selesai** – Dependency `express`, `pg`, `dotenv` sudah terinstall.
- **Plan 2 selesai** – Database `db_uts` dan tabel sudah ada.
- File `.env` berisi kredensial database yang benar.

## 4. Tasks

- [ ] **Task 1** – Buat `src/config/db.js`:
  - Panggil `require('dotenv').config()` di awal.
  - Buat instance `Pool` dari `pg` dengan konfigurasi dari `process.env`.
  - Ekspor satu instance Pool (bukan class baru setiap kali).
- [ ] **Task 2** – Buat `src/app.js` dengan struktur dasar:
  - `require('dotenv').config()`
  - `const express = require('express')`
  - `app.use(express.json())` — parse JSON body, termasuk error handler untuk JSON rusak.
  - **Handler JSON rusak:** Pasang error handler tepat setelah `express.json()` untuk menangkap `SyntaxError` dan membalas `400 { status: "error", message: "..." }`.
  - Placeholder untuk router (akan ditambahkan di plan berikutnya).
  - **Handler 404 route:** Middleware yang menangkap semua route tidak dikenal dan membalas `404 { status: "error", message: "Route tidak ditemukan" }`.
  - **Global error handler:** Middleware `(err, req, res, next)` yang membalas `500 { status: "error", message: "Terjadi kesalahan internal server." }` dan hanya mencetak detail error ke `console.error`.
  - Ekspor `app`.
- [ ] **Task 3** – Buat `src/server.js`:
  - Import `app` dari `./app.js`.
  - Baca `PORT` dari `process.env` (default: 3000).
  - Jalankan `app.listen(PORT, callback)` yang mencetak pesan ke console.
- [ ] **Task 4** – Test koneksi database: tambahkan sementara `pool.query('SELECT NOW()')` di `db.js` atau di startup server untuk memverifikasi koneksi. Hapus setelah verifikasi (atau jadikan opsional).
- [ ] **Task 5** – Jalankan `npm run dev` dan verifikasi server berjalan di port 3000.
- [ ] **Task 6** – Test endpoint tidak dikenal menggunakan curl atau Postman untuk memastikan handler 404 dan error handler bekerja.

## 5. Expected Files

| File | Aksi |
|---|---|
| `src/config/db.js` | Dibuat |
| `src/app.js` | Dibuat |
| `src/server.js` | Dibuat |

## 6. Requirements & Constraints

- `pg Pool` dibuat **hanya sekali** di `config/db.js` dan diekspor.
- Konfigurasi koneksi dibaca **sepenuhnya** dari `.env` (tidak ada nilai hardcoded).
- `app.js` mendaftarkan middleware dalam urutan: `express.json()` → JSON error handler → router (placeholder) → 404 handler → global error handler.
- `server.js` **hanya** berisi `app.listen()` — tidak ada logika bisnis, middleware, atau routing.
- JSON rusak (SyntaxError dari `express.json()`) harus dibalas `400`, bukan `500`.
- Error tak terduga harus dibalas `500` dengan **pesan umum**. Detail error PostgreSQL atau stack trace **tidak boleh** bocor ke response klien.
- Detail error hanya dicetak ke `console.error`.

## 7. Acceptance Criteria

- `npm run dev` berjalan tanpa crash dan mencetak pesan server listening.
- `GET http://localhost:3000/rute-tidak-ada` mengembalikan `404` dengan body `{ "status": "error", "message": "Route tidak ditemukan" }`.
- `pool.query('SELECT NOW()')` berhasil (tidak ada error koneksi database).

## 8. Testing & Verification

```bash
# Jalankan server
npm run dev

# Test 404 handler
curl -s http://localhost:3000/rute-tidak-ada
# Expected: {"status":"error","message":"Route tidak ditemukan"}

# Test JSON rusak (akan diuji lebih detail di plan middleware)
curl -s -X POST http://localhost:3000/rute-tidak-ada \
  -H "Content-Type: application/json" \
  -d '{"key": "value",}'
# Expected: 400 dengan message error JSON

# Verifikasi koneksi database (periksa log terminal)
# Harus muncul log sukses koneksi atau waktu server
```

## 9. Definition of Done

- [ ] `src/config/db.js` ada dan mengekspor satu instance Pool.
- [ ] `src/app.js` ada dengan `express.json()`, JSON error handler, 404 handler, dan global error handler.
- [ ] `src/server.js` ada dan hanya berisi `app.listen()`.
- [ ] `npm run dev` berjalan tanpa error.
- [ ] Request ke route tidak dikenal mengembalikan 404 dengan format respons yang benar.
- [ ] Koneksi ke database `db_uts` berhasil.
- [ ] Siap melanjutkan ke Plan 4.
