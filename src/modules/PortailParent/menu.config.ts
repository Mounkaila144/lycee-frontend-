import { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Portail Parent — sidebar Parent.
 *
 * Couvre les Stories Parent 01-09. Items strictement réservés au rôle
 * `Parent`. L'Administrator peut naviguer sur ces routes via l'URL pour
 * du debug, mais elles ne pollue plus sa sidebar.
 */
export const portailParentMenuConfig: ModuleMenuConfig = {
  module: 'PortailParent',
  menus: [
    {
      id: 'parent-home',
      label: 'Accueil',
      route: '/admin/parent/home',
      icon: { type: 'emoji', value: '🏠' },
      order: 5,
      module: 'PortailParent',
      roles: ['admin'],
      requiredRoles: ['Parent'],
      isVisible: true,
      isActive: true,
    },
    {
      id: 'parent-children',
      label: 'Mes enfants',
      route: '/admin/parent/children',
      icon: { type: 'emoji', value: '👨‍👩‍👧' },
      order: 10,
      module: 'PortailParent',
      roles: ['admin'],
      requiredRoles: ['Parent'],
      isVisible: true,
      isActive: true,
    },
    {
      id: 'parent-messages',
      label: 'Messages',
      route: '/admin/parent/messages',
      icon: { type: 'emoji', value: '💬' },
      order: 20,
      module: 'PortailParent',
      roles: ['admin'],
      requiredRoles: ['Parent'],
      isVisible: true,
      isActive: true,
    },
    {
      id: 'parent-announcements',
      label: 'Annonces',
      route: '/admin/parent/announcements',
      icon: { type: 'emoji', value: '📢' },
      order: 30,
      module: 'PortailParent',
      roles: ['admin'],
      requiredRoles: ['Parent'],
      isVisible: true,
      isActive: true,
    },
  ],
};
