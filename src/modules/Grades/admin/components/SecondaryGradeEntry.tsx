'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
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
import Divider from '@mui/material/Divider';

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

interface Option { id: number; name: string; code?: string }
interface EvaluationRow {
  id: number;
  type: string;
  name: string;
  evaluation_date: string;
  max_score: string | number;
  coefficient: string | number;
  grades_count: number;
  status: string;
}
interface SheetRow {
  student_id: number;
  matricule: string;
  firstname: string;
  lastname: string;
  score: number | null;
  is_absent: boolean;
  comment: string | null;
}

const TYPE_LABELS: Record<string, string> = { Devoir: 'Devoir', Composition: 'Composition', Interrogation: 'Interrogation' };

export const SecondaryGradeEntry: React.FC = () => {
  const qc = useQueryClient();
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [selectedEval, setSelectedEval] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const [createForm, setCreateForm] = useState({ type: 'Devoir', name: '', evaluation_date: new Date().toISOString().slice(0, 10), max_score: '20', coefficient: '1' });
  // local editable grades keyed by student_id
  const [edits, setEdits] = useState<Record<number, { score: string; is_absent: boolean }>>({});

  const { data: classesResp } = useQuery({ queryKey: ['classes'], queryFn: async () => (await api().get('/admin/classes')).data });
  const { data: subjectsResp } = useQuery({ queryKey: ['subjects'], queryFn: async () => (await api().get('/admin/subjects')).data });
  const { data: semestersResp } = useQuery({ queryKey: ['semesters'], queryFn: async () => (await api().get('/admin/semesters')).data });
  const classes = useMemo(() => toArray<Option>(classesResp), [classesResp]);
  const subjects = useMemo(() => toArray<Option>(subjectsResp), [subjectsResp]);
  const semesters = useMemo(() => toArray<Option>(semestersResp), [semestersResp]);

  const canQuery = !!classId && !!subjectId;
  const { data: evalsResp, isLoading: evalsLoading } = useQuery({
    queryKey: ['evaluations', classId, subjectId, semesterId],
    queryFn: async () => (await api().get('/admin/evaluations', { params: { class_id: classId, subject_id: subjectId, semester_id: semesterId || undefined } })).data,
    enabled: canQuery,
  });
  const evaluations = useMemo(() => toArray<EvaluationRow>(evalsResp), [evalsResp]);

  const { data: sheetResp, isLoading: sheetLoading } = useQuery({
    queryKey: ['grade-sheet', selectedEval],
    queryFn: async () => (await api().get(`/admin/evaluations/${selectedEval}/grades`)).data,
    enabled: !!selectedEval,
  });
  const sheet = (sheetResp as any)?.data;
  const sheetRows: SheetRow[] = sheet?.rows ?? [];
  const sheetEval = sheet?.evaluation;
  const sheetStats = sheet?.stats;

  // init local edits when sheet loads
  useEffect(() => {
    if (sheetRows.length) {
      const init: Record<number, { score: string; is_absent: boolean }> = {};
      sheetRows.forEach(r => { init[r.student_id] = { score: r.score != null ? String(r.score) : '', is_absent: r.is_absent }; });
      setEdits(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetResp]);

  const maxScore = Number(sheetEval?.max_score ?? 20);

  const createMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/evaluations', {
      class_id: Number(classId), subject_id: Number(subjectId), semester_id: semesterId ? Number(semesterId) : null,
      type: createForm.type, name: createForm.name, evaluation_date: createForm.evaluation_date,
      max_score: Number(createForm.max_score), coefficient: Number(createForm.coefficient),
    })).data,
    onSuccess: (res: any) => {
      setCreateOpen(false);
      setCreateForm(f => ({ ...f, name: '' }));
      notify('Évaluation créée.');
      qc.invalidateQueries({ queryKey: ['evaluations'] });
      if (res?.data?.id) setSelectedEval(res.data.id);
    },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la création.', 'error'),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const grades = sheetRows.map(r => {
        const edit = edits[r.student_id] ?? { score: '', is_absent: false };
        return { student_id: r.student_id, is_absent: edit.is_absent, score: edit.is_absent || edit.score === '' ? null : Number(edit.score) };
      });
      return (await api().post(`/admin/evaluations/${selectedEval}/grades`, { grades })).data;
    },
    onSuccess: () => {
      notify('Notes enregistrées avec succès.');
      qc.invalidateQueries({ queryKey: ['grade-sheet', selectedEval] });
      qc.invalidateQueries({ queryKey: ['evaluations'] });
    },
    onError: (e: any) => notify(e?.response?.data?.message ?? "Échec de l'enregistrement.", 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await api().delete(`/admin/evaluations/${id}`)).data,
    onSuccess: () => { notify('Évaluation supprimée.'); setSelectedEval(null); qc.invalidateQueries({ queryKey: ['evaluations'] }); },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la suppression.', 'error'),
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Saisie des Notes</Typography>

      {/* Selectors */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Classe</InputLabel>
                <Select label="Classe" value={classId} onChange={e => { setClassId(String(e.target.value)); setSelectedEval(null); }}>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Matière</InputLabel>
                <Select label="Matière" value={subjectId} onChange={e => { setSubjectId(String(e.target.value)); setSelectedEval(null); }}>
                  {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.code ? `${s.code} — ${s.name}` : s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Période</InputLabel>
                <Select label="Période" value={semesterId} onChange={e => { setSemesterId(String(e.target.value)); setSelectedEval(null); }}>
                  <MenuItem value="">Toutes</MenuItem>
                  {semesters.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {!canQuery && <Alert severity="info">Sélectionnez une classe et une matière pour voir les évaluations.</Alert>}

      {canQuery && (
        <Grid container spacing={3}>
          {/* Evaluations list */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader
                title="Évaluations"
                action={<Button size="small" variant="contained" onClick={() => setCreateOpen(true)}>+ Nouvelle</Button>}
              />
              <CardContent>
                {evalsLoading && <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>}
                {!evalsLoading && evaluations.length === 0 && <Alert severity="info">Aucune évaluation. Créez-en une.</Alert>}
                {evaluations.map(ev => (
                  <Box
                    key={ev.id}
                    onClick={() => setSelectedEval(ev.id)}
                    sx={{ p: 1.5, mb: 1, borderRadius: 1, cursor: 'pointer', border: '1px solid', borderColor: selectedEval === ev.id ? 'primary.main' : 'divider', bgcolor: selectedEval === ev.id ? 'action.selected' : 'transparent' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography fontWeight="medium">{ev.name}</Typography>
                      <Chip size="small" label={TYPE_LABELS[ev.type] ?? ev.type} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ev.evaluation_date).toLocaleDateString('fr-FR')} · /{Number(ev.max_score)} · coef {Number(ev.coefficient)} · {ev.grades_count} note(s)
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Grade sheet */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              {!selectedEval && <CardContent><Alert severity="info">Sélectionnez une évaluation pour saisir les notes.</Alert></CardContent>}
              {selectedEval && (
                <>
                  <CardHeader
                    title={sheetEval ? `${sheetEval.name}` : 'Feuille de notes'}
                    subheader={sheetEval ? `${sheetEval.classe?.name ?? ''} · ${sheetEval.subject?.name ?? ''} · /${Number(sheetEval.max_score)}` : ''}
                    action={
                      <Button size="small" color="error" onClick={() => { if (selectedEval) deleteMutation.mutate(selectedEval); }}>
                        Supprimer
                      </Button>
                    }
                  />
                  <CardContent>
                    {sheetLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
                    {!sheetLoading && sheetRows.length === 0 && <Alert severity="warning">Aucun élève dans cette classe.</Alert>}
                    {!sheetLoading && sheetRows.length > 0 && (
                      <>
                        {sheetStats && (
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip label={`Moyenne: ${sheetStats.average ?? '—'}`} color="primary" />
                            <Chip label={`Min: ${sheetStats.min ?? '—'}`} />
                            <Chip label={`Max: ${sheetStats.max ?? '—'}`} />
                            <Chip label={`Noté: ${sheetStats.graded}/${sheetStats.count}`} />
                          </Box>
                        )}
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Matricule</TableCell>
                                <TableCell>Nom &amp; Prénom</TableCell>
                                <TableCell align="center">Note /{maxScore}</TableCell>
                                <TableCell align="center">Absent</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sheetRows.map(r => {
                                const edit = edits[r.student_id] ?? { score: '', is_absent: false };
                                return (
                                  <TableRow key={r.student_id} hover>
                                    <TableCell><Typography variant="body2" fontFamily="monospace">{r.matricule}</Typography></TableCell>
                                    <TableCell>{r.lastname} {r.firstname}</TableCell>
                                    <TableCell align="center">
                                      <TextField
                                        type="number"
                                        size="small"
                                        value={edit.score}
                                        disabled={edit.is_absent}
                                        onChange={e => setEdits(prev => ({ ...prev, [r.student_id]: { ...edit, score: e.target.value } }))}
                                        slotProps={{ htmlInput: { min: 0, max: maxScore, step: 0.25, style: { width: 80, textAlign: 'center' } } }}
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <Checkbox
                                        checked={edit.is_absent}
                                        onChange={e => setEdits(prev => ({ ...prev, [r.student_id]: { ...edit, is_absent: e.target.checked } }))}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer les notes'}
                          </Button>
                        </Box>
                      </>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Create evaluation dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Évaluation</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={createForm.type} onChange={e => setCreateForm(f => ({ ...f, type: String(e.target.value) }))}>
                <MenuItem value="Devoir">Devoir</MenuItem>
                <MenuItem value="Composition">Composition</MenuItem>
                <MenuItem value="Interrogation">Interrogation</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Intitulé" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} fullWidth />
            <TextField label="Date" type="date" value={createForm.evaluation_date} onChange={e => setCreateForm(f => ({ ...f, evaluation_date: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Note max" type="number" value={createForm.max_score} onChange={e => setCreateForm(f => ({ ...f, max_score: e.target.value }))} fullWidth />
              <TextField label="Coefficient" type="number" value={createForm.coefficient} onChange={e => setCreateForm(f => ({ ...f, coefficient: e.target.value }))} fullWidth />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!createForm.name || createMutation.isPending} onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
