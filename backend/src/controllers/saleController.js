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

  static async getInvoicesForLocations(req, res, next) {
    try {
      // For demo mode, return sample invoice data
      const sampleInvoices = [
        {
          id: 'INV-001',
          clientName: 'John Smith',
          city: 'Mumbai',
          state: 'Maharashtra',
          paymentMethod: 'Card',
          createdAt: new Date().toISOString(),
          items: [
            { title: 'Classic Aviator Sunglasses', quantity: 1, price: 2500 },
            { title: 'Modern Round Frame Glasses', quantity: 2, price: 1800 }
          ],
          subtotal: 6100,
          tax: 610,
          total: 6710
        },
        {
          id: 'INV-002',
          clientName: 'Sarah Johnson',
          city: 'Delhi',
          state: 'Delhi',
          paymentMethod: 'UPI',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          items: [
            { title: 'Stylish Wayfarer Shades', quantity: 1, price: 3200 }
          ],
          subtotal: 3200,
          tax: 320,
          total: 3520
        },
        {
          id: 'INV-003',
          clientName: 'Mike Wilson',
          city: 'Bangalore',
          state: 'Karnataka',
          paymentMethod: 'Cash',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          items: [
            { title: 'Sporty Wrap-Around Sunglasses', quantity: 1, price: 2800 },
            { title: 'Blue Light Blocking Glasses', quantity: 1, price: 1500 }
          ],
          subtotal: 4300,
          tax: 430,
          total: 4730
        },
        {
          id: 'INV-004',
          clientName: 'Emily Davis',
          city: 'Chennai',
          state: 'Tamil Nadu',
          paymentMethod: 'Card',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          items: [
            { title: 'Vintage Cat-Eye Glasses', quantity: 1, price: 2200 },
            { title: 'Minimalist Square Sunglasses', quantity: 1, price: 1900 },
            { title: 'Kids Funky Sunglasses', quantity: 1, price: 1200 }
          ],
          subtotal: 5300,
          tax: 530,
          total: 5830
        },
        {
          id: 'INV-005',
          clientName: 'David Brown',
          city: 'Kolkata',
          state: 'West Bengal',
          paymentMethod: 'UPI',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
          items: [
            { title: 'Oversized Fashion Sunglasses', quantity: 2, price: 3500 }
          ],
          subtotal: 7000,
          tax: 700,
          total: 7700
        },
        {
          id: 'INV-006',
          clientName: 'Lisa Anderson',
          city: 'Hyderabad',
          state: 'Telangana',
          paymentMethod: 'Cash',
          createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
          items: [
            { title: 'Gradient Lens Sunglasses', quantity: 1, price: 2900 },
            { title: 'Classic Aviator Sunglasses', quantity: 1, price: 2500 }
          ],
          subtotal: 5400,
          tax: 540,
          total: 5940
        }
      ];

      const totalRevenue = sampleInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

      res.json({
        success: true,
        invoices: sampleInvoices,
        totalRevenue: totalRevenue,
        totalOrders: sampleInvoices.length
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SaleController;
