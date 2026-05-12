'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { object, string, pipe, minLength, number, optional } from 'valibot';
import type { InferInput } from 'valibot';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

import { createApiClient } from '@/shared/lib/api-client';

const schema = object({
  name: pipe(string(), minLength(1, 'Nom requis')),
  iban: optional(string()),
  bank_name: optional(string()),
  currency: optional(string()),
  opening_balance: optional(number()),
});

type FormData = InferInput<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

/**
 * Story Comptable 03 — Création d'un compte bancaire pour rapprochement.
 */
export function BankAccountDialog({ open, onClose, onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      iban: '',
      bank_name: '',
      currency: 'XOF',
      opening_balance: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: '',
        iban: '',
        bank_name: '',
        currency: 'XOF',
        opening_balance: 0,
      });
      setError(null);
    }
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createApiClient().post('/admin/finance/bank-reconciliation/accounts', data);
      onCreated?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur de création.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Nouveau compte bancaire</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            {error && <Alert severity='error'>{error}</Alert>}
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Nom du compte'
                  size='small'
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name='bank_name'
              control={control}
              render={({ field }) => (
                <TextField {...field} label='Banque' size='small' fullWidth />
              )}
            />
            <Controller
              name='iban'
              control={control}
              render={({ field }) => (
                <TextField {...field} label='IBAN' size='small' fullWidth />
              )}
            />
            <Controller
              name='currency'
              control={control}
              render={({ field }) => (
                <TextField {...field} label='Devise' size='small' fullWidth />
              )}
            />
            <Controller
              name='opening_balance'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='number'
                  label='Solde d’ouverture'
                  size='small'
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
            {submitting ? 'Enregistrement...' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
