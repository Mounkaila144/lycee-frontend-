'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { object, string, pipe, minLength, optional, picklist } from 'valibot';
import type { InferInput } from 'valibot';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

import { settingsService } from '../../services/settingsService';
import type { TenantSetting } from '../../types/settings.types';

const schema = object({
  key: pipe(string(), minLength(1, 'Clé requise')),
  value: optional(string()),
  type: picklist(['string', 'integer', 'boolean', 'json', 'file']),
  category: optional(string()),
  description: optional(string()),
});

type FormData = InferInput<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  setting?: TenantSetting | null;
}

export function SettingFormDialog({ open, onClose, onSaved, setting }: Props) {
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
      key: '',
      value: '',
      type: 'string',
      category: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        key: setting?.key ?? '',
        value: setting?.value ?? '',
        type: (setting?.type as any) ?? 'string',
        category: setting?.category ?? '',
        description: setting?.description ?? '',
      });
      setError(null);
    }
  }, [open, setting, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await settingsService.upsert({
        key: data.key,
        value: data.value ?? null,
        type: data.type,
        category: data.category,
        description: data.description,
      });
      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur d’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{setting ? 'Modifier le réglage' : 'Nouveau réglage'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            {error && <Alert severity='error'>{error}</Alert>}
            <Controller
              name='key'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Clé (ex: school.name)'
                  size='small'
                  disabled={!!setting}
                  error={!!errors.key}
                  helperText={errors.key?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name='type'
              control={control}
              render={({ field }) => (
                <TextField {...field} select label='Type' size='small' fullWidth>
                  <MenuItem value='string'>String</MenuItem>
                  <MenuItem value='integer'>Integer</MenuItem>
                  <MenuItem value='boolean'>Boolean</MenuItem>
                  <MenuItem value='json'>JSON</MenuItem>
                  <MenuItem value='file'>File</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name='value'
              control={control}
              render={({ field }) => (
                <TextField {...field} label='Valeur' size='small' fullWidth multiline rows={2} />
              )}
            />
            <Controller
              name='category'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Catégorie'
                  size='small'
                  placeholder='general, finance, notes, ...'
                  fullWidth
                />
              )}
            />
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <TextField {...field} label='Description' size='small' fullWidth />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button type='submit' variant='contained' disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
