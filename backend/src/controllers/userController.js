const AppDataSource = require('../config/database');

class UserController {
  // Get all users
  static async getAllUsers(req, res, next) {
    try {
      const userRepository = AppDataSource.getRepository('User');
      const users = await userRepository.find({
        relations: ['role', 'company'],
        select: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar', 'isActive', 'emailVerified', 'lastLoginAt', 'createdAt']
      });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository('User');
      
      const user = await userRepository.findOne({
        where: { id },
        relations: ['role', 'company', 'userLocations', 'userLocations.location'],
        select: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar', 'isActive', 'emailVerified', 'lastLoginAt', 'createdAt']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Create user
  static async createUser(req, res, next) {
    try {
      const userRepository = AppDataSource.getRepository('User');
      const user = userRepository.create(req.body);
      await userRepository.save(user);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository('User');
      
      await userRepository.update(id, req.body);
      const user = await userRepository.findOne({ where: { id } });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository('User');
      
      await userRepository.delete(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Assign user to location
  static async assignUserToLocation(req, res, next) {
    try {
      const { id } = req.params;
      const { locationId } = req.body;
      
      const userLocationRepository = AppDataSource.getRepository('UserLocation');
      const userLocation = userLocationRepository.create({
        userId: id,
        locationId
      });
      
      await userLocationRepository.save(userLocation);

      res.json({
        success: true,
        message: 'User assigned to location successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove user from location
  static async removeUserFromLocation(req, res, next) {
    try {
      const { id, locationId } = req.params;
      const userLocationRepository = AppDataSource.getRepository('UserLocation');
      
      await userLocationRepository.delete({ userId: id, locationId });

      res.json({
        success: true,
        message: 'User removed from location successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user locations
  static async getUserLocations(req, res, next) {
    try {
      const { id } = req.params;
      const userLocationRepository = AppDataSource.getRepository('UserLocation');
      
      const userLocations = await userLocationRepository.find({
        where: { userId: id },
        relations: ['location']
      });

      res.json({
        success: true,
        data: userLocations
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
