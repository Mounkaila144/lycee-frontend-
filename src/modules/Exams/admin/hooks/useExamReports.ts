import { useQuery } from '@tanstack/react-query';

import { examReportService } from '../services';

export const useExamStatistics = (
  academicYearId?: number,
  evaluationPeriodId?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['exam-statistics', academicYearId, evaluationPeriodId],
    queryFn: () => examReportService.getStatistics(academicYearId!, evaluationPeriodId, tenantId),
    enabled: !!academicYearId,
  });
};

export const useExamAttendanceReport = (sessionId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-attendance-report', sessionId],
    queryFn: () => examReportService.getAttendanceReport(sessionId!, tenantId),
    enabled: !!sessionId,
  });
};

export const useExamIncidentReport = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['exam-incident-report', academicYearId],
    queryFn: () => examReportService.getIncidentReport(academicYearId!, tenantId),
    enabled: !!academicYearId,
  });
};

export const useSupervisorWorkload = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['supervisor-workload', academicYearId],
    queryFn: () => examReportService.getSupervisorWorkload(academicYearId!, tenantId),
    enabled: !!academicYearId,
  });
};

export const useRoomUtilization = (academicYearId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['room-utilization', academicYearId],
    queryFn: () => examReportService.getRoomUtilization(academicYearId!, tenantId),
    enabled: !!academicYearId,
  });
};
