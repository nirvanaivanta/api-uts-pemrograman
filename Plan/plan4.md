# Plan 4 - Repository Layer

## 1. Objective

Membuat seluruh Repository Layer untuk `kategori` dan `produk`. Repository adalah satu-satunya lapisan yang boleh menulis SQL. Setelah tahap ini, semua operasi database tersedia sebagai method yang bisa dipanggil controller.

## 2. Context

Repository berupa **class** dan diekspor sebagai **satu instance** (singleton pattern). Ini memastikan tidak ada instansiasi berulang dan pool koneksi digunakan efisien. Semua query wajib menggunakan **parameterized query** (`$1`, `$2`, dst.) untuk mencegah SQL injection.

Soft delete diimplementasikan di lapisan ini: query yang membaca data **wajib** memfilter `deleted_at IS NULL` agar baris terhapus tidak muncul di response.

## 3. Prerequisites

- **Plan 2 selesai** – Tabel `kategori` dan `produk` sudah ada di database.
- **Plan 3 selesai** – `src/config/db.js` sudah mengekspor Pool.

## 4. Tasks

### KategoriRepository (`src/repositories/kategoriRepository.js`)

- [ ] **Task 1** – Buat class `KategoriRepository` yang menerima `pool` di constructor.
- [ ] **Task 2** – Tambahkan method `findAll()`: `SELECT * FROM kategori ORDER BY id ASC`.
- [ ] **Task 3** – Tambahkan method `findById(id)`: `SELECT * FROM kategori WHERE id = $1`.
- [ ] **Task 4** – Tambahkan method `create(data)`: `INSERT INTO kategori (...) VALUES (...) RETURNING *`.
- [ ] **Task 5** – Tambahkan method `deleteById(id)`: `DELETE FROM kategori WHERE id = $1 RETURNING *`.
- [ ] **Task 6** – Ekspor satu instance: `module.exports = new KategoriRepository(pool)`.

### ProdukRepository (`src/repositories/produkRepository.js`)

- [ ] **Task 7** – Buat class `ProdukRepository` yang menerima `pool` di constructor.
- [ ] **Task 8** – Tambahkan method `findAll()`: Ambil semua produk **aktif** (`deleted_at IS NULL`), sertakan `COUNT(*) OVER()` atau hitung count secara terpisah.
- [ ] **Task 9** – Tambahkan method `findById(id)`: Ambil produk aktif (`deleted_at IS NULL`) berdasarkan id.
- [ ] **Task 10** – Tambahkan method `findByKategoriId(kategoriId)`: Ambil produk aktif milik kategori tertentu.
- [ ] **Task 11** – Tambahkan method `create(data)`: INSERT produk, kembalikan baris baru dengan `RETURNING *`.
- [ ] **Task 12** – Tambahkan method `update(id, data)`: UPDATE seluruh field produk aktif, kembalikan baris terbaru dengan `RETURNING *`. Wajib filter `deleted_at IS NULL`.
- [ ] **Task 13** – Tambahkan method `patch(id, fields)`: UPDATE sebagian field produk aktif secara dinamis (bangun SET clause dari object `fields`). Wajib filter `deleted_at IS NULL`.
- [ ] **Task 14** – Tambahkan method `softDelete(id)`: `UPDATE produk SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`.
- [ ] **Task 15** – Tambahkan method `restore(id)`: `UPDATE produk SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *`.
- [ ] **Task 16** – *(Nilai tambah)* Tambahkan method `hardDelete(id)`: `DELETE FROM produk WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *`.
- [ ] **Task 17** – *(Nilai tambah)* Modifikasi `findAll()` agar menerima parameter opsional `kategoriId` untuk filter `WHERE kategori_id = $1`.
- [ ] **Task 18** – Ekspor satu instance: `module.exports = new ProdukRepository(pool)`.

## 5. Expected Files

| File | Aksi |
|---|---|
| `src/repositories/kategoriRepository.js` | Dibuat |
| `src/repositories/produkRepository.js` | Dibuat |

## 6. Requirements & Constraints

- **Tidak ada SQL di luar repository** — controller dan middleware dilarang menulis query.
- Semua query wajib menggunakan **parameterized query** (`$1`, `$2`, dst.).
- Setiap method me-`return` hasil query (rows atau row tunggal), bukan mengirim response HTTP.
- Repository **tidak menangani** error bisnis (misalnya 404 atau 409) — hanya melempar (throw) error agar ditangkap controller.
- Soft delete filter `deleted_at IS NULL` wajib ada di: `findAll`, `findById`, `findByKategoriId`, `update`, `patch`, `softDelete`.
- `softDelete` hanya memperbarui baris dengan `deleted_at IS NULL`.
- `restore` hanya memperbarui baris dengan `deleted_at IS NOT NULL`.
- Method `patch` harus membangun query SET secara dinamis (jumlah field tidak tetap).
- Diekspor sebagai **satu instance** (bukan class).

## 7. Acceptance Criteria

- Kedua file repository ada dan tidak ada error sintaks saat di-`require`.
- Setiap method mengembalikan data yang sesuai (row atau array of rows).
- Method yang mengembalikan `rows.length === 0` pada id tidak ada tidak melempar error (controller yang akan menangani logika 404).
- Filter `deleted_at IS NULL` terpasang pada semua method yang relevan.
- Parameterized query digunakan di semua query.

## 8. Testing & Verification

Karena controller belum ada, verifikasi dilakukan dengan script sementara atau via unit test sederhana:

```js
// Contoh verifikasi manual (jalankan langsung dengan node)
const kategoriRepo = require('./src/repositories/kategoriRepository');
const produkRepo = require('./src/repositories/produkRepository');

async function test() {
  const semua = await kategoriRepo.findAll();
  console.log('Kategori:', semua);

  const satu = await produkRepo.findById(1);
  console.log('Produk id 1:', satu);

  process.exit(0);
}
test().catch(console.error);
```

Jalankan: `node test-repo.js` — tidak ada error, data muncul.

## 9. Definition of Done

- [ ] `src/repositories/kategoriRepository.js` ada dengan semua method yang diperlukan.
- [ ] `src/repositories/produkRepository.js` ada dengan semua method yang diperlukan.
- [ ] Seluruh query menggunakan parameterized query.
- [ ] Filter `deleted_at IS NULL` terpasang pada semua query yang relevan.
- [ ] Kedua file mengekspor satu instance (singleton).
- [ ] Tidak ada error saat file di-`require`.
- [ ] Siap melanjutkan ke Plan 5.
