const AppDataSource = require('../config/database');
const { generateOrderNumber } = require('../utils/helpers');

class SaleController {
  static async getAllSales(req, res, next) {
    try {
      const saleRepository = AppDataSource.getRepository('Sale');
      const sales = await saleRepository.find({
        where: { companyId: req.companyId },
        relations: ['user', 'location', 'items', 'items.product']
      });

      res.json({ success: true, data: sales });
    } catch (error) {
      next(error);
    }
  }

  static async getSalesByLocation(req, res, next) {
    try {
      const { locationId } = req.params;
      const saleRepository = AppDataSource.getRepository('Sale');
      
      const sales = await saleRepository.find({
        where: { locationId, companyId: req.companyId },
        relations: ['user', 'location', 'items', 'items.product']
      });

      res.json({ success: true, data: sales });
    } catch (error) {
      next(error);
    }
  }

  static async getSaleById(req, res, next) {
    try {
      const { id } = req.params;
      const saleRepository = AppDataSource.getRepository('Sale');
      
      const sale = await saleRepository.findOne({
        where: { id, companyId: req.companyId },
        relations: ['user', 'location', 'items', 'items.product']
      });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }

      res.json({ success: true, data: sale });
    } catch (error) {
      next(error);
    }
  }

  static async createSale(req, res, next) {
    try {
      const { items, ...saleData } = req.body;
      
      const saleRepository = AppDataSource.getRepository('Sale');
      const saleItemRepository = AppDataSource.getRepository('SaleItem');
      
      // Create sale
      const sale = saleRepository.create({
        ...saleData,
        orderNumber: generateOrderNumber(),
        userId: req.userId,
        companyId: req.companyId
      });
      
      await saleRepository.save(sale);

      // Create sale items
      for (const item of items) {
        const saleItem = saleItemRepository.create({
          ...item,
          saleId: sale.id,
          totalPrice: item.quantity * item.unitPrice
        });
        await saleItemRepository.save(saleItem);
      }

      res.status(201).json({
        success: true,
        message: 'Sale created successfully',
        data: sale
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSale(req, res, next) {
    try {
      const { id } = req.params;
      const saleRepository = AppDataSource.getRepository('Sale');
      
      await saleRepository.update({ id, companyId: req.companyId }, req.body);
      const sale = await saleRepository.findOne({ where: { id } });

      res.json({
        success: true,
        message: 'Sale updated successfully',
        data: sale
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelSale(req, res, next) {
    try {
      const { id } = req.params;
      const saleRepository = AppDataSource.getRepository('Sale');
      
      await saleRepository.update(
        { id, companyId: req.companyId },
        { status: 'cancelled' }
      );

      res.json({
        success: true,
        message: 'Sale cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async refundSale(req, res, next) {
    try {
      const { id } = req.params;
      const saleRepository = AppDataSource.getRepository('Sale');
      
      await saleRepository.update(
        { id, companyId: req.companyId },
        { status: 'refunded', paymentStatus: 'refunded' }
      );

      res.json({
        success: true,
        message: 'Sale refunded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateReceipt(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Receipt generation coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSalesStats(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Sales stats coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSalesByDateRange(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Date range sales coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTopSellingProducts(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Top products coming soon'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SaleController;
