'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { programmeHistoryService } from '../services/programmeHistoryService'
import type {
  ProgrammeHistory,
  ProgrammeHistoryQueryParams,
  HistoryComparisonParams,
  HistoryComparison,
  RestoreVersionData,
} from '../../types/programme-history.types'

/**
 * Hook to manage programme history
 */
export const useProgrammeHistory = (programmeId?: number) => {
  const { tenantId } = useTenant()
  const [history, setHistory] = useState<ProgrammeHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
  })

  /**
   * Fetch history with filters
   */
  const fetchHistory = useCallback(
    async (params?: ProgrammeHistoryQueryParams) => {
      if (!programmeId) return

      setLoading(true)
      setError(null)

      try {
        const response = await programmeHistoryService.getHistory(
          programmeId,
          tenantId || undefined,
          params
        )

        setHistory(response.data)
        setPagination({
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          totalItems: response.meta.total,
          itemsPerPage: response.meta.per_page,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history')
        console.error('Error fetching programme history:', err)
      } finally {
        setLoading(false)
      }
    },
    [programmeId, tenantId]
  )

  /**
   * Compare two versions
   */
  const compareVersions = useCallback(
    async (params: HistoryComparisonParams): Promise<HistoryComparison | null> => {
      if (!programmeId) return null

      try {
        const comparison = await programmeHistoryService.compareVersions(
          programmeId,
          params,
          tenantId || undefined
        )

        return comparison
      } catch (err) {
        console.error('Error comparing versions:', err)
        throw err
      }
    },
    [programmeId, tenantId]
  )

  /**
   * Restore a version
   */
  const restoreVersion = useCallback(
    async (data: RestoreVersionData) => {
      if (!programmeId) return

      try {
        await programmeHistoryService.restoreVersion(programmeId, data, tenantId || undefined)

        // Refresh history after restoration
        await fetchHistory()
      } catch (err) {
        console.error('Error restoring version:', err)
        throw err
      }
    },
    [programmeId, tenantId, fetchHistory]
  )

  /**
   * Export history to PDF
   */
  const exportPDF = useCallback(async () => {
    if (!programmeId) return

    try {
      const blob = await programmeHistoryService.exportHistoryPDF(programmeId, tenantId || undefined)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `programme-${programmeId}-history.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting PDF:', err)
      throw err
    }
  }, [programmeId, tenantId])

  // Fetch history on mount
  useEffect(() => {
    if (programmeId) {
      fetchHistory()
    }
  }, [programmeId, fetchHistory])

  return {
    history,
    loading,
    error,
    pagination,
    fetchHistory,
    compareVersions,
    restoreVersion,
    exportPDF,
  }
}
