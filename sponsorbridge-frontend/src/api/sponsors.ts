import client from './client';
import type { Sponsor, SponsorMatch, SponsorshipRequest, PaginatedResponse } from '../types';

export const sponsorsApi = {
  getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<Sponsor>> => {
    const { data } = await client.get<PaginatedResponse<Sponsor>>('/api/sponsors', {
      params: { page, pageSize },
    });
    return data;
  },

  getById: async (id: string): Promise<Sponsor> => {
    const { data } = await client.get<Sponsor>(`/api/sponsors/${id}`);
    return data;
  },

  getMatches: async (eventId: string): Promise<SponsorMatch[]> => {
    const { data } = await client.get<SponsorMatch[]>(`/api/sponsors/matches/${eventId}`);
    return data;
  },

  // Sponsorship requests
  getRequests: async (): Promise<SponsorshipRequest[]> => {
    const { data } = await client.get<SponsorshipRequest[]>('/api/requests');
    return data;
  },

  createRequest: async (payload: {
    eventId: string;
    sponsorId: string;
    amount: number;
    message: string;
    tier: string;
  }): Promise<SponsorshipRequest> => {
    const { data } = await client.post<SponsorshipRequest>('/api/requests', payload);
    return data;
  },

  updateRequestStatus: async (
    id: string,
    status: string
  ): Promise<SponsorshipRequest> => {
    const { data } = await client.patch<SponsorshipRequest>(`/api/requests/${id}`, { status });
    return data;
  },
};
