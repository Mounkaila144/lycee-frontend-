import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Exams Module Menu Configuration
 */
export const examsMenuConfig: ModuleMenuConfig = {
  module: 'Exams',
  menus: [
    {
      id: 'exams',
      label: 'Examens',
      route: '/admin/exams',
      icon: {
        type: 'emoji',
        value: '\uD83C\uDF93',
      },
      order: 40,
      module: 'Exams',
      roles: ['admin', 'superadmin'],
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'exams-planning',
          label: 'Planification',
          route: '/admin/exams/planning',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCC5',
          },
          order: 1,
          module: 'Exams',
          parentId: 'exams',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'exams-management',
          label: 'Gestion Épreuves',
          route: '/admin/exams/management',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCDD',
          },
          order: 2,
          module: 'Exams',
          parentId: 'exams',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'exams-supervision',
          label: 'Surveillance',
          route: '/admin/exams/supervision',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDC41\uFE0F',
          },
          order: 3,
          module: 'Exams',
          parentId: 'exams',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'exams-reports',
          label: 'Rapports & Statistiques',
          route: '/admin/exams/reports',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCCA',
          },
          order: 4,
          module: 'Exams',
          parentId: 'exams',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
