'use client'

import { useState, useEffect, useCallback } from 'react'

import { useTenant } from '@/shared/lib/tenant-context'
import type { Series, SeriesFormData } from '../../types/series.types'
import { seriesService } from '../services/seriesService'

export const useSeries = () => {
  const { tenantId } = useTenant()
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSeries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await seriesService.getSeries(undefined, tenantId || undefined)
      setSeries(data)
    } catch (err) {
      console.error('Error fetching series:', err)
      setError('Erreur lors du chargement des séries')
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  const createSeries = useCallback(
    async (data: SeriesFormData) => {
      const created = await seriesService.createSeries(data, tenantId || undefined)
      await fetchSeries()

      return created
    },
    [tenantId, fetchSeries]
  )

  const updateSeries = useCallback(
    async (id: number, data: Partial<SeriesFormData & { is_active?: boolean }>) => {
      const updated = await seriesService.updateSeries(id, data, tenantId || undefined)
      await fetchSeries()

      return updated
    },
    [tenantId, fetchSeries]
  )

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries])

  return {
    series,
    loading,
    error,
    refetch: fetchSeries,
    createSeries,
    updateSeries
  }
}
