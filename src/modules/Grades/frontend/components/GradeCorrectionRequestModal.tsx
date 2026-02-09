'use client';

import React, { useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import type { RequestGradeCorrectionPayload, RequestGradeCorrectionResponse } from '../../types/validation.types';

interface GradeCorrectionRequestModalProps {
  open: boolean;
  onClose: () => void;
  gradeId: number | null;
  studentName: string;
  currentScore: number | null;
  onRequestCorrection: (gradeId: number, data: RequestGradeCorrectionPayload) => Promise<RequestGradeCorrectionResponse>;
  requesting: boolean;
  requestError: Error | null;
  requestResult: RequestGradeCorrectionResponse | null;
  onResetRequest: () => void;
}

const REASON_MIN_LENGTH = 20;
const REASON_MAX_LENGTH = 500;

export const GradeCorrectionRequestModal: React.FC<GradeCorrectionRequestModalProps> = ({
  open,
  onClose,
  gradeId,
  studentName,
  currentScore,
  onRequestCorrection,
  requesting,
  requestError,
  requestResult,
  onResetRequest,
}) => {
  const [proposedValue, setProposedValue] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setProposedValue('');
    setReason('');
    setValidationError(null);
    onResetRequest();
    onClose();
  }, [onClose, onResetRequest]);

  const handleSubmit = useCallback(async () => {
    if (!gradeId) return;

    setValidationError(null);

    // Validate proposed value
    const numValue = parseFloat(proposedValue);

    if (isNaN(numValue) || numValue < 0 || numValue > 20) {
      setValidationError('La note proposée doit être entre 0 et 20.');

      return;
    }

    // Validate reason
    if (reason.trim().length < REASON_MIN_LENGTH) {
      setValidationError(`Le motif doit contenir au moins ${REASON_MIN_LENGTH} caractères.`);

      return;
    }

    if (reason.trim().length > REASON_MAX_LENGTH) {
      setValidationError(`Le motif ne peut pas dépasser ${REASON_MAX_LENGTH} caractères.`);

      return;
    }

    // Check if proposed value is different
    if (numValue === currentScore) {
      setValidationError('La note proposée doit être différente de la note actuelle.');

      return;
    }

    try {
      await onRequestCorrection(gradeId, {
        proposed_value: Math.round(numValue * 100) / 100,
        reason: reason.trim(),
      });
    } catch {
      // Error is handled by parent hook
    }
  }, [gradeId, proposedValue, reason, currentScore, onRequestCorrection]);

  // Show success state
  if (requestResult) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Demande envoyée</Typography>
            <IconButton onClick={handleClose} size="small">
              <i className="ri-close-line" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            {requestResult.message || 'Votre demande de correction a été envoyée au responsable académique.'}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Vous serez notifié(e) lorsque votre demande sera traitée.
            La note restera inchangée jusqu&apos;à approbation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Demander une correction</Typography>
          <IconButton onClick={handleClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Étudiant
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {studentName}
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Note actuelle
          </Typography>
          <Chip
            label={currentScore !== null ? `${currentScore}/20` : 'Non saisie'}
            color="default"
            variant="outlined"
          />
        </Box>

        <TextField
          label="Note proposée *"
          type="number"
          fullWidth
          value={proposedValue}
          onChange={(e) => setProposedValue(e.target.value)}
          inputProps={{
            min: 0,
            max: 20,
            step: 0.25,
          }}
          helperText="Entre 0 et 20"
          sx={{ mb: 3 }}
        />

        <TextField
          label="Motif de la correction *"
          multiline
          rows={4}
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX_LENGTH))}
          placeholder="Expliquez la raison de cette demande de correction (min. 20 caractères)..."
          helperText={`${reason.length}/${REASON_MAX_LENGTH} caractères (min. ${REASON_MIN_LENGTH})`}
          error={reason.length > 0 && reason.length < REASON_MIN_LENGTH}
        />

        {validationError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {validationError}
          </Alert>
        )}

        {requestError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {requestError.message}
          </Alert>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          Cette demande sera envoyée au responsable académique pour approbation.
          Si approuvée, vous aurez 24h pour effectuer la modification.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={requesting}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={requesting || !proposedValue || reason.length < REASON_MIN_LENGTH}
          startIcon={requesting ? <CircularProgress size={16} /> : <i className="ri-send-plane-line" />}
        >
          Envoyer la demande
        </Button>
      </DialogActions>
    </Dialog>
  );
};
