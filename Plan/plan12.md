# Plan 12 - Postman Collection: Folder 2 (Skenario Error)

## 1. Objective

Mengisi **Folder 2: Skenario Error** (N01–N14) di Postman Collection dengan semua request error, memastikan setiap skenario menghasilkan kode status yang tepat dan format respons error yang benar.

## 2. Context

Folder ini menguji kondisi abnormal (error path). Berbeda dari Folder 1, skenario error **tidak bergantung satu sama lain secara ketat**, namun beberapa skenario (N12, N13) memerlukan `produkId` dari Folder 1 yang sudah dalam keadaan tertentu (aktif atau terhapus).

Penting: Skenario N12 dan N13 bergantung pada state `produkId` dari Folder 1. Pastikan Folder 1 dan Folder 2 dijalankan berurutan dalam satu Runner session, atau buat request setup di awal Folder 2 jika diperlukan.

Setiap request harus memeriksa:
1. Kode status HTTP.
2. Field `status` bernilai `"error"`.
3. Field `message` tidak kosong.

## 3. Prerequisites

- **Plan 11 selesai** – Collection dibuat, Folder 1 berjalan dengan benar.
- `produkId` tersimpan di environment dari Folder 1.
- Server berjalan di `localhost:3000`.

## 4. Tasks

- [ ] **Task 1** – **N01**: `POST {{baseUrl}}/api/kategori` — nama kosong
  - Body: `{ "nama_kategori": "" }`
  - Tests:
    ```js
    pm.test("Status 400", () => pm.response.to.have.status(400));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 2** – **N02**: `POST {{baseUrl}}/api/kategori` — nama duplikat
  - Body: Gunakan nama kategori yang **sudah ada di seed data** (pasti duplikat).
  - Tests:
    ```js
    pm.test("Status 409", () => pm.response.to.have.status(409));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 3** – **N03**: `POST {{baseUrl}}/api/produk` — dua error sekaligus
  - Body: `{ "kategori_id": 1, "kode_produk": "X", "nama_produk": "Test", "harga": -5, "stok": "banyak" }`
  - Tests:
    ```js
    pm.test("Status 400", () => pm.response.to.have.status(400));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("errors berisi dua item", () => pm.expect(json.errors).to.have.lengthOf(2));
    ```

- [ ] **Task 4** – **N04**: `POST {{baseUrl}}/api/produk` — kategori tidak ada
  - Body: `{ "kategori_id": 99999, "kode_produk": "PRD-N04", "nama_produk": "Test", "harga": 1000, "stok": 0 }`
  - Tests:
    ```js
    pm.test("Status 422", () => pm.response.to.have.status(422));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 5** – **N05**: `POST {{baseUrl}}/api/produk` — kode_produk duplikat dari seed
  - Body: Gunakan `kode_produk` yang sudah ada di seed data.
  - Tests:
    ```js
    pm.test("Status 409", () => pm.response.to.have.status(409));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 6** – **N06**: `PUT {{baseUrl}}/api/produk/{{produkId}}` — body tidak lengkap
  - Body: `{ "nama_produk": "Baru" }`
  - Tests:
    ```js
    pm.test("Status 400", () => pm.response.to.have.status(400));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 7** – **N07**: `PATCH {{baseUrl}}/api/produk/{{produkId}}` — body kosong
  - Body: `{}`
  - Tests:
    ```js
    pm.test("Status 400", () => pm.response.to.have.status(400));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 8** – **N08**: `PATCH {{baseUrl}}/api/produk/{{produkId}}` — kode_produk duplikat
  - Body: `{ "kode_produk": "<kode_dari_seed>" }` *(isi dengan kode_produk seed yang sudah ada)*
  - Tests:
    ```js
    pm.test("Status 409", () => pm.response.to.have.status(409));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 9** – **N09**: `GET {{baseUrl}}/api/produk/abc` — format id salah
  - Tests:
    ```js
    pm.test("Status 400", () => pm.response.to.have.status(400));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 10** – **N10**: `GET {{baseUrl}}/api/produk/99999` — id tidak ada
  - Tests:
    ```js
    pm.test("Status 404", () => pm.response.to.have.status(404));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 11** – **N11**: `DELETE {{baseUrl}}/api/produk/99999` — id tidak ada
  - Tests:
    ```js
    pm.test("Status 404", () => pm.response.to.have.status(404));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 12** – **N12**: `DELETE {{baseUrl}}/api/produk/{{produkId}}` dua kali — periksa yang kedua
  - Buat **dua** request dengan nama berbeda: "N12a - Delete Pertama" dan "N12 - Delete Kedua (404)".
  - Tests pada N12 (kedua):
    ```js
    pm.test("Status 404 - sudah terhapus", () => pm.response.to.have.status(404));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 13** – **N13**: `PATCH {{baseUrl}}/api/produk/{{produkId}}/restore` dua kali — periksa yang kedua
  - Buat dua request: "N13a - Restore Pertama" dan "N13 - Restore Kedua (404)".
  - Tests pada N13 (kedua):
    ```js
    pm.test("Status 404 - tidak sedang terhapus", () => pm.response.to.have.status(404));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 14** – **N14**: `POST {{baseUrl}}/api/produk` — JSON rusak
  - Di tab **Body**, pilih **Raw** > **Text** (bukan JSON), masukkan: `{"kategori_id": 1, "kode_produk": "X",}`
  - Set header `Content-Type: application/json` secara manual.
  - Tests:
    ```js
    pm.test("Status 400 - JSON tidak valid", () => pm.response.to.have.status(400));
    const json = pm.response.json();
    pm.test("status error", () => pm.expect(json.status).to.eql("error"));
    pm.test("message ada", () => pm.expect(json.message).to.not.be.empty);
    ```

- [ ] **Task 15** – Ekspor ulang collection ke `uts.postman_collection.json`.
- [ ] **Task 16** – Jalankan Folder 2 dengan Collection Runner dan verifikasi semua test hijau.

## 5. Expected Files

| File | Aksi |
|---|---|
| `uts.postman_collection.json` | Diperbarui (ekspor ulang dari Postman) |

## 6. Requirements & Constraints

- Semua request menggunakan `{{baseUrl}}`.
- Setiap request memeriksa: kode status, `status: "error"`, dan `message` tidak kosong.
- N03 secara khusus memeriksa `errors` berisi dua item.
- Untuk N02 dan N05: gunakan nilai dari seed data yang pasti sudah ada.
- N12 dan N13: request dijalankan berurutan dalam Runner. Pastikan state `produkId` sesuai.
- N14: Content-Type header wajib `application/json` agar JSON parser aktif.

## 7. Acceptance Criteria

- Folder 2 dijalankan dengan Collection Runner: **semua test hijau**.
- N03 menunjukkan `errors` dengan tepat dua item.
- N14 menghasilkan 400 (bukan 500).
- Semua respons memiliki `status: "error"` dan `message` tidak kosong.

## 8. Testing & Verification

1. Jalankan Folder 2 via Collection Runner.
2. Pastikan 0 test gagal.
3. Screenshot hasil Runner (akan digunakan di README).

## 9. Definition of Done

- [ ] Folder 2 berisi N01–N14 (dengan N12a dan N13a sebagai helper) dengan test script.
- [ ] Collection Runner Folder 2: 0 test gagal.
- [ ] `uts.postman_collection.json` sudah diekspor ulang.
- [ ] Siap melanjutkan ke Plan 13.
