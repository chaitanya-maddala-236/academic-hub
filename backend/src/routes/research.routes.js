const express = require('express');
const router = express.Router();
const { getResearch, getResearchStats, getResearchById } = require('../controllers/research.controller');

router.get('/stats', getResearchStats);
router.get('/', getResearch);
router.get('/:id', getResearchById);

module.exports = router;
