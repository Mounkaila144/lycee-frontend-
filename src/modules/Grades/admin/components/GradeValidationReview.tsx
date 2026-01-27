'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
// Icons removed - using emoji or text alternatives
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
  useGradeValidation,
  useValidateGrades,
  useRejectGrades,
  usePublishGrades,
} from '../hooks';
import type { ValidationStatistics } from '../../types';

interface GradeValidationReviewProps {
  validationId: number;
  tenantId?: string;
  onActionComplete?: () => void;
}

export const GradeValidationReview: React.FC<GradeValidationReviewProps> = ({
  validationId,
  tenantId,
  onActionComplete,
}) => {
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [validationNotes, setValidationNotes] = useState('');
  const [notifyStudents, setNotifyStudents] = useState(true);

  // Hooks
  const { data: validation, isLoading } = useGradeValidation(validationId, tenantId);
  const validateMutation = useValidateGrades(tenantId);
  const rejectMutation = useRejectGrades(tenantId);
  const publishMutation = usePublishGrades(tenantId);

  const handleValidate = async () => {
    try {
      await validateMutation.mutateAsync({
        validationId,
        data: {
          decision: 'Approved',
          notes: validationNotes || undefined,
        },
      });
      setShowValidateDialog(false);
      onActionComplete?.();
    } catch (error) {
      console.error('Error validating grades:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        validationId,
        data: {
          decision: 'Rejected',
          notes: rejectionReason,
        },
      });
      setShowRejectDialog(false);
      onActionComplete?.();
    } catch (error) {
      console.error('Error rejecting grades:', error);
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync({
        validationId,
        data: {
          notify_students: notifyStudents,
        },
      });
      setShowPublishDialog(false);
      onActionComplete?.();
    } catch (error) {
      console.error('Error publishing grades:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Submitted':
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

  const prepareDistributionData = (stats?: ValidationStatistics) => {
    if (!stats?.distribution) return [];

    return [
      { range: '0-5', count: stats.distribution['0-5'] || 0 },
      { range: '5-10', count: stats.distribution['5-10'] || 0 },
      { range: '10-15', count: stats.distribution['10-15'] || 0 },
      { range: '15-20', count: stats.distribution['15-20'] || 0 },
    ];
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!validation) {
    return <Alert severity="error">Validation introuvable</Alert>;
  }

  const stats = validation.statistics;
  const hasAnomalies = validation.anomalies && validation.anomalies.length > 0;

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={`Validation - ${validation.module?.name}`}
          subheader={validation.evaluation ? validation.evaluation.name : 'Toutes les évaluations'}
          action={
            <Chip label={validation.status} color={getStatusColor(validation.status)} />
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Enseignant
              </Typography>
              <Typography variant="body1">
                {validation.submitted_by_user
                  ? `${validation.submitted_by_user.firstname} ${validation.submitted_by_user.lastname}`
                  : '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Date de soumission
              </Typography>
              <Typography variant="body1">
                {new Date(validation.submitted_at).toLocaleString('fr-FR')}
              </Typography>
            </Grid>
            {validation.validated_at && (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Validé par
                  </Typography>
                  <Typography variant="body1">
                    {validation.validated_by_user
                      ? `${validation.validated_by_user.firstname} ${validation.validated_by_user.lastname}`
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date de validation
                  </Typography>
                  <Typography variant="body1">
                    {new Date(validation.validated_at).toLocaleString('fr-FR')}
                  </Typography>
                </Grid>
              </>
            )}
            {validation.rejection_reason && (
              <Grid item xs={12}>
                <Alert severity="error">
                  <AlertTitle>Motif de rejet</AlertTitle>
                  {validation.rejection_reason}
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Anomalies */}
      {hasAnomalies && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>⚠️ Anomalies détectées</AlertTitle>
          <List dense>
            {validation.anomalies.map((anomaly, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={anomaly} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Statistiques" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Nombre de notes
                  </Typography>
                  <Typography variant="h4">{stats.count}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Moyenne
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h4">{stats.average.toFixed(2)}</Typography>
                    <Typography variant="h5">
                      {stats.average < 10 ? '📉' : '📈'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Écart-type
                  </Typography>
                  <Typography variant="h4">{stats.std_dev.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Taux de réussite
                  </Typography>
                  <Typography variant="h4" color={stats.pass_rate >= 50 ? 'success.main' : 'error.main'}>
                    {stats.pass_rate.toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Minimum
                  </Typography>
                  <Typography variant="h6">{stats.min.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Médiane
                  </Typography>
                  <Typography variant="h6">{stats.median.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Maximum
                  </Typography>
                  <Typography variant="h6">{stats.max.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Distribution des notes" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareDistributionData(stats)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Actions */}
      {validation.status === 'Pending' && (
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowRejectDialog(true)}
          >
            ❌ Rejeter
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => setShowValidateDialog(true)}
          >
            ✅ Valider
          </Button>
        </Box>
      )}

      {validation.status === 'Approved' && (
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowPublishDialog(true)}
          >
            📤 Publier les notes
          </Button>
        </Box>
      )}

      {/* Validate Dialog */}
      <Dialog open={showValidateDialog} onClose={() => setShowValidateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Valider les notes</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Les notes seront validées et l'enseignant sera notifié. Vous pourrez ensuite les publier aux étudiants.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optionnel)"
            value={validationNotes}
            onChange={(e) => setValidationNotes(e.target.value)}
            placeholder="Ajouter des notes pour l'enseignant..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowValidateDialog(false)} disabled={validateMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleValidate}
            disabled={validateMutation.isPending}
          >
            {validateMutation.isPending ? '⏳ Validation...' : '✅ Valider'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rejeter les notes</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Les notes seront rejetées et l'enseignant devra les corriger avant de les soumettre à nouveau.
          </Alert>
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="Motif du rejet"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Indiquez le motif du rejet..."
            error={!rejectionReason.trim()}
            helperText={!rejectionReason.trim() ? 'Le motif est obligatoire' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)} disabled={rejectMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={rejectMutation.isPending || !rejectionReason.trim()}
          >
            {rejectMutation.isPending ? '⏳ Rejet...' : '❌ Rejeter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onClose={() => setShowPublishDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Publier les notes</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Publication des notes</AlertTitle>
            Les notes seront visibles par les étudiants. Une notification leur sera envoyée.
          </Alert>
          {stats && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Résumé
              </Typography>
              <Typography variant="body2">
                • {stats.count} notes seront publiées
              </Typography>
              <Typography variant="body2">
                • Moyenne: {stats.average.toFixed(2)}/20
              </Typography>
              <Typography variant="body2">
                • Taux de réussite: {stats.pass_rate.toFixed(1)}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPublishDialog(false)} disabled={publishMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublish}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? '⏳ Publication...' : '📤 Publier'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
