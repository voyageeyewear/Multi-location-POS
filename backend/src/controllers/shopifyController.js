const shopifyService = require('../services/shopifyService');

class ShopifyController {
  // Test Shopify connection
  static async testConnection(req, res, next) {
    try {
      const result = await shopifyService.testConnection();
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            shop: result.shop,
            connected: true
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to connect to Shopify',
          error: result.error
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Get shop information
  static async getShopInfo(req, res, next) {
    try {
      const result = await shopifyService.getShopInfo();
      
      if (result.success) {
        res.json({
          success: true,
          data: {
            shop: result.shop
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to get shop information',
          error: result.error
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Get products from Shopify
  static async getProducts(req, res, next) {
    try {
      const { limit } = req.query;
      const result = await shopifyService.getProducts(parseInt(limit) || 50);
      
      if (result.success) {
        res.json({
          success: true,
          data: {
            products: result.products,
            count: result.count
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to fetch products',
          error: result.error
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Get single product
  static async getProduct(req, res, next) {
    try {
      const { productId } = req.params;
      const result = await shopifyService.getProduct(productId);
      
      if (result.success) {
        res.json({
          success: true,
          data: {
            product: result.product
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Product not found',
          error: result.error
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Sync products from Shopify
  static async syncProducts(req, res, next) {
    try {
      const result = await shopifyService.syncProducts();
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            products: result.products,
            count: result.count
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to sync products',
          error: result.error
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Get orders from Shopify
  static async getOrders(req, res, next) {
    try {
      const { limit, status } = req.query;
      const result = await shopifyService.getOrders(
        parseInt(limit) || 50,
        status || 'any'
      );
      
      if (result.success) {
        res.json({
          success: true,
          data: {
            orders: result.orders,
            count: result.count
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to fetch orders',
          error: result.error
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Create order in Shopify
  static async createOrder(req, res, next) {
    try {
      const orderData = req.body;
      
      // Validate required fields
      if (!orderData.customerName || !orderData.items || !orderData.items.length) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: customerName and items are required'
        });
      }

      const result = await shopifyService.createOrder(orderData);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: {
            order: result.order,
            shopifyOrderId: result.order.id,
            shopifyOrderNumber: result.order.name
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to create order in Shopify',
          error: result.error,
          details: result.details
        });
      }
    } catch (error) {
      console.error('Error in createOrder controller:', error);
      next(error);
    }
  }

  // Get locations from Shopify
  static async getLocations(req, res, next) {
    try {
      const result = await shopifyService.getLocations();
      
      if (result.success) {
        res.json({
          success: true,
          data: {
            locations: result.locations
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to fetch locations',
          error: result.error
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Get inventory levels
  static async getInventoryLevels(req, res, next) {
    try {
      const { locationId } = req.query;
      const result = await shopifyService.getInventoryLevels(locationId);
      
      if (result.success) {
        res.json({
          success: true,
          data: {
            inventoryLevels: result.inventoryLevels
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to fetch inventory levels',
          error: result.error
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ShopifyController;
