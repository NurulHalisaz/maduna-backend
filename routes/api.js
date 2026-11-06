const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimiter');

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const adminController = require('../controllers/adminController');
const feedbackController = require('../controllers/feedbackController');

// Rate limiters untuk endpoint sensitif
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: "Terlalu banyak pendaftaran akun dari perangkat ini." });
const forgotLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: "Terlalu banyak permintaan reset password. Coba lagi nanti." });

// ========================
// JALUR PUBLIK
// ========================
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', forgotLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/products', productController.getProducts);
router.get('/comments', feedbackController.getComments);
router.post('/comments', feedbackController.submitComment);

// ========================
// JALUR TERAUTENTIKASI (CUSTOMER & ADMIN)
// ========================
router.get('/profile', isAuth, authController.getProfile);
router.post('/orders', isAuth, orderController.createOrder);
router.get('/orders/history/:userId', isAuth, orderController.getOrderHistory);

// ========================
// JALUR KHUSUS ADMIN
// ========================
router.get('/admin/orders', isAdmin, adminController.getAllOrders);
router.put('/admin/orders/:id', isAdmin, adminController.updateOrderStatus);
router.put('/admin/orders/:id/cancel', isAdmin, adminController.cancelOrder);

router.get('/admin/users', isAdmin, adminController.getAllUsers);
router.put('/admin/users/:id', isAdmin, adminController.updateUser);
router.delete('/admin/users/:id', isAdmin, adminController.deleteUser);

router.post('/products', isAdmin, productController.createProduct);
router.put('/products/:id', isAdmin, productController.updateProduct);
router.delete('/products/:id', isAdmin, productController.deleteProduct);

router.delete('/comments/:id', isAdmin, feedbackController.deleteComment);

module.exports = router;
