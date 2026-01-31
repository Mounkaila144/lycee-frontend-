'use client';

import React, { useState, useCallback } from 'react';

import { useTranslation } from '@/shared/i18n/use-translation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';

import { useCoefficientManagement } from '../hooks/useCoefficientManagement';
import { CoefficientTable } from './CoefficientTable';
import { CoefficientEditDialog } from './CoefficientEditDialog';
import { CreditsEditDialog } from './CreditsEditDialog';
import { CoefficientTemplatesDialog } from './CoefficientTemplatesDialog';
import { CoefficientHistoryDialog } from './CoefficientHistoryDialog';

import type { EvaluationCoefficient } from '../../types/coefficient.types';
import type { ModuleOption } from './ModuleSelector';

/**
 * Props for ModuleCoefficientConfig
 */
interface ModuleCoefficientConfigProps {
  moduleId: number | null;
  semesterId: number | null;
  moduleData: ModuleOption | null;
}

/**
 * ModuleCoefficientConfig Component
 * Main component for managing module coefficients and ECTS credits
 */
export const ModuleCoefficientConfig: React.FC<ModuleCoefficientConfigProps> = ({ moduleId, semesterId, moduleData: selectedModuleData }) => {
  const { t } = useTranslation('Grades');

  // Hook
  const {
    moduleData,
    templates,
    totalCoefficients,
    canModify,
    simulation,
    simulationLoading,
    simulateImpact,
    clearSimulation,
    coefficientHistory,
    creditsHistory,
    historyLoading,
    fetchCoefficientHistory,
    fetchCreditsHistory,
    loading,
    templatesLoading,
    saving,
    error,
    updateCoefficient,
    updateCredits,
    applyTemplate,
    validateCoefficient,
    validateCredits,
    refresh,
  } = useCoefficientManagement(moduleId, semesterId);

  // Dialog states
  const [editCoefficientDialog, setEditCoefficientDialog] = useState<{
    open: boolean;
    evaluation: EvaluationCoefficient | null;
  }>({ open: false, evaluation: null });

  const [editCreditsDialog, setEditCreditsDialog] = useState<boolean>(false);
  const [templatesDialog, setTemplatesDialog] = useState<boolean>(false);
  const [historyDialog, setHistoryDialog] = useState<{
    open: boolean;
    type: 'coefficient' | 'credits';
    title: string;
  }>({ open: false, type: 'coefficient', title: '' });

  /**
   * Open coefficient edit dialog
   */
  const handleEditCoefficient = useCallback((evaluation: EvaluationCoefficient) => {
    setEditCoefficientDialog({ open: true, evaluation });
  }, []);

  /**
   * Close coefficient edit dialog
   */
  const handleCloseEditCoefficient = useCallback(() => {
    setEditCoefficientDialog({ open: false, evaluation: null });
    clearSimulation();
  }, [clearSimulation]);

  /**
   * Open coefficient history dialog
   */
  const handleViewCoefficientHistory = useCallback(
    async (evaluationId: number) => {
      const evaluation = moduleData?.evaluations.find((ev) => ev.id === evaluationId);

      await fetchCoefficientHistory(evaluationId);
      setHistoryDialog({
        open: true,
        type: 'coefficient',
        title: evaluation ? `${evaluation.type} - ${evaluation.name}` : 'Évaluation',
      });
    },
    [moduleData, fetchCoefficientHistory]
  );

  /**
   * Open credits history dialog
   */
  const handleViewCreditsHistory = useCallback(async () => {
    await fetchCreditsHistory();
    setHistoryDialog({
      open: true,
      type: 'credits',
      title: selectedModuleData?.name || moduleData?.name || 'Module',
    });
  }, [selectedModuleData, moduleData, fetchCreditsHistory]);

  /**
   * Close history dialog
   */
  const handleCloseHistory = useCallback(() => {
    setHistoryDialog({ open: false, type: 'coefficient', title: '' });
  }, []);

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="rectangular" height={200} />
        </CardContent>
      </Card>
    );
  }

  // No module or semester selected
  if (!moduleId || !semesterId) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            {t('moduleCoefficientConfig.selectModuleAndSemester')}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" action={<Button onClick={refresh}>{t('common.retry')}</Button>}>
            {error.message}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No data
  if (!moduleData) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            {t('moduleCoefficientConfig.loadError')}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Module header card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6">{selectedModuleData?.name || moduleData?.name || 'Module'}</Typography>
              <Chip label={selectedModuleData?.code || moduleData?.code || ''} size="small" variant="outlined" />
            </Box>
          }
          action={
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title={t('common.refresh')}>
                <IconButton onClick={refresh}>
                  <i className="ri-refresh-line" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('moduleCoefficientConfig.applyTemplate')}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<i className="ri-file-copy-line" />}
                  onClick={() => setTemplatesDialog(true)}
                  disabled={moduleData.has_published_grades || false}
                >
                  {t('moduleCoefficientConfig.template')}
                </Button>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* ECTS Credits */}
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: 'primary.lighter',
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {t('moduleCoefficientConfig.ectsCredits')}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <Typography variant="h3" color="primary">
                    {moduleData?.credits_ects !== undefined ? moduleData.credits_ects : (selectedModuleData?.credits_ects ?? 0)}
                  </Typography>
                  <Box>
                    <Tooltip title={t('moduleCoefficientConfig.editCredits')}>
                      <IconButton
                        size="small"
                        onClick={() => setEditCreditsDialog(true)}
                        color="primary"
                      >
                        <i className="ri-edit-line" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('moduleCoefficientConfig.creditsHistory')}>
                      <IconButton size="small" onClick={handleViewCreditsHistory}>
                        <i className="ri-history-line" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                {(moduleData.credits_locked || false) && (
                  <Chip
                    label={t('moduleCoefficientConfig.locked')}
                    size="small"
                    color="warning"
                    icon={<i className="ri-lock-line" />}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Grid>

            {/* Total coefficients */}
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: 'info.lighter',
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {t('moduleCoefficientConfig.totalCoefficients')}
                </Typography>
                <Typography variant="h3" color="info.main">
                  {totalCoefficients.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('moduleCoefficientConfig.evaluationsCount', { count: moduleData.evaluations?.length || 0 })}
                </Typography>
              </Box>
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: (moduleData.has_published_grades || false) ? 'warning.lighter' : 'success.lighter',
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {t('moduleCoefficientConfig.status')}
                </Typography>
                {(moduleData.has_published_grades || false) ? (
                  <>
                    <Chip label={t('moduleCoefficientConfig.gradesPublished')} color="warning" sx={{ mt: 1 }} />
                    <Typography variant="caption" display="block" mt={1}>
                      {t('moduleCoefficientConfig.requiresApproval')}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Chip label={t('moduleCoefficientConfig.modifiable')} color="success" sx={{ mt: 1 }} />
                    <Typography variant="caption" display="block" mt={1}>
                      {t('moduleCoefficientConfig.freelyModifiable')}
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Coefficients table card */}
      <Card>
        <CardHeader
          title={t('moduleCoefficientConfig.coefficientConfigTitle')}
          subheader={t('moduleCoefficientConfig.coefficientConfigSubtitle')}
        />
        <Divider />
        <CardContent>
          <CoefficientTable
            evaluations={moduleData.evaluations || []}
            totalCoefficients={totalCoefficients}
            loading={loading}
            canModify={canModify}
            onEditCoefficient={handleEditCoefficient}
            onViewHistory={handleViewCoefficientHistory}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CoefficientEditDialog
        open={editCoefficientDialog.open}
        evaluation={editCoefficientDialog.evaluation}
        onClose={handleCloseEditCoefficient}
        onSave={updateCoefficient}
        onSimulate={simulateImpact}
        saving={saving}
        simulationLoading={simulationLoading}
        simulation={simulation}
        clearSimulation={clearSimulation}
        validateCoefficient={validateCoefficient}
      />

      <CreditsEditDialog
        open={editCreditsDialog}
        moduleId={moduleId}
        moduleName={selectedModuleData?.name || moduleData?.name || ''}
        currentCredits={moduleData?.credits_ects !== undefined ? moduleData.credits_ects : (selectedModuleData?.credits_ects ?? 0)}
        creditsLocked={moduleData?.credits_locked || false}
        onClose={() => setEditCreditsDialog(false)}
        onSave={updateCredits}
        saving={saving}
        validateCredits={validateCredits}
      />

      <CoefficientTemplatesDialog
        open={templatesDialog}
        templates={templates}
        loading={templatesLoading}
        saving={saving}
        hasGrades={moduleData.has_published_grades || false}
        onClose={() => setTemplatesDialog(false)}
        onApply={applyTemplate}
      />

      <CoefficientHistoryDialog
        open={historyDialog.open}
        type={historyDialog.type}
        title={historyDialog.title}
        coefficientHistory={coefficientHistory}
        creditsHistory={creditsHistory}
        loading={historyLoading}
        onClose={handleCloseHistory}
      />
    </Box>
  );
};
