# UTS Pemrograman API — Toko Online

REST API untuk manajemen **kategori** dan **produk** toko online. Dibangun dengan **Express.js**, **PostgreSQL**, dan **Node.js** menggunakan arsitektur berlapis (config → repository → controller → route).

---

## Cara Menjalankan Server

### Prasyarat

- Node.js v18+
- PostgreSQL v14+
- npm

### Langkah-langkah

```bash
# 1. Clone repository
git clone <url-repo>
cd api-uts

# 2. Install dependency
npm install

# 3. Buat file .env berdasarkan template
cp .env.example .env
# Edit .env dan isi nilai DB_USER, DB_PASSWORD, dll.

# 4. Buat database
psql -U postgres -c "CREATE DATABASE db_uts;"

# 5. Jalankan schema (buat tabel)
psql -U postgres -d db_uts -f sql/schema.sql

# 6. Jalankan seed (isi data awal)
psql -U postgres -d db_uts -f sql/seed.sql

# 7. Jalankan server
npm run dev      # development (nodemon)
npm start        # production
```

Server berjalan di `http://localhost:3000` (default).

### Isi `.env`

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password_anda
DB_NAME=db_uts
PORT=3000
```

---

## Rancangan Tabel dan Relasinya

### Relasi

Satu `kategori` memiliki banyak `produk` (**one-to-many**). Kolom `produk.kategori_id` adalah foreign key yang merujuk ke `kategori.id`.

```
kategori (1) ──────< produk (many)
```

### Tabel `kategori` — Hard Delete

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `nama_kategori` | VARCHAR(50) | NOT NULL, UNIQUE |
| `deskripsi` | VARCHAR(200) | nullable |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Tabel `produk` — Soft Delete

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `kategori_id` | INTEGER | NOT NULL, FK → kategori(id) |
| `kode_produk` | VARCHAR(20) | NOT NULL, UNIQUE |
| `nama_produk` | VARCHAR(100) | NOT NULL |
| `harga` | INTEGER | NOT NULL, CHECK (harga > 0) |
| `stok` | INTEGER | NOT NULL, DEFAULT 0, CHECK (stok >= 0) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| `deleted_at` | TIMESTAMP | nullable — NULL = aktif, terisi = terhapus |

---

## Daftar Endpoint

Base URL: `http://localhost:3000`

### Kategori

| Method | URL | Fungsi | Status |
|---|---|---|---|
| GET | `/api/kategori` | Daftar semua kategori | 200 |
| GET | `/api/kategori/:id` | Detail satu kategori | 200, 400, 404 |
| POST | `/api/kategori` | Tambah kategori | 201, 400, 409 |
| DELETE | `/api/kategori/:id` | Hard delete kategori | 204, 400, 404, 409 |

### Produk

| Method | URL | Fungsi | Status |
|---|---|---|---|
| GET | `/api/produk` | Daftar produk aktif | 200 |
| GET | `/api/produk?kategori_id=1` | Filter produk by kategori *(nilai tambah)* | 200, 400 |
| GET | `/api/produk/:id` | Detail satu produk aktif | 200, 400, 404 |
| GET | `/api/kategori/:id/produk` | Produk aktif per kategori | 200, 400, 404 |
| POST | `/api/produk` | Tambah produk | 201, 400, 409, 422 |
| PUT | `/api/produk/:id` | Ganti seluruh data produk | 200, 400, 404, 409, 422 |
| PATCH | `/api/produk/:id` | Ubah sebagian field produk | 200, 400, 404, 409, 422 |
| DELETE | `/api/produk/:id` | Soft delete produk | 204, 400, 404 |
| PATCH | `/api/produk/:id/restore` | Restore produk soft-deleted | 200, 400, 404 |
| DELETE | `/api/produk/:id/permanent` | Hard delete produk soft-deleted *(nilai tambah)* | 204, 400, 404, 409 |

### Contoh Body Request

**POST /api/kategori**
```json
{
  "nama_kategori": "Elektronik",
  "deskripsi": "Perangkat elektronik dan gadget"
}
```

**POST /api/produk**
```json
{
  "kategori_id": 1,
  "kode_produk": "ELK-001",
  "nama_produk": "Laptop ASUS VivoBook",
  "harga": 8500000,
  "stok": 15
}
```

**PUT /api/produk/:id** — semua field wajib ada
```json
{
  "kategori_id": 1,
  "kode_produk": "ELK-001-V2",
  "nama_produk": "Laptop ASUS VivoBook 2024",
  "harga": 9000000,
  "stok": 10
}
```

**PATCH /api/produk/:id** — hanya field yang ingin diubah
```json
{
  "stok": 20
}
```

### Format Respons

```json
// Sukses - daftar
{ "status": "success", "message": "...", "count": 3, "data": [...] }

// Sukses - single / create / update
{ "status": "success", "message": "...", "data": { ... } }

// Sukses - delete (204 No Body)

// Error - validasi (400)
{ "status": "error", "message": "Validasi gagal.", "errors": ["pesan1", "pesan2"] }

// Error - lainnya
{ "status": "error", "message": "..." }
```

---

## Keputusan Desain: PUT vs PATCH

**PUT** digunakan untuk *replace* — mengganti seluruh representasi resource. Semua field (`kategori_id`, `kode_produk`, `nama_produk`, `harga`, `stok`) wajib disertakan dalam body. Jika ada field yang hilang, server menolak dengan 400. Ini memastikan client selalu mengirim state lengkap sehingga tidak ada field yang secara tidak sengaja hilang.

**PATCH** digunakan untuk *partial update* — hanya field yang ingin diubah yang dikirim. Field yang tidak ada di body dibiarkan seperti semula. Ini lebih efisien untuk perubahan kecil seperti mengubah stok tanpa harus mengirim ulang semua data produk. Body kosong `{}` ditolak karena tidak ada yang diubah.

Keduanya hanya beroperasi pada produk aktif (`deleted_at IS NULL`). Request ke produk yang sudah di-soft delete akan mengembalikan 404.

---

## Perilaku Soft Delete terhadap UNIQUE dan Foreign Key

### UNIQUE Constraint (`kode_produk`)

Ketika sebuah produk di-soft delete, baris di tabel tidak dihapus — hanya `deleted_at` yang diisi. Karena baris masih ada, `kode_produk`-nya tetap menempati slot di constraint UNIQUE.

**Akibatnya:** Mencoba membuat produk baru dengan `kode_produk` yang sama dengan produk yang sudah di-soft delete akan menghasilkan **409 Conflict**.

Ini adalah keputusan desain yang disengaja untuk menjaga integritas data historis. Dua produk — aktif maupun terhapus — tidak boleh memiliki kode yang sama. Untuk "membebaskan" kode tersebut, produk soft-deleted harus di-hard delete terlebih dahulu via `DELETE /api/produk/:id/permanent`.

### Foreign Key Constraint (`kategori_id`)

Produk yang di-soft delete tetap ada sebagai baris di tabel `produk`, sehingga `kategori_id`-nya masih aktif sebagai referensi ke tabel `kategori`.

**Akibatnya:** Melakukan hard delete pada kategori yang masih dirujuk produk — termasuk produk yang sudah di-soft delete — akan menghasilkan **409 Conflict** (PostgreSQL melempar error 23503). Kategori tersebut tidak bisa dihapus selama masih ada baris di `produk` yang merujuknya, aktif maupun tidak.

Untuk menghapus kategori seperti itu, semua produknya (termasuk yang soft-deleted) harus di-hard delete terlebih dahulu.

---

## Alasan Hard Delete pada Tabel Induk (Kategori)

Kategori adalah data master yang berfungsi sebagai pengelompokan produk. Tidak ada kebutuhan untuk menyimpan riwayat histori kategori yang sudah dihapus di level tabel ini — jika sebuah kategori tidak lagi relevan, cukup dihapus permanen.

Hard delete dipilih untuk menjaga tabel `kategori` tetap bersih dan ringkas. Proteksi integritas data tetap terjamin melalui foreign key constraint: PostgreSQL akan menolak penghapusan kategori yang masih dirujuk oleh baris manapun di tabel `produk`.

---

## Tangkapan Layar

### Hasil Collection Runner — Folder 1: Alur Utama
> Jalankan via Newman: `npx newman run uts.postman_collection.json -e uts.postman_environment.json --folder "1-Alur Utama"`
>
> Hasil: **15 requests, 28 assertions, 0 failed**

*(Tambahkan screenshot Postman Collection Runner Folder 1 di sini)*

### Hasil Collection Runner — Folder 2: Skenario Error
> Jalankan via Newman: `npx newman run uts.postman_collection.json -e uts.postman_environment.json --folder "1-Alur Utama" --folder "2-Skenario Error"`
>
> Hasil: **31 requests, 72 assertions, 0 failed**

*(Tambahkan screenshot Postman Collection Runner Folder 2 di sini)*

### Bukti Database — Soft Delete

Query: `SELECT id, kode_produk, nama_produk, deleted_at FROM produk WHERE id = 1;`

Setelah `DELETE /api/produk/1`:
```
 id | kode_produk |     nama_produk      |         deleted_at
----+-------------+----------------------+----------------------------
  1 | ELK-001     | Laptop ASUS VivoBook | 2026-11-21 20:16:44.405296
(1 row)
```
Baris masih ada, `deleted_at` terisi timestamp.

*(Tambahkan screenshot psql/pgAdmin di sini)*

### Bukti Database — Restore

Query: `SELECT id, kode_produk, nama_produk, deleted_at FROM produk WHERE id = 1;`

Setelah `PATCH /api/produk/1/restore`:
```
 id | kode_produk |     nama_produk      | deleted_at
----+-------------+----------------------+------------
  1 | ELK-001     | Laptop ASUS VivoBook |
(1 row)
```
`deleted_at` kembali `NULL`.

*(Tambahkan screenshot psql/pgAdmin di sini)*

### Bukti Database — Hard Delete Kategori

Query: `SELECT * FROM kategori WHERE id = <id_kategori_sementara>;`

Setelah `DELETE /api/kategori/:id`:
```
 id | nama_kategori | deskripsi | created_at
----+---------------+-----------+------------
(0 rows)
```
Baris benar-benar hilang dari tabel.

*(Tambahkan screenshot psql/pgAdmin di sini)*
#   a p i - u t s - p e m r o g r a m a n  
 