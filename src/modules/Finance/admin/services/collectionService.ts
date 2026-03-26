import { createApiClient } from '@/shared/lib/api-client';

import type {
  Reminder,
  CreateReminderRequest,
  ServiceBlock,
  CreateServiceBlockRequest,
  PaymentPlan,
  CreatePaymentPlanRequest,
  WriteOff,
  CreateWriteOffRequest,
  ReminderFilters,
  PaginatedResponse,
  CollectionStatistics,
} from '../../types';

class CollectionService {
  private baseUrl = '/admin/finance';

  // ──── Reminders ────

  async getReminders(filters?: ReminderFilters, tenantId?: string): Promise<PaginatedResponse<Reminder>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Reminder>>(
      `${this.baseUrl}/reminders`,
      { params: filters },
    );

    return response.data;
  }

  async createReminder(data: CreateReminderRequest, tenantId?: string): Promise<Reminder> {
    const client = createApiClient(tenantId);
    const response = await client.post<Reminder>(`${this.baseUrl}/reminders`, data);

    return response.data;
  }

  async sendReminder(reminderId: number, tenantId?: string): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string }>(
      `${this.baseUrl}/reminders/${reminderId}/send`,
    );

    return response.data;
  }

  // ──── Service Blocking ────

  async getServiceBlocks(tenantId?: string): Promise<ServiceBlock[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ServiceBlock[]>(`${this.baseUrl}/service-blocks`);

    return response.data;
  }

  async createServiceBlock(data: CreateServiceBlockRequest, tenantId?: string): Promise<ServiceBlock> {
    const client = createApiClient(tenantId);
    const response = await client.post<ServiceBlock>(`${this.baseUrl}/service-blocks`, data);

    return response.data;
  }

  async liftServiceBlock(blockId: number, tenantId?: string): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string }>(
      `${this.baseUrl}/service-blocks/${blockId}/lift`,
    );

    return response.data;
  }

  // ──── Payment Plans ────

  async getPaymentPlans(tenantId?: string): Promise<PaymentPlan[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaymentPlan[]>(`${this.baseUrl}/payment-plans`);

    return response.data;
  }

  async createPaymentPlan(data: CreatePaymentPlanRequest, tenantId?: string): Promise<PaymentPlan> {
    const client = createApiClient(tenantId);
    const response = await client.post<PaymentPlan>(`${this.baseUrl}/payment-plans`, data);

    return response.data;
  }

  async cancelPaymentPlan(planId: number, tenantId?: string): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string }>(
      `${this.baseUrl}/payment-plans/${planId}/cancel`,
    );

    return response.data;
  }

  // ──── Write-Offs ────

  async getWriteOffs(tenantId?: string): Promise<WriteOff[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<WriteOff[]>(`${this.baseUrl}/write-offs`);

    return response.data;
  }

  async createWriteOff(data: CreateWriteOffRequest, tenantId?: string): Promise<WriteOff> {
    const client = createApiClient(tenantId);
    const response = await client.post<WriteOff>(`${this.baseUrl}/write-offs`, data);

    return response.data;
  }

  async approveWriteOff(writeOffId: number, tenantId?: string): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string }>(
      `${this.baseUrl}/write-offs/${writeOffId}/approve`,
    );

    return response.data;
  }

  // ──── Statistics ────

  async getCollectionStatistics(academicYearId?: number, tenantId?: string): Promise<CollectionStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<CollectionStatistics>(
      `${this.baseUrl}/collection/statistics`,
      { params: { academic_year_id: academicYearId } },
    );

    return response.data;
  }
}

export const collectionService = new CollectionService();
