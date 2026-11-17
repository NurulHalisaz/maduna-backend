const db = require('../config/database');

const Order = {

    // Simpan pesanan baru
    create: (
        user_id,
        quantity,
        total_price,
        callback
    ) => {

        const query =
        `
        INSERT INTO orders
        (
            user_id,
            quantity,
            total_price,
            status
        )
        VALUES
        (
            ?,
            ?,
            ?,
            'pending'
        )
        `;

        db.query(
            query,
            [
                user_id,
                quantity,
                total_price
            ],
            callback
        );

    },
    createOrderItem: (
    order_id,
    product_id,
    quantity,
    callback
) => {

    db.query(
        `
        INSERT INTO order_items
        (
            order_id,
            product_id,
            quantity
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
        `,
        [
            order_id,
            product_id,
            quantity
        ],
        callback
    );

},

    // Ambil semua pesanan (Admin)
    findAll: (callback) => {

        const query = `
            SELECT
                orders.id,
                users.name,
                orders.quantity,
                orders.total_price,
                orders.status,
                orders.order_date
            FROM orders
            JOIN users
            ON orders.user_id = users.id
            ORDER BY orders.id DESC
        `;

        db.query(
            query,
            callback
        );

    },

    // Ambil riwayat pesanan customer
    getHistory: (
        userId,
        callback
    ) => {

        const query = `
            SELECT *
            FROM orders
            WHERE user_id = ?
            ORDER BY id DESC
        `;

        db.query(
            query,
            [userId],
            callback
        );

    }

};

module.exports = Order;
