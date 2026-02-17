const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const studentProjectsController = require('../controllers/studentProjects.controller');

// Public routes
router.get('/', studentProjectsController.getAllStudentProjects);
router.get('/:id', studentProjectsController.getStudentProjectById);

// Protected routes - Faculty and Admin can create/update
router.post('/', verifyToken, requireRole(['admin', 'faculty']), studentProjectsController.createStudentProject);
router.put('/:id', verifyToken, requireRole(['admin', 'faculty']), studentProjectsController.updateStudentProject);
router.delete('/:id', verifyToken, requireRole(['admin']), studentProjectsController.deleteStudentProject);

module.exports = router;
