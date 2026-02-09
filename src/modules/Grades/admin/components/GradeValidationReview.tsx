'use client';

import React, { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import {
  useGradeValidation,
  useValidateGrades,
  useRejectGrades,
  usePublishGrades,
} from '../hooks';
import type { GradeValidation, GradeValidationStatus, ValidationStatistics } from '../../types';

interface GradeValidationReviewProps {
  validationId: number;
  initialData?: GradeValidation;
  tenantId?: string;
  onActionComplete?: () => void;
}

const getStatusColor = (status: GradeValidationStatus): 'warning' | 'success' | 'error' | 'info' | 'default' => {
  switch (status) {
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

const getStatusLabel = (status: GradeValidationStatus): string => {
  switch (status) {
    case 'Pending':
      return 'En attente';
    case 'Approved':
      return 'Validé';
    case 'Rejected':
      return 'Rejeté';
    case 'Published':
      return 'Publié';
    default:
      return status;
  }
};

/**
 * GradeValidationReview Component
 *
 * Displays validation details matching the backend GradeValidationResource:
 * - Header: module, evaluation, submitter, status
 * - Anomalies alert
 * - Statistics: count, average, std_dev, pass_rate, min/median/max, absents
 * - Distribution chart (8 ranges from backend)
 * - Action dialogs: validate ({notes}), reject ({reason}), publish ({scheduled_at})
 */
export const GradeValidationReview: React.FC<GradeValidationReviewProps> = ({
  validationId,
  initialData,
  tenantId,
  onActionComplete,
}) => {
  const { data: fetchedValidation, isLoading, error } = useGradeValidation(validationId, tenantId);

  // Use fetched data if it has a valid id, otherwise fall back to initialData from the list
  const validation = (fetchedValidation?.id ? fetchedValidation : null) ?? initialData ?? null;

  const validateMutation = useValidateGrades(tenantId);
  const rejectMutation = useRejectGrades(tenantId);
  const publishMutation = usePublishGrades(tenantId);

  const [validateDialog, setValidateDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [publishDialog, setPublishDialog] = useState(false);
  const [validateNotes, setValidateNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const distributionData = useMemo(() => {
    if (!validation?.statistics?.distribution) return [];

    return Object.entries(validation.statistics.distribution).map(([range, count]) => ({
      range,
      count,
    }));
  }, [validation?.statistics?.distribution]);

  const handleValidate = async () => {
    setActionError(null);

    try {
      await validateMutation.mutateAsync({
        validationId,
        data: { notes: validateNotes || undefined },
      });

      setValidateDialog(false);
      setValidateNotes('');
      onActionComplete?.();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError('Le motif de rejet est obligatoire.');

      return;
    }

    setActionError(null);

    try {
      await rejectMutation.mutateAsync({
        validationId,
        data: { reason: rejectReason },
      });

      setRejectDialog(false);
      setRejectReason('');
      onActionComplete?.();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erreur lors du rejet');
    }
  };

  const handlePublish = async () => {
    setActionError(null);

    try {
      await publishMutation.mutateAsync({
        validationId,
        data: scheduledAt ? { scheduled_at: scheduledAt } : undefined,
      });

      setPublishDialog(false);
      setScheduledAt('');
      onActionComplete?.();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erreur lors de la publication');
    }
  };

  if (isLoading && !validation) {
    return (
      <Box className='space-y-4'>
        <Skeleton variant='rectangular' height={120} />
        <Skeleton variant='rectangular' height={200} />
        <Skeleton variant='rectangular' height={300} />
      </Box>
    );
  }

  if (error && !validation) {
    return (
      <Alert severity='error'>
        Impossible de charger les détails de la validation.
        {error instanceof Error && ` ${error.message}`}
      </Alert>
    );
  }

  if (!validation) {
    return (
      <Alert severity='error'>
        Aucune donnée de validation disponible.
      </Alert>
    );
  }

  const stats: ValidationStatistics | null = validation.statistics;
  const canValidate = validation.status === 'Pending';
  const canPublish = validation.status === 'Approved';

  return (
    <Box className='space-y-4'>
      {/* Header: module, evaluation, submitter, status */}
      <Card>
        <CardContent>
          <Box className='flex flex-wrap items-start justify-between gap-4'>
            <Box>
              <Typography variant='h6'>
                {validation.module?.name || 'Module inconnu'}
                {validation.module?.code && (
                  <Chip
                    label={validation.module.code}
                    size='small'
                    variant='outlined'
                    className='ml-2'
                  />
                )}
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mt-1'>
                {validation.evaluation
                  ? `${validation.evaluation.name} (${validation.evaluation.type})`
                  : 'Toutes les évaluations'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Soumis par: {validation.submitter?.name || '-'}
              </Typography>
              {validation.submitted_at && (
                <Typography variant='caption' color='text.secondary'>
                  le {new Date(validation.submitted_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              )}
            </Box>
            <Box className='text-right'>
              <Chip
                label={getStatusLabel(validation.status)}
                color={getStatusColor(validation.status)}
                size='medium'
              />
              {validation.validator && validation.validated_at && (
                <Typography variant='caption' display='block' color='text.secondary' className='mt-1'>
                  {validation.status === 'Rejected' ? 'Rejeté' : 'Validé'} par {validation.validator.name}
                  <br />
                  le {new Date(validation.validated_at).toLocaleDateString('fr-FR')}
                </Typography>
              )}
              {validation.published_at && (
                <Typography variant='caption' display='block' color='text.secondary' className='mt-1'>
                  Publié le {new Date(validation.published_at).toLocaleDateString('fr-FR')}
                </Typography>
              )}
            </Box>
          </Box>

          {validation.status === 'Rejected' && validation.rejection_reason && (
            <Alert severity='error' className='mt-3'>
              <strong>Motif du rejet:</strong> {validation.rejection_reason}
            </Alert>
          )}

          {validation.notes && (
            <Alert severity='info' className='mt-3'>
              <strong>Notes:</strong> {validation.notes}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Anomalies */}
      {validation.has_anomalies && validation.anomalies && validation.anomalies.length > 0 && (
        <Alert severity='warning'>
          <strong>Anomalies détectées ({validation.anomalies.length}):</strong>
          <ul className='list-disc pl-5 mt-1'>
            {validation.anomalies.map((anomaly, idx) => (
              <li key={idx}>
                <Typography variant='body2'>{anomaly}</Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Statistiques
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2}>
                <Box className='text-center p-2'>
                  <Typography variant='h4' color='primary'>
                    {stats.count}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Notes saisies
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box className='text-center p-2'>
                  <Typography variant='h4' color='primary'>
                    {stats.average?.toFixed(2) ?? '-'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Moyenne
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box className='text-center p-2'>
                  <Typography variant='h4' color='primary'>
                    {stats.std_dev?.toFixed(2) ?? '-'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Écart-type
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box className='text-center p-2'>
                  <Typography variant='h4' color='success.main'>
                    {stats.pass_rate != null ? `${stats.pass_rate.toFixed(1)}%` : '-'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Taux réussite
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box className='text-center p-2'>
                  <Typography variant='body1'>
                    {stats.min ?? '-'} / {stats.median?.toFixed(2) ?? '-'} / {stats.max ?? '-'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Min / Médiane / Max
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box className='text-center p-2'>
                  <Typography variant='h4' color='text.secondary'>
                    {stats.absent_count ?? 0}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Absents
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Distribution chart */}
      {distributionData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Distribution des notes
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='range' />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number) => [`${value} étudiants`, 'Effectif']}
                    labelFormatter={(label: string) => `Plage: ${label}`}
                  />
                  <Bar dataKey='count' fill='#7C4DFF' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Academic context */}
      {(validation.academic_year || validation.semester) && (
        <Card>
          <CardContent>
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              Contexte académique
            </Typography>
            <Box className='flex gap-4 flex-wrap'>
              {validation.academic_year && (
                <Chip
                  label={`Année: ${validation.academic_year.name}`}
                  variant='outlined'
                  size='small'
                />
              )}
              {validation.semester && (
                <Chip
                  label={`Semestre: ${validation.semester.name}`}
                  variant='outlined'
                  size='small'
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      {(canValidate || canPublish) && (
        <Card>
          <CardContent>
            <Box className='flex flex-wrap gap-3 justify-end'>
              {canValidate && (
                <>
                  <Button
                    variant='contained'
                    color='success'
                    startIcon={<i className='ri-check-line' />}
                    onClick={() => {
                      setActionError(null);
                      setValidateDialog(true);
                    }}
                  >
                    Valider
                  </Button>
                  <Button
                    variant='contained'
                    color='error'
                    startIcon={<i className='ri-close-line' />}
                    onClick={() => {
                      setActionError(null);
                      setRejectDialog(true);
                    }}
                  >
                    Rejeter
                  </Button>
                </>
              )}
              {canPublish && (
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<i className='ri-upload-2-line' />}
                  onClick={() => {
                    setActionError(null);
                    setPublishDialog(true);
                  }}
                >
                  Publier
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ========== Action Dialogs ========== */}

      {/* Validate Dialog - sends { notes?: string } */}
      <Dialog open={validateDialog} onClose={() => setValidateDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Valider les notes</DialogTitle>
        <DialogContent>
          <Typography variant='body2' className='mb-4'>
            Confirmez-vous la validation des notes de{' '}
            <strong>{validation.module?.name}</strong>
            {validation.evaluation && ` - ${validation.evaluation.name}`} ?
          </Typography>

          {validation.has_anomalies && (
            <Alert severity='warning' className='mb-4'>
              Attention: des anomalies ont été détectées. Voulez-vous tout de même valider ?
            </Alert>
          )}

          <TextField
            label='Notes (optionnel)'
            multiline
            rows={3}
            fullWidth
            value={validateNotes}
            onChange={(e) => setValidateNotes(e.target.value)}
            placeholder='Remarques ou observations...'
            inputProps={{ maxLength: 1000 }}
          />

          {actionError && (
            <Alert severity='error' className='mt-3'>{actionError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidateDialog(false)} disabled={validateMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant='contained'
            color='success'
            onClick={handleValidate}
            disabled={validateMutation.isPending}
            startIcon={validateMutation.isPending ? <CircularProgress size={16} /> : <i className='ri-check-line' />}
          >
            Confirmer la validation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog - sends { reason: string } */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Rejeter les notes</DialogTitle>
        <DialogContent>
          <Typography variant='body2' className='mb-4'>
            Rejeter les notes de{' '}
            <strong>{validation.module?.name}</strong>
            {validation.evaluation && ` - ${validation.evaluation.name}`} ?
            <br />
            Les notes seront remises au statut brouillon et l&apos;enseignant sera notifié.
          </Typography>

          <TextField
            label='Motif du rejet *'
            multiline
            rows={4}
            fullWidth
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder='Indiquez la raison du rejet...'
            inputProps={{ maxLength: 1000 }}
            error={!!actionError && !rejectReason.trim()}
            helperText={!rejectReason.trim() && actionError ? 'Le motif est obligatoire' : ''}
          />

          {actionError && rejectReason.trim() && (
            <Alert severity='error' className='mt-3'>{actionError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)} disabled={rejectMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            startIcon={rejectMutation.isPending ? <CircularProgress size={16} /> : <i className='ri-close-line' />}
          >
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publish Dialog - sends { scheduled_at?: string } */}
      <Dialog open={publishDialog} onClose={() => setPublishDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Publier les notes</DialogTitle>
        <DialogContent>
          <Typography variant='body2' className='mb-4'>
            Publier les notes de{' '}
            <strong>{validation.module?.name}</strong>
            {validation.evaluation && ` - ${validation.evaluation.name}`} ?
            <br />
            Les notes seront visibles aux étudiants et ceux-ci seront notifiés.
          </Typography>

          <Divider className='my-3' />

          <Typography variant='subtitle2' className='mb-2'>
            Publication programmée (optionnel)
          </Typography>
          <TextField
            label='Date et heure de publication'
            type='datetime-local'
            fullWidth
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText='Laissez vide pour publier immédiatement'
          />

          {actionError && (
            <Alert severity='error' className='mt-3'>{actionError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialog(false)} disabled={publishMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handlePublish}
            disabled={publishMutation.isPending}
            startIcon={publishMutation.isPending ? <CircularProgress size={16} /> : <i className='ri-upload-2-line' />}
          >
            {scheduledAt ? 'Programmer la publication' : 'Publier maintenant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
