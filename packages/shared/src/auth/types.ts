export type UserRole = 'USER' | 'MERCHANT_OWNER' | 'MERCHANT_STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: UserRole;
  merchantId?: string;
  bonusBalance?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  phone: string;
  password?: string;
  otp?: string;
}

export interface RegisterData {
  phone: string;
  name: string;
  email?: string;
  password?: string;
}

// Role checking utilities
export const ROLE_LEVELS: Record<UserRole, number> = {
  USER: 1,
  MERCHANT_STAFF: 2,
  MERCHANT_OWNER: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};

export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

export function isAdmin(role: UserRole | undefined): boolean {
  return hasRole(role, 'ADMIN');
}

export function isMerchant(role: UserRole | undefined): boolean {
  return role === 'MERCHANT_OWNER' || role === 'MERCHANT_STAFF';
}

export function isUser(role: UserRole | undefined): boolean {
  return role === 'USER';
}

