const pool = require('../config/db');

// Helper function to calculate project status
const calculateProjectStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'upcoming';
  } else if (now > end) {
    return 'completed';
  } else {
    return 'ongoing';
  }
};

// Get all projects with filters and pagination
const getAllProjects = async (req, res, next) => {
  try {
    const { status, department, agency, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM funded_projects WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (department) {
      query += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (agency) {
      query += ` AND agency = $${paramIndex}`;
      params.push(agency);
      paramIndex++;
    }

    if (year) {
      query += ` AND EXTRACT(YEAR FROM start_date) = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    // Get total count before applying status filter
    let countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    let allData;
    
    if (status) {
      // Need to fetch all data to calculate status on the fly
      allData = await pool.query(query + ' ORDER BY start_date DESC', params);
      
      // Filter by calculated status
      const filteredData = allData.rows.filter(project => {
        const calculatedStatus = calculateProjectStatus(project.start_date, project.end_date);
        return calculatedStatus === status;
      });

      const total = filteredData.length;
      const paginatedData = filteredData.slice(offset, offset + parseInt(limit));

      // Add calculated status to results
      const results = paginatedData.map(project => ({
        ...project,
        status: calculateProjectStatus(project.start_date, project.end_date)
      }));

      return res.json({
        success: true,
        data: results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    // Get total count without status filter
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination and sorting
    query += ` ORDER BY start_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Add calculated status to each project
    const projectsWithStatus = result.rows.map(project => ({
      ...project,
      status: calculateProjectStatus(project.start_date, project.end_date)
    }));

    res.json({
      success: true,
      data: projectsWithStatus,
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

// Get single project
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM funded_projects WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = result.rows[0];
    project.status = calculateProjectStatus(project.start_date, project.end_date);

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Create project
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      agency,
      agency_scientist,
      file_number,
      amount_sanctioned,
      funds_per_year,
      start_date,
      end_date,
      pi,
      copi,
      objectives,
      deliverables,
      outcomes,
      team,
      department,
      pdf_url
    } = req.body;

    // Calculate initial status
    const status = calculateProjectStatus(start_date, end_date);

    const result = await pool.query(
      `INSERT INTO funded_projects 
       (title, agency, agency_scientist, file_number, amount_sanctioned, funds_per_year, start_date, end_date, pi, copi, objectives, deliverables, outcomes, team, department, status, pdf_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
      [title, agency, agency_scientist, file_number, amount_sanctioned, funds_per_year, start_date, end_date, pi, copi, objectives, deliverables, outcomes, team, department, status, pdf_url, req.user?.id]
    );

    const project = result.rows[0];
    project.status = calculateProjectStatus(project.start_date, project.end_date);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Update project
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      agency,
      agency_scientist,
      file_number,
      amount_sanctioned,
      funds_per_year,
      start_date,
      end_date,
      pi,
      copi,
      objectives,
      deliverables,
      outcomes,
      team,
      department,
      pdf_url
    } = req.body;

    // Get current project data to determine new status
    const currentProject = await pool.query('SELECT * FROM funded_projects WHERE id = $1', [id]);
    
    if (currentProject.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const newStartDate = start_date || currentProject.rows[0].start_date;
    const newEndDate = end_date || currentProject.rows[0].end_date;
    const status = calculateProjectStatus(newStartDate, newEndDate);

    const result = await pool.query(
      `UPDATE funded_projects
       SET title = COALESCE($1, title),
           agency = COALESCE($2, agency),
           agency_scientist = COALESCE($3, agency_scientist),
           file_number = COALESCE($4, file_number),
           amount_sanctioned = COALESCE($5, amount_sanctioned),
           funds_per_year = COALESCE($6, funds_per_year),
           start_date = COALESCE($7, start_date),
           end_date = COALESCE($8, end_date),
           pi = COALESCE($9, pi),
           copi = COALESCE($10, copi),
           objectives = COALESCE($11, objectives),
           deliverables = COALESCE($12, deliverables),
           outcomes = COALESCE($13, outcomes),
           team = COALESCE($14, team),
           department = COALESCE($15, department),
           status = $16,
           pdf_url = COALESCE($17, pdf_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $18
       RETURNING *`,
      [title, agency, agency_scientist, file_number, amount_sanctioned, funds_per_year, start_date, end_date, pi, copi, objectives, deliverables, outcomes, team, department, status, pdf_url, id]
    );

    const project = result.rows[0];
    project.status = calculateProjectStatus(project.start_date, project.end_date);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM funded_projects WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
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
