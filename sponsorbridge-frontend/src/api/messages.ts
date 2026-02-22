import client from './client';
import type { Conversation, Message, SendMessagePayload } from '../types';

export const messagesApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await client.get<Conversation[]>('/api/messages/conversations');
    return data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data } = await client.get<Message[]>(`/api/messages/${conversationId}`);
    return data;
  },

  send: async (payload: SendMessagePayload): Promise<Message> => {
    const { data } = await client.post<Message>('/api/messages', payload);
    return data;
  },

  markAsRead: async (messageId: string): Promise<void> => {
    await client.patch(`/api/messages/${messageId}/read`);
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await client.get<{ count: number }>('/api/messages/unread');
    return data.count;
  },
};
