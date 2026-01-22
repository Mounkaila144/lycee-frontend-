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
} from '@/modules/Enrollment/admin/components'

/**
 * Registry mapping module:component to actual component
 */
export const adminComponentRegistry: Record<string, ComponentType<any>> = {

  // Users module
  'Users:UsersList': UsersList,

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
