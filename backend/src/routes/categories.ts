import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { auth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
});

// GET /categories - Fetch all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        podcasts: {
          select: { id: true },
        },
      },
    });

    res.json(
      categories.map((cat) => ({
        ...cat,
        podcastCount: cat.podcasts.length,
        podcasts: undefined,
      }))
    );
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /categories - Create new category
router.post('/', auth, async (req, res) => {
  try {
    const body = CreateCategorySchema.parse(req.body);

    // Check if category already exists
    const existing = await prisma.category.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        color: body.color || '#3b82f6',
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /categories/:id - Update category
router.put('/:id', auth, async (req, res) => {
  try {
    const body = CreateCategorySchema.parse(req.body);

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name: body.name,
        color: body.color,
      },
    });

    res.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /categories/:id - Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    // Remove category from all podcasts
    await prisma.podcast.updateMany({
      where: { categoryId: req.params.id },
      data: { categoryId: null },
    });

    // Delete category
    await prisma.category.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
