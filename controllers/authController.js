const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const transporter = require("../config/mail");

exports.register = (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: "Gagal memproses sandi" });
        
        // Memanggil fungsi dari User Model
        User.create(name, email, hashedPassword, (err, result) => {
            if (err) return res.status(400).json({ message: "Email sudah terdaftar!" });
            res.status(201).json({ message: "Registrasi berhasil!" });
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    
    // Memanggil fungsi dari User Model
    User.findByEmail(email, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) return res.status(401).json({ message: "Password salah!" });
            
            // 1. Role disimpan di dalam Token (untuk keamanan di middleware)
            const token = jwt.sign(
                { id: user.id, role: user.role }, 
                'kunci_rahasia_maduna', 
                { expiresIn: '2h' }
            );

            // 2. Role juga dikirim ke Front-End (untuk kemudahan logika dashboard)
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

exports.forgotPassword = async (req,res)=>{

    const { email } = req.body;

    User.findByEmail(
        email,
        (err,results)=>{

            if(err){

                return res.status(500).json({
                    message:"Server Error"
                });

            }

            if(results.length===0){

                return res.status(404).json({
                    message:"Email tidak ditemukan"
                });

            }

            const token = crypto.randomBytes(32).toString("hex");
            const resetLink =
            `http://127.0.0.1:5500/frontend/reset_password.html?token=${token}`;

            const expired =
            new Date(
                Date.now()+3600000
            );

            User.saveResetToken(
                email,
                token,
                expired,
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            message: "Gagal menyimpan token"
                        });
                    }

                    transporter.sendMail(
                        {
                            from: "Maduna",
                            to: email,
                            subject: "Reset Password Maduna",
                            html: `
                            <h2>Reset Password Maduna</h2>

                            <p>Klik tombol di bawah ini untuk mengubah password Anda.</p>

                            <a href="${resetLink}"
                            style="
                            background:#1F5533;
                            color:white;
                            padding:12px 20px;
                            text-decoration:none;
                            border-radius:6px;
                            display:inline-block;
                            font-weight:bold;
                            ">
                            Reset Password
                            </a>

                            <p>Link ini berlaku selama 1 jam.</p>
                            `
                        },
                        (err) => {

                            if (err) {
                                console.log(err);

                                return res.status(500).json({
                                    message: "Gagal mengirim email"
                                });
                            }

                            res.json({
                                message: "Email reset berhasil dikirim"
                            });

                        }
                    );

                }
            );
        }

    );

};
exports.resetPassword = (req,res)=>{

    const { token,password } = req.body;

    User.findByResetToken(

        token,

        (err,results)=>{

            if(err){

                return res.status(500).json({
                    message:"Server Error"
                });

            }

            if(results.length===0){

                return res.status(400).json({
                    message:"Token tidak valid atau sudah kadaluarsa"
                });

            }

            const user = results[0];

            bcrypt.hash(

                password,

                10,

                (err,hashedPassword)=>{

                    if(err){

                        return res.status(500).json({
                            message:"Gagal mengenkripsi password"
                        });

                    }

                    User.updatePassword(

                        user.id,

                        hashedPassword,

                        (err)=>{

                            if(err){

                                return res.status(500).json({
                                    message:"Gagal mengubah password"
                                });

                            }

                            res.json({

                                message:"Password berhasil diubah"

                            });

                        }

                    );

                }

            );

        }

    );

};