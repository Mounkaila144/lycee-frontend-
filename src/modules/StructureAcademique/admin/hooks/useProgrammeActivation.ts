'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { programmeService } from '../services/programmeService'
import type { Programme } from '../../types/programme.types'

export interface ValidationCheck {
  label: string
  passed: boolean
  message?: string
}

export interface ActivationValidation {
  canActivate: boolean
  checks: ValidationCheck[]
}

export interface DeactivationValidation {
  canDeactivate: boolean
  checks: ValidationCheck[]
}

/**
 * Hook to manage programme activation/deactivation with validations
 */
export const useProgrammeActivation = (programmeId?: number) => {
  const { tenantId } = useTenant()
  const [loading, setLoading] = useState(false)
  const [programme, setProgramme] = useState<Programme | null>(null)
  const [activationChecks, setActivationChecks] = useState<ValidationCheck[]>([])
  const [deactivationChecks, setDeactivationChecks] = useState<ValidationCheck[]>([])
  const [canActivate, setCanActivate] = useState(false)
  const [canDeactivate, setCanDeactivate] = useState(false)

  /**
   * Validate programme for activation
   */
  const validateActivation = useCallback((prog: Programme): ActivationValidation => {
    const checks: ValidationCheck[] = []

    // Check 1: Has at least one level
    const levelsCount = prog.levels_count ?? prog.levels?.length ?? 0
    const hasLevels = levelsCount > 0
    checks.push({
      label: 'Au moins 1 niveau associé',
      passed: hasLevels,
      message: hasLevels ? undefined : 'Le programme doit avoir au moins un niveau'
    })

    // Check 2: Has responsable assigned
    const hasResponsable = !!(prog.responsable?.id || prog.responsable_id)
    checks.push({
      label: 'Responsable de programme assigné',
      passed: hasResponsable,
      message: hasResponsable ? undefined : 'Un responsable doit être assigné au programme'
    })

    // Check 3: Programme has valid structure (code, libelle, type, duration)
    const hasValidStructure = !!(prog.code && prog.libelle && prog.type && prog.duree_annees > 0)
    checks.push({
      label: 'Structure du programme valide',
      passed: hasValidStructure,
      message: hasValidStructure ? undefined : 'Le programme doit avoir un code, libellé, type et durée valides'
    })

    // Check 4: Not already active
    const notAlreadyActive = prog.statut !== 'Actif'
    checks.push({
      label: 'Programme non déjà actif',
      passed: notAlreadyActive,
      message: notAlreadyActive ? undefined : 'Le programme est déjà actif'
    })

    const canActivate = checks.every(check => check.passed)

    return { canActivate, checks }
  }, [])

  /**
   * Validate programme for deactivation
   */
  const validateDeactivation = useCallback((prog: Programme): DeactivationValidation => {
    const checks: ValidationCheck[] = []

    // Check 1: Programme is currently active
    const isActive = prog.statut === 'Actif'
    checks.push({
      label: 'Programme actuellement actif',
      passed: isActive,
      message: isActive ? undefined : 'Seuls les programmes actifs peuvent être désactivés'
    })

    // Check 2: No active enrollments (based on students_count)
    const noActiveEnrollments = (prog.students_count ?? 0) === 0
    checks.push({
      label: 'Aucune inscription active',
      passed: noActiveEnrollments,
      message: noActiveEnrollments
        ? undefined
        : `${prog.students_count} étudiant(s) inscrit(s) - impossible de désactiver`
    })

    // Check 3: Can be modified (permission check from backend)
    const canBeModified = prog.can_be_modified !== false
    checks.push({
      label: 'Autorisé à modifier',
      passed: canBeModified,
      message: canBeModified ? undefined : 'Vous n\'avez pas la permission de modifier ce programme'
    })

    const canDeactivate = checks.every(check => check.passed)

    return { canDeactivate, checks }
  }, [])

  /**
   * Fetch programme and run validations
   */
  const fetchAndValidate = useCallback(async () => {
    if (!programmeId) return

    setLoading(true)

    try {
      const prog = await programmeService.getProgramme(programmeId, tenantId || undefined)
      setProgramme(prog)

      // Run activation validation
      const activationResult = validateActivation(prog)
      setActivationChecks(activationResult.checks)
      setCanActivate(activationResult.canActivate)

      // Run deactivation validation
      const deactivationResult = validateDeactivation(prog)
      setDeactivationChecks(deactivationResult.checks)
      setCanDeactivate(deactivationResult.canDeactivate)
    } catch (error) {
      console.error('Error fetching programme for validation:', error)
    } finally {
      setLoading(false)
    }
  }, [programmeId, tenantId, validateActivation, validateDeactivation])

  /**
   * Activate programme
   */
  const activateProgramme = useCallback(async () => {
    if (!programmeId || !canActivate) {
      throw new Error('Cannot activate programme')
    }

    try {
      await programmeService.changeStatus(
        programmeId,
        { statut: 'Actif' },
        tenantId || undefined
      )

      // Refresh validation after activation
      await fetchAndValidate()
    } catch (error) {
      console.error('Error activating programme:', error)
      throw error
    }
  }, [programmeId, canActivate, tenantId, fetchAndValidate])

  /**
   * Deactivate programme
   */
  const deactivateProgramme = useCallback(async () => {
    if (!programmeId || !canDeactivate) {
      throw new Error('Cannot deactivate programme')
    }

    try {
      await programmeService.changeStatus(
        programmeId,
        { statut: 'Inactif' },
        tenantId || undefined
      )

      // Refresh validation after deactivation
      await fetchAndValidate()
    } catch (error) {
      console.error('Error deactivating programme:', error)
      throw error
    }
  }, [programmeId, canDeactivate, tenantId, fetchAndValidate])

  // Fetch and validate on mount or when programmeId changes
  useEffect(() => {
    if (programmeId) {
      fetchAndValidate()
    }
  }, [programmeId, fetchAndValidate])

  return {
    programme,
    loading,
    activationChecks,
    deactivationChecks,
    canActivate,
    canDeactivate,
    activateProgramme,
    deactivateProgramme,
    refresh: fetchAndValidate
  }
}
