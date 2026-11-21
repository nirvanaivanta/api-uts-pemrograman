const pool = require('../config/db');

class KategoriRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    const result = await this.pool.query(
      'SELECT * FROM kategori ORDER BY id ASC'
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.pool.query(
      'SELECT * FROM kategori WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create({ nama_kategori, deskripsi }) {
    const result = await this.pool.query(
      `INSERT INTO kategori (nama_kategori, deskripsi)
       VALUES ($1, $2)
       RETURNING *`,
      [nama_kategori, deskripsi || null]
    );
    return result.rows[0];
  }

  async deleteById(id) {
    const result = await this.pool.query(
      'DELETE FROM kategori WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = new KategoriRepository(pool);
