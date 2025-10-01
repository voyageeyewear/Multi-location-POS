const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoiceController');
const { authenticateToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const Joi = require('joi');

// Apply authentication to all routes
router.use(authenticateToken);

// Generate invoice for a sale
router.get('/:saleId', InvoiceController.generateInvoice);

// Preview invoice (HTML format)
router.get('/:saleId/preview', (req, res, next) => {
  req.query.format = 'html';
  InvoiceController.generateInvoice(req, res, next);
});

module.exports = router;
