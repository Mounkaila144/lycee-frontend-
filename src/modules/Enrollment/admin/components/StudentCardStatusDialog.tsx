'use client';

import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';

import type { StudentCard, CardStatus } from '../../types/studentCard.types';

interface StudentCardStatusDialogProps {
  open: boolean;
  card: StudentCard;
  onClose: () => void;
  onSubmit: (cardId: number, status: CardStatus, reason?: string) => Promise<void>;
  translations: Record<string, any>;
}

export const StudentCardStatusDialog = ({
  open,
  card,
  onClose,
  onSubmit,
  translations,
}: StudentCardStatusDialogProps) => {
  const t = translations;
  const [status, setStatus] = useState<CardStatus>(card.status);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiresReason = status === 'Suspended' || status === 'Revoked';

  const handleSubmit = async () => {
    if (requiresReason && !reason.trim()) {
      setError(t.studentCards?.reasonRequired || 'La raison est obligatoire pour ce statut');

      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(card.id, status, reason || undefined);
    } catch (err: any) {
      setError(err.message || t.studentCards?.updateError || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s: CardStatus): 'success' | 'warning' | 'error' | 'default' => {
    switch (s) {
      case 'Active':
        return 'success';
      case 'Expired':
        return 'warning';
      case 'Suspended':
        return 'error';
      case 'Revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <i className="ri-edit-line" style={{ fontSize: 24 }} />
          <span>{t.studentCards?.updateCardStatus || 'Modifier le statut de la carte'}</span>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Card Info */}
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              {t.studentCards?.cardInfo || 'Informations de la carte'}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">
                <strong>{t.studentCards?.cardNumber || 'N° Carte'}:</strong> {card.card_number}
              </Typography>
              <Chip
                label={t.studentCards?.statuses?.[card.status] || card.status}
                color={getStatusColor(card.status)}
                size="small"
              />
            </Stack>
            {card.student && (
              <Typography variant="body2">
                <strong>{t.studentCards?.student || 'Étudiant'}:</strong>{' '}
                {card.student.firstname} {card.student.lastname} ({card.student.matricule})
              </Typography>
            )}
          </Stack>

          {/* Status Selection */}
          <FormControl fullWidth>
            <InputLabel>{t.studentCards?.newStatus || 'Nouveau statut'}</InputLabel>
            <Select
              value={status}
              label={t.studentCards?.newStatus || 'Nouveau statut'}
              onChange={e => setStatus(e.target.value as CardStatus)}
            >
              <MenuItem value="Active">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={t.studentCards?.statuses?.Active || 'Active'} color="success" size="small" />
                </Stack>
              </MenuItem>
              <MenuItem value="Expired">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={t.studentCards?.statuses?.Expired || 'Expirée'} color="warning" size="small" />
                </Stack>
              </MenuItem>
              <MenuItem value="Suspended">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={t.studentCards?.statuses?.Suspended || 'Suspendue'} color="error" size="small" />
                </Stack>
              </MenuItem>
              <MenuItem value="Revoked">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={t.studentCards?.statuses?.Revoked || 'Révoquée'} color="error" size="small" />
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Reason (required for Suspended/Revoked) */}
          {requiresReason && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t.studentCards?.reason || 'Raison'}
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              helperText={t.studentCards?.reasonHelperText || 'Veuillez indiquer la raison de ce changement de statut'}
            />
          )}

          {status !== card.status && (
            <Alert severity="warning">
              {t.studentCards?.statusChangeWarning ||
                'Attention: cette action modifiera le statut de la carte de manière permanente.'}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t.common?.cancel || 'Annuler'}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || status === card.status}
          startIcon={loading ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
        >
          {t.common?.save || 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentCardStatusDialog;
