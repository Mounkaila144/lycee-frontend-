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
import type { Programme } from '../../types/programme.types';
import { useProgrammesContext } from './ProgrammeList';

interface ProgrammeDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  programme: Programme | null;
}

const ProgrammeDeleteDialog = ({ open, onClose, onSuccess, programme }: ProgrammeDeleteDialogProps) => {
  const { deleteProgramme, loading } = useProgrammesContext();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!programme) return;
    
    setError(null);
    try {
      await deleteProgramme(programme.id);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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
      <DialogTitle>Supprimer le programme</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer le programme <strong>{programme.libelle}</strong> ({programme.code}) ?
        </DialogContentText>

        {programme.students_count && programme.students_count > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Attention : Ce programme a {programme.students_count} étudiant(s) inscrit(s).
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgrammeDeleteDialog;
