import { useQuery } from '@tanstack/react-query';

import { examReportService } from '../services';
import type { ExamReportPeriodFilters } from '../../types';

export const useExamStatistics = (
  filters?: ExamReportPeriodFilters & { module_id?: number },
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['exam-statistics', filters],
    queryFn: () => examReportService.getStatistics(filters, tenantId),
  });
};

export const useExamAttendanceReport = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-attendance-report', sessionId],
    queryFn: () => examReportService.getAttendanceReport(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useExamIncidentReport = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-incident-report', sessionId],
    queryFn: () => examReportService.getIncidentReport(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useSupervisorWorkload = (filters?: ExamReportPeriodFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['supervisor-workload', filters],
    queryFn: () => examReportService.getSupervisorWorkload(filters, tenantId),
  });
};

export const useRoomUtilization = (filters?: ExamReportPeriodFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['room-utilization', filters],
    queryFn: () => examReportService.getRoomUtilization(filters, tenantId),
  });
};
