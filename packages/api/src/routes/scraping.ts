import { Router } from 'express';
import { prisma } from '@food-platform/database';
import { asyncHandler, AppError } from '../middleware/error';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  startScrapingRun,
  getRunStatus,
  getScrapedData,
  findPotentialMatches,
  ScrapingSourceType,
  ScrapedVenue,
} from '../services/apify';

const router = Router();

// All routes require admin access
router.use(authenticate);
router.use(requireAdmin);

// ==================== Scraping Sources ====================

// Get all scraping sources
router.get(
  '/sources',
  asyncHandler(async (req, res) => {
    const sources = await prisma.scrapingSource.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { results: true },
        },
      },
    });
    
    res.json({
      success: true,
      data: sources,
    });
  })
);

// Create scraping source
router.post(
  '/sources',
  asyncHandler(async (req, res) => {
    const { name, type, config, apifyActorId } = req.body;
    
    const source = await prisma.scrapingSource.create({
      data: {
        name,
        type,
        config: config || {},
        apifyActorId,
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
  '/sources/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, config, apifyActorId, status } = req.body;
    
    const source = await prisma.scrapingSource.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(config && { config }),
        ...(apifyActorId && { apifyActorId }),
        ...(status && { status }),
      },
    });
    
    res.json({
      success: true,
      data: source,
    });
  })
);

// Delete scraping source
router.delete(
  '/sources/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    await prisma.scrapingSource.delete({ where: { id } });
    
    res.json({
      success: true,
      data: { message: 'Source deleted' },
    });
  })
);

// ==================== Run Scraping ====================

// Start a scraping run
router.post(
  '/sources/:id/run',
  asyncHandler(async (req, res) => {
    res.status(501).json({
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Scraping run is disabled in this build' },
    });
  })
);

// Check run status and fetch results
router.get(
  '/tasks/:taskId/status',
  asyncHandler(async (req, res) => {
    res.status(501).json({
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Scraping status is disabled in this build' },
    });
  })
);

// Fetch and process scraped data
router.post(
  '/tasks/:taskId/process',
  asyncHandler(async (req, res) => {
    res.status(501).json({
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Scraping processing is disabled in this build' },
    });
  })
);

// ==================== Results & Conflicts ====================

// Get scraping results
router.get(
  '/results',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const status = req.query.status as string;
    const sourceId = req.query.sourceId as string;
    
    const where: Record<string, unknown> = {};
    if (status) where.conflictStatus = status;
    if (sourceId) where.sourceId = sourceId;
    
    const [results, total] = await Promise.all([
      prisma.scrapingResult.findMany({
        where,
        include: {
          source: { select: { name: true, type: true } },
          merchant: { select: { id: true, name: true, address: true, phone: true, rating: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.scrapingResult.count({ where }),
    ]);
    
    res.json({
      success: true,
      data: {
        items: results,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  })
);

// Get pending conflicts
router.get(
  '/conflicts',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    
    const [conflicts, total] = await Promise.all([
      prisma.scrapingResult.findMany({
        where: { conflictStatus: 'PENDING' },
        include: {
          source: { select: { name: true, type: true } },
          merchant: { select: { id: true, name: true, address: true, phone: true, rating: true } },
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
  '/results/:id/resolve',
  asyncHandler(async (req, res) => {
    res.status(501).json({
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Conflict resolution is disabled in this build' },
    });
  })
);

// ==================== Stats ====================

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [
      totalSources,
      activeSources,
      totalResults,
      pendingConflicts,
      recentTasks,
    ] = await Promise.all([
      prisma.scrapingSource.count(),
      prisma.scrapingSource.count({ where: { status: 'ACTIVE' } }),
      prisma.scrapingResult.count(),
      prisma.scrapingResult.count({ where: { conflictStatus: 'PENDING' } }),
      Promise.resolve([] as unknown[]),
    ]);
    
    // Get stats by source type
    const bySourceType = await prisma.scrapingResult.groupBy({
      by: ['sourceId'],
      _count: { id: true },
    });
    
    res.json({
      success: true,
      data: {
        totalSources,
        activeSources,
        totalResults,
        pendingConflicts,
        recentTasks,
        bySourceType,
      },
    });
  })
);

// Helper function
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\sа-яё-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50) + '-' + Date.now().toString(36);
}

export { router as scrapingRouter };

