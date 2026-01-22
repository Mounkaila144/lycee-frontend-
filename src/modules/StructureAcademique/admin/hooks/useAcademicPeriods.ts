'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { academicCalendarService } from '../services/academicCalendarService'
import type { AcademicPeriod, AcademicPeriodFormInput } from '../../types/academicCalendar.types'

interface UseAcademicPeriodsParams {
  semesterId?: number
}

export const useAcademicPeriods = (params?: UseAcademicPeriodsParams) => {
  const { tenantId } = useTenant()
  const [periods, setPeriods] = useState<AcademicPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = params?.semesterId ? { semester_id: params.semesterId } : undefined
      const data = await academicCalendarService.getAcademicPeriods(queryParams, tenantId || undefined)
      setPeriods(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch academic periods'
      setError(message)
      console.error('Error fetching academic periods:', err)
    } finally {
      setLoading(false)
    }
  }, [tenantId, params?.semesterId])

  useEffect(() => {
    fetchPeriods()
  }, [fetchPeriods])

  const createPeriod = async (data: AcademicPeriodFormInput): Promise<AcademicPeriod> => {
    const newPeriod = await academicCalendarService.createAcademicPeriod(data, tenantId || undefined)
    await fetchPeriods()
    return newPeriod
  }

  const updatePeriod = async (id: number, data: Partial<AcademicPeriodFormInput>): Promise<AcademicPeriod> => {
    const updatedPeriod = await academicCalendarService.updateAcademicPeriod(id, data, tenantId || undefined)
    await fetchPeriods()
    return updatedPeriod
  }

  const deletePeriod = async (id: number): Promise<void> => {
    await academicCalendarService.deleteAcademicPeriod(id, tenantId || undefined)
    await fetchPeriods()
  }

  return {
    periods,
    loading,
    error,
    refetch: fetchPeriods,
    createPeriod,
    updatePeriod,
    deletePeriod
  }
}
