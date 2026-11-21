# Plan 8 - Produk API: POST, PUT, PATCH

## 1. Objective

Mengimplementasikan endpoint POST (tambah produk), PUT (ganti seluruh data), dan PATCH (ubah sebagian data) untuk resource `produk`. Termasuk penanganan error 409 (kode_produk duplikat) dan 422 (kategori_id tidak ada).

## 2. Context

Ketiga endpoint ini mengubah data produk dan memiliki validasi ketat. Perbedaan utama:
- **POST**: Semua field wajib, membuat baris baru.
- **PUT**: Semua field wajib, mengganti seluruh data baris yang ada. Ditolak 400 jika ada field yang kurang.
- **PATCH**: Hanya field yang dikirim yang diperbarui. Body kosong `{}` ditolak 400. Hanya produk aktif yang bisa diubah.

Kode error PostgreSQL `23503` pada INSERT/UPDATE artinya `kategori_id` tidak ada di tabel `kategori` → balas **422 Unprocessable Entity**. Ini berbeda dari kasus DELETE kategori yang juga menghasilkan `23503` tapi dibalas **409**. Perbedaannya ada pada **konteks operasi**: di sini client mengirim data yang salah (referensi tidak valid), bukan konflik resource.

## 3. Prerequisites

- **Plan 4 selesai** – `produkRepository` tersedia dengan `create`, `update`, `patch`.
- **Plan 5 selesai** – `validateProduk` dan `validatePatchProduk` tersedia.
- **Plan 7 selesai** – `produkController.js` sudah ada dengan GET methods.

## 4. Tasks

### Controller: POST, PUT, PATCH (`src/controllers/produkController.js`)

- [ ] **Task 1** – Tambahkan fungsi helper private `handleProdukDbError(err, res, next)` di dalam file controller untuk menangani error database yang berulang:
  - Kode `23505` (UNIQUE violation pada `kode_produk`) → `409 { "status": "error", "message": "kode_produk sudah digunakan." }`.
  - Kode `23503` (FK violation pada INSERT/UPDATE `kategori_id`) → `422 { "status": "error", "message": "kategori_id tidak ditemukan." }`.
  - Error lain → teruskan ke `next(err)`.

- [ ] **Task 2** – Implementasikan `create(req, res, next)`:
  - Ambil field: `kategori_id`, `kode_produk`, `nama_produk`, `harga`, `stok` dari `req.body`.
  - Panggil `produkRepository.create(data)`.
  - Gunakan helper untuk menangani DB error.
  - Jika sukses: balas `201 { "status": "success", "data": {...} }`. Pastikan `deleted_at: null` ada di response.

- [ ] **Task 3** – Implementasikan `update(req, res, next)` (PUT):
  - Ambil semua field dari `req.body`.
  - Cek produk ada dan aktif: panggil `findById`. Jika tidak ada: balas `404`.
  - Panggil `produkRepository.update(id, data)`.
  - Gunakan helper untuk menangani DB error.
  - Jika sukses: balas `200 { "status": "success", "data": {...} }`.

- [ ] **Task 4** – Implementasikan `patch(req, res, next)` (PATCH):
  - Ambil field yang hadir dari `req.body` (abaikan field yang tidak dikirim).
  - Cek produk ada dan aktif: panggil `findById`. Jika tidak ada: balas `404`.
  - Panggil `produkRepository.patch(id, fields)`.
  - Gunakan helper untuk menangani DB error.
  - Jika sukses: balas `200 { "status": "success", "data": {...} }`.

### Routes (`src/routes/produkRoutes.js`)

- [ ] **Task 5** – Tambahkan route POST, PUT, PATCH ke `produkRoutes.js`:
  - `POST /` → `validateProduk`, `produkController.create`
  - `PUT /:id` → `parseId`, `validateProduk`, `produkController.update`
  - `PATCH /:id` → `parseId`, `validatePatchProduk`, `produkController.patch`

## 5. Expected Files

| File | Aksi |
|---|---|
| `src/controllers/produkController.js` | Dimodifikasi (tambah POST, PUT, PATCH) |
| `src/routes/produkRoutes.js` | Dimodifikasi (tambah route POST, PUT, PATCH) |

## 6. Requirements & Constraints

**Status HTTP yang wajib:**

| Endpoint | Status |
|---|---|
| POST /api/produk | 201, 400 (validasi), 409 (kode duplikat), 422 (kategori tidak ada) |
| PUT /api/produk/:id | 200, 400 (id invalid/field kurang), 404, 409, 422 |
| PATCH /api/produk/:id | 200, 400 (id invalid/body kosong/nilai invalid), 404, 409, 422 |

**Aturan PUT:**
- Semua field wajib ada di body. Jika ada yang kurang → 400 (ditangkap middleware `validateProduk`).
- Hanya memperbarui produk aktif (`deleted_at IS NULL`).

**Aturan PATCH:**
- Body `{}` → 400 (ditangkap middleware `validatePatchProduk`).
- Field yang tidak dikirim tidak diubah.
- Hanya memperbarui produk aktif.

**Aturan kode error PostgreSQL:**
- `23505` pada INSERT/UPDATE → `409` (kode_produk duplikat).
- `23503` pada INSERT/UPDATE → `422` (kategori_id tidak valid).
- Pesan internal PostgreSQL **tidak boleh** bocor ke response.

**Format respons POST sukses:**
```json
{
  "status": "success",
  "message": "Produk berhasil ditambahkan.",
  "data": {
    "id": 6,
    "kategori_id": 1,
    "kode_produk": "PRD-006",
    "nama_produk": "Produk Baru",
    "harga": 50000,
    "stok": 10,
    "created_at": "...",
    "deleted_at": null
  }
}
```

## 7. Acceptance Criteria

- `POST /api/produk` dengan body valid mengembalikan 201 dengan `deleted_at: null`.
- `POST /api/produk` dengan `harga: -5` dan `stok: "banyak"` mengembalikan 400 dengan **dua pesan** di `errors`.
- `POST /api/produk` dengan `kategori_id: 99999` mengembalikan 422.
- `POST /api/produk` dengan `kode_produk` duplikat mengembalikan 409.
- `PUT /api/produk/:id` dengan semua field lengkap mengembalikan 200.
- `PUT /api/produk/:id` dengan field kurang mengembalikan 400.
- `PATCH /api/produk/:id` dengan body `{ "stok": 40 }` mengembalikan 200 dengan hanya `stok` berubah.
- `PATCH /api/produk/:id` dengan body `{}` mengembalikan 400.
- PUT dan PATCH pada produk soft-deleted mengembalikan 404.

## 8. Testing & Verification

```bash
# POST sukses
curl -s -X POST http://localhost:3000/api/produk \
  -H "Content-Type: application/json" \
  -d '{"kategori_id":1,"kode_produk":"PRD-NEW","nama_produk":"Test","harga":10000,"stok":5}'

# POST error validasi (dua error sekaligus)
curl -s -X POST http://localhost:3000/api/produk \
  -H "Content-Type: application/json" \
  -d '{"kategori_id":1,"kode_produk":"PRD-X","nama_produk":"Test","harga":-5,"stok":"banyak"}'

# POST kategori_id tidak ada
curl -s -X POST http://localhost:3000/api/produk \
  -H "Content-Type: application/json" \
  -d '{"kategori_id":99999,"kode_produk":"PRD-Y","nama_produk":"Test","harga":1000,"stok":0}'

# PUT lengkap
curl -s -X PUT http://localhost:3000/api/produk/1 \
  -H "Content-Type: application/json" \
  -d '{"kategori_id":1,"kode_produk":"PRD-001-UPDATED","nama_produk":"Nama Baru","harga":20000,"stok":8}'

# PUT tidak lengkap (harus 400)
curl -s -X PUT http://localhost:3000/api/produk/1 \
  -H "Content-Type: application/json" \
  -d '{"nama_produk":"Hanya Nama"}'

# PATCH
curl -s -X PATCH http://localhost:3000/api/produk/1 \
  -H "Content-Type: application/json" \
  -d '{"stok":40}'

# PATCH body kosong (harus 400)
curl -s -X PATCH http://localhost:3000/api/produk/1 \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 9. Definition of Done

- [ ] `produkController.js` sudah punya method `create`, `update`, `patch`.
- [ ] `produkRoutes.js` sudah punya route POST, PUT, PATCH dengan middleware yang benar.
- [ ] 409 muncul untuk kode_produk duplikat.
- [ ] 422 muncul untuk kategori_id yang tidak ada.
- [ ] 400 muncul untuk PUT dengan field kurang.
- [ ] 400 muncul untuk PATCH dengan body kosong.
- [ ] Pesan internal database tidak bocor ke response.
- [ ] Siap melanjutkan ke Plan 9.
