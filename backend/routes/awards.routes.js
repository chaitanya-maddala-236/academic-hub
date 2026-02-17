const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const awardsController = require('../controllers/awards.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Validation rules
const createAwardValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('faculty_id').optional().isInt().withMessage('Faculty ID must be an integer'),
  body('year').optional().isInt().withMessage('Year must be an integer')
];

// Public routes - viewing awards
router.get('/', awardsController.getAllAwards);
router.get('/:id', awardsController.getAwardById);

// Protected routes - admin and faculty can create/update
router.post('/', verifyToken, requireRole(['admin', 'faculty']), createAwardValidation, awardsController.createAward);
router.put('/:id', verifyToken, requireRole(['admin', 'faculty']), awardsController.updateAward);

// Admin only routes
router.delete('/:id', verifyToken, requireRole(['admin']), awardsController.deleteAward);

module.exports = router;
