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

interface ExemptionTeacherReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (opinion: string) => Promise<void>;
  exemption: ModuleExemption | null;
}

/**
 * ExemptionTeacherReviewDialog Component
 * Dialog for teacher to provide their opinion on an exemption request
 */
export const ExemptionTeacherReviewDialog = ({
  open,
  onClose,
  onConfirm,
  exemption,
}: ExemptionTeacherReviewDialogProps) => {
  const [opinion, setOpinion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setOpinion('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!opinion.trim()) {
      setError("Veuillez saisir votre avis");

      return;
    }

    if (opinion.length < 20) {
      setError("Votre avis doit contenir au moins 20 caractères");

      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(opinion);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement de l'avis");
    } finally {
      setLoading(false);
    }
  };

  if (!exemption) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="ri-message-2-line" />
          <Typography variant="h6">Donner un avis</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Exemption Summary */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Demande de dispense
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
                label={exemption.exemption_type_label}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Reason Summary */}
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Motif de la demande
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" fontWeight={500} gutterBottom>
              {exemption.reason_category_label}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {exemption.reason_details}
            </Typography>
          </Box>

          {/* Opinion Input */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Votre avis technique"
            value={opinion}
            onChange={e => setOpinion(e.target.value)}
            placeholder="Donnez votre avis technique sur cette demande de dispense. Votre opinion sera prise en compte lors de la validation finale."
            helperText={`${opinion.length}/20 caractères minimum`}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Soumettre l'avis"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
