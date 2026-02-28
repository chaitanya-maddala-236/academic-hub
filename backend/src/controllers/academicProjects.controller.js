const prisma = require('../lib/prisma');

/**
 * Group raw academic_project rows into projects.
 * One project = grouped by (Academic_Year + Branch + Batch_No + Project_Title + Guide_Name)
 */
function groupRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = [
      row.Academic_Year ?? '',
      row.Branch ?? '',
      String(row.Batch_No ?? ''),
      row.Project_Title ?? '',
      row.Guide_Name ?? '',
    ].join('||');

    if (!map.has(key)) {
      map.set(key, {
        batchKey: key,
        academicYear: row.Academic_Year,
        branch: row.Branch,
        batchNo: row.Batch_No,
        projectTitle: row.Project_Title,
        guideName: row.Guide_Name,
        projectDomain: row.Project_Domain,
        btech: row.Btech,
        students: [],
      });
    }
    map.get(key).students.push({
      id: row.id,
      rollNo: row.Roll_No,
      studentName: row.Student_Name,
      section: row.Section,
    });
  }
  return Array.from(map.values());
}

/**
 * GET /api/v1/academic-projects
 * Query params: year, branch, domain, guide, search
 * Returns grouped projects list
 */
const getProjects = async (req, res, next) => {
  try {
    const { year, branch, domain, guide, search } = req.query;

    const where = {};
    if (year) where.Academic_Year = { equals: year, mode: 'insensitive' };
    if (branch) where.Branch = { equals: branch, mode: 'insensitive' };
    if (domain) where.Project_Domain = { contains: domain, mode: 'insensitive' };
    if (guide) where.Guide_Name = { contains: guide, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { Project_Title: { contains: search, mode: 'insensitive' } },
        { Student_Name: { contains: search, mode: 'insensitive' } },
        { Guide_Name: { contains: search, mode: 'insensitive' } },
        { Roll_No: { contains: search, mode: 'insensitive' } },
      ];
    }

    const rows = await prisma.academic_project.findMany({
      where,
      orderBy: [
        { Academic_Year: 'desc' },
        { Branch: 'asc' },
        { Batch_No: 'asc' },
      ],
    });

    const projects = groupRows(rows);

    res.json({ success: true, data: projects, total: projects.length });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/academic-projects/stats
 * Returns summary stats
 */
const getStats = async (req, res, next) => {
  try {
    const rows = await prisma.academic_project.findMany();
    const projects = groupRows(rows);
    const totalStudents = rows.length;
    const totalProjects = projects.length;
    const guides = new Set(rows.map((r) => r.Guide_Name).filter(Boolean));
    const avgStudents = totalProjects > 0 ? (totalStudents / totalProjects).toFixed(1) : '0';

    const domainDist = {};
    const branchDist = {};
    const yearDist = {};
    for (const p of projects) {
      if (p.projectDomain) domainDist[p.projectDomain] = (domainDist[p.projectDomain] || 0) + 1;
      if (p.branch) branchDist[p.branch] = (branchDist[p.branch] || 0) + 1;
      if (p.academicYear) yearDist[p.academicYear] = (yearDist[p.academicYear] || 0) + 1;
    }

    res.json({
      success: true,
      data: {
        totalProjects,
        totalStudents,
        totalGuides: guides.size,
        avgStudentsPerProject: Number(avgStudents),
        domainDistribution: Object.entries(domainDist).map(([name, count]) => ({ name, count })),
        branchDistribution: Object.entries(branchDist).map(([name, count]) => ({ name, count })),
        yearDistribution: Object.entries(yearDist).map(([name, count]) => ({ name, count })).sort((a, b) => b.name.localeCompare(a.name)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/academic-projects/batch/:batchId
 * Returns project info + students for a given batch key (URL-encoded)
 */
const getProjectByBatch = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const parts = decodeURIComponent(batchId).split('||');
    if (parts.length < 5) {
      return res.status(400).json({ success: false, message: 'Invalid batch ID' });
    }
    const [academicYear, branch, batchNo, projectTitle, guideName] = parts;
    const batchNoInt = batchNo ? parseInt(batchNo, 10) : undefined;

    const rows = await prisma.academic_project.findMany({
      where: {
        Academic_Year: { equals: academicYear, mode: 'insensitive' },
        Branch: { equals: branch, mode: 'insensitive' },
        Batch_No: batchNoInt !== undefined && !isNaN(batchNoInt) ? batchNoInt : undefined,
        Project_Title: { equals: projectTitle, mode: 'insensitive' },
        Guide_Name: { equals: guideName, mode: 'insensitive' },
      },
    });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const [project] = groupRows(rows);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/academic-projects/student/:rollNo
 * Returns student info + their project
 */
const getStudentByRollNo = async (req, res, next) => {
  try {
    const { rollNo } = req.params;
    const rows = await prisma.academic_project.findMany({
      where: { Roll_No: { equals: rollNo, mode: 'insensitive' } },
    });
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const row = rows[0];

    // Get all team members in the same project
    const teamRows = await prisma.academic_project.findMany({
      where: {
        Academic_Year: row.Academic_Year,
        Branch: row.Branch,
        Batch_No: row.Batch_No,
        Project_Title: row.Project_Title,
        Guide_Name: row.Guide_Name,
      },
    });

    res.json({
      success: true,
      data: {
        student: {
          id: row.id,
          rollNo: row.Roll_No,
          studentName: row.Student_Name,
          branch: row.Branch,
          section: row.Section,
          btech: row.Btech,
        },
        project: {
          academicYear: row.Academic_Year,
          branch: row.Branch,
          batchNo: row.Batch_No,
          projectTitle: row.Project_Title,
          guideName: row.Guide_Name,
          projectDomain: row.Project_Domain,
        },
        teamMembers: teamRows.map((r) => ({
          id: r.id,
          rollNo: r.Roll_No,
          studentName: r.Student_Name,
          section: r.Section,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/academic-projects/guide/:guideName
 * Returns guide stats + list of projects
 */
const getGuide = async (req, res, next) => {
  try {
    const { guideName } = req.params;
    const rows = await prisma.academic_project.findMany({
      where: { Guide_Name: { contains: decodeURIComponent(guideName), mode: 'insensitive' } },
    });
    const projects = groupRows(rows);
    res.json({
      success: true,
      data: {
        guideName: decodeURIComponent(guideName),
        totalProjects: projects.length,
        totalStudents: rows.length,
        projects,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, getStats, getProjectByBatch, getStudentByRollNo, getGuide };
