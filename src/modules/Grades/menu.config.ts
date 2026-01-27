import { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Grades Module Menu Configuration
 *
 * This file defines all menu items for the Grades module.
 */
export const gradesMenuConfig: ModuleMenuConfig = {
  module: 'Grades',
  menus: [
    {
      id: 'grades',
      label: 'Notes & Évaluations',
      route: '/admin/grades',
      icon: {
        type: 'emoji',
        value: '📝',
      },
      order: 25,
      module: 'Grades',
      roles: ['admin', 'superadmin', 'teacher', 'enseignant'],
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'grades-entry',
          label: 'Saisie des Notes',
          route: '/admin/grades/entry',
          icon: {
            type: 'emoji',
            value: '✏️',
          },
          order: 1,
          module: 'Grades',
          parentId: 'grades',
          roles: ['admin', 'superadmin', 'teacher', 'enseignant'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'grades-coefficients',
          label: 'Coefficients & ECTS',
          route: '/admin/grades/coefficients',
          icon: {
            type: 'emoji',
            value: '⚖️',
          },
          order: 2,
          module: 'Grades',
          parentId: 'grades',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'grades-deliberation',
          label: 'Délibérations',
          route: '/admin/grades/deliberation',
          icon: {
            type: 'emoji',
            value: '🏛️',
          },
          order: 3,
          module: 'Grades',
          parentId: 'grades',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'grades-transcripts',
          label: 'Relevés de Notes',
          route: '/admin/grades/transcripts',
          icon: {
            type: 'emoji',
            value: '📄',
          },
          order: 4,
          module: 'Grades',
          parentId: 'grades',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'grades-statistics',
          label: 'Statistiques',
          route: '/admin/grades/statistics',
          icon: {
            type: 'emoji',
            value: '📊',
          },
          order: 5,
          module: 'Grades',
          parentId: 'grades',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'grades-correction-requests',
          label: 'Demandes de Correction',
          route: '/admin/grades/correction-requests',
          icon: {
            type: 'emoji',
            value: '🔄',
          },
          order: 6,
          module: 'Grades',
          parentId: 'grades',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
