const produkRepository   = require('../repositories/produkRepository');
const kategoriRepository = require('../repositories/kategoriRepository');

// ── Helper: tangani error database yang berulang di POST/PUT/PATCH ────────────
function handleDbError(err, res, next) {
  if (err.code === '23505') {
    return res.status(409).json({
      status:  'error',
      message: 'kode_produk sudah digunakan.',
    });
  }
  if (err.code === '23503') {
    return res.status(422).json({
      status:  'error',
      message: 'kategori_id tidak ditemukan.',
    });
  }
  next(err);
}

// ── GET /api/produk ───────────────────────────────────────────────────────────
async function getAll(req, res, next) {
  try {
    let kategoriId = null;

    if (req.query.kategori_id !== undefined) {
      kategoriId = parseInt(req.query.kategori_id, 10);
      if (isNaN(kategoriId) || kategoriId < 1) {
        return res.status(400).json({
          status:  'error',
          message: 'kategori_id query param harus bilangan bulat >= 1.',
        });
      }
    }

    const data = await produkRepository.findAll(kategoriId);
    return res.status(200).json({
      status:  'success',
      message: 'Berhasil mengambil data produk.',
      count:   data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/produk/:id ───────────────────────────────────────────────────────
async function getById(req, res, next) {
  try {
    const data = await produkRepository.findById(req.params.id);
    if (!data) {
      return res.status(404).json({
        status:  'error',
        message: 'Produk tidak ditemukan.',
      });
    }
    return res.status(200).json({
      status:  'success',
      message: 'Berhasil mengambil detail produk.',
      data,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/kategori/:id/produk ──────────────────────────────────────────────
async function getByKategori(req, res, next) {
  try {
    const kategori = await kategoriRepository.findById(req.params.id);
    if (!kategori) {
      return res.status(404).json({
        status:  'error',
        message: 'Kategori tidak ditemukan.',
      });
    }

    const data = await produkRepository.findByKategoriId(req.params.id);
    return res.status(200).json({
      status:  'success',
      message: 'Berhasil mengambil produk berdasarkan kategori.',
      count:   data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/produk ──────────────────────────────────────────────────────────
async function create(req, res, next) {
  try {
    const { kategori_id, kode_produk, nama_produk, harga, stok } = req.body;
    const data = await produkRepository.create({ kategori_id, kode_produk, nama_produk, harga, stok });
    return res.status(201).json({
      status:  'success',
      message: 'Produk berhasil ditambahkan.',
      data,
    });
  } catch (err) {
    handleDbError(err, res, next);
  }
}

// ── PUT /api/produk/:id ───────────────────────────────────────────────────────
async function update(req, res, next) {
  try {
    const existing = await produkRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        status:  'error',
        message: 'Produk tidak ditemukan.',
      });
    }

    const { kategori_id, kode_produk, nama_produk, harga, stok } = req.body;
    const data = await produkRepository.update(req.params.id, { kategori_id, kode_produk, nama_produk, harga, stok });
    return res.status(200).json({
      status:  'success',
      message: 'Produk berhasil diperbarui.',
      data,
    });
  } catch (err) {
    handleDbError(err, res, next);
  }
}

// ── PATCH /api/produk/:id ─────────────────────────────────────────────────────
async function patch(req, res, next) {
  try {
    const existing = await produkRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        status:  'error',
        message: 'Produk tidak ditemukan.',
      });
    }

    // Ambil hanya field yang diizinkan dari body
    const allowed = ['kategori_id', 'kode_produk', 'nama_produk', 'harga', 'stok'];
    const fields  = {};
    for (const key of allowed) {
      if (key in req.body) fields[key] = req.body[key];
    }

    const data = await produkRepository.patch(req.params.id, fields);
    return res.status(200).json({
      status:  'success',
      message: 'Produk berhasil diperbarui.',
      data,
    });
  } catch (err) {
    handleDbError(err, res, next);
  }
}

// ── DELETE /api/produk/:id (soft delete) ─────────────────────────────────────
async function softDelete(req, res, next) {
  try {
    const data = await produkRepository.softDelete(req.params.id);
    if (!data) {
      return res.status(404).json({
        status:  'error',
        message: 'Produk tidak ditemukan.',
      });
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/produk/:id/restore ────────────────────────────────────────────
async function restore(req, res, next) {
  try {
    const data = await produkRepository.restore(req.params.id);
    if (!data) {
      return res.status(404).json({
        status:  'error',
        message: 'Produk tidak ditemukan atau tidak sedang terhapus.',
      });
    }
    return res.status(200).json({
      status:  'success',
      message: 'Produk berhasil dipulihkan.',
      data,
    });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/produk/:id/permanent (nilai tambah) ──────────────────────────
async function hardDeletePermanent(req, res, next) {
  try {
    const existing = await produkRepository.findByIdIncludeDeleted(req.params.id);
    if (!existing) {
      return res.status(404).json({
        status:  'error',
        message: 'Produk tidak ditemukan.',
      });
    }
    // Produk masih aktif (belum di-soft delete) → tolak
    if (existing.deleted_at === null) {
      return res.status(409).json({
        status:  'error',
        message: 'Produk aktif tidak dapat dihapus permanen. Lakukan soft delete terlebih dahulu.',
      });
    }
    await produkRepository.hardDelete(req.params.id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, getByKategori, create, update, patch, softDelete, restore, hardDeletePermanent };
