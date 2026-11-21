Soal UTS Pemrograman API
Project REST API Express.js dan PostgreSQL

Bangun REST API untuk dua resource yang berelasi one-to-many: satu tabel induk memiliki banyak baris tabel anak. Tabel anak memakai soft delete, tabel induk memakai hard delete.

A. Rancangan Database

Buat database db_uts dan simpan perintahnya di sql/schema.sql. Tambahkan data awal di sql/seed.sql (minimal 3 baris induk dan 5 baris anak).

Toko Online
Struktur Tabel
Tabel	Kolom	Tipe dan Constraint
kategori (induk)	id	SERIAL PRIMARY KEY
kategori (induk)	nama_kategori	VARCHAR(50) NOT NULL UNIQUE
kategori (induk)	deskripsi	VARCHAR(200), boleh kosong
kategori (induk)	created_at	TIMESTAMP NOT NULL DEFAULT NOW()
produk (anak)	id	SERIAL PRIMARY KEY
produk (anak)	kategori_id	INTEGER NOT NULL, FOREIGN KEY ke kategori(id)
produk (anak)	kode_produk	VARCHAR(20) NOT NULL UNIQUE
produk (anak)	nama_produk	VARCHAR(100) NOT NULL
produk (anak)	harga	INTEGER NOT NULL CHECK (harga > 0)
produk (anak)	stok	INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0)
produk (anak)	created_at	TIMESTAMP NOT NULL DEFAULT NOW()
produk (anak)	deleted_at	TIMESTAMP NULL (NULL berarti aktif)
A1. Arsitektur dan Koneksi
Pisahkan kode menjadi lapisan seperti di Materi 05 dan 06. Satu lapisan, satu tanggung jawab.
Koneksi memakai pg Pool yang dibuat sekali di config/db.js, konfigurasi dibaca dari .env.
Repository berupa class dan diekspor satu instance. Seluruh SQL hanya ada di repository, controller tidak boleh menulis SQL.
Semua query berparameter ($1, $2, dan seterusnya).
app.js menyusun aplikasi (express.json(), router, handler 404 route, error handler terpusat).
server.js hanya menjalankan listen.
Middleware parseId memvalidasi id di URL. Middleware validasi memakai pola dua fungsi (validate... untuk POST dan PUT, validatePatch untuk PATCH).
JSON rusak dibalas 400, error tak terduga dibalas 500 dengan pesan umum. Detail error hanya dicetak ke console.
Struktur Folder
text
api-uts/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── sql/
│   ├── schema.sql
│   └── seed.sql
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   └── db.js
    ├── routes/
    │   ├── kategoriRoutes.js
    │   └── produkRoutes.js
    ├── middlewares/
    │   ├── parseId.js
    │   ├── validateKategori.js
    │   └── validateProduk.js
    ├── controllers/
    │   ├── kategoriController.js
    │   └── produkController.js
    └── repositories/
        ├── kategoriRepository.js
        └── produkRepository.js

A2. Endpoint Tabel Induk (Hard Delete)
Method	URL	Fungsi	Status
GET	/api/kategori	Daftar semua kategori	200
GET	/api/kategori/:id	Detail satu kategori	200, 400, 404
POST	/api/kategori	Tambah kategori	201, 400, 409
DELETE	/api/kategori/:id	Hard delete: baris dihapus permanen dengan DELETE FROM	204, 400, 404, 409

Jika kategori masih dirujuk produk, PostgreSQL melempar error 23503. Tangkap kode itu dan balas 409 Conflict dengan pesan yang jelas, bukan 500.

A3. Endpoint Tabel Anak (CRUD Lengkap)
Method	URL	Fungsi	Status
GET	/api/produk	Daftar produk aktif beserta count	200
GET	/api/produk/:id	Detail satu produk aktif	200, 400, 404
GET	/api/kategori/:id/produk	Produk aktif milik satu kategori (data kosong tetap 200)	200, 400, 404
POST	/api/produk	Tambah produk	201, 400, 409, 422
PUT	/api/produk/:id	Ganti seluruh data, semua field wajib	200, 400, 404, 409, 422
PATCH	/api/produk/:id	Ubah sebagian field	200, 400, 404, 409, 422
DELETE	/api/produk/:id	Soft delete (lihat A4)	204, 400, 404
PATCH	/api/produk/:id/restore	Pulihkan produk yang di-soft delete	200, 400, 404
Catatan Kode Status
409 dipakai untuk pelanggaran UNIQUE (23505), misalnya kode_produk kembar.
422 dipakai bila kategori_id tidak ada di tabel kategori. PostgreSQL melempar 23503 pada INSERT dan UPDATE. Kodenya sama dengan kasus hapus induk, tetapi statusnya berbeda karena operasinya berbeda.
PUT ditolak 400 bila ada field yang kurang. PATCH dengan body {} ditolak 400.
Aturan Validasi
Resource	Field	Aturan
kategori	nama_kategori	wajib, tidak kosong
produk	kategori_id	bilangan bulat >= 1
produk	kode_produk	wajib, tidak kosong
produk	nama_produk	wajib, tidak kosong
produk	harga	bilangan bulat > 0
produk	stok	bilangan bulat >= 0
A4. Soft Delete dan Restore
DELETE /api/produk/:id hanya mengisi deleted_at = NOW() dengan UPDATE. Baris tetap ada di tabel.
Hanya baris dengan deleted_at IS NULL yang dianggap ada oleh API. Filter ini wajib di GET daftar, GET by id, GET nested, PUT, PATCH, dan soft delete itu sendiri. Soft delete kedua pada id yang sama dibalas 404.
PATCH /api/produk/:id/restore mengembalikan deleted_at menjadi NULL, hanya untuk baris yang sedang terhapus. Produk yang masih aktif atau tidak ada dibalas 404.
Produk yang sudah di-soft delete masih merujuk kategorinya, sehingga hard delete kategori tetap ditolak 409 selama baris itu ada. Jelaskan akibat ini di README.
Nilai kode_produk milik baris soft delete tetap memicu 409 bila dipakai lagi. Jelaskan keputusan desain Anda di README.
Nilai Tambah

Maksimal 5 poin, total nilai tidak melebihi 100:

DELETE /api/produk/:id/permanent sebagai hard delete pada tabel anak, hanya untuk baris yang sudah di-soft delete (baris aktif dibalas 409).
Filter GET /api/produk?kategori_id=1.
Format Respons
Situasi	Bentuk Respons
Sukses	{ "status": "success", "message": "...", "data": ... }
Daftar	Menambah count.
Soft delete dan hard delete sukses	Mengirim 204 tanpa body.
Gagal	{ "status": "error", "message": "...", "errors": [...] }
Field errors	Hanya untuk kegagalan validasi.
URL tidak dikenal	404 dengan message "Route tidak ditemukan"
Error server	500 dengan pesan umum. Pesan internal PostgreSQL tidak boleh bocor ke klien.
B. Pengujian dengan Postman

Buat Postman Collection bernama UTS Pemrograman API dan satu Environment. Jalankan seluruh skenario dengan Collection Runner.

B1. Struktur Collection
Environment berisi variabel baseUrl (http://localhost:3000), kategoriId, produkId, dan kategoriSementaraId. Semua URL memakai {{baseUrl}}, tanpa alamat yang ditulis langsung.
Tiga folder:
1-Alur Utama
2-Skenario Error
3-Bukti Delete
Request yang membuat data (POST) menyimpan id baru ke environment lewat tab Tests, lalu request berikutnya memakai {{kategoriId}} dan {{produkId}}.
Setiap request punya minimal satu pm.test yang memeriksa kode status. Untuk skenario yang mengubah data, periksa juga isi data pada respons.
Urutan request di folder 1 harus bisa dijalankan berulang kali lewat Runner tanpa error di database yang sudah diisi seed. Gunakan nilai unik pada nama_kategori dan kode_produk (misalnya {{$timestamp}}).
B2. Folder 1: Alur Utama

Jalankan berurutan. Seluruh test harus hijau.

No	Request	Hasil yang Diharapkan
S01	POST /api/kategori	201, simpan kategoriId
S02	POST /api/produk dengan kategori_id = {{kategoriId}}	201, simpan produkId, deleted_at bernilai null
S03	GET /api/produk/{{produkId}}	200, id sama dengan produkId
S04	GET /api/kategori/{{kategoriId}}/produk	200, count minimal 1, memuat produk S02
S05	PUT /api/produk/{{produkId}} dengan 5 field lengkap	200, seluruh field berubah sesuai body
S06	PATCH /api/produk/{{produkId}} body { "stok": 40 }	200, hanya stok yang berubah
S07	DELETE /api/produk/{{produkId}} (soft delete)	204 tanpa body
S08	GET /api/produk/{{produkId}}	404, data tersembunyi
S09	GET /api/produk	200, tidak memuat produkId
S10	PATCH /api/produk/{{produkId}}/restore	200, deleted_at kembali null
S11	GET /api/produk/{{produkId}}	200, data muncul lagi
S12	DELETE /api/kategori/{{kategoriId}}	409, kategori masih dipakai produk
S13	POST /api/kategori (kategori sementara), simpan kategoriSementaraId	201
S14	DELETE /api/kategori/{{kategoriSementaraId}} (hard delete)	204
S15	GET /api/kategori/{{kategoriSementaraId}}	404, baris hilang permanen
B3. Folder 2: Skenario Error
No	Request	Alasan	Status
N01	POST /api/kategori body { "nama_kategori": "" }	Field wajib kosong	400
N02	POST /api/kategori dengan nama_kategori yang sudah ada	UNIQUE (23505)	409
N03	POST /api/produk body harga = -5 dan stok = "banyak"	Dua kesalahan sekaligus, errors berisi dua pesan	400
N04	POST /api/produk dengan kategori_id = 99999	Kategori tidak ada (23503)	422
N05	POST /api/produk dengan kode_produk milik produk lain	UNIQUE (23505)	409
N06	PUT /api/produk/{{produkId}} body { "nama_produk": "Baru" }	PUT tidak lengkap	400
N07	PATCH /api/produk/{{produkId}} body {}	Tidak ada field	400
N08	PATCH /api/produk/{{produkId}} dengan kode_produk milik produk lain	UNIQUE (23505)	409
N09	GET /api/produk/abc	Format id salah	400
N10	GET /api/produk/99999	Id tidak ada	404
N11	DELETE /api/produk/99999	Id tidak ada	404
N12	DELETE /api/produk/{{produkId}} dua kali berturut-turut (periksa request kedua)	Sudah terhapus	404
N13	PATCH /api/produk/{{produkId}}/restore dua kali berturut-turut (periksa request kedua)	Tidak sedang terhapus	404
N14	POST /api/produk dengan body JSON rusak (koma berlebih di akhir)	JSON tidak valid	400

Setiap skenario error juga memeriksa isi respons: status bernilai "error" dan message tidak kosong.

B4. Folder 3: Bukti Delete di Database

Tunjukkan perbedaan soft delete dan hard delete langsung di PostgreSQL (psql atau pgAdmin). Tangkap layar hasil SELECT pada keadaan berikut:

Setelah S07: baris produk masih ada dan kolom deleted_at terisi waktu.
Setelah S10: kolom deleted_at kembali kosong (NULL).
Setelah S14: baris kategori sementara sudah tidak ada di tabel.
B5. Hasil Collection Runner

Tangkap layar ringkasan Runner yang menunjukkan jumlah test lulus dan gagal untuk folder 1 dan folder 2.

Jangan mengubah hasil tangkapan layar. Nilai dihitung dari skenario yang benar-benar lulus.

Pengumpulan dan Rubrik Penilaian
Yang Dikumpulkan

Satu repository GitHub, cabang main, tanpa .env dan node_modules.

Kode sumber lengkap beserta package.json, .env.example, dan .gitignore.
sql/schema.sql dan sql/seed.sql.
File Postman Collection diberi nama uts.postman_collection.json.
README.md yang memuat:
Cara menjalankan server.
Rancangan tabel dan relasinya.
Daftar endpoint beserta contoh body.
Keputusan desain: alasan memilih PUT dan PATCH.
Perilaku soft delete terhadap UNIQUE dan foreign key.
Alasan hard delete pada tabel induk.
Tangkapan layar: hasil Collection dan bukti database (Folder 1, 2, 3).
Judul pengumpulan: UTS-PemrogAPI-[namakelompok].