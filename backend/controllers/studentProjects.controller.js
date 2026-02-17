const pool = require('../config/db');

// Get all student projects with filters and pagination
const getAllStudentProjects = async (req, res, next) => {
  try {
    const { project_type, department, guide_id, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM student_projects WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (project_type) {
      query += ` AND project_type = $${paramIndex}`;
      params.push(project_type);
      paramIndex++;
    }

    if (department) {
      query += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (guide_id) {
      query += ` AND guide_id = $${paramIndex}`;
      params.push(guide_id);
      paramIndex++;
    }

    if (year) {
      query += ` AND year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination and sorting
    query += ` ORDER BY year DESC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single student project
const getStudentProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM student_projects WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student project not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Create student project
const createStudentProject = async (req, res, next) => {
  try {
    const {
      title,
      project_type,
      students,
      guide_id,
      department,
      year,
      abstract,
      pdf_url
    } = req.body;

    const result = await pool.query(
      `INSERT INTO student_projects 
       (title, project_type, students, guide_id, department, year, abstract, pdf_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, project_type, students, guide_id, department, year, abstract, pdf_url, req.user?.id]
    );

    res.status(201).json({
      success: true,
      message: 'Student project created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update student project
const updateStudentProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      project_type,
      students,
      guide_id,
      department,
      year,
      abstract,
      pdf_url
    } = req.body;

    const result = await pool.query(
      `UPDATE student_projects
       SET title = COALESCE($1, title),
           project_type = COALESCE($2, project_type),
           students = COALESCE($3, students),
           guide_id = COALESCE($4, guide_id),
           department = COALESCE($5, department),
           year = COALESCE($6, year),
           abstract = COALESCE($7, abstract),
           pdf_url = COALESCE($8, pdf_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, project_type, students, guide_id, department, year, abstract, pdf_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student project not found'
      });
    }

    res.json({
      success: true,
      message: 'Student project updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete student project
const deleteStudentProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM student_projects WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student project not found'
      });
    }

    res.json({
      success: true,
      message: 'Student project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudentProjects,
  getStudentProjectById,
  createStudentProject,
  updateStudentProject,
  deleteStudentProject
};
