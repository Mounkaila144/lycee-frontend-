/**
 * Grades Module - Frontend Hooks Exports
 */
export { useTeacherModules } from './useTeacherModules';
export { useGradeEntry, type SortOption } from './useGradeEntry';
export { useGradePublish } from './useGradePublish';
export { useGradeImportExport } from './useGradeImportExport';
export { useGradeImport } from './useGradeImport';
export { useGradeCorrection } from './useGradeCorrection';
export {
  useClipboardPaste,
  parseClipboardData,
  parseGradeValue,
  validateBatchData,
} from './useClipboardPaste';
export { useAbsenceManagement } from './useAbsenceManagement';
export { useModuleAverages, calculateModuleAverageClientSide } from './useModuleAverages';
export { useRetakeGradeEntry, useTeacherRetakeModules, useRetakeGradeStats } from './useRetakeGradeEntry';
