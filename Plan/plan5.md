# Plan 5 - Middleware: parseId & Validasi

## 1. Objective

Membuat seluruh middleware: `parseId` untuk validasi format parameter `:id` di URL, `validateKategori` untuk validasi body POST/PUT kategori, dan `validateProduk` untuk validasi body POST, PUT, dan PATCH produk.

## 2. Context

Middleware berjalan **sebelum** controller dieksekusi. Tugasnya memastikan input valid sehingga controller tidak perlu melakukan pengecekan ulang.

Pola validasi memakai **dua fungsi per resource**:
- Satu fungsi untuk POST dan PUT (semua field wajib ada).
- Satu fungsi `validatePatch` untuk PATCH (field bersifat opsional tapi tidak boleh semua kosong, dan nilai yang ada tetap harus valid).

Middleware `parseId` memvalidasi bahwa `:id` di URL adalah bilangan bulat positif. Jika tidak valid, langsung balas `400` tanpa meneruskan ke controller.

## 3. Prerequisites

- **Plan 1 selesai** – Folder `src/middlewares/` sudah ada.
- **Plan 3 selesai** – Format respons error sudah disepakati: `{ "status": "error", "message": "...", "errors": [...] }`.

## 4. Tasks

### parseId (`src/middlewares/parseId.js`)

- [ ] **Task 1** – Buat fungsi `parseId(req, res, next)`:
  - Ambil `req.params.id`.
  - Parse ke integer: `const id = parseInt(req.params.id, 10)`.
  - Jika `isNaN(id)` atau `id < 1`: balas `400 { "status": "error", "message": "ID harus berupa bilangan bulat positif." }`.
  - Jika valid: set `req.params.id = id` (ganti string dengan integer) lalu panggil `next()`.
- [ ] **Task 2** – Ekspor fungsi `parseId`.

### validateKategori (`src/middlewares/validateKategori.js`)

- [ ] **Task 3** – Buat fungsi `validateKategori(req, res, next)` untuk POST dan PUT:
  - Periksa `nama_kategori`: wajib ada, bukan string kosong atau hanya spasi.
  - Jika gagal: balas `400 { "status": "error", "message": "Validasi gagal.", "errors": ["nama_kategori wajib diisi."] }`.
  - Jika valid: panggil `next()`.
- [ ] **Task 4** – Ekspor fungsi `validateKategori`.

### validateProduk (`src/middlewares/validateProduk.js`)

- [ ] **Task 5** – Buat fungsi `validateProduk(req, res, next)` untuk POST dan PUT:
  - Validasi semua field yang wajib ada: `kategori_id`, `kode_produk`, `nama_produk`, `harga`, `stok`.
  - `kategori_id`: wajib ada, bilangan bulat >= 1.
  - `kode_produk`: wajib ada, string tidak kosong.
  - `nama_produk`: wajib ada, string tidak kosong.
  - `harga`: wajib ada, bilangan bulat > 0.
  - `stok`: wajib ada, bilangan bulat >= 0.
  - Kumpulkan **semua** pesan error (jangan stop di error pertama).
  - Jika ada error: balas `400 { "status": "error", "message": "Validasi gagal.", "errors": [...pesan] }`.
  - Jika semua valid: panggil `next()`.
- [ ] **Task 6** – Buat fungsi `validatePatchProduk(req, res, next)` untuk PATCH:
  - Periksa body tidak kosong (`Object.keys(req.body).length === 0`): balas `400`.
  - Untuk setiap field yang **hadir** di body, validasi nilainya:
    - `kategori_id` jika ada: bilangan bulat >= 1.
    - `kode_produk` jika ada: string tidak kosong.
    - `nama_produk` jika ada: string tidak kosong.
    - `harga` jika ada: bilangan bulat > 0.
    - `stok` jika ada: bilangan bulat >= 0.
  - Kumpulkan semua error, balas `400` jika ada.
  - Jika valid: panggil `next()`.
- [ ] **Task 7** – Ekspor kedua fungsi dari `validateProduk.js`: `{ validateProduk, validatePatchProduk }`.

## 5. Expected Files

| File | Aksi |
|---|---|
| `src/middlewares/parseId.js` | Dibuat |
| `src/middlewares/validateKategori.js` | Dibuat |
| `src/middlewares/validateProduk.js` | Dibuat |

## 6. Requirements & Constraints

**parseId:**
- Input `"abc"`, `"1.5"`, `"-1"`, `"0"`, `" "` semua harus menghasilkan 400.
- Input `"1"`, `"99"`, `"1000"` harus lolos.
- Setelah lolos, `req.params.id` diisi integer (bukan string).

**validateKategori:**
- `nama_kategori: ""` → 400.
- `nama_kategori: "   "` (spasi saja) → 400.
- `nama_kategori` tidak ada di body → 400.
- `deskripsi` boleh kosong atau tidak ada (tidak divalidasi wajib).

**validateProduk (POST/PUT):**
- Semua 5 field wajib ada sekaligus.
- PUT dengan body `{ "nama_produk": "Baru" }` (field lain hilang) → 400.
- `harga: -5` dan `stok: "banyak"` → 400 dengan **dua pesan error** di array `errors`.
- `harga: 0` → 400 (harga harus > 0, bukan >= 0).

**validatePatchProduk (PATCH):**
- Body `{}` → 400.
- Body `{ "stok": 40 }` → valid, lolos ke controller.
- Body `{ "harga": -5 }` → 400 (nilai tidak valid).

**Format error wajib:**
```json
{
  "status": "error",
  "message": "Validasi gagal.",
  "errors": ["pesan error 1", "pesan error 2"]
}
```

## 7. Acceptance Criteria

- `parseId` memblokir non-integer dan integer < 1 dengan respons 400.
- `validateKategori` memblokir `nama_kategori` kosong atau tidak ada.
- `validateProduk` mengumpulkan semua error sekaligus (tidak stop di error pertama).
- `validatePatchProduk` menolak body kosong dan memvalidasi field yang hadir.
- Format respons error sesuai spesifikasi.

## 8. Testing & Verification

Verifikasi dilakukan setelah router dipasang (Plan 6 dan seterusnya). Namun middleware bisa diuji secara terisolasi:

```js
// Contoh unit test sederhana untuk parseId
const parseId = require('./src/middlewares/parseId');
const mockRes = { status: (code) => ({ json: (body) => console.log(code, body) }) };
const mockNext = () => console.log('next() dipanggil');

// Harus 400
parseId({ params: { id: 'abc' } }, mockRes, mockNext);
// Harus memanggil next()
parseId({ params: { id: '5' } }, mockRes, mockNext);
```

Verifikasi end-to-end dilakukan di Plan 6-10 setelah route dipasang.

## 9. Definition of Done

- [ ] `src/middlewares/parseId.js` ada dan berfungsi sesuai aturan.
- [ ] `src/middlewares/validateKategori.js` ada dan memvalidasi `nama_kategori`.
- [ ] `src/middlewares/validateProduk.js` ada dengan dua fungsi: `validateProduk` dan `validatePatchProduk`.
- [ ] Semua middleware mengekspor fungsi yang benar.
- [ ] Format respons error konsisten dengan spesifikasi.
- [ ] Siap melanjutkan ke Plan 6.
