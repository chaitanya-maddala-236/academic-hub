const pool = require('../config/db');
const prisma = require('../src/lib/prisma');

// Helper: count publications from journal + conference + bookchapter tables
const countPublications = async () => {
  try {
    const [jCount, cCount, bCount] = await Promise.all([
      prisma.journal.count(),
      prisma.conference.count(),
      prisma.bookchapter.count(),
    ]);
    return jCount + cCount + bCount;
  } catch (_) {
    return 0;
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    let totalProjects = 0;
    let totalFunding = 0;
    let iprRows = [];
    let iprGrowthRows = [];
    let departmentStatsRows = [];

    // Total projects (funded_projects table may or may not exist)
    try {
      const projectsResult = await pool.query('SELECT COUNT(*) as total FROM funded_projects');
      totalProjects = parseInt(projectsResult.rows[0].total);
      const fundingResult = await pool.query('SELECT COALESCE(SUM(amount_sanctioned), 0) as total FROM funded_projects');
      totalFunding = parseFloat(fundingResult.rows[0].total);
    } catch (_) { /* table may not exist */ }

    // Total publications from actual tables
    const totalPublications = await countPublications();

    // Total patents/IPR
    let totalIPR = 0;
    try {
      const iprResult = await pool.query('SELECT COUNT(*) as total FROM ipr');
      totalIPR = parseInt(iprResult.rows[0].total);
      const iprGrowth = await pool.query(`
        SELECT EXTRACT(YEAR FROM filing_date) as year, COUNT(*) as count
        FROM ipr
        WHERE filing_date >= CURRENT_DATE - INTERVAL '5 years'
        GROUP BY year
        ORDER BY year DESC
      `);
      iprGrowthRows = iprGrowth.rows;
    } catch (_) { /* table may not exist */ }

    // Total consultancy revenue
    let totalConsultancyRevenue = 0;
    try {
      const consultancyResult = await pool.query('SELECT COALESCE(SUM(amount_earned), 0) as total FROM consultancy');
      totalConsultancyRevenue = parseFloat(consultancyResult.rows[0].total);
    } catch (_) { /* table may not exist */ }

    res.json({
      success: true,
      data: {
        summary: {
          totalProjects,
          totalFunding,
          totalPublications,
          totalIPR,
          totalConsultancyRevenue
        },
        publicationsPerYear: [],
        iprGrowth: iprGrowthRows,
        departmentStats: departmentStatsRows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get publications per year chart data (from journal/conference/bookchapter tables)
const getPublicationsPerYear = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const { years = 5 } = req.query;
    const cutoffYear = currentYear - parseInt(years);

    const extractYear = (dateStr) => {
      if (!dateStr) return null;
      const cleaned = dateStr.replace(/[^0-9]/g, '');
      if (cleaned.length >= 8) return parseInt(cleaned.slice(-4));
      if (/^\d{4}/.test(dateStr)) return parseInt(dateStr.slice(0, 4));
      return null;
    };

    const [journals, conferences, bookchapters] = await Promise.all([
      prisma.journal.findMany({ select: { Date_of_Publication: true } }),
      prisma.conference.findMany({ select: { Date_of_Publication: true } }),
      prisma.bookchapter.findMany({ select: { Date_of_Publication: true } }),
    ]);

    const yearMap = {};
    [...journals, ...conferences, ...bookchapters].forEach((item) => {
      const yr = extractYear(item.Date_of_Publication);
      if (yr && yr >= cutoffYear) {
        yearMap[yr] = (yearMap[yr] || 0) + 1;
      }
    });

    const data = Object.entries(yearMap)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([year, count]) => ({ year: Number(year), count }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Get patent growth chart data
const getPatentGrowth = async (req, res, next) => {
  try {
    const { years = 5 } = req.query;
    
    // Calculate the date threshold in JavaScript to avoid SQL injection
    const dateThreshold = new Date();
    dateThreshold.setFullYear(dateThreshold.getFullYear() - parseInt(years));

    const result = await pool.query(`
      SELECT 
        EXTRACT(YEAR FROM filing_date) as year,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'granted' THEN 1 ELSE 0 END) as granted
      FROM ipr
      WHERE filing_date >= $1
      AND ipr_type = 'patent'
      GROUP BY year
      ORDER BY year ASC
    `, [dateThreshold]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get consultancy revenue by year
const getConsultancyRevenue = async (req, res, next) => {
  try {
    const { years = 5 } = req.query;
    
    // Calculate the date threshold in JavaScript to avoid SQL injection
    const dateThreshold = new Date();
    dateThreshold.setFullYear(dateThreshold.getFullYear() - parseInt(years));

    const result = await pool.query(`
      SELECT 
        EXTRACT(YEAR FROM start_date) as year,
        COALESCE(SUM(amount_earned), 0) as revenue,
        COUNT(*) as count
      FROM consultancy
      WHERE start_date >= $1
      GROUP BY year
      ORDER BY year ASC
    `, [dateThreshold]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get department comparison
const getDepartmentComparison = async (req, res, next) => {
  try {
    let data = [];
    try {
      const result = await pool.query(`
        SELECT 
          COALESCE(fp.department, i.department, c.department) as department,
          COUNT(DISTINCT fp.id) as projects,
          COALESCE(SUM(fp.amount_sanctioned), 0) as funding,
          COUNT(DISTINCT i.id) as ipr,
          COALESCE(SUM(c.amount_earned), 0) as consultancy_revenue
        FROM funded_projects fp
        FULL OUTER JOIN ipr i ON COALESCE(fp.department) = i.department
        FULL OUTER JOIN consultancy c ON COALESCE(fp.department, i.department) = c.department
        WHERE COALESCE(fp.department, i.department, c.department) IS NOT NULL
        GROUP BY COALESCE(fp.department, i.department, c.department)
        ORDER BY funding DESC
      `);
      data = result.rows;
    } catch (_) { /* tables may not exist */ }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/stats — research project statistics
const getResearchProjectStats = async (req, res, next) => {
  try {
    // researchProject table has been removed; return zeroes
    res.json({
      totalProjects: 0,
      totalFunding: 0,
      activeProjects: 0,
      completedProjects: 0,
      fundingAgencyCount: 0,
      facultyCount: 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getPublicationsPerYear,
  getPatentGrowth,
  getConsultancyRevenue,
  getDepartmentComparison,
  getResearchProjectStats,
};
