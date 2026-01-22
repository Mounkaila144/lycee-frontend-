'use client';

import { useState, useCallback, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import type { Reenrollment } from '../../types/reenrollment.types';

interface ReenrollmentRejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  reenrollment: Reenrollment | null;
}

/**
 * ReenrollmentRejectDialog Component
 * Dialog for rejecting a reenrollment with a reason
 */
export const ReenrollmentRejectDialog = ({
  open,
  onClose,
  onConfirm,
  reenrollment,
}: ReenrollmentRejectDialogProps) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setError('');
    }
  }, [open]);

  const handleConfirm = useCallback(() => {
    if (!reason.trim()) {
      setError('Le motif de rejet est obligatoire');

      return;
    }

    onConfirm(reason);
  }, [reason, onConfirm]);

  if (!reenrollment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rejeter la Réinscription</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Vous êtes sur le point de rejeter la réinscription de{' '}
            <strong>
              {reenrollment.student?.firstname} {reenrollment.student?.lastname}
            </strong>
            .
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Matricule: {reenrollment.student?.matricule}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Niveau cible: {reenrollment.target_level}
          </Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Motif du rejet"
          placeholder="Veuillez indiquer la raison du rejet..."
          value={reason}
          onChange={e => {
            setReason(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error || 'Ce motif sera communiqué à l\'étudiant'}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" color="error" onClick={handleConfirm}>
          Rejeter
        </Button>
      </DialogActions>
    </Dialog>
  );
};
