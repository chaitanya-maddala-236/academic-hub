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
    const { status, department, funding_agency, year, page = 1, limit = 10 } = req.query;
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

    if (funding_agency) {
      query += ` AND funding_agency = $${paramIndex}`;
      params.push(funding_agency);
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
      principal_investigator,
      department,
      funding_agency,
      sanctioned_amount,
      start_date,
      end_date
    } = req.body;

    // Calculate initial status
    const status = calculateProjectStatus(start_date, end_date);

    const result = await pool.query(
      `INSERT INTO funded_projects 
       (title, principal_investigator, department, funding_agency, sanctioned_amount, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, principal_investigator, department, funding_agency, sanctioned_amount, start_date, end_date, status]
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
      principal_investigator,
      department,
      funding_agency,
      sanctioned_amount,
      start_date,
      end_date
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
           principal_investigator = COALESCE($2, principal_investigator),
           department = COALESCE($3, department),
           funding_agency = COALESCE($4, funding_agency),
           sanctioned_amount = COALESCE($5, sanctioned_amount),
           start_date = COALESCE($6, start_date),
           end_date = COALESCE($7, end_date),
           status = $8
       WHERE id = $9
       RETURNING *`,
      [title, principal_investigator, department, funding_agency, sanctioned_amount, start_date, end_date, status, id]
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
