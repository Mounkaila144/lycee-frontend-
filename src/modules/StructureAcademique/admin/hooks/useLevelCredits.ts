'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { levelCreditService } from '../services/levelCreditService';
import type {
  LevelCreditConfiguration,
  LevelCreditFormData,
  CreditValidationReport,
} from '../../types/levelCredit.types';

/**
 * Custom hook for managing global level credit configurations
 */
export const useGlobalLevelCredits = () => {
  const { tenantId } = useTenant();
  const [configurations, setConfigurations] = useState<LevelCreditConfiguration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await levelCreditService.getGlobalConfigurations(tenantId);
      setConfigurations(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch credit configurations'));
      console.error('Error fetching credit configurations:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const updateConfiguration = useCallback(
    async (data: LevelCreditFormData) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await levelCreditService.updateGlobalConfiguration(data, tenantId);
        await fetchConfigurations();
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update credit configuration'));
        console.error('Error updating credit configuration:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchConfigurations]
  );

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  return {
    configurations,
    loading,
    error,
    refresh: fetchConfigurations,
    updateConfiguration,
  };
};

/**
 * Custom hook for managing program-specific level credit configurations
 */
export const useProgramLevelCredits = (programId: number | null) => {
  const { tenantId } = useTenant();
  const [configurations, setConfigurations] = useState<LevelCreditConfiguration[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigurations = useCallback(async () => {
    if (!programId) {
      setConfigurations([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await levelCreditService.getProgramConfigurations(programId, tenantId);
      setConfigurations(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch program credit configurations'));
      console.error('Error fetching program credit configurations:', err);
    } finally {
      setLoading(false);
    }
  }, [programId, tenantId]);

  const updateConfiguration = useCallback(
    async (data: LevelCreditFormData) => {
      if (!programId) {
        throw new Error('Program ID is required');
      }

      try {
        setLoading(true);
        setError(null);
        const updated = await levelCreditService.updateProgramConfiguration(programId, data, tenantId);
        await fetchConfigurations();
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update program credit configuration'));
        console.error('Error updating program credit configuration:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [programId, tenantId, fetchConfigurations]
  );

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  return {
    configurations,
    loading,
    error,
    refresh: fetchConfigurations,
    updateConfiguration,
  };
};

/**
 * Custom hook for validating program credits
 */
export const useProgramCreditValidation = (programId: number | null) => {
  const { tenantId } = useTenant();
  const [validationReport, setValidationReport] = useState<CreditValidationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const validate = useCallback(async () => {
    if (!programId) {
      setValidationReport(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const report = await levelCreditService.validateProgramCredits(programId, tenantId);
      setValidationReport(report);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to validate program credits'));
      console.error('Error validating program credits:', err);
    } finally {
      setLoading(false);
    }
  }, [programId, tenantId]);

  useEffect(() => {
    validate();
  }, [validate]);

  return {
    validationReport,
    loading,
    error,
    validate,
  };
};
