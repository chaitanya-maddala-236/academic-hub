const prisma = require('../lib/prisma');
const { z } = require('zod');

const journalSchema = z.object({
  Faculty_name: z.string().max(512).optional().nullable(),
  Name_of_authors: z.string().max(512).optional().nullable(),
  Title_of_the_paper: z.string().max(512).optional().nullable(),
  Name_of_the_Journal: z.string().max(512).optional().nullable(),
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
        { Name_of_the_Journal: { contains: s, mode: 'insensitive' } },
      ];
    }
    if (indexing) where.Indexing = { contains: indexing, mode: 'insensitive' };
    if (scope) where.National_International = { contains: scope, mode: 'insensitive' };
    if (faculty) where.Faculty_name = { contains: faculty, mode: 'insensitive' };

    const [total, rows] = await Promise.all([
      prisma.journal.count({ where }),
      prisma.journal.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { S_No: sortOrder === 'desc' ? 'desc' : 'asc' },
      }),
    ]);

    res.json({
      success: true,
      message: 'Journals fetched successfully',
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
      return res.status(400).json({ success: false, message: 'Invalid journal ID' });
    }
    const row = await prisma.journal.findUnique({ where: { S_No: id } });
    if (!row) return res.status(404).json({ success: false, message: 'Journal not found' });
    res.json({ success: true, message: 'Journal fetched successfully', data: row });
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
    const parsed = journalSchema.safeParse(rest);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const row = await prisma.journal.create({ data: { S_No: Number(S_No), ...parsed.data } });
    res.status(201).json({ success: true, message: 'Journal created successfully', data: row });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid journal ID' });
    }
    const parsed = journalSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const existing = await prisma.journal.findUnique({ where: { S_No: id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Journal not found' });
    const row = await prisma.journal.update({ where: { S_No: id }, data: parsed.data });
    res.json({ success: true, message: 'Journal updated successfully', data: row });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid journal ID' });
    }
    const existing = await prisma.journal.findUnique({ where: { S_No: id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Journal not found' });
    await prisma.journal.delete({ where: { S_No: id } });
    res.json({ success: true, message: 'Journal deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
