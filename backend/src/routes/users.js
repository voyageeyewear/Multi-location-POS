const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken, requireRole, requirePermission } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users (admin only)
router.get('/', 
  requireRole(['super_admin', 'admin']),
  UserController.getAllUsers
);

// Get user by ID
router.get('/:id', UserController.getUserById);

// Create new user (admin only)
router.post('/', 
  requireRole(['super_admin', 'admin']),
  validate(schemas.user.register),
  UserController.createUser
);

// Update user
router.put('/:id', 
  validate(schemas.user.update),
  UserController.updateUser
);

// Delete user (admin only)
router.delete('/:id', 
  requireRole(['super_admin', 'admin']),
  UserController.deleteUser
);

// Assign user to location
router.post('/:id/locations', 
  requireRole(['super_admin', 'admin']),
  UserController.assignUserToLocation
);

// Remove user from location
router.delete('/:id/locations/:locationId', 
  requireRole(['super_admin', 'admin']),
  UserController.removeUserFromLocation
);

// Get user's assigned locations
router.get('/:id/locations', UserController.getUserLocations);

module.exports = router;
