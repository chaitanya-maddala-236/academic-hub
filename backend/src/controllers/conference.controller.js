const prisma = require('../lib/prisma');
const { z } = require('zod');

const conferenceSchema = z.object({
  Faculty_name: z.string().max(512).optional().nullable(),
  Name_of_authors: z.string().max(512).optional().nullable(),
  Title_of_the_paper: z.string().max(512).optional().nullable(),
  Name_of_the_Conference: z.string().max(512).optional().nullable(),
  National_International: z.string().max(512).optional().nullable(),
  Date_of_Publication: z.string().max(512).optional().nullable(),
  Vol_Issue_Pg_ISBN: z.string().max(512).optional().nullable(),
  Indexing: z.string().max(512).optional().nullable(),
  Name_of_the_publisher: z.string().max(512).optional().nullable(),
  DOI_of_paper: z.string().max(512).optional().nullable(),
});

const getAll = async (req, res, next) => {
  try {
    const {
      search,
      indexing,
      scope,
      faculty,
      page = 1,
      limit = 20,
      sortOrder = 'asc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (search) {
      const s = search.replace(/[%_\\]/g, '\\$&');
      where.OR = [
        { Title_of_the_paper: { contains: s, mode: 'insensitive' } },
        { Name_of_authors: { contains: s, mode: 'insensitive' } },
        { Faculty_name: { contains: s, mode: 'insensitive' } },
        { Name_of_the_Conference: { contains: s, mode: 'insensitive' } },
      ];
    }
    if (indexing) where.Indexing = { contains: indexing, mode: 'insensitive' };
    if (scope) where.National_International = { contains: scope, mode: 'insensitive' };
    if (faculty) where.Faculty_name = { contains: faculty, mode: 'insensitive' };

    const [total, rows] = await Promise.all([
      prisma.conference.count({ where }),
      prisma.conference.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { S_No: sortOrder === 'desc' ? 'desc' : 'asc' },
      }),
    ]);

    res.json({
      success: true,
      message: 'Conferences fetched successfully',
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid conference ID' });
    }
    const row = await prisma.conference.findUnique({ where: { S_No: id } });
    if (!row) return res.status(404).json({ success: false, message: 'Conference not found' });
    res.json({ success: true, message: 'Conference fetched successfully', data: row });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { S_No, ...rest } = req.body;
    if (!S_No || !Number.isInteger(Number(S_No))) {
      return res.status(400).json({ success: false, message: 'S_No (integer) is required' });
    }
    const parsed = conferenceSchema.safeParse(rest);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const row = await prisma.conference.create({ data: { S_No: Number(S_No), ...parsed.data } });
    res.status(201).json({ success: true, message: 'Conference created successfully', data: row });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid conference ID' });
    }
    const parsed = conferenceSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const existing = await prisma.conference.findUnique({ where: { S_No: id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Conference not found' });
    const row = await prisma.conference.update({ where: { S_No: id }, data: parsed.data });
    res.json({ success: true, message: 'Conference updated successfully', data: row });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid conference ID' });
    }
    const existing = await prisma.conference.findUnique({ where: { S_No: id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Conference not found' });
    await prisma.conference.delete({ where: { S_No: id } });
    res.json({ success: true, message: 'Conference deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
