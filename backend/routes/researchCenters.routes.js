const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const researchCentersController = require('../controllers/researchCenters.controller');

// Public routes
router.get('/', researchCentersController.getAllResearchCenters);
router.get('/:id', researchCentersController.getResearchCenterById);

// Protected routes - Admin only
router.post('/', verifyToken, requireRole(['admin']), researchCentersController.createResearchCenter);
router.put('/:id', verifyToken, requireRole(['admin']), researchCentersController.updateResearchCenter);
router.delete('/:id', verifyToken, requireRole(['admin']), researchCentersController.deleteResearchCenter);

module.exports = router;
