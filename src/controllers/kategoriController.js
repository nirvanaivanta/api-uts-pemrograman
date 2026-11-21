const kategoriRepository = require('../repositories/kategoriRepository');

async function getAll(req, res, next) {
  try {
    const data = await kategoriRepository.findAll();
    return res.status(200).json({
      status:  'success',
      message: 'Berhasil mengambil data kategori.',
      count:   data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await kategoriRepository.findById(req.params.id);
    if (!data) {
      return res.status(404).json({
        status:  'error',
        message: 'Kategori tidak ditemukan.',
      });
    }
    return res.status(200).json({
      status:  'success',
      message: 'Berhasil mengambil detail kategori.',
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { nama_kategori, deskripsi } = req.body;
    const data = await kategoriRepository.create({ nama_kategori, deskripsi });
    return res.status(201).json({
      status:  'success',
      message: 'Kategori berhasil ditambahkan.',
      data,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        status:  'error',
        message: 'nama_kategori sudah digunakan.',
      });
    }
    next(err);
  }
}

async function deleteById(req, res, next) {
  try {
    const existing = await kategoriRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        status:  'error',
        message: 'Kategori tidak ditemukan.',
      });
    }
    await kategoriRepository.deleteById(req.params.id);
    return res.status(204).send();
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        status:  'error',
        message: 'Kategori tidak dapat dihapus karena masih memiliki produk.',
      });
    }
    next(err);
  }
}

module.exports = { getAll, getById, create, deleteById };
