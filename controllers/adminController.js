const db = require('../config/database');
const User = require('../models/userModel');

// 1. Melihat Semua Pesanan Masuk
exports.getAllOrders = (req, res) => {
    // Mengambil data pesanan beserta nama pembelinya dan produk (JOIN tabel)
    const query = `
        SELECT 
            orders.id, 
            users.name, 
            orders.quantity, 
            orders.total_price, 
            orders.status, 
            orders.order_date,
            GROUP_CONCAT(products.name SEPARATOR ', ') AS product_name
        FROM orders 
        JOIN users ON orders.user_id = users.id
        LEFT JOIN order_items ON orders.id = order_items.order_id
        LEFT JOIN products ON order_items.product_id = products.id
        GROUP BY orders.id
        ORDER BY orders.order_date DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal mengambil data pesanan" });
        res.status(200).json(results);
    });
};

// 2. Mengubah Status Pesanan (Misal: dari 'pending' menjadi 'dikirim')
exports.updateOrderStatus = (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    const query = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(query, [status, orderId], (err, result) => {
        if (err) return res.status(500).json({ message: "Gagal merubah status" });
        res.status(200).json({ message: `Status pesanan berhasil diubah menjadi ${status}` });
    });
};

exports.cancelOrder = (req,res)=>{

    const id = req.params.id;

    const query =
    `
    UPDATE orders
    SET status='dibatalkan'
    WHERE
        id=?
    AND
        status='pending'
    `;

    db.query(
        query,
        [id],
        (err)=>{

            if(err){

                return res.status(500).json({
                    message:"Gagal membatalkan pesanan"
                });

            }

            res.json({
                message:"Pesanan dibatalkan"
            });

        }
    );

};

// 3. Melihat Daftar Pengguna (User Administration)
exports.getAllUsers = (req, res) => {
    const query = "SELECT id, name, email, role, created_at FROM users";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal mengambil data pengguna" });
        res.status(200).json(results);
    });
};

// 4. Edit User
exports.updateUser = (req, res) => {
const userId = req.params.id;

const {
    name,
    email,
    role
} = req.body;

User.updateUser(
    userId,
    name,
    email,
    role,
    (err, result) => {

        if (err) {

            return res.status(500).json({
                message: "Gagal mengupdate user"
            });

        }

        res.status(200).json({
            message: "User berhasil diperbarui"
        });

    }
);
};

// 5. Hapus User
exports.deleteUser = (req, res) => {
const userId = req.params.id;

User.deleteUser(
    userId,
    (err, result) => {

        if (err) {

            return res.status(500).json({
                message: "Gagal menghapus user"
            });

        }

        res.status(200).json({
            message: "User berhasil dihapus"
        });

    }
);

};

