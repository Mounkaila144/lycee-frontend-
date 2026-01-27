'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { teacherGradeService } from '../services/teacherGradeService';
import type {
  StudentGradeEntry,
  GradeStatistics,
  GradeEntryItem,
  AutoSaveStatus,
  GradeCellState,
} from '../../types/grade.types';

/**
 * Auto-save interval in milliseconds (30 seconds)
 */
const AUTO_SAVE_INTERVAL = 30000;

/**
 * Debounce delay for input changes in milliseconds
 */
const DEBOUNCE_DELAY = 500;

/**
 * Sort options for students
 */
export type SortOption = 'alphabetical' | 'matricule' | 'score_asc' | 'score_desc';

/**
 * Custom hook for grade entry with auto-save
 */
export const useGradeEntry = (evaluationId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  // State
  const [students, setStudents] = useState<StudentGradeEntry[]>([]);
  const [originalStudents, setOriginalStudents] = useState<StudentGradeEntry[]>([]);
  const [statistics, setStatistics] = useState<GradeStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Refs
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch students and grades for evaluation
   */
  const fetchStudents = useCallback(async () => {
    if (!evaluationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await teacherGradeService.getEvaluationStudents(evaluationId, tenantId);

      // Initialize students with is_modified = false
      const initializedData = data.map((entry) => ({
        ...entry,
        is_modified: false,
      }));

      setStudents(initializedData);
      setOriginalStudents(initializedData);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch students'));
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [evaluationId, tenantId]);

  /**
   * Fetch statistics for evaluation
   */
  const fetchStatistics = useCallback(async () => {
    if (!evaluationId) return;

    try {
      const data = await teacherGradeService.getEvaluationStatistics(evaluationId, tenantId);
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      // Don't set error state for statistics failure
    }
  }, [evaluationId, tenantId]);

  /**
   * Update a student's grade locally
   */
  const updateGrade = useCallback(
    (studentId: number, field: 'score' | 'is_absent' | 'comment', value: number | boolean | string | null) => {
      setStudents((prev) =>
        prev.map((entry) => {
          if (entry.student.id !== studentId) return entry;

          const updated = { ...entry, is_modified: true };

          if (field === 'score') {
            updated.score = value as number | null;
            // If score is entered, uncheck absent
            if (value !== null && value !== undefined) {
              updated.is_absent = false;
            }
          } else if (field === 'is_absent') {
            updated.is_absent = value as boolean;
            // If marked absent, clear score
            if (value === true) {
              updated.score = null;
            }
          } else if (field === 'comment') {
            updated.comment = value as string | null;
          }

          return updated;
        })
      );

      setHasUnsavedChanges(true);

      // Reset auto-save timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        saveGrades();
      }, AUTO_SAVE_INTERVAL);
    },
    []
  );

  /**
   * Validate a score value
   */
  const validateScore = useCallback((value: string | number | null): { valid: boolean; value: number | null; error?: string } => {
    if (value === null || value === '' || value === undefined) {
      return { valid: true, value: null };
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return { valid: false, value: null, error: 'Note invalide' };
    }

    if (numValue < 0) {
      return { valid: false, value: null, error: 'La note doit être >= 0' };
    }

    if (numValue > 20) {
      return { valid: false, value: null, error: 'La note doit être <= 20' };
    }

    // Round to 2 decimal places
    const roundedValue = Math.round(numValue * 100) / 100;

    return { valid: true, value: roundedValue };
  }, []);

  /**
   * Save all modified grades
   */
  const saveGrades = useCallback(async () => {
    if (!evaluationId) return;

    const modifiedEntries = students.filter((entry) => entry.is_modified);

    if (modifiedEntries.length === 0) {
      setAutoSaveStatus('saved');

      return;
    }

    try {
      setSaving(true);
      setAutoSaveStatus('saving');

      const grades: GradeEntryItem[] = modifiedEntries.map((entry) => ({
        evaluation_id: evaluationId,
        student_id: entry.student.id,
        score: entry.score,
        is_absent: entry.is_absent,
        comment: entry.comment || undefined,
      }));

      await teacherGradeService.saveGradesBatch(
        { grades },
        tenantId
      );

      // Mark all as saved
      setStudents((prev) =>
        prev.map((entry) => ({
          ...entry,
          is_modified: false,
        }))
      );

      setOriginalStudents(students.map((entry) => ({ ...entry, is_modified: false })));
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');

      // Refresh statistics
      await fetchStatistics();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save grades'));
      setAutoSaveStatus('error');
      console.error('Error saving grades:', err);
    } finally {
      setSaving(false);
    }
  }, [evaluationId, students, tenantId, fetchStatistics]);

  /**
   * Get cell state for visual indicator
   */
  const getCellState = useCallback((entry: StudentGradeEntry): GradeCellState => {
    if (entry.is_modified) return 'modified';
    if (entry.is_absent) return 'absent';
    if (entry.score !== null && entry.score !== undefined) return 'entered';

    return 'missing';
  }, []);

  /**
   * Filter and sort students
   */
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.student.matricule.toLowerCase().includes(query) ||
          entry.student.firstname.toLowerCase().includes(query) ||
          entry.student.lastname.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'alphabetical':
        result.sort((a, b) =>
          `${a.student.lastname} ${a.student.firstname}`.localeCompare(
            `${b.student.lastname} ${b.student.firstname}`
          )
        );
        break;
      case 'matricule':
        result.sort((a, b) => a.student.matricule.localeCompare(b.student.matricule));
        break;
      case 'score_asc':
        result.sort((a, b) => {
          if (a.score === null) return 1;
          if (b.score === null) return -1;

          return a.score - b.score;
        });
        break;
      case 'score_desc':
        result.sort((a, b) => {
          if (a.score === null) return 1;
          if (b.score === null) return -1;

          return b.score - a.score;
        });
        break;
    }

    return result;
  }, [students, searchQuery, sortBy]);

  /**
   * Get completion status
   */
  const completionStatus = useMemo(() => {
    const total = students.length;
    const entered = students.filter((s) => s.score !== null || s.is_absent).length;
    const missing = total - entered;
    const absent = students.filter((s) => s.is_absent).length;

    return {
      total,
      entered,
      missing,
      absent,
      percentage: total > 0 ? Math.round((entered / total) * 100) : 0,
      isComplete: missing === 0,
    };
  }, [students]);

  /**
   * Reset changes to original state
   */
  const resetChanges = useCallback(() => {
    setStudents(originalStudents);
    setHasUnsavedChanges(false);
    setAutoSaveStatus('idle');
  }, [originalStudents]);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    fetchStudents();
    fetchStatistics();
  }, [fetchStudents, fetchStatistics]);

  // Fetch data when evaluation changes
  useEffect(() => {
    if (evaluationId) {
      fetchStudents();
      fetchStatistics();
    } else {
      setStudents([]);
      setOriginalStudents([]);
      setStatistics(null);
    }

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [evaluationId, fetchStudents, fetchStatistics]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return {
    // Data
    students: filteredStudents,
    allStudents: students,
    statistics,
    completionStatus,

    // States
    loading,
    saving,
    error,
    autoSaveStatus,
    hasUnsavedChanges,

    // Filters
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,

    // Actions
    updateGrade,
    validateScore,
    saveGrades,
    getCellState,
    resetChanges,
    refresh,
  };
};
