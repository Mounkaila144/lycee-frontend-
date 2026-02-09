import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { optimizationService } from '../services';
import type { GenerationConfig, TeacherPreferenceRequest } from '../../types';

export const useGenerateTimetable = (tenantId?: string) => {
  return useMutation({
    mutationFn: (config: GenerationConfig) => optimizationService.generate(config, tenantId),
  });
};

export const useGenerationStatus = (jobId?: string, tenantId?: string) => {
  return useQuery({
    queryKey: ['generation-status', jobId],
    queryFn: () => optimizationService.getGenerationStatus(jobId!, tenantId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;

      if (data?.status === 'completed' || data?.status === 'failed') return false;

      return 2000;
    },
  });
};

export const useGenerationResult = (groupId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['generation-result', groupId],
    queryFn: () => optimizationService.getGenerationResult(groupId!, tenantId),
    enabled: !!groupId,
  });
};

export const useAcceptGenerated = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, semesterId }: { groupId: number; semesterId: number }) =>
      optimizationService.acceptGenerated(groupId, semesterId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-slots'] });
      qc.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useTeacherPreferences = (teacherId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['teacher-preferences', teacherId],
    queryFn: () => optimizationService.getTeacherPreferences(teacherId!, tenantId),
    enabled: !!teacherId,
  });
};

export const useUpdateTeacherPreferences = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: TeacherPreferenceRequest) =>
      optimizationService.updateTeacherPreferences(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-preferences'] });
    },
  });
};
