'use client';

import React, { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import type { EliminatoryModule } from '../../types/eliminatory.types';

interface ThresholdEditDialogProps {
  open: boolean;
  module: EliminatoryModule | null;
  onClose: () => void;
  onSave: (moduleId: number, threshold: number) => Promise<boolean>;
  saving: boolean;
  validateThreshold: (value: number) => { valid: boolean; error?: string };
}

export const ThresholdEditDialog: React.FC<ThresholdEditDialogProps> = ({
  open,
  module,
  onClose,
  onSave,
  saving,
  validateThreshold,
}) => {
  const [threshold, setThreshold] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (module) {
      setThreshold(String(module.threshold));
      setValidationError(null);
    }
  }, [module]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    setThreshold(val);

    const num = parseFloat(val);

    if (!isNaN(num)) {
      const result = validateThreshold(num);

      setValidationError(result.valid ? null : result.error || null);
    } else {
      setValidationError('Veuillez entrer un nombre valide');
    }
  };

  const handleSave = async () => {
    const num = parseFloat(threshold);

    if (isNaN(num) || !module) return;

    const result = validateThreshold(num);

    if (!result.valid) {
      setValidationError(result.error || 'Valeur invalide');

      return;
    }

    const success = await onSave(module.id, num);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Modifier le seuil éliminatoire
      </DialogTitle>
      <DialogContent>
        {module && (
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Module: <strong>{module.name}</strong> ({module.code})
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Le seuil éliminatoire définit la note minimale requise pour valider ce module.
              Les étudiants en dessous de ce seuil devront repasser le module.
            </Alert>

            <TextField
              label="Seuil éliminatoire (/20)"
              type="number"
              value={threshold}
              onChange={handleChange}
              error={!!validationError}
              helperText={validationError || 'Valeur entre 5 et 20'}
              fullWidth
              inputProps={{ min: 5, max: 20, step: 0.5 }}
              sx={{ mt: 1 }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Seuil actuel: {module.threshold}/20
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !!validationError || !threshold}
          startIcon={saving ? <CircularProgress size={16} /> : undefined}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
