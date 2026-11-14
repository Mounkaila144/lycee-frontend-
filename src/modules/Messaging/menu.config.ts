import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Module Messaging — messagerie interne (Parents, Professeurs, direction)
 * et annonces de l'établissement.
 */
export const messagingMenuConfig: ModuleMenuConfig = {
  module: 'Messaging',
  menus: [
    // Note: l'entrée Parent vit déjà dans PortailParent (parent-messages, parent-announcements).
    {
      id: 'teacher-messages',
      label: 'Messages',
      route: '/admin/teacher/messages',
      icon: { type: 'emoji', value: '✉️' },
      order: 50,
      module: 'Messaging',
      roles: ['admin'],
      requiredRoles: ['Professeur'],
      isVisible: true,
      isActive: true,
    },
    {
      id: 'admin-messages',
      label: 'Messages',
      route: '/admin/messages',
      icon: { type: 'emoji', value: '✉️' },
      order: 85,
      module: 'Messaging',
      roles: ['admin'],
      requiredRoles: ['Administrator', 'Manager'],
      isVisible: true,
      isActive: true,
    },
    {
      id: 'admin-announcements',
      label: 'Annonces',
      route: '/admin/announcements',
      icon: { type: 'emoji', value: '📢' },
      order: 86,
      module: 'Messaging',
      roles: ['admin'],
      requiredRoles: ['Administrator', 'Manager'],
      isVisible: true,
      isActive: true,
    },
  ],
};
