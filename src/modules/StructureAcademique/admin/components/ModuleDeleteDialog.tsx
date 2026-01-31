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
import { useTranslation } from '@/shared/i18n/use-translation';
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
  const { t } = useTranslation('StructureAcademique');
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
      setError(err instanceof Error ? err.message : t('Erreur lors de la suppression'));
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
        <Typography variant="h6">{t('Supprimer le module')}</Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!canDelete ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('Ce module ne peut pas être supprimé car il a des inscriptions actives ou des notes saisies.')}
          </Alert>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              {t('Êtes-vous sûr de vouloir supprimer ce module ?')}
            </Typography>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>{t('Code')}:</strong> {module.code}
              </Typography>
              <Typography variant="body2">
                <strong>{t('Nom')}:</strong> {module.name}
              </Typography>
              <Typography variant="body2">
                <strong>{t('Niveau')}:</strong> {module.level} - {module.semester}
              </Typography>
              <Typography variant="body2">
                <strong>{t('Crédits ECTS')}:</strong> {module.credits_ects}
              </Typography>
            </Box>

            {module.enrollments_count && module.enrollments_count > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>{t('Impact')}:</strong> {module.enrollments_count} {t('étudiant(s) inscrit(s)')}
                </Typography>
              </Alert>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('Cette action est réversible. Le module sera archivé et pourra être restauré ultérieurement.')}
              </Typography>
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={deleting}>
          {t('Annuler')}
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={deleting || !canDelete}
          startIcon={deleting ? <CircularProgress size={16} /> : null}
        >
          {deleting ? t('Suppression...') : t('Supprimer')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleDeleteDialog;
