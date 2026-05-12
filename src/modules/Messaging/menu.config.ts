import { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Module Messaging — accessible aux Parents et Professeurs
 * (Story Parent 07 + extension Prof). Admin a accès pour modération.
 */
export const messagingMenuConfig: ModuleMenuConfig = {
  module: 'Messaging',
  menus: [
    // Note: l'entrée Parent vit déjà dans PortailParent (parent-messages).
    // Cet item est destiné aux Professeurs qui ont leur propre point d'entrée.
    {
      id: 'teacher-messages',
      label: 'Messages',
      route: '/admin/teacher/messages',
      icon: { type: 'emoji', value: '✉️' },
      order: 50,
      module: 'Messaging',
      roles: ['admin'],
      requiredRoles: ['Professeur', 'Administrator'],
      isVisible: true,
      isActive: true,
    },
  ],
};
