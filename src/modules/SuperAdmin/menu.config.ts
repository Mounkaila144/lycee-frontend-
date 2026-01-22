import { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Super Admin Module Menu Configuration
 *
 * This file defines all menu items specific to the Super Admin role.
 * These menus provide system-wide management capabilities.
 */
export const superAdminMenuConfig: ModuleMenuConfig = {
  module: 'SuperAdmin',
  menus: [
    {
      id: 'superadmin-sites',
      label: 'Sites',
      route: '/superadmin/sites',
      icon: {
        type: 'emoji',
        value: '🌐',
      },
      order: 5,
      module: 'SuperAdmin',
      roles: ['superadmin'],
      isVisible: true,
      isActive: true,
    },
    {
      id: 'superadmin-modules',
      label: 'Module Management',
      route: '/superadmin/modules',
      icon: {
        type: 'emoji',
        value: '🧩',
      },
      order: 30,
      module: 'SuperAdmin',
      roles: ['superadmin'],
      isVisible: true,
      isActive: true,
    },
  ],
};
