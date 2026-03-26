import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Finance Module Menu Configuration
 */
export const financeMenuConfig: ModuleMenuConfig = {
  module: 'Finance',
  menus: [
    {
      id: 'finance',
      label: 'Comptabilité',
      route: '/admin/finance',
      icon: {
        type: 'emoji',
        value: '\uD83D\uDCB0',
      },
      order: 45,
      module: 'Finance',
      roles: ['admin', 'superadmin'],
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'finance-invoices',
          label: 'Facturation',
          route: '/admin/finance/invoices',
          icon: {
            type: 'emoji',
            value: '\uD83E\uDDFE',
          },
          order: 1,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-payments',
          label: 'Paiements',
          route: '/admin/finance/payments',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCB3',
          },
          order: 2,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-collection',
          label: 'Recouvrement',
          route: '/admin/finance/collection',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCE7',
          },
          order: 3,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-reports',
          label: 'Rapports Financiers',
          route: '/admin/finance/reports',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCCA',
          },
          order: 4,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
