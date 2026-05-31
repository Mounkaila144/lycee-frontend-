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
      requiredRoles: ['Administrator', 'Manager', 'Comptable', 'Caissier'],
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
          requiredRoles: ['Administrator', 'Manager', 'Comptable', 'Caissier'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-fee-types',
          label: 'Types de frais',
          route: '/admin/finance/fee-types',
          icon: {
            type: 'emoji',
            value: '🏷️',
          },
          order: 2,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Manager', 'Comptable'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-class-fees',
          label: 'Frais par classe',
          route: '/admin/finance/class-fees',
          icon: {
            type: 'emoji',
            value: '🏫',
          },
          order: 3,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Manager', 'Comptable'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-payment-statistics',
          label: 'Statistiques paiement',
          route: '/admin/finance/payment-statistics',
          icon: {
            type: 'emoji',
            value: '📊',
          },
          order: 4,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Manager', 'Comptable'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-expenses',
          label: 'Dépenses',
          route: '/admin/finance/expenses',
          icon: {
            type: 'emoji',
            value: '🧾',
          },
          order: 5,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Manager', 'Comptable'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-general-ledger',
          label: 'Bilan / Résultat',
          route: '/admin/finance/general-ledger',
          icon: {
            type: 'emoji',
            value: '📈',
          },
          order: 6,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Manager', 'Comptable'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
