const express = require('express');
const router = express.Router();
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
