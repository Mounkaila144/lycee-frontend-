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
import Typography from '@mui/material/Typography';
import { useStudentsContext } from './StudentList';
import type { Student } from '../../types/student.types';

interface StudentDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: Student | null;
}

export const StudentDeleteDialog = ({ open, onClose, onSuccess, student }: StudentDeleteDialogProps) => {
  const { deleteStudent, loading } = useStudentsContext();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!student) return;

    setError(null);

    try {
      await deleteStudent(student.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue';

      setError(errorMessage);
      console.error('Error deleting student:', err);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!student) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Supprimer l'étudiant</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer cet étudiant ?
        </DialogContentText>
        <Typography variant="body2" sx={{ mt: 2, fontWeight: 'medium' }}>
          Matricule: {student.matricule}
        </Typography>
        <Typography variant="body2">
          Nom complet: {student.firstname} {student.lastname}
        </Typography>
        <Typography variant="body2">Email: {student.email}</Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Cette action est réversible. L'étudiant sera marqué comme supprimé mais pourra être
          restauré par un administrateur.
        </Alert>
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
