const prisma = require('../lib/prisma');

/**
 * Helper: extract year from a date string.
 * Date_of_Publication is stored as DDMMYYYY (e.g. "01012023") or similar formats.
 */
const extractYear = (dateStr) => {
  if (!dateStr) return null;
  const cleaned = dateStr.replace(/[^0-9]/g, '');
  if (cleaned.length >= 8) return parseInt(cleaned.slice(-4));
  if (/^\d{4}/.test(dateStr)) return parseInt(dateStr.slice(0, 4));
  return null;
};

/**
 * GET /api/v1/research
 * Returns combined publications from journal, conference, and bookchapter tables.
 * Query params: type (all|journal|conference|bookchapter), search, page, limit
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

    const searchWhere = search
      ? {
          OR: [
            { Title_of_the_paper: { contains: search, mode: 'insensitive' } },
            { Name_of_authors: { contains: search, mode: 'insensitive' } },
            { Faculty_name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    if (type === 'all' || type === 'publication' || type === 'journal') {
      const journals = await prisma.journal.findMany({ where: searchWhere });
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

    if (type === 'all' || type === 'publication' || type === 'conference') {
      const conferences = await prisma.conference.findMany({ where: searchWhere });
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

    if (type === 'all' || type === 'publication' || type === 'bookchapter') {
      const bookchapters = await prisma.bookchapter.findMany({ where: searchWhere });
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

    // Sort by year desc
    items.sort((a, b) => {
      const ya = a.year ?? 0;
      const yb = b.year ?? 0;
      return yb - ya;
    });

    const total = items.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(200, Math.max(1, Number(limit)));
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
 * Returns aggregate counts across journal, conference, bookchapter tables.
 */
const getResearchStats = async (req, res, next) => {
  try {
    const [jCount, cCount, bCount] = await Promise.all([
      prisma.journal.count(),
      prisma.conference.count(),
      prisma.bookchapter.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalPublications: jCount + cCount + bCount,
        indexedPublications: 0,
        totalProjects: 0,
        activeProjects: 0,
        departments: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResearch, getResearchStats };
