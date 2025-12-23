import { AuthUser, AuthTokens, LoginCredentials, RegisterData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Storage keys
const TOKEN_KEY = 'food_platform_token';
const REFRESH_TOKEN_KEY = 'food_platform_refresh_token';
const USER_KEY = 'food_platform_user';

// Token management
export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!accessToken || !refreshToken) return null;
  
  return { accessToken, refreshToken };
}

export function setStoredTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// API request helper
async function authRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const tokens = getStoredTokens();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (tokens?.accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.accessToken}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Try to refresh token if unauthorized
    if (response.status === 401 && tokens?.refreshToken) {
      const refreshed = await refreshTokens(tokens.refreshToken);
      if (refreshed) {
        // Retry request with new token
        (headers as Record<string, string>)['Authorization'] = `Bearer ${refreshed.accessToken}`;
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
        const retryData = await retryResponse.json();
        if (retryResponse.ok) {
          return retryData.data || retryData;
        }
      }
    }
    
    throw new Error(data.error?.message || 'Request failed');
  }
  
  return data.data || data;
}

// Refresh tokens
async function refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      clearStoredTokens();
      return null;
    }
    
    const data = await response.json();
    const tokens = data.data as AuthTokens;
    setStoredTokens(tokens);
    return tokens;
  } catch {
    clearStoredTokens();
    return null;
  }
}

// Auth API methods
export const authAPI = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Login failed');
    }
    
    const result = data.data;
    const tokens: AuthTokens = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
    
    setStoredTokens(tokens);
    setStoredUser(result.user);
    
    return { user: result.user, tokens };
  },
  
  async register(data: RegisterData): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error?.message || 'Registration failed');
    }
    
    const result = responseData.data;
    const tokens: AuthTokens = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
    
    setStoredTokens(tokens);
    setStoredUser(result.user);
    
    return { user: result.user, tokens };
  },
  
  async logout(): Promise<void> {
    try {
      await authRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors
    } finally {
      clearStoredTokens();
    }
  },
  
  async getMe(): Promise<AuthUser> {
    const user = await authRequest<AuthUser>('/api/auth/me');
    setStoredUser(user);
    return user;
  },
  
  async sendOTP(phone: string): Promise<{ message: string }> {
    return authRequest('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },
  
  async verifyOTP(phone: string, otp: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    return authAPI.login({ phone, otp });
  },
};

export { authRequest };

