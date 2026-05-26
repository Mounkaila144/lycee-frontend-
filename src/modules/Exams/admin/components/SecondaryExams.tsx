'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Button2 from '@mui/material/Button';

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

const STATUS_COLORS: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  draft: 'default', planned: 'info', ongoing: 'warning', completed: 'success', cancelled: 'error',
};
const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon', planned: 'Planifié', ongoing: 'En cours', completed: 'Terminé', cancelled: 'Annulé',
};

interface ExamRow {
  id: number;
  title: string;
  type: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room_name: string | null;
  status: string;
  classe?: { id: number; name: string } | null;
  subject?: { id: number; name: string; code?: string } | null;
}

export const SecondaryExams: React.FC = () => {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const [form, setForm] = useState({ class_id: '', subject_id: '', title: '', type: 'normal', exam_date: new Date().toISOString().slice(0, 10), start_time: '08:00', end_time: '10:00', room_name: '' });

  const { data: classesResp } = useQuery({ queryKey: ['classes'], queryFn: async () => (await api().get('/admin/classes')).data });
  const { data: subjectsResp } = useQuery({ queryKey: ['subjects'], queryFn: async () => (await api().get('/admin/subjects')).data });
  const classes = useMemo(() => toArray<{ id: number; name: string }>(classesResp), [classesResp]);
  const subjects = useMemo(() => toArray<{ id: number; name: string; code?: string }>(subjectsResp), [subjectsResp]);

  const { data: examsResp, isLoading } = useQuery({
    queryKey: ['exam-sessions'],
    queryFn: async () => (await api().get('/admin/exams/sessions')).data,
  });
  const exams = useMemo(() => toArray<ExamRow>(examsResp), [examsResp]);

  const createMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/exams/sessions', {
      class_id: Number(form.class_id), subject_id: Number(form.subject_id), title: form.title,
      type: form.type, exam_date: form.exam_date, start_time: form.start_time, end_time: form.end_time,
      room_name: form.room_name || null,
    })).data,
    onSuccess: () => { setCreateOpen(false); setForm(f => ({ ...f, title: '' })); notify('Examen planifié.'); qc.invalidateQueries({ queryKey: ['exam-sessions'] }); },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la planification.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await api().delete(`/admin/exams/sessions/${id}`)).data,
    onSuccess: () => { notify('Examen supprimé.'); qc.invalidateQueries({ queryKey: ['exam-sessions'] }); },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la suppression.', 'error'),
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Planification des Examens</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>+ Nouvel examen</Button>
      </Box>

      <Card>
        <CardContent>
          {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {!isLoading && exams.length === 0 && <Alert severity="info">Aucun examen planifié. Cliquez sur « Nouvel examen ».</Alert>}
          {!isLoading && exams.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Horaire</TableCell>
                    <TableCell>Intitulé</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell>Matière</TableCell>
                    <TableCell>Salle</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map(ex => (
                    <TableRow key={ex.id} hover>
                      <TableCell>{new Date(ex.exam_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{String(ex.start_time).slice(0, 5)}–{String(ex.end_time).slice(0, 5)}</TableCell>
                      <TableCell><Typography fontWeight="medium">{ex.title}</Typography></TableCell>
                      <TableCell>{ex.classe?.name ?? '—'}</TableCell>
                      <TableCell>{ex.subject?.name ?? '—'}</TableCell>
                      <TableCell>{ex.room_name ?? '—'}</TableCell>
                      <TableCell><Chip size="small" label={STATUS_LABELS[ex.status] ?? ex.status} color={STATUS_COLORS[ex.status] ?? 'default'} /></TableCell>
                      <TableCell align="center">
                        <Button2 size="small" color="error" onClick={() => deleteMutation.mutate(ex.id)}>Supprimer</Button2>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvel examen</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Intitulé" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Classe</InputLabel>
              <Select label="Classe" value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: String(e.target.value) }))}>
                {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Matière</InputLabel>
              <Select label="Matière" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: String(e.target.value) }))}>
                {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.code ? `${s.code} — ${s.name}` : s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: String(e.target.value) }))}>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="rattrapage">Rattrapage</MenuItem>
                <MenuItem value="special">Spécial</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Date" type="date" value={form.exam_date} onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Début" type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="Fin" type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            </Box>
            <TextField label="Salle (optionnel)" value={form.room_name} onChange={e => setForm(f => ({ ...f, room_name: e.target.value }))} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!form.title || !form.class_id || !form.subject_id || createMutation.isPending} onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? 'Planification…' : 'Planifier'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
