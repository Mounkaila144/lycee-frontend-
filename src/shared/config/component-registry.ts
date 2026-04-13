/**
 * Component Registry
 *
 * Central registry for all dynamically loadable components
 * This is required because Next.js webpack cannot resolve dynamic imports with template literals
 */

import { ComponentType } from 'react'

// Import all admin components
import { UsersList } from '@/modules/UsersGuard/admin/components/UsersList'
import {
  Students,
  Options,
  Groups,
  EnrollmentValidationDashboard,
  StudentCards,
  GroupAssignmentDashboard,
  PedagogicalEnrollmentWizard,
  ReenrollmentCampaigns,
  Reenrollments,
  Transfers,
  Exemptions,
  EnrollmentStatistics,
} from '@/modules/Enrollment/admin/components'
import {
  AcademicYearList,
  CycleLevelList,
  SeriesList,
  ClassList,
  SubjectList,
  CoefficientConfig,
  ProgrammeList,
  ModuleList,
  SpecializationList,
  StatsDashboard,
  ProgressionRuleList,
  EvaluationTemplateList,
} from '@/modules/StructureAcademique/admin'

/**
 * Registry mapping module:component to actual component
 */
export const adminComponentRegistry: Record<string, ComponentType<any>> = {

  // Users module
  'Users:UsersList': UsersList,

  // Structure Académique module
  'Structure:AcademicYears': AcademicYearList,
  'Structure:CyclesLevels': CycleLevelList,
  'Structure:Series': SeriesList,
  'Structure:Classes': ClassList,
  'Structure:Subjects': SubjectList,
  'Structure:Coefficients': CoefficientConfig,
  'Structure:Programmes': ProgrammeList,
  'Structure:Modules': ModuleList,
  'Structure:Specializations': SpecializationList,
  'Structure:ProgressionRules': ProgressionRuleList,
  'Structure:EvaluationTemplates': EvaluationTemplateList,

  // Enrollment module
  'Enrollment:Students': Students,
  'Enrollment:Options': Options,
  'Enrollment:Groups': Groups,
  'Enrollment:Validation': EnrollmentValidationDashboard,
  'Enrollment:StudentCards': StudentCards,
  'Enrollment:GroupAssignment': GroupAssignmentDashboard,
  'Enrollment:Pedagogical': PedagogicalEnrollmentWizard,
  'Enrollment:ReenrollmentCampaigns': ReenrollmentCampaigns,
  'Enrollment:Reenrollments': Reenrollments,
  'Enrollment:Transfers': Transfers,
  'Enrollment:Exemptions': Exemptions,
  'Enrollment:Statistics': EnrollmentStatistics,
}

/**
 * Registry mapping module:component to actual component for superadmin
 */
export const superadminComponentRegistry: Record<string, ComponentType<any>> = {
  // Add superadmin components here as needed
}

/**
 * Get component from registry
 */
export function getComponent(moduleName: string, componentName: string, context: 'admin' | 'superadmin' = 'admin'): ComponentType<any> | null {
  const key = `${moduleName}:${componentName}`
  const registry = context === 'admin' ? adminComponentRegistry : superadminComponentRegistry

  return registry[key] || null
}
