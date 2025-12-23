import { Router } from 'express';
import { prisma } from '@food-platform/database';
import { 
  createOrderSchema, 
  cancelOrderSchema, 
  sendMessageSchema,
  generateOrderNumber,
  calculateOrderTotals,
  calculateSLADeadlines,
} from '@food-platform/shared';
import { asyncHandler, AppError } from '../middleware/error';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create order
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createOrderSchema.parse(req.body);
    
    // Get merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id: data.merchantId, status: 'ACTIVE' },
    });
    
    if (!merchant) {
      throw new AppError(404, 'NOT_FOUND', 'Merchant not found');
    }
    
    // Check if merchant is currently available
    if (merchant.isBusy && merchant.busyUntil && merchant.busyUntil > new Date()) {
      // Still accept, but add busy time to estimate
    }
    
    // Get address if delivery
    let deliveryAddress = null;
    if (data.type === 'DELIVERY') {
      if (!data.addressId) {
        throw new AppError(400, 'MISSING_ADDRESS', 'Delivery address is required');
      }
      
      const address = await prisma.address.findUnique({
        where: { id: data.addressId, userId: req.user!.id },
      });
      
      if (!address) {
        throw new AppError(404, 'NOT_FOUND', 'Address not found');
      }
      
      deliveryAddress = {
        street: address.street,
        building: address.building,
        apartment: address.apartment,
        entrance: address.entrance,
        floor: address.floor,
        city: address.city,
        lat: address.lat,
        lng: address.lng,
      };
    }
    
    // Get menu items and validate
    const menuItemIds = data.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, merchantId: merchant.id, isAvailable: true },
    });
    
    if (menuItems.length !== menuItemIds.length) {
      throw new AppError(400, 'INVALID_ITEMS', 'Some items are not available');
    }
    
    // Calculate totals
    const itemsWithPrices = data.items.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
      return {
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.discountPrice || menuItem.price,
        quantity: item.quantity,
        options: item.options || null,
        comment: item.comment || null,
        subtotal: (menuItem.discountPrice || menuItem.price) * item.quantity,
      };
    });
    
    // Get user's bonus balance
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { bonusBalance: true },
    });
    
    const bonusToUse = Math.min(data.bonusToUse || 0, user?.bonusBalance || 0);
    
    const totals = calculateOrderTotals(
      itemsWithPrices,
      data.type === 'DELIVERY' ? merchant.deliveryFee : 0,
      0, // Service fee percent (can be configured)
      bonusToUse,
      merchant.cashbackRate
    );
    
    // Check minimum order
    if (totals.subtotal < merchant.minOrderAmount) {
      throw new AppError(
        400, 
        'MIN_ORDER_NOT_MET', 
        `Minimum order amount is ${merchant.minOrderAmount}`
      );
    }
    
    // Calculate SLA deadlines
    const now = new Date();
    const { acceptDeadline, readyDeadline } = calculateSLADeadlines(
      now,
      merchant.slaAcceptTime,
      merchant.slaReadyTime
    );
    
    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user!.id,
        merchantId: merchant.id,
        addressId: data.addressId,
        type: data.type,
        status: 'SUBMITTED',
        subtotal: totals.subtotal,
        deliveryFee: data.type === 'DELIVERY' ? merchant.deliveryFee : 0,
        serviceFee: totals.serviceFee,
        discount: totals.discount,
        bonusUsed: totals.bonusUsed,
        bonusEarned: totals.bonusEarned,
        total: totals.total,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === 'CASH' ? 'PENDING' : 'PENDING',
        deliveryAddress: deliveryAddress as never,
        estimatedTime: merchant.slaReadyTime + (merchant.isBusy ? merchant.busyMinutes : 0),
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        comment: data.comment,
        slaAcceptDeadline: acceptDeadline,
        slaReadyDeadline: readyDeadline,
        items: {
          create: itemsWithPrices,
        },
        timeline: {
          create: {
            status: 'SUBMITTED',
            actor: 'user',
          },
        },
      },
      include: {
        items: true,
        merchant: {
          select: {
            id: true,
            name: true,
            logo: true,
            phone: true,
          },
        },
        timeline: true,
      },
    });
    
    // Deduct bonus if used
    if (totals.bonusUsed > 0) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: req.user!.id },
          data: { bonusBalance: { decrement: totals.bonusUsed } },
        }),
        prisma.bonusTransaction.create({
          data: {
            userId: req.user!.id,
            amount: -totals.bonusUsed,
            balance: (user?.bonusBalance || 0) - totals.bonusUsed,
            type: 'spent',
            description: `Order ${order.orderNumber}`,
            orderId: order.id,
          },
        }),
      ]);
    }
    
    // Emit socket event to merchant
    const io = req.app.get('io');
    io.to(`merchant:${merchant.id}`).emit('order:new', { order });
    
    res.status(201).json({
      success: true,
      data: order,
    });
  })
);

// Get order by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const order = await prisma.order.findFirst({
      where: { id, userId: req.user!.id },
      include: {
        items: true,
        merchant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            phone: true,
            address: true,
          },
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        review: true,
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

// Cancel order
router.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = cancelOrderSchema.parse(req.body);
    
    const order = await prisma.order.findFirst({
      where: { id, userId: req.user!.id },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    
    // Can only cancel if SUBMITTED
    if (order.status !== 'SUBMITTED') {
      throw new AppError(400, 'CANNOT_CANCEL', 'Order cannot be cancelled at this stage');
    }
    
    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason,
        cancelledBy: 'user',
        timeline: {
          create: {
            status: 'CANCELLED',
            note: reason,
            actor: 'user',
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
        where: { id: req.user!.id },
        select: { bonusBalance: true },
      });
      
      await prisma.$transaction([
        prisma.user.update({
          where: { id: req.user!.id },
          data: { bonusBalance: { increment: order.bonusUsed } },
        }),
        prisma.bonusTransaction.create({
          data: {
            userId: req.user!.id,
            amount: order.bonusUsed,
            balance: (user?.bonusBalance || 0) + order.bonusUsed,
            type: 'refund',
            description: `Refund for cancelled order ${order.orderNumber}`,
            orderId: order.id,
          },
        }),
      ]);
    }
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`merchant:${order.merchantId}`).emit('order:updated', {
      orderId: id,
      status: 'CANCELLED',
    });
    
    res.json({
      success: true,
      data: updatedOrder,
    });
  })
);

// Send message
router.post(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { message } = sendMessageSchema.parse(req.body);
    
    const order = await prisma.order.findFirst({
      where: { id, userId: req.user!.id },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    
    const newMessage = await prisma.orderMessage.create({
      data: {
        orderId: id,
        senderId: req.user!.id,
        senderType: 'user',
        message,
      },
    });
    
    // Emit socket event to merchant
    const io = req.app.get('io');
    io.to(`merchant:${order.merchantId}`).emit('message:new', {
      orderId: id,
      message: newMessage,
    });
    
    res.status(201).json({
      success: true,
      data: newMessage,
    });
  })
);

// Get order timeline
router.get(
  '/:id/timeline',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const order = await prisma.order.findFirst({
      where: { id, userId: req.user!.id },
      select: { id: true },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    
    const timeline = await prisma.orderTimeline.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'asc' },
    });
    
    res.json({
      success: true,
      data: timeline,
    });
  })
);

export { router as ordersRouter };

