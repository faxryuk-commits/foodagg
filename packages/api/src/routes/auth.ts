import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@food-platform/database';
import { registerSchema, loginSchema } from '@food-platform/shared';
import { asyncHandler, AppError } from '../middleware/error';
import { authenticate } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Generate tokens
function generateTokens(userId: string, sessionId: string) {
  const accessToken = jwt.sign({ userId, sessionId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  
  const refreshToken = jwt.sign({ userId, sessionId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
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

export { router as authRouter };

