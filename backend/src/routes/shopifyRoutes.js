const express = require('express');
const router = express.Router();
const ShopifyController = require('../controllers/shopifyController');
const { authenticateToken } = require('../middlewares/auth');

// All Shopify routes require authentication
router.use(authenticateToken);

// Test Shopify connection
router.get('/test', ShopifyController.testConnection);

// Get shop information
router.get('/shop', ShopifyController.getShopInfo);

// Product routes
router.get('/products', ShopifyController.getProducts);
router.get('/products/:productId', ShopifyController.getProduct);
router.post('/products/sync', ShopifyController.syncProducts);

// Order routes
router.get('/orders', ShopifyController.getOrders);

// Location routes
router.get('/locations', ShopifyController.getLocations);

// Inventory routes
router.get('/inventory', ShopifyController.getInventoryLevels);

module.exports = router;
