const express = require('express');
const router = express.Router();
const projectRoutes = require('./project.routes');
const researchRoutes = require('./research.routes');
const journalRoutes = require('./journal.routes');
const conferenceRoutes = require('./conference.routes');
const bookchapterRoutes = require('./bookchapter.routes');
const publicationsRoutes = require('./publications.routes');
const academicProjectsRoutes = require('./academicProjects.routes');

router.use('/projects', projectRoutes);
router.use('/research', researchRoutes);
router.use('/journals', journalRoutes);
router.use('/conferences', conferenceRoutes);
router.use('/bookchapters', bookchapterRoutes);
router.use('/publications', publicationsRoutes);
router.use('/academic-projects', academicProjectsRoutes);

module.exports = router;
