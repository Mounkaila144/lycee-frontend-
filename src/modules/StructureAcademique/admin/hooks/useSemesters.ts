'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { academicCalendarService } from '../services/academicCalendarService'
import type { Semester, SemesterFormInput, CloseSemesterResponse } from '../../types/academicCalendar.types'

interface UseSemestersParams {
  academicYearId?: number
}

export const useSemesters = (params?: UseSemestersParams) => {
  const { tenantId } = useTenant()
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSemesters = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = params?.academicYearId ? { academic_year_id: params.academicYearId } : undefined
      const data = await academicCalendarService.getSemesters(queryParams, tenantId || undefined)
      setSemesters(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch semesters'
      setError(message)
      console.error('Error fetching semesters:', err)
    } finally {
      setLoading(false)
    }
  }, [tenantId, params?.academicYearId])

  useEffect(() => {
    fetchSemesters()
  }, [fetchSemesters])

  const createSemester = async (data: SemesterFormInput): Promise<Semester> => {
    const newSemester = await academicCalendarService.createSemester(data, tenantId || undefined)
    await fetchSemesters()
    return newSemester
  }

  const updateSemester = async (id: number, data: Partial<SemesterFormInput>): Promise<Semester> => {
    const updatedSemester = await academicCalendarService.updateSemester(id, data, tenantId || undefined)
    await fetchSemesters()
    return updatedSemester
  }

  const deleteSemester = async (id: number): Promise<void> => {
    await academicCalendarService.deleteSemester(id, tenantId || undefined)
    await fetchSemesters()
  }

  const closeSemester = async (id: number): Promise<CloseSemesterResponse> => {
    const response = await academicCalendarService.closeSemester(id, tenantId || undefined)
    await fetchSemesters()
    return response
  }

  return {
    semesters,
    loading,
    error,
    refetch: fetchSemesters,
    createSemester,
    updateSemester,
    deleteSemester,
    closeSemester
  }
}
