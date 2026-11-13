import { ModuleMenuConfig } from '@/shared/types/menu-config.types';

export const usersGuardMenuConfig: ModuleMenuConfig = {
  module: 'Users',
  menus: [
    {
      id: 'users',
      label: 'users',
      route: '/admin/users',
      icon: {
        type: 'emoji',
        value: '👥',
      },
      order: 10,
      module: 'usersGuard',
      roles: ['admin'],

      // Backend: GET /admin/users → role:Administrator|Manager
      requiredRoles: ['Administrator', 'Manager'],
      isVisible: true,
      isActive: true,
    },
  ],
};
