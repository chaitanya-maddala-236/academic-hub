const prisma = require('../lib/prisma');
const { extractYear } = require('../lib/dateUtils');

/**
 * GET /api/v1/research
 * Returns combined publications (journal, conference, bookchapter) and
 * researchProject records.
 * Query params: type (all|publication|journal|conference|bookchapter|project),
 *               search, page, limit
 */
const getResearch = async (req, res, next) => {
  try {
    const {
      type = 'all',
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const items = [];

    const pubSearchWhere = search
      ? {
          OR: [
            { Title_of_the_paper: { contains: search, mode: 'insensitive' } },
            { Name_of_authors: { contains: search, mode: 'insensitive' } },
            { Faculty_name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const includePublications = type === 'all' || type === 'publication';
    const includeProjects = type === 'all' || type === 'project';

    if (includePublications || type === 'journal') {
      const journals = await prisma.journal.findMany({ where: pubSearchWhere });
      journals.forEach((j) =>
        items.push({
          recordType: 'publication',
          id: `journal-${j.S_No}`,
          title: j.Title_of_the_paper || null,
          year: extractYear(j.Date_of_Publication),
          authors: j.Name_of_authors || null,
          journal: j.Name_of_the_Journal || null,
          publicationType: 'journal',
          indexing: j.Indexing ? [j.Indexing] : [],
          doi: j.DOI_of_paper || null,
          scope: j.National_International || null,
          facultyName: j.Faculty_name || null,
        })
      );
    }

    if (includePublications || type === 'conference') {
      const conferences = await prisma.conference.findMany({ where: pubSearchWhere });
      conferences.forEach((c) =>
        items.push({
          recordType: 'publication',
          id: `conference-${c.S_No}`,
          title: c.Title_of_the_paper || null,
          year: extractYear(c.Date_of_Publication),
          authors: c.Name_of_authors || null,
          journal: c.Name_of_the_Conference || null,
          publicationType: 'conference',
          indexing: c.Indexing ? [c.Indexing] : [],
          doi: c.DOI_of_paper || null,
          scope: c.National_International || null,
          facultyName: c.Faculty_name || null,
        })
      );
    }

    if (includePublications || type === 'bookchapter') {
      const bookchapters = await prisma.bookchapter.findMany({ where: pubSearchWhere });
      bookchapters.forEach((b) =>
        items.push({
          recordType: 'publication',
          id: `bookchapter-${b.S_No}`,
          title: b.Title_of_the_paper || null,
          year: extractYear(b.Date_of_Publication),
          authors: b.Name_of_authors || null,
          journal: b.Name_of_the_Journal_Conference || null,
          publicationType: 'bookchapter',
          indexing: b.Indexing ? [b.Indexing] : [],
          doi: b.DOI_of_paper || null,
          scope: b.National_International || null,
          facultyName: b.Faculty_name || null,
        })
      );
    }

    if (includeProjects) {
      try {
        const projSearchWhere = search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { principalInvestigator: { contains: search, mode: 'insensitive' } },
                { fundingAgency: { contains: search, mode: 'insensitive' } },
                { department: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {};

        const projects = await prisma.researchProject.findMany({ where: projSearchWhere });
        projects.forEach((p) =>
          items.push({
            recordType: 'project',
            id: p.id,
            title: p.title || null,
            year: p.startDate ? p.startDate.getFullYear() : null,
            department: p.department || null,
            agency: p.fundingAgency || null,
            pi: p.principalInvestigator || null,
            coPi: p.coPrincipalInvestigator || null,
            amount: p.sanctionedAmount ?? null,
            status: p.status ? p.status.toLowerCase() : null,
            startDate: p.startDate ? p.startDate.toISOString() : null,
            createdAt: p.createdAt ? p.createdAt.toISOString() : null,
          })
        );
      } catch (projectErr) {
        console.warn('[research] Failed to load research projects:', projectErr);
      }
    }

    // Sort by year desc
    items.sort((a, b) => {
      const ya = a.year ?? 0;
      const yb = b.year ?? 0;
      return yb - ya;
    });

    const total = items.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(1000, Math.max(1, Number(limit)));
    const paginated = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      data: paginated,
      meta: { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/research/stats
 * Returns aggregate counts across journal, conference, bookchapter and
 * researchProject tables.
 */
const getResearchStats = async (req, res, next) => {
  try {
    const [jCount, cCount, bCount] = await Promise.all([
      prisma.journal.count(),
      prisma.conference.count(),
      prisma.bookchapter.count(),
    ]);

    let totalProjects = 0;
    let activeProjects = 0;
    try {
      [totalProjects, activeProjects] = await Promise.all([
        prisma.researchProject.count(),
        prisma.researchProject.count({
          where: { status: { equals: 'ONGOING', mode: 'insensitive' } },
        }),
      ]);
    } catch (projErr) {
      console.warn('[research] Failed to count research projects:', projErr);
    }

    res.json({
      success: true,
      data: {
        totalPublications: jCount + cCount + bCount,
        indexedPublications: 0,
        totalProjects,
        activeProjects,
        departments: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResearch, getResearchStats };
