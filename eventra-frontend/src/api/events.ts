import client from './client';
import type { Event, CreateEventPayload, PaginatedResponse, DashboardStats } from '../types';

export const eventsApi = {
  getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<Event>> => {
    const { data } = await client.get<PaginatedResponse<Event>>('/api/events', {
      params: { page, pageSize },
    });
    return data;
  },

  getById: async (id: string): Promise<Event> => {
    const { data } = await client.get<Event>(`/api/events/${id}`);
    return data;
  },

  getMyEvents: async (): Promise<Event[]> => {
    const { data } = await client.get<Event[]>('/api/events/mine');
    return data;
  },

  create: async (payload: CreateEventPayload): Promise<Event> => {
    const { data } = await client.post<Event>('/api/events', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateEventPayload>): Promise<Event> => {
    const { data } = await client.put<Event>(`/api/events/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/api/events/${id}`);
  },

  getStats: async (): Promise<DashboardStats> => {
    const { data } = await client.get<DashboardStats>('/api/events/stats');
    return data;
  },
};
