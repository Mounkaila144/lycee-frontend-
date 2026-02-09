'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { teacherGradeService } from '../services/teacherGradeService';
import type { AbsencePolicy, AbsenceType } from '../../types/absence.types';

/**
 * Custom hook for absence management
 * Manages multi-select, absence policy, and absence type operations
 */
export const useAbsenceManagement = (evaluationId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  // State
  const [absencePolicy, setAbsencePolicy] = useState<AbsencePolicy | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [bulkMarkingAbsent, setBulkMarkingAbsent] = useState(false);
  const [bulkAbsenceType, setBulkAbsenceType] = useState<AbsenceType>('unjustified');
  const [error, setError] = useState<string | null>(null);

  // Absence management modal state
  const [absenceModalOpen, setAbsenceModalOpen] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [selectedAbsenceType, setSelectedAbsenceType] = useState<AbsenceType | null>(null);

  /**
   * Fetch absence policy for the current evaluation
   */
  const fetchAbsencePolicy = useCallback(async () => {
    if (!evaluationId) return;

    try {
      setPolicyLoading(true);
      const policy = await teacherGradeService.getAbsencePolicy(evaluationId, tenantId);
      setAbsencePolicy(policy);
    } catch (err) {
      console.error('Error fetching absence policy:', err);
    } finally {
      setPolicyLoading(false);
    }
  }, [evaluationId, tenantId]);

  /**
   * Toggle student selection
   */
  const toggleStudentSelection = useCallback((studentId: number) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  }, []);

  /**
   * Select all students
   */
  const selectAllStudents = useCallback((studentIds: number[]) => {
    setSelectedStudentIds(new Set(studentIds));
  }, []);

  /**
   * Deselect all students
   */
  const deselectAllStudents = useCallback(() => {
    setSelectedStudentIds(new Set());
  }, []);

  /**
   * Mark selected students as absent (local + API call)
   * Returns the changes to apply locally
   */
  const markSelectedAbsent = useCallback(async (
    onApplyChanges: (studentIds: number[], absenceType: AbsenceType) => void
  ) => {
    if (selectedStudentIds.size === 0 || !evaluationId) return;

    setBulkMarkingAbsent(true);
    setError(null);

    try {
      // Apply changes locally first for responsiveness
      const ids = Array.from(selectedStudentIds);
      onApplyChanges(ids, bulkAbsenceType);

      // Clear selection
      setSelectedStudentIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage');
    } finally {
      setBulkMarkingAbsent(false);
    }
  }, [selectedStudentIds, evaluationId, bulkAbsenceType]);

  /**
   * Open absence management modal for a student
   */
  const openAbsenceModal = useCallback((
    gradeId: number,
    studentName: string,
    currentAbsenceType: AbsenceType | null
  ) => {
    setSelectedGradeId(gradeId);
    setSelectedStudentName(studentName);
    setSelectedAbsenceType(currentAbsenceType);
    setAbsenceModalOpen(true);
  }, []);

  /**
   * Close absence management modal
   */
  const closeAbsenceModal = useCallback(() => {
    setAbsenceModalOpen(false);
    setSelectedGradeId(null);
    setSelectedStudentName('');
    setSelectedAbsenceType(null);
  }, []);

  /**
   * Get the policy text for display
   */
  const getPolicyDescription = useCallback((): string => {
    if (!absencePolicy) return '';

    const parts: string[] = [];

    if (absencePolicy.unjustified_grade_is_zero) {
      parts.push('Absence non justifiée = 0');
    } else {
      parts.push('Absence non justifiée = exclu du calcul');
    }

    if (absencePolicy.justified_allows_replacement) {
      parts.push('Remplacement autorisé si justifié');
    }

    parts.push(`Délai justificatif: ${absencePolicy.justification_deadline_days}j`);

    return parts.join(' | ');
  }, [absencePolicy]);

  // Fetch policy when evaluation changes
  useEffect(() => {
    if (evaluationId) {
      fetchAbsencePolicy();
    } else {
      setAbsencePolicy(null);
    }

    // Reset selection when evaluation changes
    setSelectedStudentIds(new Set());
  }, [evaluationId, fetchAbsencePolicy]);

  return {
    // Policy
    absencePolicy,
    policyLoading,
    policyDescription: getPolicyDescription(),

    // Multi-select
    selectedStudentIds,
    toggleStudentSelection,
    selectAllStudents,
    deselectAllStudents,
    bulkAbsenceType,
    setBulkAbsenceType,
    bulkMarkingAbsent,
    markSelectedAbsent,

    // Absence modal
    absenceModalOpen,
    selectedGradeId,
    selectedStudentName,
    selectedAbsenceType,
    openAbsenceModal,
    closeAbsenceModal,

    // Error
    error,
    clearError: () => setError(null),
  };
};
