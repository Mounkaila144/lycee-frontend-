import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Finance Module Menu Configuration
 *
 * Consolidé sur l'écran Facturation : les paiements, le recouvrement et
 * les rapports sont accessibles depuis l'action « Paiements » par facture
 * et les onglets internes du dashboard, plutôt que via des entrées de
 * sidebar séparées.
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
        value: '💰',
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
            value: '🧾',
          },
          order: 1,
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
