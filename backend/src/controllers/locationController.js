const AppDataSource = require('../config/database');

class LocationController {
  static async getAllLocations(req, res, next) {
    try {
      const locationRepository = AppDataSource.getRepository('Location');
      const locations = await locationRepository.find({
        where: { companyId: req.companyId }
      });

      res.json({ success: true, data: locations });
    } catch (error) {
      next(error);
    }
  }

  static async getLocationById(req, res, next) {
    try {
      const { id } = req.params;
      const locationRepository = AppDataSource.getRepository('Location');
      
      const location = await locationRepository.findOne({
        where: { id, companyId: req.companyId }
      });

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Location not found'
        });
      }

      res.json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }

  static async createLocation(req, res, next) {
    try {
      const locationRepository = AppDataSource.getRepository('Location');
      const location = locationRepository.create({
        ...req.body,
        companyId: req.companyId
      });
      
      await locationRepository.save(location);

      res.status(201).json({
        success: true,
        message: 'Location created successfully',
        data: location
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateLocation(req, res, next) {
    try {
      const { id } = req.params;
      const locationRepository = AppDataSource.getRepository('Location');
      
      await locationRepository.update({ id, companyId: req.companyId }, req.body);
      const location = await locationRepository.findOne({ where: { id } });

      res.json({
        success: true,
        message: 'Location updated successfully',
        data: location
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteLocation(req, res, next) {
    try {
      const { id } = req.params;
      const locationRepository = AppDataSource.getRepository('Location');
      
      await locationRepository.delete({ id, companyId: req.companyId });

      res.json({
        success: true,
        message: 'Location deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLocationStats(req, res, next) {
    try {
      // For demo mode, return comprehensive location analytics
      const { date = 'today' } = req.query;
      
      // Generate date-specific multipliers
      let multiplier = 1;
      let dateLabel = 'Today';
      
      if (date === 'yesterday') {
        multiplier = 0.8;
        dateLabel = 'Yesterday';
      } else if (date === 'custom') {
        multiplier = 0.9;
        dateLabel = 'Custom Date';
      }

      // Real location data structure with sales analytics
      const locationAnalytics = {
        dateInfo: {
          label: dateLabel,
          type: date
        },
        totalStats: {
          totalSales: Math.round(9320000 * multiplier),
          totalOrders: Math.round(4880 * multiplier),
          totalCustomers: Math.round(3760 * multiplier),
          avgOrderValue: 1909
        },
        cities: [
          {
            id: 'mumbai',
            name: 'Mumbai',
            totalSales: Math.round(2450000 * multiplier),
            totalOrders: Math.round(1250 * multiplier),
            avgOrderValue: 1960,
            customerCount: Math.round(890 * multiplier)
          },
          {
            id: 'delhi',
            name: 'Delhi',
            totalSales: Math.round(2100000 * multiplier),
            totalOrders: Math.round(1150 * multiplier),
            avgOrderValue: 1826,
            customerCount: Math.round(920 * multiplier)
          },
          {
            id: 'bangalore',
            name: 'Bangalore',
            totalSales: Math.round(1890000 * multiplier),
            totalOrders: Math.round(980 * multiplier),
            avgOrderValue: 1928,
            customerCount: Math.round(720 * multiplier)
          },
          {
            id: 'chennai',
            name: 'Chennai',
            totalSales: Math.round(1560000 * multiplier),
            totalOrders: Math.round(820 * multiplier),
            avgOrderValue: 1902,
            customerCount: Math.round(650 * multiplier)
          },
          {
            id: 'kolkata',
            name: 'Kolkata',
            totalSales: Math.round(1450000 * multiplier),
            totalOrders: Math.round(750 * multiplier),
            avgOrderValue: 1933,
            customerCount: Math.round(620 * multiplier)
          },
          {
            id: 'hyderabad',
            name: 'Hyderabad',
            totalSales: Math.round(1380000 * multiplier),
            totalOrders: Math.round(710 * multiplier),
            avgOrderValue: 1944,
            customerCount: Math.round(590 * multiplier)
          },
          {
            id: 'pune',
            name: 'Pune',
            totalSales: Math.round(1320000 * multiplier),
            totalOrders: Math.round(680 * multiplier),
            avgOrderValue: 1941,
            customerCount: Math.round(580 * multiplier)
          },
          {
            id: 'ahmedabad',
            name: 'Ahmedabad',
            totalSales: Math.round(1250000 * multiplier),
            totalOrders: Math.round(640 * multiplier),
            avgOrderValue: 1953,
            customerCount: Math.round(550 * multiplier)
          }
        ]
      };

      res.json({
        success: true,
        data: locationAnalytics
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLocationUsers(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Location users coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignUserToLocation(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'User assignment coming soon'
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeUserFromLocation(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'User removal coming soon'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LocationController;
