'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { specializationService } from '../services/specializationService'
import type { Specialization, SpecializationFormInput } from '../../types/specialization.types'

export const useSpecializations = () => {
  const { tenantId } = useTenant()
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSpecializations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await specializationService.getAll(tenantId || undefined)
      setSpecializations(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch specializations'
      setError(errorMessage)
      console.error('Error fetching specializations:', err)
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchSpecializations()
  }, [fetchSpecializations])

  const createSpecialization = async (data: SpecializationFormInput): Promise<Specialization> => {
    try {
      const newSpecialization = await specializationService.create(data, tenantId || undefined)
      await fetchSpecializations()
      return newSpecialization
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create specialization'
      setError(errorMessage)
      throw err
    }
  }

  const updateSpecialization = async (id: number, data: SpecializationFormInput): Promise<Specialization> => {
    try {
      const updated = await specializationService.update(id, data, tenantId || undefined)
      await fetchSpecializations()
      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update specialization'
      setError(errorMessage)
      throw err
    }
  }

  const deleteSpecialization = async (id: number): Promise<void> => {
    try {
      await specializationService.delete(id, tenantId || undefined)
      await fetchSpecializations()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete specialization'
      setError(errorMessage)
      throw err
    }
  }

  return {
    specializations,
    loading,
    error,
    refetch: fetchSpecializations,
    createSpecialization,
    updateSpecialization,
    deleteSpecialization
  }
}

export const useSpecialization = (id: number | null) => {
  const { tenantId } = useTenant()
  const [specialization, setSpecialization] = useState<Specialization | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setSpecialization(null)
      return
    }

    const fetchSpecialization = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await specializationService.getById(id, tenantId || undefined)
        setSpecialization(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch specialization'
        setError(errorMessage)
        console.error('Error fetching specialization:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSpecialization()
  }, [id, tenantId])

  return { specialization, loading, error }
}
