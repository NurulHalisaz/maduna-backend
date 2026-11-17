const db = require('../config/database');

const Product = {
    // Ambil semua produk
    findAll: (callback) => {
        db.query("SELECT * FROM products", (err, result) => {
            if (err) return callback(err, null);
            callback(null, result.rows);
        });
    },

    // Kurangi stok saat ada pesanan
    updateStock: (product_id, quantity, callback) => {
        const query = `
            UPDATE products
            SET stock = stock - $1
            WHERE id = $2
        `;
        db.query(query, [quantity, product_id], (err, result) => {
             if (err) return callback(err, null);
             callback(null, result);
        });
    },

    // Update produk
    updateProduct: (id, name, category, volume, description, image, price, stock, callback) => {
        const query = `
            UPDATE products
            SET name = $1, category = $2, volume = $3, description = $4, image = $5, price = $6, stock = $7
            WHERE id = $8
        `;
        db.query(query, [name, category, volume, description, image, price, stock, id], (err, result) => {
             if (err) return callback(err, null);
             callback(null, result);
        });
    },

    // Tambah produk
    createProduct: (name, category, volume, description, image, price, stock, callback) => {
        const query = `
            INSERT INTO products (name, category, volume, description, image, price, stock)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        db.query(query, [name, category, volume, description, image, price, stock], (err, result) => {
             if (err) return callback(err, null);
             callback(null, result);
        });
    },

    // Hapus produk
    deleteProduct: (id, callback) => {
        db.query("DELETE FROM products WHERE id = $1", [id], (err, result) => {
            if (err) {
                // Menangani error referensi jika produk sudah dibeli (Foreign Key constraint di Supabase)
                if (err.code === '23503') {
                    return callback(new Error("Produk tidak bisa dihapus karena sudah tercatat di riwayat pesanan."), null);
                }
                return callback(err, null);
            }
            callback(null, result);
        });
    }
};

module.exports = Product;
