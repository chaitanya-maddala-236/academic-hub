const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const teachingMaterialsController = require('../controllers/teachingMaterials.controller');

// Protected routes - Students and Faculty can view
router.get('/', verifyToken, teachingMaterialsController.getAllTeachingMaterials);
router.get('/:id', verifyToken, teachingMaterialsController.getTeachingMaterialById);

// Faculty can create/update their own materials
router.post('/', verifyToken, requireRole(['admin', 'faculty']), teachingMaterialsController.createTeachingMaterial);
router.put('/:id', verifyToken, requireRole(['admin', 'faculty']), teachingMaterialsController.updateTeachingMaterial);
router.delete('/:id', verifyToken, requireRole(['admin', 'faculty']), teachingMaterialsController.deleteTeachingMaterial);

module.exports = router;
