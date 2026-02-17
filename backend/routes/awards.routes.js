const express = require('express');
const router = express.Router();
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
