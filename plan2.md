# Plan 2 - Database Schema & Seed Data

## 1. Objective

Membuat skema database PostgreSQL untuk tabel `kategori` (induk, hard delete) dan `produk` (anak, soft delete), beserta data awal untuk pengembangan dan pengujian.

## 2. Context

Database bernama `db_uts`. Terdapat dua tabel dengan relasi **one-to-many**: satu `kategori` memiliki banyak `produk`. Tabel `produk` mengimplementasikan **soft delete** via kolom `deleted_at` (NULL = aktif, terisi = terhapus). Tabel `kategori` menggunakan **hard delete** (baris dihapus permanen).

Seluruh SQL disimpan di folder `sql/` agar bisa dijalankan ulang.

## 3. Prerequisites

- **Plan 1 selesai** – Struktur folder dan environment sudah siap.
- PostgreSQL sudah terinstall dan berjalan secara lokal.
- Database `db_uts` belum perlu ada; akan dibuat dari `schema.sql`.

## 4. Tasks

- [ ] **Task 1** – Buat file `sql/schema.sql`. Tambahkan `DROP TABLE IF EXISTS` di awal untuk idempoten (aman dijalankan ulang):
  ```sql
  DROP TABLE IF EXISTS produk;
  DROP TABLE IF EXISTS kategori;
  ```
- [ ] **Task 2** – Tulis DDL tabel `kategori` di `sql/schema.sql` dengan kolom:
  - `id` SERIAL PRIMARY KEY
  - `nama_kategori` VARCHAR(50) NOT NULL UNIQUE
  - `deskripsi` VARCHAR(200)
  - `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- [ ] **Task 3** – Tulis DDL tabel `produk` di `sql/schema.sql` dengan kolom:
  - `id` SERIAL PRIMARY KEY
  - `kategori_id` INTEGER NOT NULL REFERENCES kategori(id)
  - `kode_produk` VARCHAR(20) NOT NULL UNIQUE
  - `nama_produk` VARCHAR(100) NOT NULL
  - `harga` INTEGER NOT NULL CHECK (harga > 0)
  - `stok` INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0)
  - `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
  - `deleted_at` TIMESTAMP NULL
- [ ] **Task 4** – Buat file `sql/seed.sql`. Pastikan `INSERT` aman dijalankan ulang dengan `ON CONFLICT DO NOTHING` atau `TRUNCATE` di awal.
- [ ] **Task 5** – Tambahkan minimal **3 baris** seed untuk tabel `kategori` (contoh: Elektronik, Pakaian, Makanan).
- [ ] **Task 6** – Tambahkan minimal **5 baris** seed untuk tabel `produk`, dengan `kategori_id` yang merujuk ke baris seed `kategori`. Pastikan `kode_produk` unik.
- [ ] **Task 7** – Buat database `db_uts` di PostgreSQL lokal:
  ```bash
  psql -U postgres -c "CREATE DATABASE db_uts;"
  ```
- [ ] **Task 8** – Jalankan `schema.sql` untuk membuat tabel:
  ```bash
  psql -U postgres -d db_uts -f sql/schema.sql
  ```
- [ ] **Task 9** – Jalankan `seed.sql` untuk mengisi data awal:
  ```bash
  psql -U postgres -d db_uts -f sql/seed.sql
  ```
- [ ] **Task 10** – Verifikasi data menggunakan `psql` atau pgAdmin.

## 5. Expected Files

| File | Aksi |
|---|---|
| `sql/schema.sql` | Dibuat |
| `sql/seed.sql` | Dibuat |

## 6. Requirements & Constraints

**Tabel `kategori`:**
- `id`: SERIAL PRIMARY KEY
- `nama_kategori`: VARCHAR(50) NOT NULL UNIQUE
- `deskripsi`: VARCHAR(200) — boleh NULL
- `created_at`: TIMESTAMP NOT NULL DEFAULT NOW()

**Tabel `produk`:**
- `id`: SERIAL PRIMARY KEY
- `kategori_id`: INTEGER NOT NULL, FOREIGN KEY ke `kategori(id)`
- `kode_produk`: VARCHAR(20) NOT NULL UNIQUE
- `nama_produk`: VARCHAR(100) NOT NULL
- `harga`: INTEGER NOT NULL CHECK (harga > 0)
- `stok`: INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0)
- `created_at`: TIMESTAMP NOT NULL DEFAULT NOW()
- `deleted_at`: TIMESTAMP NULL — `NULL` berarti aktif

**Seed data:**
- Minimal 3 baris di `kategori`.
- Minimal 5 baris di `produk`.
- Semua `kode_produk` harus unik.
- Semua `kategori_id` pada seed `produk` harus merujuk ke baris seed `kategori`.

**Idempoten:** `schema.sql` dan `seed.sql` aman dijalankan ulang tanpa error.

## 7. Acceptance Criteria

- `sql/schema.sql` berhasil dijalankan tanpa error di database `db_uts`.
- `sql/seed.sql` berhasil dijalankan tanpa error.
- `SELECT * FROM kategori;` mengembalikan minimal 3 baris.
- `SELECT * FROM produk;` mengembalikan minimal 5 baris.
- Semua constraint (NOT NULL, UNIQUE, CHECK, FOREIGN KEY) terdefinisi dengan benar — bisa diverifikasi dengan `\d kategori` dan `\d produk` di psql.
- Kolom `deleted_at` di tabel `produk` nullable dan bernilai NULL pada semua seed.

## 8. Testing & Verification

```sql
-- Verifikasi struktur tabel
\d kategori
\d produk

-- Verifikasi data seed
SELECT * FROM kategori;
SELECT * FROM produk;

-- Verifikasi foreign key constraint aktif (harus error)
INSERT INTO produk (kategori_id, kode_produk, nama_produk, harga)
VALUES (99999, 'TEST-999', 'Test', 1000);
-- Harus melempar error 23503

-- Verifikasi UNIQUE constraint (harus error)
INSERT INTO kategori (nama_kategori) VALUES ('Elektronik');
-- Harus melempar error 23505

-- Verifikasi CHECK constraint (harus error)
INSERT INTO produk (kategori_id, kode_produk, nama_produk, harga)
VALUES (1, 'TEST-000', 'Test Harga', -100);
-- Harus melempar error
```

## 9. Definition of Done

- [ ] `sql/schema.sql` ada dan dapat dijalankan ulang tanpa error.
- [ ] `sql/seed.sql` ada dan dapat dijalankan ulang tanpa error.
- [ ] Database `db_uts` ada dengan dua tabel yang strukturnya sesuai spesifikasi.
- [ ] Data seed minimal 3 kategori dan 5 produk sudah ada.
- [ ] Seluruh constraint (FK, UNIQUE, CHECK, NOT NULL) terdefinisi.
- [ ] Kolom `deleted_at` nullable dan bernilai NULL pada semua seed.
- [ ] Siap melanjutkan ke Plan 3.
