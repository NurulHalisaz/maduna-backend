const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memvalidasi token JWT (Customer & Admin)
 */
exports.isAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ message: "Sesi tidak ditemukan atau belum login!" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'maduna_latimojong_secret_2026', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Sesi tidak valid atau telah kadaluarsa!" });
        }
        
        req.user = decoded;
        next();
    });
};

/**
 * Middleware untuk memvalidasi role khusus Admin
 */
exports.isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ message: "Token autentikasi tidak ditemukan!" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'maduna_latimojong_secret_2026', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token tidak valid atau telah kadaluarsa!" });
        }
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Akses ditolak! Khusus Admin." });
        }
        
        req.user = decoded;
        next();
    });
};
