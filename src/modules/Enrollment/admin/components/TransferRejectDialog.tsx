'use client';

import { useState, useEffect, useCallback } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';

import type { Transfer } from '../../types/transfer.types';

interface TransferRejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  transfer: Transfer | null;
}

/**
 * TransferRejectDialog Component
 * Dialog for rejecting a transfer request with a reason
 */
export const TransferRejectDialog = ({ open, onClose, onConfirm, transfer }: TransferRejectDialogProps) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setReason('');
      setError(null);
    }
  }, [open]);

  const handleConfirm = useCallback(async () => {
    if (!reason.trim()) {
      setError('Veuillez fournir un motif de rejet');

      return;
    }

    if (reason.trim().length < 20) {
      setError('Le motif doit contenir au moins 20 caractères');

      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(reason.trim());
    } catch (err) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  }, [reason, onConfirm]);

  if (!transfer) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'error.main' }}>
            <i className="ri-close-circle-line" />
          </Avatar>
          <Box>
            <Typography variant="h6">Rejeter le transfert</Typography>
            <Typography variant="body2" color="textSecondary">
              {transfer.transfer_number}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Vous êtes sur le point de rejeter la demande de transfert de{' '}
          <strong>{transfer.full_name}</strong> depuis{' '}
          <strong>{transfer.origin_institution}</strong>.
          Cette action est irréversible.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Motif du rejet"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Expliquez les raisons du rejet de cette demande de transfert (minimum 20 caractères)"
          required
          error={!!error && reason.length < 20}
          helperText={`${reason.length}/20 caractères minimum`}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={loading || reason.length < 20}
        >
          {loading ? 'Rejet en cours...' : 'Confirmer le rejet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
