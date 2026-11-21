# Plan 1 - Project Initialization & Environment Setup

## 1. Objective

Menyiapkan fondasi project: struktur folder, konfigurasi Node.js, file environment, dan Git setup. Setelah tahap ini, project siap menerima kode tanpa hambatan konfigurasi.

## 2. Context

Project adalah REST API berbasis **Express.js** yang terhubung ke **PostgreSQL**. Arsitektur dipisah menjadi beberapa layer: config, routes, middlewares, controllers, dan repositories. Seluruh konfigurasi sensitif (kredensial database) disimpan di `.env` dan tidak boleh masuk ke repository.

## 3. Prerequisites

Tidak ada. Ini adalah tahap pertama.

Pastikan sudah terinstall secara lokal:
- Node.js (v18+)
- npm
- PostgreSQL (v14+)
- Git

## 4. Tasks

- [ ] **Task 1** – Buat folder root project `api-uts/` (sudah ada di workspace, verifikasi ulang).
- [ ] **Task 2** – Jalankan `npm init -y` untuk membuat `package.json`.
- [ ] **Task 3** – Install dependency produksi: `express`, `pg`, `dotenv`.
- [ ] **Task 4** – Install dependency development: `nodemon`.
- [ ] **Task 5** – Tambahkan script ke `package.json`:
  - `"start": "node src/server.js"`
  - `"dev": "nodemon src/server.js"`
- [ ] **Task 6** – Buat seluruh struktur folder sesuai spesifikasi:
  ```
  api-uts/
  ├── sql/
  └── src/
      ├── config/
      ├── routes/
      ├── middlewares/
      ├── controllers/
      └── repositories/
  ```
- [ ] **Task 7** – Buat file `.env.example` dengan isi berikut (tanpa nilai asli):
  ```
  DB_HOST=
  DB_PORT=
  DB_USER=
  DB_PASSWORD=
  DB_NAME=
  PORT=
  ```
- [ ] **Task 8** – Buat file `.env` lokal dengan nilai asli (tidak masuk Git):
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=<username_postgres_lokal>
  DB_PASSWORD=<password_postgres_lokal>
  DB_NAME=db_uts
  PORT=3000
  ```
- [ ] **Task 9** – Buat `.gitignore` dengan entry berikut:
  ```
  node_modules/
  .env
  ```
- [ ] **Task 10** – Inisialisasi Git repository (`git init`), buat commit awal.

## 5. Expected Files

| File/Folder | Aksi |
|---|---|
| `package.json` | Dibuat |
| `package-lock.json` | Dibuat otomatis oleh npm |
| `.env.example` | Dibuat |
| `.env` | Dibuat (tidak di-commit) |
| `.gitignore` | Dibuat |
| `sql/` | Direktori dibuat |
| `src/app.js` | Dibuat kosong (placeholder) |
| `src/server.js` | Dibuat kosong (placeholder) |
| `src/config/` | Direktori dibuat |
| `src/routes/` | Direktori dibuat |
| `src/middlewares/` | Direktori dibuat |
| `src/controllers/` | Direktori dibuat |
| `src/repositories/` | Direktori dibuat |

## 6. Requirements & Constraints

- Versi Node.js minimum: 18.
- Package yang wajib diinstall: `express`, `pg`, `dotenv`, `nodemon` (dev).
- `.env` **tidak boleh** masuk ke repository (wajib ada di `.gitignore`).
- `.env.example` wajib ada sebagai template tanpa nilai sensitif.
- Struktur folder harus **persis** sesuai spesifikasi di `plan.md` bagian "Struktur Folder".
- Script `start` dan `dev` wajib ada di `package.json`.

## 7. Acceptance Criteria

- Semua direktori dari spesifikasi sudah ada.
- `npm install` berjalan tanpa error.
- `npm run dev` tidak crash (meski `server.js` masih kosong/placeholder).
- `.env` tidak muncul di `git status` (tercakup `.gitignore`).
- `node_modules/` tidak muncul di `git status`.

## 8. Testing & Verification

```bash
# Verifikasi struktur folder
Get-ChildItem -Recurse -Directory

# Verifikasi npm install
npm install

# Verifikasi .gitignore bekerja
git status
# .env dan node_modules/ tidak boleh muncul

# Verifikasi package.json punya script yang benar
cat package.json
```

## 9. Definition of Done

- [ ] Seluruh direktori sudah ada sesuai struktur spesifikasi.
- [ ] `package.json` ada dan berisi dependency serta script yang benar.
- [ ] `.env.example` ada dan berisi semua key tanpa nilai.
- [ ] `.env` ada secara lokal namun tidak ter-track Git.
- [ ] `.gitignore` mengecualikan `.env` dan `node_modules/`.
- [ ] Git repository terinisialisasi dengan commit awal.
- [ ] Siap melanjutkan ke Plan 2.
