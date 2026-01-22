'use client';

import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

import type { Group } from '../../types/group.types';

interface GroupDeleteDialogProps {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * GroupDeleteDialog Component
 * Confirmation dialog for deleting a group
 */
export const GroupDeleteDialog = ({ open, group, onClose, onConfirm }: GroupDeleteDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const hasStudents = (group?.current_count || 0) > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Supprimer le groupe</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {hasStudents && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Ce groupe contient {group?.current_count} étudiant(s). La suppression retirera toutes les affectations.
          </Alert>
        )}

        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer ce groupe ?
        </DialogContentText>

        {group && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {group.code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {group.name}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Chip label={group.type} size="small" />
              <Chip label={group.level} size="small" variant="outlined" />
              <Chip label={`${group.current_count || 0}/${group.capacity_max} étudiants`} size="small" variant="outlined" />
            </Box>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Cette action est réversible. Le groupe sera marqué comme supprimé mais pourra être restauré par un administrateur.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="contained" color="error" onClick={handleConfirm} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupDeleteDialog;
