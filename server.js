require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// Konfigurasi CORS yang aman
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'];

app.use(cors({
    origin: function(origin, callback) {
        // Izinkan request tanpa origin (seperti mobile apps, curl, server-to-server) atau saat development
        if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Akses diblokir oleh kebijakan CORS'));
    },
    credentials: true
}));

app.use(express.json());

// Panggil koneksi database dari folder config agar ikut menyala
require('./config/database');

// Rute API
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Error handling middleware untuk CORS / syntax error
app.use((err, req, res, next) => {
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({ message: err.message });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Terjadi kesalahan internal pada server" });
});

const PORT = process.env.PORT || 5000;

// Jalankan app.listen HANYA saat di komputer lokal
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server API berjalan di http://localhost:${PORT}`);
    });
}

// Wajib ditambahkan agar Vercel bisa membaca backend Anda sebagai Serverless Function
module.exports = app;
