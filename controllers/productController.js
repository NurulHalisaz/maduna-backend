const Product = require('../models/productModel');

exports.getProducts = (req, res) => {
    Product.findAll((err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data"
            });
        }
        // Karena di productModel sudah kita beri result.rows, 'results' di sini sudah berupa data matang
        res.status(200).json(results);
    });
};

exports.updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, category, volume, description, image, price, stock } = req.body;

    Product.updateProduct(
        id, name, category, volume, description, image, price, stock,
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal update produk"
                });
            }
            res.json({
                message: "Produk berhasil diperbarui"
            });
        }
    );
};

exports.createProduct = (req, res) => {
    const { name, category, volume, description, image, price, stock } = req.body;

    Product.createProduct(
        name, category, volume, description, image, price, stock,
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal menambah produk"
                });
            }
            res.status(201).json({
                message: "Produk berhasil ditambahkan"
            });
        }
    );
};

exports.deleteProduct = (req, res) => {
    const { id } = req.params;

    Product.deleteProduct(id, (err, result) => {
        if (err) {
            // PERBAIKAN: Menampilkan pesan error spesifik jika ditolak oleh sistem Foreign Key Supabase
            if (err.message && err.message.includes("sudah tercatat di riwayat")) {
                return res.status(400).json({
                    message: err.message
                });
            }
            return res.status(500).json({
                message: "Gagal menghapus produk"
            });
        }

        res.json({
            message: "Produk berhasil dihapus"
        });
    });
};
