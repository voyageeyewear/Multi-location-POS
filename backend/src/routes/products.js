const express = require('express');
const ProductController = require('../controllers/productController');
const { authenticateToken, requirePermission, requireLocationAccess } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all products
router.get('/', ProductController.getAllProducts);

// Get product by ID
router.get('/:id', ProductController.getProductById);

// Search products
router.get('/search/:query', ProductController.searchProducts);

// Create new product (admin/manager only)
router.post('/', 
  requirePermission('products.create'),
  validate(schemas.product.create),
  ProductController.createProduct
);

// Update product
router.put('/:id', 
  requirePermission('products.update'),
  validate(schemas.product.update),
  ProductController.updateProduct
);

// Delete product (admin only)
router.delete('/:id', 
  requirePermission('products.delete'),
  ProductController.deleteProduct
);

// Update product inventory
router.put('/:id/inventory', 
  requirePermission('products.update'),
  requireLocationAccess,
  ProductController.updateInventory
);

// Get product inventory across locations
router.get('/:id/inventory', ProductController.getProductInventory);

// Bulk update products
router.put('/bulk/update', 
  requirePermission('products.update'),
  ProductController.bulkUpdateProducts
);

// Import products from CSV/Excel
router.post('/import', 
  requirePermission('products.create'),
  ProductController.importProducts
);

// Export products to CSV/Excel
router.get('/export/:format', 
  requirePermission('products.read'),
  ProductController.exportProducts
);

module.exports = router;
