const express = require('express');
const router = express.Router();
const { cleanupData } = require('../controllers/dataController');
const { authenticateToken } = require('../middlewares/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// POST /api/data/cleanup - Clean up all data except products
router.post('/cleanup', cleanupData);

module.exports = router;

