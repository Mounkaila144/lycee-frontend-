import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Finance Module Menu Configuration
 *
 * Facturation (paiements accessibles depuis l'action « Paiements » par
 * facture), Facturation en masse (Admin/Comptable), Types de frais (lecture
 * Manager/Caissier, écriture Admin/Comptable), Rapports financiers (Admin/Manager/Comptable) et Rapprochement
 * bancaire (Admin/Comptable — aligné sur le middleware backend).
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
          id: 'finance-bulk-billing',
          label: 'Facturation en masse',
          route: '/admin/finance/bulk-billing',
          icon: {
            type: 'emoji',
            value: '📑',
          },
          order: 1.05,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Comptable'],
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
          order: 1.06,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Manager', 'Comptable', 'Caissier'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-payments',
          label: 'Paiements & reçus',
          route: '/admin/finance/payments',
          icon: {
            type: 'emoji',
            value: '💵',
          },
          order: 1.1,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Manager', 'Comptable', 'Caissier'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-cashier-close',
          label: 'Clôture de caisse',
          route: '/admin/finance/cashier-close',
          icon: {
            type: 'emoji',
            value: '🔒',
          },
          order: 1.2,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Comptable', 'Caissier'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-collection',
          label: 'Recouvrement & relances',
          route: '/admin/finance/collection',
          icon: {
            type: 'emoji',
            value: '📨',
          },
          order: 1.3,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Manager', 'Comptable', 'Caissier'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'finance-reports',
          label: 'Rapports financiers',
          route: '/admin/finance/reports',
          icon: {
            type: 'emoji',
            value: '📊',
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
          id: 'finance-bank-reconciliation',
          label: 'Rapprochement bancaire',
          route: '/admin/finance/bank-reconciliation',
          icon: {
            type: 'emoji',
            value: '🏦',
          },
          order: 3,
          module: 'Finance',
          parentId: 'finance',
          roles: ['admin', 'superadmin'],
          requiredRoles: ['Administrator', 'Comptable'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
