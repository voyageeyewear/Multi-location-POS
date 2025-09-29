const express = require('express');
const RoleController = require('../controllers/roleController');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all roles
router.get('/', RoleController.getAllRoles);

// Get role by ID
router.get('/:id', RoleController.getRoleById);

// Create new role (admin only)
router.post('/', 
  requireRole(['super_admin', 'admin']),
  validate(schemas.role.create),
  RoleController.createRole
);

// Update role (admin only)
router.put('/:id', 
  requireRole(['super_admin', 'admin']),
  validate(schemas.role.update),
  RoleController.updateRole
);

// Delete role (admin only)
router.delete('/:id', 
  requireRole(['super_admin', 'admin']),
  RoleController.deleteRole
);

// Get role permissions template
router.get('/templates/permissions', RoleController.getPermissionsTemplate);

// Get users with specific role
router.get('/:id/users', RoleController.getRoleUsers);

module.exports = router;
