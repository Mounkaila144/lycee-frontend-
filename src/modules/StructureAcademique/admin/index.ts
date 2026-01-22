// Components
export { default as AcademicYearList } from './components/AcademicYearList';
export { default as AcademicYearListTable } from './components/AcademicYearListTable';
export { default as AcademicYearFormDialog } from './components/AcademicYearFormDialog';
export { default as AcademicYearDeleteDialog } from './components/AcademicYearDeleteDialog';
export { default as SemesterManagementDialog } from './components/SemesterManagementDialog';
export { default as SemesterFormDialog } from './components/SemesterFormDialog';
export { default as SemesterClosureDialog } from './components/SemesterClosureDialog';
export { default as AcademicPeriodsDialog } from './components/AcademicPeriodsDialog';
export { default as AcademicPeriodFormDialog } from './components/AcademicPeriodFormDialog';
export { EvaluationPeriodsDialog } from './components/EvaluationPeriodsDialog';
export { EvaluationPeriodFormDialog } from './components/EvaluationPeriodFormDialog';
export { default as ProgrammeList } from './components/ProgrammeList';
export { default as ProgrammeListTable } from './components/ProgrammeListTable';
export { default as ProgrammeFormDialog } from './components/ProgrammeFormDialog';
export { default as ProgrammeDeleteDialog } from './components/ProgrammeDeleteDialog';
export { default as ProgrammeActivationDialog } from './components/ProgrammeActivationDialog';
export { default as ProgrammeHistoryDialog } from './components/ProgrammeHistoryDialog';
export { default as ProgrammeHistoryView } from './components/ProgrammeHistoryView';
export { default as ProgrammeHistoryTimeline } from './components/ProgrammeHistoryTimeline';
export { default as ProgrammeImportDialog } from './components/ProgrammeImportDialog';
export { default as ProgrammeExportDialog } from './components/ProgrammeExportDialog';
export { ProgrammeLevelSelector } from './components/ProgrammeLevelSelector';
export { ProgrammeLevelDialog } from './components/ProgrammeLevelDialog';
export { ProgrammeLevelBadges } from './components/ProgrammeLevelBadges';
export { default as GlobalCreditConfigDialog } from './components/GlobalCreditConfigDialog';
export { default as LevelCreditConfigTable } from './components/LevelCreditConfigTable';
export { default as LevelCreditConfigDialog } from './components/LevelCreditConfigDialog';
export { default as CreditValidationReport } from './components/CreditValidationReport';
export { default as ProgrammeCreditConfigDialog } from './components/ProgrammeCreditConfigDialog';
export { default as ModuleList } from './components/ModuleList';
export { default as ModuleListTable } from './components/ModuleListTable';
export { default as ModuleFormDialog } from './components/ModuleFormDialog';
export { default as ModuleDeleteDialog } from './components/ModuleDeleteDialog';
export { default as ModulePrerequisitesDialog } from './components/ModulePrerequisitesDialog';
export { default as ModuleDependencyGraphDialog } from './components/ModuleDependencyGraphDialog';
export { default as ModuleTeachersDialog } from './components/ModuleTeachersDialog';
export { default as EvaluationConfigDialog } from './components/EvaluationConfigDialog';
export { default as EvaluationConfigForm } from './components/EvaluationConfigForm';
export { default as TemplateSelector } from './components/TemplateSelector';
export { default as ConfigValidator } from './components/ConfigValidator';
export { default as ProgressionRuleList } from './components/ProgressionRuleList';
export { default as ProgressionRuleListTable } from './components/ProgressionRuleListTable';
export { default as ProgressionRuleFormDialog } from './components/ProgressionRuleFormDialog';
export { default as EliminatoryModulesDialog } from './components/EliminatoryModulesDialog';
export { default as ProgressionSimulatorDialog } from './components/ProgressionSimulatorDialog';
export { default as ProgrammeModulesDialog } from './components/ProgrammeModulesDialog';
export { default as ProgrammeModuleSelector } from './components/ProgrammeModuleSelector';
export { default as SemesterModulesDialog } from './components/SemesterModulesDialog';
export { default as SpecializationList } from './components/SpecializationList';
export { default as SpecializationListTable } from './components/SpecializationListTable';
export { default as SpecializationFormDialog } from './components/SpecializationFormDialog';
export { default as SpecializationDeleteDialog } from './components/SpecializationDeleteDialog';
export { default as SpecializationCandidatesDialog } from './components/SpecializationCandidatesDialog';
export { CoreCurriculumDialog } from './components/CoreCurriculumDialog';
export { SpecializationModulesDialog } from './components/SpecializationModulesDialog';
export { ElectiveChoiceDialog } from './components/ElectiveChoiceDialog';
export { CurriculumTreeView } from './components/CurriculumTreeView';
export { MaquetteGenerationDialog } from './components/MaquetteGenerationDialog';
export { StatsDashboard } from './components/StatsDashboard';
export { StatsCard } from './components/StatsCard';
export { VolumeChart } from './components/VolumeChart';
export { ModulesByLevelChart } from './components/ModulesByLevelChart';
export { CreditsByLevelChart } from './components/CreditsByLevelChart';
export { ProgramsByTypeChart } from './components/ProgramsByTypeChart';
export { useProgrammesContext } from './components/ProgrammeList';
export { useModulesContext } from './components/ModuleList';

// Hooks
export { useAcademicYears } from './hooks/useAcademicYears';
export { useSemesters } from './hooks/useSemesters';
export { useAcademicPeriods } from './hooks/useAcademicPeriods';
export { useEvaluationPeriods } from './hooks/useEvaluationPeriods';
export { useProgrammes } from './hooks/useProgrammes';
export { useProgrammeActivation } from './hooks/useProgrammeActivation';
export { useProgrammeHistory } from './hooks/useProgrammeHistory';
export { useProgrammeImportExport } from './hooks/useProgrammeImportExport';
export { useProgrammeLevels } from './hooks/useProgrammeLevels';
export { useGlobalLevelCredits, useProgramLevelCredits, useProgramCreditValidation } from './hooks/useLevelCredits';
export { useModules } from './hooks/useModules';
export { useModulePrerequisites, useModuleDependencyGraph } from './hooks/useModulePrerequisites';
export { useModuleTeachers } from './hooks/useModuleTeachers';
export { useTeachers } from './hooks/useTeachers';
export { useEvaluationConfig, useEvaluationTemplates } from './hooks/useEvaluationConfig';
export { useProgressionRules, useEliminatoryModules } from './hooks/useProgression';
export { useProgrammeModules } from './hooks/useProgrammeModules';
export { useSemesterModules, useModuleSemesterAssignments } from './hooks/useModuleSemester';
export { useSpecializations, useSpecialization } from './hooks/useSpecializations';
export { useSpecializationCandidates } from './hooks/useSpecializationCandidates';
export {
  useCoreCurriculum,
  useCoreCurriculumMutations,
  useSpecializationModules,
  useSpecializationModuleMutations,
  useAvailableElectives,
  useElectiveChoiceMutations,
  useStudentCurriculum,
} from './hooks/useCurriculum';
export { useMaquetteGeneration } from './hooks/useMaquette';
export {
  useGlobalStats,
  useVolumeDistribution,
  useVolumesByProgram,
  useProgramStats,
  useCreditsByLevel,
  useStatsActions,
} from './hooks/useStatistics';

// Services
export { academicCalendarService } from './services/academicCalendarService';
export { programmeService } from './services/programmeService';
export { programmeHistoryService } from './services/programmeHistoryService';
export { programmeLevelService } from './services/programmeLevelService';
export { levelCreditService } from './services/levelCreditService';
export { moduleService } from './services/moduleService';
export { modulePrerequisiteService } from './services/modulePrerequisiteService';
export { moduleTeacherService } from './services/moduleTeacherService';
export { teacherService } from './services/teacherService';
export { evaluationConfigService } from './services/evaluationConfigService';
export { progressionService } from './services/progressionService';
export { programmeModuleService } from './services/programmeModuleService';
export { moduleSemesterService } from './services/moduleSemesterService';
export { specializationService } from './services/specializationService';
export { curriculumService } from './services/curriculumService';
export { maquetteService } from './services/maquetteService';
export { statisticsService } from './services/statisticsService';
