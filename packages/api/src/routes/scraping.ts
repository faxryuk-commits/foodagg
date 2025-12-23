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
    const { name, type, config, apifyActorId, schedule } = req.body;
    
    const source = await prisma.scrapingSource.create({
      data: {
        name,
        type,
        config: config || {},
        apifyActorId,
        schedule,
        isActive: true,
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
    const { name, config, apifyActorId, schedule, isActive } = req.body;
    
    const source = await prisma.scrapingSource.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(config && { config }),
        ...(apifyActorId && { apifyActorId }),
        ...(schedule !== undefined && { schedule }),
        ...(isActive !== undefined && { isActive }),
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
    const { id } = req.params;
    
    const source = await prisma.scrapingSource.findUnique({ where: { id } });
    
    if (!source) {
      throw new AppError(404, 'NOT_FOUND', 'Scraping source not found');
    }
    
    // Start the Apify run
    const config = source.config as { city: string; category: string; radius?: number };
    const result = await startScrapingRun(
      source.type as ScrapingSourceType,
      config
    );
    
    // Create scraping task record
    const task = await prisma.scrapingTask.create({
      data: {
        sourceId: source.id,
        apifyRunId: result.runId,
        status: 'RUNNING',
      },
    });
    
    // Update source last run
    await prisma.scrapingSource.update({
      where: { id },
      data: { lastRunAt: new Date() },
    });
    
    res.json({
      success: true,
      data: {
        taskId: task.id,
        runId: result.runId,
        status: result.status,
      },
    });
  })
);

// Check run status and fetch results
router.get(
  '/tasks/:taskId/status',
  asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    
    const task = await prisma.scrapingTask.findUnique({
      where: { id: taskId },
      include: { source: true },
    });
    
    if (!task) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }
    
    // Get status from Apify
    const status = await getRunStatus(task.apifyRunId);
    
    // Update task status
    await prisma.scrapingTask.update({
      where: { id: taskId },
      data: {
        status: status.status,
        itemCount: status.itemCount,
      },
    });
    
    res.json({
      success: true,
      data: {
        taskId,
        status: status.status,
        itemCount: status.itemCount,
        datasetId: status.datasetId,
      },
    });
  })
);

// Fetch and process scraped data
router.post(
  '/tasks/:taskId/process',
  asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    
    const task = await prisma.scrapingTask.findUnique({
      where: { id: taskId },
      include: { source: true },
    });
    
    if (!task) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }
    
    // Get run status to get dataset ID
    const status = await getRunStatus(task.apifyRunId);
    
    if (status.status !== 'SUCCEEDED') {
      throw new AppError(400, 'NOT_READY', 'Scraping run not completed');
    }
    
    if (!status.datasetId) {
      throw new AppError(500, 'NO_DATA', 'No dataset found');
    }
    
    // Fetch scraped data
    const venues = await getScrapedData(
      status.datasetId,
      task.source.type as ScrapingSourceType
    );
    
    // Get existing merchants for conflict detection
    const existingMerchants = await prisma.merchant.findMany({
      select: { id: true, name: true, address: true, lat: true, lng: true },
    });
    
    // Process each venue
    let newCount = 0;
    let conflictCount = 0;
    let duplicateCount = 0;
    
    for (const venue of venues) {
      // Check if already scraped
      const existing = await prisma.scrapingResult.findFirst({
        where: {
          externalId: venue.externalId,
          source: { type: venue.source },
        },
      });
      
      if (existing) {
        duplicateCount++;
        continue;
      }
      
      // Find potential matches
      const matches = await findPotentialMatches(venue, existingMerchants);
      
      const hasConflict = matches.length > 0 && matches[0].similarity > 70;
      
      // Create scraping result
      await prisma.scrapingResult.create({
        data: {
          sourceId: task.source.id,
          externalId: venue.externalId,
          rawData: venue.rawData as any,
          normalizedData: {
            name: venue.name,
            address: venue.address,
            city: venue.city,
            lat: venue.lat,
            lng: venue.lng,
            phone: venue.phone,
            website: venue.website,
            rating: venue.rating,
            reviewCount: venue.reviewCount,
            categories: venue.categories,
            workingHours: venue.workingHours,
            photos: venue.photos,
          },
          conflictStatus: hasConflict ? 'PENDING' : 'NONE',
          matchedMerchantId: hasConflict ? matches[0].merchantId : null,
          matchConfidence: hasConflict ? matches[0].similarity : null,
        },
      });
      
      if (hasConflict) {
        conflictCount++;
      } else {
        newCount++;
      }
    }
    
    // Update task
    await prisma.scrapingTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        itemCount: venues.length,
        completedAt: new Date(),
      },
    });
    
    res.json({
      success: true,
      data: {
        total: venues.length,
        new: newCount,
        conflicts: conflictCount,
        duplicates: duplicateCount,
      },
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
          matchedMerchant: { select: { id: true, name: true, address: true } },
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
          matchedMerchant: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              rating: true,
            },
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
  '/results/:id/resolve',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action, mergeData } = req.body;
    // action: 'accept' | 'reject' | 'merge' | 'create_new'
    
    const result = await prisma.scrapingResult.findUnique({
      where: { id },
      include: { source: true, matchedMerchant: true },
    });
    
    if (!result) {
      throw new AppError(404, 'NOT_FOUND', 'Result not found');
    }
    
    const normalizedData = result.normalizedData as Record<string, unknown>;
    
    switch (action) {
      case 'accept':
        // Update existing merchant with scraped data
        if (result.matchedMerchantId) {
          await prisma.merchant.update({
            where: { id: result.matchedMerchantId },
            data: {
              name: String(normalizedData.name || ''),
              address: String(normalizedData.address || ''),
              phone: String(normalizedData.phone || ''),
              website: String(normalizedData.website || ''),
              rating: Number(normalizedData.rating || 0),
              workingHours: normalizedData.workingHours as any,
            },
          });
        }
        break;
        
      case 'merge':
        // Merge with custom data
        if (result.matchedMerchantId && mergeData) {
          await prisma.merchant.update({
            where: { id: result.matchedMerchantId },
            data: mergeData,
          });
        }
        break;
        
      case 'create_new':
        // Create new merchant from scraped data
        await prisma.merchant.create({
          data: {
            name: String(normalizedData.name || ''),
            slug: generateSlug(String(normalizedData.name || '')),
            address: String(normalizedData.address || ''),
            city: String(normalizedData.city || ''),
            lat: Number(normalizedData.lat || 0),
            lng: Number(normalizedData.lng || 0),
            phone: String(normalizedData.phone || ''),
            website: String(normalizedData.website || ''),
            rating: Number(normalizedData.rating || 0),
            reviewCount: Number(normalizedData.reviewCount || 0),
            workingHours: normalizedData.workingHours as any,
            status: 'PENDING', // Needs approval
            scrapedFromSource: result.source.type,
            scrapedExternalId: result.externalId,
          },
        });
        break;
        
      case 'reject':
        // Just mark as ignored
        break;
    }
    
    // Update result status
    await prisma.scrapingResult.update({
      where: { id },
      data: {
        conflictStatus: action === 'reject' ? 'IGNORED' : 'RESOLVED',
        resolvedBy: req.user!.id,
        resolvedAt: new Date(),
      },
    });
    
    res.json({
      success: true,
      data: { message: `Conflict resolved: ${action}` },
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
      prisma.scrapingSource.count({ where: { isActive: true } }),
      prisma.scrapingResult.count(),
      prisma.scrapingResult.count({ where: { conflictStatus: 'PENDING' } }),
      prisma.scrapingTask.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { source: { select: { name: true, type: true } } },
      }),
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

