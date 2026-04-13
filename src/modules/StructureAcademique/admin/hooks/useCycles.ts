'use client'

import { useState, useEffect, useCallback } from 'react'

import { useTenant } from '@/shared/lib/tenant-context'
import type { Cycle, Level } from '../../types/cycle.types'
import { cycleService } from '../services/cycleService'

export const useCycles = () => {
  const { tenantId } = useTenant()
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCycles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await cycleService.getCycles(tenantId || undefined)
      setCycles(data)
    } catch (err) {
      console.error('Error fetching cycles:', err)
      setError('Erreur lors du chargement des cycles')
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  const fetchLevels = useCallback(
    async (cycleId?: number) => {
      try {
        const data = await cycleService.getLevels(cycleId ? { cycle_id: cycleId } : undefined, tenantId || undefined)
        setLevels(data)

        return data
      } catch (err) {
        console.error('Error fetching levels:', err)

        return []
      }
    },
    [tenantId]
  )

  const updateCycle = useCallback(
    async (id: number, data: Partial<Cycle>) => {
      const updated = await cycleService.updateCycle(id, data, tenantId || undefined)
      await fetchCycles()

      return updated
    },
    [tenantId, fetchCycles]
  )

  useEffect(() => {
    fetchCycles()
    fetchLevels()
  }, [fetchCycles, fetchLevels])

  return {
    cycles,
    levels,
    loading,
    error,
    refetch: fetchCycles,
    fetchLevels,
    updateCycle
  }
}
