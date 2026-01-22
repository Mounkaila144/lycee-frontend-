'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { academicCalendarService } from '../services/academicCalendarService'
import type { AcademicYear, AcademicYearFormInput } from '../../types/academicCalendar.types'

export const useAcademicYears = () => {
  const { tenantId } = useTenant()
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAcademicYears = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await academicCalendarService.getAcademicYears(tenantId || undefined)
      setAcademicYears(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch academic years'
      setError(message)
      console.error('Error fetching academic years:', err)
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchAcademicYears()
  }, [fetchAcademicYears])

  const createAcademicYear = async (data: AcademicYearFormInput): Promise<AcademicYear> => {
    const newYear = await academicCalendarService.createAcademicYear(data, tenantId || undefined)
    await fetchAcademicYears()
    return newYear
  }

  const updateAcademicYear = async (id: number, data: Partial<AcademicYearFormInput>): Promise<AcademicYear> => {
    const updatedYear = await academicCalendarService.updateAcademicYear(id, data, tenantId || undefined)
    await fetchAcademicYears()
    return updatedYear
  }

  const deleteAcademicYear = async (id: number): Promise<void> => {
    await academicCalendarService.deleteAcademicYear(id, tenantId || undefined)
    await fetchAcademicYears()
  }

  const activateAcademicYear = async (id: number): Promise<AcademicYear> => {
    const activatedYear = await academicCalendarService.activateAcademicYear(id, tenantId || undefined)
    await fetchAcademicYears()
    return activatedYear
  }

  return {
    academicYears,
    loading,
    error,
    refetch: fetchAcademicYears,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    activateAcademicYear
  }
}
