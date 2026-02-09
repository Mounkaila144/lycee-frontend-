import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradeValidationService } from '../services';
import type {
  GradeValidationFilters,
  ValidateGradesRequest,
  RejectGradesRequest,
  PublishGradesRequest,
  BulkPublishRequest,
  CorrectionRequestFilters,
} from '../../types/validation.types';

/**
 * Hook for fetching grade validations list
 */
export const useGradeValidations = (
  filters?: GradeValidationFilters,
  page: number = 1,
  perPage: number = 15,
  tenantId?: string
) => {
  return useQuery({
    queryKey: ['grade-validations', filters, page, perPage],
    queryFn: () => gradeValidationService.getValidations(filters, page, perPage, tenantId),
  });
};

/**
 * Hook for fetching validation statistics
 */
export const useValidationStatistics = (
  filters?: Pick<GradeValidationFilters, 'academic_year_id' | 'semester_id'>,
  tenantId?: string
) => {
  return useQuery({
    queryKey: ['validation-statistics', filters],
    queryFn: () => gradeValidationService.getStatistics(filters, tenantId),
  });
};

/**
 * Hook for fetching single validation details
 */
export const useGradeValidation = (validationId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['grade-validation', validationId],
    queryFn: () => gradeValidationService.getValidation(validationId, tenantId),
    enabled: !!validationId,
  });
};

/**
 * Hook for validating (approving) grades
 * Backend: POST /api/admin/grade-validations/{id}/validate
 * Body: { notes?: string }
 */
export const useValidateGrades = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ validationId, data }: { validationId: number; data: ValidateGradesRequest }) =>
      gradeValidationService.validateGrades(validationId, data, tenantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grade-validations'] });
      queryClient.invalidateQueries({ queryKey: ['grade-validation', variables.validationId] });
      queryClient.invalidateQueries({ queryKey: ['validation-statistics'] });
    },
  });
};

/**
 * Hook for rejecting grades
 * Backend: POST /api/admin/grade-validations/{id}/reject
 * Body: { reason: string }
 */
export const useRejectGrades = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ validationId, data }: { validationId: number; data: RejectGradesRequest }) =>
      gradeValidationService.rejectGrades(validationId, data, tenantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grade-validations'] });
      queryClient.invalidateQueries({ queryKey: ['grade-validation', variables.validationId] });
      queryClient.invalidateQueries({ queryKey: ['validation-statistics'] });
    },
  });
};

/**
 * Hook for publishing grades
 * Backend: POST /api/admin/grade-validations/{id}/publish
 * Body: { scheduled_at?: string }
 */
export const usePublishGrades = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      validationId,
      data,
    }: {
      validationId: number;
      data?: PublishGradesRequest;
    }) => gradeValidationService.publishGrades(validationId, data, tenantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grade-validations'] });
      queryClient.invalidateQueries({ queryKey: ['grade-validation', variables.validationId] });
      queryClient.invalidateQueries({ queryKey: ['validation-statistics'] });
    },
  });
};

/**
 * Hook for bulk publishing grades
 */
export const useBulkPublishGrades = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkPublishRequest) => gradeValidationService.bulkPublish(data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-validations'] });
      queryClient.invalidateQueries({ queryKey: ['validation-statistics'] });
    },
  });
};

/**
 * Hook for fetching module audit trail
 */
export const useModuleAuditTrail = (
  moduleId: number,
  params?: {
    page?: number;
    per_page?: number;
    date_from?: string;
    date_to?: string;
  },
  tenantId?: string
) => {
  return useQuery({
    queryKey: ['module-audit-trail', moduleId, params],
    queryFn: () => gradeValidationService.getModuleAuditTrail(moduleId, params, tenantId),
    enabled: !!moduleId,
  });
};

/**
 * Hook for fetching correction requests
 */
export const useCorrectionRequests = (
  filters?: CorrectionRequestFilters,
  page: number = 1,
  perPage: number = 15,
  tenantId?: string
) => {
  return useQuery({
    queryKey: ['correction-requests', filters, page, perPage],
    queryFn: () => gradeValidationService.getCorrectionRequests(filters, page, perPage, tenantId),
  });
};

/**
 * Hook for fetching single correction request
 */
export const useCorrectionRequest = (requestId: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['correction-request', requestId],
    queryFn: () => gradeValidationService.getCorrectionRequest(requestId, tenantId),
    enabled: !!requestId,
  });
};

/**
 * Hook for approving correction request
 */
export const useApproveCorrectionRequest = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, notes }: { requestId: number; notes?: string }) =>
      gradeValidationService.approveCorrectionRequest(requestId, { notes }, tenantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['correction-requests'] });
      queryClient.invalidateQueries({ queryKey: ['correction-request', variables.requestId] });
    },
  });
};

/**
 * Hook for rejecting correction request
 */
export const useRejectCorrectionRequest = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, notes }: { requestId: number; notes: string }) =>
      gradeValidationService.rejectCorrectionRequest(requestId, { notes }, tenantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['correction-requests'] });
      queryClient.invalidateQueries({ queryKey: ['correction-request', variables.requestId] });
    },
  });
};
