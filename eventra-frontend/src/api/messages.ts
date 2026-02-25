import client from './client';
import type {
  Conversation,
  Message,
  SendMessagePayload,
  CreateConversationPayload,
} from '../types';

/**
 * REST API layer for the real-time messaging system.
 * Works with both the Spring Boot backend and mock server.
 */
export const messagesApi = {
  // ── Conversations ──

  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await client.get<Conversation[]>('/api/conversations');
    return data;
  },

  getConversation: async (id: string | number): Promise<Conversation> => {
    const { data } = await client.get<Conversation>(`/api/conversations/${id}`);
    return data;
  },

  createConversation: async (payload: CreateConversationPayload): Promise<Conversation> => {
    const { data } = await client.post<Conversation>('/api/conversations', payload);
    return data;
  },

  // ── Messages ──

  getMessages: async (conversationId: string | number): Promise<Message[]> => {
    const { data } = await client.get<Message[]>(`/api/conversations/${conversationId}/messages`);
    return data;
  },

  sendMessage: async (conversationId: string | number, payload: SendMessagePayload): Promise<Message> => {
    const { data } = await client.post<Message>(`/api/conversations/${conversationId}/messages`, payload);
    return data;
  },

  markAsRead: async (conversationId: string | number): Promise<void> => {
    await client.post(`/api/conversations/${conversationId}/read`);
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await client.get<{ count: number }>('/api/conversations/unread');
    return data.count;
  },
};
