// Programme types
export type {
  Programme,
  ProgrammeType,
  ProgrammeStatus,
  ProgrammeFormData,
  ProgrammeFilters,
  ProgrammesListResponse,
  ProgrammeResponse,
  ProgrammeStatistics,
  ChangeStatusData,
} from './programme.types';

// Programme History types
export type {
  ProgrammeHistory,
  HistoryAction,
  ProgrammeHistoryQueryParams,
  PaginatedHistoryResponse,
  HistoryComparisonParams,
  HistoryComparison,
  RestoreVersionData,
} from './programme-history.types';

// Programme Level types
export type {
  ProgrammeLevel,
  ProgrammeLevelData,
  AssociateLevelsRequest,
  ProgrammeLevelResponse,
} from './programmeLevel.types';

export {
  getLevelsForProgramType,
  getLevelBadgeColor,
  getLevelLabel,
} from './programmeLevel.types';

// Maquette PDF types
export type {
  MaquetteScope,
  MaquetteFormat,
  MaquetteGenerationOptions,
  MaquetteGenerationRequest,
  MaquetteGenerationResponse,
  MaquettePreviewData,
  MaquetteDownloadParams,
} from './maquette.types';

// Statistics types
export type {
  ProgramStats,
  ModuleStats,
  TeacherStats,
  GlobalStats,
  VolumeData,
  VolumeDistribution,
  ProgramVolumeStats,
  ProgramLevelStats,
  ProgramDetailStats,
  CreditsByLevel,
  StatsResponse,
} from './statistics.types';

// Level Credit types
export type {
  AcademicLevel,
  LevelCreditConfiguration,
  LevelCreditFormData,
  CreditValidationResult,
  CreditValidationReport,
  LevelCreditResponse,
  LevelCreditsListResponse,
  CreditValidationResponse,
} from './levelCredit.types';

// Module types
export type {
  Module,
  ModuleType,
  ModuleSemester,
  ModuleLevel,
  ModuleFormData,
  ModuleQueryParams,
  PaginatedModulesResponse,
  ModuleResponse,
  ModuleStatistics,
} from './module.types';

export {
  getModuleTypeLabel,
  getModuleTypeBadgeColor,
  getModuleLevelLabel,
  getModuleSemesterLabel,
  isSemesterLevelConsistent,
  getSemestersForLevel,
} from './module.types';

// Module Prerequisite types
export type {
  PrerequisiteType,
  ModulePrerequisite,
  AddPrerequisiteRequest,
  PrerequisiteResponse,
  DependencyNode,
  DependencyGraphResponse,
  EnrollmentEligibility,
  EnrollmentEligibilityResponse,
} from './modulePrerequisite.types';

export {
  getPrerequisiteTypeLabel,
  getPrerequisiteTypeBadgeColor,
} from './modulePrerequisite.types';

// Module Teacher types
export type {
  TeachingType,
  ModuleTeacher,
  AssignTeacherRequest,
  TeacherWorkload,
  ModuleTeachersResponse,
  ModuleTeacherResponse,
  TeacherWorkloadResponse,
} from './moduleTeacher.types';

export {
  getTeachingTypeLabel,
  getTeachingTypeBadgeColor,
  getCurrentAcademicYear,
  getAcademicYears,
} from './moduleTeacher.types';

// Progression types
export type {
  ProgressionLevel,
  ProgressionStatus,
  ProgressionRule,
  ProgressionRuleFormData,
  EliminatoryModule,
  AddEliminatoryModuleRequest,
  ProgressionResult,
  ProgressionRulesResponse,
  ProgressionRuleResponse,
  EliminatoryModulesResponse,
  ProgressionResultResponse,
} from './progression.types';

export {
  getProgressionStatusLabel,
  getProgressionStatusColor,
  getTargetLevels,
  getTransitionLabel,
} from './progression.types';

// Programme Module types
export type {
  ProgrammeModule,
  AssociateModulesData,
  ProgrammeModulesResponse,
  ModulesByLevel,
  ProgrammeModuleStats,
} from './programmeModule.types';

export {
  groupModulesByLevel,
  calculateModuleStats,
} from './programmeModule.types';

// Evaluation Configuration types
export type {
  EvaluationType,
  EvaluationStatus,
  EvaluationConfig,
  EvaluationConfigFormInput,
  EvaluationTemplate,
  ValidationResult,
  PublishConfigResponse,
} from './evaluationConfig.types';

// Module Semester Assignment types
export type {
  ModuleSemesterAssignment,
  ModuleSemesterAssignmentFormInput,
  AttachModulesResponse,
  DetachModuleResponse,
  ModuleSemesterFilters,
} from './moduleSemester.types';

// Specialization types
export type {
  SpecializationType,
  SelectionMode,
  ApplicationStatus,
  Specialization,
  SpecializationFormInput,
  StudentSpecialization,
  SpecializationApplication,
  AssignmentCriteria,
  AssignmentResult,
} from './specialization.types';

// Curriculum types (Tronc Commun et Options)
export type {
  SpecializationModuleType,
  ModuleChoiceStatus,
  CoreCurriculumModule,
  SpecializationModule,
  StudentModuleChoice,
  CoreCurriculumModuleFormData,
  SpecializationModuleFormData,
  ElectiveChoiceFormData,
  AvailableElective,
  StudentCurriculum,
  CurriculumResult,
  CoreCurriculumResponse,
  SpecializationModulesResponse,
  AvailableElectivesResponse,
  StudentCurriculumResponse,
  CurriculumTreeNode,
} from './curriculum.types';

export {
  getSpecializationModuleTypeLabel,
  getSpecializationModuleTypeBadgeColor,
  getChoiceStatusLabel,
  getChoiceStatusColor,
} from './curriculum.types';
