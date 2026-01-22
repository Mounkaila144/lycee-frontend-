import { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * Structure Académique Module Menu Configuration
 *
 * This file defines all menu items for the Structure Académique module.
 */
export const structureAcademiqueMenuConfig: ModuleMenuConfig = {
  module: 'StructureAcademique',
  menus: [
    {
      id: 'structure-academique',
      label: 'Structure Académique',
      route: '/admin/structure',
      icon: {
        type: 'emoji',
        value: '🏛️',
      },
      order: 10,
      module: 'StructureAcademique',
      roles: ['admin', 'superadmin'],
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'structure-programmes',
          label: 'Programmes',
          route: '/admin/structure/programmes',
          icon: {
            type: 'emoji',
            value: '📚',
          },
          order: 1,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'structure-modules',
          label: 'Modules/UE',
          route: '/admin/structure/modules',
          icon: {
            type: 'emoji',
            value: '📖',
          },
          order: 2,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'structure-specialites',
          label: 'Spécialités',
          route: '/admin/structure/specializations',
          icon: {
            type: 'emoji',
            value: '🎓',
          },
          order: 3,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'structure-academic-years',
          label: 'Calendrier Académique',
          route: '/admin/structure/academic-years',
          icon: {
            type: 'emoji',
            value: '📅',
          },
          order: 4,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'structure-progression-rules',
          label: 'Règles de Progression',
          route: '/admin/structure/progression-rules',
          icon: {
            type: 'emoji',
            value: '📋',
          },
          order: 5,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'structure-statistics',
          label: 'Statistiques',
          route: '/admin/statistics',
          icon: {
            type: 'emoji',
            value: '📊',
          },
          order: 6,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
