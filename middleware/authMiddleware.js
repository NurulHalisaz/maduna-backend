const jwt = require('jsonwebtoken');

exports.isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) return res.status(403).json({ message: "Token tidak ada!" });

    jwt.verify(token, 'kunci_rahasia_maduna', (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token tidak valid" });
        
        // Cek apakah role-nya admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Akses ditolak! Khusus Admin." });
        }
        
        req.user = decoded;
        next();
    });
};
