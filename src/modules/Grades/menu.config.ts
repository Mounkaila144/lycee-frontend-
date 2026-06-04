import { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Grades Module Menu Configuration (secondary school).
 *
 * Only the secondary, working features are exposed. The former LMD sub-pages
 * (semester results, deliberation/PV, retakes/rattrapage, ECTS, compensation,
 * final results, publications, correction workflow…) were removed.
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
      requiredRoles: ['Administrator', 'Manager', 'Professeur'],
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'grades-entry',
          label: 'Saisie des notes',
          route: '/admin/grades/entry',
          icon: {
            type: 'emoji',
            value: '✏️',
          },
          order: 1,
          module: 'Grades',
          parentId: 'grades',
          roles: ['admin', 'superadmin', 'teacher', 'enseignant'],
          requiredRoles: ['Administrator', 'Manager', 'Professeur'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'grades-bulletins',
          label: 'Bulletins',
          route: '/admin/grades/bulletins',
          icon: {
            type: 'emoji',
            value: '📄',
          },
          order: 2,
          module: 'Grades',
          parentId: 'grades',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Manager'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
