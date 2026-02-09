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
import CircularProgress from '@mui/material/CircularProgress';

// Components
import { TeacherModulesList } from './TeacherModulesList';
import { EvaluationSelector } from './EvaluationSelector';
import { GradeEntryTable } from './GradeEntryTable';
import { GradeStatisticsPanel } from './GradeStatisticsPanel';
import { GradeImportExportDialog } from './GradeImportExportDialog';
import { GradePublishDialog } from './GradePublishDialog';
import { GradeHistoryModal } from './GradeHistoryModal';
import { GradeCorrectionRequestModal } from './GradeCorrectionRequestModal';
import { BatchPastePreviewModal, type MappedGradeData } from './BatchPastePreviewModal';
import { AbsenceManagementModal } from './AbsenceManagementModal';
import { GradeSubmissionCard } from '@/modules/Grades/admin/components';

// Hooks
import { useTeacherModules } from '../hooks/useTeacherModules';
import { useGradeEntry } from '../hooks/useGradeEntry';
import { useGradePublish } from '../hooks/useGradePublish';
import { useGradeImportExport } from '../hooks/useGradeImportExport';
import { useGradeCorrection } from '../hooks/useGradeCorrection';
import { useClipboardPaste } from '../hooks/useClipboardPaste';
import { useAbsenceManagement } from '../hooks/useAbsenceManagement';
import { useModuleAverages } from '../hooks/useModuleAverages';
import type { AbsenceType } from '../../types/absence.types';

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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [selectedCurrentScore, setSelectedCurrentScore] = useState<number | null>(null);
  const [batchPasteOpen, setBatchPasteOpen] = useState(false);
  const [applyingBatch, setApplyingBatch] = useState(false);

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
    allStudents,
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
    applyBatchChanges,
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

  const {
    history,
    historyLoading,
    historyError,
    fetchGradeHistory,
    resetHistory,
    requesting,
    requestError,
    requestResult,
    requestCorrection,
    resetRequest,
    exporting: exportingHistory,
    exportModuleHistory,
    exportEvaluationHistory,
  } = useGradeCorrection();

  const {
    absencePolicy,
    selectedStudentIds,
    toggleStudentSelection,
    selectAllStudents,
    deselectAllStudents,
    bulkAbsenceType,
    setBulkAbsenceType,
    bulkMarkingAbsent,
    markSelectedAbsent,
    absenceModalOpen,
    selectedGradeId: absenceGradeId,
    selectedStudentName: absenceStudentName,
    selectedAbsenceType,
    openAbsenceModal,
    closeAbsenceModal,
  } = useAbsenceManagement(selectedEvaluation?.id ?? null);

  const {
    averagesByStudent,
    classAverage,
    passRate,
    loading: averagesLoading,
    fetchAverages: refreshAverages,
  } = useModuleAverages(
    selectedModule?.id ?? null,
    selectedModule?.semester?.id ?? null,
    evaluations
  );

  // Check if evaluation has published grades
  // Backend updates Grade.status to 'Published' but not evaluation.is_published
  // So we also check grades_published count from the API
  const isEvaluationPublished =
    selectedEvaluation?.is_published || (selectedEvaluation?.grades_published ?? 0) > 0;

  // Clipboard paste hook - only enabled when evaluation is selected and not published
  const {
    pastedData,
    validation: pasteValidation,
    isPasting,
    pasteError,
    clearPaste,
  } = useClipboardPaste({
    enabled: !!selectedEvaluation && !isEvaluationPublished,
    onPaste: (data, validation) => {
      if (data.rows.length > 0 && validation.validRows > 0) {
        setBatchPasteOpen(true);
      }
    },
  });

  /**
   * Handle batch paste apply
   */
  const handleApplyBatchPaste = (mappedData: MappedGradeData[]) => {
    setApplyingBatch(true);

    try {
      // Transform mapped data to the format expected by applyBatchChanges
      const changes = mappedData.map(item => ({
        studentId: item.studentId,
        score: item.score,
        isAbsent: item.isAbsent,
      }));

      applyBatchChanges(changes);
      setBatchPasteOpen(false);
      clearPaste();
    } finally {
      setApplyingBatch(false);
    }
  };

  /**
   * Handle marking selected students as absent
   */
  const handleMarkSelectedAbsent = () => {
    markSelectedAbsent((studentIds, absenceType) => {
      studentIds.forEach(id => {
        updateGrade(id, 'is_absent', true);
        updateGrade(id, 'absence_type', absenceType);
      });
    });
  };

  /**
   * Handle absence type change for a student
   */
  const handleAbsenceTypeChange = (studentId: number, absenceType: AbsenceType) => {
    updateGrade(studentId, 'absence_type', absenceType);
  };

  /**
   * Handle updating absence type from modal
   */
  const handleUpdateAbsenceType = (gradeId: number, absenceType: AbsenceType, comment?: string) => {
    // Find the student by grade id
    const entry = (allStudents || students).find(s => s.grade?.id === gradeId);
    if (entry) {
      updateGrade(entry.student.id, 'absence_type', absenceType);
      if (comment) {
        updateGrade(entry.student.id, 'comment', comment);
      }
    }
    closeAbsenceModal();
  };

  /**
   * Handle manage absence click (opens modal)
   */
  const handleManageAbsence = (gradeId: number, studentName: string, currentAbsenceType: AbsenceType | null) => {
    openAbsenceModal(gradeId, studentName, currentAbsenceType);
  };

  /**
   * Handle viewing grade history
   */
  const handleViewHistory = (gradeId: number, studentName: string) => {
    setSelectedGradeId(gradeId);
    setSelectedStudentName(studentName);
    setHistoryOpen(true);
  };

  /**
   * Handle requesting grade correction
   */
  const handleRequestCorrection = (gradeId: number, studentName: string, currentScore: number | null) => {
    setSelectedGradeId(gradeId);
    setSelectedStudentName(studentName);
    setSelectedCurrentScore(currentScore);
    setCorrectionOpen(true);
  };

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
    refreshAverages();
  };

  /**
   * Handle save with average refresh
   */
  const handleSaveGrades = async () => {
    await saveGrades();
    // Refresh module averages after save (backend recalculates via Observer)
    setTimeout(() => refreshAverages(), 500);
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
                      {/* Export History Button - only show for published evaluations */}
                      {isEvaluationPublished && (
                        <Tooltip title="Exporter l'historique des modifications">
                          <IconButton
                            onClick={() => exportEvaluationHistory(selectedEvaluation.id, selectedEvaluation.name)}
                            disabled={exportingHistory}
                            color="info"
                          >
                            {exportingHistory ? (
                              <CircularProgress size={20} />
                            ) : (
                              <i className="ri-history-fill" />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
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
                        disabled={isEvaluationPublished}
                      >
                        {isEvaluationPublished ? 'Publié' : 'Publier'}
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

                {/* Module Averages Summary */}
                {classAverage !== null && (
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                      <Box display="flex" alignItems="center" gap={1}>
                        <i className="ri-bar-chart-2-line" style={{ fontSize: 20, color: '#1976d2' }} />
                        <Typography variant="subtitle2">Moyennes Module</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Moyenne classe</Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{ color: classAverage >= 10 ? 'success.main' : 'error.main' }}
                        >
                          {classAverage.toFixed(2)}/20
                        </Typography>
                      </Box>
                      {passRate !== null && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Taux de réussite</Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ color: passRate >= 50 ? 'success.main' : 'error.main' }}
                          >
                            {passRate.toFixed(1)}%
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                )}

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
                    onSave={handleSaveGrades}
                    onRefresh={refreshGrades}
                    onResetChanges={resetChanges}
                    validateScore={validateScore}
                    getCellState={getCellState}
                    isPublished={isEvaluationPublished}
                    onViewHistory={handleViewHistory}
                    onRequestCorrection={isEvaluationPublished ? handleRequestCorrection : undefined}
                    // Module averages
                    moduleAverages={averagesByStudent}
                    classAverage={classAverage}
                    averagesLoading={averagesLoading}
                    // Absence management
                    absencePolicy={absencePolicy}
                    selectedStudentIds={selectedStudentIds}
                    onToggleStudentSelection={toggleStudentSelection}
                    onSelectAllStudents={selectAllStudents}
                    onDeselectAllStudents={deselectAllStudents}
                    onAbsenceTypeChange={handleAbsenceTypeChange}
                    onManageAbsence={handleManageAbsence}
                    onMarkSelectedAbsent={handleMarkSelectedAbsent}
                    bulkMarkingAbsent={bulkMarkingAbsent}
                    bulkAbsenceType={bulkAbsenceType}
                    onBulkAbsenceTypeChange={setBulkAbsenceType}
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

      {/* Grade History Modal */}
      <GradeHistoryModal
        open={historyOpen}
        onClose={() => {
          setHistoryOpen(false);
          setSelectedGradeId(null);
          resetHistory();
        }}
        gradeId={selectedGradeId}
        studentName={selectedStudentName}
        history={history}
        loading={historyLoading}
        error={historyError}
        onFetchHistory={fetchGradeHistory}
      />

      {/* Grade Correction Request Modal */}
      <GradeCorrectionRequestModal
        open={correctionOpen}
        onClose={() => {
          setCorrectionOpen(false);
          setSelectedGradeId(null);
          resetRequest();
        }}
        gradeId={selectedGradeId}
        studentName={selectedStudentName}
        currentScore={selectedCurrentScore}
        onRequestCorrection={requestCorrection}
        requesting={requesting}
        requestError={requestError}
        requestResult={requestResult}
        onResetRequest={resetRequest}
      />

      {/* Batch Paste Preview Modal */}
      <BatchPastePreviewModal
        open={batchPasteOpen}
        onClose={() => {
          setBatchPasteOpen(false);
          clearPaste();
        }}
        pastedData={pastedData}
        validation={pasteValidation}
        students={allStudents || students}
        onApply={handleApplyBatchPaste}
        applying={applyingBatch}
      />

      {/* Absence Management Modal */}
      <AbsenceManagementModal
        open={absenceModalOpen}
        onClose={closeAbsenceModal}
        studentName={absenceStudentName}
        gradeId={absenceGradeId}
        currentAbsenceType={selectedAbsenceType}
        absencePolicy={absencePolicy}
        onUpdateAbsenceType={handleUpdateAbsenceType}
      />

      {/* Paste Error Alert */}
      {pasteError && (
        <Alert
          severity="error"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1400 }}
          onClose={clearPaste}
        >
          {pasteError}
        </Alert>
      )}
    </Box>
  );
};
