/**
 * server.js
 * Backend API untuk Maduna
 * URL produksi  : https://maduna-backend.vercel.app/
 * Front‑end URL : https://madunaofficial.vercel.app/
 *
 * - Menggunakan Express + CORS
 * - Koneksi DB di ./config/database
 * - Semua rute API didefinisikan di ./routes/api
 * - 404 & error handler mengembalikan JSON standar
 * - Export aplikasi untuk Vercel (serverless) dan
 *   start server secara lokal ketika file dijalankan langsung.
 */

const express = require('express');
const cors    = require('cors');

const app = express();

// ------------------------------------------------------------------
// 1️⃣ Middleware
// ------------------------------------------------------------------
app.use(
  cors({
    origin: '*', // <--- Izinkan semua domain/frontend untuk mengakses API ini
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);
app.use(express.json()); // parse JSON body otomatis
// ------------------------------------------------------------------
// 2️⃣ Koneksi Database
// ------------------------------------------------------------------
// Pastikan file ./config/database meng‑export / meng‑inisialisasi
// koneksi (mis. mongoose.connect). Jika terjadi error, akan ter‑log
// ke console sehingga Anda bisa melihatnya di Vercel logs.
require('./config/database');

// ------------------------------------------------------------------
// 3️⃣ Rute API
// ------------------------------------------------------------------
const apiRoutes = require('./routes/api');
// Semua endpoint berada di bawah /api, mis: /api/comments, /api/login, dll.
app.use('/api', apiRoutes);

// ------------------------------------------------------------------
// 4️⃣ Route health‑check (opsional)
// ------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ message: 'Maduna Backend API is alive' });
});

// ------------------------------------------------------------------
// 5️⃣ 404 Handler – selalu mengembalikan JSON
// ------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan pada server.`,
  });
});

// ------------------------------------------------------------------
// 6️⃣ Global Error Handler – mencegah crash & mengembalikan JSON
// ------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan internal pada server.',
  });
});

// ------------------------------------------------------------------
// 7️⃣ Export & Conditional listen
// ------------------------------------------------------------------
// Vercel (dan kebanyakan platform serverless) meng‑import modul ini
// sebagai handler, jadi kami **tidak** memanggil app.listen di sana.
// Ketika dijalankan secara lokal (node server.js) kita tetap ingin
// server aktif, oleh karena itu gunakan conditional.
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  // Dijalankan secara langsung → mode development / testing lokal
  app.listen(PORT, () => {
    console.log(`🚀 Server API berjalan di http://localhost:${PORT}`);
  });
}

// Export untuk Vercel (atau platform serverless lainnya)
module.exports = app;
