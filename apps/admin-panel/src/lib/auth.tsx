'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AuthUser,
  AuthTokens,
  AuthState,
  LoginCredentials,
  authAPI,
  getStoredTokens,
  getStoredUser,
  clearStoredTokens,
  isAdmin,
} from '@food-platform/shared';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

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
      
      // Use stored user immediately
      if (storedUser && isAdmin(storedUser.role)) {
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
        
        // Check if user has ADMIN role
        if (!isAdmin(user.role)) {
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

  // Redirect if not authenticated
  useEffect(() => {
    if (state.isLoading) return;
    
    if (!state.isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [state.isAuthenticated, state.isLoading, pathname, router]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { user, tokens } = await authAPI.login(credentials);
      
      // Check role - must be ADMIN
      if (!isAdmin(user.role)) {
        throw new Error('Доступ только для администраторов');
      }
      
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
    router.push('/login');
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
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
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

// Auth guard
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}

