const express = require('express');
const router = express.Router();
const awardsController = require('../controllers/awards.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public routes - viewing awards
router.get('/', awardsController.getAllAwards);
router.get('/:id', awardsController.getAwardById);

// Protected routes - admin and faculty can create/update
router.post('/', authenticate, requireRole(['admin', 'faculty']), awardsController.createAward);
router.put('/:id', authenticate, requireRole(['admin', 'faculty']), awardsController.updateAward);

// Admin only routes
router.delete('/:id', authenticate, requireRole(['admin']), awardsController.deleteAward);
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const awardsController = require('../controllers/awards.controller');

// Public routes
router.get('/', awardsController.getAllAwards);
router.get('/:id', awardsController.getAwardById);

// Protected routes - Admin only
router.post('/', verifyToken, authorizeRole(['admin']), awardsController.createAward);
router.put('/:id', verifyToken, authorizeRole(['admin']), awardsController.updateAward);
router.delete('/:id', verifyToken, authorizeRole(['admin']), awardsController.deleteAward);

module.exports = router;
