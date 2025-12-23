import { Router } from 'express';
import { prisma } from '@food-platform/database';
import { updateOrderStatusSchema, paginationSchema } from '@food-platform/shared';
import { asyncHandler, AppError } from '../middleware/error';
import { authenticate, requireMerchantAccess } from '../middleware/auth';

const router = Router();

// All routes require authentication and merchant access
router.use(authenticate);
router.use(requireMerchantAccess);

// Get merchant's orders
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, pageSize } = paginationSchema.parse(req.query);
    const status = req.query.status as string | undefined;
    
    const where = {
      merchantId: req.merchantId!,
      ...(status && { status: status as never }),
    };
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, phone: true },
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

// Get pending orders (new)
router.get(
  '/pending',
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: {
        merchantId: req.merchantId!,
        status: 'SUBMITTED',
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    
    res.json({
      success: true,
      data: orders,
    });
  })
);

// Get active orders (in progress)
router.get(
  '/active',
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: {
        merchantId: req.merchantId!,
        status: { in: ['ACCEPTED', 'PREPARING', 'READY'] },
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    
    res.json({
      success: true,
      data: orders,
    });
  })
);

// Get order by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const order = await prisma.order.findFirst({
      where: { id, merchantId: req.merchantId! },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
        items: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    
    res.json({
      success: true,
      data: order,
    });
  })
);

// Accept order
router.post(
  '/:id/accept',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const order = await prisma.order.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    
    if (order.status !== 'SUBMITTED') {
      throw new AppError(400, 'INVALID_STATUS', 'Order cannot be accepted');
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        timeline: {
          create: {
            status: 'ACCEPTED',
            actor: 'merchant',
          },
        },
      },
      include: {
        items: true,
        timeline: true,
      },
    });
    
    // Emit socket event to user
    const io = req.app.get('io');
    io.to(`order:${id}`).emit('order:updated', {
      orderId: id,
      status: 'ACCEPTED',
      timestamp: new Date(),
    });
    
    res.json({
      success: true,
      data: updatedOrder,
    });
  })
);

// Reject order
router.post(
  '/:id/reject',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    const order = await prisma.order.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    
    if (order.status !== 'SUBMITTED') {
      throw new AppError(400, 'INVALID_STATUS', 'Order cannot be rejected');
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason || 'Rejected by merchant',
        cancelledBy: 'merchant',
        timeline: {
          create: {
            status: 'CANCELLED',
            note: reason,
            actor: 'merchant',
          },
        },
      },
      include: {
        items: true,
        timeline: true,
      },
    });
    
    // Refund bonus if used
    if (order.bonusUsed > 0) {
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { bonusBalance: true },
      });
      
      await prisma.$transaction([
        prisma.user.update({
          where: { id: order.userId },
          data: { bonusBalance: { increment: order.bonusUsed } },
        }),
        prisma.bonusTransaction.create({
          data: {
            userId: order.userId,
            amount: order.bonusUsed,
            balance: (user?.bonusBalance || 0) + order.bonusUsed,
            type: 'refund',
            description: `Refund for rejected order ${order.orderNumber}`,
            orderId: order.id,
          },
        }),
      ]);
    }
    
    // Emit socket event to user
    const io = req.app.get('io');
    io.to(`order:${id}`).emit('order:updated', {
      orderId: id,
      status: 'CANCELLED',
      reason,
      timestamp: new Date(),
    });
    
    res.json({
      success: true,
      data: updatedOrder,
    });
  })
);

// Start preparing
router.post(
  '/:id/preparing',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const order = await prisma.order.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    
    if (order.status !== 'ACCEPTED') {
      throw new AppError(400, 'INVALID_STATUS', 'Order is not in accepted status');
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'PREPARING',
        preparingAt: new Date(),
        timeline: {
          create: {
            status: 'PREPARING',
            actor: 'merchant',
          },
        },
      },
      include: {
        items: true,
        timeline: true,
      },
    });
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`order:${id}`).emit('order:updated', {
      orderId: id,
      status: 'PREPARING',
      timestamp: new Date(),
    });
    
    res.json({
      success: true,
      data: updatedOrder,
    });
  })
);

// Mark as ready
router.post(
  '/:id/ready',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const order = await prisma.order.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    
    if (order.status !== 'ACCEPTED' && order.status !== 'PREPARING') {
      throw new AppError(400, 'INVALID_STATUS', 'Order cannot be marked as ready');
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'READY',
        readyAt: new Date(),
        timeline: {
          create: {
            status: 'READY',
            actor: 'merchant',
          },
        },
      },
      include: {
        items: true,
        timeline: true,
      },
    });
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`order:${id}`).emit('order:updated', {
      orderId: id,
      status: 'READY',
      timestamp: new Date(),
    });
    
    res.json({
      success: true,
      data: updatedOrder,
    });
  })
);

// Complete order (for pickup/dine-in)
router.post(
  '/:id/complete',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const order = await prisma.order.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    
    if (order.status !== 'READY') {
      throw new AppError(400, 'INVALID_STATUS', 'Order is not ready');
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        deliveredAt: new Date(),
        paymentStatus: 'PAID',
        timeline: {
          create: {
            status: 'COMPLETED',
            actor: 'merchant',
          },
        },
      },
      include: {
        items: true,
        timeline: true,
      },
    });
    
    // Add bonus to user
    if (order.bonusEarned > 0) {
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { bonusBalance: true },
      });
      
      await prisma.$transaction([
        prisma.user.update({
          where: { id: order.userId },
          data: { 
            bonusBalance: { increment: order.bonusEarned },
            totalOrders: { increment: 1 },
            totalSpent: { increment: order.total },
          },
        }),
        prisma.bonusTransaction.create({
          data: {
            userId: order.userId,
            amount: order.bonusEarned,
            balance: (user?.bonusBalance || 0) + order.bonusEarned,
            type: 'earned',
            description: `Cashback for order ${order.orderNumber}`,
            orderId: order.id,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          },
        }),
      ]);
    }
    
    // Update merchant stats
    await prisma.merchant.update({
      where: { id: order.merchantId },
      data: { orderCount: { increment: 1 } },
    });
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`order:${id}`).emit('order:updated', {
      orderId: id,
      status: 'COMPLETED',
      timestamp: new Date(),
    });
    
    res.json({
      success: true,
      data: updatedOrder,
    });
  })
);

// Update order status (generic)
router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, note } = updateOrderStatusSchema.parse(req.body);
    
    const order = await prisma.order.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        timeline: {
          create: {
            status,
            note,
            actor: 'merchant',
          },
        },
      },
      include: {
        items: true,
        timeline: true,
      },
    });
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`order:${id}`).emit('order:updated', {
      orderId: id,
      status,
      timestamp: new Date(),
    });
    
    res.json({
      success: true,
      data: updatedOrder,
    });
  })
);

export { router as merchantOrdersRouter };

