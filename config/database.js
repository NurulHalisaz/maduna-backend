const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'db_maduna'
});

db.connect((err) => {
    if (err) {
        console.error('Gagal terhubung ke database:', err);
    } else {
        console.log('Berhasil terhubung ke database db_maduna!');
    }
});

module.exports = db; // Diekspor agar bisa dipakai oleh controller nanti