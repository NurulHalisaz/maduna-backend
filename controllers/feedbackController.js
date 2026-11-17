const db = require('../config/database');

exports.submitComment = (req, res) => {
    const { name, content } = req.body;

    // PERBAIKAN 1: Ganti ? menjadi $1, $2
    const query = "INSERT INTO comments (name, content) VALUES ($1, $2)";
    db.query(query, [name, content], (err, result) => {
        if (err) return res.status(500).json({ message: "Gagal mengirim komentar" });
        res.status(201).json({ message: "Terima kasih atas masukannya!" });
    });
};

exports.getComments = (req, res) => {
    const query = "SELECT * FROM comments ORDER BY id DESC";

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil komentar"
            });
        }
        // PERBAIKAN 2: Tambahkan .rows agar data bisa dibaca oleh frontend
        res.json(results.rows);
    });
};

exports.deleteComment = (req, res) => {
    const { id } = req.params;

    // PERBAIKAN 3: Ganti ? menjadi $1
    db.query("DELETE FROM comments WHERE id = $1", [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal menghapus komentar"
            });
        }
        res.json({
            message: "Komentar berhasil dihapus"
        });
    });
};
