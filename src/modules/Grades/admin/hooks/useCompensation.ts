'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { compensationService } from '../services/compensationService';

import type {
  CompensationRules,
  CompensationSimulationResult,
  CompensationStatistics,
  CompensableModule,
} from '../../types/compensation.types';

/**
 * Custom hook for compensation management
 */
export const useCompensation = (semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  // State
  const [rules, setRules] = useState<CompensationRules | null>(null);
  const [simulation, setSimulation] = useState<CompensationSimulationResult | null>(null);
  const [statistics, setStatistics] = useState<CompensationStatistics | null>(null);
  const [rulesLoading, setRulesLoading] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Fetch compensation rules
   */
  const fetchRules = useCallback(async () => {
    try {
      setRulesLoading(true);
      setError(null);
      const data = await compensationService.getRules(tenantId);

      setRules(data);
    } catch (err) {
      // Default rules if none exist
      setRules({
        enabled: false,
        min_semester_average: 10,
        min_compensable_grade: 7,
        max_compensated_modules: 2,
        allow_professional: false,
      });
      console.error('Error fetching compensation rules:', err);
    } finally {
      setRulesLoading(false);
    }
  }, [tenantId]);

  /**
   * Update compensation rules
   */
  const updateRules = useCallback(async (newRules: Partial<CompensationRules>): Promise<boolean> => {
    try {
      setError(null);
      const data = await compensationService.updateRules(newRules, tenantId);

      setRules(data);
      setSuccessMessage('Règles de compensation mises à jour');

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update rules'));
      console.error('Error updating compensation rules:', err);

      return false;
    }
  }, [tenantId]);

  /**
   * Simulate compensation
   */
  const simulate = useCallback(async (): Promise<boolean> => {
    if (!semesterId) return false;

    try {
      setSimulating(true);
      setError(null);
      const data = await compensationService.simulate(semesterId, tenantId);

      setSimulation(data);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to simulate compensation'));
      console.error('Error simulating compensation:', err);

      return false;
    } finally {
      setSimulating(false);
    }
  }, [semesterId, tenantId]);

  /**
   * Apply compensation in bulk
   */
  const applyBulk = useCallback(async (): Promise<boolean> => {
    if (!semesterId) return false;

    try {
      setApplying(true);
      setError(null);
      const result = await compensationService.applyBulk(semesterId, tenantId);

      setSuccessMessage(result.message || `${result.applied_count} compensations appliquées`);
      // Refresh statistics after apply
      if (semesterId) {
        const stats = await compensationService.getStatistics(semesterId, tenantId);

        setStatistics(stats);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to apply compensation'));
      console.error('Error applying compensation:', err);

      return false;
    } finally {
      setApplying(false);
    }
  }, [semesterId, tenantId]);

  /**
   * Apply compensation for a specific student
   */
  const applyForStudent = useCallback(async (studentId: number): Promise<boolean> => {
    if (!semesterId) return false;

    try {
      setError(null);
      const result = await compensationService.applyForStudent(studentId, semesterId, tenantId);

      setSuccessMessage(result.message || 'Compensation appliquée');

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to apply compensation for student'));
      console.error('Error applying compensation for student:', err);

      return false;
    }
  }, [semesterId, tenantId]);

  /**
   * Remove compensation for a student module
   */
  const removeCompensation = useCallback(async (studentId: number, moduleId: number): Promise<boolean> => {
    if (!semesterId) return false;

    try {
      setError(null);
      await compensationService.removeCompensation(studentId, moduleId, semesterId, tenantId);
      setSuccessMessage('Compensation retirée');

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove compensation'));
      console.error('Error removing compensation:', err);

      return false;
    }
  }, [semesterId, tenantId]);

  /**
   * Get compensable modules for a student
   */
  const getCompensableModules = useCallback(async (studentId: number): Promise<CompensableModule[]> => {
    if (!semesterId) return [];

    try {
      return await compensationService.getCompensableModules(studentId, semesterId, tenantId);
    } catch (err) {
      console.error('Error fetching compensable modules:', err);

      return [];
    }
  }, [semesterId, tenantId]);

  /**
   * Fetch statistics
   */
  const fetchStatistics = useCallback(async () => {
    if (!semesterId) return;

    try {
      setStatsLoading(true);
      const data = await compensationService.getStatistics(semesterId, tenantId);

      setStatistics(data);
    } catch (err) {
      console.error('Error fetching compensation statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [semesterId, tenantId]);

  /**
   * Dismiss messages
   */
  const dismissMessage = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  // Fetch rules on mount
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Fetch statistics when semester changes
  useEffect(() => {
    if (semesterId) {
      fetchStatistics();
    } else {
      setStatistics(null);
      setSimulation(null);
    }
  }, [semesterId, fetchStatistics]);

  return {
    rules,
    simulation,
    statistics,
    rulesLoading,
    simulating,
    applying,
    statsLoading,
    error,
    successMessage,
    fetchRules,
    updateRules,
    simulate,
    applyBulk,
    applyForStudent,
    removeCompensation,
    getCompensableModules,
    fetchStatistics,
    dismissMessage,
  };
};
