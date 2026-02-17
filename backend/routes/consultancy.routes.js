const express = require('express');
const router = express.Router();
const consultancyController = require('../controllers/consultancy.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public routes - viewing consultancy (may be restricted in production)
router.get('/', consultancyController.getAllConsultancy);
router.get('/:id', consultancyController.getConsultancyById);

// Protected routes - admin and faculty can create/update
router.post('/', authenticate, requireRole(['admin', 'faculty']), consultancyController.createConsultancy);
router.put('/:id', authenticate, requireRole(['admin', 'faculty']), consultancyController.updateConsultancy);

// Admin only routes
router.delete('/:id', authenticate, requireRole(['admin']), consultancyController.deleteConsultancy);
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const consultancyController = require('../controllers/consultancy.controller');

// Public routes - limited access
router.get('/', consultancyController.getAllConsultancy);
router.get('/:id', consultancyController.getConsultancyById);

// Protected routes - Admin only
router.post('/', verifyToken, authorizeRole(['admin']), consultancyController.createConsultancy);
router.put('/:id', verifyToken, authorizeRole(['admin']), consultancyController.updateConsultancy);
router.delete('/:id', verifyToken, authorizeRole(['admin']), consultancyController.deleteConsultancy);

module.exports = router;
