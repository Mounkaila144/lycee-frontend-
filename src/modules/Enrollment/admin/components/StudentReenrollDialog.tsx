'use client';

import React, { useEffect, useMemo, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { createApiClient } from '@/shared/lib/api-client';

const api = () => createApiClient();

function toArray<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp as T[];
  const r = resp as { data?: unknown };
  if (r && Array.isArray(r.data)) return r.data as T[];
  const nested = (r?.data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as T[];
  return [];
}

interface Props {
  open: boolean;
  onClose: () => void;
  student: { id: number; firstname?: string; lastname?: string; matricule?: string } | null;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const StudentReenrollDialog: React.FC<Props> = ({ open, onClose, student, onSuccess, onError }) => {
  const [years, setYears] = useState<{ id: number; name: string }[]>([]);
  const [yearId, setYearId] = useState('');
  const [action, setAction] = useState<'promote' | 'repeat'>('promote');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setYearId('');
    setAction('promote');
    api().get('/admin/academic-years').then(res => setYears(toArray(res.data))).catch(() => setYears([]));
  }, [open]);

  const name = useMemo(
    () => (student ? `${student.lastname ?? ''} ${student.firstname ?? ''}`.trim() : ''),
    [student],
  );

  const handleSubmit = async () => {
    if (!student || !yearId) return;
    setSubmitting(true);
    try {
      const res = await api().post('/admin/enrollment/reenrollment/student', {
        student_id: student.id,
        target_academic_year_id: Number(yearId),
        action,
      });
      onSuccess?.(res.data?.message ?? 'Réinscription effectuée.');
      onClose();
    } catch (e: any) {
      onError?.(e?.response?.data?.message ?? 'Échec de la réinscription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Réinscrire l'élève</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {student && (
            <Typography variant="body2" color="text.secondary">
              {name} {student.matricule ? `· ${student.matricule}` : ''}
            </Typography>
          )}
          <FormControl fullWidth>
            <InputLabel>Année cible</InputLabel>
            <Select label="Année cible" value={yearId} onChange={e => setYearId(String(e.target.value))}>
              {years.map(y => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Décision</InputLabel>
            <Select label="Décision" value={action} onChange={e => setAction(e.target.value as 'promote' | 'repeat')}>
              <MenuItem value="promote">Promu (classe supérieure)</MenuItem>
              <MenuItem value="repeat">Redouble (même niveau)</MenuItem>
            </Select>
          </FormControl>
          <Alert severity="info">
            La classe cible est déterminée automatiquement (même série/section). Elle est créée si elle n'existe pas encore.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" disabled={!yearId || submitting} onClick={handleSubmit}>
          {submitting ? 'Réinscription…' : 'Réinscrire'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
