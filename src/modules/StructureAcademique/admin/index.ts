// ==================== Components ====================

// Academic Calendar
export { default as AcademicYearList } from './components/AcademicYearList'
export { default as AcademicYearListTable } from './components/AcademicYearListTable'
export { default as AcademicYearFormDialog } from './components/AcademicYearFormDialog'
export { default as AcademicYearDeleteDialog } from './components/AcademicYearDeleteDialog'
export { default as SemesterManagementDialog } from './components/SemesterManagementDialog'
export { default as SemesterFormDialog } from './components/SemesterFormDialog'
export { default as AcademicPeriodsDialog } from './components/AcademicPeriodsDialog'
export { default as AcademicPeriodFormDialog } from './components/AcademicPeriodFormDialog'
export { EvaluationPeriodsDialog } from './components/EvaluationPeriodsDialog'
export { EvaluationPeriodFormDialog } from './components/EvaluationPeriodFormDialog'

// Cycles & Levels
export { CycleLevelList } from './components/CycleLevelList'

// Series
export { SeriesList } from './components/SeriesList'

// Subjects
export { SubjectList } from './components/SubjectList'
export { SubjectFormDialog } from './components/SubjectFormDialog'
export { SubjectDeleteDialog } from './components/SubjectDeleteDialog'

// Classes
export { ClassList } from './components/ClassList'

// Coefficients
export { CoefficientConfig } from './components/CoefficientConfig'

// LMD Stubs (not yet migrated to secondary system)
export { default as ProgrammeList } from './components/ProgrammeList'
export { default as ProgressionRuleList } from './components/ProgressionRuleList'
export { default as EvaluationTemplateList } from './components/EvaluationTemplateList'
export { default as EvaluationTemplateDialog } from './components/EvaluationTemplateDialog'
export { default as ModuleList } from './components/ModuleList'
export { default as SpecializationList } from './components/SpecializationList'
export { default as StatsDashboard } from './components/StatsDashboard'
export { default as SemesterClosureDialog } from './components/SemesterClosureDialog'
export { default as SemesterModulesDialog } from './components/SemesterModulesDialog'

// ==================== Hooks ====================
export { useAcademicYears } from './hooks/useAcademicYears'
export { useSemesters } from './hooks/useSemesters'
export { useAcademicPeriods } from './hooks/useAcademicPeriods'
export { useEvaluationPeriods } from './hooks/useEvaluationPeriods'
export { useCycles } from './hooks/useCycles'
export { useSeries } from './hooks/useSeries'
export { useClasses } from './hooks/useClasses'
export { useSubjects } from './hooks/useSubjects'
export { useCoefficients } from './hooks/useCoefficients'

// ==================== Services ====================
export { academicCalendarService } from './services/academicCalendarService'
export { cycleService } from './services/cycleService'
export { seriesService } from './services/seriesService'
export { classeService } from './services/classeService'
export { subjectService } from './services/subjectService'
export { coefficientService } from './services/coefficientService'
export { moduleService } from './services/moduleService'
export { programmeService } from './services/programmeService'
