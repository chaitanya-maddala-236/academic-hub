const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Get all student projects
const getAllStudentProjects = async (req, res) => {
  try {
    const { faculty_id, department, project_type, academic_year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT sp.*, f.name as faculty_name, f.department as faculty_department
      FROM student_projects sp
      LEFT JOIN faculty f ON sp.faculty_id = f.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (faculty_id) {
      queryText += ` AND sp.faculty_id = $${paramCount}`;
      queryParams.push(faculty_id);
      paramCount++;
    }

    if (department) {
      queryText += ` AND sp.department = $${paramCount}`;
      queryParams.push(department);
      paramCount++;
    }

    if (project_type) {
      queryText += ` AND sp.project_type = $${paramCount}`;
      queryParams.push(project_type);
      paramCount++;
    }

    if (academic_year) {
      queryText += ` AND sp.academic_year = $${paramCount}`;
      queryParams.push(academic_year);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(
      queryText.replace('sp.*, f.name as faculty_name, f.department as faculty_department', 'COUNT(*)'),
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    queryText += ` ORDER BY sp.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(queryText, queryParams);

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
    console.error('Error fetching student projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student projects',
      error: error.message
    });
  }
};

// Get single student project
const getStudentProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT sp.*, f.name as faculty_name, f.department as faculty_department
       FROM student_projects sp
       LEFT JOIN faculty f ON sp.faculty_id = f.id
       WHERE sp.id = $1`,
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
    console.error('Error fetching student project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student project',
      error: error.message
    });
  }
};

// Create student project
const createStudentProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      faculty_id,
      student_names,
      department,
      project_type,
      academic_year,
      abstract,
      pdf_url
    } = req.body;

    const result = await pool.query(
      `INSERT INTO student_projects 
       (title, faculty_id, student_names, department, project_type, academic_year, abstract, pdf_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, faculty_id, student_names, department, project_type, academic_year, abstract, pdf_url, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Student project created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating student project:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating student project',
      error: error.message
    });
  }
};

// Update student project
const updateStudentProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      faculty_id,
      student_names,
      department,
      project_type,
      academic_year,
      abstract,
      pdf_url
    } = req.body;

    const result = await pool.query(
      `UPDATE student_projects 
       SET title = COALESCE($1, title),
           faculty_id = COALESCE($2, faculty_id),
           student_names = COALESCE($3, student_names),
           department = COALESCE($4, department),
           project_type = COALESCE($5, project_type),
           academic_year = COALESCE($6, academic_year),
           abstract = COALESCE($7, abstract),
           pdf_url = COALESCE($8, pdf_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, faculty_id, student_names, department, project_type, academic_year, abstract, pdf_url, id]
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
    console.error('Error updating student project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student project',
      error: error.message
    });
  }
};

// Delete student project
const deleteStudentProject = async (req, res) => {
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
    console.error('Error deleting student project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student project',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudentProjects,
  getStudentProjectById,
  createStudentProject,
  updateStudentProject,
  deleteStudentProject
};
