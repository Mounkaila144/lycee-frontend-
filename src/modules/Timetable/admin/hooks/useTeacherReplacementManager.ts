import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { teacherReplacementService } from '../services';

export const useActiveReplacements = (tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-replacements-active'],
    queryFn: () => teacherReplacementService.getActive(tenantId),
  });
};

export const useAllReplacements = (
  filters?: { teacher?: string; status?: string },
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['timetable-replacements', filters],
    queryFn: () => teacherReplacementService.getAll(filters, tenantId),
  });
};

export const useReplacementSuggestions = (slotId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-replacement-suggestions', slotId],
    queryFn: () => teacherReplacementService.getSuggestions(slotId!, tenantId),
    enabled: !!slotId,
  });
};

export const useReplaceTeacher = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      slot_id: number;
      replacement_teacher_id: number;
      start_date: string;
      end_date?: string;
      reason?: string;
    }) => teacherReplacementService.replaceTeacher(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-replacements'] });
      qc.invalidateQueries({ queryKey: ['timetable-replacements-active'] });
      qc.invalidateQueries({ queryKey: ['timetable-replacement-stats'] });
      qc.invalidateQueries({ queryKey: ['timetable-slots'] });
    },
  });
};

export const useEndReplacement = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teacherReplacementService.endReplacement(id, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-replacements'] });
      qc.invalidateQueries({ queryKey: ['timetable-replacements-active'] });
      qc.invalidateQueries({ queryKey: ['timetable-replacement-stats'] });
      qc.invalidateQueries({ queryKey: ['timetable-slots'] });
    },
  });
};

export const useReplacementStats = (tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-replacement-stats'],
    queryFn: () => teacherReplacementService.getStatistics(tenantId),
  });
};
