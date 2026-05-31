'use client';

import React, { useMemo, useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
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

interface Option { id: number; name: string; code?: string }
interface Line { fee_type_id: number | null; label: string; amount: string }

const money = (v: number): string => `${Number(v || 0).toLocaleString('fr-FR')} FCFA`;

export const ClassFeesDashboard: React.FC = () => {
  const qc = useQueryClient();
  const [classId, setClassId] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const { data: classesResp } = useQuery({ queryKey: ['classes'], queryFn: async () => (await api().get('/admin/classes', { params: { per_page: 200 } })).data });
  const classes = useMemo(() => toArray<Option>(classesResp), [classesResp]);

  const { data: feeTypesResp } = useQuery({ queryKey: ['fee-types'], queryFn: async () => (await api().get('/admin/finance/fee-types')).data });
  const feeTypes = useMemo(() => toArray<Option>(feeTypesResp), [feeTypesResp]);

  const { data: lineResp, isFetching } = useQuery({
    queryKey: ['class-fees', classId],
    queryFn: async () => (await api().get('/admin/finance/class-fees', { params: { class_id: classId } })).data,
    enabled: !!classId,
  });

  useEffect(() => {
    if (!lineResp) return;
    const existing = (lineResp.data?.lines ?? []) as { fee_type_id: number | null; label: string | null; amount: number }[];
    setLines(existing.length
      ? existing.map(l => ({ fee_type_id: l.fee_type_id, label: l.label ?? '', amount: String(l.amount) }))
      : [{ fee_type_id: null, label: 'Scolarité + Inscription', amount: '' }]);
  }, [lineResp]);

  const total = lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  const setLine = (i: number, patch: Partial<Line>) => setLines(ls => ls.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  const addLine = () => setLines(ls => [...ls, { fee_type_id: null, label: '', amount: '' }]);
  const removeLine = (i: number) => setLines(ls => ls.filter((_, idx) => idx !== i));

  const saveMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/finance/class-fees/sync', {
      class_id: Number(classId),
      lines: lines
        .filter(l => l.amount !== '' && Number(l.amount) >= 0)
        .map(l => ({ fee_type_id: l.fee_type_id, label: l.label || null, amount: Number(l.amount) })),
    })).data,
    onSuccess: () => { notify('Barème enregistré.'); qc.invalidateQueries({ queryKey: ['class-fees', classId] }); },
    onError: (e: any) => notify(e?.response?.data?.message ?? "Échec de l'enregistrement.", 'error'),
  });

  const applyMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/finance/class-fees/apply-to-level', { class_id: Number(classId) })).data,
    onSuccess: (res: any) => notify(res?.message ?? 'Barème appliqué au niveau.'),
    onError: (e: any) => notify(e?.response?.data?.message ?? "Échec.", 'error'),
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Frais par classe</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Définissez les frais obligatoires (scolarité + inscription) de chaque classe. À l'inscription d'un élève dans la classe, sa facture est générée automatiquement à partir de ce barème.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth size="small" sx={{ maxWidth: 360 }}>
            <InputLabel>Classe</InputLabel>
            <Select label="Classe" value={classId} onChange={e => setClassId(String(e.target.value))}>
              {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {!classId && <Alert severity="info">Sélectionnez une classe pour configurer ses frais.</Alert>}
      {classId && isFetching && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}

      {classId && !isFetching && (
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Libellé</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>Type de frais (optionnel)</TableCell>
                    <TableCell align="right" sx={{ minWidth: 160 }}>Montant (FCFA)</TableCell>
                    <TableCell align="center" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <TextField size="small" fullWidth placeholder="Scolarité + Inscription"
                          value={l.label} onChange={e => setLine(i, { label: e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select displayEmpty value={l.fee_type_id ?? ''}
                            onChange={e => setLine(i, { fee_type_id: e.target.value === '' ? null : Number(e.target.value) })}>
                            <MenuItem value="">— Aucun —</MenuItem>
                            {feeTypes.map(ft => <MenuItem key={ft.id} value={ft.id}>{ft.code ? `${ft.code} — ${ft.name}` : ft.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right">
                        <TextField size="small" type="number" value={l.amount}
                          onChange={e => setLine(i, { amount: e.target.value })}
                          slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right' } } }} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => removeLine(i)} disabled={lines.length <= 1}>
                          <i className="ri-delete-bin-line" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Button size="small" startIcon={<i className="ri-add-line" />} onClick={addLine}>Ajouter une ligne</Button>
                    </TableCell>
                    <TableCell align="right"><Typography fontWeight="bold">{money(total)}</Typography></TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button variant="outlined" disabled={applyMutation.isPending} onClick={() => applyMutation.mutate()}>
                Appliquer à tout le niveau
              </Button>
              <Button variant="contained" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer le barème'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
