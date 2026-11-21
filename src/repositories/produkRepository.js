const pool = require('../config/db');

class ProdukRepository {
  constructor(pool) {
    this.pool = pool;
  }

  // Ambil semua produk aktif. Opsional filter by kategori_id (nilai tambah).
  async findAll(kategoriId = null) {
    if (kategoriId) {
      const result = await this.pool.query(
        `SELECT * FROM produk
         WHERE deleted_at IS NULL AND kategori_id = $1
         ORDER BY id ASC`,
        [kategoriId]
      );
      return result.rows;
    }

    const result = await this.pool.query(
      `SELECT * FROM produk
       WHERE deleted_at IS NULL
       ORDER BY id ASC`
    );
    return result.rows;
  }

  // Ambil satu produk aktif berdasarkan id.
  async findById(id) {
    const result = await this.pool.query(
      `SELECT * FROM produk
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Ambil satu produk (termasuk yang sudah soft-deleted) — untuk keperluan hard delete.
  async findByIdIncludeDeleted(id) {
    const result = await this.pool.query(
      'SELECT * FROM produk WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Ambil produk aktif milik satu kategori.
  async findByKategoriId(kategoriId) {
    const result = await this.pool.query(
      `SELECT * FROM produk
       WHERE kategori_id = $1 AND deleted_at IS NULL
       ORDER BY id ASC`,
      [kategoriId]
    );
    return result.rows;
  }

  // Tambah produk baru.
  async create({ kategori_id, kode_produk, nama_produk, harga, stok }) {
    const result = await this.pool.query(
      `INSERT INTO produk (kategori_id, kode_produk, nama_produk, harga, stok)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [kategori_id, kode_produk, nama_produk, harga, stok]
    );
    return result.rows[0];
  }

  // Ganti seluruh data produk aktif (PUT).
  async update(id, { kategori_id, kode_produk, nama_produk, harga, stok }) {
    const result = await this.pool.query(
      `UPDATE produk
       SET kategori_id = $1,
           kode_produk = $2,
           nama_produk = $3,
           harga       = $4,
           stok        = $5
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING *`,
      [kategori_id, kode_produk, nama_produk, harga, stok, id]
    );
    return result.rows[0] || null;
  }

  // Ubah sebagian field produk aktif (PATCH) — SET clause dibangun secara dinamis.
  async patch(id, fields) {
    const keys   = Object.keys(fields);
    const values = Object.values(fields);

    // Bangun "key1 = $1, key2 = $2, ..."
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    // id ditempatkan setelah semua nilai field
    values.push(id);
    const idParam = `$${values.length}`;

    const result = await this.pool.query(
      `UPDATE produk
       SET ${setClause}
       WHERE id = ${idParam} AND deleted_at IS NULL
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  // Soft delete: isi deleted_at = NOW(), hanya untuk produk aktif.
  async softDelete(id) {
    const result = await this.pool.query(
      `UPDATE produk
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Restore: kembalikan deleted_at = NULL, hanya untuk produk yang terhapus.
  async restore(id) {
    const result = await this.pool.query(
      `UPDATE produk
       SET deleted_at = NULL
       WHERE id = $1 AND deleted_at IS NOT NULL
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Hard delete (nilai tambah): hapus permanen, hanya untuk produk yang sudah soft-deleted.
  async hardDelete(id) {
    const result = await this.pool.query(
      `DELETE FROM produk
       WHERE id = $1 AND deleted_at IS NOT NULL
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = new ProdukRepository(pool);
