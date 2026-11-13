import { createApiClient } from '@/shared/lib/api-client';
import type { InboxResponse, Message, MessageInput, MessageRecipient } from '../types/messaging.types';

export const messagingService = {
  async inbox(): Promise<InboxResponse> {
    const { data } = await createApiClient().get<InboxResponse>('/admin/messages');

    
return data;
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

  async recipients(q?: string): Promise<MessageRecipient[]> {
    const { data } = await createApiClient().get<{ data: MessageRecipient[] }>(
      '/admin/messages/recipients',
      { params: q ? { q } : undefined }
    );

    
return data.data;
  },
};
