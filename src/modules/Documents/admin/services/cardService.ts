import { createApiClient } from '@/shared/lib/api-client';

import type {
  StudentCard,
  AccessBadge,
  AccessPermission,
  CreateStudentCardRequest,
  BatchCardRequest,
  ReplaceCardRequest,
  CreateAccessBadgeRequest,
  CardFilters,
  CardStatistics,
  PaginatedResponse,
} from '../../types';

class CardService {
  private baseUrl = '/admin/documents/cards';

  async getCards(
    filters?: CardFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<StudentCard>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<StudentCard>>(
      `${this.baseUrl}/student-card`,
      { params: filters },
    );

    return response.data;
  }

  async getCard(
    cardId: number,
    tenantId?: string,
  ): Promise<StudentCard> {
    const client = createApiClient(tenantId);
    const response = await client.get<StudentCard>(
      `${this.baseUrl}/student-card/${cardId}`,
    );

    return response.data;
  }

  async createCard(
    data: CreateStudentCardRequest,
    tenantId?: string,
  ): Promise<StudentCard> {
    const client = createApiClient(tenantId);
    const response = await client.post<StudentCard>(
      `${this.baseUrl}/student-card`,
      data,
    );

    return response.data;
  }

  async batchCreateCards(
    data: BatchCardRequest,
    tenantId?: string,
  ): Promise<{ message: string; count: number }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; count: number }>(
      `${this.baseUrl}/batch`,
      data,
    );

    return response.data;
  }

  async replaceCard(
    cardId: number,
    data: ReplaceCardRequest,
    tenantId?: string,
  ): Promise<StudentCard> {
    const client = createApiClient(tenantId);
    const response = await client.post<StudentCard>(
      `${this.baseUrl}/student-card/${cardId}/replace`,
      data,
    );

    return response.data;
  }

  async printCard(
    cardId: number,
    tenantId?: string,
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.baseUrl}/student-card/${cardId}/print`,
      { responseType: 'blob' },
    );

    return response.data;
  }

  async batchPrint(
    cardIds: number[],
    tenantId?: string,
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.post<Blob>(
      `${this.baseUrl}/batch-print`,
      { card_ids: cardIds },
      { responseType: 'blob' },
    );

    return response.data;
  }

  async suspendCard(
    cardId: number,
    tenantId?: string,
  ): Promise<{ message: string; card: StudentCard }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; card: StudentCard }>(
      `${this.baseUrl}/student-card/${cardId}/suspend`,
    );

    return response.data;
  }

  async activateCard(
    cardId: number,
    tenantId?: string,
  ): Promise<{ message: string; card: StudentCard }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; card: StudentCard }>(
      `${this.baseUrl}/student-card/${cardId}/activate`,
    );

    return response.data;
  }

  async getAccessBadges(
    tenantId?: string,
  ): Promise<PaginatedResponse<AccessBadge>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<AccessBadge>>(
      `${this.baseUrl}/access-badge`,
    );

    return response.data;
  }

  async createAccessBadge(
    data: CreateAccessBadgeRequest,
    tenantId?: string,
  ): Promise<AccessBadge> {
    const client = createApiClient(tenantId);
    const response = await client.post<AccessBadge>(
      `${this.baseUrl}/access-badge`,
      data,
    );

    return response.data;
  }

  async getAccessPermissions(
    badgeId: number,
    tenantId?: string,
  ): Promise<AccessPermission[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<AccessPermission[]>(
      `${this.baseUrl}/access-badge/${badgeId}/access-permissions`,
    );

    return response.data;
  }

  async suspendBadge(
    badgeId: number,
    tenantId?: string,
  ): Promise<{ message: string; badge: AccessBadge }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; badge: AccessBadge }>(
      `${this.baseUrl}/access-badge/${badgeId}/suspend`,
    );

    return response.data;
  }

  async activateBadge(
    badgeId: number,
    tenantId?: string,
  ): Promise<{ message: string; badge: AccessBadge }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; badge: AccessBadge }>(
      `${this.baseUrl}/access-badge/${badgeId}/activate`,
    );

    return response.data;
  }

  async getStatistics(
    tenantId?: string,
  ): Promise<CardStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<CardStatistics>(
      `${this.baseUrl}/statistics`,
    );

    return response.data;
  }
}

export const cardService = new CardService();
