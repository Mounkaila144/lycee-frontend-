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
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
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

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'tuition', label: 'Scolarité' },
  { value: 'registration', label: 'Inscription' },
  { value: 'exam', label: 'Examen' },
  { value: 'library', label: 'Bibliothèque' },
  { value: 'lab', label: 'Laboratoire' },
  { value: 'sports', label: 'Sport' },
  { value: 'insurance', label: 'Assurance' },
  { value: 'card', label: 'Carte' },
  { value: 'other', label: 'Autre' },
];
const categoryLabel = (v: string): string => CATEGORIES.find(c => c.value === v)?.label ?? v;
const fmtAmount = (v: number | string | null): string =>
  v == null ? '—' : `${Number(v).toLocaleString('fr-FR')} FCFA`;

interface FeeType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  default_amount: number | string;
  category: string;
  is_mandatory: boolean;
  academic_year_id: number | null;
}

interface FormState {
  code: string;
  name: string;
  description: string;
  default_amount: string;
  category: string;
  is_mandatory: boolean;
}

const EMPTY_FORM: FormState = {
  code: '',
  name: '',
  description: '',
  default_amount: '',
  category: 'tuition',
  is_mandatory: true,
};

export const FeeTypesDashboard: React.FC = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FeeType | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const { data: resp, isLoading, isError } = useQuery({
    queryKey: ['fee-types'],
    queryFn: async () => (await api().get('/admin/finance/fee-types')).data,
  });
  const feeTypes = useMemo(() => toArray<FeeType>(resp), [resp]);

  const { data: yearsResp } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => (await api().get('/admin/academic-years')).data,
  });
  const activeYearId = useMemo(() => {
    const years = toArray<{ id: number; is_active?: boolean }>(yearsResp);
    return years.find(y => y.is_active)?.id ?? years[0]?.id ?? null;
  }, [yearsResp]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (ft: FeeType) => {
    setEditing(ft);
    setForm({
      code: ft.code,
      name: ft.name,
      description: ft.description ?? '',
      default_amount: String(ft.default_amount ?? ''),
      category: ft.category,
      is_mandatory: !!ft.is_mandatory,
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        code: form.code,
        name: form.name,
        description: form.description || null,
        default_amount: Number(form.default_amount),
        category: form.category,
        is_mandatory: form.is_mandatory,
      };
      if (editing) {
        return (await api().put(`/admin/finance/fee-types/${editing.id}`, payload)).data;
      }
      if (activeYearId) payload.academic_year_id = activeYearId;
      return (await api().post('/admin/finance/fee-types', payload)).data;
    },
    onSuccess: () => {
      notify(editing ? 'Type de frais mis à jour.' : 'Type de frais créé.');
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ['fee-types'] });
    },
    onError: (e: any) => {
      const errors = e?.response?.data?.errors;
      const first = errors ? (Object.values(errors)[0] as string[])?.[0] : undefined;
      notify(first ?? e?.response?.data?.message ?? "Échec de l'enregistrement.", 'error');
    },
  });

  const canSave = form.code.trim() && form.name.trim() && form.default_amount !== '' && Number(form.default_amount) >= 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Types de frais</Typography>
        <Button variant="contained" onClick={openCreate}>+ Nouveau type de frais</Button>
      </Box>

      <Card>
        <CardContent>
          {isLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
          {isError && <Alert severity="error">Erreur lors du chargement des types de frais.</Alert>}
          {!isLoading && !isError && feeTypes.length === 0 && <Alert severity="info">Aucun type de frais. Créez-en un.</Alert>}
          {!isLoading && !isError && feeTypes.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell align="right">Montant par défaut</TableCell>
                    <TableCell align="center">Obligatoire</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeTypes.map(ft => (
                    <TableRow key={ft.id} hover>
                      <TableCell><Typography fontFamily="monospace">{ft.code}</Typography></TableCell>
                      <TableCell>{ft.name}</TableCell>
                      <TableCell><Chip size="small" label={categoryLabel(ft.category)} /></TableCell>
                      <TableCell align="right">{fmtAmount(ft.default_amount)}</TableCell>
                      <TableCell align="center">
                        {ft.is_mandatory
                          ? <Chip size="small" color="primary" label="Oui" />
                          : <Chip size="small" variant="outlined" label="Non" />}
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" onClick={() => openEdit(ft)}>Modifier</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Modifier le type de frais' : 'Nouveau type de frais'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select label="Catégorie" value={form.category} onChange={e => setForm(f => ({ ...f, category: String(e.target.value) }))}>
                  {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TextField label="Nom" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth />
            <TextField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline minRows={2} />
            <TextField
              label="Montant par défaut (FCFA)"
              type="number"
              value={form.default_amount}
              onChange={e => setForm(f => ({ ...f, default_amount: e.target.value }))}
              fullWidth
            />
            <FormControlLabel
              control={<Switch checked={form.is_mandatory} onChange={e => setForm(f => ({ ...f, is_mandatory: e.target.checked }))} />}
              label="Frais obligatoire"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!canSave || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
