const AppDataSource = require('../config/database');

class ProductController {
  // Get all products
  static async getAllProducts(req, res, next) {
    try {
      const productRepository = AppDataSource.getRepository('Product');
      const products = await productRepository.find({
        where: { companyId: req.companyId }
      });

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  // Get product by ID
  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const productRepository = AppDataSource.getRepository('Product');
      
      const product = await productRepository.findOne({
        where: { id, companyId: req.companyId }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // Search products
  static async searchProducts(req, res, next) {
    try {
      const { query } = req.params;
      const productRepository = AppDataSource.getRepository('Product');
      
      const products = await productRepository
        .createQueryBuilder('product')
        .where('product.companyId = :companyId', { companyId: req.companyId })
        .andWhere('(product.name ILIKE :query OR product.sku ILIKE :query)', { query: `%${query}%` })
        .getMany();

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  // Create product
  static async createProduct(req, res, next) {
    try {
      const productRepository = AppDataSource.getRepository('Product');
      const product = productRepository.create({
        ...req.body,
        companyId: req.companyId
      });
      
      await productRepository.save(product);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // Update product
  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productRepository = AppDataSource.getRepository('Product');
      
      await productRepository.update({ id, companyId: req.companyId }, req.body);
      const product = await productRepository.findOne({ where: { id } });

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete product
  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productRepository = AppDataSource.getRepository('Product');
      
      await productRepository.delete({ id, companyId: req.companyId });

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Update inventory
  static async updateInventory(req, res, next) {
    try {
      const { id } = req.params;
      const { locationId, stock } = req.body;
      
      const productLocationRepository = AppDataSource.getRepository('ProductLocation');
      
      await productLocationRepository.update(
        { productId: id, locationId },
        { stock }
      );

      res.json({
        success: true,
        message: 'Inventory updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get product inventory
  static async getProductInventory(req, res, next) {
    try {
      const { id } = req.params;
      const productLocationRepository = AppDataSource.getRepository('ProductLocation');
      
      const inventory = await productLocationRepository.find({
        where: { productId: id },
        relations: ['location']
      });

      res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk update products
  static async bulkUpdateProducts(req, res, next) {
    try {
      // Placeholder for bulk update functionality
      res.json({
        success: true,
        message: 'Bulk update functionality coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  // Import products
  static async importProducts(req, res, next) {
    try {
      // Placeholder for import functionality
      res.json({
        success: true,
        message: 'Import functionality coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  // Export products
  static async exportProducts(req, res, next) {
    try {
      // Placeholder for export functionality
      res.json({
        success: true,
        message: 'Export functionality coming soon'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
