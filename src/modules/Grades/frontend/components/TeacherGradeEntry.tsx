'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';

// Components
import { TeacherModulesList } from './TeacherModulesList';
import { EvaluationSelector } from './EvaluationSelector';
import { GradeEntryTable } from './GradeEntryTable';
import { GradeStatisticsPanel } from './GradeStatisticsPanel';
import { GradeImportExportDialog } from './GradeImportExportDialog';
import { GradePublishDialog } from './GradePublishDialog';
import { GradeSubmissionCard } from '@/modules/Grades/admin/components';

// Hooks
import { useTeacherModules } from '../hooks/useTeacherModules';
import { useGradeEntry } from '../hooks/useGradeEntry';
import { useGradePublish } from '../hooks/useGradePublish';
import { useGradeImportExport } from '../hooks/useGradeImportExport';

/**
 * TeacherGradeEntry Component
 * Main component for teacher grade entry interface
 */
export const TeacherGradeEntry: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  // Dialogs state
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  // Hooks
  const {
    modules,
    selectedModule,
    evaluations,
    selectedEvaluation,
    loading: modulesLoading,
    evaluationsLoading,
    error: modulesError,
    selectModule,
    selectEvaluation,
    refresh: refreshModules,
    refreshEvaluations,
  } = useTeacherModules();

  const {
    students,
    statistics,
    completionStatus,
    loading: gradesLoading,
    saving,
    error: gradesError,
    autoSaveStatus,
    hasUnsavedChanges,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    updateGrade,
    validateScore,
    saveGrades,
    getCellState,
    resetChanges,
    refresh: refreshGrades,
  } = useGradeEntry(selectedEvaluation?.id ?? null);

  const {
    publishing,
    completenessChecking,
    error: publishError,
    completenessResult,
    checkCompleteness,
    publishGrades,
    reset: resetPublish,
  } = useGradePublish();

  const {
    exporting,
    importing,
    previewLoading,
    exportError,
    importError,
    importPreview,
    importResult,
    exportTemplate,
    exportAbsents,
    previewImport,
    executeImport,
    resetImport,
  } = useGradeImportExport();

  /**
   * Handle module selection
   */
  const handleSelectModule = async (module: typeof selectedModule) => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        'Vous avez des modifications non sauvegardées. Voulez-vous continuer ?'
      );
      if (!confirm) return;
    }
    await selectModule(module);
  };

  /**
   * Handle evaluation selection
   */
  const handleSelectEvaluation = (evaluation: typeof selectedEvaluation) => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        'Vous avez des modifications non sauvegardées. Voulez-vous continuer ?'
      );
      if (!confirm) return;
    }
    selectEvaluation(evaluation);
  };

  /**
   * Handle back to modules
   */
  const handleBackToModules = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        'Vous avez des modifications non sauvegardées. Voulez-vous continuer ?'
      );
      if (!confirm) return;
    }
    selectModule(null);
  };

  /**
   * Handle publish success
   */
  const handlePublishSuccess = () => {
    refreshEvaluations();
    refreshGrades();
  };

  /**
   * Handle import complete
   */
  const handleImportComplete = () => {
    refreshGrades();
  };

  /**
   * Navigate to full import wizard
   */
  const handleNavigateToImportWizard = () => {
    if (!selectedEvaluation) return;
    const queryParams = new URLSearchParams({
      evaluation_id: selectedEvaluation.id.toString(),
      evaluation_name: selectedEvaluation.name,
    });
    router.push(`/${lang}/admin/grades/import?${queryParams.toString()}`);
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Saisie des Notes
        </Typography>

        {/* Breadcrumbs */}
        <Breadcrumbs separator={<i className="ri-arrow-right-s-line" />}>
          <Link
            component="button"
            variant="body2"
            underline="hover"
            onClick={handleBackToModules}
            color={selectedModule ? 'inherit' : 'text.primary'}
          >
            Mes Modules
          </Link>
          {selectedModule && (
            <Link
              component="button"
              variant="body2"
              underline="hover"
              onClick={() => selectEvaluation(null)}
              color={selectedEvaluation ? 'inherit' : 'text.primary'}
            >
              {selectedModule.name}
            </Link>
          )}
          {selectedEvaluation && (
            <Typography variant="body2" color="text.primary">
              {selectedEvaluation.name}
            </Typography>
          )}
        </Breadcrumbs>
      </Box>

      {/* Error Display */}
      {(modulesError || gradesError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {modulesError?.message || gradesError?.message}
        </Alert>
      )}

      {/* Module Selection View */}
      {!selectedModule && (
        <TeacherModulesList
          modules={modules}
          selectedModule={selectedModule}
          loading={modulesLoading}
          error={modulesError}
          onSelectModule={handleSelectModule}
        />
      )}

      {/* Evaluation & Grade Entry View */}
      {selectedModule && (
        <Grid container spacing={3}>
          {/* Left Sidebar - Evaluations */}
          <Grid item xs={12} md={3}>
            <Box mb={2}>
              <Button
                startIcon={<i className="ri-arrow-left-line" />}
                onClick={handleBackToModules}
                size="small"
              >
                Retour aux modules
              </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {selectedModule.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedModule.code}
              </Typography>
              {selectedModule.semester && (
                <Typography variant="body2" color="text.secondary">
                  {selectedModule.semester.name}
                </Typography>
              )}
            </Paper>

            <EvaluationSelector
              evaluations={evaluations}
              selectedEvaluation={selectedEvaluation}
              loading={evaluationsLoading}
              onSelectEvaluation={handleSelectEvaluation}
            />
          </Grid>

          {/* Main Content - Grade Entry */}
          <Grid item xs={12} md={9}>
            {!selectedEvaluation ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Sélectionnez une évaluation pour commencer la saisie des notes.
                </Typography>
              </Paper>
            ) : (
              <>
                {/* Evaluation Header */}
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6">
                        {selectedEvaluation.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {selectedEvaluation.type} | Coefficient:{' '}
                        {selectedEvaluation.coefficient} | Max: {selectedEvaluation.max_score}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Import/Export Rapide">
                        <IconButton onClick={() => setImportExportOpen(true)}>
                          <i className="ri-download-upload-line" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        variant="outlined"
                        startIcon={<i className="ri-file-excel-2-line" />}
                        onClick={handleNavigateToImportWizard}
                        size="small"
                      >
                        Import Excel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<i className="ri-send-plane-line" />}
                        onClick={() => setPublishOpen(true)}
                        disabled={selectedEvaluation.is_published}
                      >
                        {selectedEvaluation.is_published ? 'Publié' : 'Publier'}
                      </Button>
                    </Box>
                  </Box>
                </Paper>

                {/* Statistics Panel */}
                <Box mb={2}>
                  <GradeStatisticsPanel
                    statistics={statistics}
                    completionStatus={completionStatus}
                    loading={gradesLoading}
                  />
                </Box>

                {/* Submission Card */}
                <Box mb={2}>
                  <GradeSubmissionCard
                    moduleId={selectedModule.id}
                    evaluationId={selectedEvaluation.id}
                    academicYearId={selectedModule.semester?.academic_year_id || 1}
                    statistics={statistics}
                    onSubmitSuccess={() => {
                      refreshEvaluations();
                      refreshGrades();
                    }}
                  />
                </Box>

                {/* Grade Entry Table */}
                <Paper sx={{ p: 2 }}>
                  <GradeEntryTable
                    students={students}
                    loading={gradesLoading}
                    saving={saving}
                    autoSaveStatus={autoSaveStatus}
                    hasUnsavedChanges={hasUnsavedChanges}
                    searchQuery={searchQuery}
                    sortBy={sortBy}
                    onSearchChange={setSearchQuery}
                    onSortChange={setSortBy}
                    onGradeChange={updateGrade}
                    onSave={saveGrades}
                    onRefresh={refreshGrades}
                    validateScore={validateScore}
                    getCellState={getCellState}
                    isPublished={selectedEvaluation.is_published}
                  />
                </Paper>
              </>
            )}
          </Grid>
        </Grid>
      )}

      {/* Import/Export Dialog */}
      {selectedEvaluation && (
        <GradeImportExportDialog
          open={importExportOpen}
          onClose={() => setImportExportOpen(false)}
          evaluationId={selectedEvaluation.id}
          evaluationName={selectedEvaluation.name}
          onExportTemplate={exportTemplate}
          onExportAbsents={exportAbsents}
          onPreviewImport={previewImport}
          onExecuteImport={executeImport}
          onImportComplete={handleImportComplete}
          exporting={exporting}
          importing={importing}
          previewLoading={previewLoading}
          importPreview={importPreview}
          importResult={importResult}
          exportError={exportError}
          importError={importError}
          resetImport={resetImport}
        />
      )}

      {/* Publish Dialog */}
      {selectedEvaluation && (
        <GradePublishDialog
          open={publishOpen}
          onClose={() => {
            setPublishOpen(false);
            resetPublish();
            handlePublishSuccess();
          }}
          evaluationId={selectedEvaluation.id}
          evaluationName={selectedEvaluation.name}
          completenessResult={completenessResult}
          onCheckCompleteness={checkCompleteness}
          onPublish={publishGrades}
          publishing={publishing}
          completenessChecking={completenessChecking}
          error={publishError}
        />
      )}
    </Box>
  );
};
