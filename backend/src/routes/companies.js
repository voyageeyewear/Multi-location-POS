const express = require('express');
const CompanyController = require('../controllers/companyController');
const { authenticateToken, requireRole, requireCompanyAccess } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all companies (super admin only)
router.get('/', 
  requireRole(['super_admin']),
  CompanyController.getAllCompanies
);

// Get company by ID
router.get('/:id', 
  requireCompanyAccess,
  CompanyController.getCompanyById
);

// Create new company (super admin only)
router.post('/', 
  requireRole(['super_admin']),
  validate(schemas.company.create),
  CompanyController.createCompany
);

// Update company
router.put('/:id', 
  requireCompanyAccess,
  validate(schemas.company.update),
  CompanyController.updateCompany
);

// Delete company (super admin only)
router.delete('/:id', 
  requireRole(['super_admin']),
  CompanyController.deleteCompany
);

// Get company statistics
router.get('/:id/stats', 
  requireCompanyAccess,
  CompanyController.getCompanyStats
);

// Get company users
router.get('/:id/users', 
  requireCompanyAccess,
  CompanyController.getCompanyUsers
);

// Get company locations
router.get('/:id/locations', 
  requireCompanyAccess,
  CompanyController.getCompanyLocations
);

// Update company settings
router.put('/:id/settings', 
  requireRole(['super_admin', 'admin']),
  requireCompanyAccess,
  CompanyController.updateCompanySettings
);

module.exports = router;
