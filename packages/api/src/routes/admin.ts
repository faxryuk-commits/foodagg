import { Router } from 'express';
import { prisma } from '@food-platform/database';
import {
  approveMerchantSchema,
  rejectMerchantSchema,
  merchantActionSchema,
  resolveConflictSchema,
  createScrapingSourceSchema,
  updateScrapingSourceSchema,
  paginationSchema,
} from '@food-platform/shared';
import { asyncHandler, AppError } from '../middleware/error';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require admin access
router.use(authenticate);
router.use(requireAdmin);

// ==================== Merchant Management ====================

// Get pending merchants
router.get(
  '/merchants/pending',
  asyncHandler(async (req, res) => {
    const { page, pageSize } = paginationSchema.parse(req.query);
    
    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.merchant.count({ where: { status: 'PENDING' } }),
    ]);
    
    res.json({
      success: true,
      data: {
        items: merchants,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  })
);

// Get all merchants
router.get(
  '/merchants',
  asyncHandler(async (req, res) => {
    const { page, pageSize } = paginationSchema.parse(req.query);
    const status = req.query.status as string | undefined;
    
    const where = {
      ...(status && { status: status as never }),
    };
    
    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.merchant.count({ where }),
    ]);
    
    res.json({
      success: true,
      data: {
        items: merchants,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  })
);

// Approve merchant
router.post(
  '/merchants/:id/approve',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = approveMerchantSchema.parse(req.body);
    
    const merchant = await prisma.merchant.findUnique({ where: { id } });
    
    if (!merchant) {
      throw new AppError(404, 'NOT_FOUND', 'Merchant not found');
    }
    
    if (merchant.status !== 'PENDING') {
      throw new AppError(400, 'INVALID_STATUS', 'Merchant is not pending');
    }
    
    const updatedMerchant = await prisma.merchant.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
        ...(data.commissionRate && { commissionRate: data.commissionRate }),
        ...(data.cashbackRate && { cashbackRate: data.cashbackRate }),
      },
    });
    
    // Log action
    await prisma.adminAction.create({
      data: {
        adminId: req.user!.id,
        action: 'approve_merchant',
        targetType: 'merchant',
        targetId: id,
        metadata: data as never,
      },
    });
    
    res.json({
      success: true,
      data: updatedMerchant,
    });
  })
);

// Reject merchant
router.post(
  '/merchants/:id/reject',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = rejectMerchantSchema.parse(req.body);
    
    const merchant = await prisma.merchant.findUnique({ where: { id } });
    
    if (!merchant) {
      throw new AppError(404, 'NOT_FOUND', 'Merchant not found');
    }
    
    if (merchant.status !== 'PENDING') {
      throw new AppError(400, 'INVALID_STATUS', 'Merchant is not pending');
    }
    
    const updatedMerchant = await prisma.merchant.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
    
    // Log action
    await prisma.adminAction.create({
      data: {
        adminId: req.user!.id,
        action: 'reject_merchant',
        targetType: 'merchant',
        targetId: id,
        reason,
      },
    });
    
    res.json({
      success: true,
      data: updatedMerchant,
    });
  })
);

// Merchant action (warn, suspend, etc.)
router.post(
  '/merchants/:id/action',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action, reason } = merchantActionSchema.parse(req.body);
    
    const merchant = await prisma.merchant.findUnique({ where: { id } });
    
    if (!merchant) {
      throw new AppError(404, 'NOT_FOUND', 'Merchant not found');
    }
    
    let status = merchant.status;
    if (action === 'suspend') status = 'SUSPENDED';
    if (action === 'unsuspend') status = 'ACTIVE';
    if (action === 'close') status = 'CLOSED';
    
    const updatedMerchant = await prisma.merchant.update({
      where: { id },
      data: { status },
    });
    
    // Log action
    await prisma.adminAction.create({
      data: {
        adminId: req.user!.id,
        action: `merchant_${action}`,
        targetType: 'merchant',
        targetId: id,
        reason,
      },
    });
    
    res.json({
      success: true,
      data: updatedMerchant,
    });
  })
);

// ==================== Quality Control ====================

// Get SLA metrics
router.get(
  '/quality/sla',
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const metrics = await prisma.sLAMetric.findMany({
      where: { date: { gte: startDate } },
      include: {
        merchant: {
          select: { id: true, name: true, logo: true },
        },
      },
      orderBy: [{ date: 'desc' }, { slaBreached: 'desc' }],
    });
    
    // Aggregate by merchant
    const byMerchant: Record<string, {
      merchant: typeof metrics[0]['merchant'];
      totalOrders: number;
      slaBreached: number;
      cancelled: number;
      avgRating: number;
      ratingCount: number;
    }> = {};
    
    for (const m of metrics) {
      if (!byMerchant[m.merchantId]) {
        byMerchant[m.merchantId] = {
          merchant: m.merchant,
          totalOrders: 0,
          slaBreached: 0,
          cancelled: 0,
          avgRating: 0,
          ratingCount: 0,
        };
      }
      byMerchant[m.merchantId].totalOrders += m.totalOrders;
      byMerchant[m.merchantId].slaBreached += m.slaBreached;
      byMerchant[m.merchantId].cancelled += m.cancelled;
      if (m.avgRating) {
        byMerchant[m.merchantId].avgRating += m.avgRating * m.reviewCount;
        byMerchant[m.merchantId].ratingCount += m.reviewCount;
      }
    }
    
    // Calculate averages
    const result = Object.values(byMerchant).map((m) => ({
      ...m,
      avgRating: m.ratingCount > 0 ? m.avgRating / m.ratingCount : null,
      slaRate: m.totalOrders > 0 
        ? (m.totalOrders - m.slaBreached) / m.totalOrders * 100 
        : 100,
    }));
    
    // Sort by SLA breach count (worst first)
    result.sort((a, b) => b.slaBreached - a.slaBreached);
    
    res.json({
      success: true,
      data: result,
    });
  })
);

// Get top cancellations
router.get(
  '/quality/cancellations',
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const cancellations = await prisma.order.groupBy({
      by: ['merchantId', 'cancelledBy', 'cancelReason'],
      where: {
        status: 'CANCELLED',
        cancelledAt: { gte: startDate },
      },
      _count: { id: true },
    });
    
    // Get merchant details
    const merchantIds = [...new Set(cancellations.map((c) => c.merchantId))];
    const merchants = await prisma.merchant.findMany({
      where: { id: { in: merchantIds } },
      select: { id: true, name: true, logo: true },
    });
    
    const merchantMap = Object.fromEntries(merchants.map((m) => [m.id, m]));
    
    // Aggregate by merchant
    const byMerchant: Record<string, {
      merchant: typeof merchants[0] | undefined;
      total: number;
      byUser: number;
      byMerchant: number;
      reasons: Record<string, number>;
    }> = {};
    
    for (const c of cancellations) {
      if (!byMerchant[c.merchantId]) {
        byMerchant[c.merchantId] = {
          merchant: merchantMap[c.merchantId],
          total: 0,
          byUser: 0,
          byMerchant: 0,
          reasons: {},
        };
      }
      byMerchant[c.merchantId].total += c._count.id;
      if (c.cancelledBy === 'user') byMerchant[c.merchantId].byUser += c._count.id;
      if (c.cancelledBy === 'merchant') byMerchant[c.merchantId].byMerchant += c._count.id;
      if (c.cancelReason) {
        byMerchant[c.merchantId].reasons[c.cancelReason] = 
          (byMerchant[c.merchantId].reasons[c.cancelReason] || 0) + c._count.id;
      }
    }
    
    const result = Object.values(byMerchant);
    result.sort((a, b) => b.total - a.total);
    
    res.json({
      success: true,
      data: result,
    });
  })
);

// ==================== Scraping Management ====================

// Get scraping sources
router.get(
  '/scraping/sources',
  asyncHandler(async (req, res) => {
    const sources = await prisma.scrapingSource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    res.json({
      success: true,
      data: sources,
    });
  })
);

// Create scraping source
router.post(
  '/scraping/sources',
  asyncHandler(async (req, res) => {
    const data = createScrapingSourceSchema.parse(req.body);
    
    const source = await prisma.scrapingSource.create({
      data: {
        name: data.name,
        type: data.type,
        config: data.config as never,
        apifyActorId: data.apifyActorId,
      },
    });
    
    res.status(201).json({
      success: true,
      data: source,
    });
  })
);

// Update scraping source
router.patch(
  '/scraping/sources/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = updateScrapingSourceSchema.parse(req.body);
    
    const source = await prisma.scrapingSource.update({
      where: { id },
      data: {
        ...data,
        config: data.config as never,
      },
    });
    
    res.json({
      success: true,
      data: source,
    });
  })
);

// Get scraping conflicts
router.get(
  '/scraping/conflicts',
  asyncHandler(async (req, res) => {
    const { page, pageSize } = paginationSchema.parse(req.query);
    
    const [conflicts, total] = await Promise.all([
      prisma.scrapingResult.findMany({
        where: { conflictStatus: 'PENDING' },
        include: {
          source: {
            select: { name: true, type: true },
          },
          merchant: {
            select: { id: true, name: true, address: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.scrapingResult.count({ where: { conflictStatus: 'PENDING' } }),
    ]);
    
    res.json({
      success: true,
      data: {
        items: conflicts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  })
);

// Resolve conflict
router.post(
  '/scraping/conflicts/:id/resolve',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { resolution, mergeData } = resolveConflictSchema.parse(req.body);
    
    const conflict = await prisma.scrapingResult.findUnique({ where: { id } });
    
    if (!conflict) {
      throw new AppError(404, 'NOT_FOUND', 'Conflict not found');
    }
    
    let updatedConflict;
    
    if (resolution === 'accept') {
      // Create or update merchant from scraped data
      const normalizedData = conflict.normalizedData as Record<string, unknown>;
      
      if (conflict.matchedMerchantId) {
        // Update existing merchant
        await prisma.merchant.update({
          where: { id: conflict.matchedMerchantId },
          data: {
            name: normalizedData.name as string,
            address: normalizedData.address as string,
            phone: normalizedData.phone as string,
            // ... other fields
          },
        });
      } else {
        // Create new merchant
        // ... implementation
      }
      
      updatedConflict = await prisma.scrapingResult.update({
        where: { id },
        data: {
          conflictStatus: 'RESOLVED',
          resolvedBy: req.user!.id,
          resolvedAt: new Date(),
        },
      });
    } else if (resolution === 'reject') {
      updatedConflict = await prisma.scrapingResult.update({
        where: { id },
        data: {
          conflictStatus: 'IGNORED',
          resolvedBy: req.user!.id,
          resolvedAt: new Date(),
        },
      });
    } else {
      // Merge
      updatedConflict = await prisma.scrapingResult.update({
        where: { id },
        data: {
          conflictStatus: 'RESOLVED',
          resolvedBy: req.user!.id,
          resolvedAt: new Date(),
          normalizedData: mergeData as never,
        },
      });
    }
    
    // Log action
    await prisma.adminAction.create({
      data: {
        adminId: req.user!.id,
        action: 'resolve_conflict',
        targetType: 'scraping',
        targetId: id,
        metadata: { resolution, mergeData } as never,
      },
    });
    
    res.json({
      success: true,
      data: updatedConflict,
    });
  })
);

// ==================== Analytics ====================

// Get dashboard stats
router.get(
  '/stats/dashboard',
  asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalMerchants,
      activeMerchants,
      pendingMerchants,
      totalOrders,
      todayOrders,
      totalUsers,
      activeOrders,
      pendingConflicts,
    ] = await Promise.all([
      prisma.merchant.count(),
      prisma.merchant.count({ where: { status: 'ACTIVE' } }),
      prisma.merchant.count({ where: { status: 'PENDING' } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count(),
      prisma.order.count({
        where: { status: { in: ['SUBMITTED', 'ACCEPTED', 'PREPARING', 'READY'] } },
      }),
      prisma.scrapingResult.count({ where: { conflictStatus: 'PENDING' } }),
    ]);
    
    res.json({
      success: true,
      data: {
        merchants: {
          total: totalMerchants,
          active: activeMerchants,
          pending: pendingMerchants,
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
          active: activeOrders,
        },
        users: {
          total: totalUsers,
        },
        scraping: {
          pendingConflicts,
        },
      },
    });
  })
);

export { router as adminRouter };

