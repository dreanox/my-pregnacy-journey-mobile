import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import {
  fetchCurrentUser,
  postLogin as loginRequest,
  postLogout as logoutRequest,
  postRegister as registerRequest,
} from '@/lib/services/authApi';
import type { User } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const user = await fetchCurrentUser();
        setState({ user, token, isLoading: false, isAuthenticated: true });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
      setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    }
  };

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    await SecureStore.setItemAsync('auth_token', data.token);
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await registerRequest(name, email, password);
    await SecureStore.setItemAsync('auth_token', data.token);
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // ignore
    }
    await SecureStore.deleteItemAsync('auth_token');
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
