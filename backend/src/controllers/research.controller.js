const pool = require('../../config/db');

/**
 * GET /api/v1/research
 * Returns combined publications + projects.
 * Query params: type (publication|project|all), department, year, status, indexing, search, page, limit
 *
 * NOTE: The `publications` table does NOT have a separate `faculty` table.
 * It stores department, authors, and faculty_id directly.
 */
const getResearch = async (req, res, next) => {
  try {
    const {
      type = 'all',
      department,
      year,
      status,
      indexing,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const items = [];

    // ── Fetch publications (pg Pool) ─────────────────────────────────────────
    if (type === 'all' || type === 'publication') {
      let query = `
        SELECT id, title, authors, journal_name, publication_type,
               year, indexing, doi, abstract, national_international,
               pdf_url, created_at, department
        FROM publications
        WHERE 1=1
      `;
      const params = [];
      let idx = 1;

      if (department) { query += ` AND department ILIKE $${idx++}`; params.push(`%${department}%`); }
      if (year) { query += ` AND year = $${idx++}`; params.push(Number(year)); }
      if (indexing) { query += ` AND indexing ILIKE $${idx++}`; params.push(`%${indexing}%`); }
      if (search) {
        const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
        query += ` AND (title ILIKE $${idx} OR authors ILIKE $${idx})`;
        params.push(`%${escapedSearch}%`);
        idx++;
      }

      query += ` ORDER BY year DESC NULLS LAST, created_at DESC`;

      const result = await pool.query(query, params);
      result.rows.forEach((pub) => {
        items.push({
          recordType: 'publication',
          id: pub.id,
          title: pub.title,
          department: pub.department || null,
          year: pub.year,
          authors: pub.authors || null,
          journal: pub.journal_name || null,
          publicationType: pub.publication_type || null,
          indexing: pub.indexing ? [pub.indexing] : [],
          doi: pub.doi || null,
          abstract: pub.abstract || null,
          scope: pub.national_international || null,
          facultyName: null,
          pdfUrl: pub.pdf_url || null,
          createdAt: pub.created_at,
        });
      });
    }

    // Projects were previously from "researchProject" table which has been removed.
    // Projects are now managed via /api/v1/projects (Prisma).

    // ── Sort merged list by year desc ────────────────────────────────────────
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
 * Returns aggregate counts across publications + projects.
 */
const getResearchStats = async (req, res, next) => {
  try {
    // Publications stats — publications table only (no faculty join needed)
    const pubResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN indexing IS NOT NULL AND indexing <> '' THEN 1 END) as indexed,
        array_agg(DISTINCT department) FILTER (WHERE department IS NOT NULL AND department <> '') as pub_departments
      FROM publications
    `);
    const pubRow = pubResult.rows[0];
    const pubDepts = pubRow.pub_departments ?? [];

    // "researchProject" table has been removed; projects are managed via /api/v1/projects
    const deptSet = new Set(pubDepts);

    res.json({
      success: true,
      data: {
        totalPublications: Number(pubRow.total),
        indexedPublications: Number(pubRow.indexed),
        totalProjects: 0,
        activeProjects: 0,
        departments: deptSet.size,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResearch, getResearchStats };
