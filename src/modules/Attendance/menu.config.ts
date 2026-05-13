import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Attendance Module Menu Configuration
 */
export const attendanceMenuConfig: ModuleMenuConfig = {
  module: 'Attendance',
  menus: [
    {
      id: 'attendance',
      label: 'Présences & Absences',
      route: '/admin/attendance',
      icon: {
        type: 'emoji',
        value: '📋',
      },
      order: 35,
      module: 'Attendance',
      roles: ['admin', 'superadmin'],
      requiredRoles: ['Administrator', 'Manager', 'Professeur'],
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'attendance-sessions',
          label: 'Feuille d\'Appel',
          route: '/admin/attendance/sessions',
          icon: {
            type: 'emoji',
            value: '✅',
          },
          order: 1,
          module: 'Attendance',
          parentId: 'attendance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Manager', 'Professeur'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'attendance-justifications',
          label: 'Justificatifs',
          route: '/admin/attendance/justifications',
          icon: {
            type: 'emoji',
            value: '📄',
          },
          order: 2,
          module: 'Attendance',
          parentId: 'attendance',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'attendance-monitoring',
          label: 'Suivi & Alertes',
          route: '/admin/attendance/monitoring',
          icon: {
            type: 'emoji',
            value: '🔔',
          },
          order: 3,
          module: 'Attendance',
          parentId: 'attendance',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'attendance-reports',
          label: 'Rapports & Statistiques',
          route: '/admin/attendance/reports',
          icon: {
            type: 'emoji',
            value: '📊',
          },
          order: 4,
          module: 'Attendance',
          parentId: 'attendance',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
