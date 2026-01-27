'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { adminCoefficientService } from '../services/adminCoefficientService';

import type {
  ModuleCoefficients,
  EvaluationCoefficient,
  CoefficientImpactSimulation,
  CoefficientHistoryEntry,
  CreditsHistoryEntry,
  CoefficientTemplate,
  COEFFICIENT_CONSTRAINTS,
  CREDITS_CONSTRAINTS,
} from '../../types/coefficient.types';

/**
 * Custom hook for coefficient management
 */
export const useCoefficientManagement = (moduleId: number | null, semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  // State
  const [moduleData, setModuleData] = useState<ModuleCoefficients | null>(null);
  const [templates, setTemplates] = useState<CoefficientTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Simulation state
  const [simulationLoading, setSimulationLoading] = useState<boolean>(false);
  const [simulation, setSimulation] = useState<CoefficientImpactSimulation | null>(null);

  // History state
  const [coefficientHistory, setCoefficientHistory] = useState<CoefficientHistoryEntry[]>([]);
  const [creditsHistory, setCreditsHistory] = useState<CreditsHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  /**
   * Fetch module coefficients data
   */
  const fetchModuleCoefficients = useCallback(async () => {
    if (!moduleId || !semesterId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await adminCoefficientService.getModuleCoefficients(moduleId, semesterId, tenantId);

      // Preserve credits_ects if it was already set (e.g., from updateCredits optimistic update)
      // because the coefficients API doesn't return credits_ects
      setModuleData((prev) => {
        if (prev?.credits_ects !== undefined && data.credits_ects === undefined) {
          return { ...data, credits_ects: prev.credits_ects };
        }

        return data;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch coefficients'));
      console.error('Error fetching coefficients:', err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, semesterId, tenantId]);

  /**
   * Fetch coefficient templates
   */
  const fetchTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      const data = await adminCoefficientService.getTemplates(tenantId);

      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setTemplatesLoading(false);
    }
  }, [tenantId]);

  /**
   * Update evaluation coefficient
   */
  const updateCoefficient = useCallback(
    async (evaluationId: number, coefficient: number, reason?: string): Promise<boolean> => {
      try {
        setSaving(true);
        setError(null);

        await adminCoefficientService.updateCoefficient(
          evaluationId,
          { coefficient, reason },
          tenantId
        );

        // Refresh data
        await fetchModuleCoefficients();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update coefficient'));
        console.error('Error updating coefficient:', err);

        return false;
      } finally {
        setSaving(false);
      }
    },
    [tenantId, fetchModuleCoefficients]
  );

  /**
   * Simulate coefficient change impact
   */
  const simulateImpact = useCallback(
    async (evaluationId: number, newCoefficient: number): Promise<CoefficientImpactSimulation | null> => {
      try {
        setSimulationLoading(true);
        const data = await adminCoefficientService.simulateImpact(
          evaluationId,
          { new_coefficient: newCoefficient },
          tenantId
        );

        setSimulation(data);

        return data;
      } catch (err) {
        console.error('Error simulating impact:', err);

        return null;
      } finally {
        setSimulationLoading(false);
      }
    },
    [tenantId]
  );

  /**
   * Clear simulation data
   */
  const clearSimulation = useCallback(() => {
    setSimulation(null);
  }, []);

  /**
   * Update module ECTS credits
   */
  const updateCredits = useCallback(
    async (credits: number, reason?: string): Promise<boolean> => {
      if (!moduleId) return false;

      try {
        setSaving(true);
        setError(null);

        const result = await adminCoefficientService.updateCredits(
          moduleId,
          { credits_ects: credits, reason },
          tenantId
        );

        // Optimistic update - update local state immediately with the response
        if (result && result.credits_ects !== undefined) {
          setModuleData((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              credits_ects: result.credits_ects,
            };
          });
        }

        // Also refresh data from server
        await fetchModuleCoefficients();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update credits'));
        console.error('Error updating credits:', err);

        return false;
      } finally {
        setSaving(false);
      }
    },
    [moduleId, tenantId, fetchModuleCoefficients]
  );

  /**
   * Fetch coefficient history for an evaluation
   */
  const fetchCoefficientHistory = useCallback(
    async (evaluationId: number): Promise<CoefficientHistoryEntry[]> => {
      try {
        setHistoryLoading(true);
        const data = await adminCoefficientService.getCoefficientHistory(evaluationId, tenantId);

        setCoefficientHistory(data);

        return data;
      } catch (err) {
        console.error('Error fetching coefficient history:', err);

        return [];
      } finally {
        setHistoryLoading(false);
      }
    },
    [tenantId]
  );

  /**
   * Fetch credits history for the module
   */
  const fetchCreditsHistory = useCallback(async (): Promise<CreditsHistoryEntry[]> => {
    if (!moduleId) return [];

    try {
      setHistoryLoading(true);
      const data = await adminCoefficientService.getCreditsHistory(moduleId, tenantId);

      setCreditsHistory(data);

      return data;
    } catch (err) {
      console.error('Error fetching credits history:', err);

      return [];
    } finally {
      setHistoryLoading(false);
    }
  }, [moduleId, tenantId]);

  /**
   * Apply a template to the module
   */
  const applyTemplate = useCallback(
    async (templateId: number): Promise<boolean> => {
      if (!moduleId) return false;

      try {
        setSaving(true);
        setError(null);

        await adminCoefficientService.applyTemplate(
          moduleId,
          { template_id: templateId },
          tenantId
        );

        // Refresh data
        await fetchModuleCoefficients();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to apply template'));
        console.error('Error applying template:', err);

        return false;
      } finally {
        setSaving(false);
      }
    },
    [moduleId, tenantId, fetchModuleCoefficients]
  );

  /**
   * Create a custom template
   */
  const createTemplate = useCallback(
    async (
      name: string,
      description: string | undefined,
      evaluations: { type: string; coefficient: number }[]
    ): Promise<boolean> => {
      try {
        setSaving(true);
        setError(null);

        await adminCoefficientService.createTemplate(
          { name, description, evaluations: evaluations as any },
          tenantId
        );

        // Refresh templates
        await fetchTemplates();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create template'));
        console.error('Error creating template:', err);

        return false;
      } finally {
        setSaving(false);
      }
    },
    [tenantId, fetchTemplates]
  );

  /**
   * Validate coefficient value
   */
  const validateCoefficient = useCallback(
    (value: number): { valid: boolean; error?: string } => {
      if (value < 0.25) {
        return { valid: false, error: 'Le coefficient minimum est 0.25' };
      }

      if (value > 10) {
        return { valid: false, error: 'Le coefficient maximum est 10' };
      }

      // Check step (0.25)
      if ((value * 100) % 25 !== 0) {
        return { valid: false, error: 'Le coefficient doit être un multiple de 0.25' };
      }

      return { valid: true };
    },
    []
  );

  /**
   * Validate credits value
   */
  const validateCredits = useCallback((value: number): { valid: boolean; error?: string } => {
    if (!Number.isInteger(value)) {
      return { valid: false, error: 'Les crédits doivent être un nombre entier' };
    }

    if (value < 1) {
      return { valid: false, error: 'Les crédits minimum sont 1' };
    }

    if (value > 30) {
      return { valid: false, error: 'Les crédits maximum sont 30' };
    }

    return { valid: true };
  }, []);

  /**
   * Calculate total coefficients
   */
  const totalCoefficients = useMemo(() => {
    if (!moduleData?.evaluations) return 0;

    return moduleData.evaluations.reduce((sum, ev) => sum + ev.coefficient, 0);
  }, [moduleData]);

  /**
   * Get evaluations grouped by type
   */
  const evaluationsByType = useMemo(() => {
    if (!moduleData?.evaluations) return {};

    return moduleData.evaluations.reduce(
      (acc, ev) => {
        if (!acc[ev.type]) {
          acc[ev.type] = [];
        }

        acc[ev.type].push(ev);

        return acc;
      },
      {} as Record<string, EvaluationCoefficient[]>
    );
  }, [moduleData]);

  /**
   * Check if module can be modified
   */
  const canModify = useMemo(() => {
    if (!moduleData) return false;

    return moduleData.can_modify;
  }, [moduleData]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(() => {
    fetchModuleCoefficients();
    fetchTemplates();
  }, [fetchModuleCoefficients, fetchTemplates]);

  // Fetch data when module or semester changes
  useEffect(() => {
    if (moduleId && semesterId) {
      fetchModuleCoefficients();
      fetchTemplates();
    } else {
      setModuleData(null);
    }
  }, [moduleId, semesterId, fetchModuleCoefficients, fetchTemplates]);

  return {
    // Data
    moduleData,
    templates,
    totalCoefficients,
    evaluationsByType,
    canModify,

    // Simulation
    simulation,
    simulationLoading,
    simulateImpact,
    clearSimulation,

    // History
    coefficientHistory,
    creditsHistory,
    historyLoading,
    fetchCoefficientHistory,
    fetchCreditsHistory,

    // States
    loading,
    templatesLoading,
    saving,
    error,

    // Actions
    updateCoefficient,
    updateCredits,
    applyTemplate,
    createTemplate,
    validateCoefficient,
    validateCredits,
    refresh,
  };
};
