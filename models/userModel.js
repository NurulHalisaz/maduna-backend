const db = require('../config/database');

const User = {
    // Menambah user baru saat register
    create: (name, email, password, callback) => {
        // PostgreSQL menggunakan $1, $2, $3... bukan ?
        const query = "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer')";
        
        db.query(query, [name, email, password], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    // Mencari user berdasarkan email saat login
    findByEmail: (email, callback) => {
        // Kita gunakan LOWER() agar email kebal terhadap huruf besar/kecil
        const query = "SELECT * FROM users WHERE LOWER(email) = LOWER($1)";
        
        db.query(query, [email], (err, result) => {
            if (err) return callback(err, null);
            // Di PostgreSQL, data tabel disimpan di dalam ".rows"
            callback(null, result.rows);
        });
    },

    // Update user
    updateUser: (id, name, email, role, callback) => {
        const query = "UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4";
        
        db.query(query, [name, email, role, id], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    // Hapus user
    deleteUser: (id, callback) => {
        const query = "DELETE FROM users WHERE id = $1";
        
        db.query(query, [id], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    saveResetToken: (email, token, expired, callback) => {
        const query = "UPDATE users SET reset_token = $1, reset_token_expired = $2 WHERE email = $3";
        
        db.query(query, [token, expired, email], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    findByResetToken: (token, callback) => {
        const query = "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expired > NOW()";
        
        db.query(query, [token], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result.rows);
        });
    },

    updatePassword: (id, password, callback) => {
        const query = "UPDATE users SET password = $1, reset_token = NULL, reset_token_expired = NULL WHERE id = $2";
        
        db.query(query, [password, id], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    }
};

module.exports = User;
