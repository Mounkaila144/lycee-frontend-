'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { specializationService } from '../services/specializationService'
import type {
  StudentSpecialization,
  SpecializationApplication,
  AssignmentCriteria,
  AssignmentResult
} from '../../types/specialization.types'

export const useSpecializationCandidates = (specializationId: number | null) => {
  const { tenantId } = useTenant()
  const [candidates, setCandidates] = useState<StudentSpecialization[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCandidates = useCallback(async () => {
    if (!specializationId) {
      setCandidates([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await specializationService.getCandidates(specializationId, tenantId || undefined)
      setCandidates(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch candidates'
      setError(errorMessage)
      console.error('Error fetching candidates:', err)
    } finally {
      setLoading(false)
    }
  }, [specializationId, tenantId])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const applyForSpecialization = async (
    data: SpecializationApplication
  ): Promise<StudentSpecialization> => {
    if (!specializationId) {
      throw new Error('Specialization ID is required')
    }

    try {
      const application = await specializationService.apply(specializationId, data, tenantId || undefined)
      await fetchCandidates()
      return application
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply for specialization'
      setError(errorMessage)
      throw err
    }
  }

  const cancelApplication = async (): Promise<void> => {
    if (!specializationId) {
      throw new Error('Specialization ID is required')
    }

    try {
      await specializationService.cancelApplication(specializationId, tenantId || undefined)
      await fetchCandidates()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel application'
      setError(errorMessage)
      throw err
    }
  }

  const assignStudents = async (
    studentIds: number[],
    criteria?: AssignmentCriteria
  ): Promise<AssignmentResult> => {
    if (!specializationId) {
      throw new Error('Specialization ID is required')
    }

    try {
      const result = await specializationService.assignStudents(
        specializationId,
        studentIds,
        criteria,
        tenantId || undefined
      )
      await fetchCandidates()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign students'
      setError(errorMessage)
      throw err
    }
  }

  const promoteWaitlist = async (count: number): Promise<AssignmentResult> => {
    if (!specializationId) {
      throw new Error('Specialization ID is required')
    }

    try {
      const result = await specializationService.promoteWaitlist(specializationId, count, tenantId || undefined)
      await fetchCandidates()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to promote waitlist'
      setError(errorMessage)
      throw err
    }
  }

  return {
    candidates,
    loading,
    error,
    refetch: fetchCandidates,
    applyForSpecialization,
    cancelApplication,
    assignStudents,
    promoteWaitlist
  }
}
