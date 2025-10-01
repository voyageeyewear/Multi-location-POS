const express = require('express');
const BackupController = require('../controllers/backupController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all backups
router.get('/', BackupController.getAllBackups);

// Get backup by ID
router.get('/:id', BackupController.getBackupById);

// Download backup file (must come before /:id to avoid conflict)
router.get('/:id/download', BackupController.downloadBackup);

// Create new backup
router.post('/', BackupController.createBackup);

// Update backup metadata
router.put('/:id', BackupController.updateBackup);

// Delete backup
router.delete('/:id', BackupController.deleteBackup);

module.exports = router;

