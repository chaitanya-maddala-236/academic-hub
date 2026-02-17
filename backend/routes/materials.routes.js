const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const materialsController = require('../controllers/materials.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter.middleware');

// Validation rules
const createMaterialValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('faculty_id').optional().isInt().withMessage('Faculty ID must be an integer')
];

// Public routes - students and public can view
router.get('/', materialsController.getAllMaterials);
router.get('/:id', materialsController.getMaterialById);

// Protected routes - faculty and admin can create (with upload rate limiting)
router.post('/', verifyToken, requireRole(['admin', 'faculty']), uploadLimiter, materialsController.upload, createMaterialValidation, materialsController.createMaterial);

// Admin and faculty can delete (faculty can delete own materials)
router.delete('/:id', verifyToken, requireRole(['admin', 'faculty']), materialsController.deleteMaterial);

module.exports = router;
