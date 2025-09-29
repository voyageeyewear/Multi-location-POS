const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

// Public routes
router.post('/register', validate(schemas.user.register), AuthController.register);
router.post('/login', validate(schemas.user.login), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

router.get('/profile', AuthController.getProfile);
router.put('/change-password', validate(schemas.user.changePassword), AuthController.changePassword);
router.post('/logout', AuthController.logout);

module.exports = router;
