import { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Module Settings — réglages tenant. Story Admin 13.
 * Strictement réservé Administrator.
 */
export const settingsMenuConfig: ModuleMenuConfig = {
  module: 'Settings',
  menus: [
    {
      id: 'tenant-settings',
      label: 'Réglages',
      route: '/admin/settings/tenant',
      icon: { type: 'emoji', value: '⚙️' },
      order: 200,
      module: 'Settings',
      roles: ['admin'],
      requiredRoles: ['Administrator'],
      isVisible: true,
      isActive: true,
    },
  ],
};
