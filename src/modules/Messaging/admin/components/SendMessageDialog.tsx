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
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import { messagingService } from '../../services/messagingService';

const schema = object({
  recipient_id: pipe(number(), /* min handled at runtime */),
  subject: pipe(string(), minLength(1, 'Sujet requis'), minLength(3, 'Sujet trop court')),
  body: pipe(string(), minLength(1, 'Message requis')),
  student_context_id: optional(number()),
});

type FormData = InferInput<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSent?: () => void;
  defaultRecipientId?: number;
  defaultStudentContextId?: number;
}

export function SendMessageDialog({
  open,
  onClose,
  onSent,
  defaultRecipientId,
  defaultStudentContextId,
}: Props) {
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
      recipient_id: defaultRecipientId ?? 0,
      subject: '',
      body: '',
      student_context_id: defaultStudentContextId,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        recipient_id: defaultRecipientId ?? 0,
        subject: '',
        body: '',
        student_context_id: defaultStudentContextId,
      });
      setError(null);
    }
  }, [open, defaultRecipientId, defaultStudentContextId, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await messagingService.send({
        recipient_id: Number(data.recipient_id),
        subject: data.subject,
        body: data.body,
        student_context_id: data.student_context_id,
      });
      onSent?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur d’envoi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Nouveau message</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            {error && <Alert severity='error'>{error}</Alert>}
            <Controller
              name='recipient_id'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='number'
                  label='ID destinataire'
                  size='small'
                  error={!!errors.recipient_id}
                  helperText={errors.recipient_id?.message ?? 'ID utilisateur tenant cible'}
                  fullWidth
                />
              )}
            />
            <Controller
              name='subject'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Sujet'
                  size='small'
                  error={!!errors.subject}
                  helperText={errors.subject?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name='body'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Message'
                  multiline
                  rows={6}
                  error={!!errors.body}
                  helperText={errors.body?.message}
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
            {submitting ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
