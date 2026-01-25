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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';

import type { ModuleExemption, ExemptionValidationData } from '../../types/exemption.types';

interface ExemptionValidationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: ExemptionValidationData) => Promise<void>;
  exemption: ModuleExemption | null;
}

type Decision = 'Approved' | 'Partially_Approved' | 'Rejected';

/**
 * ExemptionValidationDialog Component
 * Dialog for validating or rejecting an exemption request
 */
export const ExemptionValidationDialog = ({
  open,
  onClose,
  onConfirm,
  exemption,
}: ExemptionValidationDialogProps) => {
  const [decision, setDecision] = useState<Decision>('Approved');
  const [notes, setNotes] = useState('');
  const [grade, setGrade] = useState<number | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setDecision('Approved');
      setNotes('');
      setGrade('');
      setRejectionReason('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validation
    if (decision === 'Rejected' && !rejectionReason.trim()) {
      setError("Veuillez indiquer le motif du rejet");

      return;
    }

    if (decision === 'Rejected' && rejectionReason.length < 20) {
      setError("Le motif du rejet doit contenir au moins 20 caractères");

      return;
    }

    if (decision === 'Partially_Approved' && !notes.trim()) {
      setError("Veuillez indiquer les conditions de la dispense partielle");

      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data: ExemptionValidationData = {
        decision,
        notes: notes || undefined,
        grade: grade !== '' ? grade : undefined,
        rejection_reason: rejectionReason || undefined,
      };

      await onConfirm(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la validation");
    } finally {
      setLoading(false);
    }
  };

  if (!exemption) return null;

  const isApproval = decision !== 'Rejected';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="ri-checkbox-circle-line" />
          <Typography variant="h6">Valider la demande de dispense</Typography>
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
                label={`${exemption.module?.ects} ECTS`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Teacher Opinion if available */}
          {exemption.teacher_opinion && (
            <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1, mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Avis de l&apos;enseignant
              </Typography>
              <Typography variant="body2">{exemption.teacher_opinion}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Decision */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Décision</InputLabel>
            <Select
              value={decision}
              label="Décision"
              onChange={e => setDecision(e.target.value as Decision)}
            >
              <MenuItem value="Approved">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="ri-check-line" style={{ color: 'green' }} />
                  Approuver
                </Box>
              </MenuItem>
              <MenuItem value="Partially_Approved">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="ri-indeterminate-circle-line" style={{ color: 'orange' }} />
                  Approuver partiellement
                </Box>
              </MenuItem>
              <MenuItem value="Rejected">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="ri-close-line" style={{ color: 'red' }} />
                  Rejeter
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Approval fields */}
          {isApproval && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Note forfaitaire (optionnel)"
                  value={grade}
                  onChange={e => setGrade(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  inputProps={{ min: 0, max: 20, step: 0.5 }}
                  helperText="Note sur 20 accordée si applicable"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={decision === 'Partially_Approved' ? "Conditions de la dispense partielle *" : "Notes de validation (optionnel)"}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={
                    decision === 'Partially_Approved'
                      ? "Précisez les conditions et limitations de la dispense partielle"
                      : "Notes ou commentaires sur la validation"
                  }
                  required={decision === 'Partially_Approved'}
                />
              </Grid>
            </Grid>
          )}

          {/* Rejection fields */}
          {!isApproval && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motif du rejet *"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Expliquez les raisons du rejet de cette demande de dispense"
              helperText={`${rejectionReason.length}/20 caractères minimum`}
              required
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color={isApproval ? 'success' : 'error'}
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            isApproval
              ? <i className="ri-check-line" />
              : <i className="ri-close-line" />
          }
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : isApproval ? (
            decision === 'Approved' ? 'Approuver' : 'Approuver partiellement'
          ) : (
            'Rejeter'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
