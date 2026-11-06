const db = require('../config/database');

exports.submitComment = (req, res) => {
    const { name, content } = req.body;

    if (!name || !content || name.trim() === "" || content.trim() === "") {
        return res.status(400).json({ message: "Nama dan isi komentar wajib diisi!" });
    }

    const cleanName = name.trim().slice(0, 100);
    const cleanContent = content.trim().slice(0, 1000);

    // Ubah ? menjadi $1 dan $2
    const query = "INSERT INTO comments (name, content) VALUES ($1, $2)";
    db.query(query, [cleanName, cleanContent], (err, result) => {
        if (err) {
            console.error("Gagal submit komentar:", err);
            return res.status(500).json({ message: "Gagal mengirim komentar" });
        }
        res.status(201).json({ message: "Terima kasih atas masukannya!" });
    });
};

exports.getComments = (req, res) => {
    const query = "SELECT * FROM comments ORDER BY id DESC";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Gagal mengambil komentar:", err);
            return res.status(500).json({ message: "Gagal mengambil komentar" });
        }
        // Tambahkan .rows
        res.status(200).json(results.rows);
    });
};

exports.deleteComment = (req, res) => {
    const { id } = req.params;

    // Ubah ? menjadi $1
    db.query("DELETE FROM comments WHERE id = $1", [id], (err, result) => {
        if (err) {
            console.error("Gagal menghapus komentar:", err);
            return res.status(500).json({ message: "Gagal menghapus komentar" });
        }
        res.status(200).json({ message: "Komentar berhasil dihapus" });
    });
};