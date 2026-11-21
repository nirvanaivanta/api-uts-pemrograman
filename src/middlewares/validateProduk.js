// Helper: cek apakah nilai adalah bilangan bulat
function isInteger(val) {
  return Number.isInteger(val);
}

// Validasi untuk POST dan PUT — semua field wajib ada
function validateProduk(req, res, next) {
  const { kategori_id, kode_produk, nama_produk, harga, stok } = req.body;
  const errors = [];

  if (kategori_id === undefined || kategori_id === null || !isInteger(kategori_id) || kategori_id < 1) {
    errors.push('kategori_id wajib diisi dan harus bilangan bulat >= 1.');
  }

  if (!kode_produk || typeof kode_produk !== 'string' || kode_produk.trim() === '') {
    errors.push('kode_produk wajib diisi.');
  }

  if (!nama_produk || typeof nama_produk !== 'string' || nama_produk.trim() === '') {
    errors.push('nama_produk wajib diisi.');
  }

  if (harga === undefined || harga === null || !isInteger(harga) || harga <= 0) {
    errors.push('harga wajib diisi dan harus bilangan bulat > 0.');
  }

  if (stok === undefined || stok === null || !isInteger(stok) || stok < 0) {
    errors.push('stok wajib diisi dan harus bilangan bulat >= 0.');
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

// Validasi untuk PATCH — hanya field yang hadir yang divalidasi, body tidak boleh kosong
function validatePatchProduk(req, res, next) {
  const body   = req.body;
  const errors = [];

  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({
      status:  'error',
      message: 'Validasi gagal.',
      errors:  ['Body request tidak boleh kosong.'],
    });
  }

  if ('kategori_id' in body) {
    if (!isInteger(body.kategori_id) || body.kategori_id < 1) {
      errors.push('kategori_id harus bilangan bulat >= 1.');
    }
  }

  if ('kode_produk' in body) {
    if (!body.kode_produk || typeof body.kode_produk !== 'string' || body.kode_produk.trim() === '') {
      errors.push('kode_produk tidak boleh kosong.');
    }
  }

  if ('nama_produk' in body) {
    if (!body.nama_produk || typeof body.nama_produk !== 'string' || body.nama_produk.trim() === '') {
      errors.push('nama_produk tidak boleh kosong.');
    }
  }

  if ('harga' in body) {
    if (!isInteger(body.harga) || body.harga <= 0) {
      errors.push('harga harus bilangan bulat > 0.');
    }
  }

  if ('stok' in body) {
    if (!isInteger(body.stok) || body.stok < 0) {
      errors.push('stok harus bilangan bulat >= 0.');
    }
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

module.exports = { validateProduk, validatePatchProduk };
