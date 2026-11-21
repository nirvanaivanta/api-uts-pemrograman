# Plan 13 - Database Verification & Bukti Delete

## 1. Objective

Mengisi **Folder 3: Bukti Delete** di Postman Collection, mengambil tangkapan layar bukti database (soft delete, restore, hard delete), dan menyimpan semua bukti visual yang diperlukan untuk README dan pengumpulan.

## 2. Context

Spesifikasi mewajibkan bukti visual yang menunjukkan perbedaan antara soft delete dan hard delete langsung di database. Bukti ini diambil menggunakan `psql` atau pgAdmin dan disertakan sebagai tangkapan layar di README.

Tiga kondisi yang harus dibuktikan:
1. **Setelah S07** (soft delete): Baris produk masih ada, kolom `deleted_at` terisi waktu.
2. **Setelah S10** (restore): Kolom `deleted_at` kembali `NULL`.
3. **Setelah S14** (hard delete kategori sementara): Baris kategori sudah tidak ada.

Folder 3 di Postman berisi request yang me-trigger state tersebut dan memberikan petunjuk untuk mengambil screenshot database.

## 3. Prerequisites

- **Plan 11 selesai** – Folder 1 berjalan dengan benar (S07 dan S10 sudah ada).
- **Plan 12 selesai** – Folder 2 berjalan dengan benar.
- Akses ke `psql` atau pgAdmin.
- Server berjalan.

## 4. Tasks

### Folder 3 di Postman Collection

- [ ] **Task 1** – Buat request **B01** di Folder 3: `DELETE {{baseUrl}}/api/produk/{{produkId}}`
  - Deskripsi: "Soft delete produk untuk bukti database"
  - Tests:
    ```js
    pm.test("Status 204 - soft delete berhasil", () => pm.response.to.have.status(204));
    ```

- [ ] **Task 2** – Buat request **B02** di Folder 3: `GET {{baseUrl}}/api/produk`
  - Deskripsi: "Verifikasi produk tersembunyi dari API setelah soft delete"
  - Tests:
    ```js
    pm.test("Status 200", () => pm.response.to.have.status(200));
    const json = pm.response.json();
    const ids = json.data.map(p => p.id);
    pm.test("produkId tidak muncul di API", () => pm.expect(ids).to.not.include(pm.environment.get("produkId") * 1));
    ```

- [ ] **Task 3** – Buat request **B03** di Folder 3: `PATCH {{baseUrl}}/api/produk/{{produkId}}/restore`
  - Deskripsi: "Restore produk untuk bukti kolom deleted_at kembali null"
  - Tests:
    ```js
    pm.test("Status 200 - restore berhasil", () => pm.response.to.have.status(200));
    const json = pm.response.json();
    pm.test("deleted_at kembali null", () => pm.expect(json.data.deleted_at).to.be.null);
    ```

- [ ] **Task 4** – Buat request **B04** di Folder 3: `POST {{baseUrl}}/api/kategori` (kategori sementara baru)
  - Body: `{ "nama_kategori": "Sementara Bukti {{$timestamp}}" }`
  - Tests:
    ```js
    pm.test("Status 201", () => pm.response.to.have.status(201));
    pm.environment.set("kategoriSementaraId", pm.response.json().data.id);
    ```

- [ ] **Task 5** – Buat request **B05** di Folder 3: `DELETE {{baseUrl}}/api/kategori/{{kategoriSementaraId}}`
  - Deskripsi: "Hard delete kategori sementara"
  - Tests:
    ```js
    pm.test("Status 204 - hard delete kategori berhasil", () => pm.response.to.have.status(204));
    ```

### Pengambilan Screenshot Database

> **Catatan:** Langkah-langkah berikut dilakukan **secara manual** di luar Postman.

- [ ] **Task 6** – Jalankan request B01 (soft delete produk). Kemudian buka psql:
  ```sql
  -- Ganti <id_produk> dengan nilai produkId dari environment
  SELECT id, kode_produk, nama_produk, deleted_at
  FROM produk
  WHERE id = <id_produk>;
  ```
  Ambil screenshot: baris ada, `deleted_at` terisi timestamp.

- [ ] **Task 7** – Jalankan request B03 (restore). Kemudian di psql:
  ```sql
  SELECT id, kode_produk, nama_produk, deleted_at
  FROM produk
  WHERE id = <id_produk>;
  ```
  Ambil screenshot: `deleted_at` bernilai `NULL`.

- [ ] **Task 8** – Jalankan request B04 dan B05 (hard delete kategori). Kemudian di psql:
  ```sql
  -- Ganti <id_kategori> dengan nilai kategoriSementaraId
  SELECT * FROM kategori WHERE id = <id_kategori>;
  ```
  Ambil screenshot: **tidak ada baris** (0 rows).

- [ ] **Task 9** – Simpan semua screenshot ke folder `screenshots/` di root project:
  - `screenshots/01-soft-delete-deleted-at-terisi.png`
  - `screenshots/02-restore-deleted-at-null.png`
  - `screenshots/03-hard-delete-kategori-hilang.png`
  - `screenshots/04-runner-folder1-hasil.png` *(dari Plan 11)*
  - `screenshots/05-runner-folder2-hasil.png` *(dari Plan 12)*

### Ekspor Collection

- [ ] **Task 10** – Ekspor ulang collection ke `uts.postman_collection.json`.
- [ ] **Task 11** – Jalankan Folder 3 via Collection Runner dan verifikasi semua test hijau.

## 5. Expected Files

| File | Aksi |
|---|---|
| `uts.postman_collection.json` | Diperbarui |
| `screenshots/01-soft-delete-deleted-at-terisi.png` | Dibuat manual |
| `screenshots/02-restore-deleted-at-null.png` | Dibuat manual |
| `screenshots/03-hard-delete-kategori-hilang.png` | Dibuat manual |
| `screenshots/04-runner-folder1-hasil.png` | Dibuat manual (dari Plan 11) |
| `screenshots/05-runner-folder2-hasil.png` | Dibuat manual (dari Plan 12) |

## 6. Requirements & Constraints

- Screenshot harus **asli** dan tidak diedit. Spesifikasi menyatakan "Jangan mengubah hasil tangkapan layar."
- Screenshot harus jelas menunjukkan:
  - Bukti 1: kolom `deleted_at` terisi (bukan NULL).
  - Bukti 2: kolom `deleted_at` bernilai NULL.
  - Bukti 3: query mengembalikan 0 rows.
- Screenshot Runner harus menunjukkan **jumlah test lulus dan gagal**.
- Folder 3 di Postman difungsikan sebagai alat bantu trigger state; test-nya memastikan API merespons dengan benar.

## 7. Acceptance Criteria

- Tiga screenshot database sudah ada dan menunjukkan kondisi yang benar.
- Dua screenshot Collection Runner sudah ada.
- Folder 3 dijalankan via Runner: semua test hijau.
- Semua file screenshot tersimpan di folder `screenshots/`.

## 8. Testing & Verification

1. Jalankan Folder 3 via Collection Runner: 0 test gagal.
2. Periksa `screenshots/` berisi minimal 5 file.
3. Buka setiap screenshot dan verifikasi kontennya sesuai dengan kondisi yang diharapkan.

## 9. Definition of Done

- [ ] Folder 3 berisi B01–B05 dengan test script.
- [ ] Collection Runner Folder 3: 0 test gagal.
- [ ] Screenshot soft delete menunjukkan `deleted_at` terisi.
- [ ] Screenshot restore menunjukkan `deleted_at` = NULL.
- [ ] Screenshot hard delete menunjukkan 0 rows.
- [ ] Screenshot Runner Folder 1 dan 2 tersimpan.
- [ ] `uts.postman_collection.json` sudah diekspor ulang.
- [ ] Siap melanjutkan ke Plan 14.
