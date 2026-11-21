require('dotenv').config();

const app  = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);

  // Verifikasi koneksi database saat startup
  try {
    const result = await pool.query('SELECT NOW()');
    console.log(`Koneksi database berhasil — server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error('Koneksi database gagal:', err.message);
  }
});
