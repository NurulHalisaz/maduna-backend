const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const transporter = require("../config/mail");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.getProfile = (req, res) => {
    const userId = req.user.id;
    User.findById(userId, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }
        const user = results[0];
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    });
};

exports.register = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Semua kolom wajib diisi!" });
    }

    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: "Format email tidak valid!" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password minimal 8 karakter!" });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: "Gagal memproses sandi" });
        
        User.create(name.trim(), email.trim().toLowerCase(), hashedPassword, (err, result) => {
            if (err) {
                // Penanganan error duplikat khusus PostgreSQL (23505)
                if (err.code === '23505') {
                    return res.status(400).json({ message: "Email sudah terdaftar!" });
                }
                return res.status(500).json({ message: "Gagal mendaftarkan akun ke database" });
            }
            res.status(201).json({ message: "Registrasi berhasil! Silakan login." });
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password wajib diisi!" });
    }

    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: "Format email tidak valid!" });
    }
    
    User.findByEmail(email.trim().toLowerCase(), (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Terjadi kesalahan saat memeriksa akun" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Akun dengan email ini tidak ditemukan" });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: "Gagal memverifikasi password" });
            }
            if (!isMatch) {
                return res.status(401).json({ message: "Password salah!" });
            }
            
            // Simpan role, id, name, & email di dalam JWT Token
            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email, role: user.role }, 
                process.env.JWT_SECRET || 'maduna_latimojong_secret_2026', 
                { expiresIn: '2h' }
            );

            // Data user yang aman (tanpa password & reset_token)
            res.status(200).json({
                message: "Login berhasil",
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({ message: "Masukkan alamat email yang valid!" });
    }

    User.findByEmail(email.trim().toLowerCase(), (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Kesalahan server" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Email tidak terdaftar dalam sistem" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const clientBaseUrl = process.env.CLIENT_BASE_URL || "http://127.0.0.1:5500";
        const resetLink = `${clientBaseUrl}/front-end/frontend/reset_password.html?token=${token}`;
        const expired = new Date(Date.now() + 3600000); // 1 jam

        User.saveResetToken(email.trim().toLowerCase(), token, expired, (err) => {
            if (err) {
                return res.status(500).json({ message: "Gagal menyimpan token reset password" });
            }

            transporter.sendMail(
                {
                    from: `"Maduna Official" <${process.env.MAIL_USER || 'no-reply@maduna.com'}>`,
                    to: email.trim().toLowerCase(),
                    subject: "Reset Password Akun Maduna",
                    html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">
                        <h2 style="color: #1F5533; text-align: center;">Reset Password Maduna</h2>
                        <p>Halo,</p>
                        <p>Kami menerima permintaan untuk mengatur ulang password akun Maduna Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}"
                            style="background:#1F5533; color:#FFFFFF; padding:12px 25px; text-decoration:none; border-radius:25px; display:inline-block; font-weight:bold; box-shadow: 0 4px 10px rgba(31,85,51,0.2);">
                            Reset Password Sekarang
                            </a>
                        </div>
                        <p style="font-size: 13px; color: #718096;">Link ini hanya berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini.</p>
                        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
                        <p style="font-size: 12px; color: #A0AEC0; text-align: center;">&copy; 2026 Maduna - Madu Hutan Asli Pegunungan Latimojong</p>
                    </div>
                    `
                },
                (err) => {
                    if (err) {
                        console.error("Mail error:", err);
                        return res.status(500).json({
                            message: "Gagal mengirim email reset password. Pastikan konfigurasi email aktif."
                        });
                    }
                    res.json({ message: "Email instruksi reset password berhasil dikirim! Silakan periksa kotak masuk/spam Anda." });
                }
            );
        });
    });
};

exports.resetPassword = (req, res) => {
    const { token, password } = req.body;

    if (!token) return res.status(400).json({ message: "Token reset password tidak ditemukan" });
    if (!password || password.length < 8) return res.status(400).json({ message: "Password baru minimal 8 karakter!" });

    User.findByResetToken(token, (err, results) => {
        if (err) return res.status(500).json({ message: "Kesalahan server saat memverifikasi token" });
        if (results.length === 0) return res.status(400).json({ message: "Token reset tidak valid atau sudah kadaluarsa" });

        const user = results[0];

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: "Gagal memproses password baru" });

            User.updatePassword(user.id, hashedPassword, (err) => {
                if (err) return res.status(500).json({ message: "Gagal memperbarui password di database" });
                res.json({ message: "Password berhasil diperbarui! Silakan login dengan password baru Anda." });
            });
        });
    });
};