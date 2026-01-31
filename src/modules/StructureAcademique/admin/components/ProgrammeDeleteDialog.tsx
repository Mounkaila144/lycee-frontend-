'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from '@/shared/i18n/use-translation';
import type { Programme } from '../../types/programme.types';
import { useProgrammesContext } from './ProgrammeList';

interface ProgrammeDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  programme: Programme | null;
}

const ProgrammeDeleteDialog = ({ open, onClose, onSuccess, programme }: ProgrammeDeleteDialogProps) => {
  const { t } = useTranslation('StructureAcademique');
  const { deleteProgramme, loading } = useProgrammesContext();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!programme) return;
    
    setError(null);
    try {
      await deleteProgramme(programme.id);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Une erreur est survenue'));
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!programme) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('Supprimer la filière')}</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <DialogContentText>
          {t('Êtes-vous sûr de vouloir supprimer la filière')} <strong>{programme.libelle}</strong> ({programme.code}) ?
        </DialogContentText>

        {programme.students_count && programme.students_count > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('Attention : Cette filière a')} {programme.students_count} {t('étudiant(s) inscrit(s).')}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t('Annuler')}
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : t('Supprimer')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgrammeDeleteDialog;
