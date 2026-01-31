'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
// Icons are using Remix Icon classes (ri-*)
import { usePedagogicalEnrollment, type EnrollmentWizardStep } from '../hooks/usePedagogicalEnrollment';
import { ModuleSelectionStep } from './ModuleSelectionStep';
import { GroupSelectionStep } from './GroupSelectionStep';
import { EnrollmentSummary } from './EnrollmentSummary';

interface PedagogicalEnrollmentWizardProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  programId: number;
  level: string;
  semesterId: number;
  academicYearId: number;
  studentInfo?: {
    matricule: string;
    firstname: string;
    lastname: string;
  };
  programInfo?: {
    code: string;
    name: string;
  };
  semesterInfo?: {
    name: string;
    code: string;
  };
  onEnrollmentComplete?: () => void;
  translations?: {
    title: string;
    steps: {
      selection: string;
      groups: string;
      summary: string;
      confirmation: string;
    };
    buttons: {
      back: string;
      next: string;
      submit: string;
      close: string;
      downloadPdf: string;
    };
    moduleSelection: {
      mandatory: string;
      optional: string;
      credits: string;
      totalCredits: string;
      minCredits: string;
      maxCredits: string;
      prerequisiteNotMet: string;
      moduleFull: string;
      capacity: string;
      enrolled: string;
      remaining: string;
      selectModules: string;
      creditsWarning: string;
      creditsError: string;
    };
    groupSelection: {
      selectGroup: string;
      groupCapacity: string;
      noGroupsRequired: string;
      groupFull: string;
      spotsRemaining: string;
      cm: string;
      td: string;
      tp: string;
    };
    summary: {
      summary: string;
      student: string;
      program: string;
      semester: string;
      selectedModules: string;
      totalCredits: string;
      mandatory: string;
      optional: string;
      moduleCode: string;
      moduleName: string;
      credits: string;
      type: string;
      group: string;
      noGroup: string;
      enrollmentSuccess: string;
      enrollmentId: string;
      downloadPdf: string;
      print: string;
      warnings: string;
    };
    errors: {
      loadFailed: string;
      submitFailed: string;
    };
  };
}

// Default translations (French)
const defaultTranslations: NonNullable<PedagogicalEnrollmentWizardProps['translations']> = {
  title: 'Inscription Pédagogique',
  steps: {
    selection: 'Sélection des modules',
    groups: 'Choix des groupes',
    summary: 'Récapitulatif',
    confirmation: 'Confirmation',
  },
  buttons: {
    back: 'Retour',
    next: 'Suivant',
    submit: 'Valider l\'inscription',
    close: 'Fermer',
    downloadPdf: 'Télécharger la fiche',
  },
  moduleSelection: {
    mandatory: 'Modules obligatoires',
    optional: 'Modules optionnels',
    credits: 'ECTS',
    totalCredits: 'Total crédits',
    minCredits: 'Minimum',
    maxCredits: 'Maximum',
    prerequisiteNotMet: 'Prérequis non validé',
    moduleFull: 'Module complet',
    capacity: 'Capacité',
    enrolled: 'Inscrits',
    remaining: 'Restants',
    selectModules: 'Sélectionnez les modules optionnels pour compléter votre semestre.',
    creditsWarning: 'Attention: vous dépassez le maximum de crédits recommandé.',
    creditsError: 'Vous devez sélectionner au moins 30 crédits ECTS.',
  },
  groupSelection: {
    selectGroup: 'Sélectionnez un groupe TD/TP pour ce module',
    groupCapacity: 'Places disponibles',
    noGroupsRequired: 'Aucun choix de groupe requis',
    groupFull: 'Groupe complet',
    spotsRemaining: 'places restantes',
    cm: 'Cours Magistral',
    td: 'Travaux Dirigés',
    tp: 'Travaux Pratiques',
  },
  summary: {
    summary: 'Récapitulatif de l\'inscription',
    student: 'Étudiant',
    program: 'Filière',
    semester: 'Semestre',
    selectedModules: 'Modules sélectionnés',
    totalCredits: 'Total crédits',
    mandatory: 'Obligatoire',
    optional: 'Optionnel',
    moduleCode: 'Code',
    moduleName: 'Intitulé',
    credits: 'Crédits',
    type: 'Type',
    group: 'Groupe',
    noGroup: 'Aucun',
    enrollmentSuccess: 'Inscription pédagogique enregistrée avec succès !',
    existingEnrollment: 'Inscription pédagogique existante',
    enrollmentId: 'Numéro d\'inscription',
    downloadPdf: 'Télécharger la fiche d\'inscription',
    print: 'Imprimer',
    warnings: 'Avertissements',
  },
  errors: {
    loadFailed: 'Erreur lors du chargement des modules disponibles.',
    submitFailed: 'Erreur lors de l\'enregistrement de l\'inscription.',
  },
};

/**
 * Pedagogical Enrollment Wizard Component
 */
export const PedagogicalEnrollmentWizard: React.FC<PedagogicalEnrollmentWizardProps> = ({
  open,
  onClose,
  studentId,
  programId,
  level,
  semesterId,
  academicYearId,
  studentInfo,
  programInfo,
  semesterInfo,
  onEnrollmentComplete,
  translations: propTranslations,
}) => {
  const translations = { ...defaultTranslations, ...propTranslations };

  const {
    availableModules,
    selectedModules,
    selectedModulesWithData,
    totalCredits,
    modulesNeedingGroups,
    enrollmentResult,
    loading,
    submitting,
    error,
    currentStep,
    canProceed,
    isExistingEnrollment,
    initializeEnrollment,
    toggleModuleSelection,
    updateGroupSelection,
    submitEnrollment,
    nextStep,
    previousStep,
    resetEnrollment,
    generateEnrollmentSheet,
  } = usePedagogicalEnrollment();

  // Initialize when dialog opens
  useEffect(() => {
    if (open) {
      initializeEnrollment(studentId, programId, level, semesterId, academicYearId);
    }

    return () => {
      if (!open) {
        resetEnrollment();
      }
    };
  }, [open, studentId, programId, level, semesterId, academicYearId]);

  const steps: { key: EnrollmentWizardStep; label: string }[] = [
    { key: 'selection', label: translations.steps.selection },
    { key: 'groups', label: translations.steps.groups },
    { key: 'summary', label: translations.steps.summary },
    { key: 'confirmation', label: translations.steps.confirmation },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const handleNext = async () => {
    if (currentStep === 'summary') {
      const result = await submitEnrollment();

      if (result?.success) {
        onEnrollmentComplete?.();
      }
    } else {
      nextStep();
    }
  };

  const handleDownloadPdf = async () => {
    const blob = await generateEnrollmentSheet();

    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiche_inscription_${studentInfo?.matricule || studentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleClose = () => {
    resetEnrollment();
    onClose();
  };

  const renderStepContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {currentStep === 'confirmation'
            ? translations.errors.submitFailed
            : translations.errors.loadFailed}
          <Typography variant="body2" mt={1}>
            {error.message}
          </Typography>
        </Alert>
      );
    }

    switch (currentStep) {
      case 'selection':
        return availableModules ? (
          <ModuleSelectionStep
            mandatoryModules={availableModules.mandatory}
            optionalModules={availableModules.optional}
            selectedModules={selectedModules}
            totalCredits={totalCredits}
            minCredits={availableModules.min_semester_credits}
            maxCredits={availableModules.max_semester_credits}
            onToggleModule={toggleModuleSelection}
            translations={translations.moduleSelection}
          />
        ) : null;

      case 'groups':
        return (
          <GroupSelectionStep
            modulesWithGroups={modulesNeedingGroups}
            selectedModules={selectedModules}
            onUpdateGroup={updateGroupSelection}
            translations={translations.groupSelection}
          />
        );

      case 'summary':
        return availableModules ? (
          <EnrollmentSummary
            selectedModules={selectedModulesWithData}
            moduleSelections={selectedModules}
            totalCredits={totalCredits}
            minCredits={availableModules.min_semester_credits}
            maxCredits={availableModules.max_semester_credits}
            studentInfo={studentInfo}
            programInfo={programInfo}
            semesterInfo={semesterInfo}
            translations={translations.summary}
          />
        ) : null;

      case 'confirmation':
        // For existing enrollments, we may not have availableModules loaded
        // Use enrollment data directly if available
        if (enrollmentResult?.enrollment) {
          const existingModules = enrollmentResult.enrollment.module_enrollments?.map((me: any) => ({
            id: me.module_id,
            code: me.module?.code || me.module_code || '',
            name: me.module?.name || me.module_name || '',
            credits_ects: me.module?.credits_ects || me.credits || 0,
            type: me.is_optional ? 'optional' as const : 'mandatory' as const,
            semester_id: me.semester_id,
            semester_name: '',
            capacity: null,
            enrolled_count: 0,
            remaining_capacity: null,
            is_full: false,
            prerequisite_status: 'met' as const,
            groups: [],
          })) || [];

          return (
            <EnrollmentSummary
              selectedModules={existingModules}
              moduleSelections={existingModules.map((m: any) => ({ module_id: m.id }))}
              totalCredits={enrollmentResult.total_credits}
              minCredits={30}
              maxCredits={36}
              studentInfo={studentInfo || (enrollmentResult.enrollment.student ? {
                matricule: enrollmentResult.enrollment.student.matricule,
                firstname: enrollmentResult.enrollment.student.firstname,
                lastname: enrollmentResult.enrollment.student.lastname,
              } : undefined)}
              programInfo={programInfo || (enrollmentResult.enrollment.program ? {
                code: enrollmentResult.enrollment.program.code,
                name: enrollmentResult.enrollment.program.libelle || enrollmentResult.enrollment.program.name,
              } : undefined)}
              semesterInfo={semesterInfo || (enrollmentResult.enrollment.semester ? {
                name: enrollmentResult.enrollment.semester.name,
                code: enrollmentResult.enrollment.semester.code || '',
              } : undefined)}
              enrollmentResult={enrollmentResult}
              onGeneratePdf={handleDownloadPdf}
              isConfirmation={true}
              isExistingEnrollment={isExistingEnrollment}
              translations={translations.summary}
            />
          );
        }

        // Fallback for newly created enrollment with availableModules
        return availableModules ? (
          <EnrollmentSummary
            selectedModules={selectedModulesWithData}
            moduleSelections={selectedModules}
            totalCredits={totalCredits}
            minCredits={availableModules.min_semester_credits}
            maxCredits={availableModules.max_semester_credits}
            studentInfo={studentInfo}
            programInfo={programInfo}
            semesterInfo={semesterInfo}
            enrollmentResult={enrollmentResult}
            onGeneratePdf={handleDownloadPdf}
            isConfirmation={true}
            isExistingEnrollment={false}
            translations={translations.summary}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isExistingEnrollment ? translations.summary.existingEnrollment : translations.title}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={currentStepIndex} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.key} completed={index < currentStepIndex}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>{renderStepContent()}</Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {currentStep !== 'confirmation' ? (
          <>
            <Button
              onClick={previousStep}
              disabled={currentStepIndex === 0 || loading || submitting}
              startIcon={<i className="ri-arrow-left-line" />}
            >
              {translations.buttons.back}
            </Button>
            <Box flex={1} />
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed || loading || submitting}
              endIcon={
                submitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : currentStep === 'summary' ? (
                  <i className="ri-check-line" />
                ) : (
                  <i className="ri-arrow-right-line" />
                )
              }
            >
              {currentStep === 'summary'
                ? translations.buttons.submit
                : translations.buttons.next}
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={handleClose}>
            {translations.buttons.close}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PedagogicalEnrollmentWizard;
