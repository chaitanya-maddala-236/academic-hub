const express = require('express');
const router = express.Router();
const consultancyController = require('../controllers/consultancy.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public routes - viewing consultancy
router.get('/metrics', consultancyController.getMetrics);
router.get('/', consultancyController.getAllConsultancy);
router.get('/:id', consultancyController.getConsultancyById);

// Protected routes - admin and faculty can create/update
router.post('/', verifyToken, requireRole('admin', 'faculty'), consultancyController.createConsultancy);
router.put('/:id', verifyToken, requireRole('admin', 'faculty'), consultancyController.updateConsultancy);

// Admin only routes
router.delete('/:id', verifyToken, requireRole('admin'), consultancyController.deleteConsultancy);

module.exports = router;
