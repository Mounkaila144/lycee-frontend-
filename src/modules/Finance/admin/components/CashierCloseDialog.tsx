'use client';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { createApiClient } from '@/shared/lib/api-client';

import { formatXof } from './ReceiptDialog';

/** Réponse de GET /admin/finance/cashier-close/preview */
interface ClosePreview {
  close_date: string;
  already_closed: boolean;
  total_cash_system: number;
  total_cheque: number;
  total_mobile_money: number;
  total_card: number;
  total_transfer: number;
  total_online: number;
  payments_count: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const todayIso = () => new Date().toISOString().split('T')[0];

/**
 * Story Caissier 05 — Clôture de caisse.
 *
 * Les totaux « système » sont calculés par le backend à partir des paiements
 * enregistrés par le caissier connecté pour la date choisie ; le caissier
 * saisit uniquement les espèces réellement comptées. Le backend calcule
 * l'écart et le statut (closed / variance_pending).
 */
export function CashierCloseDialog({ open, onClose, onCreated }: Props) {
  const [closeDate, setCloseDate] = useState(todayIso());
  const [declaredCash, setDeclaredCash] = useState('');
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<ClosePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCloseDate(todayIso());
      setDeclaredCash('');
      setNotes('');
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !closeDate) return;

    let cancelled = false;

    setPreviewLoading(true);
    createApiClient()
      .get<{ data: ClosePreview }>('/admin/finance/cashier-close/preview', { params: { date: closeDate } })
      .then(({ data }) => {
        if (!cancelled) setPreview(data.data);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, closeDate]);

  const declared = Number(declaredCash);
  const declaredIsValid = declaredCash !== '' && Number.isFinite(declared) && declared >= 0;
  const variance = preview && declaredIsValid ? declared - Number(preview.total_cash_system) : null;

  const handleSubmit = async () => {
    if (!declaredIsValid) {
      setError('Saisissez le montant en espèces compté dans la caisse.');

      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await createApiClient().post('/admin/finance/cashier-close', {
        close_date: closeDate,
        total_cash_declared: declared,
        notes: notes || undefined,
      });

      const serverVariance = Number(res.data?.data?.variance ?? 0);

      setSuccess(
        res.data?.data?.status === 'closed'
          ? 'Caisse clôturée sans écart.'
          : `Caisse clôturée avec un écart de ${formatXof(serverVariance)}.`,
      );
      onCreated?.();
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur de clôture.');
    } finally {
      setSubmitting(false);
    }
  };

  const systemRow = (label: string, value: number | undefined) => (
    <Grid size={{ xs: 6, sm: 4 }}>
      <Typography variant='caption' color='text.secondary'>{label}</Typography>
      <Typography fontWeight='medium'>{formatXof(value ?? 0)}</Typography>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Clôture de caisse</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          {error && <Alert severity='error'>{error}</Alert>}
          {success && <Alert severity='success'>{success}</Alert>}
          {preview?.already_closed && !success && (
            <Alert severity='warning'>La caisse a déjà été clôturée pour cette date.</Alert>
          )}

          <TextField
            type='date'
            label='Date de clôture'
            size='small'
            value={closeDate}
            onChange={e => setCloseDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: todayIso() } }}
          />

          <Paper variant='outlined' sx={{ p: 2 }}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Mes encaissements enregistrés ce jour {preview ? `(${preview.payments_count} paiement(s))` : ''}
            </Typography>
            {previewLoading ? (
              <Box display='flex' justifyContent='center' p={2}><CircularProgress size={24} /></Box>
            ) : (
              <Grid container spacing={2}>
                {systemRow('Espèces (système)', preview?.total_cash_system)}
                {systemRow('Chèques', preview?.total_cheque)}
                {systemRow('Mobile Money', preview?.total_mobile_money)}
                {systemRow('Cartes', preview?.total_card)}
                {systemRow('Virements', preview?.total_transfer)}
                {systemRow('En ligne', preview?.total_online)}
              </Grid>
            )}
          </Paper>

          <TextField
            type='number'
            label='Espèces comptées dans la caisse (XOF)'
            size='small'
            value={declaredCash}
            onChange={e => setDeclaredCash(e.target.value)}
            helperText={variance !== null ? `Écart prévisionnel : ${formatXof(variance)}` : ' '}
            error={variance !== null && Math.abs(variance) > 0.01}
            slotProps={{ htmlInput: { min: 0 } }}
          />

          <TextField
            label='Notes (optionnel)'
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={submitting || previewLoading || !!preview?.already_closed || !!success}
        >
          {submitting ? 'Enregistrement...' : 'Clôturer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
