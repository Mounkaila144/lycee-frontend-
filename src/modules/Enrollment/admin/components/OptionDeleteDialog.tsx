'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { useTenant } from '@/shared/lib/tenant-context';
import { optionService } from '../services/optionService';
import type { Option } from '../../types/option.types';

interface OptionDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  option: Option | null;
  onSuccess: () => void;
}

export const OptionDeleteDialog = ({
  open,
  onClose,
  option,
  onSuccess,
}: OptionDeleteDialogProps) => {
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!option) return;

    setLoading(true);
    setError(null);

    try {
      await optionService.deleteOption(option.id, tenantId || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error deleting option:', err);
      setError(
        err.response?.data?.message ||
          'Erreur lors de la suppression. L\'option a peut-être des affectations.'
      );
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

  if (!option) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-error-warning-line" style={{ color: '#f44336', fontSize: 24 }} />
          <Typography variant="h6">Confirmer la suppression</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body1" gutterBottom>
          Êtes-vous sûr de vouloir supprimer cette option ?
        </Typography>

        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Option à supprimer :
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {option.code} - {option.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Capacité: {option.capacity} places | Niveau: {option.level}
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          Cette action est irréversible. Les vœux et affectations liés seront également supprimés.
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <i className="ri-delete-bin-line" />}
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OptionDeleteDialog;
