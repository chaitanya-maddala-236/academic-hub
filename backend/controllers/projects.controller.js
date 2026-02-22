const pool = require('../config/db');

// Get all projects with search, filter, sort, and pagination
const getAllProjects = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      department,
      funding,
      year,
      minBudget,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let idx = 1;
    const conditions = [];

    if (search) {
      // Escape ILIKE pattern metacharacters (%_\) so user input is treated as literal text.
      // SQL injection is already prevented by the parameterized query ($N placeholder).
      const escaped = search.replace(/[%_\\]/g, '\\$&');
      conditions.push(`(title ILIKE $${idx} OR principal_investigator ILIKE $${idx} OR funding_agency ILIKE $${idx} OR department ILIKE $${idx})`);
      params.push(`%${escaped}%`);
      idx++;
    }

    if (status && (status === 'ONGOING' || status === 'COMPLETED')) {
      conditions.push(`status = $${idx++}`);
      params.push(status);
    }

    if (department) {
      conditions.push(`department ILIKE $${idx++}`);
      params.push(department);
    }

    if (funding) {
      conditions.push(`funding_agency ILIKE $${idx++}`);
      params.push(`%${funding}%`);
    }

    if (year) {
      conditions.push(`EXTRACT(YEAR FROM sanction_date)::int = $${idx++}`);
      params.push(parseInt(year));
    }

    if (minBudget) {
      conditions.push(`amount_lakhs >= $${idx++}`);
      params.push(parseFloat(minBudget));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const order = sort === 'oldest' ? 'ORDER BY sanction_date ASC NULLS LAST' : 'ORDER BY sanction_date DESC NULLS LAST';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM "researchProject" ${where}`,
      params
    );
    const total = countResult.rows[0].total;

    const dataResult = await pool.query(
      `SELECT * FROM "researchProject" ${where} ${order} LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limitNum, offset]
    );

    res.json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: dataResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Get single project by ID
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM "researchProject" WHERE id = $1`,
      [parseInt(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Create project
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      principal_investigator,
      co_investigators,
      department,
      funding_agency,
      sanction_date,
      amount_lakhs,
      duration,
      status,
    } = req.body;

    if (!title || !principal_investigator || !amount_lakhs || !status) {
      return res.status(400).json({
        success: false,
        message: 'title, principal_investigator, amount_lakhs and status are required',
      });
    }

    if (status !== 'ONGOING' && status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'status must be ONGOING or COMPLETED' });
    }

    const result = await pool.query(
      `INSERT INTO "researchProject"
         (title, principal_investigator, co_investigators, department, funding_agency,
          sanction_date, amount_lakhs, duration, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, principal_investigator, co_investigators || null, department || null,
       funding_agency || null, sanction_date || null, parseFloat(amount_lakhs),
       duration || null, status]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Update project (only provided fields)
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await pool.query(`SELECT id FROM "researchProject" WHERE id = $1`, [parseInt(id)]);
    if (check.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const allowed = ['title', 'principal_investigator', 'co_investigators', 'department',
                     'funding_agency', 'sanction_date', 'amount_lakhs', 'duration', 'status'];
    const setClauses = [];
    const params = [];
    let idx = 1;

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        if (field === 'status' && req.body[field] !== 'ONGOING' && req.body[field] !== 'COMPLETED') {
          return res.status(400).json({ success: false, message: 'status must be ONGOING or COMPLETED' });
        }
        setClauses.push(`${field} = $${idx++}`);
        params.push(req.body[field]);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    params.push(parseInt(id));
    const result = await pool.query(
      `UPDATE "researchProject" SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Delete project by ID
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await pool.query(`SELECT id FROM "researchProject" WHERE id = $1`, [parseInt(id)]);
    if (check.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await pool.query(`DELETE FROM "researchProject" WHERE id = $1`, [parseInt(id)]);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
