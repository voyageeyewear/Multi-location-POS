const express = require('express');
const UserLocationController = require('../controllers/userLocationController');

const router = express.Router();

// Get all user-location assignments
router.get('/', UserLocationController.getAllAssignments);

// Create new assignment
router.post('/', UserLocationController.createAssignment);

// Update assignment
router.put('/:id', UserLocationController.updateAssignment);

// Delete assignment
router.delete('/:id', UserLocationController.deleteAssignment);

// Get assignments for a specific user
router.get('/user/:userId', UserLocationController.getUserAssignments);

// Get users assigned to a specific location
router.get('/location/:locationId', UserLocationController.getLocationUsers);

module.exports = router;

