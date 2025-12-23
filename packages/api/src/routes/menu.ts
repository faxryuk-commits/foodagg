import { Router } from 'express';
import { prisma } from '@food-platform/database';
import {
  createMenuCategorySchema,
  updateMenuCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
} from '@food-platform/shared';
import { asyncHandler, AppError } from '../middleware/error';
import { authenticate, requireMerchantAccess } from '../middleware/auth';

const router = Router();

// All routes require authentication and merchant access
router.use(authenticate);
router.use(requireMerchantAccess);

// ==================== Categories ====================

// Get all categories
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await prisma.menuCategory.findMany({
      where: { merchantId: req.merchantId! },
      orderBy: { position: 'asc' },
      include: {
        _count: { select: { items: true } },
      },
    });
    
    res.json({
      success: true,
      data: categories,
    });
  })
);

// Create category
router.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const data = createMenuCategorySchema.parse(req.body);
    
    // Get next position
    const lastCategory = await prisma.menuCategory.findFirst({
      where: { merchantId: req.merchantId! },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    
    const category = await prisma.menuCategory.create({
      data: {
        ...data,
        merchantId: req.merchantId!,
        position: data.position ?? (lastCategory?.position ?? 0) + 1,
      },
    });
    
    res.status(201).json({
      success: true,
      data: category,
    });
  })
);

// Update category
router.patch(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = updateMenuCategorySchema.parse(req.body);
    
    // Verify ownership
    const existing = await prisma.menuCategory.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Category not found');
    }
    
    const category = await prisma.menuCategory.update({
      where: { id },
      data,
    });
    
    res.json({
      success: true,
      data: category,
    });
  })
);

// Delete category
router.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Verify ownership
    const existing = await prisma.menuCategory.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Category not found');
    }
    
    // Delete category (items will have categoryId set to null)
    await prisma.menuCategory.delete({ where: { id } });
    
    res.json({
      success: true,
      data: { message: 'Category deleted' },
    });
  })
);

// Reorder categories
router.post(
  '/categories/reorder',
  asyncHandler(async (req, res) => {
    const { categoryIds } = req.body as { categoryIds: string[] };
    
    if (!Array.isArray(categoryIds)) {
      throw new AppError(400, 'INVALID_INPUT', 'categoryIds must be an array');
    }
    
    // Update positions
    await Promise.all(
      categoryIds.map((id, index) =>
        prisma.menuCategory.updateMany({
          where: { id, merchantId: req.merchantId! },
          data: { position: index },
        })
      )
    );
    
    res.json({
      success: true,
      data: { message: 'Categories reordered' },
    });
  })
);

// ==================== Items ====================

// Get all items
router.get(
  '/items',
  asyncHandler(async (req, res) => {
    const categoryId = req.query.categoryId as string | undefined;
    
    const items = await prisma.menuItem.findMany({
      where: {
        merchantId: req.merchantId!,
        ...(categoryId && { categoryId }),
      },
      orderBy: { position: 'asc' },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
    
    res.json({
      success: true,
      data: items,
    });
  })
);

// Create item
router.post(
  '/items',
  asyncHandler(async (req, res) => {
    const data = createMenuItemSchema.parse(req.body);
    
    // Verify category ownership if provided
    if (data.categoryId) {
      const category = await prisma.menuCategory.findFirst({
        where: { id: data.categoryId, merchantId: req.merchantId! },
      });
      
      if (!category) {
        throw new AppError(404, 'NOT_FOUND', 'Category not found');
      }
    }
    
    // Get next position
    const lastItem = await prisma.menuItem.findFirst({
      where: { merchantId: req.merchantId!, categoryId: data.categoryId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    
    const item = await prisma.menuItem.create({
      data: {
        ...data,
        merchantId: req.merchantId!,
        position: data.position ?? (lastItem?.position ?? 0) + 1,
        options: data.options as never,
      },
    });
    
    res.status(201).json({
      success: true,
      data: item,
    });
  })
);

// Get item by ID
router.get(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const item = await prisma.menuItem.findFirst({
      where: { id, merchantId: req.merchantId! },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
    
    if (!item) {
      throw new AppError(404, 'NOT_FOUND', 'Item not found');
    }
    
    res.json({
      success: true,
      data: item,
    });
  })
);

// Update item
router.patch(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = updateMenuItemSchema.parse(req.body);
    
    // Verify ownership
    const existing = await prisma.menuItem.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Item not found');
    }
    
    // Verify category ownership if changing
    if (data.categoryId) {
      const category = await prisma.menuCategory.findFirst({
        where: { id: data.categoryId, merchantId: req.merchantId! },
      });
      
      if (!category) {
        throw new AppError(404, 'NOT_FOUND', 'Category not found');
      }
    }
    
    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        ...data,
        options: data.options as never,
      },
    });
    
    res.json({
      success: true,
      data: item,
    });
  })
);

// Delete item
router.delete(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Verify ownership
    const existing = await prisma.menuItem.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Item not found');
    }
    
    await prisma.menuItem.delete({ where: { id } });
    
    res.json({
      success: true,
      data: { message: 'Item deleted' },
    });
  })
);

// Toggle item availability
router.patch(
  '/items/:id/availability',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isAvailable } = req.body;
    
    // Verify ownership
    const existing = await prisma.menuItem.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Item not found');
    }
    
    const item = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: isAvailable ?? !existing.isAvailable },
    });
    
    res.json({
      success: true,
      data: item,
    });
  })
);

// Bulk update availability
router.patch(
  '/items/bulk/availability',
  asyncHandler(async (req, res) => {
    const { itemIds, isAvailable } = req.body as {
      itemIds: string[];
      isAvailable: boolean;
    };
    
    if (!Array.isArray(itemIds)) {
      throw new AppError(400, 'INVALID_INPUT', 'itemIds must be an array');
    }
    
    await prisma.menuItem.updateMany({
      where: { id: { in: itemIds }, merchantId: req.merchantId! },
      data: { isAvailable },
    });
    
    res.json({
      success: true,
      data: { message: 'Items updated' },
    });
  })
);

// Reorder items
router.post(
  '/items/reorder',
  asyncHandler(async (req, res) => {
    const { itemIds } = req.body as { itemIds: string[] };
    
    if (!Array.isArray(itemIds)) {
      throw new AppError(400, 'INVALID_INPUT', 'itemIds must be an array');
    }
    
    // Update positions
    await Promise.all(
      itemIds.map((id, index) =>
        prisma.menuItem.updateMany({
          where: { id, merchantId: req.merchantId! },
          data: { position: index },
        })
      )
    );
    
    res.json({
      success: true,
      data: { message: 'Items reordered' },
    });
  })
);

export { router as menuRouter };

