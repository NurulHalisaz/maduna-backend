const db = require('../config/database');

const Product = {

    // Ambil semua produk
    findAll: (callback) => {

        db.query(
            "SELECT * FROM products",
            callback
        );

    },

    // Kurangi stok saat ada pesanan
   updateStock: (
            product_id,
            quantity,
            callback
        )=>{

            db.query(
                `
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                `,
                [
                    quantity,
                    product_id
                ],
                callback
            );

        },

    // Update produk
    updateProduct: (
        id,
        name,
        category,
        volume,
        description,
        image,
        price,
        stock,
        callback
    ) => {

        const query = `
            UPDATE products
            SET
                name = ?,
                category = ?,
                volume = ?,
                description = ?,
                image = ?,
                price = ?,
                stock = ?
            WHERE id = ?
        `;

        db.query(
            query,
            [
                name,
                category,
                volume,
                description,
                image,
                price,
                stock,
                id
            ],
            callback
        );

    },

    // Tambah produk
    createProduct: (
        name,
        category,
        volume,
        description,
        image,
        price,
        stock,
        callback
    ) => {

        const query = `
            INSERT INTO products
            (
                name,
                category,
                volume,
                description,
                image,
                price,
                stock
            )
            VALUES (?,?,?,?,?,?,?)
        `;

        db.query(
            query,
            [
                name,
                category,
                volume,
                description,
                image,
                price,
                stock
            ],
            callback
        );

    },

    // Hapus produk
    deleteProduct: (
        id,
        callback
    ) => {

        db.query(
            "DELETE FROM products WHERE id = ?",
            [id],
            callback
        );

    }

};

module.exports = Product;