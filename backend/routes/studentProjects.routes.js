const express = require('express');
const router = express.Router();
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
