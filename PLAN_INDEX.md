# PLAN INDEX - UTS Pemrograman API

Dokumen ini adalah indeks master untuk seluruh rencana pengerjaan project UTS Pemrograman API. File `plan.md` tetap menjadi **sumber kebenaran utama** (master specification). File `plan1.md` hingga `plan14.md` adalah instruksi pengerjaan per fase.

---

## Daftar Plan & Deskripsi

| # | File | Nama Tahapan | Deskripsi Singkat |
|---|---|---|---|
| 1 | `plan1.md` | Project Initialization & Environment Setup | Inisialisasi project Node.js, struktur folder, `.env`, `.gitignore`, Git setup |
| 2 | `plan2.md` | Database Schema & Seed Data | DDL tabel `kategori` dan `produk`, data awal minimal 3+5 baris |
| 3 | `plan3.md` | Database Connection & Application Skeleton | `pg Pool` di `config/db.js`, skeleton `app.js` dan `server.js`, JSON error handler, 404 handler, global error handler |
| 4 | `plan4.md` | Repository Layer | Semua method SQL di `kategoriRepository` dan `produkRepository` sebagai singleton |
| 5 | `plan5.md` | Middleware: parseId & Validasi | `parseId`, `validateKategori`, `validateProduk`, `validatePatchProduk` |
| 6 | `plan6.md` | Kategori API | GET all, GET by id, POST, DELETE (hard delete) + 409 handling |
| 7 | `plan7.md` | Produk API: GET Endpoints | GET daftar, GET by id, GET nested `/kategori/:id/produk`, filter nilai tambah |
| 8 | `plan8.md` | Produk API: POST, PUT, PATCH | Tambah, replace, dan update parsial produk; 409/422 handling |
| 9 | `plan9.md` | Soft Delete, Restore & Hard Delete Produk | Soft delete, restore, hard delete nilai tambah; implikasi FK dan UNIQUE |
| 10 | `plan10.md` | Error Handling & HTTP Response Audit | Audit format respons, kode status, JSON error, 500 handler, kebocoran pesan DB |
| 11 | `plan11.md` | Postman Collection: Setup & Folder 1 | Environment, collection, Folder 1 Alur Utama (S01–S15) |
| 12 | `plan12.md` | Postman Collection: Folder 2 | Folder 2 Skenario Error (N01–N14) |
| 13 | `plan13.md` | Database Verification & Bukti Delete | Folder 3 Bukti Delete, screenshot psql/pgAdmin |
| 14 | `plan14.md` | README & Finalisasi Repository | README lengkap, pengecekan akhir, push GitHub |

---

## Urutan Pengerjaan

```
Plan 1 → Plan 2 → Plan 3 → Plan 4 → Plan 5
                                        ↓
                          Plan 6 → Plan 7 → Plan 8 → Plan 9
                                                        ↓
                                                    Plan 10
                                                        ↓
                                          Plan 11 → Plan 12 → Plan 13
                                                                  ↓
                                                              Plan 14
```

---

## Dependency Antar-Plan

| Plan | Bergantung Pada |
|---|---|
| Plan 1 | — (tidak ada prerequisite) |
| Plan 2 | Plan 1 |
| Plan 3 | Plan 1, Plan 2 |
| Plan 4 | Plan 2, Plan 3 |
| Plan 5 | Plan 1, Plan 3 |
| Plan 6 | Plan 3, Plan 4, Plan 5 |
| Plan 7 | Plan 4, Plan 5, Plan 6 |
| Plan 8 | Plan 4, Plan 5, Plan 7 |
| Plan 9 | Plan 4, Plan 5, Plan 7, Plan 8 |
| Plan 10 | Plan 3, Plan 6, Plan 7, Plan 8, Plan 9 |
| Plan 11 | Plan 10 |
| Plan 12 | Plan 11 |
| Plan 13 | Plan 11, Plan 12 |
| Plan 14 | Plan 1–13 (semua) |

---

## Checklist Progres Keseluruhan

### Fase 1: Fondasi
- [ ] **Plan 1** – Project initialization & environment setup
- [ ] **Plan 2** – Database schema & seed data
- [ ] **Plan 3** – Database connection & application skeleton

### Fase 2: Backend Core
- [ ] **Plan 4** – Repository layer
- [ ] **Plan 5** – Middleware: parseId & validasi

### Fase 3: API Endpoints
- [ ] **Plan 6** – Kategori API (GET, POST, DELETE)
- [ ] **Plan 7** – Produk API: GET endpoints
- [ ] **Plan 8** – Produk API: POST, PUT, PATCH
- [ ] **Plan 9** – Soft delete, restore & hard delete produk

### Fase 4: Quality Assurance
- [ ] **Plan 10** – Error handling & HTTP response audit

### Fase 5: Pengujian & Dokumentasi
- [ ] **Plan 11** – Postman Collection: setup & Folder 1 (Alur Utama)
- [ ] **Plan 12** – Postman Collection: Folder 2 (Skenario Error)
- [ ] **Plan 13** – Database verification & bukti delete
- [ ] **Plan 14** – README & finalisasi repository

---

## Coverage Matrix — Requirement vs Plan

| Requirement dari plan.md | Plan yang Menangani |
|---|---|
| Struktur folder sesuai spesifikasi | Plan 1 |
| `.env`, `.env.example`, `.gitignore` | Plan 1 |
| `sql/schema.sql` — DDL tabel | Plan 2 |
| `sql/seed.sql` — data awal | Plan 2 |
| `config/db.js` — pg Pool | Plan 3 |
| `app.js` — express.json, error handler | Plan 3 |
| `server.js` — listen only | Plan 3 |
| `kategoriRepository` — semua method | Plan 4 |
| `produkRepository` — semua method | Plan 4 |
| `middlewares/parseId.js` | Plan 5 |
| `middlewares/validateKategori.js` | Plan 5 |
| `middlewares/validateProduk.js` | Plan 5 |
| GET /api/kategori | Plan 6 |
| GET /api/kategori/:id | Plan 6 |
| POST /api/kategori | Plan 6 |
| DELETE /api/kategori/:id (hard delete) | Plan 6 |
| 409 pada FK violation saat DELETE kategori | Plan 6 |
| GET /api/produk | Plan 7 |
| GET /api/produk/:id | Plan 7 |
| GET /api/kategori/:id/produk (nested) | Plan 7 |
| Filter ?kategori_id= (nilai tambah) | Plan 7 |
| POST /api/produk | Plan 8 |
| PUT /api/produk/:id | Plan 8 |
| PATCH /api/produk/:id | Plan 8 |
| 409 kode_produk duplikat | Plan 8 |
| 422 kategori_id tidak ada | Plan 8 |
| DELETE /api/produk/:id (soft delete) | Plan 9 |
| PATCH /api/produk/:id/restore | Plan 9 |
| DELETE /api/produk/:id/permanent (nilai tambah) | Plan 9 |
| Implikasi soft delete + FK | Plan 9, Plan 14 |
| Implikasi soft delete + UNIQUE | Plan 9, Plan 14 |
| JSON rusak → 400 | Plan 3, Plan 10 |
| Error server → 500 pesan umum | Plan 3, Plan 10 |
| Route tidak dikenal → 404 | Plan 3, Plan 10 |
| Format respons konsisten | Plan 10 |
| Postman Environment (4 variabel) | Plan 11 |
| Folder 1: Alur Utama S01–S15 | Plan 11 |
| Folder 2: Skenario Error N01–N14 | Plan 12 |
| Folder 3: Bukti Delete | Plan 13 |
| Screenshot Runner Folder 1 & 2 | Plan 11, Plan 12, Plan 13 |
| Screenshot psql/pgAdmin (3 kondisi) | Plan 13 |
| `uts.postman_collection.json` | Plan 11 |
| README — cara menjalankan | Plan 14 |
| README — rancangan tabel | Plan 14 |
| README — daftar endpoint + contoh body | Plan 14 |
| README — keputusan desain PUT vs PATCH | Plan 14 |
| README — perilaku soft delete + UNIQUE + FK | Plan 14 |
| README — alasan hard delete kategori | Plan 14 |
| README — tangkapan layar | Plan 14 |
| Repository GitHub bersih (tanpa .env, node_modules) | Plan 14 |
| Branch main | Plan 14 |

---

## Catatan Teknis

### Ambiguitas & Keputusan Desain

1. **Kode error 23503 dipakai di dua konteks berbeda:**
   - DELETE kategori (FK violation) → **409 Conflict**. Alasan: resource yang ingin dihapus sedang digunakan.
   - POST/PUT/PATCH produk (FK violation pada `kategori_id`) → **422 Unprocessable Entity**. Alasan: client mengirim data yang mereferensikan entitas yang tidak ada.
   - Perbedaan ini sudah didokumentasikan di `plan.md` dan harus ditangani eksplisit di controller.

2. **Filter `deleted_at IS NULL`:** Harus ada di **setiap** query yang membaca atau memodifikasi produk aktif (findAll, findById, findByKategoriId, update, patch, softDelete). Tidak boleh ada di hardDelete dan restore (keduanya justru bekerja pada baris dengan kondisi `deleted_at` tertentu).

3. **Urutan route di produkRoutes.js:** Route `PATCH /:id/restore` harus didaftarkan **sebelum** `PATCH /:id` agar Express tidak salah menginterpretasikan `restore` sebagai id.

4. **Nilai unik di Postman (Folder 1):** `{{$timestamp}}` digunakan agar collection bisa dijalankan berulang kali tanpa error UNIQUE constraint di database yang sudah berisi seed.

5. **N12 dan N13 bergantung pada state:** Request N12 (soft delete dua kali) dan N13 (restore dua kali) memerlukan `produkId` yang sudah dalam state aktif. Pastikan Folder 1 dan Folder 2 dijalankan dalam urutan yang benar dalam satu Runner session.
