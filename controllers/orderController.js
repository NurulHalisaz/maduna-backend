const db = require('../config/database');
const Order = require('../models/orderModel');

/**
 * Membuat Pesanan Baru dengan Database Transaction (ACID) via Supabase
 */
exports.createOrder = async (req, res) => {
    const { quantity, total_price, items } = req.body;
    const user_id = req.user ? req.user.id : req.body.user_id;

    if (!user_id) {
        return res.status(401).json({ message: "Pengguna tidak terautentikasi" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Keranjang belanja tidak boleh kosong!" });
    }

    const parsedQty = Number(quantity);
    const parsedTotal = Number(total_price);

    if (isNaN(parsedQty) || parsedQty <= 0 || isNaN(parsedTotal) || parsedTotal <= 0) {
        return res.status(400).json({ message: "Data pesanan tidak valid!" });
    }

    // Ambil koneksi khusus untuk transaksi dari pool pg
    const client = await db.connect();

    try {
        await client.query('BEGIN'); // Mulai Transaksi

        // 1. Simpan Header Pesanan (Gunakan RETURNING id)
        const insertOrderQuery = `
            INSERT INTO orders (user_id, quantity, total_price, status)
            VALUES ($1, $2, $3, 'pending') RETURNING id
        `;
        const orderResult = await client.query(insertOrderQuery, [user_id, parsedQty, parsedTotal]);
        const orderId = orderResult.rows[0].id; // Ambil ID pesanan

        // 2. Proses tiap item secara berurutan
        for (const item of items) {
            const productId = Number(item.product_id || item.id);
            const itemQty = Number(item.quantity || item.qty);

            if (!productId || isNaN(itemQty) || itemQty <= 0) {
                throw new Error("Data item pesanan tidak valid");
            }

            // Cek stok produk
            const productResult = await client.query("SELECT id, name, stock FROM products WHERE id = $1", [productId]);
            
            if (productResult.rows.length === 0) {
                throw new Error(`Produk dengan ID ${productId} tidak ditemukan`);
            }

            const product = productResult.rows[0];
            if (product.stock < itemQty) {
                throw new Error(`Stok produk "${product.name}" tidak mencukupi (Tersisa: ${product.stock}, diminta: ${itemQty})`);
            }

            // Masukkan ke order_items
            await client.query(
                "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)",
                [orderId, productId, itemQty]
            );

            // Kurangi stok produk
            await client.query(
                "UPDATE products SET stock = stock - $1 WHERE id = $2",
                [itemQty, productId]
            );
        }

        await client.query('COMMIT'); // Simpan transaksi
        res.status(201).json({
            message: "Pesanan berhasil dibuat!",
            orderId: orderId
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Batalkan jika ada error
        console.error("Transaksi dibatalkan:", error.message);
        
        if (error.message.includes("tidak valid") || error.message.includes("tidak ditemukan") || error.message.includes("tidak mencukupi")) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Gagal memproses transaksi pesanan" });
    } finally {
        client.release(); // Lepaskan koneksi kembali ke pool
    }
};

/**
 * Mengambil Riwayat Pesanan Customer
 */
exports.getOrderHistory = (req, res) => {
    const targetUserId = req.params.userId;

    if (req.user && req.user.role !== 'admin' && String(req.user.id) !== String(targetUserId)) {
        return res.status(403).json({
            message: "Akses ditolak! Anda hanya berhak melihat riwayat pesanan milik Anda sendiri."
        });
    }

    Order.getHistory(targetUserId, (err, results) => {
        if (err) {
            console.error("Gagal mengambil riwayat:", err);
            return res.status(500).json({
                message: "Gagal mengambil data riwayat pesanan"
            });
        }
        res.status(200).json(results);
    });
};