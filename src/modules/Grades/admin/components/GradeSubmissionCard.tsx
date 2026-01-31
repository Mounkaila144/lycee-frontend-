'use client';

import React, { useState } from 'react';

import { useTranslation } from '@/shared/i18n/use-translation';

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  Alert,
  AlertTitle,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Divider,
} from '@mui/material';
// Icons removed - using emoji alternatives
import { useGradeSubmission, useSubmissionStatus } from '../hooks';
import type { SubmitGradesRequest, GradeStatistics } from '../../types';

interface GradeSubmissionCardProps {
  moduleId: number;
  evaluationId?: number;
  academicYearId: number;
  statistics?: GradeStatistics;
  tenantId?: string;
  onSubmitSuccess?: () => void;
}

export const GradeSubmissionCard: React.FC<GradeSubmissionCardProps> = ({
  moduleId,
  evaluationId,
  academicYearId,
  statistics,
  tenantId,
  onSubmitSuccess,
}) => {
  const { t } = useTranslation('Grades');
  const [showDialog, setShowDialog] = useState(false);

  // Hooks
  const submissionMutation = useGradeSubmission(tenantId);
  const { data: submissionStatus, isLoading: statusLoading } = useSubmissionStatus(
    {
      module_id: moduleId,
      evaluation_id: evaluationId,
      academic_year_id: academicYearId,
    },
    tenantId
  );

  const canSubmit =
    submissionStatus?.can_submit &&
    submissionStatus?.status !== 'Pending' &&
    submissionStatus?.status !== 'Approved' &&
    submissionStatus?.status !== 'Published';

  const handleSubmit = async () => {
    const request: SubmitGradesRequest = {
      module_id: moduleId,
      evaluation_id: evaluationId,
      academic_year_id: academicYearId,
    };

    try {
      await submissionMutation.mutateAsync(request);
      setShowDialog(false);
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error submitting grades:', error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Draft':
        return 'default';
      case 'Submitted':
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Published':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'Draft':
        return t('gradeSubmissionCard.statusDraft');
      case 'Submitted':
      case 'Pending':
        return t('gradeSubmissionCard.statusPending');
      case 'Approved':
        return t('gradeSubmissionCard.statusApproved');
      case 'Rejected':
        return t('gradeSubmissionCard.statusRejected');
      case 'Published':
        return t('gradeSubmissionCard.statusPublished');
      default:
        return t('gradeSubmissionCard.statusNotSubmitted');
    }
  };

  if (statusLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title={t('gradeSubmissionCard.title')}
          action={
            submissionStatus?.status && (
              <Chip
                label={getStatusLabel(submissionStatus.status)}
                color={getStatusColor(submissionStatus.status)}
                size="small"
              />
            )
          }
        />
        <CardContent>
          {/* Current Status */}
          {submissionStatus?.status && submissionStatus.status !== 'Draft' && (
            <Alert
              severity={
                submissionStatus.status === 'Rejected'
                  ? 'error'
                  : submissionStatus.status === 'Approved'
                    ? 'success'
                    : submissionStatus.status === 'Published'
                      ? 'info'
                      : 'warning'
              }
              sx={{ mb: 2 }}
            >
              <AlertTitle>
                {submissionStatus.status === 'Rejected' && t('gradeSubmissionCard.gradesRejected')}
                {submissionStatus.status === 'Approved' && t('gradeSubmissionCard.gradesApproved')}
                {submissionStatus.status === 'Published' && t('gradeSubmissionCard.gradesPublished')}
                {(submissionStatus.status === 'Pending' ||
                  submissionStatus.status === 'Submitted') &&
                  t('gradeSubmissionCard.awaitingValidation')}
              </AlertTitle>
              {submissionStatus.submitted_at && (
                <Typography variant="body2">
                  {t('gradeSubmissionCard.submittedOn', { date: new Date(submissionStatus.submitted_at).toLocaleDateString('fr-FR') })}
                </Typography>
              )}
              {submissionStatus.validated_at && (
                <Typography variant="body2">
                  {t('gradeSubmissionCard.validatedOn', { date: new Date(submissionStatus.validated_at).toLocaleDateString('fr-FR') })}
                </Typography>
              )}
            </Alert>
          )}

          {/* Statistics Summary */}
          {statistics && (
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                {t('gradeSubmissionCard.gradesSummary')}
              </Typography>
              <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('gradeSubmissionCard.gradesEntered')}
                  </Typography>
                  <Typography variant="h6">
                    {statistics.entered_count}/{statistics.count}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('gradeSubmissionCard.average')}
                  </Typography>
                  <Typography variant="h6">{statistics.average.toFixed(2)}/20</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('gradeSubmissionCard.passRate')}
                  </Typography>
                  <Typography variant="h6">{statistics.pass_rate.toFixed(1)}%</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Pre-submission checks */}
          {submissionStatus?.pre_check && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                {t('gradeSubmissionCard.verifications')}
              </Typography>
              <List dense>
                {submissionStatus.pre_check.checks.all_grades_entered && (
                  <ListItem>
                    <ListItemIcon>
                      <span>✅</span>
                    </ListItemIcon>
                    <ListItemText primary={t('gradeSubmissionCard.allGradesEntered')} />
                  </ListItem>
                )}
                {!submissionStatus.pre_check.checks.all_grades_entered && (
                  <ListItem>
                    <ListItemIcon>
                      <span>❌</span>
                    </ListItemIcon>
                    <ListItemText primary={t('gradeSubmissionCard.someGradesMissing')} />
                  </ListItem>
                )}
                {submissionStatus.pre_check.checks.valid_grade_range && (
                  <ListItem>
                    <ListItemIcon>
                      <span>✅</span>
                    </ListItemIcon>
                    <ListItemText primary={t('gradeSubmissionCard.allGradesValid')} />
                  </ListItem>
                )}
                {submissionStatus.pre_check.errors.map((error, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <span>❌</span>
                    </ListItemIcon>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
                {submissionStatus.pre_check.warnings.map((warning, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <span>⚠️</span>
                    </ListItemIcon>
                    <ListItemText primary={warning} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Actions */}
          <Box display="flex" justifyContent="flex-end" gap={1}>
            {canSubmit && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowDialog(true)}
                disabled={submissionMutation.isPending}
              >
                {t('gradeSubmissionCard.submitForValidation')}
              </Button>
            )}
            {!canSubmit && submissionStatus?.status === 'Draft' && (
              <Alert severity="info">
                {t('gradeSubmissionCard.completeGradesFirst')}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('gradeSubmissionCard.confirmDialogTitle')}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>{t('common.warning')}</AlertTitle>
            {t('gradeSubmissionCard.confirmDialogMessage')}
          </Alert>

          {statistics && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('gradeSubmissionCard.gradesSummary')}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" my={1}>
                <Typography variant="body2">{t('gradeSubmissionCard.gradesCount')}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statistics.entered_count}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" my={1}>
                <Typography variant="body2">{t('gradeSubmissionCard.average')}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statistics.average.toFixed(2)}/20
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" my={1}>
                <Typography variant="body2">{t('gradeSubmissionCard.passRate')}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statistics.pass_rate.toFixed(1)}%
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" my={1}>
                <Typography variant="body2">{t('gradeSubmissionCard.absents')}:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statistics.absent_count}
                </Typography>
              </Box>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" mt={2}>
            {t('gradeSubmissionCard.confirmQuestion')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} disabled={submissionMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submissionMutation.isPending}
          >
            {submissionMutation.isPending ? t('gradeSubmissionCard.submitting') : t('gradeSubmissionCard.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
