const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware'); // Import middleware

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const adminController = require('../controllers/adminController');
const feedbackController = require('../controllers/feedbackController');

// Jalur Publik
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post(
    "/forgot-password",
    authController.forgotPassword
);

router.post(
    "/reset-password",
    authController.resetPassword
);
router.get('/products', productController.getProducts);
router.post('/orders', orderController.createOrder);
router.get(
    '/orders/history/:userId',
    orderController.getOrderHistory
);

// Jalur Admin (Diproteksi oleh middleware isAdmin)
router.get('/admin/orders', isAdmin, adminController.getAllOrders);
router.put('/admin/orders/:id', isAdmin, adminController.updateOrderStatus);
router.get('/admin/users', isAdmin, adminController.getAllUsers);
router.put('/admin/users/:id', isAdmin, adminController.updateUser);
router.delete('/admin/users/:id', isAdmin, adminController.deleteUser);
router.put('/products/:id',isAdmin, productController.updateProduct);
router.post('/comments', feedbackController.submitComment);
router.get('/comments', feedbackController.getComments);
router.delete('/comments/:id', isAdmin, feedbackController.deleteComment);
router.post(
    "/products",
    isAdmin,
    productController.createProduct
);

router.delete(
    "/products/:id",
    isAdmin,
    productController.deleteProduct
);
router.put(
    "/admin/orders/:id/cancel",
    isAdmin,
    adminController.cancelOrder
);
module.exports = router;
