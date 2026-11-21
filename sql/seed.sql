-- seed.sql
-- Data awal untuk database db_uts (Toko Online)
-- Aman dijalankan ulang: ON CONFLICT DO NOTHING mencegah error duplikat

-- Seed tabel kategori (minimal 3 baris)
INSERT INTO kategori (id, nama_kategori, deskripsi) VALUES
    (1, 'Elektronik',  'Perangkat elektronik dan gadget'),
    (2, 'Pakaian',     'Pakaian pria dan wanita'),
    (3, 'Makanan',     'Makanan dan minuman ringan')
ON CONFLICT DO NOTHING;

-- Seed tabel produk (minimal 5 baris)
INSERT INTO produk (id, kategori_id, kode_produk, nama_produk, harga, stok) VALUES
    (1, 1, 'ELK-001', 'Laptop ASUS VivoBook',    8500000, 15),
    (2, 1, 'ELK-002', 'Smartphone Samsung A54',  4200000, 30),
    (3, 2, 'PKN-001', 'Kaos Polos Cotton',          89000, 100),
    (4, 2, 'PKN-002', 'Celana Jeans Slim Fit',     250000, 50),
    (5, 3, 'MKN-001', 'Keripik Singkong Pedas',     15000, 200)
ON CONFLICT DO NOTHING;

-- Reset sequence agar id berikutnya tidak bentrok dengan data seed
SELECT setval('kategori_id_seq', (SELECT MAX(id) FROM kategori));
SELECT setval('produk_id_seq',   (SELECT MAX(id) FROM produk));
