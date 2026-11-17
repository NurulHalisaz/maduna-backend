require('dotenv').config(); // Untuk membaca file .env saat tes di laptop
const { Pool } = require('pg');

// Menggunakan Pool lebih disarankan untuk Vercel (Serverless) agar koneksi stabil
const db = new Pool({
    // Vercel akan otomatis mengisi ini dengan link dari pengaturan Environment Variables
    connectionString: process.env.DATABASE_URL,
    
    // Wajib diaktifkan untuk Supabase jika terkoneksi dari server luar (seperti Vercel)
    ssl: {
        rejectUnauthorized: false
    }
});

// Tes koneksi saat server menyala
db.connect((err, client, release) => {
    if (err) {
        console.error('Gagal terhubung ke Supabase (PostgreSQL):', err.stack);
    } else {
        console.log('Berhasil terhubung ke database Supabase!');
        release(); // Lepaskan kembali koneksi ke dalam pool setelah sukses dites
    }
});

module.exports = db;
