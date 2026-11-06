const { Pool } = require('pg');

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Wajib untuk koneksi eksternal/cloud
    }
});

// Test koneksi saat server berjalan
db.connect((err, client, release) => {
    if (err) {
        console.error('Gagal terhubung ke database Supabase:', err.message);
    } else {
        console.log('Berhasil terhubung ke database Supabase (PostgreSQL)!');
        release(); // Lepaskan client kembali ke pool
    }
});

module.exports = db;
