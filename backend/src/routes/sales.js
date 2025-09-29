const express = require('express');
const SaleController = require('../controllers/saleController');
const { authenticateToken, requirePermission, requireLocationAccess } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all sales
router.get('/', SaleController.getAllSales);

// Get sales by location
router.get('/location/:locationId', 
  requireLocationAccess,
  SaleController.getSalesByLocation
);

// Get sale by ID
router.get('/:id', SaleController.getSaleById);

// Create new sale
router.post('/', 
  requirePermission('sales.create'),
  validate(schemas.sale.create),
  SaleController.createSale
);

// Update sale
router.put('/:id', 
  requirePermission('sales.update'),
  validate(schemas.sale.update),
  SaleController.updateSale
);

// Cancel sale
router.put('/:id/cancel', 
  requirePermission('sales.update'),
  SaleController.cancelSale
);

// Refund sale
router.put('/:id/refund', 
  requirePermission('sales.update'),
  SaleController.refundSale
);

// Generate receipt/invoice
router.get('/:id/receipt', SaleController.generateReceipt);

// Get sales statistics
router.get('/stats/overview', SaleController.getSalesStats);

// Get sales by date range
router.get('/stats/date-range', SaleController.getSalesByDateRange);

// Get top selling products
router.get('/stats/top-products', SaleController.getTopSellingProducts);

// Get sales summary by location
router.get('/stats/by-location', SaleController.getSalesByLocation);

module.exports = router;
