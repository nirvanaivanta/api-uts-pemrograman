-- schema.sql
-- DDL untuk database db_uts (Toko Online)
-- Aman dijalankan ulang: DROP TABLE IF EXISTS dipasang di awal

DROP TABLE IF EXISTS produk;
DROP TABLE IF EXISTS kategori;

-- Tabel induk: kategori (hard delete)
CREATE TABLE kategori (
    id            SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(50)  NOT NULL UNIQUE,
    deskripsi     VARCHAR(200),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Tabel anak: produk (soft delete via deleted_at)
CREATE TABLE produk (
    id           SERIAL PRIMARY KEY,
    kategori_id  INTEGER      NOT NULL REFERENCES kategori(id),
    kode_produk  VARCHAR(20)  NOT NULL UNIQUE,
    nama_produk  VARCHAR(100) NOT NULL,
    harga        INTEGER      NOT NULL CHECK (harga > 0),
    stok         INTEGER      NOT NULL DEFAULT 0 CHECK (stok >= 0),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMP    NULL
);
