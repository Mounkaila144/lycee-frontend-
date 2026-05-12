'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { object, string, pipe, minLength, number, minValue, optional } from 'valibot';
import type { InferInput } from 'valibot';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import { createApiClient } from '@/shared/lib/api-client';

const schema = object({
  close_date: pipe(string(), minLength(1, 'Date requise')),
  total_cash_declared: pipe(number(), minValue(0)),
  total_cash_system: pipe(number(), minValue(0)),
  total_cheque: optional(number()),
  total_mobile_money: optional(number()),
  total_card: optional(number()),
  total_transfer: optional(number()),
  notes: optional(string()),
});

type FormData = InferInput<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

/**
 * Story Caissier 05 — Form de clôture de caisse.
 *
 * Le caissier saisit total déclaré + montant système, le backend calcule
 * automatiquement la variance et le statut (closed si écart 0, variance_pending sinon).
 */
export function CashierCloseDialog({ open, onClose, onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      close_date: today,
      total_cash_declared: 0,
      total_cash_system: 0,
      total_cheque: 0,
      total_mobile_money: 0,
      total_card: 0,
      total_transfer: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        close_date: today,
        total_cash_declared: 0,
        total_cash_system: 0,
        total_cheque: 0,
        total_mobile_money: 0,
        total_card: 0,
        total_transfer: 0,
        notes: '',
      });
      setError(null);
      setSuccess(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await createApiClient().post('/admin/finance/cashier-close', data);
      const variance = Number(res.data?.data?.variance ?? 0);
      const status = res.data?.data?.status;
      setSuccess(
        status === 'closed'
          ? 'Caisse clôturée sans écart ✅'
          : `Caisse clôturée avec écart de ${variance.toFixed(2)} XOF ⚠️`
      );
      onCreated?.();
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur de clôture.');
    } finally {
      setSubmitting(false);
    }
  };

  const numberField = (
    name: keyof FormData,
    label: string,
    helperText?: string
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type='number'
          label={label}
          size='small'
          error={!!errors[name]}
          helperText={(errors[name]?.message as string) ?? helperText}
          fullWidth
        />
      )}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Clôture de caisse</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            {error && <Alert severity='error'>{error}</Alert>}
            {success && <Alert severity='success'>{success}</Alert>}

            <Controller
              name='close_date'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='date'
                  label='Date de clôture'
                  size='small'
                  error={!!errors.close_date}
                  helperText={errors.close_date?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {numberField('total_cash_declared', 'Espèces déclarées (caissier)')}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {numberField('total_cash_system', 'Espèces (système)')}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>{numberField('total_cheque', 'Chèques')}</Grid>
              <Grid size={{ xs: 12, sm: 6 }}>{numberField('total_mobile_money', 'Mobile Money')}</Grid>
              <Grid size={{ xs: 12, sm: 6 }}>{numberField('total_card', 'Cartes')}</Grid>
              <Grid size={{ xs: 12, sm: 6 }}>{numberField('total_transfer', 'Virements')}</Grid>
            </Grid>

            <Controller
              name='notes'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Notes (optionnel)'
                  multiline
                  rows={3}
                  fullWidth
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button type='submit' variant='contained' disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'Clôturer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
