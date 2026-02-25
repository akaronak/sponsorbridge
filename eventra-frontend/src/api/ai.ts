import client from './client';

// ── Types ────────────────────────────────────────────────────

export interface ChatHistoryEntry {
  role: 'user' | 'model';
  content: string;
}

export interface AIChatRequest {
  message: string;
  history: ChatHistoryEntry[];
}

export interface RecommendedSponsor {
  name: string;
  industry?: string;
  matchScore: number;
  reason?: string;
  estimatedBudget?: string;
}

export interface AIChatResponse {
  reply: string;
  recommendedSponsors?: RecommendedSponsor[];
  compatibilityScore?: number;
  error?: string;
}

// ── API ──────────────────────────────────────────────────────

export const aiApi = {
  /**
   * Send a chat message to the Gemini-powered AI backend.
   * Includes conversation history for context continuity.
   */
  chat: async (message: string, history: ChatHistoryEntry[]): Promise<AIChatResponse> => {
    const { data } = await client.post<AIChatResponse>('/api/ai/chat', {
      message,
      history,
    } as AIChatRequest);
    return data;
  },

  /**
   * Health check for the AI service.
   */
  healthCheck: async (): Promise<{ status: string; service: string }> => {
    const { data } = await client.get<{ status: string; service: string }>('/api/ai/health');
    return data;
  },
};
