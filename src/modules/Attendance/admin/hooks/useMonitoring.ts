import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { monitoringService } from '../services';
import type { AlertFilters } from '../../types';

export const useAttendanceAlerts = (filters?: AlertFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['attendance-alerts', filters],
    queryFn: () => monitoringService.getAlerts(filters!, tenantId),
    enabled: !!filters?.semester_id,
  });
};

export const useStudentHistory = (
  studentId?: number,
  semesterId?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['student-attendance-history', studentId, semesterId],
    queryFn: () => monitoringService.getStudentHistory(studentId!, semesterId!, tenantId),
    enabled: !!studentId && !!semesterId,
  });
};

export const useStudentStats = (
  studentId?: number,
  semesterId?: number,
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['student-attendance-stats', studentId, semesterId],
    queryFn: () => monitoringService.getStudentStats(studentId!, semesterId!, tenantId),
    enabled: !!studentId && !!semesterId,
  });
};

export const useTriggerAlerts = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: number) =>
      monitoringService.triggerAlerts(semesterId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-alerts'] });
    },
  });
};

export const useAcknowledgeAlert = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (alertId: number) => monitoringService.acknowledgeAlert(alertId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-alerts'] });
    },
  });
};

export const useCheckThresholds = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, semesterId }: { studentId: number; semesterId: number }) =>
      monitoringService.checkThresholds(studentId, semesterId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-alerts'] });
    },
  });
};
