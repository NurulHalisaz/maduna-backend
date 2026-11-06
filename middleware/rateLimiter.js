/**
 * In-Memory Rate Limiter Middleware
 * Melindungi endpoint sensitif (login, register, forgot-password) dari brute-force attack
 */
const rateLimit = (options = {}) => {
    const windowMs = options.windowMs || 15 * 60 * 1000; // Default 15 menit
    const max = options.max || 10; // Default maksimal 10 request per window
    const message = options.message || "Terlalu banyak permintaan dari perangkat ini. Silakan coba lagi beberapa saat nanti.";
    const requests = new Map();

    // Pembersihan data kadaluarsa berkala tiap 5 menit
    const timer = setInterval(() => {
        const now = Date.now();
        for (const [ip, data] of requests.entries()) {
            if (now - data.startTime > windowMs) {
                requests.delete(ip);
            }
        }
    }, 5 * 60 * 1000);
    
    if (timer.unref) {
        timer.unref();
    }

    return (req, res, next) => {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ? forwarded.split(',')[0].trim() : (req.ip || req.socket.remoteAddress || 'unknown');
        const now = Date.now();
        let record = requests.get(ip);

        if (!record || (now - record.startTime > windowMs)) {
            record = { count: 1, startTime: now };
            requests.set(ip, record);
            return next();
        }

        record.count++;
        if (record.count > max) {
            return res.status(429).json({ message });
        }

        next();
    };
};

module.exports = rateLimit;

