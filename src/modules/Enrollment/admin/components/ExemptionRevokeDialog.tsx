'use client';

import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';

import type { ModuleExemption } from '../../types/exemption.types';

interface ExemptionRevokeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  exemption: ModuleExemption | null;
}

/**
 * ExemptionRevokeDialog Component
 * Dialog for revoking an approved exemption
 */
export const ExemptionRevokeDialog = ({
  open,
  onClose,
  onConfirm,
  exemption,
}: ExemptionRevokeDialogProps) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setReason('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Veuillez indiquer le motif de la révocation");

      return;
    }

    if (reason.length < 20) {
      setError("Le motif de la révocation doit contenir au moins 20 caractères");

      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(reason);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la révocation");
    } finally {
      setLoading(false);
    }
  };

  if (!exemption) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="ri-close-circle-line" style={{ color: 'red' }} />
          <Typography variant="h6" color="error">
            Révoquer la dispense
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={500}>
              Attention : cette action est irréversible
            </Typography>
            <Typography variant="body2">
              La révocation annulera définitivement cette dispense. L&apos;étudiant devra refaire une nouvelle demande si nécessaire.
            </Typography>
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Exemption Summary */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Dispense à révoquer
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {exemption.exemption_number}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`${exemption.student?.firstname} ${exemption.student?.lastname}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={exemption.module?.name}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={exemption.status_label}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
            {exemption.grade_granted && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Note accordée : <strong>{exemption.grade_granted}/20</strong>
              </Typography>
            )}
            {exemption.ects_granted > 0 && (
              <Typography variant="body2">
                ECTS accordés : <strong>{exemption.ects_granted}</strong>
              </Typography>
            )}
          </Box>

          {/* Reason Input */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motif de la révocation *"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Expliquez les raisons de la révocation de cette dispense"
            helperText={`${reason.length}/20 caractères minimum`}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<i className="ri-close-circle-line" />}
        >
          {loading ? <CircularProgress size={24} /> : 'Révoquer la dispense'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
