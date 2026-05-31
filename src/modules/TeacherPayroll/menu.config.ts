import type { ModuleMenuConfig } from '@/shared/types/menu-config.types';

/**
 * TeacherPayroll Module Menu Configuration
 * Paie des professeurs (statuts, modes de paiement, heures, fiches de paie).
 */
export const teacherPayrollMenuConfig: ModuleMenuConfig = {
  module: 'TeacherPayroll',
  menus: [
    {
      id: 'teacher-payroll',
      label: 'Paie Professeurs',
      route: '/admin/teacher-payroll/professeurs',
      icon: { type: 'emoji', value: '👨‍🏫' },
      order: 51,
      module: 'TeacherPayroll',
      roles: ['admin', 'superadmin'],
      isVisible: true,
      isActive: true,
      children: [
        {
          id: 'teacher-payroll-professeurs',
          label: 'Professeurs',
          route: '/admin/teacher-payroll/professeurs',
          icon: { type: 'emoji', value: '👥' },
          order: 1,
          module: 'TeacherPayroll',
          parentId: 'teacher-payroll',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'teacher-payroll-heures',
          label: 'Heures & validation',
          route: '/admin/teacher-payroll/heures',
          icon: { type: 'emoji', value: '⏱️' },
          order: 2,
          module: 'TeacherPayroll',
          parentId: 'teacher-payroll',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'teacher-payroll-ajustements',
          label: 'Primes & avances',
          route: '/admin/teacher-payroll/ajustements',
          icon: { type: 'emoji', value: '➕' },
          order: 3,
          module: 'TeacherPayroll',
          parentId: 'teacher-payroll',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'teacher-payroll-periodes',
          label: 'Périodes & paies',
          route: '/admin/teacher-payroll/periodes',
          icon: { type: 'emoji', value: '💰' },
          order: 4,
          module: 'TeacherPayroll',
          parentId: 'teacher-payroll',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
        {
          id: 'teacher-payroll-historique',
          label: 'Historique',
          route: '/admin/teacher-payroll/historique',
          icon: { type: 'emoji', value: '📜' },
          order: 5,
          module: 'TeacherPayroll',
          parentId: 'teacher-payroll',
          roles: ['admin', 'superadmin'],
          isVisible: true,
          isActive: true,
        },
      ],
    },
  ],
};
