import client from './client';
import type { AuthResponse, LoginCredentials, RegisterPayload, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>('/api/auth/login', credentials);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await client.post<AuthResponse>('/api/auth/register', payload);
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await client.get<User>('/api/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await client.post('/api/auth/logout');
    } catch {
      // Silent fail â€" we clear local state regardless
    }
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const { data } = await client.post<{ token: string }>('/api/auth/refresh');
    return data;
  },
};
