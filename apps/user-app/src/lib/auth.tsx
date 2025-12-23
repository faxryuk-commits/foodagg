'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AuthUser,
  AuthTokens,
  AuthState,
  LoginCredentials,
  RegisterData,
  authAPI,
  getStoredTokens,
  getStoredUser,
  clearStoredTokens,
  isUser,
} from '@food-platform/shared';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/auth', '/search', '/restaurant'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const tokens = getStoredTokens();
      const storedUser = getStoredUser();
      
      if (!tokens) {
        setState({ user: null, tokens: null, isLoading: false, isAuthenticated: false });
        return;
      }
      
      // Use stored user immediately for faster UI
      if (storedUser) {
        setState({
          user: storedUser,
          tokens,
          isLoading: false,
          isAuthenticated: true,
        });
      }
      
      // Verify with server
      try {
        const user = await authAPI.getMe();
        
        // Check if user has correct role for this app
        if (!isUser(user.role)) {
          clearStoredTokens();
          setState({ user: null, tokens: null, isLoading: false, isAuthenticated: false });
          return;
        }
        
        setState({
          user,
          tokens,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        clearStoredTokens();
        setState({ user: null, tokens: null, isLoading: false, isAuthenticated: false });
      }
    };
    
    initAuth();
  }, []);

  // Redirect if not authenticated for protected routes
  useEffect(() => {
    if (state.isLoading) return;
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    if (!state.isAuthenticated && !isPublicRoute) {
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [state.isAuthenticated, state.isLoading, pathname, router]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { user, tokens } = await authAPI.login(credentials);
      
      // Check role
      if (!isUser(user.role)) {
        throw new Error('Invalid role for this application');
      }
      
      setState({
        user,
        tokens,
        isLoading: false,
        isAuthenticated: true,
      });
      
      // Redirect after login
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/';
      router.push(redirect);
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { user, tokens } = await authAPI.register(data);
      
      setState({
        user,
        tokens,
        isLoading: false,
        isAuthenticated: true,
      });
      
      router.push('/');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    await authAPI.logout();
    setState({ user: null, tokens: null, isLoading: false, isAuthenticated: false });
    router.push('/auth');
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authAPI.getMe();
      setState(prev => ({ ...prev, user }));
    } catch {
      // Ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Protected route component
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Redirect handled by AuthProvider
  }
  
  return <>{children}</>;
}

