'use client';

import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import type { PedagogicalEnrollment } from '../../types/validation.types';

interface EnrollmentRejectDialogProps {
  open: boolean;
  enrollment: PedagogicalEnrollment | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

/**
 * EnrollmentRejectDialog Component
 * Dialog for rejecting a pedagogical enrollment with mandatory reason
 */
export const EnrollmentRejectDialog = ({
  open,
  enrollment,
  onClose,
  onConfirm,
}: EnrollmentRejectDialogProps) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason('');
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Le motif de rejet est obligatoire.');

      return;
    }

    if (reason.trim().length < 20) {
      setError('Le motif de rejet doit contenir au moins 20 caractères.');

      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(reason.trim());
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: 'error.main' }}>Rejeter l'inscription pédagogique</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {enrollment && (
          <>
            {/* Student Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar src={enrollment.student?.photo} sx={{ width: 48, height: 48 }}>
                {enrollment.student?.firstname?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {enrollment.student?.firstname} {enrollment.student?.lastname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {enrollment.student?.matricule}
                </Typography>
              </Box>
            </Box>

            {/* Program Info */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
              <Chip label={enrollment.program?.code} />
              <Chip label={enrollment.level} variant="outlined" />
            </Box>

            <Alert severity="warning" sx={{ mb: 3 }}>
              L'étudiant sera notifié du rejet de son inscription et devra corriger les problèmes identifiés.
            </Alert>

            {/* Reason */}
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Motif du rejet"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Expliquez les raisons du rejet de cette inscription (minimum 20 caractères)..."
              error={!!error && reason.length < 20}
              helperText={`${reason.length}/20 caractères minimum`}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={loading || reason.trim().length < 20}
        >
          {loading ? <CircularProgress size={24} /> : 'Rejeter l\'inscription'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnrollmentRejectDialog;
