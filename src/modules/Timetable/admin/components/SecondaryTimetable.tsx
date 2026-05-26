'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Chip from '@mui/material/Chip';

import { createApiClient } from '@/shared/lib/api-client';

const api = () => createApiClient();
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function toArray<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp as T[];
  const r = resp as { data?: unknown };
  if (r && Array.isArray(r.data)) return r.data as T[];
  const nested = (r?.data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as T[];
  return [];
}

interface Slot {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_name: string | null;
  subject?: { id: number; name: string; code?: string } | null;
  teacher?: { id: number; name: string } | null;
}

export const SecondaryTimetable: React.FC = () => {
  const qc = useQueryClient();
  const [classId, setClassId] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const [form, setForm] = useState({ subject_id: '', teacher_id: '', day_of_week: 'Lundi', start_time: '08:00', end_time: '09:00', room_name: '' });

  const { data: classesResp } = useQuery({ queryKey: ['classes'], queryFn: async () => (await api().get('/admin/classes')).data });
  const { data: subjectsResp } = useQuery({ queryKey: ['subjects'], queryFn: async () => (await api().get('/admin/subjects')).data });
  const { data: teachersResp } = useQuery({ queryKey: ['teachers'], queryFn: async () => (await api().get('/admin/teachers')).data });
  const classes = useMemo(() => toArray<{ id: number; name: string }>(classesResp), [classesResp]);
  const subjects = useMemo(() => toArray<{ id: number; name: string; code?: string }>(subjectsResp), [subjectsResp]);
  const teachers = useMemo(() => toArray<any>(teachersResp).map(t => ({ id: t.id, name: t.full_name || `${t.firstname ?? ''} ${t.lastname ?? ''}`.trim() || t.username })), [teachersResp]);

  const { data: slotsResp, isLoading } = useQuery({
    queryKey: ['class-slots', classId],
    queryFn: async () => (await api().get('/admin/timetable/class-slots', { params: { class_id: classId } })).data,
    enabled: !!classId,
  });
  const slots = useMemo(() => toArray<Slot>(slotsResp), [slotsResp]);
  const slotsByDay = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    DAYS.forEach(d => { map[d] = []; });
    slots.forEach(s => { (map[s.day_of_week] ??= []).push(s); });
    Object.values(map).forEach(arr => arr.sort((a, b) => a.start_time.localeCompare(b.start_time)));
    return map;
  }, [slots]);

  const createMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/timetable/class-slots', {
      class_id: Number(classId), subject_id: Number(form.subject_id),
      teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
      day_of_week: form.day_of_week, start_time: form.start_time, end_time: form.end_time,
      room_name: form.room_name || null,
    })).data,
    onSuccess: () => { setCreateOpen(false); notify('Créneau ajouté.'); qc.invalidateQueries({ queryKey: ['class-slots', classId] }); },
    onError: (e: any) => notify(e?.response?.data?.message ?? "Échec de l'ajout.", 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await api().delete(`/admin/timetable/class-slots/${id}`)).data,
    onSuccess: () => { notify('Créneau supprimé.'); qc.invalidateQueries({ queryKey: ['class-slots', classId] }); },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la suppression.', 'error'),
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">Emploi du Temps</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Classe</InputLabel>
            <Select label="Classe" value={classId} onChange={e => setClassId(String(e.target.value))}>
              {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" disabled={!classId} onClick={() => setCreateOpen(true)}>+ Nouveau créneau</Button>
        </Box>
      </Box>

      {!classId && <Alert severity="info">Sélectionnez une classe pour afficher son emploi du temps.</Alert>}

      {classId && (
        <>
          {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {!isLoading && (
            <Grid container spacing={2}>
              {DAYS.map(day => (
                <Grid key={day} size={{ xs: 12, sm: 6, md: 2 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="bold" align="center" sx={{ mb: 1 }}>{day}</Typography>
                      {slotsByDay[day].length === 0 && (
                        <Typography variant="caption" color="text.secondary" align="center" display="block">—</Typography>
                      )}
                      {slotsByDay[day].map(s => (
                        <Box key={s.id} sx={{ p: 1, mb: 1, borderRadius: 1, bgcolor: 'action.hover', position: 'relative' }}>
                          <Typography variant="caption" color="primary" fontWeight="bold">{s.start_time}–{s.end_time}</Typography>
                          <Typography variant="body2" fontWeight="medium">{s.subject?.name ?? '—'}</Typography>
                          {s.teacher?.name && <Typography variant="caption" display="block" color="text.secondary">{s.teacher.name}</Typography>}
                          {s.room_name && <Chip size="small" label={s.room_name} sx={{ mt: 0.5, height: 18, fontSize: 10 }} />}
                          <IconButton size="small" onClick={() => deleteMutation.mutate(s.id)} sx={{ position: 'absolute', top: 2, right: 2, p: 0.25 }}>
                            <span style={{ fontSize: 14 }}>✕</span>
                          </IconButton>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau créneau</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Matière</InputLabel>
              <Select label="Matière" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: String(e.target.value) }))}>
                {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.code ? `${s.code} — ${s.name}` : s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Enseignant</InputLabel>
              <Select label="Enseignant" value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: String(e.target.value) }))}>
                <MenuItem value="">—</MenuItem>
                {teachers.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Jour</InputLabel>
              <Select label="Jour" value={form.day_of_week} onChange={e => setForm(f => ({ ...f, day_of_week: String(e.target.value) }))}>
                {DAYS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Début" type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="Fin" type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            </Box>
            <TextField label="Salle (optionnel)" value={form.room_name} onChange={e => setForm(f => ({ ...f, room_name: e.target.value }))} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!form.subject_id || createMutation.isPending} onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? 'Ajout…' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
