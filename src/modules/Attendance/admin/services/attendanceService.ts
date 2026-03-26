import { createApiClient } from '@/shared/lib/api-client';

import type {
  AttendanceSession,
  AttendanceRecord,
  CreateSessionRequest,
  RecordAttendanceRequest,
  ModifyRecordRequest,
  QRCodeAttendanceRequest,
  SessionFilters,
  PaginatedResponse,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class AttendanceService {
  private baseUrl = '/admin/attendance';

  async getSessions(
    filters?: SessionFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<AttendanceSession>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<AttendanceSession>>(
      `${this.baseUrl}/sessions`,
      { params: filters },
    );

    return response.data;
  }

  async createSession(
    data: CreateSessionRequest,
    tenantId?: string,
  ): Promise<AttendanceSession> {
    const client = createApiClient(tenantId);
    const response = await client.post<AttendanceSession>(
      `${this.baseUrl}/sessions`,
      data,
    );

    return response.data;
  }

  async getAttendanceSheet(
    sessionId: number,
    tenantId?: string,
  ): Promise<AttendanceRecord[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<AttendanceRecord[]>(
      `${this.baseUrl}/sessions/${sessionId}/sheet`,
    );

    return response.data;
  }

  async completeSession(
    sessionId: number,
    tenantId?: string,
  ): Promise<{ message: string; session: AttendanceSession }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; session: AttendanceSession }>(
      `${this.baseUrl}/sessions/${sessionId}/complete`,
    );

    return response.data;
  }

  async recordAttendance(
    data: RecordAttendanceRequest,
    tenantId?: string,
  ): Promise<AttendanceRecord> {
    const client = createApiClient(tenantId);
    const response = await client.post<AttendanceRecord>(
      `${this.baseUrl}/record`,
      data,
    );

    return response.data;
  }

  async modifyRecord(
    recordId: number,
    data: ModifyRecordRequest,
    tenantId?: string,
  ): Promise<AttendanceRecord> {
    const client = createApiClient(tenantId);
    const response = await client.put<AttendanceRecord>(
      `${this.baseUrl}/records/${recordId}`,
      data,
    );

    return response.data;
  }

  async recordViaQRCode(
    data: QRCodeAttendanceRequest,
    tenantId?: string,
  ): Promise<{ success: boolean; message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/record-qr`,
      data,
    );

    return response.data;
  }
}

export const attendanceService = new AttendanceService();
