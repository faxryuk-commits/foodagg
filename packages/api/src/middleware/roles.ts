import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';

// Role hierarchy
export const ROLE_HIERARCHY = {
  USER: 1,
  MERCHANT_STAFF: 2,
  MERCHANT_OWNER: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

// Check if user has at least the required role
export function hasRole(userRole: string, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

// Middleware to require specific role
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    
    const userRole = req.user.role as UserRole;
    const hasPermission = roles.some(role => hasRole(userRole, role));
    
    if (!hasPermission) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    
    next();
  };
}

// Middleware to require ADMIN role
export const requireAdmin = requireRole('ADMIN');

// Middleware to require MERCHANT role (owner or staff)
export const requireMerchant = requireRole('MERCHANT_STAFF');

// Middleware to require SUPER_ADMIN role
export const requireSuperAdmin = requireRole('SUPER_ADMIN');

// Middleware to check if user owns the resource or is admin
export function requireOwnerOrAdmin(getOwnerId: (req: Request) => string | Promise<string>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    
    // Admins can access anything
    if (hasRole(req.user.role, 'ADMIN')) {
      return next();
    }
    
    const ownerId = await getOwnerId(req);
    if (req.user.id !== ownerId) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied');
    }
    
    next();
  };
}

// Middleware to check merchant access
export function requireMerchantAccess(getMerchantId: (req: Request) => string | Promise<string>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    
    // Admins can access anything
    if (hasRole(req.user.role, 'ADMIN')) {
      return next();
    }
    
    // Check merchant staff access
    if (!req.user.merchantId) {
      throw new AppError(403, 'FORBIDDEN', 'Merchant access required');
    }
    
    const merchantId = await getMerchantId(req);
    if (req.user.merchantId !== merchantId) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied to this merchant');
    }
    
    next();
  };
}

