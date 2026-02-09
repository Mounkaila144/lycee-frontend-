import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { reminderService } from '../services';
import type { ReminderPreferences } from '../../types';

export const useReminderPreferences = (tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-reminder-preferences'],
    queryFn: () => reminderService.getPreferences(tenantId),
  });
};

export const useUpdateReminderPreferences = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: ReminderPreferences) => reminderService.updatePreferences(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-reminder-preferences'] });
    },
  });
};

export const useWeeklySummary = (tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-weekly-summary'],
    queryFn: () => reminderService.getWeeklySummary(tenantId),
  });
};

export const useSendGroupReminder = (tenantId?: string) => {
  return useMutation({
    mutationFn: ({ groupId, message }: { groupId: number; message: string }) =>
      reminderService.sendGroupReminder(groupId, message, tenantId),
  });
};
