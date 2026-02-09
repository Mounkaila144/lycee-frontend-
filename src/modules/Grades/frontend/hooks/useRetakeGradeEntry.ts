'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { retakeGradeService } from '../services';
import type {
  TeacherRetakeModule,
  RetakeStudentEntry,
  RetakeGradeStatistics,
  StoreRetakeGradeRequest,
} from '../../types/retake.types';

const AUTO_SAVE_DELAY = 30000; // 30 seconds

/**
 * Hook for teacher's retake modules
 */
export const useTeacherRetakeModules = (
  params?: { semester_id?: number },
  tenantId?: string
) => {
  return useQuery({
    queryKey: ['teacher-retake-modules', params],
    queryFn: () => retakeGradeService.getMyRetakeModules(params, tenantId),
  });
};

/**
 * Hook for retake grade statistics
 */
export const useRetakeGradeStats = (
  moduleId: number | null,
  params?: { semester_id?: number },
  tenantId?: string
) => {
  return useQuery({
    queryKey: ['retake-grade-stats', moduleId, params],
    queryFn: () => retakeGradeService.getStatistics(moduleId!, params, tenantId),
    enabled: !!moduleId,
  });
};

/**
 * Combined hook for retake grade entry (Story 18)
 */
export const useRetakeGradeEntry = (moduleId: number | null, semesterId?: number) => {
  const queryClient = useQueryClient();
  const [localGrades, setLocalGrades] = useState<Map<number, { score: number | null; is_absent: boolean; comment: string | null }>>(new Map());
  const [modifiedIds, setModifiedIds] = useState<Set<number>>(new Set());
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Fetch students
  const studentsQuery = useQuery({
    queryKey: ['retake-students-entry', moduleId, semesterId],
    queryFn: () => retakeGradeService.getModuleRetakeStudents(moduleId!, { semester_id: semesterId }),
    enabled: !!moduleId,
  });

  // Fetch statistics
  const statsQuery = useQuery({
    queryKey: ['retake-grade-stats', moduleId, semesterId],
    queryFn: () => retakeGradeService.getStatistics(moduleId!, { semester_id: semesterId }),
    enabled: !!moduleId,
  });

  // Initialize local grades from server data
  useEffect(() => {
    if (studentsQuery.data) {
      const initial = new Map<number, { score: number | null; is_absent: boolean; comment: string | null }>();

      studentsQuery.data.forEach(entry => {
        initial.set(entry.retake_enrollment_id, {
          score: entry.retake_score,
          is_absent: entry.is_absent,
          comment: entry.comment,
        });
      });
      setLocalGrades(initial);
      setModifiedIds(new Set());
    }
  }, [studentsQuery.data]);

  // Store single grade mutation
  const storeGradeMutation = useMutation({
    mutationFn: (data: StoreRetakeGradeRequest) => retakeGradeService.storeGrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retake-grade-stats', moduleId] });
    },
  });

  // Batch save mutation
  const batchSaveMutation = useMutation({
    mutationFn: (grades: StoreRetakeGradeRequest[]) =>
      retakeGradeService.storeBatchGrades({ grades }),
    onSuccess: () => {
      setAutoSaveStatus('saved');
      setModifiedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['retake-students-entry', moduleId] });
      queryClient.invalidateQueries({ queryKey: ['retake-grade-stats', moduleId] });
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    },
    onError: () => {
      setAutoSaveStatus('error');
    },
  });

  // Submit grades mutation
  const submitMutation = useMutation({
    mutationFn: () => retakeGradeService.submitGrades(moduleId!, { semester_id: semesterId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retake-students-entry', moduleId] });
      queryClient.invalidateQueries({ queryKey: ['retake-grade-stats', moduleId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-retake-modules'] });
    },
  });

  // Update a grade locally
  const updateGrade = useCallback((enrollmentId: number, score: number | null, isAbsent: boolean, comment?: string | null) => {
    setLocalGrades(prev => {
      const next = new Map(prev);

      next.set(enrollmentId, {
        score: isAbsent ? null : score,
        is_absent: isAbsent,
        comment: comment ?? prev.get(enrollmentId)?.comment ?? null,
      });

      return next;
    });

    setModifiedIds(prev => {
      const next = new Set(prev);

      next.add(enrollmentId);

      return next;
    });

    // Reset auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveModifiedGrades();
    }, AUTO_SAVE_DELAY);
  }, []);

  // Save all modified grades
  const saveModifiedGrades = useCallback(() => {
    if (modifiedIds.size === 0) return;

    setAutoSaveStatus('saving');
    const gradesToSave: StoreRetakeGradeRequest[] = [];

    modifiedIds.forEach(enrollmentId => {
      const grade = localGrades.get(enrollmentId);

      if (grade) {
        gradesToSave.push({
          retake_enrollment_id: enrollmentId,
          score: grade.score,
          is_absent: grade.is_absent,
          comment: grade.comment ?? undefined,
        });
      }
    });

    if (gradesToSave.length > 0) {
      batchSaveMutation.mutate(gradesToSave);
    }
  }, [modifiedIds, localGrades, batchSaveMutation]);

  // Compute entries with local modifications
  const entries = useMemo((): RetakeStudentEntry[] => {
    if (!studentsQuery.data) return [];

    return studentsQuery.data.map(entry => {
      const local = localGrades.get(entry.retake_enrollment_id);

      if (!local) return entry;

      const retakeScore = local.is_absent ? null : local.score;
      const newAverage = retakeScore !== null && entry.original_average !== null
        ? Math.max(entry.original_average, retakeScore)
        : entry.original_average;

      return {
        ...entry,
        retake_score: retakeScore,
        is_absent: local.is_absent,
        comment: local.comment,
        new_average: newAverage,
        is_improved: newAverage !== null && entry.original_average !== null && newAverage > entry.original_average,
        improvement_amount: newAverage !== null && entry.original_average !== null ? newAverage - entry.original_average : null,
      };
    });
  }, [studentsQuery.data, localGrades]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Download template
  const downloadTemplate = useCallback(async () => {
    if (!moduleId) return;

    const blob = await retakeGradeService.downloadTemplate(moduleId, { semester_id: semesterId });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `retake-template-module-${moduleId}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [moduleId, semesterId]);

  return {
    // Data
    entries,
    statistics: statsQuery.data,
    hasModified: modifiedIds.size > 0,

    // Loading
    loading: studentsQuery.isLoading,
    statsLoading: statsQuery.isLoading,
    saving: batchSaveMutation.isPending,
    submitting: submitMutation.isPending,
    autoSaveStatus,

    // Error
    error: studentsQuery.error,

    // Actions
    updateGrade,
    saveAll: saveModifiedGrades,
    submit: () => submitMutation.mutate(),
    downloadTemplate,

    // Refresh
    refresh: () => {
      studentsQuery.refetch();
      statsQuery.refetch();
    },
  };
};
