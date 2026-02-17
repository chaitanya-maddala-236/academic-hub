const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const studentProjectsController = require('../controllers/studentProjects.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Validation rules
const createStudentProjectValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('faculty_id').optional().isInt().withMessage('Faculty ID must be an integer'),
  body('project_type').optional().isIn(['UG', 'PG', 'PhD']).withMessage('Project type must be UG, PG, or PhD')
];

// Public routes - viewing student projects
router.get('/', studentProjectsController.getAllStudentProjects);
router.get('/:id', studentProjectsController.getStudentProjectById);

// Protected routes - faculty and admin can create/update
router.post('/', verifyToken, requireRole(['admin', 'faculty']), createStudentProjectValidation, studentProjectsController.createStudentProject);
router.put('/:id', verifyToken, requireRole(['admin', 'faculty']), studentProjectsController.updateStudentProject);

// Admin only routes
router.delete('/:id', verifyToken, requireRole(['admin']), studentProjectsController.deleteStudentProject);

module.exports = router;
