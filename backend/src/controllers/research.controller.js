const pool = require('../../config/db');

/**
 * GET /api/v1/research
 * Returns combined publications + projects.
 * Query params: type (publication|project|all), department, year, status, indexing, search, page, limit
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
        SELECT p.id, p.title, p.authors, p.journal_name, p.publication_type,
               p.year, p.indexing, p.doi, p.abstract, p.national_international,
               p.pdf_url, p.created_at,
               f.name as faculty_name, f.department
        FROM publications p
        LEFT JOIN faculty f ON p.faculty_id = f.id
        WHERE 1=1
      `;
      const params = [];
      let idx = 1;

      if (department) { query += ` AND f.department = $${idx++}`; params.push(department); }
      if (year) { query += ` AND p.year = $${idx++}`; params.push(Number(year)); }
      if (indexing) { query += ` AND p.indexing ILIKE $${idx++}`; params.push(`%${indexing}%`); }
      if (search) {
        // Escape special ILIKE pattern characters to prevent pattern injection
        const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
        query += ` AND (p.title ILIKE $${idx} OR p.authors ILIKE $${idx} OR f.name ILIKE $${idx})`;
        params.push(`%${escapedSearch}%`);
        idx++;
      }

      query += ` ORDER BY p.year DESC, p.created_at DESC`;

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
          facultyName: pub.faculty_name || null,
          pdfUrl: pub.pdf_url || null,
          createdAt: pub.created_at,
        });
      });
    }

    // ── Fetch projects (pg Pool — "researchProject" table) ───────────────────
    if (type === 'all' || type === 'project') {
      let query = `
        SELECT id, title, department, funding_agency, sanction_date,
               amount_lakhs, principal_investigator, co_investigators,
               duration, status, created_at
        FROM "researchProject"
        WHERE 1=1
      `;
      const params = [];
      let idx = 1;

      if (department) { query += ` AND department = $${idx++}`; params.push(department); }
      if (year) { query += ` AND EXTRACT(YEAR FROM sanction_date) = $${idx++}`; params.push(Number(year)); }
      if (status) {
        query += ` AND status = $${idx++}`;
        params.push(status.toUpperCase());
      }
      if (search) {
        const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
        query += ` AND (title ILIKE $${idx} OR principal_investigator ILIKE $${idx} OR funding_agency ILIKE $${idx} OR department ILIKE $${idx})`;
        params.push(`%${escapedSearch}%`);
        idx++;
      }

      query += ` ORDER BY sanction_date DESC NULLS LAST, created_at DESC`;

      const result = await pool.query(query, params);
      result.rows.forEach((p) => {
        items.push({
          recordType: 'project',
          id: p.id,
          title: p.title,
          department: p.department || null,
          year: p.sanction_date ? new Date(p.sanction_date).getFullYear() : null,
          agency: p.funding_agency || null,
          pi: p.principal_investigator || null,
          coPi: p.co_investigators || null,
          amount: p.amount_lakhs ? Number(p.amount_lakhs) : null,
          status: p.status ? p.status.toLowerCase() : null,
          createdAt: p.created_at,
        });
      });
    }

    // ── Sort merged list by year desc ────────────────────────────────────────
    items.sort((a, b) => {
      const ya = a.year ?? 0;
      const yb = b.year ?? 0;
      return yb - ya;
    });

    const total = items.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
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
    // Publications stats (pg Pool — publications table)
    const pubResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN indexing IS NOT NULL AND indexing <> '' THEN 1 END) as indexed,
        array_agg(DISTINCT f.department) FILTER (WHERE f.department IS NOT NULL) as pub_departments
      FROM publications p
      LEFT JOIN faculty f ON p.faculty_id = f.id
    `);
    const pubRow = pubResult.rows[0];
    const pubDepts = pubRow.pub_departments ?? [];

    // Projects stats (pg Pool — "researchProject" table)
    const projResult = await pool.query(`
      SELECT
        COUNT(*)::int                                                           AS total_projects,
        COUNT(*) FILTER (WHERE status = 'ONGOING')::int                        AS active_projects,
        array_agg(DISTINCT department) FILTER (WHERE department IS NOT NULL)   AS proj_departments
      FROM "researchProject"
    `);
    const projRow = projResult.rows[0];
    const projDepts = projRow.proj_departments ?? [];

    // Union publication + project departments for accurate unique count
    const deptSet = new Set([...pubDepts, ...projDepts]);

    res.json({
      success: true,
      data: {
        totalPublications: Number(pubRow.total),
        indexedPublications: Number(pubRow.indexed),
        totalProjects: projRow.total_projects,
        activeProjects: projRow.active_projects,
        departments: deptSet.size,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResearch, getResearchStats };
