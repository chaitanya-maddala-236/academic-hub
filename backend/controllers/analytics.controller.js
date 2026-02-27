// The researchProject table has been removed from the database.
// These analytics endpoints return empty/zero results gracefully.

// Get projects grouped by department
const getProjectsByDepartment = async (req, res, next) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

// Get funding trend grouped by year
const getFundingTrend = async (req, res, next) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

// Get status distribution
const getStatusDistribution = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: [
        { status: 'ongoing', count: 0 },
        { status: 'completed', count: 0 },
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
