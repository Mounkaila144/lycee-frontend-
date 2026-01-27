'use client';

import { useState, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { teacherGradeService } from '../services/teacherGradeService';
import type { PublishGradesResponse } from '../../types/grade.types';

/**
 * Custom hook for publishing grades
 */
export const useGradePublish = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [publishing, setPublishing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [completenessChecking, setCompletenessChecking] = useState<boolean>(false);
  const [completenessResult, setCompletenessResult] = useState<{
    is_complete: boolean;
    total_students: number;
    entered_count: number;
    missing_count: number;
    absent_count: number;
  } | null>(null);

  /**
   * Check completeness before publishing
   */
  const checkCompleteness = useCallback(
    async (evaluationId: number) => {
      try {
        setCompletenessChecking(true);
        setError(null);
        const result = await teacherGradeService.checkCompleteness(evaluationId, tenantId);
        setCompletenessResult(result);

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to check completeness'));
        console.error('Error checking completeness:', err);
        throw err;
      } finally {
        setCompletenessChecking(false);
      }
    },
    [tenantId]
  );

  /**
   * Publish grades for an evaluation
   */
  const publishGrades = useCallback(
    async (evaluationId: number, notifyStudents: boolean = true): Promise<PublishGradesResponse> => {
      try {
        setPublishing(true);
        setError(null);

        const result = await teacherGradeService.publishGrades(
          {
            evaluation_id: evaluationId,
            notify_students: notifyStudents,
          },
          tenantId
        );

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to publish grades'));
        console.error('Error publishing grades:', err);
        throw err;
      } finally {
        setPublishing(false);
      }
    },
    [tenantId]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setError(null);
    setCompletenessResult(null);
  }, []);

  return {
    // States
    publishing,
    completenessChecking,
    error,
    completenessResult,

    // Actions
    checkCompleteness,
    publishGrades,
    reset,
  };
};
