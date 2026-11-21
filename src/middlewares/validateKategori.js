function validateKategori(req, res, next) {
  const { nama_kategori } = req.body;
  const errors = [];

  if (!nama_kategori || typeof nama_kategori !== 'string' || nama_kategori.trim() === '') {
    errors.push('nama_kategori wajib diisi.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status:  'error',
      message: 'Validasi gagal.',
      errors,
    });
  }

  next();
}

module.exports = validateKategori;
