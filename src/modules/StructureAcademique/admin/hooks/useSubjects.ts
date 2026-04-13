'use client'

import { useState, useEffect, useCallback } from 'react'

import { useTenant } from '@/shared/lib/tenant-context'
import type { Subject, SubjectFormData, SubjectQueryParams } from '../../types/subject.types'
import { subjectService } from '../services/subjectService'

export const useSubjects = () => {
  const { tenantId } = useTenant()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<SubjectQueryParams>({ per_page: 50 })
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0
  })

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await subjectService.getSubjects(params, tenantId || undefined)
      setSubjects(response.data)
      setPagination(response.meta)
    } catch (err) {
      console.error('Error fetching subjects:', err)
      setError('Erreur lors du chargement des matières')
    } finally {
      setLoading(false)
    }
  }, [tenantId, params])

  const createSubject = useCallback(
    async (data: SubjectFormData) => {
      const created = await subjectService.createSubject(data, tenantId || undefined)
      await fetchSubjects()

      return created
    },
    [tenantId, fetchSubjects]
  )

  const updateSubject = useCallback(
    async (id: number, data: Partial<SubjectFormData>) => {
      const updated = await subjectService.updateSubject(id, data, tenantId || undefined)
      await fetchSubjects()

      return updated
    },
    [tenantId, fetchSubjects]
  )

  const deleteSubject = useCallback(
    async (id: number) => {
      await subjectService.deleteSubject(id, tenantId || undefined)
      await fetchSubjects()
    },
    [tenantId, fetchSubjects]
  )

  const updateParams = useCallback((newParams: Partial<SubjectQueryParams>) => {
    setParams(prev => ({ ...prev, ...newParams }))
  }, [])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  return {
    subjects,
    loading,
    error,
    pagination,
    params,
    refetch: fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    updateParams
  }
}
