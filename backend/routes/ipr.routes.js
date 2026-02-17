const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const iprController = require('../controllers/ipr.controller');

// Public routes
router.get('/', iprController.getAllIPR);
router.get('/:id', iprController.getIPRById);

// Protected routes - Admin only
router.post('/', verifyToken, requireRole(['admin']), iprController.createIPR);
router.put('/:id', verifyToken, requireRole(['admin']), iprController.updateIPR);
router.delete('/:id', verifyToken, requireRole(['admin']), iprController.deleteIPR);

module.exports = router;
