const AppDataSource = require('../config/database');
const LocationController = require('./locationController');
const UserLocationController = require('./userLocationController');

/**
 * Clean up all data except products
 * This will delete: sales, orders, locations, users (except admin), backups
 * Products will be preserved
 */
const cleanupData = async (req, res, next) => {
  try {
    // Check if database is initialized (not in demo mode)
    if (!AppDataSource || !AppDataSource.isInitialized) {
      // For demo mode, clear in-memory data
      console.log('Cleanup requested in demo mode - clearing in-memory data');
      
      // Clear demo locations
      LocationController.clearDemoLocations();
      
      // Clear user-location assignments
      UserLocationController.clearAllAssignments();
      
      return res.status(200).json({
        success: true,
        message: 'Data cleanup successful (demo mode)',
        data: {
          deletedSales: 0,
          deletedLocations: 'All',
          deletedUsers: 0,
          deletedBackups: 0,
          deletedAssignments: 'All'
        }
      });
    }

    // Import models
    const Sale = require('../models/Sale');
    const SaleItem = require('../models/SaleItem');
    const Location = require('../models/Location');
    const User = require('../models/User');
    const Backup = require('../models/Backup');
    const ProductLocation = require('../models/ProductLocation');
    const UserLocation = require('../models/UserLocation');

    // Start a transaction to ensure all or nothing
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      
      // 1. Delete all sale items first (foreign key constraint)
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(SaleItem)
        .execute();
      
      // 2. Delete all sales
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(Sale)
        .execute();

      // 3. Delete product-location relationships
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(ProductLocation)
        .execute();

      // 4. Delete user-location relationships
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(UserLocation)
        .execute();

      // 5. Delete all locations
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(Location)
        .execute();

      // 6. Delete all users except admin
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('roleId != :adminRoleId', { adminRoleId: 1 }) // Assuming role ID 1 is admin
        .execute();

      // 7. Delete all backups
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(Backup)
        .execute();
    });

    res.status(200).json({
      success: true,
      message: 'All data cleaned up successfully! Products have been preserved.',
      data: {
        deletedSales: 'All',
        deletedLocations: 'All',
        deletedUsers: 'All (except admin)',
        deletedBackups: 'All'
      }
    });
  } catch (error) {
    console.error('Error cleaning up data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cleanup data'
    });
  }
};

module.exports = {
  cleanupData
};

