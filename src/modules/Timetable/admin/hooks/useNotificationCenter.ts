import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationCenterService } from '../services';
import type { NotificationPreferences } from '../../types';

export const useNotifications = (
  filters?: { read?: boolean; priority?: string; type?: string; page?: number },
  tenantId?: string,
) => {
  return useQuery({
    queryKey: ['timetable-notifications', filters],
    queryFn: () => notificationCenterService.getAll(filters, tenantId),
  });
};

export const useUnreadCount = (tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-notifications-unread'],
    queryFn: () => notificationCenterService.getUnreadCount(tenantId),
    refetchInterval: 30000,
  });
};

export const useMarkAsRead = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationCenterService.markAsRead(id, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-notifications'] });
      qc.invalidateQueries({ queryKey: ['timetable-notifications-unread'] });
    },
  });
};

export const useMarkAllAsRead = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => notificationCenterService.markAllAsRead(tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-notifications'] });
      qc.invalidateQueries({ queryKey: ['timetable-notifications-unread'] });
    },
  });
};

export const useNotificationPreferences = (tenantId?: string) => {
  return useQuery({
    queryKey: ['timetable-notification-preferences'],
    queryFn: () => notificationCenterService.getPreferences(tenantId),
  });
};

export const useUpdateNotificationPreferences = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationPreferences) =>
      notificationCenterService.updatePreferences(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable-notification-preferences'] });
    },
  });
};
