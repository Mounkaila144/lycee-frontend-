'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { ProgrammeLevelSelector } from './ProgrammeLevelSelector';
import { useProgrammeLevels } from '../hooks/useProgrammeLevels';
import type { Programme } from '../../types/programme.types';
import type { ProgrammeLevel } from '../../types/programmeLevel.types';

interface ProgrammeLevelDialogProps {
  open: boolean;
  onClose: () => void;
  programme: Programme | null;
  onSuccess?: () => void;
}

/**
 * Dialog for managing programme levels
 * Allows associating/removing levels from a programme
 */
export const ProgrammeLevelDialog: React.FC<ProgrammeLevelDialogProps> = ({
  open,
  onClose,
  programme,
  onSuccess,
}) => {
  const { levels, loading, error, associateLevels } = useProgrammeLevels(programme?.id);
  const [selectedLevels, setSelectedLevels] = useState<ProgrammeLevel[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize selected levels when levels are loaded
  useEffect(() => {
    if (levels.length > 0) {
      setSelectedLevels(levels.map(l => l.level));
    } else {
      setSelectedLevels([]);
    }
  }, [levels]);

  const handleSubmit = async () => {
    if (!programme) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      await associateLevels(selectedLevels);
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSubmitError(null);
      onClose();
    }
  };

  if (!programme) return null;

  const canModify = programme.statut !== 'Actif';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Gérer les niveaux - {programme.libelle}
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        {!loading && !error && !canModify && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Les niveaux ne peuvent pas être modifiés pour un programme actif.
            Désactivez d'abord le programme.
          </Alert>
        )}

        {!loading && !error && (
          <ProgrammeLevelSelector
            programmeType={programme.type}
            selectedLevels={selectedLevels}
            onChange={setSelectedLevels}
            disabled={!canModify || submitting}
            error={submitError || undefined}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!canModify || submitting || selectedLevels.length === 0}
        >
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
