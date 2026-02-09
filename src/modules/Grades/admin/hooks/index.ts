/**
 * Grades Module - Admin Hooks Exports
 */
export { useCoefficientManagement } from './useCoefficientManagement';
export {
  useGradeValidations,
  useValidationStatistics,
  useGradeValidation,
  useValidateGrades,
  useRejectGrades,
  usePublishGrades,
  useBulkPublishGrades,
  useModuleAuditTrail,
  useCorrectionRequests,
  useCorrectionRequest,
  useApproveCorrectionRequest,
  useRejectCorrectionRequest,
} from './useGradeValidation';
export {
  useGradeSubmission,
  useSubmissionStatus,
  usePreSubmissionCheck,
} from './useGradeSubmission';
export { useEliminatoryManagement } from './useEliminatoryManagement';
export { useSemesterResults } from './useSemesterResults';
export { useEctsManagement } from './useEctsManagement';
export { useModuleResults } from './useModuleResults';
export { useCompensation } from './useCompensation';
export { useDeliberationSessions, useDeliberationSession, useDecisionReview } from './useDeliberation';
export { usePublications, usePublicationManagement } from './usePublication';
export {
  useRetakeManagement,
  useRetakeStatistics,
  useRetakeModules,
  useRetakeStudents,
  useModuleRetakeStudents,
  useIdentifyRetakes,
  useValidateRetakeGrades,
  usePublishRetakeGrades,
  useExportRetakeStudents,
} from './useRetakeManagement';
export {
  useRetakeRecalculation,
  useRecalculationLogs,
  useRecalculateAll,
  useRecalculateStudent,
} from './useRetakeRecalculation';
export {
  useFinalResults,
  useFinalStatistics,
  useFinalResultsList,
  usePublishFinalResults,
  useLockYear,
  useExportFinalResults,
} from './useFinalResults';
export { useStatistics } from './useStatistics';
export { useRanking } from './useRanking';
export { useProcesVerbal } from './useProcesVerbal';
export { useAnalytics } from './useAnalytics';
