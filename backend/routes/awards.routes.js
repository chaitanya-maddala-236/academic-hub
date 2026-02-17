const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const awardsController = require('../controllers/awards.controller');

// Public routes
router.get('/', awardsController.getAllAwards);
router.get('/:id', awardsController.getAwardById);

// Protected routes - Admin only
router.post('/', verifyToken, requireRole(['admin']), awardsController.createAward);
router.put('/:id', verifyToken, requireRole(['admin']), awardsController.updateAward);
router.delete('/:id', verifyToken, requireRole(['admin']), awardsController.deleteAward);

module.exports = router;
