'use client'

import { useState, useCallback } from 'react'

import { useTenant } from '@/shared/lib/tenant-context'
import type {
  SubjectClassCoefficient,
  CoefficientFormData,
  CoefficientTotals,
  CoefficientComparisonResponse,
  DuplicateCoefficientsData,
  DuplicateReport
} from '../../types/coefficient.types'
import { coefficientService } from '../services/coefficientService'

export const useCoefficients = () => {
  const { tenantId } = useTenant()
  const [coefficients, setCoefficients] = useState<SubjectClassCoefficient[]>([])
  const [totals, setTotals] = useState<CoefficientTotals>({ total_coefficient: 0, total_hours: 0 })
  const [comparison, setComparison] = useState<CoefficientComparisonResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCoefficients = useCallback(
    async (levelId: number, seriesId?: number) => {
      try {
        setLoading(true)
        setError(null)
        const response = await coefficientService.getCoefficients(
          { level_id: levelId, series_id: seriesId },
          tenantId || undefined
        )
        setCoefficients(response.data)
        setTotals(response.totals)
      } catch (err) {
        console.error('Error fetching coefficients:', err)
        setError('Erreur lors du chargement des coefficients')
      } finally {
        setLoading(false)
      }
    },
    [tenantId]
  )

  const createCoefficient = useCallback(
    async (data: CoefficientFormData) => {
      const created = await coefficientService.createCoefficient(data, tenantId || undefined)
      await fetchCoefficients(data.level_id, data.series_id || undefined)

      return created
    },
    [tenantId, fetchCoefficients]
  )

  const updateCoefficient = useCallback(
    async (id: number, data: { coefficient?: number; hours_per_week?: number | null }, levelId: number, seriesId?: number) => {
      const updated = await coefficientService.updateCoefficient(id, data, tenantId || undefined)
      await fetchCoefficients(levelId, seriesId)

      return updated
    },
    [tenantId, fetchCoefficients]
  )

  const deleteCoefficient = useCallback(
    async (id: number, levelId: number, seriesId?: number) => {
      await coefficientService.deleteCoefficient(id, tenantId || undefined)
      await fetchCoefficients(levelId, seriesId)
    },
    [tenantId, fetchCoefficients]
  )

  const fetchComparison = useCallback(
    async (levelId: number) => {
      try {
        setLoading(true)
        setError(null)
        const data = await coefficientService.compare(levelId, tenantId || undefined)
        setComparison(data)
      } catch (err) {
        console.error('Error fetching comparison:', err)
        setError('Erreur lors du chargement de la comparaison')
      } finally {
        setLoading(false)
      }
    },
    [tenantId]
  )

  const exportComparePdf = useCallback(
    async (levelId: number) => {
      const blob = await coefficientService.exportComparePdf(levelId, tenantId || undefined)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `comparaison-coefficients.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    },
    [tenantId]
  )

  const duplicate = useCallback(
    async (data: DuplicateCoefficientsData): Promise<DuplicateReport> => {
      return await coefficientService.duplicate(data, tenantId || undefined)
    },
    [tenantId]
  )

  return {
    coefficients,
    totals,
    comparison,
    loading,
    error,
    fetchCoefficients,
    createCoefficient,
    updateCoefficient,
    deleteCoefficient,
    fetchComparison,
    exportComparePdf,
    duplicate
  }
}
