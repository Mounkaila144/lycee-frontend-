'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { pedagogicalEnrollmentService } from '../services/pedagogicalEnrollmentService';
import type {
  AvailableModule,
  AvailableModulesResponse,
  ModuleSelection,
  PedagogicalEnrollmentRequest,
  EnrollmentResult,
  StudentEnrollment,
  CreditValidationResult,
} from '../../types/pedagogicalEnrollment.types';

/**
 * Wizard Step Type
 */
export type EnrollmentWizardStep = 'selection' | 'groups' | 'summary' | 'confirmation';

/**
 * Hook State Interface
 */
interface UsePedagogicalEnrollmentState {
  // Data
  availableModules: AvailableModulesResponse | null;
  selectedModules: ModuleSelection[];
  currentEnrollment: StudentEnrollment | null;
  enrollmentResult: EnrollmentResult | null;
  creditValidation: CreditValidationResult | null;

  // UI State
  loading: boolean;
  submitting: boolean;
  error: Error | null;
  currentStep: EnrollmentWizardStep;
  isExistingEnrollment: boolean; // True if viewing existing enrollment

  // Context
  studentId: number | null;
  programId: number | null;
  level: string | null;
  semesterId: number | null;
  academicYearId: number | null;
}

/**
 * Custom hook for managing pedagogical enrollment workflow
 */
export const usePedagogicalEnrollment = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [state, setState] = useState<UsePedagogicalEnrollmentState>({
    availableModules: null,
    selectedModules: [],
    currentEnrollment: null,
    enrollmentResult: null,
    creditValidation: null,
    loading: false,
    submitting: false,
    error: null,
    currentStep: 'selection',
    isExistingEnrollment: false,
    studentId: null,
    programId: null,
    level: null,
    semesterId: null,
    academicYearId: null,
  });

  /**
   * Initialize enrollment context
   */
  const initializeEnrollment = useCallback(
    async (
      studentId: number,
      programId: number,
      level: string,
      semesterId: number,
      academicYearId: number
    ) => {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        studentId,
        programId,
        level,
        semesterId,
        academicYearId,
      }));

      try {
        // First, check if student has ANY existing enrollment (broader check)
        // This catches enrollments regardless of hardcoded semester/program values
        const existingEnrollment = await pedagogicalEnrollmentService.hasExistingEnrollment(
          studentId,
          tenantId
        );

        // If an enrollment exists with modules, show confirmation
        if (existingEnrollment && existingEnrollment.module_enrollments && existingEnrollment.module_enrollments.length > 0) {
          // Transform existing enrollment to EnrollmentResult format
          const existingEnrollmentResult: EnrollmentResult = {
            success: true,
            enrollment: existingEnrollment,
            total_credits: existingEnrollment.total_credits,
            modules_count: existingEnrollment.modules_count,
            mandatory_modules: existingEnrollment.module_enrollments?.filter((m: any) => !m.is_optional).length || 0,
            optional_modules: existingEnrollment.module_enrollments?.filter((m: any) => m.is_optional).length || 0,
            warnings: [],
            errors: [],
          };

          // Update state with actual enrollment context (overriding hardcoded values)
          setState(prev => ({
            ...prev,
            currentEnrollment: existingEnrollment,
            enrollmentResult: existingEnrollmentResult,
            loading: false,
            currentStep: 'confirmation', // Go directly to confirmation
            isExistingEnrollment: true, // Mark as existing enrollment
            // Use actual values from existing enrollment
            programId: existingEnrollment.program_id,
            semesterId: existingEnrollment.semester_id,
            academicYearId: existingEnrollment.academic_year_id,
            level: existingEnrollment.level,
          }));

          return;
        }

        // No existing enrollment - fetch available modules for new enrollment
        const availableModules = await pedagogicalEnrollmentService.getAvailableModules(
          studentId,
          programId,
          level,
          semesterId,
          tenantId
        );

        // Pre-select mandatory modules
        const mandatorySelections: ModuleSelection[] = availableModules.mandatory
          .filter(m => m.prerequisite_status !== 'not_met')
          .map(m => ({ module_id: m.id }));

        setState(prev => ({
          ...prev,
          availableModules,
          currentEnrollment: null,
          selectedModules: mandatorySelections,
          loading: false,
          currentStep: 'selection', // Start with module selection
          isExistingEnrollment: false, // New enrollment
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err : new Error('Failed to initialize enrollment'),
        }));
      }
    },
    [tenantId]
  );

  /**
   * Toggle module selection
   */
  const toggleModuleSelection = useCallback((moduleId: number, groupId?: number) => {
    setState(prev => {
      const isSelected = prev.selectedModules.some(m => m.module_id === moduleId);

      let newSelections: ModuleSelection[];

      if (isSelected) {
        // Remove module
        newSelections = prev.selectedModules.filter(m => m.module_id !== moduleId);
      } else {
        // Add module
        newSelections = [...prev.selectedModules, { module_id: moduleId, group_id: groupId }];
      }

      return { ...prev, selectedModules: newSelections, creditValidation: null };
    });
  }, []);

  /**
   * Update group selection for a module
   */
  const updateGroupSelection = useCallback((moduleId: number, groupId: number) => {
    setState(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.map(m =>
        m.module_id === moduleId ? { ...m, group_id: groupId } : m
      ),
    }));
  }, []);

  /**
   * Validate credit selection
   */
  const validateCredits = useCallback(async () => {
    if (!state.studentId || !state.semesterId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const moduleIds = state.selectedModules.map(m => m.module_id);
      const validation = await pedagogicalEnrollmentService.validateCredits(
        state.studentId,
        moduleIds,
        state.semesterId,
        tenantId
      );

      setState(prev => ({ ...prev, creditValidation: validation, loading: false }));

      return validation;
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err : new Error('Failed to validate credits'),
      }));

      return null;
    }
  }, [state.studentId, state.semesterId, state.selectedModules, tenantId]);

  /**
   * Submit enrollment
   */
  const submitEnrollment = useCallback(async () => {
    if (
      !state.studentId ||
      !state.programId ||
      !state.level ||
      !state.semesterId ||
      !state.academicYearId
    ) {
      setState(prev => ({
        ...prev,
        error: new Error('Missing enrollment context'),
      }));

      return null;
    }

    setState(prev => ({ ...prev, submitting: true, error: null }));

    try {
      const request: PedagogicalEnrollmentRequest = {
        student_id: state.studentId,
        program_id: state.programId,
        level: state.level,
        semester_id: state.semesterId,
        academic_year_id: state.academicYearId,
        module_selections: state.selectedModules,
      };

      const result = await pedagogicalEnrollmentService.enrollStudent(request, tenantId);

      setState(prev => ({
        ...prev,
        enrollmentResult: result,
        submitting: false,
        currentStep: 'confirmation',
      }));

      return result;
    } catch (err) {
      setState(prev => ({
        ...prev,
        submitting: false,
        error: err instanceof Error ? err : new Error('Failed to submit enrollment'),
      }));

      return null;
    }
  }, [state, tenantId]);

  /**
   * Navigate to step
   */
  const goToStep = useCallback((step: EnrollmentWizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    setState(prev => {
      const steps: EnrollmentWizardStep[] = ['selection', 'groups', 'summary', 'confirmation'];
      const currentIndex = steps.indexOf(prev.currentStep);
      const nextIndex = Math.min(currentIndex + 1, steps.length - 1);

      return { ...prev, currentStep: steps[nextIndex] };
    });
  }, []);

  /**
   * Go to previous step
   */
  const previousStep = useCallback(() => {
    setState(prev => {
      const steps: EnrollmentWizardStep[] = ['selection', 'groups', 'summary', 'confirmation'];
      const currentIndex = steps.indexOf(prev.currentStep);
      const prevIndex = Math.max(currentIndex - 1, 0);

      return { ...prev, currentStep: steps[prevIndex] };
    });
  }, []);

  /**
   * Reset enrollment state
   */
  const resetEnrollment = useCallback(() => {
    setState({
      availableModules: null,
      selectedModules: [],
      currentEnrollment: null,
      enrollmentResult: null,
      creditValidation: null,
      loading: false,
      submitting: false,
      error: null,
      currentStep: 'selection',
      studentId: null,
      programId: null,
      level: null,
      semesterId: null,
      academicYearId: null,
    });
  }, []);

  /**
   * Generate enrollment sheet PDF
   * Note: PDF generation errors don't affect the enrollment success state
   */
  const generateEnrollmentSheet = useCallback(async () => {
    if (!state.enrollmentResult?.enrollment.id) {
      return null;
    }

    try {
      const blob = await pedagogicalEnrollmentService.generateEnrollmentSheet(
        state.enrollmentResult.enrollment.id,
        tenantId
      );

      return blob;
    } catch (err) {
      // Don't set error state for PDF generation failure
      // The enrollment was already successful
      console.error('PDF generation failed:', err);
      alert('Le téléchargement du PDF n\'est pas disponible pour le moment.');

      return null;
    }
  }, [state.enrollmentResult, tenantId]);

  /**
   * Computed: Get selected modules with full data
   */
  const selectedModulesWithData = useMemo((): AvailableModule[] => {
    if (!state.availableModules) return [];

    const allModules = [
      ...state.availableModules.mandatory,
      ...state.availableModules.optional,
    ];

    return state.selectedModules
      .map(sel => allModules.find(m => m.id === sel.module_id))
      .filter((m): m is AvailableModule => m !== undefined);
  }, [state.availableModules, state.selectedModules]);

  /**
   * Computed: Calculate total credits
   */
  const totalCredits = useMemo(() => {
    return selectedModulesWithData.reduce((sum, m) => sum + m.credits_ects, 0);
  }, [selectedModulesWithData]);

  /**
   * Computed: Check if modules need group selection
   */
  const modulesNeedingGroups = useMemo((): AvailableModule[] => {
    return selectedModulesWithData.filter(m => m.groups && m.groups.length > 0);
  }, [selectedModulesWithData]);

  /**
   * Computed: Check if all required groups are selected
   */
  const allGroupsSelected = useMemo(() => {
    return modulesNeedingGroups.every(m => {
      const selection = state.selectedModules.find(s => s.module_id === m.id);

      return selection?.group_id !== undefined;
    });
  }, [modulesNeedingGroups, state.selectedModules]);

  /**
   * Computed: Can proceed to next step
   */
  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 'selection':
        return state.selectedModules.length > 0 && totalCredits >= 30;
      case 'groups':
        return allGroupsSelected || modulesNeedingGroups.length === 0;
      case 'summary':
        return true;
      default:
        return false;
    }
  }, [state.currentStep, state.selectedModules, totalCredits, allGroupsSelected, modulesNeedingGroups]);

  return {
    // State
    ...state,

    // Computed
    selectedModulesWithData,
    totalCredits,
    modulesNeedingGroups,
    allGroupsSelected,
    canProceed,

    // Actions
    initializeEnrollment,
    toggleModuleSelection,
    updateGroupSelection,
    validateCredits,
    submitEnrollment,
    goToStep,
    nextStep,
    previousStep,
    resetEnrollment,
    generateEnrollmentSheet,
  };
};
