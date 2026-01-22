'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { academicCalendarService } from '../services/academicCalendarService'
import type { EvaluationPeriod, EvaluationPeriodFormInput } from '../../types/academicCalendar.types'

/**
 * Hook to fetch and manage evaluation periods for a semester
 */
export const useEvaluationPeriods = (semesterId: number | null) => {
  const { tenantId } = useTenant()
  const [evaluationPeriods, setEvaluationPeriods] = useState<EvaluationPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvaluationPeriods = useCallback(async () => {
    if (!semesterId) {
      setEvaluationPeriods([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await academicCalendarService.getEvaluationPeriods(semesterId, tenantId || undefined)
      setEvaluationPeriods(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch evaluation periods'
      setError(message)
      console.error('Error fetching evaluation periods:', err)
    } finally {
      setLoading(false)
    }
  }, [semesterId, tenantId])

  useEffect(() => {
    fetchEvaluationPeriods()
  }, [fetchEvaluationPeriods])

  const createEvaluationPeriod = async (
    data: Omit<EvaluationPeriodFormInput, 'semester_id'>
  ): Promise<EvaluationPeriod> => {
    if (!semesterId) throw new Error('Semester ID is required')
    const newPeriod = await academicCalendarService.createEvaluationPeriod(semesterId, data, tenantId || undefined)
    await fetchEvaluationPeriods()
    return newPeriod
  }

  const updateEvaluationPeriod = async (
    id: number,
    data: Partial<Omit<EvaluationPeriodFormInput, 'semester_id'>>
  ): Promise<EvaluationPeriod> => {
    if (!semesterId) throw new Error('Semester ID is required')
    const updatedPeriod = await academicCalendarService.updateEvaluationPeriod(
      semesterId,
      id,
      data,
      tenantId || undefined
    )
    await fetchEvaluationPeriods()
    return updatedPeriod
  }

  const deleteEvaluationPeriod = async (id: number): Promise<void> => {
    if (!semesterId) throw new Error('Semester ID is required')
    await academicCalendarService.deleteEvaluationPeriod(semesterId, id, tenantId || undefined)
    await fetchEvaluationPeriods()
  }

  return {
    evaluationPeriods,
    loading,
    error,
    refetch: fetchEvaluationPeriods,
    createEvaluationPeriod,
    updateEvaluationPeriod,
    deleteEvaluationPeriod
  }
}
