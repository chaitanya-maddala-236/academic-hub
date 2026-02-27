/**
 * Project repository — the researchProject table has been removed from the database.
 * All methods return empty/null results gracefully so project pages render without errors.
 */

const EMPTY_STATS = {
  total: 0,
  ongoing: 0,
  completed: 0,
  totalFunding: 0,
  uniqueAgencies: 0,
  uniqueFaculty: 0,
  topFaculty: [],
  projectsByYear: [],
  departmentChart: [],
  statusDistribution: [
    { name: 'Ongoing', value: 0, color: '#3B82F6' },
    { name: 'Completed', value: 0, color: '#10B981' },
    { name: 'Upcoming', value: 0, color: '#A855F7' },
  ],
};

const findAll = async () => ({ projects: [], total: 0 });

const findById = async () => null;

const create = async () => { throw new Error('Project storage is not available'); };

const update = async () => { throw new Error('Project storage is not available'); };

const softDelete = async () => { throw new Error('Project storage is not available'); };

const getDashboardStats = async () => EMPTY_STATS;

module.exports = { findAll, findById, create, update, softDelete, getDashboardStats };
