import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Documents Module Menu Configuration
 */
export const documentsMenuConfig: ModuleMenuConfig = {
  module: 'Documents',
  menus: [
    {
      id: 'documents',
      label: 'Documents Officiels',
      route: '/admin/documents',
      icon: {
        type: 'emoji',
        value: '\uD83D\uDCDC',
      },
      order: 55,
      module: 'Documents',
      roles: ['admin', 'superadmin'],
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'documents-transcripts',
          label: 'Relevés de Notes',
          route: '/admin/documents/transcripts',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCDD',
          },
          order: 1,
          module: 'Documents',
          parentId: 'documents',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'documents-diplomas',
          label: 'Diplômes',
          route: '/admin/documents/diplomas',
          icon: {
            type: 'emoji',
            value: '\uD83C\uDF93',
          },
          order: 2,
          module: 'Documents',
          parentId: 'documents',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'documents-certificates',
          label: 'Attestations',
          route: '/admin/documents/certificates',
          icon: {
            type: 'emoji',
            value: '\uD83D\uDCC4',
          },
          order: 3,
          module: 'Documents',
          parentId: 'documents',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'documents-cards',
          label: 'Cartes Étudiants',
          route: '/admin/documents/cards',
          icon: {
            type: 'emoji',
            value: '\uD83C\uDD94',
          },
          order: 4,
          module: 'Documents',
          parentId: 'documents',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'documents-verification',
          label: 'Vérification',
          route: '/admin/documents/verification',
          icon: {
            type: 'emoji',
            value: '\u2705',
          },
          order: 5,
          module: 'Documents',
          parentId: 'documents',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
