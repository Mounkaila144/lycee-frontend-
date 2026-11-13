'use client'

import { useState, useEffect, useCallback } from 'react'

import { useTenant } from '@/shared/lib/tenant-context'
import type {
  Classe,
  ClasseFormData,
  ClasseQueryParams,
  ClasseStats,
  ClasseStudentsQueryParams
} from '../../types/classe.types'
import { classeService } from '../services/classeService'

export const useClasses = () => {
  const { tenantId } = useTenant()
  const [classes, setClasses] = useState<Classe[]>([])
  const [stats, setStats] = useState<ClasseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // L'API pagine (15 par défaut) : on charge toutes les classes de l'année en une page.
  const [params, setParams] = useState<ClasseQueryParams>({ per_page: 100 })

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await classeService.getClasses(params, tenantId || undefined)
      setClasses(data)
    } catch (err) {
      console.error('Error fetching classes:', err)
      setError('Erreur lors du chargement des classes')
    } finally {
      setLoading(false)
    }
  }, [tenantId, params])

  const fetchStats = useCallback(async () => {
    try {
      const data = await classeService.getStats(undefined, tenantId || undefined)
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [tenantId])

  const createClasse = useCallback(
    async (data: ClasseFormData) => {
      const created = await classeService.createClasse(data, tenantId || undefined)
      await fetchClasses()
      await fetchStats()

      return created
    },
    [tenantId, fetchClasses, fetchStats]
  )

  const updateClasse = useCallback(
    async (id: number, data: Partial<ClasseFormData>) => {
      const updated = await classeService.updateClasse(id, data, tenantId || undefined)
      await fetchClasses()

      return updated
    },
    [tenantId, fetchClasses]
  )

  const deleteClasse = useCallback(
    async (id: number) => {
      await classeService.deleteClasse(id, tenantId || undefined)
      await fetchClasses()
      await fetchStats()
    },
    [tenantId, fetchClasses, fetchStats]
  )

  const getAvailableHeadTeachers = useCallback(
    async (queryParams?: { academic_year_id?: number; exclude_class_id?: number }) => {
      return classeService.getAvailableHeadTeachers(queryParams, tenantId || undefined)
    },
    [tenantId]
  )

  const getClasseStudents = useCallback(
    async (id: number, queryParams?: ClasseStudentsQueryParams) => {
      return classeService.getClasseStudents(id, queryParams, tenantId || undefined)
    },
    [tenantId]
  )

  const updateParams = useCallback((newParams: ClasseQueryParams) => {
    // Les filtres sont remplacés (et non fusionnés) pour que « Réinitialiser » les efface réellement.
    setParams(prev => ({ per_page: prev.per_page, ...newParams }))
  }, [])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    classes,
    stats,
    loading,
    error,
    params,
    refetch: fetchClasses,
    createClasse,
    updateClasse,
    deleteClasse,
    getClasseStudents,
    getAvailableHeadTeachers,
    updateParams
  }
}
