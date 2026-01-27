import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradeSubmissionService } from '../services';
import type {
  SubmitGradesRequest,
  SubmissionStatus,
  PreSubmissionCheck,
} from '../../types/validation.types';

/**
 * Hook for submitting grades for validation (Teacher)
 */
export const useGradeSubmission = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitGradesRequest) =>
      gradeSubmissionService.submitGrades(data, tenantId),
    onSuccess: () => {
      // Invalidate submission status queries
      queryClient.invalidateQueries({ queryKey: ['submission-status'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-modules'] });
    },
  });
};

/**
 * Hook for fetching submission status
 */
export const useSubmissionStatus = (
  params: {
    module_id: number;
    evaluation_id?: number;
    academic_year_id: number;
  },
  tenantId?: string
) => {
  return useQuery<SubmissionStatus>({
    queryKey: ['submission-status', params.module_id, params.evaluation_id, params.academic_year_id],
    queryFn: () => gradeSubmissionService.getSubmissionStatus(params, tenantId),
    enabled: !!params.module_id && !!params.academic_year_id,
  });
};

/**
 * Hook for performing pre-submission checks
 */
export const usePreSubmissionCheck = (tenantId?: string) => {
  return useMutation({
    mutationFn: (data: SubmitGradesRequest) =>
      gradeSubmissionService.performPreSubmissionCheck(data, tenantId),
  });
};
