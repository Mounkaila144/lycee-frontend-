'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { optionService } from '../services/optionService';
import type {
  Option,
  OptionChoice,
  OptionAssignment,
  OptionChoiceFormData,
  AvailableOptionsResponse,
  ChoiceRank,
} from '../../types/option.types';

/**
 * Hook State Interface for Option Selection (Student/Frontend)
 */
interface UseOptionSelectionState {
  // Data
  availableOptions: Option[];
  studentChoices: OptionChoice[];
  studentAssignment: OptionAssignment | null;
  choicePeriod: {
    start_date: string;
    end_date: string;
    is_open: boolean;
    days_remaining?: number;
  } | null;

  // Draft choices (not yet submitted)
  draftChoices: Map<ChoiceRank, number | null>; // rank -> option_id

  // UI State
  loading: boolean;
  submitting: boolean;
  error: Error | null;
  success: boolean;
}

/**
 * Custom hook for student option selection workflow
 */
export const useOptionSelection = (studentId: number, academicYearId: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [state, setState] = useState<UseOptionSelectionState>({
    availableOptions: [],
    studentChoices: [],
    studentAssignment: null,
    choicePeriod: null,
    draftChoices: new Map([
      ['1', null],
      ['2', null],
      ['3', null],
    ]),
    loading: false,
    submitting: false,
    error: null,
    success: false,
  });

  /**
   * Load available options and current choices
   */
  const loadOptions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await optionService.getAvailableOptions(
        studentId,
        academicYearId,
        tenantId
      );

      // Initialize draft choices from existing choices
      const draftChoices = new Map<ChoiceRank, number | null>([
        ['1', null],
        ['2', null],
        ['3', null],
      ]);

      response.student_choices.forEach(choice => {
        // Convert choice_rank to string since backend may return it as number
        const rankKey = String(choice.choice_rank) as ChoiceRank;
        draftChoices.set(rankKey, choice.option_id);
      });

      setState(prev => ({
        ...prev,
        availableOptions: response.options,
        studentChoices: response.student_choices,
        studentAssignment: response.student_assignment,
        choicePeriod: response.choice_period ?? null,
        draftChoices,
        loading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err : new Error('Failed to load options'),
      }));
    }
  }, [studentId, academicYearId, tenantId]);

  /**
   * Set choice for a specific rank
   */
  const setChoice = useCallback((rank: ChoiceRank, optionId: number | null) => {
    setState(prev => {
      const newDraftChoices = new Map(prev.draftChoices);

      // Check if this option is already selected in another rank
      if (optionId !== null) {
        for (const [r, id] of newDraftChoices.entries()) {
          if (id === optionId && r !== rank) {
            // Remove from other rank
            newDraftChoices.set(r, null);
          }
        }
      }

      newDraftChoices.set(rank, optionId);

      return { ...prev, draftChoices: newDraftChoices, success: false };
    });
  }, []);

  /**
   * Clear a choice
   */
  const clearChoice = useCallback((rank: ChoiceRank) => {
    setState(prev => {
      const newDraftChoices = new Map(prev.draftChoices);
      newDraftChoices.set(rank, null);

      return { ...prev, draftChoices: newDraftChoices, success: false };
    });
  }, []);

  /**
   * Submit choices
   */
  const submitChoices = useCallback(async () => {
    setState(prev => ({ ...prev, submitting: true, error: null, success: false }));

    try {
      const choices: OptionChoiceFormData[] = [];

      state.draftChoices.forEach((optionId, rank) => {
        if (optionId !== null) {
          choices.push({
            option_id: optionId,
            choice_rank: rank,
          });
        }
      });

      if (choices.length === 0) {
        throw new Error('Please select at least one option');
      }

      const submittedChoices = await optionService.submitChoices(
        {
          student_id: studentId,
          academic_year_id: academicYearId,
          choices,
        },
        tenantId
      );

      setState(prev => ({
        ...prev,
        studentChoices: submittedChoices,
        submitting: false,
        success: true,
      }));

      return submittedChoices;
    } catch (err) {
      setState(prev => ({
        ...prev,
        submitting: false,
        error: err instanceof Error ? err : new Error('Failed to submit choices'),
      }));

      return null;
    }
  }, [state.draftChoices, studentId, academicYearId, tenantId]);

  /**
   * Check if choices can be modified
   */
  const canModifyChoices = useMemo(() => {
    return state.choicePeriod?.is_open && !state.studentAssignment;
  }, [state.choicePeriod, state.studentAssignment]);

  /**
   * Get option by ID
   */
  const getOptionById = useCallback(
    (optionId: number): Option | undefined => {
      return state.availableOptions.find(o => o.id === optionId);
    },
    [state.availableOptions]
  );

  /**
   * Check if an option is already selected
   */
  const isOptionSelected = useCallback(
    (optionId: number): boolean => {
      for (const id of state.draftChoices.values()) {
        if (id === optionId) return true;
      }

      return false;
    },
    [state.draftChoices]
  );

  /**
   * Get choice rank for an option
   */
  const getChoiceRankForOption = useCallback(
    (optionId: number): ChoiceRank | null => {
      for (const [rank, id] of state.draftChoices.entries()) {
        if (id === optionId) return rank;
      }

      return null;
    },
    [state.draftChoices]
  );

  /**
   * Count of selected choices
   */
  const selectedCount = useMemo(() => {
    let count = 0;

    state.draftChoices.forEach(id => {
      if (id !== null) count++;
    });

    return count;
  }, [state.draftChoices]);

  /**
   * Has changes from saved choices
   */
  const hasChanges = useMemo(() => {
    const savedChoicesMap = new Map<ChoiceRank, number | null>();

    state.studentChoices.forEach(c => {
      // Convert choice_rank to string since backend may return it as number
      const rankKey = String(c.choice_rank) as ChoiceRank;
      savedChoicesMap.set(rankKey, c.option_id);
    });

    for (const rank of ['1', '2', '3'] as ChoiceRank[]) {
      const draftValue = state.draftChoices.get(rank) || null;
      const savedValue = savedChoicesMap.get(rank) || null;

      if (draftValue !== savedValue) return true;
    }

    return false;
  }, [state.draftChoices, state.studentChoices]);

  return {
    // State
    ...state,

    // Computed
    canModifyChoices,
    selectedCount,
    hasChanges,

    // Actions
    loadOptions,
    setChoice,
    clearChoice,
    submitChoices,
    getOptionById,
    isOptionSelected,
    getChoiceRankForOption,
  };
};

/**
 * Custom hook for admin option management
 */
export const useOptionsAdmin = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Run automatic assignment
   */
  const runAssignment = useCallback(
    async (academicYearId: number, programId: number, level: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await optionService.runAutomaticAssignment(
          { academic_year_id: academicYearId, program_id: programId, level },
          tenantId
        );

        setLoading(false);

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Assignment failed'));
        setLoading(false);

        return null;
      }
    },
    [tenantId]
  );

  /**
   * Get global statistics
   */
  const getStatistics = useCallback(
    async (academicYearId: number, programId?: number, level?: string) => {
      setLoading(true);
      setError(null);

      try {
        const stats = await optionService.getGlobalStatistics(
          academicYearId,
          programId,
          level,
          tenantId
        );

        setLoading(false);

        return stats;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load statistics'));
        setLoading(false);

        return null;
      }
    },
    [tenantId]
  );

  /**
   * Manual assignment
   */
  const assignManually = useCallback(
    async (studentId: number, optionId: number, academicYearId: number, notes?: string) => {
      setLoading(true);
      setError(null);

      try {
        const assignment = await optionService.assignManually(
          {
            student_id: studentId,
            option_id: optionId,
            academic_year_id: academicYearId,
            assignment_notes: notes,
          },
          tenantId
        );

        setLoading(false);

        return assignment;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Manual assignment failed'));
        setLoading(false);

        return null;
      }
    },
    [tenantId]
  );

  return {
    loading,
    error,
    runAssignment,
    getStatistics,
    assignManually,
  };
};
