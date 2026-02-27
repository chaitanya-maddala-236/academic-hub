const pool = require('../config/db');

// GET /api/consultancy/metrics
const getMetrics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int                                              AS total_projects,
        COALESCE(SUM(estimated_amount_lakhs), 0)::float           AS total_estimated,
        COALESCE(SUM(received_amount_lakhs), 0)::float            AS total_received,
        COUNT(*) FILTER (WHERE LOWER(status) = 'active')::int     AS active_projects,
        COUNT(*) FILTER (WHERE LOWER(status) = 'completed')::int  AS completed_projects,
        COUNT(*) FILTER (WHERE LOWER(status) = 'pending')::int    AS pending_projects
      FROM ongoing_consultancy_projects
    `);
    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        totalProjects:      row.total_projects,
        totalEstimated:     row.total_estimated,
        totalReceived:      row.total_received,
        activeProjects:     row.active_projects,
        completedProjects:  row.completed_projects,
        pendingProjects:    row.pending_projects,
      },
    });
  } catch (error) {
    console.error('Error fetching consultancy metrics:', error);
    res.status(500).json({ success: false, message: 'Error fetching consultancy metrics', error: error.message });
  }
};

// GET /api/consultancy
const getAllConsultancy = async (req, res) => {
  try {
    const { department, status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = ['1=1'];
    const params = [];
    let idx = 1;

    if (department) { conditions.push(`department ILIKE $${idx++}`); params.push(`%${department}%`); }
    if (status)     { conditions.push(`LOWER(status) = $${idx++}`); params.push(status.toLowerCase()); }
    if (search) {
      const s = search.replace(/[%_\\]/g, '\\$&');
      conditions.push(`(project_title ILIKE $${idx} OR principal_investigator ILIKE $${idx} OR department ILIKE $${idx})`);
      params.push(`%${s}%`);
      idx++;
    }

    const where = conditions.join(' AND ');

    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM ongoing_consultancy_projects WHERE ${where}`, params);
    const total = countResult.rows[0].total;

    const dataResult = await pool.query(
      `SELECT * FROM ongoing_consultancy_projects WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching consultancy records:', error);
    res.status(500).json({ success: false, message: 'Error fetching consultancy records', error: error.message });
  }
};

// GET /api/consultancy/:id
const getConsultancyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM ongoing_consultancy_projects WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consultancy record not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching consultancy record:', error);
    res.status(500).json({ success: false, message: 'Error fetching consultancy record', error: error.message });
  }
};

// POST /api/consultancy
const createConsultancy = async (req, res) => {
  try {
    const {
      project_title, principal_investigator, co_investigators,
      department, institute_level, estimated_amount_lakhs,
      received_amount_lakhs, remarks, status,
    } = req.body;

    if (!project_title) {
      return res.status(400).json({ success: false, message: 'project_title is required' });
    }

    const result = await pool.query(
      `INSERT INTO ongoing_consultancy_projects
         (project_title, principal_investigator, co_investigators, department,
          institute_level, estimated_amount_lakhs, received_amount_lakhs, remarks, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [project_title, principal_investigator, co_investigators, department,
       institute_level, estimated_amount_lakhs, received_amount_lakhs, remarks, status]
    );

    res.status(201).json({ success: true, message: 'Consultancy record created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating consultancy record:', error);
    res.status(500).json({ success: false, message: 'Error creating consultancy record', error: error.message });
  }
};

// PUT /api/consultancy/:id
const updateConsultancy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      project_title, principal_investigator, co_investigators,
      department, institute_level, estimated_amount_lakhs,
      received_amount_lakhs, remarks, status,
    } = req.body;

    const result = await pool.query(
      `UPDATE ongoing_consultancy_projects SET
         project_title           = COALESCE($1,  project_title),
         principal_investigator  = COALESCE($2,  principal_investigator),
         co_investigators        = COALESCE($3,  co_investigators),
         department              = COALESCE($4,  department),
         institute_level         = COALESCE($5,  institute_level),
         estimated_amount_lakhs  = COALESCE($6,  estimated_amount_lakhs),
         received_amount_lakhs   = COALESCE($7,  received_amount_lakhs),
         remarks                 = COALESCE($8,  remarks),
         status                  = COALESCE($9,  status)
       WHERE id = $10
       RETURNING *`,
      [project_title, principal_investigator, co_investigators, department,
       institute_level, estimated_amount_lakhs, received_amount_lakhs, remarks, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consultancy record not found' });
    }
    res.json({ success: true, message: 'Consultancy record updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating consultancy record:', error);
    res.status(500).json({ success: false, message: 'Error updating consultancy record', error: error.message });
  }
};

// DELETE /api/consultancy/:id
const deleteConsultancy = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM ongoing_consultancy_projects WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consultancy record not found' });
    }
    res.json({ success: true, message: 'Consultancy record deleted successfully' });
  } catch (error) {
    console.error('Error deleting consultancy record:', error);
    res.status(500).json({ success: false, message: 'Error deleting consultancy record', error: error.message });
  }
};

module.exports = {
  getMetrics,
  getAllConsultancy,
  getConsultancyById,
  createConsultancy,
  updateConsultancy,
  deleteConsultancy,
};
