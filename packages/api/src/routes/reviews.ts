import { Router } from 'express';
import { prisma } from '@food-platform/database';
import { createReviewSchema, replyReviewSchema } from '@food-platform/shared';
import { asyncHandler, AppError } from '../middleware/error';
import { authenticate, requireMerchantAccess } from '../middleware/auth';

const router = Router();

// Create review (user)
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const data = createReviewSchema.parse(req.body);
    
    // Get order
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, userId: req.user!.id, status: 'COMPLETED' },
    });
    
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found or not completed');
    }
    
    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { orderId: data.orderId },
    });
    
    if (existingReview) {
      throw new AppError(409, 'REVIEW_EXISTS', 'Review already exists for this order');
    }
    
    // Create review
    const review = await prisma.review.create({
      data: {
        orderId: data.orderId,
        userId: req.user!.id,
        merchantId: order.merchantId,
        rating: data.rating,
        comment: data.comment,
        tags: data.tags || [],
      },
    });
    
    // Update merchant rating
    const merchantReviews = await prisma.review.aggregate({
      where: { merchantId: order.merchantId, isVisible: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
    
    await prisma.merchant.update({
      where: { id: order.merchantId },
      data: {
        rating: merchantReviews._avg.rating || 0,
        reviewCount: merchantReviews._count.rating,
      },
    });
    
    res.status(201).json({
      success: true,
      data: review,
    });
  })
);

// Reply to review (merchant)
router.post(
  '/:id/reply',
  authenticate,
  requireMerchantAccess,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reply } = replyReviewSchema.parse(req.body);
    
    // Verify ownership
    const review = await prisma.review.findFirst({
      where: { id, merchantId: req.merchantId! },
    });
    
    if (!review) {
      throw new AppError(404, 'NOT_FOUND', 'Review not found');
    }
    
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        reply,
        repliedAt: new Date(),
      },
    });
    
    res.json({
      success: true,
      data: updatedReview,
    });
  })
);

// Get merchant's reviews
router.get(
  '/merchant',
  authenticate,
  requireMerchantAccess,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;
    const hasReply = req.query.hasReply === 'true' ? true : req.query.hasReply === 'false' ? false : undefined;
    
    const where = {
      merchantId: req.merchantId!,
      ...(rating && { rating }),
      ...(hasReply !== undefined && { reply: hasReply ? { not: null } : null }),
    };
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
          order: {
            select: { orderNumber: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ]);
    
    // Get stats
    const stats = await prisma.review.groupBy({
      by: ['rating'],
      where: { merchantId: req.merchantId! },
      _count: { rating: true },
    });
    
    const avgRating = await prisma.review.aggregate({
      where: { merchantId: req.merchantId! },
      _avg: { rating: true },
    });
    
    res.json({
      success: true,
      data: {
        items: reviews,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        stats: {
          averageRating: avgRating._avg.rating || 0,
          distribution: Object.fromEntries(stats.map((s): [number, number] => [s.rating, s._count.rating])),
        },
      },
    });
  })
);

export { router as reviewsRouter };

