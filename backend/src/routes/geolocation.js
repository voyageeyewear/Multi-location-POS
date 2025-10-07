const express = require('express');
const router = express.Router();
const GeolocationController = require('../controllers/geolocationController');

// Detect customer location from IP (no auth required for customer-facing feature)
router.get('/detect', GeolocationController.detectLocation);

module.exports = router;
