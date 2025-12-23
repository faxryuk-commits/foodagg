import { Router } from 'express';
import { prisma } from '@food-platform/database';
import { searchMerchantsSchema, paginationSchema, calculateDistance } from '@food-platform/shared';
import { asyncHandler, AppError } from '../middleware/error';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Search merchants
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const filters = searchMerchantsSchema.parse(req.query);
    const { page = 1, pageSize = 20 } = paginationSchema.parse(req.query);
    
    // Build where clause
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    };
    
    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { cuisines: { has: filters.query.toLowerCase() } },
      ];
    }
    
    if (filters.categories?.length) {
      where.categories = { hasSome: filters.categories };
    }
    
    if (filters.cuisines?.length) {
      where.cuisines = { hasSome: filters.cuisines };
    }
    
    if (filters.tags?.length) {
      where.tags = { hasSome: filters.tags };
    }
    
    if (filters.minRating) {
      where.rating = { gte: filters.minRating };
    }
    
    if (filters.deliveryEnabled !== undefined) {
      where.deliveryEnabled = filters.deliveryEnabled;
    }
    
    if (filters.pickupEnabled !== undefined) {
      where.pickupEnabled = filters.pickupEnabled;
    }
    
    // Get merchants
    let merchants = await prisma.merchant.findMany({
      where: where as never,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        coverImage: true,
        address: true,
        city: true,
        lat: true,
        lng: true,
        status: true,
        isVerified: true,
        isBusy: true,
        busyMinutes: true,
        rating: true,
        reviewCount: true,
        orderCount: true,
        deliveryEnabled: true,
        pickupEnabled: true,
        minOrderAmount: true,
        deliveryFee: true,
        deliveryRadius: true,
        categories: true,
        cuisines: true,
        tags: true,
        cashbackRate: true,
        workingHours: true,
        slaReadyTime: true,
      },
    });
    
    // Type for merchant with distance
    type MerchantWithDistance = typeof merchants[0] & { distance?: number };
    let merchantsWithDistance: MerchantWithDistance[] = merchants;
    
    // Calculate distance if location provided
    if (filters.lat && filters.lng) {
      merchantsWithDistance = merchants
        .map((m) => ({
          ...m,
          distance: calculateDistance(filters.lat!, filters.lng!, m.lat, m.lng),
        }))
        .filter((m) => !filters.radius || m.distance <= filters.radius);
      
      // Sort by distance by default
      if (!filters.sortBy || filters.sortBy === 'distance') {
        merchantsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
    }
    
    // Sort
    if (filters.sortBy === 'rating') {
      merchantsWithDistance.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'popular') {
      merchantsWithDistance.sort((a, b) => b.orderCount - a.orderCount);
    }
    
    // Reassign for further processing
    merchants = merchantsWithDistance;
    
    // Paginate
    const total = merchants.length;
    const paginatedMerchants = merchants.slice((page - 1) * pageSize, page * pageSize);
    
    // Calculate estimated delivery time
    const merchantsWithETA = paginatedMerchants.map((m) => {
      const mWithDist = m as MerchantWithDistance;
      const distance = mWithDist.distance || 5;
      const baseTime = m.slaReadyTime || 30;
      const deliveryTime = Math.ceil(distance * 2);
      const busyTime = m.isBusy ? m.busyMinutes : 0;
      const estimatedDeliveryTime = Math.ceil((baseTime + deliveryTime + busyTime) / 5) * 5;
      
      return {
        ...m,
        estimatedDeliveryTime,
      };
    });
    
    res.json({
      success: true,
      data: {
        items: merchantsWithETA,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  })
);

// Get merchant by ID or slug
router.get(
  '/:idOrSlug',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    
    const merchant = await prisma.merchant.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        status: 'ACTIVE',
      },
      include: {
        menuCategories: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });
    
    if (!merchant) {
      throw new AppError(404, 'NOT_FOUND', 'Merchant not found');
    }
    
    res.json({
      success: true,
      data: merchant,
    });
  })
);

// Get merchant menu
router.get(
  '/:idOrSlug/menu',
  asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    
    const merchant = await prisma.merchant.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    
    if (!merchant) {
      throw new AppError(404, 'NOT_FOUND', 'Merchant not found');
    }
    
    const categories = await prisma.menuCategory.findMany({
      where: { merchantId: merchant.id, isActive: true },
      orderBy: { position: 'asc' },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { position: 'asc' },
        },
      },
    });
    
    // Also get popular items
    const popularItems = await prisma.menuItem.findMany({
      where: { merchantId: merchant.id, isPopular: true, isAvailable: true },
      orderBy: { position: 'asc' },
      take: 10,
    });
    
    res.json({
      success: true,
      data: {
        categories,
        popularItems,
      },
    });
  })
);

// Get merchant reviews
router.get(
  '/:idOrSlug/reviews',
  asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    const { page, pageSize } = paginationSchema.parse(req.query);
    
    const merchant = await prisma.merchant.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: { id: true, rating: true, reviewCount: true },
    });
    
    if (!merchant) {
      throw new AppError(404, 'NOT_FOUND', 'Merchant not found');
    }
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { merchantId: merchant.id, isVisible: true },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where: { merchantId: merchant.id, isVisible: true } }),
    ]);
    
    // Calculate rating distribution
    const distribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { merchantId: merchant.id, isVisible: true },
      _count: { rating: true },
    });
    
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    distribution.forEach((d) => {
      ratingDistribution[d.rating] = d._count.rating;
    });
    
    res.json({
      success: true,
      data: {
        averageRating: merchant.rating,
        totalReviews: merchant.reviewCount,
        ratingDistribution,
        items: reviews,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  })
);

export { router as merchantsRouter };

