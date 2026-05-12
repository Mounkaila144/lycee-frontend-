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
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { parentService } from '../../services/parentService';

const schema = object({
  method: pipe(string(), minLength(1, 'Méthode requise')),
  amount: pipe(number(), minValue(100, 'Montant minimum 100')),
  phone: optional(string()),
});

type FormData = InferInput<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: number;
  invoiceId: number;
  defaultAmount: number;
}

/**
 * Story Parent 06 — Dialog de paiement CinetPay.
 *
 * Flow :
 *   1. Parent saisit method (mobile_money/card) + montant + phone
 *   2. POST → backend init CinetPay → renvoie payment_url
 *   3. Redirect window.location vers payment_url (CinetPay hosted page)
 *   4. CinetPay redirect → return_url avec ?transaction_id=...
 *   5. Page de retour (PaymentReturnPage) polle le status
 */
export function CinetPayPaymentDialog({
  open,
  onClose,
  studentId,
  invoiceId,
  defaultAmount,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      method: 'mobile_money',
      amount: defaultAmount,
      phone: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ method: 'mobile_money', amount: defaultAmount, phone: '' });
      setError(null);
      setRedirecting(false);
    }
  }, [open, defaultAmount, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const payment = await parentService.initiatePayment(studentId, invoiceId, {
        method: data.method as 'mobile_money' | 'card',
        amount: Number(data.amount),
        phone: data.phone,
      });

      if (payment.payment_url) {
        setRedirecting(true);
        // Petit délai pour laisser l'UI rendre l'état "redirecting"
        setTimeout(() => {
          window.location.href = payment.payment_url!;
        }, 400);
      } else {
        setError('URL de paiement non reçue. Réessayez.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Échec de l’initialisation du paiement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Paiement en ligne (CinetPay)</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            {error && <Alert severity='error'>{error}</Alert>}
            {redirecting && (
              <Alert severity='info'>
                Redirection vers CinetPay en cours… ne fermez pas cette page.
              </Alert>
            )}

            <Typography variant='body2' color='text.secondary'>
              Facture #{invoiceId} — élève #{studentId}
            </Typography>

            <Controller
              name='method'
              control={control}
              render={({ field }) => (
                <div>
                  <FormLabel>Méthode de paiement</FormLabel>
                  <RadioGroup {...field} row>
                    <FormControlLabel
                      value='mobile_money'
                      control={<Radio />}
                      label='Mobile Money'
                    />
                    <FormControlLabel value='card' control={<Radio />} label='Carte bancaire' />
                  </RadioGroup>
                </div>
              )}
            />

            <Controller
              name='amount'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='number'
                  label='Montant (XOF)'
                  size='small'
                  error={!!errors.amount}
                  helperText={errors.amount?.message ?? 'Minimum 100 XOF'}
                  fullWidth
                />
              )}
            />

            <Controller
              name='phone'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Téléphone (Mobile Money)'
                  size='small'
                  placeholder='+22790000000'
                  helperText='Requis pour Mobile Money'
                  fullWidth
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting || redirecting}>
            Annuler
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={submitting || redirecting}
          >
            {submitting ? 'Initialisation...' : 'Payer maintenant'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
