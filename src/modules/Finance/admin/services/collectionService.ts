import { createApiClient } from '@/shared/lib/api-client';

/**
 * Recouvrement & relances — endpoints réels sous /admin/finance/collection
 * (cf. Modules/Finance/Routes/admin.php côté Laravel).
 *
 * Lecture : Administrator, Manager, Comptable, Caissier.
 * Actions (générer/envoyer, bloquer/débloquer, échéancier, passage en perte) :
 * Administrator et Comptable uniquement.
 */

export type ReminderLevel = 'first_reminder' | 'second_reminder' | 'final_notice' | 'service_block_warning';
export type BlockType = 'enrollment' | 'exam_access' | 'documents' | 'reenrollment' | 'all';

interface StudentRef {
  id: number;
  firstname: string;
  lastname: string;
  matricule: string;
}

interface UserRef {
  id: number;
  username?: string;
  firstname?: string;
  lastname?: string;
}

export interface CollectionReminder {
  id: number;
  invoice_id: number;
  student_id: number;
  reminder_date: string;
  reminder_type: ReminderLevel;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  send_methods: string[] | null;
  notes: string | null;
  invoice?: { id: number; invoice_number: string; total_amount: string; paid_amount: string; due_date: string } | null;
  student?: StudentRef | null;
}

export interface CollectionServiceBlock {
  id: number;
  student_id: number;
  block_type: BlockType;
  reason: string;
  blocked_at: string;
  unblocked_at: string | null;
  is_active: boolean;
  student?: StudentRef | null;
  blocked_by?: UserRef | null;
  unblocked_by?: UserRef | null;
}

export interface CollectionStats {
  total_overdue_amount: number;
  total_overdue_count: number;
  reminders_sent: number;
  active_blocks: number;
  aging: Record<string, { count: number; amount: number }>;
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface ReminderListFilters {
  status?: string;
  reminder_type?: string;
  page?: number;
  per_page?: number;
}

export interface BlockListFilters {
  student_id?: number;
  active_only?: boolean;
  page?: number;
  per_page?: number;
}

const BASE_URL = '/admin/finance/collection';

class CollectionService {
  async getStatistics(tenantId?: string): Promise<CollectionStats> {
    const response = await createApiClient(tenantId).get<{ data: CollectionStats }>(`${BASE_URL}/statistics`);

    return response.data.data;
  }

  async getReminders(filters?: ReminderListFilters, tenantId?: string): Promise<Paginated<CollectionReminder>> {
    const response = await createApiClient(tenantId).get<Paginated<CollectionReminder>>(`${BASE_URL}/reminders`, {
      params: filters,
    });

    return response.data;
  }

  async generateReminders(tenantId?: string): Promise<{ message: string; data: { reminders_count: number } }> {
    const response = await createApiClient(tenantId).post(`${BASE_URL}/reminders/generate`);

    return response.data;
  }

  async sendReminders(tenantId?: string): Promise<{ message: string; data: { sent: number; failed: number; total: number } }> {
    const response = await createApiClient(tenantId).post(`${BASE_URL}/reminders/send`);

    return response.data;
  }

  async getServiceBlocks(filters?: BlockListFilters, tenantId?: string): Promise<Paginated<CollectionServiceBlock>> {
    const response = await createApiClient(tenantId).get<Paginated<CollectionServiceBlock>>(`${BASE_URL}/blocks`, {
      params: { ...filters, active_only: filters?.active_only ? 1 : undefined },
    });

    return response.data;
  }

  async createServiceBlock(
    data: { student_id: number; block_type: BlockType; reason: string; related_invoice_ids?: number[] },
    tenantId?: string,
  ): Promise<CollectionServiceBlock> {
    const response = await createApiClient(tenantId).post<{ data: CollectionServiceBlock }>(`${BASE_URL}/blocks`, data);

    return response.data.data;
  }

  async liftServiceBlock(blockId: number, tenantId?: string): Promise<CollectionServiceBlock> {
    const response = await createApiClient(tenantId).post<{ data: CollectionServiceBlock }>(
      `${BASE_URL}/blocks/${blockId}/unblock`,
    );

    return response.data.data;
  }

  async createPaymentPlan(
    data: { invoice_id: number; number_of_installments: number; first_due_date?: string },
    tenantId?: string,
  ): Promise<unknown> {
    const response = await createApiClient(tenantId).post(`${BASE_URL}/payment-plans`, data);

    return response.data;
  }

  async writeOff(invoiceId: number, reason: string, tenantId?: string): Promise<unknown> {
    const response = await createApiClient(tenantId).post(`${BASE_URL}/write-off/${invoiceId}`, { reason });

    return response.data;
  }
}

export const collectionService = new CollectionService();
