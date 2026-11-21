require('dotenv').config();

const express = require('express');

const app = express();

// ── Middleware: parse JSON body ───────────────────────────────────────────────
app.use(express.json());

// ── Middleware: tangkap JSON rusak (SyntaxError dari express.json()) ──────────
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status:  'error',
      message: 'JSON tidak valid. Periksa format body request.',
    });
  }
  next(err);
});

// ── Routes (akan didaftarkan di plan berikutnya) ──────────────────────────────
// app.use('/api/kategori', kategoriRoutes);
// app.use('/api/produk',   produkRoutes);

// ── Handler: route tidak dikenal → 404 ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status:  'error',
    message: 'Route tidak ditemukan',
  });
});

// ── Global error handler → 500 ───────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status:  'error',
    message: 'Terjadi kesalahan internal server.',
  });
});

module.exports = app;
