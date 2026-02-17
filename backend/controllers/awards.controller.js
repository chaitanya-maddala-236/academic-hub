const pool = require('../config/db');

// Get all awards
const getAllAwards = async (req, res) => {
  try {
    const { faculty_id, year, award_type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT a.*, f.name as faculty_name, f.department as faculty_department
      FROM awards a
      LEFT JOIN faculty f ON a.faculty_id = f.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (faculty_id) {
      queryText += ` AND a.faculty_id = $${paramCount}`;
      queryParams.push(faculty_id);
      paramCount++;
    }

    if (year) {
      queryText += ` AND a.year = $${paramCount}`;
      queryParams.push(year);
      paramCount++;
    }

    if (award_type) {
      queryText += ` AND a.award_type ILIKE $${paramCount}`;
      queryParams.push(`%${award_type}%`);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(
      queryText.replace('a.*, f.name as faculty_name, f.department as faculty_department', 'COUNT(*)'),
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    queryText += ` ORDER BY a.year DESC, a.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(queryText, queryParams);
// Get all awards with filters and pagination
const getAllAwards = async (req, res, next) => {
  try {
    const { recipient_type, faculty_id, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM awards WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (recipient_type) {
      query += ` AND recipient_type = $${paramIndex}`;
      params.push(recipient_type);
      paramIndex++;
    }

    if (faculty_id) {
      query += ` AND faculty_id = $${paramIndex}`;
      params.push(faculty_id);
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
    console.error('Error fetching awards:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching awards',
      error: error.message
    });
    next(error);
  }
};

// Get single award
const getAwardById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT a.*, f.name as faculty_name, f.department as faculty_department
       FROM awards a
       LEFT JOIN faculty f ON a.faculty_id = f.id
       WHERE a.id = $1`,
const getAwardById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM awards WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching award:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching award',
      error: error.message
    });
    next(error);
  }
};

// Create award
const createAward = async (req, res) => {
  try {
    const {
      title,
      faculty_id,
      award_type,
      awarded_by,
      year,
      date_received,
      description,
      certificate_url
const createAward = async (req, res, next) => {
  try {
    const {
      title,
      recipient_type,
      recipient_name,
      faculty_id,
      award_type,
      awarding_body,
      year,
      description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO awards 
       (title, faculty_id, award_type, awarded_by, year, date_received, description, certificate_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, faculty_id, award_type, awarded_by, year, date_received, description, certificate_url, req.user.id]
       (title, recipient_type, recipient_name, faculty_id, award_type, awarding_body, year, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, recipient_type, recipient_name, faculty_id, award_type, awarding_body, year, description, req.user?.id]
    );

    res.status(201).json({
      success: true,
      message: 'Award created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating award:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating award',
      error: error.message
    });
    next(error);
  }
};

// Update award
const updateAward = async (req, res) => {
const updateAward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      faculty_id,
      award_type,
      awarded_by,
      year,
      date_received,
      description,
      certificate_url
    } = req.body;

    const result = await pool.query(
      `UPDATE awards 
       SET title = COALESCE($1, title),
           faculty_id = COALESCE($2, faculty_id),
           award_type = COALESCE($3, award_type),
           awarded_by = COALESCE($4, awarded_by),
           year = COALESCE($5, year),
           date_received = COALESCE($6, date_received),
           description = COALESCE($7, description),
           certificate_url = COALESCE($8, certificate_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, faculty_id, award_type, awarded_by, year, date_received, description, certificate_url, id]
      recipient_type,
      recipient_name,
      faculty_id,
      award_type,
      awarding_body,
      year,
      description
    } = req.body;

    const result = await pool.query(
      `UPDATE awards
       SET title = COALESCE($1, title),
           recipient_type = COALESCE($2, recipient_type),
           recipient_name = COALESCE($3, recipient_name),
           faculty_id = COALESCE($4, faculty_id),
           award_type = COALESCE($5, award_type),
           awarding_body = COALESCE($6, awarding_body),
           year = COALESCE($7, year),
           description = COALESCE($8, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, recipient_type, recipient_name, faculty_id, award_type, awarding_body, year, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      message: 'Award updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating award:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating award',
      error: error.message
    });
    next(error);
  }
};

// Delete award
const deleteAward = async (req, res) => {
  try {
    const { id } = req.params;
const deleteAward = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM awards WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      message: 'Award deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting award:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting award',
      error: error.message
    });
    next(error);
  }
};

module.exports = {
  getAllAwards,
  getAwardById,
  createAward,
  updateAward,
  deleteAward
};
