const prisma = require('../src/lib/prisma');
const { extractYear } = require('../src/lib/dateUtils');

/**
 * Map a raw journal row to the standard publication shape.
 */
const mapJournal = (j) => ({
  id: `journal-${j.S_No}`,
  title: j.Title_of_the_paper || null,
  authors: j.Name_of_authors || null,
  journal_name: j.Name_of_the_Journal || null,
  publication_type: 'journal',
  year: extractYear(j.Date_of_Publication),
  indexing: j.Indexing || null,
  national_international: j.National_International || null,
  doi: j.DOI_of_paper || null,
  faculty_name: j.Faculty_name || null,
  publisher: j.Name_of_the_publisher || null,
  department: null,
});

/**
 * Map a raw conference row to the standard publication shape.
 */
const mapConference = (c) => ({
  id: `conference-${c.S_No}`,
  title: c.Title_of_the_paper || null,
  authors: c.Name_of_authors || null,
  journal_name: c.Name_of_the_Conference || null,
  publication_type: 'conference',
  year: extractYear(c.Date_of_Publication),
  indexing: c.Indexing || null,
  national_international: c.National_International || null,
  doi: c.DOI_of_paper || null,
  faculty_name: c.Faculty_name || null,
  publisher: c.Name_of_the_publisher || null,
  vol_issue_pg: c.Vol_Issue_Pg_ISBN || null,
  department: null,
});

/**
 * Map a raw bookchapter row to the standard publication shape.
 */
const mapBookchapter = (b) => ({
  id: `bookchapter-${b.S_No}`,
  title: b.Title_of_the_paper || null,
  authors: b.Name_of_authors || null,
  journal_name: b.Name_of_the_Journal_Conference || null,
  publication_type: 'bookchapter',
  year: extractYear(b.Date_of_Publication),
  indexing: b.Indexing || null,
  national_international: b.National_International || null,
  doi: b.DOI_of_paper || null,
  faculty_name: b.Faculty_name || null,
  publisher: b.Name_of_the_publisher || null,
  vol_issue_pg: b.Vol_Issue_Pg_ISBN || null,
  department: null,
});

// Get all publications with filters and pagination
const getAllPublications = async (req, res, next) => {
  try {
    const {
      year,
      publication_type,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const searchWhere = search
      ? {
          OR: [
            { Title_of_the_paper: { contains: search, mode: 'insensitive' } },
            { Name_of_authors: { contains: search, mode: 'insensitive' } },
            { Faculty_name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const items = [];

    if (!publication_type || publication_type === 'journal') {
      const rows = await prisma.journal.findMany({ where: searchWhere });
      rows.forEach((r) => items.push(mapJournal(r)));
    }
    if (!publication_type || publication_type === 'conference') {
      const rows = await prisma.conference.findMany({ where: searchWhere });
      rows.forEach((r) => items.push(mapConference(r)));
    }
    if (!publication_type || publication_type === 'bookchapter') {
      const rows = await prisma.bookchapter.findMany({ where: searchWhere });
      rows.forEach((r) => items.push(mapBookchapter(r)));
    }

    // Filter by year if specified
    const filtered = year
      ? items.filter((i) => i.year === parseInt(year))
      : items;

    // Sort by year desc
    filtered.sort((a, b) => (b.year || 0) - (a.year || 0));

    const total = filtered.length;
    const offset = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get single publication by encoded ID (e.g. "journal-5", "conference-3", "bookchapter-2")
const getPublicationById = async (req, res, next) => {
  try {
    const rawId = req.params.id;

    // Parse type-prefixed ID
    const match = rawId.match(/^(journal|conference|bookchapter)-(\d+)$/);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid publication ID' });
    }

    const [, type, numStr] = match;
    const num = parseInt(numStr);

    let pub = null;
    if (type === 'journal') {
      const row = await prisma.journal.findUnique({ where: { S_No: num } });
      if (row) pub = mapJournal(row);
    } else if (type === 'conference') {
      const row = await prisma.conference.findUnique({ where: { S_No: num } });
      if (row) pub = mapConference(row);
    } else {
      const row = await prisma.bookchapter.findUnique({ where: { S_No: num } });
      if (row) pub = mapBookchapter(row);
    }

    if (!pub) {
      return res.status(404).json({ success: false, message: 'Publication not found' });
    }

    res.json({ success: true, data: pub });
  } catch (error) {
    next(error);
  }
};

// Create publication — not supported with the new data model
const createPublication = async (req, res, next) => {
  return res.status(503).json({ success: false, message: 'Direct publication creation is not supported' });
};

// Update publication — not supported with the new data model
const updatePublication = async (req, res, next) => {
  return res.status(503).json({ success: false, message: 'Direct publication update is not supported' });
};

// Delete publication — not supported with the new data model
const deletePublication = async (req, res, next) => {
  return res.status(503).json({ success: false, message: 'Direct publication deletion is not supported' });
};

module.exports = {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication
};
