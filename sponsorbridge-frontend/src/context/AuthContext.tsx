import React, { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import type { AuthState, LoginCredentials, RegisterPayload, User, UserRole } from '../types';
import { authApi } from '../api/auth';
import { getDashboardPath } from '../config/roles';

// â"€â"€â"€ Actions â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR' }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_UPDATE_USER'; payload: User };

// â"€â"€â"€ Reducer â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_ERROR':
    case 'AUTH_LOGOUT':
      return { user: null, token: null, isAuthenticated: false, isLoading: false };
    case 'AUTH_UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// â"€â"€â"€ Context Shape â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  /** Resolve the correct dashboard path for the current user's role. */
  getDashboardPath: () => string;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// â"€â"€â"€ Storage Keys â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const TOKEN_KEY = 'sb_token';
const USER_KEY = 'sb_user';

// â"€â"€â"€ Provider â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        dispatch({ type: 'AUTH_ERROR' });
      }
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  // Listen for 401 token-expired events from API layer
  useEffect(() => {
    const handleExpired = () => {
      dispatch({ type: 'AUTH_LOGOUT' });
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const response = await authApi.login(credentials);
      const { token, user } = response;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      return user;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
      throw error;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const response = await authApi.register(payload);
      const { token, user } = response;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      return user;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    dispatch({ type: 'AUTH_LOGOUT' });
    authApi.logout(); // fire-and-forget server logout
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => state.user?.role === role,
    [state.user]
  );

  const dashboardPath = useCallback(
    () => getDashboardPath(state.user?.role),
    [state.user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      hasRole,
      getDashboardPath: dashboardPath,
    }),
    [state, login, register, logout, hasRole, dashboardPath]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
