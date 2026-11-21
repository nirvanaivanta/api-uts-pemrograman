# Plan 11 - Postman Collection: Setup & Folder 1 (Alur Utama)

## 1. Objective

Membuat Postman Collection `UTS Pemrograman API` beserta Environment, kemudian mengisi **Folder 1: Alur Utama** (S01–S15) dengan semua request, test script, dan variabel environment yang diperlukan. Semua test di Folder 1 harus hijau saat dijalankan dengan Collection Runner.

## 2. Context

Postman Collection adalah dokumen pengujian yang dijalankan berurutan melalui Collection Runner. Folder 1 menguji alur kerja normal (happy path) dan harus bisa dijalankan berulang kali tanpa error duplikat di database — caranya adalah menggunakan nilai unik seperti `{{$timestamp}}` pada `nama_kategori` dan `kode_produk`.

Variabel environment disimpan di Postman Environment dan diisi secara dinamis melalui tab **Tests** menggunakan `pm.environment.set()`.

## 3. Prerequisites

- **Plan 10 selesai** – Semua endpoint berjalan benar dan format respons konsisten.
- Postman Desktop atau Postman VS Code Extension terinstall.
- Server berjalan di `localhost:3000`.

## 4. Tasks

### Setup Environment

- [ ] **Task 1** – Buat Postman Environment bernama `UTS API Environment` dengan variabel awal:
  - `baseUrl` = `http://localhost:3000`
  - `kategoriId` = *(kosong, diisi dinamis)*
  - `produkId` = *(kosong, diisi dinamis)*
  - `kategoriSementaraId` = *(kosong, diisi dinamis)*

### Setup Collection

- [ ] **Task 2** – Buat Collection bernama `UTS Pemrograman API`.
- [ ] **Task 3** – Buat tiga folder di dalam collection:
  - `1-Alur Utama`
  - `2-Skenario Error`
  - `3-Bukti Delete`

### Folder 1: Alur Utama (S01–S15)

- [ ] **Task 4** – **S01**: `POST {{baseUrl}}/api/kategori`
  - Body: `{ "nama_kategori": "Kategori {{$timestamp}}", "deskripsi": "Deskripsi test" }`
  - Tests:
    ```js
    pm.test("Status 201", () => pm.response.to.have.status(201));
    const json = pm.response.json();
    pm.test("Ada data.id", () => pm.expect(json.data.id).to.be.a('number'));
    pm.environment.set("kategoriId", json.data.id);
    ```

- [ ] **Task 5** – **S02**: `POST {{baseUrl}}/api/produk`
  - Body: `{ "kategori_id": {{kategoriId}}, "kode_produk": "PRD-{{$timestamp}}", "nama_produk": "Produk Test", "harga": 50000, "stok": 10 }`
  - Tests:
    ```js
    pm.test("Status 201", () => pm.response.to.have.status(201));
    const json = pm.response.json();
    pm.test("deleted_at adalah null", () => pm.expect(json.data.deleted_at).to.be.null);
    pm.environment.set("produkId", json.data.id);
    ```

- [ ] **Task 6** – **S03**: `GET {{baseUrl}}/api/produk/{{produkId}}`
  - Tests:
    ```js
    pm.test("Status 200", () => pm.response.to.have.status(200));
    const json = pm.response.json();
    pm.test("Id sesuai", () => pm.expect(json.data.id).to.eql(pm.environment.get("produkId") * 1));
    ```

- [ ] **Task 7** – **S04**: `GET {{baseUrl}}/api/kategori/{{kategoriId}}/produk`
  - Tests:
    ```js
    pm.test("Status 200", () => pm.response.to.have.status(200));
    const json = pm.response.json();
    pm.test("count minimal 1", () => pm.expect(json.count).to.be.at.least(1));
    pm.test("Memuat produk S02", () => {
      const ids = json.data.map(p => p.id);
      pm.expect(ids).to.include(pm.environment.get("produkId") * 1);
    });
    ```

- [ ] **Task 8** – **S05**: `PUT {{baseUrl}}/api/produk/{{produkId}}`
  - Body: `{ "kategori_id": {{kategoriId}}, "kode_produk": "PRD-PUT-{{$timestamp}}", "nama_produk": "Produk Diupdate", "harga": 75000, "stok": 20 }`
  - Tests:
    ```js
    pm.test("Status 200", () => pm.response.to.have.status(200));
    const json = pm.response.json();
    pm.test("nama_produk berubah", () => pm.expect(json.data.nama_produk).to.eql("Produk Diupdate"));
    pm.test("harga berubah", () => pm.expect(json.data.harga).to.eql(75000));
    pm.test("stok berubah", () => pm.expect(json.data.stok).to.eql(20));
    ```

- [ ] **Task 9** – **S06**: `PATCH {{baseUrl}}/api/produk/{{produkId}}`
  - Body: `{ "stok": 40 }`
  - Tests:
    ```js
    pm.test("Status 200", () => pm.response.to.have.status(200));
    const json = pm.response.json();
    pm.test("stok menjadi 40", () => pm.expect(json.data.stok).to.eql(40));
    ```

- [ ] **Task 10** – **S07**: `DELETE {{baseUrl}}/api/produk/{{produkId}}`
  - Tests:
    ```js
    pm.test("Status 204", () => pm.response.to.have.status(204));
    ```

- [ ] **Task 11** – **S08**: `GET {{baseUrl}}/api/produk/{{produkId}}`
  - Tests:
    ```js
    pm.test("Status 404 - data tersembunyi", () => pm.response.to.have.status(404));
    ```

- [ ] **Task 12** – **S09**: `GET {{baseUrl}}/api/produk`
  - Tests:
    ```js
    pm.test("Status 200", () => pm.response.to.have.status(200));
    const json = pm.response.json();
    const ids = json.data.map(p => p.id);
    pm.test("produkId tidak muncul", () => pm.expect(ids).to.not.include(pm.environment.get("produkId") * 1));
    ```

- [ ] **Task 13** – **S10**: `PATCH {{baseUrl}}/api/produk/{{produkId}}/restore`
  - Tests:
    ```js
    pm.test("Status 200", () => pm.response.to.have.status(200));
    const json = pm.response.json();
    pm.test("deleted_at kembali null", () => pm.expect(json.data.deleted_at).to.be.null);
    ```

- [ ] **Task 14** – **S11**: `GET {{baseUrl}}/api/produk/{{produkId}}`
  - Tests:
    ```js
    pm.test("Status 200 - data muncul lagi", () => pm.response.to.have.status(200));
    ```

- [ ] **Task 15** – **S12**: `DELETE {{baseUrl}}/api/kategori/{{kategoriId}}`
  - Tests:
    ```js
    pm.test("Status 409 - kategori masih dipakai", () => pm.response.to.have.status(409));
    ```

- [ ] **Task 16** – **S13**: `POST {{baseUrl}}/api/kategori` (kategori sementara)
  - Body: `{ "nama_kategori": "Sementara {{$timestamp}}" }`
  - Tests:
    ```js
    pm.test("Status 201", () => pm.response.to.have.status(201));
    pm.environment.set("kategoriSementaraId", pm.response.json().data.id);
    ```

- [ ] **Task 17** – **S14**: `DELETE {{baseUrl}}/api/kategori/{{kategoriSementaraId}}`
  - Tests:
    ```js
    pm.test("Status 204 - hard delete berhasil", () => pm.response.to.have.status(204));
    ```

- [ ] **Task 18** – **S15**: `GET {{baseUrl}}/api/kategori/{{kategoriSementaraId}}`
  - Tests:
    ```js
    pm.test("Status 404 - baris hilang permanen", () => pm.response.to.have.status(404));
    ```

### Ekspor Collection

- [ ] **Task 19** – Ekspor collection sebagai `uts.postman_collection.json` ke root project.
- [ ] **Task 20** – Jalankan Folder 1 dengan Collection Runner dan verifikasi semua test hijau.

## 5. Expected Files

| File | Aksi |
|---|---|
| `uts.postman_collection.json` | Dibuat (ekspor dari Postman) |

## 6. Requirements & Constraints

- Semua URL menggunakan `{{baseUrl}}`, tidak ada alamat hardcoded.
- `nama_kategori` dan `kode_produk` menggunakan `{{$timestamp}}` agar unik setiap run.
- Request yang membuat data (POST) menyimpan id ke variabel environment via `pm.environment.set()`.
- Request berikutnya menggunakan variabel `{{kategoriId}}`, `{{produkId}}`, `{{kategoriSementaraId}}`.
- Setiap request minimal memeriksa kode status.
- Request yang mengubah data juga memeriksa isi data.
- Urutan S01–S15 wajib dijalankan berurutan.

## 7. Acceptance Criteria

- Folder 1 dijalankan dengan Collection Runner: **semua test hijau** (0 failure).
- Variabel environment terisi setelah S01, S02, S13.
- Request berikutnya menggunakan variabel yang terisi tersebut.

## 8. Testing & Verification

1. Jalankan Folder 1 via Collection Runner dengan environment `UTS API Environment`.
2. Pastikan semua 15 request sukses.
3. Screenshot hasil Runner (akan digunakan di README).

## 9. Definition of Done

- [ ] Environment dengan 4 variabel sudah dibuat.
- [ ] Collection `UTS Pemrograman API` sudah dibuat dengan 3 folder.
- [ ] Folder 1 berisi S01–S15 dengan test script.
- [ ] Collection Runner Folder 1: 0 test gagal.
- [ ] `uts.postman_collection.json` sudah diekspor ke root project.
- [ ] Siap melanjutkan ke Plan 12.
