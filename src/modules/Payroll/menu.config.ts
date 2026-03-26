import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Payroll Module Menu Configuration
 */
export const payrollMenuConfig: ModuleMenuConfig = {
  module: 'Payroll',
  menus: [
    {
      id: 'payroll',
      label: 'Paie & RH',
      route: '/admin/payroll',
      icon: {
        type: 'emoji',
        value: '\uD83D\uDCB5',
      },
      order: 50,
      module: 'Payroll',
      roles: ['admin', 'superadmin'],
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'payroll-employees',
          label: 'Employés',
          route: '/admin/payroll/employees',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDC65',
          },
          order: 1,
          module: 'Payroll',
          parentId: 'payroll',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'payroll-components',
          label: 'Éléments de Paie',
          route: '/admin/payroll/components',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCB0',
          },
          order: 2,
          module: 'Payroll',
          parentId: 'payroll',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'payroll-processing',
          label: 'Traitement Paie',
          route: '/admin/payroll/processing',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCCB',
          },
          order: 3,
          module: 'Payroll',
          parentId: 'payroll',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'payroll-declarations',
          label: 'Déclarations Sociales',
          route: '/admin/payroll/declarations',
          icon: {
            type: 'emoji',
            value: '\uD83C\uDFDB\uFE0F',
          },
          order: 4,
          module: 'Payroll',
          parentId: 'payroll',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'payroll-reports',
          label: 'Rapports RH',
          route: '/admin/payroll/reports',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCCA',
          },
          order: 5,
          module: 'Payroll',
          parentId: 'payroll',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
