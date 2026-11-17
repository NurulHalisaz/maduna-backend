const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Panggil koneksi database dari folder config agar ikut menyala
require('./config/database');

// Rute API
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Handler 404 untuk rute yang tidak ditemukan (selalu dalam format JSON standar)
app.use((req, res) => {
    res.status(404).json({
        message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan pada server.`
    });
});

// Global Error Handler Middleware (mencegah crash & kebocoran HTML stack trace)
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Terjadi kesalahan internal pada server."
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server API berjalan di http://localhost:${PORT}`);
});
