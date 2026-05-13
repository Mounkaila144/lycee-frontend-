'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { object, string, pipe, minLength, number, optional, minValue } from 'valibot';
import type { InferInput } from 'valibot';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';

import { messagingService } from '../../services/messagingService';
import type { MessageRecipient } from '../../types/messaging.types';

const schema = object({
  recipient_id: pipe(number(), minValue(1, 'Destinataire requis')),
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
  const [recipients, setRecipients] = useState<MessageRecipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [search, setSearch] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
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
      setSearch('');
    }
  }, [open, defaultRecipientId, defaultStudentContextId, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    setLoadingRecipients(true);
    const handle = setTimeout(() => {
      messagingService
        .recipients(search.trim() || undefined)
        .then((list) => {
          if (!cancelled) {
            setRecipients(list);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setRecipients([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoadingRecipients(false);
          }
        });
    }, search ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [open, search]);

  const recipientsById = useMemo(() => {
    const map = new Map<number, MessageRecipient>();
    recipients.forEach((r) => map.set(r.id, r));
    return map;
  }, [recipients]);

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
              render={({ field }) => {
                const selected = field.value ? recipientsById.get(Number(field.value)) ?? null : null;

                return (
                  <Autocomplete<MessageRecipient, false, false, false>
                    options={recipients}
                    value={selected}
                    loading={loadingRecipients}
                    onInputChange={(_event, newValue, reason) => {
                      if (reason === 'input') {
                        setSearch(newValue);
                      }
                    }}
                    onChange={(_event, newValue) => {
                      setValue('recipient_id', newValue ? newValue.id : 0, {
                        shouldValidate: true,
                      });
                    }}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => option.full_name || option.username}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Stack direction='row' spacing={1} alignItems='center' width='100%'>
                          <span>{option.full_name || option.username}</span>
                          {option.role && (
                            <Chip label={option.role} size='small' color='primary' variant='outlined' />
                          )}
                        </Stack>
                      </li>
                    )}
                    noOptionsText={search ? 'Aucun destinataire trouvé.' : 'Tapez pour rechercher…'}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Destinataire'
                        size='small'
                        error={!!errors.recipient_id}
                        helperText={
                          errors.recipient_id?.message ?? 'Sélectionnez un enseignant ou un parent'
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingRecipients ? (
                                <CircularProgress color='inherit' size={18} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    fullWidth
                  />
                );
              }}
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
