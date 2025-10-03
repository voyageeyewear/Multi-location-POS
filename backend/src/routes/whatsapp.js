const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Send invoice via WhatsApp
router.post('/send-invoice', whatsappController.sendInvoice);

// Send custom WhatsApp message
router.post('/send-message', whatsappController.sendMessage);

module.exports = router;

