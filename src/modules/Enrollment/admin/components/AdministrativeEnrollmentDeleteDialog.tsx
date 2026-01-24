'use client';

import { useState } from 'react';

// MUI Imports
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Service Imports
import { administrativeEnrollmentService } from '../services/administrativeEnrollmentService';
import { useTenant } from '@/shared/lib/tenant-context';

// Type Imports
import type { AdministrativeEnrollment } from '../../types/administrativeEnrollment.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  enrollment: AdministrativeEnrollment | null;
}

export const AdministrativeEnrollmentDeleteDialog = ({ open, onClose, onSuccess, enrollment }: Props) => {
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!enrollment) return;

    setError(null);

    try {
      setLoading(true);
      await administrativeEnrollmentService.delete(enrollment.id, tenantId || undefined);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  if (!enrollment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Supprimer l'inscription</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 2 }}>
          Cette action est irréversible. L'inscription sera définitivement supprimée.
        </Alert>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Êtes-vous sûr de vouloir supprimer cette inscription ?
        </Typography>

        <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Etudiant
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {enrollment.student ? `${enrollment.student.firstname} ${enrollment.student.lastname} (${enrollment.student.matricule})` : 'N/A'}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary">
            Programme
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {enrollment.programme?.libelle || 'N/A'}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary">
            Niveau
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {enrollment.level}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary">
            Semestre
          </Typography>
          <Typography variant="body1">
            {enrollment.semester?.name || 'N/A'}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="contained" color="error" onClick={handleDelete} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
