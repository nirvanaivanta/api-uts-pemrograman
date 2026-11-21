# Plan 10 - Error Handling & HTTP Response Audit

## 1. Objective

Melakukan audit menyeluruh terhadap seluruh endpoint, memastikan format respons konsisten, semua kode status HTTP sesuai spesifikasi, error handling tidak bocorkan detail internal, dan JSON rusak ditangani dengan benar.

## 2. Context

Setelah seluruh endpoint diimplementasikan (Plan 6–9), perlu ada fase konsolidasi untuk memastikan tidak ada inkonsistensi. Ini bukan refactor besar, melainkan pengecekan dan perbaikan detail kecil yang sering terlewat saat implementasi berlangsung cepat.

Fokus utama:
- Format respons seragam di semua endpoint.
- Semua error PostgreSQL ditangani pada level yang tepat (tidak ada yang jatuh ke 500 padahal seharusnya 409 atau 422).
- JSON rusak (SyntaxError dari `express.json()`) menghasilkan 400, bukan 500.
- Route tidak dikenal menghasilkan 404 dengan format yang benar.
- Pesan error PostgreSQL tidak bocor ke response klien.

## 3. Prerequisites

- **Plan 3 selesai** – `app.js` dengan error handler sudah ada.
- **Plan 6–9 selesai** – Seluruh endpoint sudah diimplementasikan.

## 4. Tasks

### Audit Format Respons

- [ ] **Task 1** – Audit semua respons **sukses** memiliki field `status: "success"` dan `message`.
  - GET daftar: harus ada `count` dan `data` (array).
  - GET single / POST / PUT / PATCH: harus ada `data` (objek).
  - DELETE (204): tidak ada body.
  - Restore (200): harus ada `data`.

- [ ] **Task 2** – Audit semua respons **error** memiliki field `status: "error"` dan `message`.
  - Validasi gagal: harus ada `errors` (array string). `errors` **hanya** muncul untuk kegagalan validasi, bukan error database.
  - Database error (409, 422, 404, 500): hanya `status` dan `message`, tanpa `errors`.

- [ ] **Task 3** – Verifikasi bahwa field `errors` tidak muncul di respons non-validasi (misalnya 409 dari database, 404 dari id tidak ada).

### Audit JSON Error Handler

- [ ] **Task 4** – Verifikasi `src/app.js` punya error handler khusus untuk `SyntaxError` **tepat setelah** `app.use(express.json())`:
  ```js
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        status: 'error',
        message: 'JSON tidak valid. Periksa format body request.'
      });
    }
    next(err);
  });
  ```
- [ ] **Task 5** – Test dengan body JSON rusak (koma berlebih, tanda kurung tidak lengkap) → harus 400, bukan 500.

### Audit Global Error Handler

- [ ] **Task 6** – Verifikasi global error handler di akhir `app.js`:
  - Hanya mencetak detail error ke `console.error` (stack trace, pesan PostgreSQL).
  - Mengirim ke klien: `500 { "status": "error", "message": "Terjadi kesalahan internal server." }`.
  - Tidak ada detail PostgreSQL, stack trace, atau pesan teknis di response.

- [ ] **Task 7** – Simulasikan error tak terduga dan pastikan respons hanya berisi pesan umum.

### Audit 404 Route Handler

- [ ] **Task 8** – Verifikasi handler 404 route ada di posisi terakhir sebelum global error handler.
- [ ] **Task 9** – Test dengan URL yang tidak terdaftar: harus 404 dengan `{ "status": "error", "message": "Route tidak ditemukan" }`.

### Audit Kode Status per Endpoint

- [ ] **Task 10** – Buat daftar periksa dan uji setiap kombinasi berikut:

  **Kategori:**
  - [ ] `GET /api/kategori` → 200 ✓
  - [ ] `GET /api/kategori/1` → 200 ✓
  - [ ] `GET /api/kategori/abc` → 400 ✓
  - [ ] `GET /api/kategori/99999` → 404 ✓
  - [ ] `POST /api/kategori` valid → 201 ✓
  - [ ] `POST /api/kategori` nama kosong → 400 ✓
  - [ ] `POST /api/kategori` duplikat → 409 ✓
  - [ ] `DELETE /api/kategori/:id` ada produk → 409 ✓
  - [ ] `DELETE /api/kategori/:id` kosong → 204 ✓
  - [ ] `DELETE /api/kategori/99999` → 404 ✓

  **Produk:**
  - [ ] `GET /api/produk` → 200 ✓
  - [ ] `GET /api/produk/1` → 200 ✓
  - [ ] `GET /api/produk/abc` → 400 ✓
  - [ ] `GET /api/produk/99999` → 404 ✓
  - [ ] `GET /api/kategori/1/produk` → 200 ✓
  - [ ] `GET /api/kategori/99999/produk` → 404 ✓
  - [ ] `POST /api/produk` valid → 201 ✓
  - [ ] `POST /api/produk` validasi gagal → 400 ✓
  - [ ] `POST /api/produk` kategori_id tidak ada → 422 ✓
  - [ ] `POST /api/produk` kode duplikat → 409 ✓
  - [ ] `PUT /api/produk/:id` valid → 200 ✓
  - [ ] `PUT /api/produk/:id` field kurang → 400 ✓
  - [ ] `PUT /api/produk/99999` → 404 ✓
  - [ ] `PATCH /api/produk/:id` valid → 200 ✓
  - [ ] `PATCH /api/produk/:id` body kosong → 400 ✓
  - [ ] `DELETE /api/produk/:id` → 204 ✓
  - [ ] `DELETE /api/produk/:id` sudah terhapus → 404 ✓
  - [ ] `PATCH /api/produk/:id/restore` → 200 ✓
  - [ ] `PATCH /api/produk/:id/restore` sudah aktif → 404 ✓

### Perbaikan

- [ ] **Task 11** – Perbaiki semua inkonsistensi yang ditemukan dari audit di atas.

## 5. Expected Files

| File | Aksi |
|---|---|
| `src/app.js` | Dimodifikasi jika JSON error handler atau 404 handler kurang tepat |
| Controller files | Dimodifikasi jika ada format respons yang tidak konsisten |

## 6. Requirements & Constraints

**Format respons konsisten di SEMUA endpoint:**

```json
// Sukses - daftar
{ "status": "success", "message": "...", "count": n, "data": [...] }

// Sukses - single
{ "status": "success", "message": "...", "data": {...} }

// Sukses - delete (204 NO BODY)

// Error - validasi
{ "status": "error", "message": "Validasi gagal.", "errors": ["pesan1", "pesan2"] }

// Error - non-validasi
{ "status": "error", "message": "..." }
```

- `errors` hanya muncul pada kegagalan validasi field.
- Pesan error PostgreSQL tidak boleh ada di response klien.
- JSON rusak → 400 (bukan 500).
- Route tidak dikenal → 404 dengan pesan "Route tidak ditemukan".

## 7. Acceptance Criteria

- Tidak ada endpoint yang mengembalikan format respons yang berbeda dari spesifikasi.
- JSON rusak menghasilkan 400 yang benar.
- Error server (bug nyata) menghasilkan 500 dengan pesan umum.
- Route tidak dikenal menghasilkan 404 dengan format benar.
- Semua kode status dari daftar Task 10 sudah diverifikasi dan benar.

## 8. Testing & Verification

```bash
# Test JSON rusak (koma berlebih)
curl -s -X POST http://localhost:3000/api/produk \
  -H "Content-Type: application/json" \
  -d '{"kategori_id": 1, "kode_produk": "X",}'
# Expected: 400

# Test route tidak ada
curl -s http://localhost:3000/api/tidak-ada
# Expected: 404 {"status":"error","message":"Route tidak ditemukan"}

# Jalankan semua checklist di Task 10 secara berurutan
```

## 9. Definition of Done

- [ ] Seluruh checklist di Task 10 sudah dijalankan dan hasilnya benar.
- [ ] Format respons konsisten di semua endpoint.
- [ ] JSON rusak → 400.
- [ ] Error server → 500 pesan umum.
- [ ] Route tidak dikenal → 404.
- [ ] Tidak ada bocoran pesan internal PostgreSQL di response.
- [ ] Siap melanjutkan ke Plan 11.
