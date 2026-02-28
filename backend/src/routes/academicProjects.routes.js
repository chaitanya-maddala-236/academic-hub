const express = require('express');
const router = express.Router();
const {
  getProjects,
  getStats,
  getProjectByBatch,
  getStudentByRollNo,
  getGuide,
} = require('../controllers/academicProjects.controller');

router.get('/', getProjects);
router.get('/stats', getStats);
router.get('/batch/:batchId', getProjectByBatch);
router.get('/student/:rollNo', getStudentByRollNo);
router.get('/guide/:guideName', getGuide);

module.exports = router;
