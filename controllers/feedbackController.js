const db = require('../config/database');

exports.submitComment = (req, res) => {
    const { name, content } = req.body;

    const query = "INSERT INTO comments (name, content) VALUES (?, ?)";
    db.query(query, [name, content], (err, result) => {
        if (err) return res.status(500).json({ message: "Gagal mengirim komentar" });
        res.status(201).json({ message: "Terima kasih atas masukannya!" });
    });
};
exports.getComments = (req,res)=>{

    const query =
    "SELECT * FROM comments ORDER BY id DESC";

    db.query(
        query,
        (err,results)=>{

            if(err){

                return res.status(500).json({
                    message:"Gagal mengambil komentar"
                });

            }

            res.json(results);

        }
    );

};
exports.deleteComment = (req,res)=>{

    const { id } = req.params;

    db.query(
        "DELETE FROM comments WHERE id=?",
        [id],
        (err,result)=>{

            if(err){

                return res.status(500).json({
                    message:"Gagal menghapus komentar"
                });

            }

            res.json({
                message:"Komentar berhasil dihapus"
            });

        }
    );

};