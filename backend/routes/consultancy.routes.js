const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const consultancyController = require('../controllers/consultancy.controller');

// Public routes - limited access
router.get('/', consultancyController.getAllConsultancy);
router.get('/:id', consultancyController.getConsultancyById);

// Protected routes - Admin only
router.post('/', verifyToken, requireRole(['admin']), consultancyController.createConsultancy);
router.put('/:id', verifyToken, requireRole(['admin']), consultancyController.updateConsultancy);
router.delete('/:id', verifyToken, requireRole(['admin']), consultancyController.deleteConsultancy);

module.exports = router;
