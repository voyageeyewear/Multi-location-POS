const AppDataSource = require('../config/database');

// In-memory storage for demo mode
let demoLocations = [];
let locationIdCounter = 1;

class LocationController {
  static async getAllLocations(req, res, next) {
    try {
      // Check if database is initialized (not in demo mode)
      if (!AppDataSource || !AppDataSource.isInitialized) {
        // Return demo locations from memory
        return res.json({ success: true, data: demoLocations });
      }

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
      // Remove id from request body if present (should be auto-generated)
      const { id, ...locationData } = req.body;
      
      // Demo mode support
      if (!AppDataSource || !AppDataSource.isInitialized) {
        const newLocation = {
          id: locationIdCounter++,
          ...locationData,
          companyId: req.companyId,
          isActive: locationData.isActive !== undefined ? locationData.isActive : true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        demoLocations.push(newLocation);
        
        // Auto-create client user account for this location
        const clientUser = {
          id: `loc-user-${newLocation.id}`,
          firstName: locationData.name || 'Location',
          lastName: 'Manager',
          email: locationData.email || `location${newLocation.id}@possystem.com`,
          phone: locationData.phone || '',
          role: 'client',
          locationId: newLocation.id,
          locationName: newLocation.name,
          locationCity: newLocation.city,
          locationGST: newLocation.gstNumber,
          password: `loc${newLocation.id}@2025`, // Default password
          isActive: true,
          createdAt: new Date().toISOString(),
          accessLevel: 'location' // Location-specific access
        };
        
        console.log(`Auto-created client account for location: ${newLocation.name} (${clientUser.email})`);
        
        return res.status(201).json({
          success: true,
          message: 'Location and client account created successfully',
          data: {
            location: newLocation,
            clientAccount: {
              email: clientUser.email,
              password: clientUser.password,
              role: clientUser.role
            }
          }
        });
      }

      const locationRepository = AppDataSource.getRepository('Location');
      const location = locationRepository.create({
        ...locationData,
        companyId: req.companyId
      });
      
      await locationRepository.save(location);

      // Auto-create client user for real database mode (would need User model)
      // This is placeholder for when database is connected
      console.log(`Location created: ${location.name} - Client account would be auto-created in DB mode`);

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
      
      // Demo mode support
      if (!AppDataSource || !AppDataSource.isInitialized) {
        const locationIndex = demoLocations.findIndex(loc => loc.id == id);
        if (locationIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Location not found'
          });
        }
        
        demoLocations[locationIndex] = {
          ...demoLocations[locationIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        return res.json({
          success: true,
          message: 'Location updated successfully',
          data: demoLocations[locationIndex]
        });
      }

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
      
      // Demo mode support
      if (!AppDataSource || !AppDataSource.isInitialized) {
        const locationIndex = demoLocations.findIndex(loc => loc.id == id);
        if (locationIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Location not found'
          });
        }
        
        demoLocations.splice(locationIndex, 1);
        
        return res.json({
          success: true,
          message: 'Location deleted successfully'
        });
      }

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

  // Method to clear demo locations (used during cleanup)
  static clearDemoLocations() {
    demoLocations = [];
    locationIdCounter = 1;
    console.log('Demo locations cleared');
  }
}

module.exports = LocationController;
