const express = require('express');
const ReportController = require('../controllers/reportController');
const { authenticateToken, requirePermission } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all reports
router.get('/', ReportController.getAllReports);

// Get report by ID
router.get('/:id', ReportController.getReportById);

// Generate new report
router.post('/', 
  requirePermission('reports.create'),
  validate(schemas.report.generate),
  ReportController.generateReport
);

// Download report file
router.get('/:id/download', ReportController.downloadReport);

// Delete report
router.delete('/:id', 
  requirePermission('reports.delete'),
  ReportController.deleteReport
);

// Get report templates
router.get('/templates/list', ReportController.getReportTemplates);

// Generate dashboard data
router.get('/dashboard/overview', ReportController.getDashboardData);

// Generate sales report
router.get('/sales/summary', ReportController.getSalesReport);

// Generate inventory report
router.get('/inventory/summary', ReportController.getInventoryReport);

// Generate customer report
router.get('/customers/summary', ReportController.getCustomerReport);

// Generate financial report
router.get('/financial/summary', ReportController.getFinancialReport);

// Export data (JSON/Excel)
router.get('/export/:type/:format', ReportController.exportData);

module.exports = router;
