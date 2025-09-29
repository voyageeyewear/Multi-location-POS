const express = require('express');
const LocationController = require('../controllers/locationController');
const { authenticateToken, requirePermission } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all locations
router.get('/', LocationController.getAllLocations);

// Get location by ID
router.get('/:id', LocationController.getLocationById);

// Create new location (admin only)
router.post('/', 
  requirePermission('locations.create'),
  validate(schemas.location.create),
  LocationController.createLocation
);

// Update location
router.put('/:id', 
  requirePermission('locations.update'),
  validate(schemas.location.update),
  LocationController.updateLocation
);

// Delete location (admin only)
router.delete('/:id', 
  requirePermission('locations.delete'),
  LocationController.deleteLocation
);

// Get location statistics
router.get('/:id/stats', LocationController.getLocationStats);

// Get comprehensive location analytics (all locations)
router.get('/analytics/overview', LocationController.getLocationStats);

// Get location users
router.get('/:id/users', LocationController.getLocationUsers);

// Assign user to location
router.post('/:id/users', 
  requirePermission('users.create'),
  LocationController.assignUserToLocation
);

// Remove user from location
router.delete('/:id/users/:userId', 
  requirePermission('users.update'),
  LocationController.removeUserFromLocation
);

module.exports = router;
