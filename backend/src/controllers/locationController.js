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
      res.json({
        success: true,
        message: 'Location stats coming soon'
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
