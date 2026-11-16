require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// 1. DAFTAR ORIGIN MUTLAK (Tidak akan ditimpa oleh env)
const allowedOrigins = [
    'https://madunaofficial.vercel.app', 
    'http://localhost:5500', 
    'http://127.0.0.1:5500', 
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://localhost:5000', 
    'http://127.0.0.1:5000'
];

// Jika ada env tambahan, GABUNGKAN, jangan ditimpa!
if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').forEach(o => allowedOrigins.push(o.trim()));
}

// 2. PENANGANAN PREFLIGHT (OPTIONS) KHUSUS UNTUK VERCEL
app.options('*', cors()); 

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Cetak ke log Vercel jika masih ada yang terblokir
        console.error("CORS Blocked: Origin ini tidak dikenal ->", origin);
        return callback(new Error('CORS_BLOCKED'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());

// Panggil koneksi database
require('./config/database');

// Rute API
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.message === 'CORS_BLOCKED') {
        return res.status(403).json({ message: "Akses diblokir oleh kebijakan CORS" });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Terjadi kesalahan internal pada server" });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server API berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;
