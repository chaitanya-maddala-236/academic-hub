const prisma = require('../lib/prisma');

// Helper: compute status from stored status field (normalise to lowercase)
function normaliseStatus(status) {
  if (!status) return null;
  return status.toLowerCase();
}

// Build a Prisma `where` clause from filter params
function buildWhere({ department, status, agency, year, search, minBudget }) {
  const where = {};

  if (department) {
    where.department = { contains: department, mode: 'insensitive' };
  }

  if (status) {
    where.status = { equals: status, mode: 'insensitive' };
  }

  if (agency) {
    where.fundingAgency = { contains: agency, mode: 'insensitive' };
  }

  if (year) {
    const y = Number(year);
    if (!isNaN(y)) {
      const from = new Date(`${y}-01-01T00:00:00.000Z`);
      const to   = new Date(`${y}-12-31T23:59:59.999Z`);
      where.startDate = { gte: from, lte: to };
    }
  }

  if (search) {
    where.OR = [
      { title:                 { contains: search, mode: 'insensitive' } },
      { principalInvestigator: { contains: search, mode: 'insensitive' } },
      { department:            { contains: search, mode: 'insensitive' } },
      { fundingAgency:         { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minBudget) {
    const mb = Number(minBudget);
    if (!isNaN(mb)) {
      where.sanctionedAmount = { gte: mb };
    }
  }

  return where;
}

const findAll = async ({
  page = 1,
  limit = 12,
  department,
  status,
  agency,
  year,
  search,
  minBudget,
  sortBy = 'createdAt',
  sortOrder = 'desc',
} = {}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = buildWhere({ department, status, agency, year, search, minBudget });

  const allowedSortFields = ['createdAt', 'title', 'startDate', 'sanctionedAmount'];
  const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const order = sortOrder === 'asc' ? 'asc' : 'desc';

  const [total, projects] = await Promise.all([
    prisma.researchProject.count({ where }),
    prisma.researchProject.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [orderField]: order },
    }),
  ]);

  return {
    projects: projects.map((p) => ({ ...p, status: normaliseStatus(p.status) })),
    total,
  };
};

const findById = async (id) => {
  const project = await prisma.researchProject.findUnique({
    where: { id: Number(id) },
  });
  if (!project) return null;
  return { ...project, status: normaliseStatus(project.status) };
};

const create = async (data) => {
  const project = await prisma.researchProject.create({ data });
  return { ...project, status: normaliseStatus(project.status) };
};

const update = async (id, data) => {
  const project = await prisma.researchProject.update({
    where: { id: Number(id) },
    data,
  });
  return { ...project, status: normaliseStatus(project.status) };
};

const softDelete = async (id) => {
  await prisma.researchProject.delete({ where: { id: Number(id) } });
};

const getDashboardStats = async () => {
  const [total, ongoingCount, completedCount, projects] = await Promise.all([
    prisma.researchProject.count(),
    prisma.researchProject.count({ where: { status: { equals: 'ONGOING', mode: 'insensitive' } } }),
    prisma.researchProject.count({ where: { status: { equals: 'COMPLETED', mode: 'insensitive' } } }),
    prisma.researchProject.findMany({
      select: {
        fundingAgency: true,
        principalInvestigator: true,
        sanctionedAmount: true,
        startDate: true,
        status: true,
        department: true,
      },
    }),
  ]);

  // Total funding
  const totalFunding = projects.reduce((sum, p) => sum + (p.sanctionedAmount ?? 0), 0);

  // Unique agencies
  const agencySet = new Set(projects.map((p) => p.fundingAgency).filter(Boolean));
  const uniqueAgencies = agencySet.size;

  // Faculty PI map
  const facultyMap = {};
  projects.forEach((p) => {
    if (p.principalInvestigator) {
      facultyMap[p.principalInvestigator] = (facultyMap[p.principalInvestigator] || 0) + 1;
    }
  });
  const uniqueFaculty = Object.keys(facultyMap).length;
  const topFaculty = Object.entries(facultyMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Projects by year
  const yearMap = {};
  projects.forEach((p) => {
    if (p.startDate) {
      const y = new Date(p.startDate).getFullYear();
      yearMap[y] = (yearMap[y] || 0) + 1;
    }
  });
  const projectsByYear = Object.entries(yearMap)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);

  // Department chart
  const deptMap = {};
  projects.forEach((p) => {
    if (p.department) {
      deptMap[p.department] = (deptMap[p.department] || 0) + 1;
    }
  });
  const departmentChart = Object.entries(deptMap)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);

  const upcoming = total - ongoingCount - completedCount;

  return {
    total,
    ongoing: ongoingCount,
    completed: completedCount,
    totalFunding,
    uniqueAgencies,
    uniqueFaculty,
    topFaculty,
    projectsByYear,
    departmentChart,
    statusDistribution: [
      { name: 'Ongoing',   value: ongoingCount,   color: '#3B82F6' },
      { name: 'Completed', value: completedCount,  color: '#10B981' },
      { name: 'Upcoming',  value: Math.max(0, upcoming), color: '#A855F7' },
    ],
  };
};

module.exports = { findAll, findById, create, update, softDelete, getDashboardStats };
