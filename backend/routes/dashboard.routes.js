const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const dashboardController = require('../controllers/dashboard.controller');

// Protected routes - Admin and specific roles can view dashboard
router.get('/stats', verifyToken, requireRole(['admin']), dashboardController.getDashboardStats);
router.get('/publications-per-year', verifyToken, requireRole(['admin']), dashboardController.getPublicationsPerYear);
router.get('/patent-growth', verifyToken, requireRole(['admin']), dashboardController.getPatentGrowth);
router.get('/consultancy-revenue', verifyToken, requireRole(['admin']), dashboardController.getConsultancyRevenue);
router.get('/department-comparison', verifyToken, requireRole(['admin']), dashboardController.getDepartmentComparison);

module.exports = router;
