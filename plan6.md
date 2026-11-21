# Plan 6 - Kategori API (Controller, Routes & Error Handling)

## 1. Objective

Mengimplementasikan seluruh endpoint `/api/kategori`: GET all, GET by id, POST, dan DELETE (hard delete). Termasuk penanganan error 409 Conflict saat hard delete kategori yang masih dirujuk produk.

## 2. Context

Tabel `kategori` menggunakan **hard delete** — baris dihapus permanen dengan `DELETE FROM`. Tidak ada soft delete pada resource ini.

Ketika sebuah kategori dihapus padahal masih ada produk yang merujuknya (termasuk produk yang sudah di-soft delete), PostgreSQL akan melempar error dengan kode `23503` (foreign key violation). Controller harus **menangkap kode ini** dan membalas `409 Conflict` dengan pesan yang jelas, bukan membiarkannya jatuh ke global error handler yang akan membalas 500.

## 3. Prerequisites

- **Plan 3 selesai** – `app.js` dan `server.js` sudah berjalan.
- **Plan 4 selesai** – `kategoriRepository` tersedia.
- **Plan 5 selesai** – `parseId` dan `validateKategori` tersedia.

## 4. Tasks

### Controller (`src/controllers/kategoriController.js`)

- [ ] **Task 1** – Buat `kategoriController.js`. Import `kategoriRepository`.
- [ ] **Task 2** – Implementasikan `getAll(req, res, next)`:
  - Panggil `kategoriRepository.findAll()`.
  - Balas `200 { "status": "success", "message": "...", "count": n, "data": [...] }`.
- [ ] **Task 3** – Implementasikan `getById(req, res, next)`:
  - Panggil `kategoriRepository.findById(req.params.id)`.
  - Jika tidak ditemukan (rows kosong): balas `404`.
  - Jika ditemukan: balas `200 { "status": "success", "data": {...} }`.
- [ ] **Task 4** – Implementasikan `create(req, res, next)`:
  - Ambil `nama_kategori` dan `deskripsi` dari `req.body`.
  - Panggil `kategoriRepository.create(data)`.
  - Tangkap error PostgreSQL kode `23505` (UNIQUE violation) → balas `409 { "status": "error", "message": "nama_kategori sudah digunakan." }`.
  - Jika sukses: balas `201 { "status": "success", "data": {...} }`.
  - Error lain: teruskan ke `next(err)`.
- [ ] **Task 5** – Implementasikan `deleteById(req, res, next)`:
  - Panggil `kategoriRepository.findById(req.params.id)` untuk cek keberadaan.
  - Jika tidak ada: balas `404`.
  - Panggil `kategoriRepository.deleteById(req.params.id)`.
  - Tangkap error PostgreSQL kode `23503` (FK violation) → balas `409 { "status": "error", "message": "Kategori tidak dapat dihapus karena masih memiliki produk." }`.
  - Jika sukses: balas `204` tanpa body.
  - Error lain: teruskan ke `next(err)`.

### Routes (`src/routes/kategoriRoutes.js`)

- [ ] **Task 6** – Buat `kategoriRoutes.js`. Import `express.Router()`, `parseId`, `validateKategori`, dan `kategoriController`.
- [ ] **Task 7** – Daftarkan route:
  - `GET /` → `kategoriController.getAll`
  - `GET /:id` → `parseId`, `kategoriController.getById`
  - `POST /` → `validateKategori`, `kategoriController.create`
  - `DELETE /:id` → `parseId`, `kategoriController.deleteById`
- [ ] **Task 8** – Ekspor router.

### Registrasi di app.js

- [ ] **Task 9** – Di `src/app.js`, import `kategoriRoutes` dan daftarkan: `app.use('/api/kategori', kategoriRoutes)`.

## 5. Expected Files

| File | Aksi |
|---|---|
| `src/controllers/kategoriController.js` | Dibuat |
| `src/routes/kategoriRoutes.js` | Dibuat |
| `src/app.js` | Dimodifikasi (tambahkan route) |

## 6. Requirements & Constraints

**Status HTTP yang wajib:**

| Endpoint | Status |
|---|---|
| GET /api/kategori | 200 |
| GET /api/kategori/:id | 200, 400 (id invalid), 404 (tidak ada) |
| POST /api/kategori | 201, 400 (validasi), 409 (duplikat nama) |
| DELETE /api/kategori/:id | 204, 400 (id invalid), 404 (tidak ada), 409 (masih dirujuk produk) |

**Format respons sukses (GET all):**
```json
{
  "status": "success",
  "message": "Berhasil mengambil data kategori.",
  "count": 3,
  "data": [...]
}
```

**Format respons sukses (GET/POST single):**
```json
{
  "status": "success",
  "message": "...",
  "data": { "id": 1, "nama_kategori": "...", ... }
}
```

**Format respons error:**
```json
{
  "status": "error",
  "message": "..."
}
```

**Aturan 409 pada DELETE:**
- Error PostgreSQL kode `23503` → `409 Conflict`.
- Ini berlaku meski produk yang merujuk sudah di-soft delete (baris masih ada di tabel).
- Pesan harus jelas, bukan pesan internal PostgreSQL.

**Controller dilarang menulis SQL** — hanya memanggil repository.

## 7. Acceptance Criteria

- `GET /api/kategori` mengembalikan 200 dengan array data dan `count`.
- `GET /api/kategori/1` mengembalikan 200 dengan satu objek.
- `GET /api/kategori/abc` mengembalikan 400.
- `GET /api/kategori/99999` mengembalikan 404.
- `POST /api/kategori` dengan body valid mengembalikan 201.
- `POST /api/kategori` dengan `nama_kategori: ""` mengembalikan 400.
- `POST /api/kategori` dengan nama duplikat mengembalikan 409.
- `DELETE /api/kategori/:id` pada kategori yang punya produk mengembalikan 409.
- `DELETE /api/kategori/:id` pada kategori kosong mengembalikan 204.
- `DELETE /api/kategori/99999` mengembalikan 404.
- Pesan internal PostgreSQL tidak bocor ke response.

## 8. Testing & Verification

```bash
# GET all
curl -s http://localhost:3000/api/kategori

# GET by id
curl -s http://localhost:3000/api/kategori/1
curl -s http://localhost:3000/api/kategori/abc    # Harus 400
curl -s http://localhost:3000/api/kategori/99999  # Harus 404

# POST sukses
curl -s -X POST http://localhost:3000/api/kategori \
  -H "Content-Type: application/json" \
  -d '{"nama_kategori": "Test Kategori", "deskripsi": "Deskripsi"}'

# POST error validasi
curl -s -X POST http://localhost:3000/api/kategori \
  -H "Content-Type: application/json" \
  -d '{"nama_kategori": ""}'

# POST duplikat (jalankan POST yang sama dua kali)

# DELETE pada kategori yang punya produk (seed data)
curl -s -X DELETE http://localhost:3000/api/kategori/1
# Harus 409

# DELETE kategori kosong (buat dulu lewat POST, lalu delete)
```

## 9. Definition of Done

- [ ] `src/controllers/kategoriController.js` ada dengan 4 method.
- [ ] `src/routes/kategoriRoutes.js` ada dengan 4 route terdaftar.
- [ ] `src/app.js` sudah mendaftarkan `/api/kategori`.
- [ ] Semua status HTTP sesuai spesifikasi.
- [ ] Error PostgreSQL 23503 pada DELETE ditangkap dan dibalas 409.
- [ ] Error PostgreSQL 23505 pada POST ditangkap dan dibalas 409.
- [ ] Pesan internal database tidak bocor ke response.
- [ ] Siap melanjutkan ke Plan 7.
