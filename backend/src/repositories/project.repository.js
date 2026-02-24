const prisma = require('../lib/prisma');

/**
 * findAll — list projects with filters and pagination.
 * Uses the Prisma `Project` model (@@map("researchProject")).
 * Actual schema fields: title, principalInvestigator, coInvestigators,
 * department, fundingAgency, sanctionDate, amountLakhs, duration, status (enum: ONGOING | COMPLETED)
 */
const findAll = async ({ page = 1, limit = 10, department, status, agency, year, search, minBudget, sortBy = 'createdAt', sortOrder = 'desc' }) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (department) where.department = { contains: department, mode: 'insensitive' };
  if (agency) where.fundingAgency = { contains: agency, mode: 'insensitive' };
  if (minBudget) where.amountLakhs = { gte: parseFloat(minBudget) };
  if (year) {
    where.sanctionDate = {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31`),
    };
  }
  if (status) {
    // Accept both 'ongoing'/'completed' (lowercase from frontend) and 'ONGOING'/'COMPLETED'
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'ONGOING' || upperStatus === 'COMPLETED') {
      where.status = upperStatus;
    }
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { principalInvestigator: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } },
      { fundingAgency: { contains: search, mode: 'insensitive' } },
    ];
  }

  const allowedSortFields = ['createdAt', 'title', 'sanctionDate', 'amountLakhs'];
  // Map frontend field names to actual schema field names
  const fieldMap = { startDate: 'sanctionDate', sanctionedAmount: 'amountLakhs' };
  const resolvedSortBy = fieldMap[sortBy] || (allowedSortFields.includes(sortBy) ? sortBy : 'createdAt');
  const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

  const [projects, total] = await Promise.all([
    prisma.project.findMany({ where, skip, take: Number(limit), orderBy: { [resolvedSortBy]: orderDir } }),
    prisma.project.count({ where }),
  ]);

  return { projects: projects.map(toProjectShape), total };
};

const findById = async (id) => {
  const project = await prisma.project.findFirst({ where: { id: Number(id) } });
  return project ? toProjectShape(project) : null;
};

const create = async (data) => {
  // Map v1 field names to actual schema field names
  const mapped = mapInputToSchema(data);
  const project = await prisma.project.create({ data: mapped });
  return toProjectShape(project);
};

const update = async (id, data) => {
  const mapped = mapInputToSchema(data);
  const project = await prisma.project.update({ where: { id: Number(id) }, data: mapped });
  return toProjectShape(project);
};

const softDelete = async (id) => {
  // Schema has no isDeleted — just hard delete
  return prisma.project.delete({ where: { id: Number(id) } });
};

const getDashboardStats = async () => {
  const [total, ongoingCount, completedCount, byDept, byAgency, amountAgg] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: 'ONGOING' } }),
    prisma.project.count({ where: { status: 'COMPLETED' } }),
    prisma.project.groupBy({ by: ['department'], _count: { id: true } }),
    prisma.project.groupBy({ by: ['fundingAgency'], where: { fundingAgency: { not: null } }, _count: { id: true } }),
    prisma.project.aggregate({ _sum: { amountLakhs: true } }),
  ]);

  const allProjects = await prisma.project.findMany({
    select: { sanctionDate: true, principalInvestigator: true, amountLakhs: true },
  });

  // Top faculty by project count
  const facultyMap = {};
  allProjects.forEach(p => {
    if (p.principalInvestigator) {
      facultyMap[p.principalInvestigator] = (facultyMap[p.principalInvestigator] || 0) + 1;
    }
  });
  const topFaculty = Object.entries(facultyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Projects by year (using sanctionDate)
  const yearMap = {};
  allProjects.forEach(p => {
    if (p.sanctionDate) {
      const yr = new Date(p.sanctionDate).getFullYear();
      yearMap[yr] = (yearMap[yr] || 0) + 1;
    }
  });
  const projectsByYear = Object.entries(yearMap)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([year, count]) => ({ year: Number(year), count }));

  // Department chart data
  const departmentChart = byDept
    .filter(d => d.department)
    .map(d => ({ department: d.department, count: d._count.id }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const uniqueAgencies = byAgency.filter(a => a.fundingAgency).length;
  const uniqueFaculty = Object.keys(facultyMap).length;
  const upcoming = total - ongoingCount - completedCount;

  return {
    total,
    ongoing: ongoingCount,
    completed: completedCount,
    totalFunding: Number(amountAgg._sum.amountLakhs || 0),
    uniqueAgencies,
    uniqueFaculty,
    topFaculty,
    projectsByYear,
    departmentChart,
    statusDistribution: [
      { name: 'Ongoing', value: ongoingCount, color: '#16A34A' },
      { name: 'Completed', value: completedCount, color: '#6B7280' },
      { name: 'Upcoming', value: upcoming > 0 ? upcoming : 0, color: '#F59E0B' },
    ],
  };
};

/**
 * Maps the raw Prisma Project model to the shape expected by the frontend/v1 controller.
 */
const toProjectShape = (p) => ({
  id: p.id,
  title: p.title,
  principalInvestigator: p.principalInvestigator || null,
  coPrincipalInvestigator: p.coInvestigators || null,
  department: p.department || null,
  fundingAgency: p.fundingAgency || null,
  // Expose sanctionDate as both the raw field and as startDate for frontend compatibility
  startDate: p.sanctionDate ? p.sanctionDate.toISOString() : null,
  sanctionDate: p.sanctionDate ? p.sanctionDate.toISOString() : null,
  sanctionedAmount: p.amountLakhs ? Number(p.amountLakhs) : null,
  amountLakhs: p.amountLakhs ? Number(p.amountLakhs) : null,
  duration: p.duration || null,
  status: p.status ? p.status.toLowerCase() : null,
  createdAt: p.createdAt ? p.createdAt.toISOString() : null,
});

/**
 * Maps v1 API input field names to Prisma schema field names.
 */
const mapInputToSchema = (data) => {
  const mapped = {};
  if (data.title !== undefined) mapped.title = data.title;
  if (data.principalInvestigator !== undefined) mapped.principalInvestigator = data.principalInvestigator;
  if (data.coPrincipalInvestigator !== undefined) mapped.coInvestigators = data.coPrincipalInvestigator;
  if (data.department !== undefined) mapped.department = data.department;
  if (data.fundingAgency !== undefined) mapped.fundingAgency = data.fundingAgency;
  if (data.startDate !== undefined) mapped.sanctionDate = data.startDate;
  if (data.sanctionedAmount !== undefined) mapped.amountLakhs = data.sanctionedAmount;
  if (data.duration !== undefined) mapped.duration = data.duration;
  if (data.status !== undefined) mapped.status = data.status?.toUpperCase();
  return mapped;
};

module.exports = { findAll, findById, create, update, softDelete, getDashboardStats };
