// The researchProject table has been removed from the database.
// These endpoints return empty results gracefully.

// Get all projects with search, filter, sort, and pagination
const getAllProjects = async (req, res, next) => {
  try {
    res.json({ total: 0, page: 1, totalPages: 0, data: [] });
  } catch (error) {
    next(error);
  }
};

// Get single project by ID
const getProjectById = async (req, res, next) => {
  try {
    return res.status(404).json({ success: false, message: 'Project not found' });
  } catch (error) {
    next(error);
  }
};

// Create project
const createProject = async (req, res, next) => {
  return res.status(503).json({ success: false, message: 'Project storage is not available' });
};

// Update project
const updateProject = async (req, res, next) => {
  return res.status(404).json({ success: false, message: 'Project not found' });
};

// Delete project by ID
const deleteProject = async (req, res, next) => {
  return res.status(404).json({ success: false, message: 'Project not found' });
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
