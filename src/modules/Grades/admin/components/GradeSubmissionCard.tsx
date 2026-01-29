'use client';

import React, { useState } from 'react';
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
        return 'Brouillon';
      case 'Submitted':
      case 'Pending':
        return 'En attente de validation';
      case 'Approved':
        return 'Validé';
      case 'Rejected':
        return 'Rejeté';
      case 'Published':
        return 'Publié';
      default:
        return 'Non soumis';
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
          title="Soumission pour Validation"
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
                {submissionStatus.status === 'Rejected' && 'Notes rejetées'}
                {submissionStatus.status === 'Approved' && 'Notes validées'}
                {submissionStatus.status === 'Published' && 'Notes publiées'}
                {(submissionStatus.status === 'Pending' ||
                  submissionStatus.status === 'Submitted') &&
                  'En attente de validation'}
              </AlertTitle>
              {submissionStatus.submitted_at && (
                <Typography variant="body2">
                  Soumis le {new Date(submissionStatus.submitted_at).toLocaleDateString('fr-FR')}
                </Typography>
              )}
              {submissionStatus.validated_at && (
                <Typography variant="body2">
                  Validé le {new Date(submissionStatus.validated_at).toLocaleDateString('fr-FR')}
                </Typography>
              )}
            </Alert>
          )}

          {/* Statistics Summary */}
          {statistics && (
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Résumé des notes saisies
              </Typography>
              <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Notes saisies
                  </Typography>
                  <Typography variant="h6">
                    {statistics.entered_count}/{statistics.count}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Moyenne
                  </Typography>
                  <Typography variant="h6">{statistics.average.toFixed(2)}/20</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Taux de réussite
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
                Vérifications
              </Typography>
              <List dense>
                {submissionStatus.pre_check.checks.all_grades_entered && (
                  <ListItem>
                    <ListItemIcon>
                      <span>✅</span>
                    </ListItemIcon>
                    <ListItemText primary="Toutes les notes sont saisies" />
                  </ListItem>
                )}
                {!submissionStatus.pre_check.checks.all_grades_entered && (
                  <ListItem>
                    <ListItemIcon>
                      <span>❌</span>
                    </ListItemIcon>
                    <ListItemText primary="Certaines notes manquantes" />
                  </ListItem>
                )}
                {submissionStatus.pre_check.checks.valid_grade_range && (
                  <ListItem>
                    <ListItemIcon>
                      <span>✅</span>
                    </ListItemIcon>
                    <ListItemText primary="Toutes les notes sont valides (0-20)" />
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
                📤 Soumettre pour validation
              </Button>
            )}
            {!canSubmit && submissionStatus?.status === 'Draft' && (
              <Alert severity="info">
                ℹ️ Complétez la saisie des notes avant de soumettre
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmer la soumission</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Attention</AlertTitle>
            Une fois soumises, vous ne pourrez plus modifier les notes jusqu'à la décision du
            responsable pédagogique.
          </Alert>

          {statistics && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Résumé des notes
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" my={1}>
                <Typography variant="body2">Nombre de notes:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statistics.entered_count}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" my={1}>
                <Typography variant="body2">Moyenne:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statistics.average.toFixed(2)}/20
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" my={1}>
                <Typography variant="body2">Taux de réussite:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statistics.pass_rate.toFixed(1)}%
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" my={1}>
                <Typography variant="body2">Absents:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statistics.absent_count}
                </Typography>
              </Box>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" mt={2}>
            Êtes-vous sûr de vouloir soumettre ces notes pour validation?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} disabled={submissionMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submissionMutation.isPending}
          >
            {submissionMutation.isPending ? '⏳ Soumission...' : '📤 Soumettre'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
