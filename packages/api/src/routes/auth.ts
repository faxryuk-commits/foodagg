import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@food-platform/database';
import { registerSchema, loginSchema } from '@food-platform/shared';
import { asyncHandler, AppError } from '../middleware/error';
import { authenticate } from '../middleware/auth';
import {
  sendOTPviaSMS,
  sendOTPviaEmail,
  sendOTPviaTelegram,
  verifyOTP,
  getTelegramAuthLink,
  OTPChannel,
} from '../services/otp';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Generate tokens
function generateTokens(userId: string, sessionId: string) {
  const accessToken = jwt.sign({ userId, sessionId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  
  const refreshToken = jwt.sign({ userId, sessionId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  
  return { accessToken, refreshToken };
}

// Register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    
    if (existingUser) {
      throw new AppError(409, 'USER_EXISTS', 'User with this phone already exists');
    }
    
    // Hash password if provided
    const passwordHash = data.password 
      ? await bcrypt.hash(data.password, 10)
      : null;
    
    // Create user
    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        bonusBalance: true,
        createdAt: true,
      },
    });
    
    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
    
    const tokens = generateTokens(user.id, session.id);
    
    // Update session with actual tokens
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
    
    res.status(201).json({
      success: true,
      data: {
        user,
        ...tokens,
      },
    });
  })
);

// Login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid phone or password');
    }
    
    // Check password if provided
    if (data.password && user.passwordHash) {
      const isValid = await bcrypt.compare(data.password, user.passwordHash);
      if (!isValid) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid phone or password');
      }
    } else if (!data.otp) {
      // For passwordless login, would send OTP here
      // For now, just proceed (in production, implement OTP)
    }
    
    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    
    const tokens = generateTokens(user.id, session.id);
    
    // Update session with actual tokens
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
          bonusBalance: user.bonusBalance,
        },
        ...tokens,
      },
    });
  })
);

// Refresh token
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AppError(400, 'MISSING_TOKEN', 'Refresh token is required');
    }
    
    // Verify refresh token
    let decoded: { userId: string; sessionId: string; type: string };
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET) as typeof decoded;
    } catch {
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid refresh token');
    }
    
    if (decoded.type !== 'refresh') {
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid token type');
    }
    
    // Get session
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
      include: { user: true },
    });
    
    if (!session || session.refreshToken !== refreshToken) {
      throw new AppError(401, 'INVALID_TOKEN', 'Session not found');
    }
    
    // Generate new tokens
    const tokens = generateTokens(session.userId, session.id);
    
    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    
    res.json({
      success: true,
      data: tokens,
    });
  })
);

// Get current user
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        bonusBalance: true,
        totalOrders: true,
        totalSpent: true,
        preferences: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }
    
    res.json({
      success: true,
      data: user,
    });
  })
);

// Logout
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    
    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      });
    }
    
    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  })
);

// Logout all sessions
router.post(
  '/logout-all',
  authenticate,
  asyncHandler(async (req, res) => {
    await prisma.session.deleteMany({
      where: { userId: req.user!.id },
    });
    
    res.json({
      success: true,
      data: { message: 'Logged out from all devices' },
    });
  })
);

// ============================================
// OTP Authentication Routes
// ============================================

// Send OTP
router.post(
  '/otp/send',
  asyncHandler(async (req, res) => {
    const { identifier, channel } = req.body as { identifier: string; channel: OTPChannel };
    
    if (!identifier || !channel) {
      throw new AppError(400, 'MISSING_PARAMS', 'identifier and channel are required');
    }
    
    if (!['sms', 'email', 'telegram'].includes(channel)) {
      throw new AppError(400, 'INVALID_CHANNEL', 'Channel must be sms, email, or telegram');
    }
    
    let result;
    switch (channel) {
      case 'sms':
        // Validate phone format
        if (!/^\+998\d{9}$/.test(identifier)) {
          throw new AppError(400, 'INVALID_PHONE', 'Phone must be in format +998XXXXXXXXX');
        }
        result = await sendOTPviaSMS(identifier);
        break;
        
      case 'email':
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
          throw new AppError(400, 'INVALID_EMAIL', 'Invalid email format');
        }
        result = await sendOTPviaEmail(identifier);
        break;
        
      case 'telegram':
        // For telegram, identifier is the chat ID
        result = await sendOTPviaTelegram(identifier);
        break;
    }
    
    if (!result.success) {
      throw new AppError(429, 'OTP_FAILED', result.message);
    }
    
    res.json({
      success: true,
      data: {
        message: result.message,
        expiresAt: result.expiresAt,
        channel: result.channel,
        ...(result.devCode && { devCode: result.devCode }), // Include dev code if present
      },
    });
  })
);

// Verify OTP and login
router.post(
  '/otp/verify',
  asyncHandler(async (req, res) => {
    const { identifier, channel, code, name } = req.body as {
      identifier: string;
      channel: OTPChannel;
      code: string;
      name?: string;
    };
    
    if (!identifier || !channel || !code) {
      throw new AppError(400, 'MISSING_PARAMS', 'identifier, channel, and code are required');
    }
    
    // Verify OTP
    const verification = await verifyOTP(identifier, channel, code);
    if (!verification.valid) {
      throw new AppError(401, 'INVALID_OTP', verification.message);
    }
    
    // Find or create user based on channel
    let user;
    
    switch (channel) {
      case 'sms':
        user = await prisma.user.findUnique({ where: { phone: identifier } });
        if (!user) {
          // Create new user with phone
          user = await prisma.user.create({
            data: {
              phone: identifier,
              name: name || null,
            },
          });
        }
        break;
        
      case 'email':
        user = await prisma.user.findUnique({ where: { email: identifier } });
        if (!user) {
          // Need phone for new user - check if provided
          const { phone } = req.body;
          if (!phone) {
            // Return that user needs to provide phone
            return res.json({
              success: true,
              data: {
                verified: true,
                requiresPhone: true,
                message: 'Email verified. Please provide phone number to complete registration.',
              },
            });
          }
          user = await prisma.user.create({
            data: {
              email: identifier,
              phone,
              name: name || null,
            },
          });
        }
        break;
        
      case 'telegram':
        user = await prisma.user.findUnique({ where: { telegramId: identifier } });
        if (!user) {
          // Need phone for new user
          const { phone } = req.body;
          if (!phone) {
            return res.json({
              success: true,
              data: {
                verified: true,
                requiresPhone: true,
                message: 'Telegram verified. Please provide phone number to complete registration.',
              },
            });
          }
          user = await prisma.user.create({
            data: {
              telegramId: identifier,
              phone,
              name: name || null,
            },
          });
        }
        break;
    }
    
    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    
    const tokens = generateTokens(user.id, session.id);
    
    // Update session with actual tokens
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role,
          bonusBalance: user.bonusBalance,
        },
        ...tokens,
      },
    });
  })
);

// Get Telegram auth link
router.get(
  '/telegram/link',
  asyncHandler(async (req, res) => {
    const link = getTelegramAuthLink();
    
    res.json({
      success: true,
      data: {
        link,
        botUsername: process.env.TELEGRAM_BOT_USERNAME || 'FoodPlatformBot',
      },
    });
  })
);

// Link Telegram to existing account
router.post(
  '/telegram/link',
  authenticate,
  asyncHandler(async (req, res) => {
    const { telegramId } = req.body;
    
    if (!telegramId) {
      throw new AppError(400, 'MISSING_TELEGRAM_ID', 'Telegram ID is required');
    }
    
    // Check if telegram ID is already linked
    const existing = await prisma.user.findUnique({
      where: { telegramId },
    });
    
    if (existing && existing.id !== req.user!.id) {
      throw new AppError(409, 'TELEGRAM_LINKED', 'This Telegram account is already linked to another user');
    }
    
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { telegramId },
    });
    
    res.json({
      success: true,
      data: { message: 'Telegram linked successfully' },
    });
  })
);

export { router as authRouter };

