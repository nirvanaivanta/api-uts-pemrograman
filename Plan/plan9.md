# Plan 9 - Soft Delete, Restore & Hard Delete Produk

## 1. Objective

Mengimplementasikan endpoint soft delete (`DELETE /api/produk/:id`), restore (`PATCH /api/produk/:id/restore`), dan hard delete nilai tambah (`DELETE /api/produk/:id/permanent`). Memastikan seluruh aturan interaksi soft delete dengan constraint database berjalan benar.

## 2. Context

**Soft Delete** berarti baris produk **tidak dihapus** dari tabel, melainkan kolom `deleted_at` diisi dengan waktu sekarang. Baris dengan `deleted_at IS NOT NULL` dianggap "tidak ada" oleh API.

**Restore** membalik soft delete dengan mengisi `deleted_at = NULL`. Hanya bisa dilakukan pada produk yang sedang dalam status terhapus.

**Implikasi desain yang harus dipahami (dan dijelaskan di README):**

1. **Soft delete + Foreign Key**: Produk yang di-soft delete tetap ada sebagai baris di tabel, sehingga `kategori_id` tetap aktif sebagai referensi. Hard delete `kategori` yang masih dirujuk produk soft-deleted tetap akan menghasilkan 409.

2. **Soft delete + UNIQUE constraint**: `kode_produk` milik produk yang di-soft delete tetap "dikunci" di kolom UNIQUE. Upaya membuat produk baru dengan kode yang sama akan menghasilkan 409. Ini adalah keputusan desain yang disengaja.

**Hard delete nilai tambah** hanya berlaku untuk baris yang **sudah** di-soft delete. Produk aktif tidak bisa di-hard delete melalui endpoint ini (balas 409).

## 3. Prerequisites

- **Plan 4 selesai** – `produkRepository` tersedia dengan `softDelete`, `restore`, `hardDelete`.
- **Plan 5 selesai** – `parseId` tersedia.
- **Plan 7 & 8 selesai** – `produkController.js` dan `produkRoutes.js` sudah ada.

## 4. Tasks

### Controller: Delete & Restore (`src/controllers/produkController.js`)

- [ ] **Task 1** – Implementasikan `softDelete(req, res, next)`:
  - Panggil `produkRepository.softDelete(req.params.id)`.
  - Query di repository: `UPDATE produk SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`.
  - Jika `RETURNING *` mengembalikan 0 baris: balas `404` (produk tidak ada atau sudah terhapus).
  - Jika berhasil: balas `204` tanpa body.

- [ ] **Task 2** – Implementasikan `restore(req, res, next)`:
  - Panggil `produkRepository.restore(req.params.id)`.
  - Query di repository: `UPDATE produk SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *`.
  - Jika `RETURNING *` mengembalikan 0 baris: balas `404` (produk tidak ditemukan atau tidak sedang terhapus).
  - Jika berhasil: balas `200 { "status": "success", "data": {...} }` dengan data produk setelah restore.

- [ ] **Task 3** – *(Nilai tambah)* Implementasikan `hardDeletePermanent(req, res, next)`:
  - Ambil `req.params.id`.
  - Cek apakah produk ada (termasuk yang sudah soft-deleted): query tanpa filter `deleted_at IS NULL`.
  - Jika tidak ada sama sekali: balas `404`.
  - Jika ada tetapi **aktif** (deleted_at IS NULL): balas `409 { "status": "error", "message": "Produk aktif tidak dapat dihapus permanen. Lakukan soft delete terlebih dahulu." }`.
  - Panggil `produkRepository.hardDelete(id)` yang menjalankan `DELETE FROM produk WHERE id = $1 AND deleted_at IS NOT NULL`.
  - Jika berhasil: balas `204` tanpa body.

### Routes (`src/routes/produkRoutes.js`)

- [ ] **Task 4** – Tambahkan route:
  - `DELETE /:id` → `parseId`, `produkController.softDelete`
  - `PATCH /:id/restore` → `parseId`, `produkController.restore`
  - *(Nilai tambah)* `DELETE /:id/permanent` → `parseId`, `produkController.hardDeletePermanent`

> **Catatan urutan route**: Route `/:id/restore` harus didaftarkan **sebelum** `/:id` agar tidak bertabrakan. Periksa urutan pendaftaran route di `produkRoutes.js`.

### Repository: Tambahan method

- [ ] **Task 5** – Pastikan `produkRepository.js` punya method untuk mengecek produk tanpa filter `deleted_at` (untuk keperluan hard delete nilai tambah). Tambahkan `findByIdIncludeDeleted(id)` jika belum ada.

## 5. Expected Files

| File | Aksi |
|---|---|
| `src/controllers/produkController.js` | Dimodifikasi (tambah softDelete, restore, hardDeletePermanent) |
| `src/routes/produkRoutes.js` | Dimodifikasi (tambah route DELETE dan PATCH restore) |
| `src/repositories/produkRepository.js` | Dimodifikasi jika perlu (tambah findByIdIncludeDeleted) |

## 6. Requirements & Constraints

**Status HTTP yang wajib:**

| Endpoint | Status |
|---|---|
| DELETE /api/produk/:id | 204, 400 (id invalid), 404 (tidak ada atau sudah terhapus) |
| PATCH /api/produk/:id/restore | 200, 400 (id invalid), 404 (tidak ada atau masih aktif) |
| DELETE /api/produk/:id/permanent | 204, 400 (id invalid), 404 (tidak ada), 409 (produk masih aktif) |

**Aturan soft delete:**
- Soft delete kedua pada id yang sama → 404.
- Produk yang terhapus tidak terlihat oleh GET endpoints.
- Baris tetap ada di tabel (hanya `deleted_at` yang diisi).

**Aturan restore:**
- Hanya bisa untuk produk yang sedang terhapus (deleted_at IS NOT NULL).
- Produk aktif atau tidak ada → 404.

**Aturan hard delete nilai tambah:**
- Hanya untuk produk yang sudah di-soft delete.
- Produk aktif → 409.
- Setelah hard delete, baris benar-benar hilang dari tabel.

**Implikasi yang harus dipahami:**
- Produk soft-deleted tetap memblokir hard delete kategori (FK masih aktif) → 409 pada `DELETE /api/kategori/:id`.
- `kode_produk` produk soft-deleted tetap memblokir pembuatan produk dengan kode sama → 409 pada `POST /api/produk`.

## 7. Acceptance Criteria

- `DELETE /api/produk/1` mengembalikan 204, baris masih ada di tabel tapi `deleted_at` terisi.
- `DELETE /api/produk/1` kedua kali → 404.
- `GET /api/produk/1` setelah soft delete → 404.
- `PATCH /api/produk/1/restore` → 200, `deleted_at` kembali NULL.
- `PATCH /api/produk/1/restore` kedua kali → 404.
- `DELETE /api/kategori/:id` pada kategori yang produknya sudah di-soft delete → tetap 409.
- *(Nilai tambah)* `DELETE /api/produk/1/permanent` pada produk aktif → 409.
- *(Nilai tambah)* `DELETE /api/produk/1/permanent` pada produk soft-deleted → 204, baris hilang dari tabel.

## 8. Testing & Verification

```bash
# Soft delete
curl -s -X DELETE http://localhost:3000/api/produk/1
# Expected: 204

# Verifikasi baris masih ada di DB
# psql: SELECT id, deleted_at FROM produk WHERE id = 1;
# Harus ada dengan deleted_at terisi

# GET setelah soft delete harus 404
curl -s http://localhost:3000/api/produk/1

# Soft delete kedua harus 404
curl -s -X DELETE http://localhost:3000/api/produk/1

# Restore
curl -s -X PATCH http://localhost:3000/api/produk/1/restore
# Expected: 200 dengan data

# Restore kedua harus 404
curl -s -X PATCH http://localhost:3000/api/produk/1/restore

# Hard delete nilai tambah (soft delete dulu, baru permanent)
curl -s -X DELETE http://localhost:3000/api/produk/2
curl -s -X DELETE http://localhost:3000/api/produk/2/permanent
# Expected: 204

# Verifikasi baris benar-benar hilang
# psql: SELECT * FROM produk WHERE id = 2;
# Harus kosong
```

## 9. Definition of Done

- [ ] Soft delete mengisi `deleted_at` tanpa menghapus baris.
- [ ] Soft delete kedua pada id sama menghasilkan 404.
- [ ] GET produk soft-deleted menghasilkan 404.
- [ ] Restore mengembalikan `deleted_at` ke NULL.
- [ ] Restore pada produk aktif atau tidak ada menghasilkan 404.
- [ ] DELETE kategori yang produknya soft-deleted tetap 409.
- [ ] *(Nilai tambah)* `DELETE /permanent` bekerja hanya pada produk soft-deleted.
- [ ] *(Nilai tambah)* `DELETE /permanent` pada produk aktif menghasilkan 409.
- [ ] Siap melanjutkan ke Plan 10.
