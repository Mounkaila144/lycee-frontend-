import { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Dashboard Module Menu Configuration
 *
 * This file defines all menu items for the Dashboard module.
 * Menus are displayed in the admin and superadmin sidebars.
 */
export const dashboardMenuConfig: ModuleMenuConfig = {
  module: 'Dashboard',
  menus: [
    {
      id: 'dashboard-superadmin',
      label: 'Dashboard',
      route: '/superadmin/dashboard',
      icon: {
        type: 'emoji',
        value: '📊',
      },
      order: 1,
      module: 'Dashboard',
      roles: ['superadmin'],
      isVisible: true,
      isActive: true,
    },
  ],
};
