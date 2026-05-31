'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
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

interface Option { id: number; name: string }
interface PreviewStudent { student_id: number; matricule: string; name: string; status: string; already_reenrolled: boolean }
interface PreviewData {
  source_class: { id: number; name: string; level: string | null };
  next_level: { id: number; name: string } | null;
  is_terminal: boolean;
  suggested_target_class: { id: number; name: string } | null;
  students: PreviewStudent[];
}
type Action = 'promote' | 'repeat' | 'exclude' | 'graduate';

export const ClassReenrollment: React.FC = () => {
  const [sourceClassId, setSourceClassId] = useState('');
  const [targetYearId, setTargetYearId] = useState('');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [decisions, setDecisions] = useState<Record<number, Action>>({});
  const [rosterYearId, setRosterYearId] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const { data: classesResp } = useQuery({ queryKey: ['classes'], queryFn: async () => (await api().get('/admin/classes', { params: { per_page: 200 } })).data });
  const { data: yearsResp } = useQuery({ queryKey: ['academic-years'], queryFn: async () => (await api().get('/admin/academic-years')).data });
  const classes = useMemo(() => toArray<Option>(classesResp), [classesResp]);
  const years = useMemo(() => toArray<Option>(yearsResp), [yearsResp]);

  const previewMutation = useMutation({
    mutationFn: async () => (await api().get('/admin/enrollment/reenrollment/preview', {
      params: { class_id: sourceClassId, target_academic_year_id: targetYearId },
    })).data,
    onSuccess: (res: any) => {
      const data: PreviewData = res.data;
      setPreview(data);
      const init: Record<number, Action> = {};
      data.students.forEach(s => {
        init[s.student_id] = s.already_reenrolled ? 'exclude' : (data.is_terminal ? 'graduate' : 'promote');
      });
      setDecisions(init);
    },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la prévisualisation.', 'error'),
  });

  const processMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        source_class_id: Number(sourceClassId),
        target_academic_year_id: Number(targetYearId),
        decisions: (preview?.students ?? []).map(s => ({ student_id: s.student_id, action: decisions[s.student_id] ?? 'exclude' })),
      };
      return (await api().post('/admin/enrollment/reenrollment/process', payload)).data;
    },
    onSuccess: (res: any) => {
      const r = res.data ?? {};
      notify(`Réinscription effectuée — promus: ${r.promoted ?? 0}, redoublants: ${r.repeated ?? 0}, diplômés: ${r.graduated ?? 0}, exclus: ${r.excluded ?? 0}.`);
      setPreview(null);
      setDecisions({});
    },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la réinscription.', 'error'),
  });

  const { data: rosterResp, isFetching: rosterLoading, refetch: refetchRoster } = useQuery({
    queryKey: ['reenrollment-roster', rosterYearId],
    queryFn: async () => (await api().get('/admin/enrollment/reenrollment/roster', { params: { academic_year_id: rosterYearId } })).data,
    enabled: !!rosterYearId,
  });
  const roster = useMemo(() => toArray<any>(rosterResp), [rosterResp]);

  const backfillMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/enrollment/reenrollment/backfill', { academic_year_id: Number(rosterYearId) })).data,
    onSuccess: (res: any) => { notify(res?.message ?? 'Historique initialisé.'); refetchRoster(); },
    onError: (e: any) => notify(e?.response?.data?.message ?? "Échec de l'initialisation.", 'error'),
  });

  const actionsFor = (terminal: boolean): { value: Action; label: string }[] => terminal
    ? [{ value: 'graduate', label: 'Diplômer' }, { value: 'repeat', label: 'Redouble' }, { value: 'exclude', label: 'Exclure' }]
    : [{ value: 'promote', label: 'Promu (classe sup.)' }, { value: 'repeat', label: 'Redouble' }, { value: 'exclude', label: 'Exclure' }];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Réinscription / Passage de classe</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Faites passer une classe entière au niveau supérieur pour la nouvelle année, sans ressaisir les élèves.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardHeader title="1. Choisir la classe et l'année cible" />
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Classe d'origine</InputLabel>
                <Select label="Classe d'origine" value={sourceClassId} onChange={e => { setSourceClassId(String(e.target.value)); setPreview(null); }}>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Année cible</InputLabel>
                <Select label="Année cible" value={targetYearId} onChange={e => { setTargetYearId(String(e.target.value)); setPreview(null); }}>
                  {years.map(y => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button fullWidth variant="contained" disabled={!sourceClassId || !targetYearId || previewMutation.isPending} onClick={() => previewMutation.mutate()}>
                {previewMutation.isPending ? 'Chargement…' : 'Prévisualiser'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {preview && (
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="2. Vérifier et valider"
            subheader={preview.is_terminal
              ? `${preview.source_class.name} → niveau terminal (les élèves seront diplômés)`
              : `${preview.source_class.name} → ${preview.next_level?.name ?? '—'} (${preview.suggested_target_class ? 'classe : ' + preview.suggested_target_class.name : 'la classe cible sera créée'})`}
          />
          <CardContent>
            {preview.students.length === 0 ? <Alert severity="warning">Aucun élève dans cette classe.</Alert> : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Matricule</TableCell>
                        <TableCell>Élève</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Décision</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {preview.students.map(s => (
                        <TableRow key={s.student_id} hover>
                          <TableCell>{s.matricule}</TableCell>
                          <TableCell>
                            {s.name}
                            {s.already_reenrolled && <Chip size="small" color="warning" label="Déjà réinscrit" sx={{ ml: 1 }} />}
                          </TableCell>
                          <TableCell>{s.status}</TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              value={decisions[s.student_id] ?? 'exclude'}
                              onChange={e => setDecisions(d => ({ ...d, [s.student_id]: e.target.value as Action }))}
                              sx={{ minWidth: 180 }}
                            >
                              {actionsFor(preview.is_terminal).map(a => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="contained" color="success" disabled={processMutation.isPending} onClick={() => processMutation.mutate()}>
                    {processMutation.isPending ? 'Traitement…' : 'Valider la réinscription'}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Effectif par année (historique)"
          action={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Année</InputLabel>
                <Select label="Année" value={rosterYearId} onChange={e => setRosterYearId(String(e.target.value))}>
                  {years.map(y => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="outlined" disabled={!rosterYearId || backfillMutation.isPending} onClick={() => backfillMutation.mutate()}>
                Initialiser l'historique
              </Button>
            </Box>
          }
        />
        <CardContent>
          {!rosterYearId && <Alert severity="info">Sélectionnez une année pour voir l'effectif inscrit.</Alert>}
          {rosterYearId && rosterLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
          {rosterYearId && !rosterLoading && roster.length === 0 && (
            <Alert severity="info">Aucune inscription pour cette année. Utilisez « Initialiser l'historique » pour l'année courante.</Alert>
          )}
          {rosterYearId && !rosterLoading && roster.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Élève</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roster.map(r => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.student?.matricule ?? '—'}</TableCell>
                      <TableCell>{r.student?.name ?? '—'}</TableCell>
                      <TableCell>{r.class ?? '—'}</TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" label={
                          r.enrollment_type === 'promotion' ? 'Promotion' : r.enrollment_type === 'repeat' ? 'Redoublement' : 'Initiale'
                        } />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
