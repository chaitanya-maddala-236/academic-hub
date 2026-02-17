const express = require('express');
const router = express.Router();
const studentProjectsController = require('../controllers/studentProjects.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public routes - viewing student projects
router.get('/', studentProjectsController.getAllStudentProjects);
router.get('/:id', studentProjectsController.getStudentProjectById);

// Protected routes - faculty and admin can create/update
router.post('/', authenticate, requireRole(['admin', 'faculty']), studentProjectsController.createStudentProject);
router.put('/:id', authenticate, requireRole(['admin', 'faculty']), studentProjectsController.updateStudentProject);

// Admin only routes
router.delete('/:id', authenticate, requireRole(['admin']), studentProjectsController.deleteStudentProject);
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const studentProjectsController = require('../controllers/studentProjects.controller');

// Public routes
router.get('/', studentProjectsController.getAllStudentProjects);
router.get('/:id', studentProjectsController.getStudentProjectById);

// Protected routes - Faculty and Admin can create/update
router.post('/', verifyToken, authorizeRole(['admin', 'faculty']), studentProjectsController.createStudentProject);
router.put('/:id', verifyToken, authorizeRole(['admin', 'faculty']), studentProjectsController.updateStudentProject);
router.delete('/:id', verifyToken, authorizeRole(['admin']), studentProjectsController.deleteStudentProject);

module.exports = router;
