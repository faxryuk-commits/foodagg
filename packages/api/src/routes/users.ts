import { Router } from 'express';
import { prisma } from '@food-platform/database';
import { createAddressSchema, updateAddressSchema, paginationSchema } from '@food-platform/shared';
import { asyncHandler, AppError } from '../middleware/error';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Update current user
router.patch(
  '/me',
  asyncHandler(async (req, res) => {
    const { name, email, avatar, preferences } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(avatar && { avatar }),
        ...(preferences && { preferences }),
      },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        bonusBalance: true,
        preferences: true,
      },
    });
    
    res.json({
      success: true,
      data: user,
    });
  })
);

// Get user's orders
router.get(
  '/me/orders',
  asyncHandler(async (req, res) => {
    const { page, pageSize } = paginationSchema.parse(req.query);
    const status = req.query.status as string | undefined;
    
    const where = {
      userId: req.user!.id,
      ...(status && { status: status as never }),
    };
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
              logo: true,
              address: true,
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);
    
    res.json({
      success: true,
      data: {
        items: orders,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  })
);

// Get user's addresses
router.get(
  '/me/addresses',
  asyncHandler(async (req, res) => {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    
    res.json({
      success: true,
      data: addresses,
    });
  })
);

// Create address
router.post(
  '/me/addresses',
  asyncHandler(async (req, res) => {
    const data = createAddressSchema.parse(req.body);
    
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false },
      });
    }
    
    // If this is the first address, make it default
    const addressCount = await prisma.address.count({
      where: { userId: req.user!.id },
    });
    
    const address = await prisma.address.create({
      data: {
        ...data,
        userId: req.user!.id,
        isDefault: data.isDefault || addressCount === 0,
      },
    });
    
    res.status(201).json({
      success: true,
      data: address,
    });
  })
);

// Update address
router.patch(
  '/me/addresses/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = updateAddressSchema.parse(req.body);
    
    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });
    
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Address not found');
    }
    
    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, id: { not: id } },
        data: { isDefault: false },
      });
    }
    
    const address = await prisma.address.update({
      where: { id },
      data,
    });
    
    res.json({
      success: true,
      data: address,
    });
  })
);

// Delete address
router.delete(
  '/me/addresses/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });
    
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Address not found');
    }
    
    await prisma.address.delete({ where: { id } });
    
    // If deleted address was default, make another one default
    if (existing.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
      });
      
      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }
    
    res.json({
      success: true,
      data: { message: 'Address deleted' },
    });
  })
);

// Get user's bonus history
router.get(
  '/me/bonuses',
  asyncHandler(async (req, res) => {
    const { page, pageSize } = paginationSchema.parse(req.query);
    
    const [transactions, total] = await Promise.all([
      prisma.bonusTransaction.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.bonusTransaction.count({ where: { userId: req.user!.id } }),
    ]);
    
    // Get current balance
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { bonusBalance: true },
    });
    
    res.json({
      success: true,
      data: {
        balance: user?.bonusBalance || 0,
        items: transactions,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  })
);

export { router as usersRouter };

