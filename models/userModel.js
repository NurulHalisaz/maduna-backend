const db = require('../config/database');

const User = {
    // Menambah user baru saat register (Tambah RETURNING id agar mengembalikan ID data yang baru dibuat)
    create: (name, email, password, callback) => {
        const query =
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer') RETURNING id";

        db.query(query, [name, email, password], callback);
    },

    // Mencari user berdasarkan email saat login
    findByEmail: (email, callback) => {
        db.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
            (err, result) => {
                if (err) return callback(err, null);
                callback(null, result.rows); // Mengembalikan array seperti MySQL
            }
        );
    },

    // Mencari user berdasarkan ID
    findById: (id, callback) => {
        db.query(
            "SELECT id, name, email, role FROM users WHERE id = $1",
            [id],
            (err, result) => {
                if (err) return callback(err, null);
                callback(null, result.rows);
            }
        );
    },

    // Update user
    updateUser: (id, name, email, role, callback) => {
        const query = `
            UPDATE users
            SET name = $1, email = $2, role = $3
            WHERE id = $4
        `;
        db.query(query, [name, email, role, id], callback);
    },

    // Hapus user
    deleteUser: (id, callback) => {
        db.query("DELETE FROM users WHERE id = $1", [id], callback);
    },

    saveResetToken: (email, token, expired, callback) => {
        const query = `
            UPDATE users
            SET reset_token = $1, reset_token_expired = $2
            WHERE email = $3
        `;
        db.query(query, [token, expired, email], callback);
    },

    findByResetToken: (token, callback) => {
        const query = `
            SELECT * FROM users
            WHERE reset_token = $1 AND reset_token_expired > NOW()
        `;
        db.query(query, [token], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result.rows);
        });
    },

    updatePassword: (id, password, callback) => {
        const query = `
            UPDATE users
            SET password = $1, reset_token = NULL, reset_token_expired = NULL
            WHERE id = $2
        `;
        db.query(query, [password, id], callback);
    }
};

module.exports = User;