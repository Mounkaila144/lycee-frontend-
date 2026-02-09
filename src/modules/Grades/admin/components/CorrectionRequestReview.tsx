'use client';

import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import { useApproveCorrectionRequest, useRejectCorrectionRequest } from '../hooks';
import type { CorrectionRequest, CorrectionRequestStatus } from '../../types';

interface CorrectionRequestReviewProps {
  request: CorrectionRequest;
  tenantId?: string;
  onActionComplete?: () => void;
}

const getStatusColor = (status: CorrectionRequestStatus): 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'error';
    default:
      return 'warning';
  }
};

const getStatusLabel = (status: CorrectionRequestStatus): string => {
  switch (status) {
    case 'Pending':
      return 'En attente';
    case 'Approved':
      return 'Approuvée';
    case 'Rejected':
      return 'Rejetée';
    default:
      return status;
  }
};

export const CorrectionRequestReview: React.FC<CorrectionRequestReviewProps> = ({
  request,
  tenantId,
  onActionComplete,
}) => {
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const approveMutation = useApproveCorrectionRequest(tenantId);
  const rejectMutation = useRejectCorrectionRequest(tenantId);

  const handleApprove = useCallback(async () => {
    setActionError(null);

    try {
      await approveMutation.mutateAsync({
        requestId: request.id,
        notes: approveNotes || undefined,
      });
      setShowApproveForm(false);
      setApproveNotes('');
      onActionComplete?.();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erreur lors de l\'approbation');
    }
  }, [request.id, approveNotes, approveMutation, onActionComplete]);

  const handleReject = useCallback(async () => {
    if (!rejectNotes.trim()) {
      setActionError('Le commentaire de rejet est obligatoire.');

      return;
    }

    setActionError(null);

    try {
      await rejectMutation.mutateAsync({
        requestId: request.id,
        notes: rejectNotes,
      });
      setShowRejectForm(false);
      setRejectNotes('');
      onActionComplete?.();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erreur lors du rejet');
    }
  }, [request.id, rejectNotes, rejectMutation, onActionComplete]);

  const isPending = request.status === 'Pending';
  const student = request.grade?.student;
  const evaluation = request.grade?.evaluation;
  const currentValue = request.current_value ?? request.old_score;
  const proposedValue = request.proposed_value ?? request.new_score;

  return (
    <Box className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h6">
                {student?.full_name || (student ? `${student.lastname || ''} ${student.firstname || ''}`.trim() : 'Étudiant inconnu')}
              </Typography>
              {student?.matricule && (
                <Typography variant="body2" color="text.secondary">
                  Matricule: {student.matricule}
                </Typography>
              )}
              {evaluation && (
                <Typography variant="body2" color="text.secondary">
                  {evaluation.module?.name} - {evaluation.name} ({evaluation.type})
                </Typography>
              )}
            </Box>
            <Chip
              label={getStatusLabel(request.status)}
              color={getStatusColor(request.status)}
              size="medium"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Score Comparison */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Comparaison des notes
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={5}>
              <Box textAlign="center">
                <Typography variant="h3" color="text.secondary">
                  {currentValue !== null && currentValue !== undefined ? currentValue : '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Note actuelle /20
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Box textAlign="center">
                <i className="ri-arrow-right-line" style={{ fontSize: 32, color: '#999' }} />
              </Box>
            </Grid>
            <Grid item xs={5}>
              <Box textAlign="center">
                <Typography variant="h3" color="primary.main">
                  {proposedValue !== null && proposedValue !== undefined ? proposedValue : '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Note proposée /20
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {currentValue !== null && proposedValue !== null && currentValue !== undefined && proposedValue !== undefined && (
            <Box mt={2} textAlign="center">
              <Chip
                label={`Écart: ${proposedValue - currentValue > 0 ? '+' : ''}${(proposedValue - currentValue).toFixed(2)} pts`}
                color={proposedValue > currentValue ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Reason */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Motif de la demande
          </Typography>
          <Typography variant="body1">
            {request.reason}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Typography variant="caption" color="text.secondary">
              Demandé par: {request.requester?.name || request.requested_by_user?.name || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Le: {new Date(request.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Review info (if already reviewed) */}
      {(request.reviewer || request.reviewed_by_user) && request.reviewed_at && (
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Décision
            </Typography>
            <Typography variant="body2">
              {request.status === 'Approved' ? 'Approuvée' : 'Rejetée'} par{' '}
              <strong>{request.reviewer?.name || request.reviewed_by_user?.name}</strong> le{' '}
              {new Date(request.reviewed_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
            {request.review_comment && (
              <Alert severity={request.status === 'Approved' ? 'success' : 'error'} sx={{ mt: 2 }}>
                {request.review_comment}
              </Alert>
            )}
            {request.rejection_reason && !request.review_comment && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {request.rejection_reason}
              </Alert>
            )}
            {request.expires_at && request.status === 'Approved' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                L&apos;enseignant peut modifier la note jusqu&apos;au{' '}
                {new Date(request.expires_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      {isPending && !showApproveForm && !showRejectForm && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={<i className="ri-check-line" />}
                onClick={() => {
                  setActionError(null);
                  setShowApproveForm(true);
                  setShowRejectForm(false);
                }}
              >
                Approuver
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<i className="ri-close-line" />}
                onClick={() => {
                  setActionError(null);
                  setShowRejectForm(true);
                  setShowApproveForm(false);
                }}
              >
                Rejeter
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Approve Form */}
      {isPending && showApproveForm && (
        <Card>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Approuver la correction
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              L&apos;enseignant pourra modifier la note pendant 24h.
              Après ce délai, la note sera automatiquement re-publiée.
            </Typography>
            <TextField
              label="Notes (optionnel)"
              multiline
              rows={3}
              fullWidth
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              placeholder="Observations ou conditions..."
              inputProps={{ maxLength: 500 }}
              sx={{ mb: 2 }}
            />

            {actionError && (
              <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>
            )}

            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button
                onClick={() => setShowApproveForm(false)}
                disabled={approveMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                startIcon={approveMutation.isPending ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
              >
                Confirmer l&apos;approbation
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Reject Form */}
      {isPending && showRejectForm && (
        <Card>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Rejeter la demande
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              La note restera inchangée et l&apos;enseignant sera notifié du rejet.
            </Typography>
            <TextField
              label="Commentaire de rejet *"
              multiline
              rows={4}
              fullWidth
              required
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Expliquez la raison du rejet..."
              inputProps={{ maxLength: 500 }}
              error={!!actionError && !rejectNotes.trim()}
              helperText={!rejectNotes.trim() && actionError ? 'Le commentaire est obligatoire' : ''}
              sx={{ mb: 2 }}
            />

            {actionError && rejectNotes.trim() && (
              <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>
            )}

            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button
                onClick={() => setShowRejectForm(false)}
                disabled={rejectMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                startIcon={rejectMutation.isPending ? <CircularProgress size={16} /> : <i className="ri-close-line" />}
              >
                Confirmer le rejet
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
