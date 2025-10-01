const AppDataSource = require('../config/database');

// In-memory storage for demo mode
let userLocationAssignments = [];
let assignmentIdCounter = 1;

class UserLocationController {
  // Get all user-location assignments
  static async getAllAssignments(req, res, next) {
    try {
      // Demo mode support
      if (!AppDataSource || !AppDataSource.isInitialized) {
        return res.json({ 
          success: true, 
          data: userLocationAssignments 
        });
      }

      // Real database mode would query UserLocation table
      const userLocationRepository = AppDataSource.getRepository('UserLocation');
      const assignments = await userLocationRepository.find({
        relations: ['user', 'location']
      });

      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  // Create new user-location assignment
  static async createAssignment(req, res, next) {
    try {
      const { userId, locationId, isActive } = req.body;

      // Demo mode support
      if (!AppDataSource || !AppDataSource.isInitialized) {
        // Check if assignment already exists
        const existingAssignment = userLocationAssignments.find(
          a => a.userId === userId && a.locationId === locationId
        );

        if (existingAssignment) {
          return res.status(400).json({
            success: false,
            message: 'This user is already assigned to this location'
          });
        }

        const newAssignment = {
          id: assignmentIdCounter++,
          userId: userId,
          locationId: locationId,
          isActive: isActive !== undefined ? isActive : true,
          assignedBy: req.userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        userLocationAssignments.push(newAssignment);

        console.log(`Assigned user ${userId} to location ${locationId}`);

        return res.status(201).json({
          success: true,
          message: 'User assigned to location successfully',
          data: newAssignment
        });
      }

      // Real database mode
      const userLocationRepository = AppDataSource.getRepository('UserLocation');
      
      // Check for existing assignment
      const existing = await userLocationRepository.findOne({
        where: { userId, locationId }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'This user is already assigned to this location'
        });
      }

      const assignment = userLocationRepository.create({
        userId,
        locationId,
        isActive: isActive !== undefined ? isActive : true,
        assignedBy: req.userId
      });

      await userLocationRepository.save(assignment);

      res.status(201).json({
        success: true,
        message: 'User assigned to location successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user-location assignment
  static async updateAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      // Demo mode support
      if (!AppDataSource || !AppDataSource.isInitialized) {
        const assignmentIndex = userLocationAssignments.findIndex(a => a.id == id);
        
        if (assignmentIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Assignment not found'
          });
        }

        userLocationAssignments[assignmentIndex] = {
          ...userLocationAssignments[assignmentIndex],
          isActive: isActive !== undefined ? isActive : userLocationAssignments[assignmentIndex].isActive,
          updatedAt: new Date().toISOString()
        };

        return res.json({
          success: true,
          message: 'Assignment updated successfully',
          data: userLocationAssignments[assignmentIndex]
        });
      }

      // Real database mode
      const userLocationRepository = AppDataSource.getRepository('UserLocation');
      
      await userLocationRepository.update({ id }, { isActive });
      const assignment = await userLocationRepository.findOne({ where: { id } });

      res.json({
        success: true,
        message: 'Assignment updated successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user-location assignment
  static async deleteAssignment(req, res, next) {
    try {
      const { id } = req.params;

      // Demo mode support
      if (!AppDataSource || !AppDataSource.isInitialized) {
        const assignmentIndex = userLocationAssignments.findIndex(a => a.id == id);
        
        if (assignmentIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Assignment not found'
          });
        }

        userLocationAssignments.splice(assignmentIndex, 1);

        return res.json({
          success: true,
          message: 'Assignment deleted successfully'
        });
      }

      // Real database mode
      const userLocationRepository = AppDataSource.getRepository('UserLocation');
      await userLocationRepository.delete({ id });

      res.json({
        success: true,
        message: 'Assignment deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get assignments for a specific user
  static async getUserAssignments(req, res, next) {
    try {
      const { userId } = req.params;

      // Demo mode support
      if (!AppDataSource || !AppDataSource.isInitialized) {
        const userAssignments = userLocationAssignments.filter(
          a => a.userId === userId && a.isActive
        );

        return res.json({
          success: true,
          data: userAssignments
        });
      }

      // Real database mode
      const userLocationRepository = AppDataSource.getRepository('UserLocation');
      const assignments = await userLocationRepository.find({
        where: { userId, isActive: true },
        relations: ['location']
      });

      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  // Get users assigned to a specific location
  static async getLocationUsers(req, res, next) {
    try {
      const { locationId } = req.params;

      // Demo mode support
      if (!AppDataSource || !AppDataSource.isInitialized) {
        const locationAssignments = userLocationAssignments.filter(
          a => a.locationId == locationId && a.isActive
        );

        return res.json({
          success: true,
          data: locationAssignments
        });
      }

      // Real database mode
      const userLocationRepository = AppDataSource.getRepository('UserLocation');
      const assignments = await userLocationRepository.find({
        where: { locationId, isActive: true },
        relations: ['user']
      });

      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  // Clear all assignments (used during cleanup)
  static clearAllAssignments() {
    userLocationAssignments = [];
    assignmentIdCounter = 1;
    console.log('All user-location assignments cleared');
  }
}

module.exports = UserLocationController;

