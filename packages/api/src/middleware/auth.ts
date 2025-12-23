import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@food-platform/database';
import { AppError } from './error';
import type { UserRole } from '@food-platform/shared';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone: string;
        name: string | null;
        role: UserRole;
        merchantId?: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'No token provided');
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      sessionId: string;
    };
    
    // Get session and user
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
      include: { user: true },
    });
    
    if (!session || session.expiresAt < new Date()) {
      throw new AppError(401, 'UNAUTHORIZED', 'Session expired');
    }
    
    if (session.userId !== decoded.userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid token');
    }
    
    // Get merchant ID if user is merchant
    let merchantId: string | undefined;
    if (session.user.role === 'MERCHANT_OWNER' || session.user.role === 'MERCHANT_STAFF') {
      const merchantStaff = await prisma.merchantStaff.findFirst({
        where: { userId: session.user.id },
        select: { merchantId: true },
      });
      merchantId = merchantStaff?.merchantId;
    }
    
    req.user = {
      id: session.user.id,
      phone: session.user.phone,
      name: session.user.name,
      role: session.user.role as UserRole,
      merchantId,
    };
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'UNAUTHORIZED', 'Invalid token'));
    } else {
      next(error);
    }
  }
}

// Optional authentication (doesn't fail if no token)
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      sessionId: string;
    };
    
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
      include: { user: true },
    });
    
    if (session && session.expiresAt >= new Date()) {
      // Get merchant ID if user is merchant
      let merchantId: string | undefined;
      if (session.user.role === 'MERCHANT_OWNER' || session.user.role === 'MERCHANT_STAFF') {
        const merchantStaff = await prisma.merchantStaff.findFirst({
          where: { userId: session.user.id },
          select: { merchantId: true },
        });
        merchantId = merchantStaff?.merchantId;
      }
      
      req.user = {
        id: session.user.id,
        phone: session.user.phone,
        name: session.user.name,
        role: session.user.role as UserRole,
        merchantId,
      };
    }
    
    next();
  } catch {
    // Ignore errors for optional auth
    next();
  }
}

// Require specific roles
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    
    next();
  };
}

// Require merchant access
export async function requireMerchantAccess(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
  }
  
  // Admins have access to all merchants
  if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
    return next();
  }
  
  // Check if user is merchant owner or staff
  if (req.user.role !== 'MERCHANT_OWNER' && req.user.role !== 'MERCHANT_STAFF') {
    return next(new AppError(403, 'FORBIDDEN', 'Merchant access required'));
  }
  
  // Get merchant ID from staff relation
  const merchantStaff = await prisma.merchantStaff.findFirst({
    where: { userId: req.user.id },
    select: { merchantId: true },
  });
  
  if (!merchantStaff) {
    return next(new AppError(403, 'FORBIDDEN', 'Not associated with any merchant'));
  }
  
  req.merchantId = merchantStaff.merchantId;
  next();
}

// Require admin access
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
  }
  
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return next(new AppError(403, 'FORBIDDEN', 'Admin access required'));
  }
  
  next();
}

