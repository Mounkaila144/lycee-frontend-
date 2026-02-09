'use client';

import React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

interface LockYearDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  locking: boolean;
}

export const LockYearDialog: React.FC<LockYearDialogProps> = ({
  open,
  onClose,
  onConfirm,
  locking,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Verrouiller l'année académique
      </DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Attention !</strong> Cette action est définitive et ne peut pas être annulée.
        </Alert>
        <Typography variant="body1" gutterBottom>
          Après le verrouillage :
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>Aucune modification de notes ne sera possible</li>
          <li>Les données seront archivées définitivement</li>
          <li>Un rapport final sera généré</li>
          <li>Le déverrouillage nécessitera une validation exceptionnelle</li>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={locking}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={locking}
          startIcon={locking ? <CircularProgress size={16} /> : <i className="ri-lock-line" />}
        >
          {locking ? 'Verrouillage...' : 'Verrouiller définitivement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
