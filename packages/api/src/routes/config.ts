import { Router } from 'express';
import { prisma } from '@food-platform/database';
import { asyncHandler, AppError } from '../middleware/error';
import { authenticate, requireAdmin } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// Encryption key from environment (32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.CONFIG_ENCRYPTION_KEY || 'your-32-character-encryption-key!!';
const IV_LENGTH = 16;

// Encrypt sensitive values
function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt sensitive values
function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return text; // Return as-is if decryption fails
  }
}

// List of sensitive keys that should be encrypted
const SENSITIVE_KEYS = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'APIFY_TOKEN',
  'PAYME_SECRET_KEY',
  'CLICK_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'GOOGLE_CLIENT_SECRET',
  'FIREBASE_PRIVATE_KEY',
  'SMTP_PASSWORD',
  'S3_SECRET_KEY',
  'CLOUDINARY_URL',
  'ESKIZ_PASSWORD',
];

// ==================== Public Config Endpoint ====================
// This is called by applications to load their configuration

router.get(
  '/public',
  asyncHandler(async (req, res) => {
    // Verify request is from a trusted source
    const apiKey = req.headers['x-config-api-key'];
    const expectedKey = process.env.CONFIG_API_KEY;
    
    if (!expectedKey || apiKey !== expectedKey) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid API key');
    }
    
    // Get all active settings
    const settings = await prisma.systemSetting.findMany({
      where: { isActive: true },
    });
    
    // Build config object
    const config: Record<string, string> = {};
    
    for (const setting of settings) {
      let value = setting.value;
      
      // Decrypt sensitive values
      if (setting.isEncrypted) {
        value = decrypt(value);
      }
      
      config[setting.key] = value;
    }
    
    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    });
  })
);

// ==================== Admin Config Management ====================

// Get all settings (admin only)
router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const settings = await prisma.systemSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
    
    // Mask encrypted values
    const maskedSettings = settings.map(setting => ({
      ...setting,
      value: setting.isEncrypted ? '••••••••' : setting.value,
      hasValue: !!setting.value,
    }));
    
    res.json({
      success: true,
      data: maskedSettings,
    });
  })
);

// Get single setting value (admin only, returns decrypted)
router.get(
  '/:key',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });
    
    if (!setting) {
      throw new AppError(404, 'NOT_FOUND', 'Setting not found');
    }
    
    let value = setting.value;
    if (setting.isEncrypted) {
      value = decrypt(value);
    }
    
    res.json({
      success: true,
      data: {
        ...setting,
        value,
      },
    });
  })
);

// Create or update setting (admin only)
router.put(
  '/:key',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value, category, description, isActive = true } = req.body;
    
    // Check if key is sensitive
    const isSensitive = SENSITIVE_KEYS.includes(key);
    
    // Encrypt if sensitive
    const storedValue = isSensitive ? encrypt(value) : value;
    
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: storedValue,
        category,
        description,
        isActive,
        isEncrypted: isSensitive,
        updatedAt: new Date(),
      },
      create: {
        key,
        value: storedValue,
        category: category || 'general',
        description,
        isActive,
        isEncrypted: isSensitive,
      },
    });
    
    // Log the change
    await prisma.adminAction.create({
      data: {
        adminId: req.user!.id,
        action: 'update_config',
        targetType: 'setting',
        targetId: key,
        metadata: { category },
      },
    });
    
    res.json({
      success: true,
      data: {
        ...setting,
        value: isSensitive ? '••••••••' : setting.value,
      },
    });
  })
);

// Bulk update settings (admin only)
router.post(
  '/bulk',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { settings } = req.body;
    // settings: Array<{ key: string; value: string; category?: string }>
    
    const results = [];
    
    for (const { key, value, category } of settings) {
      const isSensitive = SENSITIVE_KEYS.includes(key);
      const storedValue = isSensitive ? encrypt(value) : value;
      
      const setting = await prisma.systemSetting.upsert({
        where: { key },
        update: {
          value: storedValue,
          category,
          isEncrypted: isSensitive,
          updatedAt: new Date(),
        },
        create: {
          key,
          value: storedValue,
          category: category || 'general',
          isEncrypted: isSensitive,
        },
      });
      
      results.push({
        key: setting.key,
        success: true,
      });
    }
    
    // Log bulk update
    await prisma.adminAction.create({
      data: {
        adminId: req.user!.id,
        action: 'bulk_update_config',
        targetType: 'setting',
        targetId: 'bulk',
        metadata: { count: settings.length },
      },
    });
    
    res.json({
      success: true,
      data: results,
    });
  })
);

// Delete setting (admin only)
router.delete(
  '/:key',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    
    await prisma.systemSetting.delete({
      where: { key },
    });
    
    res.json({
      success: true,
      data: { message: 'Setting deleted' },
    });
  })
);

// ==================== Config Categories ====================

router.get(
  '/categories/list',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const categories = await prisma.systemSetting.groupBy({
      by: ['category'],
      _count: { key: true },
    });
    
    res.json({
      success: true,
      data: categories.map(c => ({
        name: c.category,
        count: c._count.key,
      })),
    });
  })
);

// ==================== Export/Import ====================

// Export settings (for backup)
router.get(
  '/export',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const settings = await prisma.systemSetting.findMany();
    
    // Return encrypted values as-is for backup
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: settings.map(s => ({
        key: s.key,
        value: s.value, // Keep encrypted
        category: s.category,
        description: s.description,
        isEncrypted: s.isEncrypted,
      })),
    };
    
    res.json({
      success: true,
      data: exportData,
    });
  })
);

// Import settings (from backup)
router.post(
  '/import',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { settings } = req.body;
    
    let imported = 0;
    
    for (const setting of settings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          category: setting.category,
          description: setting.description,
          isEncrypted: setting.isEncrypted,
        },
        create: setting,
      });
      imported++;
    }
    
    res.json({
      success: true,
      data: { imported },
    });
  })
);

export { router as configRouter };

