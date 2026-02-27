const prisma = require('../lib/prisma');
const { z } = require('zod');

const publicationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  authors: z.string().optional().nullable(),
  journal_name: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  volume: z.string().optional().nullable(),
  issue: z.string().optional().nullable(),
  pages: z.string().optional().nullable(),
  doi: z.string().optional().nullable(),
  indexed_in: z.string().optional().nullable(),
});

// GET /api/v1/publications
const getAll = async (req, res, next) => {
  try {
    const {
      search,
      year,
      indexed_in,
      page = 1,
      limit = 20,
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (search) {
      const s = search.replace(/[%_\\]/g, '\\$&');
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { authors: { contains: s, mode: 'insensitive' } },
        { journal_name: { contains: s, mode: 'insensitive' } },
      ];
    }
    if (year) where.year = parseInt(year);
    if (indexed_in) where.indexed_in = { contains: indexed_in, mode: 'insensitive' };

    const [total, rows] = await Promise.all([
      prisma.publications.count({ where }),
      prisma.publications.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { year: sortOrder === 'asc' ? 'asc' : 'desc' },
      }),
    ]);

    res.json({
      success: true,
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

// GET /api/v1/publications/:id
const getOne = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid publication ID' });
    }
    const row = await prisma.publications.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ success: false, message: 'Publication not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/publications
const create = async (req, res, next) => {
  try {
    const parsed = publicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const row = await prisma.publications.create({ data: parsed.data });
    res.status(201).json({ success: true, message: 'Publication created successfully', data: row });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/publications/:id
const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid publication ID' });
    }
    const parsed = publicationSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const existing = await prisma.publications.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Publication not found' });
    const row = await prisma.publications.update({ where: { id }, data: parsed.data });
    res.json({ success: true, message: 'Publication updated successfully', data: row });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/publications/:id
const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid publication ID' });
    }
    const existing = await prisma.publications.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Publication not found' });
    await prisma.publications.delete({ where: { id } });
    res.json({ success: true, message: 'Publication deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
