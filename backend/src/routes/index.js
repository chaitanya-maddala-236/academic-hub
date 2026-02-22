const express = require('express');
const router = express.Router();
const projectRoutes = require('./project.routes');

router.use('/projects', projectRoutes);

module.exports = router;
