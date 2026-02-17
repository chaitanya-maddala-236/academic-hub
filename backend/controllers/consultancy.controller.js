const pool = require('../config/db');

// Get all consultancy with filters and pagination
const getAllConsultancy = async (req, res, next) => {
  try {
    const { department, faculty_id, status, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM consultancy WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (department) {
      query += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (faculty_id) {
      query += ` AND faculty_id = $${paramIndex}`;
      params.push(faculty_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (year) {
      query += ` AND EXTRACT(YEAR FROM start_date) = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination and sorting
    query += ` ORDER BY start_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
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

// Get single consultancy
const getConsultancyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM consultancy WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultancy not found'
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

// Create consultancy
const createConsultancy = async (req, res, next) => {
  try {
    const {
      title,
      client,
      faculty_id,
      department,
      amount_earned,
      start_date,
      end_date,
      status,
      description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO consultancy 
       (title, client, faculty_id, department, amount_earned, start_date, end_date, status, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, client, faculty_id, department, amount_earned, start_date, end_date, status, description, req.user?.id]
    );

    res.status(201).json({
      success: true,
      message: 'Consultancy created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update consultancy
const updateConsultancy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      client,
      faculty_id,
      department,
      amount_earned,
      start_date,
      end_date,
      status,
      description
    } = req.body;

    const result = await pool.query(
      `UPDATE consultancy
       SET title = COALESCE($1, title),
           client = COALESCE($2, client),
           faculty_id = COALESCE($3, faculty_id),
           department = COALESCE($4, department),
           amount_earned = COALESCE($5, amount_earned),
           start_date = COALESCE($6, start_date),
           end_date = COALESCE($7, end_date),
           status = COALESCE($8, status),
           description = COALESCE($9, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [title, client, faculty_id, department, amount_earned, start_date, end_date, status, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultancy not found'
      });
    }

    res.json({
      success: true,
      message: 'Consultancy updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete consultancy
const deleteConsultancy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM consultancy WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultancy not found'
      });
    }

    res.json({
      success: true,
      message: 'Consultancy deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllConsultancy,
  getConsultancyById,
  createConsultancy,
  updateConsultancy,
  deleteConsultancy
};
