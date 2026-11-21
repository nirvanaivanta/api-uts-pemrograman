# Plan 7 - Produk API: GET Endpoints

## 1. Objective

Mengimplementasikan semua endpoint GET untuk resource `produk`: daftar semua produk aktif, detail satu produk aktif, dan daftar produk aktif milik satu kategori (nested route). Termasuk fitur nilai tambah filter `?kategori_id=`.

## 2. Context

Semua endpoint GET produk **hanya menampilkan produk aktif** (`deleted_at IS NULL`). Produk yang sudah di-soft delete tidak akan muncul di response. Ini diimplementasikan di repository layer, controller tidak perlu memfilter ulang.

Endpoint nested `GET /api/kategori/:id/produk` mengembalikan 200 (bukan 404) meski tidak ada produk aktif di kategori tersebut — selama kategorinya sendiri ada. Jika kategorinya tidak ada, baru kembalikan 404.

## 3. Prerequisites

- **Plan 4 selesai** – `produkRepository` tersedia dengan `findAll`, `findById`, `findByKategoriId`.
- **Plan 5 selesai** – `parseId` tersedia.
- **Plan 6 selesai** – `app.js` sudah bisa menerima route baru; `kategoriRepository` tersedia.

## 4. Tasks

### Controller: GET methods (`src/controllers/produkController.js`)

- [ ] **Task 1** – Buat `produkController.js`. Import `produkRepository` dan `kategoriRepository`.
- [ ] **Task 2** – Implementasikan `getAll(req, res, next)`:
  - Periksa query param `kategori_id` (nilai tambah). Jika ada, validasi bahwa nilainya integer >= 1; jika tidak valid, balas 400.
  - Panggil `produkRepository.findAll(kategoriId)` (opsional param).
  - Balas `200 { "status": "success", "count": n, "data": [...] }`.
- [ ] **Task 3** – Implementasikan `getById(req, res, next)`:
  - Panggil `produkRepository.findById(req.params.id)`.
  - Jika tidak ditemukan atau `rows.length === 0`: balas `404`.
  - Jika ditemukan: balas `200 { "status": "success", "data": {...} }`.
- [ ] **Task 4** – Implementasikan `getByKategori(req, res, next)`:
  - Verifikasi kategori ada: panggil `kategoriRepository.findById(req.params.id)`.
  - Jika kategori tidak ada: balas `404 { "status": "error", "message": "Kategori tidak ditemukan." }`.
  - Panggil `produkRepository.findByKategoriId(req.params.id)`.
  - Balas `200 { "status": "success", "count": n, "data": [...] }` — meski array kosong, tetap 200.

### Routes (`src/routes/produkRoutes.js`)

- [ ] **Task 5** – Buat `produkRoutes.js`. Import `express.Router()`, `parseId`, dan `produkController`.
- [ ] **Task 6** – Daftarkan route GET:
  - `GET /` → `produkController.getAll`
  - `GET /:id` → `parseId`, `produkController.getById`
- [ ] **Task 7** – Ekspor router.

### Route Nested di kategoriRoutes

- [ ] **Task 8** – Di `src/routes/kategoriRoutes.js`, tambahkan route:
  - `GET /:id/produk` → `parseId`, `produkController.getByKategori`
  - Import `produkController` di `kategoriRoutes.js`.

### Registrasi di app.js

- [ ] **Task 9** – Di `src/app.js`, import `produkRoutes` dan daftarkan: `app.use('/api/produk', produkRoutes)`.

## 5. Expected Files

| File | Aksi |
|---|---|
| `src/controllers/produkController.js` | Dibuat (GET methods) |
| `src/routes/produkRoutes.js` | Dibuat |
| `src/routes/kategoriRoutes.js` | Dimodifikasi (tambah nested route) |
| `src/app.js` | Dimodifikasi (tambah `/api/produk`) |

## 6. Requirements & Constraints

**Status HTTP yang wajib:**

| Endpoint | Status |
|---|---|
| GET /api/produk | 200 |
| GET /api/produk?kategori_id=1 | 200 (nilai tambah) |
| GET /api/produk/:id | 200, 400 (id invalid), 404 (tidak ada atau terhapus) |
| GET /api/kategori/:id/produk | 200, 400 (id invalid), 404 (kategori tidak ada) |

**Format respons GET daftar:**
```json
{
  "status": "success",
  "message": "Berhasil mengambil data produk.",
  "count": 5,
  "data": [
    {
      "id": 1,
      "kategori_id": 1,
      "kode_produk": "PRD-001",
      "nama_produk": "Laptop",
      "harga": 15000000,
      "stok": 10,
      "created_at": "...",
      "deleted_at": null
    }
  ]
}
```

**Format respons GET single:**
```json
{
  "status": "success",
  "message": "Berhasil mengambil detail produk.",
  "data": { ... }
}
```

**Aturan GET nested:**
- Kategori tidak ada → 404 dengan pesan tentang kategori.
- Kategori ada tapi tidak punya produk aktif → 200 dengan `count: 0, data: []`.

**Produk terhapus (soft delete):**
- `GET /api/produk/:id` pada produk yang sudah di-soft delete → 404 (seperti tidak ada).

## 7. Acceptance Criteria

- `GET /api/produk` mengembalikan hanya produk aktif (deleted_at IS NULL).
- `GET /api/produk/:id` mengembalikan 404 untuk produk yang di-soft delete.
- `GET /api/kategori/1/produk` mengembalikan produk aktif kategori 1.
- `GET /api/kategori/99999/produk` mengembalikan 404.
- `GET /api/kategori/1/produk` pada kategori tanpa produk aktif mengembalikan 200 dengan array kosong.
- `count` selalu ada dan sesuai jumlah `data`.

## 8. Testing & Verification

```bash
# GET semua produk (hanya aktif)
curl -s http://localhost:3000/api/produk

# GET by id
curl -s http://localhost:3000/api/produk/1
curl -s http://localhost:3000/api/produk/abc    # Harus 400
curl -s http://localhost:3000/api/produk/99999  # Harus 404

# GET produk per kategori
curl -s http://localhost:3000/api/kategori/1/produk
curl -s http://localhost:3000/api/kategori/99999/produk  # Harus 404

# Nilai tambah: filter kategori_id
curl -s "http://localhost:3000/api/produk?kategori_id=1"
```

## 9. Definition of Done

- [ ] `src/controllers/produkController.js` ada dengan 3 GET method.
- [ ] `src/routes/produkRoutes.js` ada dengan route GET terdaftar.
- [ ] `src/routes/kategoriRoutes.js` sudah punya route nested `/:id/produk`.
- [ ] `src/app.js` sudah mendaftarkan `/api/produk`.
- [ ] Semua status HTTP sesuai spesifikasi.
- [ ] Produk soft-deleted tidak muncul di response GET.
- [ ] GET nested mengembalikan 404 jika kategori tidak ada.
- [ ] GET nested mengembalikan 200 dengan array kosong jika kategori ada tapi tidak punya produk.
- [ ] Siap melanjutkan ke Plan 8.
