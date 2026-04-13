import { ModuleMenuConfig } from '@/shared/types/menu-config.types'

/**
 * Structure Académique Module Menu Configuration
 * Adapted for collège-lycée (secondary school)
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
        value: '🏛️'
      },
      order: 10,
      module: 'StructureAcademique',
      roles: ['admin', 'superadmin'],
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'structure-academic-years',
          label: 'Années Scolaires',
          route: '/admin/structure/academic-years',
          icon: {
            type: 'emoji',
            value: '📅'
          },
          order: 1,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true
        },
        {
          id: 'structure-cycles-levels',
          label: 'Cycles et Niveaux',
          route: '/admin/structure/cycles-levels',
          icon: {
            type: 'emoji',
            value: '🏫'
          },
          order: 2,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true
        },
        {
          id: 'structure-series',
          label: 'Séries',
          route: '/admin/structure/series',
          icon: {
            type: 'emoji',
            value: '🎓'
          },
          order: 3,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true
        },
        {
          id: 'structure-classes',
          label: 'Classes',
          route: '/admin/structure/classes',
          icon: {
            type: 'emoji',
            value: '🏠'
          },
          order: 4,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true
        },
        {
          id: 'structure-subjects',
          label: 'Matières',
          route: '/admin/structure/subjects',
          icon: {
            type: 'emoji',
            value: '📚'
          },
          order: 5,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true
        },
        {
          id: 'structure-coefficients',
          label: 'Coefficients',
          route: '/admin/structure/coefficients',
          icon: {
            type: 'emoji',
            value: '⚖️'
          },
          order: 6,
          module: 'StructureAcademique',
          parentId: 'structure-academique',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true
        }
      ]
    }
  ]
}
