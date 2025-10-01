const express = require('express');
const UserLocationController = require('../controllers/userLocationController');
const { authenticateToken, requirePermission } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all user-location assignments
router.get('/', UserLocationController.getAllAssignments);

// Create new assignment (admin only)
router.post('/', 
  requirePermission('users.create'),
  UserLocationController.createAssignment
);

// Update assignment (admin only)
router.put('/:id',
  requirePermission('users.update'),
  UserLocationController.updateAssignment
);

// Delete assignment (admin only)
router.delete('/:id',
  requirePermission('users.delete'),
  UserLocationController.deleteAssignment
);

// Get assignments for a specific user
router.get('/user/:userId', UserLocationController.getUserAssignments);

// Get users assigned to a specific location
router.get('/location/:locationId', UserLocationController.getLocationUsers);

module.exports = router;

