const pool = require('../config/db');

// Get projects grouped by department (from researchProject table)
const getProjectsByDepartment = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT department, COUNT(*) AS count
      FROM "researchProject"
      WHERE department IS NOT NULL AND department <> ''
      GROUP BY department
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        department: row.department,
        count: parseInt(row.count),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get funding trend grouped by year (from researchProject table)
const getFundingTrend = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT EXTRACT(YEAR FROM sanction_date)::INT AS year,
             COALESCE(SUM(amount_lakhs), 0)::FLOAT AS total_funding,
             COUNT(*) AS project_count
      FROM "researchProject"
      WHERE sanction_date IS NOT NULL
      GROUP BY year
      ORDER BY year ASC
    `);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        year: row.year,
        total_funding: row.total_funding,
        project_count: parseInt(row.project_count),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get status distribution (from researchProject table)
const getStatusDistribution = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT status, COUNT(*)::int AS count FROM "researchProject" WHERE status IS NOT NULL GROUP BY status`
    );

    const counts = { ONGOING: 0, COMPLETED: 0 };
    result.rows.forEach(({ status, count }) => {
      if (status === 'ONGOING' || status === 'COMPLETED') counts[status] = count;
    });

    res.json({
      success: true,
      data: [
        { status: 'ongoing', count: counts.ONGOING },
        { status: 'completed', count: counts.COMPLETED },
      ],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectsByDepartment,
  getFundingTrend,
  getStatusDistribution,
};
