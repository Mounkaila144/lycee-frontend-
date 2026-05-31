'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

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

const HEURE_COLORS: Record<string, any> = { PREVU: 'default', EFFECTUE: 'info', ABSENT: 'error', ANNULE: 'default', REMPLACE: 'warning', VALIDE: 'success', REJETE: 'error' };

interface Professeur { id: number; nom: string; prenom: string; }
interface Classe { id: number; name: string; }
interface Subject { id: number; name: string; }
interface Heure {
  id: number; professeur_id: number; date_cours: string; nombre_heures: string; statut: string;
  remplace_par_professeur_id: number | null; motif: string | null;
  professeur?: Professeur; classe?: Classe; matiere?: Subject; remplacant?: Professeur;
}

export const TeacherPayrollHeures: React.FC = () => {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [filterProf, setFilterProf] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const [form, setForm] = useState({ professeur_id: '', classe_id: '', matiere_id: '', date_cours: new Date().toISOString().slice(0, 10), nombre_heures: '2', motif: '' });

  const { data: profsResp } = useQuery({ queryKey: ['tp-professeurs-min'], queryFn: async () => (await api().get('/admin/teacher-payroll/professeurs', { params: { per_page: 200 } })).data });
  const professeurs = useMemo(() => toArray<Professeur>(profsResp), [profsResp]);

  const { data: classesResp } = useQuery({ queryKey: ['tp-classes'], queryFn: async () => (await api().get('/admin/classes', { params: { per_page: 200 } })).data });
  const classes = useMemo(() => toArray<Classe>(classesResp), [classesResp]);

  const { data: subjectsResp } = useQuery({ queryKey: ['tp-subjects'], queryFn: async () => (await api().get('/admin/subjects', { params: { per_page: 200 } })).data });
  const subjects = useMemo(() => toArray<Subject>(subjectsResp), [subjectsResp]);

  const { data: heuresResp, isLoading } = useQuery({
    queryKey: ['tp-heures', filterProf, filterStatut],
    queryFn: async () => (await api().get('/admin/teacher-payroll/heures', { params: { professeur_id: filterProf || undefined, statut: filterStatut || undefined } })).data,
  });
  const heures = useMemo(() => toArray<Heure>(heuresResp), [heuresResp]);

  const createMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/teacher-payroll/heures', {
      professeur_id: Number(form.professeur_id),
      classe_id: form.classe_id ? Number(form.classe_id) : null,
      matiere_id: form.matiere_id ? Number(form.matiere_id) : null,
      date_cours: form.date_cours, nombre_heures: Number(form.nombre_heures), statut: 'EFFECTUE', motif: form.motif || null,
    })).data,
    onSuccess: () => { setCreateOpen(false); notify('Heure enregistrée.'); qc.invalidateQueries({ queryKey: ['tp-heures'] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const validateMutation = useMutation({
    mutationFn: async (ids: number[]) => (await api().post('/admin/teacher-payroll/heures/valider', { ids })).data,
    onSuccess: (d: any) => { setSelected([]); notify(d?.message ?? 'Heures validées.'); qc.invalidateQueries({ queryKey: ['tp-heures'] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const rejectMutation = useMutation({
    mutationFn: async (ids: number[]) => (await api().post('/admin/teacher-payroll/heures/rejeter', { ids })).data,
    onSuccess: (d: any) => { setSelected([]); notify(d?.message ?? 'Heures rejetées.'); qc.invalidateQueries({ queryKey: ['tp-heures'] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const toggle = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Heures de cours & validation</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>+ Saisir des heures</Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField select size="small" label="Professeur" value={filterProf} onChange={e => setFilterProf(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Tous</MenuItem>
            {professeurs.map(p => <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Statut" value={filterStatut} onChange={e => setFilterStatut(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">Tous</MenuItem>
            {['PREVU', 'EFFECTUE', 'VALIDE', 'REJETE', 'REMPLACE', 'ABSENT'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" color="success" disabled={selected.length === 0 || validateMutation.isPending} onClick={() => validateMutation.mutate(selected)}>Valider ({selected.length})</Button>
          <Button variant="outlined" color="error" disabled={selected.length === 0 || rejectMutation.isPending} onClick={() => rejectMutation.mutate(selected)}>Rejeter</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Alert severity="info" sx={{ mb: 2 }}>Seules les heures au statut <b>VALIDE</b> sont payées (mode horaire / hybride).</Alert>
          {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {!isLoading && heures.length === 0 && <Alert severity="info">Aucune heure enregistrée.</Alert>}
          {!isLoading && heures.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell padding="checkbox" /><TableCell>Date</TableCell><TableCell>Professeur</TableCell><TableCell>Classe</TableCell>
                  <TableCell>Matière</TableCell><TableCell align="right">Heures</TableCell><TableCell>Statut</TableCell><TableCell>Remplaçant</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {heures.map(h => (
                    <TableRow key={h.id} hover selected={selected.includes(h.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox size="small" checked={selected.includes(h.id)} onChange={() => toggle(h.id)} disabled={h.statut === 'VALIDE'} />
                      </TableCell>
                      <TableCell>{h.date_cours?.slice(0, 10)}</TableCell>
                      <TableCell>{h.professeur ? `${h.professeur.prenom} ${h.professeur.nom}` : `#${h.professeur_id}`}</TableCell>
                      <TableCell>{h.classe?.name ?? '—'}</TableCell>
                      <TableCell>{h.matiere?.name ?? '—'}</TableCell>
                      <TableCell align="right">{Number(h.nombre_heures)}</TableCell>
                      <TableCell><Chip size="small" label={h.statut} color={HEURE_COLORS[h.statut] ?? 'default'} /></TableCell>
                      <TableCell>{h.remplacant ? `${h.remplacant.prenom} ${h.remplacant.nom}` : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Saisir des heures de cours</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Professeur" value={form.professeur_id} onChange={e => setForm(f => ({ ...f, professeur_id: e.target.value }))} fullWidth>
              {professeurs.map(p => <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom}</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Classe" value={form.classe_id} onChange={e => setForm(f => ({ ...f, classe_id: e.target.value }))} fullWidth>
                <MenuItem value="">—</MenuItem>
                {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField select label="Matière" value={form.matiere_id} onChange={e => setForm(f => ({ ...f, matiere_id: e.target.value }))} fullWidth>
                <MenuItem value="">—</MenuItem>
                {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Date" type="date" value={form.date_cours} onChange={e => setForm(f => ({ ...f, date_cours: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="Nombre d'heures" type="number" value={form.nombre_heures} onChange={e => setForm(f => ({ ...f, nombre_heures: e.target.value }))} fullWidth />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!form.professeur_id || !form.nombre_heures || createMutation.isPending} onClick={() => createMutation.mutate()}>{createMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

function firstError(e: any): string {
  const errs = e?.response?.data?.errors;
  if (errs) return Object.values(errs).flat()[0] as string;
  return e?.response?.data?.message ?? 'Une erreur est survenue.';
}

export default TeacherPayrollHeures;
