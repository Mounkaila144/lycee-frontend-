'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import type { Module } from '../../types/module.types';

interface ModuleDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  module: Module | null;
}

const ModuleDeleteDialog: React.FC<ModuleDeleteDialogProps> = ({
  open,
  onClose,
  onSuccess,
  module,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!module) return;

    try {
      setDeleting(true);
      setError(null);
      
      // The actual deletion will be handled by the parent component
      // This is just the confirmation dialog
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      console.error('Error deleting module:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (!module) return null;

  const canDelete = module.can_be_deleted !== false;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Supprimer le module</Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!canDelete ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Ce module ne peut pas être supprimé car il a des inscriptions actives ou des notes saisies.
          </Alert>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              Êtes-vous sûr de vouloir supprimer ce module ?
            </Typography>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Code:</strong> {module.code}
              </Typography>
              <Typography variant="body2">
                <strong>Nom:</strong> {module.name}
              </Typography>
              <Typography variant="body2">
                <strong>Niveau:</strong> {module.level} - {module.semester}
              </Typography>
              <Typography variant="body2">
                <strong>Crédits ECTS:</strong> {module.credits_ects}
              </Typography>
            </Box>

            {module.enrollments_count && module.enrollments_count > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Impact:</strong> {module.enrollments_count} étudiant(s) inscrit(s)
                </Typography>
              </Alert>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Cette action est réversible. Le module sera archivé et pourra être restauré ultérieurement.
              </Typography>
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={deleting}>
          Annuler
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={deleting || !canDelete}
          startIcon={deleting ? <CircularProgress size={16} /> : null}
        >
          {deleting ? 'Suppression...' : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleDeleteDialog;
