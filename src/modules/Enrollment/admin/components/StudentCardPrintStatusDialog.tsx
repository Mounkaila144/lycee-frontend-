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
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';

import type { StudentCard, CardPrintStatus } from '../../types/studentCard.types';

interface StudentCardPrintStatusDialogProps {
  open: boolean;
  card: StudentCard;
  onClose: () => void;
  onSubmit: (cardId: number, printStatus: CardPrintStatus) => Promise<void>;
  translations: Record<string, any>;
}

export const StudentCardPrintStatusDialog = ({
  open,
  card,
  onClose,
  onSubmit,
  translations,
}: StudentCardPrintStatusDialogProps) => {
  const t = translations;
  const [printStatus, setPrintStatus] = useState<CardPrintStatus>(card.print_status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await onSubmit(card.id, printStatus);
    } catch (err: any) {
      setError(err.message || t.studentCards?.updateError || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const getPrintStatusColor = (s: CardPrintStatus): 'info' | 'success' | 'default' => {
    switch (s) {
      case 'Pending':
        return 'info';
      case 'Printed':
        return 'success';
      case 'Delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <i className="ri-printer-line" style={{ fontSize: 24 }} />
          <span>{t.studentCards?.updatePrintStatus || 'Modifier le statut d\'impression'}</span>
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
                label={t.studentCards?.printStatuses?.[card.print_status] || card.print_status}
                color={getPrintStatusColor(card.print_status)}
                size="small"
                variant="outlined"
              />
            </Stack>
            {card.student && (
              <Typography variant="body2">
                <strong>{t.studentCards?.student || 'Étudiant'}:</strong>{' '}
                {card.student.firstname} {card.student.lastname} ({card.student.matricule})
              </Typography>
            )}
          </Stack>

          {/* Print Status Selection */}
          <FormControl fullWidth>
            <InputLabel>{t.studentCards?.newPrintStatus || 'Nouveau statut d\'impression'}</InputLabel>
            <Select
              value={printStatus}
              label={t.studentCards?.newPrintStatus || 'Nouveau statut d\'impression'}
              onChange={e => setPrintStatus(e.target.value as CardPrintStatus)}
            >
              <MenuItem value="Pending">
                <Stack direction="row" spacing={1} alignItems="center">
                  <i className="ri-time-line" />
                  <span>{t.studentCards?.printStatuses?.Pending || 'En attente'}</span>
                </Stack>
              </MenuItem>
              <MenuItem value="Printed">
                <Stack direction="row" spacing={1} alignItems="center">
                  <i className="ri-printer-line" />
                  <span>{t.studentCards?.printStatuses?.Printed || 'Imprimée'}</span>
                </Stack>
              </MenuItem>
              <MenuItem value="Delivered">
                <Stack direction="row" spacing={1} alignItems="center">
                  <i className="ri-checkbox-circle-line" />
                  <span>{t.studentCards?.printStatuses?.Delivered || 'Livrée'}</span>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Timestamps */}
          <Stack spacing={1}>
            {card.printed_at && (
              <Typography variant="body2" color="text.secondary">
                <i className="ri-printer-line" style={{ marginRight: 8 }} />
                {t.studentCards?.printedAt || 'Imprimée le'}:{' '}
                {new Date(card.printed_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            )}
            {card.delivered_at && (
              <Typography variant="body2" color="text.secondary">
                <i className="ri-checkbox-circle-line" style={{ marginRight: 8 }} />
                {t.studentCards?.deliveredAt || 'Livrée le'}:{' '}
                {new Date(card.delivered_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t.common?.cancel || 'Annuler'}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || printStatus === card.print_status}
          startIcon={loading ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
        >
          {t.common?.save || 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentCardPrintStatusDialog;
