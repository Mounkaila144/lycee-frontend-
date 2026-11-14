import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Module Settings — profil de l'établissement et réglages tenant. Story Admin 13.
 * Strictement réservé Administrator (les autres rôles lisent seulement le profil via l'API).
 */
export const settingsMenuConfig: ModuleMenuConfig = {
  module: 'Settings',
  menus: [
    {
      id: 'school-profile',
      label: 'Établissement',
      route: '/admin/settings/school',
      icon: { type: 'emoji', value: '🏫' },
      order: 199,
      module: 'Settings',
      roles: ['admin'],
      requiredRoles: ['Administrator'],
      isVisible: true,
      isActive: true,
    },
    {
      id: 'tenant-settings',
      label: 'Réglages avancés',
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
