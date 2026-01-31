'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  Grid,
} from '@mui/material';
import { useTranslation } from '@/shared/i18n/use-translation';
import type { AcademicLevel, LevelCreditConfiguration, LevelCreditFormData } from '../../types/levelCredit.types';

interface LevelCreditConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LevelCreditFormData) => Promise<void>;
  level: AcademicLevel;
  existingConfig?: LevelCreditConfiguration;
  title?: string;
}

const LevelCreditConfigDialog: React.FC<LevelCreditConfigDialogProps> = ({
  open,
  onClose,
  onSave,
  level,
  existingConfig,
  title,
}) => {
  const [semester1Credits, setSemester1Credits] = useState<number>(30);
  const [semester2Credits, setSemester2Credits] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with existing config or defaults
  useEffect(() => {
    if (existingConfig) {
      setSemester1Credits(existingConfig.semester_1_credits);
      setSemester2Credits(existingConfig.semester_2_credits);
    } else {
      setSemester1Credits(30);
      setSemester2Credits(30);
    }
  }, [existingConfig, open]);

  const totalCredits = semester1Credits + semester2Credits;
  const isBalanced = Math.abs(semester1Credits - semester2Credits) <= 10;
  const isValidTotal = totalCredits === 60;

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const data: LevelCreditFormData = {
        level,
        semester_1_credits: semester1Credits,
        semester_2_credits: semester2Credits,
      };

      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {title || `Configuration des crédits ECTS - ${level}`}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Crédits Semestre 1"
                type="number"
                value={semester1Credits}
                onChange={(e) => setSemester1Credits(Number(e.target.value))}
                inputProps={{ min: 15, max: 45 }}
                disabled={loading}
                helperText="Entre 15 et 45 crédits"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Crédits Semestre 2"
                type="number"
                value={semester2Credits}
                onChange={(e) => setSemester2Credits(Number(e.target.value))}
                inputProps={{ min: 15, max: 45 }}
                disabled={loading}
                helperText="Entre 15 et 45 crédits"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Récapitulatif
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total annuel: <strong>{totalCredits} crédits</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Différence S1-S2: <strong>{Math.abs(semester1Credits - semester2Credits)} crédits</strong>
            </Typography>
          </Box>

          {!isValidTotal && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Le total annuel devrait être de 60 crédits selon les normes LMD.
              Total actuel: {totalCredits} crédits.
            </Alert>
          )}

          {!isBalanced && (
            <Alert severity="info" sx={{ mt: 2 }}>
              La répartition est déséquilibrée (différence &gt; 10 crédits).
              Cela peut être intentionnel selon votre maquette pédagogique.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || semester1Credits < 15 || semester2Credits < 15}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LevelCreditConfigDialog;
