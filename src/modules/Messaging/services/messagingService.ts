import { createApiClient } from '@/shared/lib/api-client';
import type { Message, MessageInput } from '../types/messaging.types';

export const messagingService = {
  async inbox(): Promise<Message[]> {
    const { data } = await createApiClient().get<{ data: Message[] }>(
      '/admin/messages'
    );
    return data.data;
  },

  async show(id: number): Promise<Message> {
    const { data } = await createApiClient().get<{ data: Message }>(
      `/admin/messages/${id}`
    );
    return data.data;
  },

  async send(input: MessageInput): Promise<Message> {
    const { data } = await createApiClient().post<{ data: Message }>(
      '/admin/messages',
      input
    );
    return data.data;
  },
};
