const AppDataSource = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

// In-memory storage for demo mode
let demoBackups = [];
let backupIdCounter = 1;

class BackupController {
  static async getAllBackups(req, res, next) {
    try {
      // Demo mode - return in-memory backups
      if (!AppDataSource.isInitialized) {
        return res.json({ 
          success: true, 
          data: demoBackups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        });
      }

      const backupRepository = AppDataSource.getRepository('Backup');
      const backups = await backupRepository.find({
        where: { companyId: req.companyId },
        order: { createdAt: 'DESC' },
        relations: ['user']
      });

      res.json({ success: true, data: backups });
    } catch (error) {
      next(error);
    }
  }

  static async getBackupById(req, res, next) {
    try {
      const { id } = req.params;
      
      // Demo mode
      if (!AppDataSource.isInitialized) {
        const backup = demoBackups.find(b => b.id === id);
        if (!backup) {
          return res.status(404).json({
            success: false,
            message: 'Backup not found'
          });
        }
        return res.json({ success: true, data: backup });
      }

      const backupRepository = AppDataSource.getRepository('Backup');
      
      const backup = await backupRepository.findOne({
        where: { id, companyId: req.companyId },
        relations: ['user']
      });

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: 'Backup not found'
        });
      }

      res.json({ success: true, data: backup });
    } catch (error) {
      next(error);
    }
  }

  static async createBackup(req, res, next) {
    try {
      const { name, type, format, description } = req.body;
      
      // Demo mode - create in-memory backup
      if (!AppDataSource.isInitialized) {
        const backup = {
          id: `backup-${backupIdCounter++}`,
          name: name || `Backup_${new Date().toISOString().split('T')[0]}`,
          type: type || 'full',
          format: format || 'json',
          description: description || '',
          status: 'processing',
          filePath: null,
          fileSize: null,
          createdBy: req.userId || 'demo-user',
          companyId: req.companyId || 'demo-company',
          createdAt: new Date().toISOString(),
          completedAt: null,
          metadata: {
            tables: [],
            recordCount: 0,
            startTime: new Date().toISOString()
          }
        };
        
        demoBackups.push(backup);
        
        // Simulate backup processing
        setTimeout(() => {
          const backupToUpdate = demoBackups.find(b => b.id === backup.id);
          if (backupToUpdate) {
            backupToUpdate.status = 'completed';
            backupToUpdate.filePath = `backup_${backup.id}_${Date.now()}.${format}`;
            backupToUpdate.fileSize = Math.floor(Math.random() * 5000000) + 1000000; // 1-5MB
            backupToUpdate.completedAt = new Date().toISOString();
            backupToUpdate.metadata = {
              ...backupToUpdate.metadata,
              endTime: new Date().toISOString(),
              recordCount: Math.floor(Math.random() * 10000) + 1000,
              tables: ['products', 'locations', 'sales', 'users']
            };
          }
        }, 2000);
        
        return res.status(201).json({
          success: true,
          message: 'Backup created and processing',
          data: backup
        });
      }

      const backupRepository = AppDataSource.getRepository('Backup');
      
      // Create backup record
      const backup = backupRepository.create({
        name: name || `Backup_${new Date().toISOString().split('T')[0]}`,
        type: type || 'full',
        format: format || 'json',
        description,
        status: 'processing',
        createdBy: req.userId,
        companyId: req.companyId,
        metadata: {
          tables: [],
          recordCount: 0,
          startTime: new Date().toISOString()
        }
      });
      
      await backupRepository.save(backup);

      // Simulate backup process (in real app, this would be an async job)
      setTimeout(async () => {
        try {
          // Get all data for backup
          const data = await BackupController.generateBackupData(req.companyId);
          
          // Create backups directory if it doesn't exist
          const backupsDir = path.join(__dirname, '../../../backups');
          try {
            await fs.access(backupsDir);
          } catch {
            await fs.mkdir(backupsDir, { recursive: true });
          }

          // Generate file name and path
          const fileName = `backup_${backup.id}_${Date.now()}.${format}`;
          const filePath = path.join(backupsDir, fileName);
          
          // Save backup file
          if (format === 'json') {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
          } else if (format === 'csv') {
            // Simple CSV conversion (in real app, use a proper CSV library)
            const csv = BackupController.convertToCSV(data);
            await fs.writeFile(filePath, csv);
          }

          // Get file size
          const stats = await fs.stat(filePath);
          
          // Update backup record
          await backupRepository.update(backup.id, {
            status: 'completed',
            filePath: fileName,
            fileSize: stats.size,
            completedAt: new Date(),
            metadata: {
              ...backup.metadata,
              endTime: new Date().toISOString(),
              recordCount: BackupController.countRecords(data)
            }
          });
        } catch (error) {
          console.error('Backup process failed:', error);
          await backupRepository.update(backup.id, {
            status: 'failed',
            metadata: {
              ...backup.metadata,
              error: error.message
            }
          });
        }
      }, 2000);

      res.status(201).json({
        success: true,
        message: 'Backup created and processing',
        data: backup
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBackup(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      // Demo mode
      if (!AppDataSource.isInitialized) {
        const backup = demoBackups.find(b => b.id === id);
        if (!backup) {
          return res.status(404).json({
            success: false,
            message: 'Backup not found'
          });
        }
        
        if (name) backup.name = name;
        if (description !== undefined) backup.description = description;
        
        return res.json({
          success: true,
          message: 'Backup updated successfully',
          data: backup
        });
      }

      const backupRepository = AppDataSource.getRepository('Backup');
      
      const backup = await backupRepository.findOne({
        where: { id, companyId: req.companyId }
      });

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: 'Backup not found'
        });
      }

      await backupRepository.update(id, { name, description });
      const updatedBackup = await backupRepository.findOne({ where: { id } });

      res.json({
        success: true,
        message: 'Backup updated successfully',
        data: updatedBackup
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBackup(req, res, next) {
    try {
      const { id } = req.params;
      
      // Demo mode
      if (!AppDataSource.isInitialized) {
        const backupIndex = demoBackups.findIndex(b => b.id === id);
        if (backupIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Backup not found'
          });
        }
        
        demoBackups.splice(backupIndex, 1);
        
        return res.json({
          success: true,
          message: 'Backup deleted successfully'
        });
      }

      const backupRepository = AppDataSource.getRepository('Backup');
      
      const backup = await backupRepository.findOne({
        where: { id, companyId: req.companyId }
      });

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: 'Backup not found'
        });
      }

      // Delete backup file if exists
      if (backup.filePath) {
        const filePath = path.join(__dirname, '../../../backups', backup.filePath);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Error deleting backup file:', error);
        }
      }

      await backupRepository.delete(id);

      res.json({
        success: true,
        message: 'Backup deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadBackup(req, res, next) {
    try {
      const { id } = req.params;
      
      // Demo mode - generate demo backup data
      if (!AppDataSource.isInitialized) {
        const backup = demoBackups.find(b => b.id === id);
        
        if (!backup) {
          return res.status(404).json({
            success: false,
            message: 'Backup not found'
          });
        }

        if (backup.status !== 'completed' || !backup.filePath) {
          return res.status(400).json({
            success: false,
            message: 'Backup is not ready for download'
          });
        }

        // Generate demo backup data with real statistics
        const demoData = {
          metadata: {
            backupId: backup.id,
            backupName: backup.name,
            backupDate: backup.createdAt,
            backupType: backup.type,
            format: backup.format,
            totalRecords: backup.metadata?.recordCount || 0,
            tables: backup.metadata?.tables || []
          },
          summary: {
            totalSales: 9320000,
            totalOrders: 4880,
            totalCustomers: 3760,
            totalProducts: 250,
            totalLocations: 8,
            avgOrderValue: 1909,
            backupSize: `${(backup.fileSize / 1024).toFixed(2)} KB`
          },
          locations: [
            {
              id: 'mumbai',
              name: 'Mumbai',
              address: '123 Main Street, Andheri, Mumbai',
              phone: '+91 98765 43210',
              totalSales: 2450000,
              totalOrders: 1250,
              avgOrderValue: 1960,
              customerCount: 890,
              productsInStock: 45,
              lowStockProducts: 5
            },
            {
              id: 'delhi',
              name: 'Delhi',
              address: '456 Mall Road, Connaught Place, Delhi',
              phone: '+91 98765 43211',
              totalSales: 2100000,
              totalOrders: 1150,
              avgOrderValue: 1826,
              customerCount: 920,
              productsInStock: 42,
              lowStockProducts: 3
            },
            {
              id: 'bangalore',
              name: 'Bangalore',
              address: '789 Tech Park, Whitefield, Bangalore',
              phone: '+91 98765 43212',
              totalSales: 1890000,
              totalOrders: 980,
              avgOrderValue: 1928,
              customerCount: 720,
              productsInStock: 38,
              lowStockProducts: 4
            },
            {
              id: 'chennai',
              name: 'Chennai',
              address: '321 Beach Road, T Nagar, Chennai',
              phone: '+91 98765 43213',
              totalSales: 1560000,
              totalOrders: 820,
              avgOrderValue: 1902,
              customerCount: 650,
              productsInStock: 35,
              lowStockProducts: 2
            },
            {
              id: 'kolkata',
              name: 'Kolkata',
              address: '654 Park Street, Kolkata',
              phone: '+91 98765 43214',
              totalSales: 1450000,
              totalOrders: 750,
              avgOrderValue: 1933,
              customerCount: 620,
              productsInStock: 40,
              lowStockProducts: 6
            }
          ],
          products: [
            {
              id: 'prod-1',
              name: 'Premium Sunglasses - Aviator',
              sku: 'SUN-AVI-001',
              price: 2999,
              category: 'Sunglasses',
              totalSold: 450,
              revenue: 1349550,
              stockRemaining: 25,
              status: 'In Stock',
              locations: ['Mumbai', 'Delhi', 'Bangalore']
            },
            {
              id: 'prod-2',
              name: 'Reading Glasses - Classic',
              sku: 'READ-CLS-001',
              price: 1499,
              category: 'Reading Glasses',
              totalSold: 380,
              revenue: 569620,
              stockRemaining: 30,
              status: 'In Stock',
              locations: ['Mumbai', 'Chennai', 'Kolkata']
            },
            {
              id: 'prod-3',
              name: 'Sports Sunglasses - Wraparound',
              sku: 'SUN-WRP-001',
              price: 3499,
              category: 'Sports Glasses',
              totalSold: 290,
              revenue: 1014710,
              stockRemaining: 15,
              status: 'Low Stock',
              locations: ['Bangalore', 'Delhi']
            },
            {
              id: 'prod-4',
              name: 'Blue Light Glasses - Modern',
              sku: 'BLU-MOD-001',
              price: 1999,
              category: 'Blue Light',
              totalSold: 520,
              revenue: 1039480,
              stockRemaining: 40,
              status: 'In Stock',
              locations: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai']
            },
            {
              id: 'prod-5',
              name: 'Prescription Glasses - Round Frame',
              sku: 'PRE-RND-001',
              price: 4999,
              category: 'Prescription',
              totalSold: 180,
              revenue: 899820,
              stockRemaining: 8,
              status: 'Low Stock',
              locations: ['Mumbai', 'Delhi']
            }
          ],
          sales: [
            {
              invoiceNumber: 'INV-2025-0001',
              date: '2025-01-01',
              customerName: 'Rajesh Kumar',
              location: 'Mumbai',
              products: [
                { name: 'Premium Sunglasses - Aviator', quantity: 2, price: 2999, total: 5998 }
              ],
              subtotal: 5998,
              tax: 1079.64,
              total: 7077.64,
              paymentMethod: 'Card',
              status: 'Completed'
            },
            {
              invoiceNumber: 'INV-2025-0002',
              date: '2025-01-01',
              customerName: 'Priya Sharma',
              location: 'Delhi',
              products: [
                { name: 'Blue Light Glasses - Modern', quantity: 1, price: 1999, total: 1999 },
                { name: 'Reading Glasses - Classic', quantity: 1, price: 1499, total: 1499 }
              ],
              subtotal: 3498,
              tax: 629.64,
              total: 4127.64,
              paymentMethod: 'UPI',
              status: 'Completed'
            },
            {
              invoiceNumber: 'INV-2025-0003',
              date: '2025-01-02',
              customerName: 'Amit Patel',
              location: 'Bangalore',
              products: [
                { name: 'Sports Sunglasses - Wraparound', quantity: 1, price: 3499, total: 3499 }
              ],
              subtotal: 3499,
              tax: 629.82,
              total: 4128.82,
              paymentMethod: 'Cash',
              status: 'Completed'
            }
          ],
          inventory: {
            totalProducts: 250,
            inStock: 235,
            lowStock: 15,
            outOfStock: 0,
            totalValue: 1847500,
            byCategory: {
              'Sunglasses': { count: 80, value: 239920, stockLevel: 'Good' },
              'Reading Glasses': { count: 65, value: 97435, stockLevel: 'Good' },
              'Blue Light': { count: 55, value: 109945, stockLevel: 'Good' },
              'Prescription': { count: 30, value: 149970, stockLevel: 'Low' },
              'Sports Glasses': { count: 20, value: 69980, stockLevel: 'Low' }
            }
          },
          analytics: {
            topSellingProducts: [
              { name: 'Blue Light Glasses - Modern', unitsSold: 520, revenue: 1039480 },
              { name: 'Premium Sunglasses - Aviator', unitsSold: 450, revenue: 1349550 },
              { name: 'Reading Glasses - Classic', unitsSold: 380, revenue: 569620 }
            ],
            topPerformingLocations: [
              { name: 'Mumbai', sales: 2450000, orders: 1250 },
              { name: 'Delhi', sales: 2100000, orders: 1150 },
              { name: 'Bangalore', sales: 1890000, orders: 980 }
            ],
            salesByPaymentMethod: {
              'Cash': { orders: 1950, amount: 3728000 },
              'Card': { orders: 1850, amount: 3535000 },
              'UPI': { orders: 1080, amount: 2057000 }
            },
            monthlyTrend: [
              { month: 'Jan 2025', sales: 9320000, orders: 4880, growth: '+12%' }
            ]
          },
          users: [
            {
              id: 'user-1',
              name: 'Admin User',
              email: 'admin@possystem.com',
              role: 'Admin',
              locations: ['All'],
              status: 'Active',
              lastLogin: new Date().toISOString()
            },
            {
              id: 'user-2',
              name: 'Client User',
              email: 'client@possystem.com',
              role: 'Client',
              locations: ['Mumbai'],
              status: 'Active',
              lastLogin: new Date().toISOString()
            }
          ]
        };

        let content;
        if (backup.format === 'json') {
          content = JSON.stringify(demoData, null, 2);
        } else if (backup.format === 'csv') {
          // Generate comprehensive CSV
          content = '=== BACKUP SUMMARY ===\n';
          content += `Backup Date,${demoData.metadata.backupDate}\n`;
          content += `Total Sales,₹${demoData.summary.totalSales}\n`;
          content += `Total Orders,${demoData.summary.totalOrders}\n`;
          content += `Total Products,${demoData.summary.totalProducts}\n`;
          content += `Total Locations,${demoData.summary.totalLocations}\n\n`;
          
          content += '=== LOCATIONS ===\n';
          content += 'ID,Name,Address,Phone,Total Sales,Total Orders,Avg Order Value,Customers,Stock,Low Stock\n';
          demoData.locations.forEach(loc => {
            content += `${loc.id},${loc.name},"${loc.address}",${loc.phone},${loc.totalSales},${loc.totalOrders},${loc.avgOrderValue},${loc.customerCount},${loc.productsInStock},${loc.lowStockProducts}\n`;
          });
          
          content += '\n=== PRODUCTS ===\n';
          content += 'ID,Name,SKU,Price,Category,Units Sold,Revenue,Stock Remaining,Status\n';
          demoData.products.forEach(prod => {
            content += `${prod.id},${prod.name},${prod.sku},${prod.price},${prod.category},${prod.totalSold},${prod.revenue},${prod.stockRemaining},${prod.status}\n`;
          });
          
          content += '\n=== RECENT SALES ===\n';
          content += 'Invoice,Date,Customer,Location,Subtotal,Tax,Total,Payment,Status\n';
          demoData.sales.forEach(sale => {
            content += `${sale.invoiceNumber},${sale.date},${sale.customerName},${sale.location},${sale.subtotal},${sale.tax},${sale.total},${sale.paymentMethod},${sale.status}\n`;
          });
          
          content += '\n=== INVENTORY SUMMARY ===\n';
          content += `Total Products,${demoData.inventory.totalProducts}\n`;
          content += `In Stock,${demoData.inventory.inStock}\n`;
          content += `Low Stock,${demoData.inventory.lowStock}\n`;
          content += `Out of Stock,${demoData.inventory.outOfStock}\n`;
          content += `Total Value,₹${demoData.inventory.totalValue}\n`;
        } else {
          content = JSON.stringify(demoData, null, 2);
        }
        
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${backup.filePath}`);
        return res.send(content);
      }

      const backupRepository = AppDataSource.getRepository('Backup');
      
      const backup = await backupRepository.findOne({
        where: { id, companyId: req.companyId }
      });

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: 'Backup not found'
        });
      }

      if (backup.status !== 'completed' || !backup.filePath) {
        return res.status(400).json({
          success: false,
          message: 'Backup is not ready for download'
        });
      }

      const filePath = path.join(__dirname, '../../../backups', backup.filePath);
      
      res.download(filePath, backup.filePath, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          res.status(500).json({
            success: false,
            message: 'Error downloading backup file'
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper methods
  static async generateBackupData(companyId) {
    const productRepo = AppDataSource.getRepository('Product');
    const locationRepo = AppDataSource.getRepository('Location');
    const saleRepo = AppDataSource.getRepository('Sale');
    const userRepo = AppDataSource.getRepository('User');

    const [products, locations, sales, users] = await Promise.all([
      productRepo.find({ where: { companyId } }),
      locationRepo.find({ where: { companyId } }),
      saleRepo.find({ where: { companyId }, relations: ['items'] }),
      userRepo.find({ where: { companyId }, select: ['id', 'firstName', 'lastName', 'email', 'phone', 'isActive'] })
    ]);

    return {
      metadata: {
        companyId,
        backupDate: new Date().toISOString(),
        version: '1.0'
      },
      products,
      locations,
      sales,
      users
    };
  }

  static countRecords(data) {
    return (data.products?.length || 0) + 
           (data.locations?.length || 0) + 
           (data.sales?.length || 0) + 
           (data.users?.length || 0);
  }

  static convertToCSV(data) {
    // Simple CSV conversion (this is a basic implementation)
    let csv = 'Type,ID,Name,Details\n';
    
    if (data.products) {
      data.products.forEach(p => {
        csv += `Product,${p.id},${p.name},${p.sku}\n`;
      });
    }
    
    if (data.locations) {
      data.locations.forEach(l => {
        csv += `Location,${l.id},${l.name},${l.city}\n`;
      });
    }
    
    return csv;
  }
}

module.exports = BackupController;

