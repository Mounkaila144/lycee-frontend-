import { createApiClient } from '@/shared/lib/api-client';

import type {
  AttendanceRates,
  AbsenteeEntry,
  DetailedStatistics,
  ExportType,
  ReportFilters,
  SemesterSummary,
} from '../../types';

/** Supprime les filtres vides pour ne pas envoyer `classe_id=` à l'API. */
const cleanParams = <T extends object>(params: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>;

class AttendanceReportService {
  private baseUrl = '/admin/attendance/reports';

  async getSemesters(tenantId?: string): Promise<SemesterSummary[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: SemesterSummary[] }>('/admin/semesters');

    return response.data.data;
  }

  async getAttendanceRates(filters: ReportFilters, tenantId?: string): Promise<AttendanceRates> {
    const client = createApiClient(tenantId);
    const response = await client.get<AttendanceRates>(`${this.baseUrl}/rates`, { params: cleanParams(filters) });

    return response.data;
  }

  async getAbsenteesList(
    filters: ReportFilters,
    minAbsenceRate?: number,
    tenantId?: string,
  ): Promise<AbsenteeEntry[]> {
    const client = createApiClient(tenantId);

    const response = await client.get<AbsenteeEntry[]>(`${this.baseUrl}/absentees`, {
      params: cleanParams({ ...filters, min_absence_rate: minAbsenceRate }),
    });

    return response.data;
  }

  async getDetailedStatistics(filters: ReportFilters, tenantId?: string): Promise<DetailedStatistics> {
    const client = createApiClient(tenantId);

    const response = await client.get<DetailedStatistics>(`${this.baseUrl}/statistics`, {
      params: cleanParams(filters),
    });

    return response.data;
  }

  async exportData<T = Record<string, unknown>>(
    filters: ReportFilters,
    type: ExportType,
    tenantId?: string,
  ): Promise<{ data: T[]; export_type: ExportType; semester_id: number }> {
    const client = createApiClient(tenantId);

    const response = await client.get<{ data: T[]; export_type: ExportType; semester_id: number }>(
      `${this.baseUrl}/export`,
      { params: cleanParams({ ...filters, type }) },
    );

    return response.data;
  }
}

export const reportService = new AttendanceReportService();
