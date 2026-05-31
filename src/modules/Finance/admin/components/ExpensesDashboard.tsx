'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
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

const fmtMoney = (n: any) => (n == null ? '—' : new Intl.NumberFormat('fr-FR').format(Math.round(Number(n))) + ' F CFA');
const METHODS = [
  { v: 'cash', l: 'Espèces' }, { v: 'bank_transfer', l: 'Virement' }, { v: 'check', l: 'Chèque' },
  { v: 'mobile_money', l: 'Mobile Money' }, { v: 'card', l: 'Carte' }, { v: 'other', l: 'Autre' },
];

interface Category { id: number; code: string; name: string; icon: string | null; is_active: boolean; expenses_count?: number; }
interface Expense {
  id: number; expense_category_id: number; label: string; amount: string; expense_date: string;
  paid_date: string | null; status: string; payment_method: string; supplier: string | null;
  reference: string | null; category?: Category;
}

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ expense_category_id: '', label: '', amount: '', expense_date: today(), payment_method: 'cash', supplier: '', reference: '', status: 'paid', notes: '' });

export const ExpensesDashboard: React.FC = () => {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [dupMatches, setDupMatches] = useState<Expense[] | null>(null);
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });
  const [newCat, setNewCat] = useState({ code: '', name: '', icon: '' });

  const { data: catsResp } = useQuery({ queryKey: ['exp-cats'], queryFn: async () => (await api().get('/admin/finance/expense-categories')).data });
  const categories = useMemo(() => toArray<Category>(catsResp), [catsResp]);

  const { data: expResp, isLoading } = useQuery({
    queryKey: ['expenses', filterCat, filterStatus],
    queryFn: async () => (await api().get('/admin/finance/expenses', { params: { expense_category_id: filterCat || undefined, status: filterStatus || undefined, per_page: 100 } })).data,
  });
  const expenses = useMemo(() => {
    const root = (expResp as any)?.data ?? expResp;
    return toArray<Expense>(root?.data ?? root);
  }, [expResp]);

  const total = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses]);

  const createMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/finance/expenses', {
      expense_category_id: Number(form.expense_category_id), label: form.label, amount: Number(form.amount),
      expense_date: form.expense_date, payment_method: form.payment_method, supplier: form.supplier || null,
      reference: form.reference || null, status: form.status, notes: form.notes || null,
    })).data,
    onSuccess: () => { setCreateOpen(false); setDupMatches(null); setForm(emptyForm()); notify('Dépense enregistrée.'); qc.invalidateQueries({ queryKey: ['expenses'] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const catMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/finance/expense-categories', newCat)).data,
    onSuccess: () => { setNewCat({ code: '', name: '', icon: '' }); notify('Catégorie ajoutée.'); qc.invalidateQueries({ queryKey: ['exp-cats'] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/finance/expenses/${id}/mark-paid`)).data,
    onSuccess: () => { notify('Dépense marquée payée.'); qc.invalidateQueries({ queryKey: ['expenses'] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await api().delete(`/admin/finance/expenses/${id}`)).data,
    onSuccess: () => { notify('Dépense supprimée.'); qc.invalidateQueries({ queryKey: ['expenses'] }); },
    onError: (e: any) => notify(firstError(e), 'error'),
  });

  // Vérifie les doublons avant enregistrement ; si déjà confirmé (dupMatches non null), enregistre.
  const submit = async () => {
    if (dupMatches === null) {
      try {
        const res = await api().get('/admin/finance/expenses/check-duplicate', { params: { expense_category_id: Number(form.expense_category_id), expense_date: form.expense_date, amount: Number(form.amount) } });
        const matches = (res.data?.data?.matches ?? []) as Expense[];
        if (res.data?.data?.has_duplicates) { setDupMatches(matches); return; }
      } catch { /* en cas d'échec du check, on laisse passer */ }
    }
    createMutation.mutate();
  };

  const openCreate = () => { setForm(emptyForm()); setDupMatches(null); setCreateOpen(true); };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" fontWeight="bold">Dépenses & charges</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setCatsOpen(true)}>Catégories</Button>
          <Button variant="contained" onClick={openCreate}>+ Nouvelle dépense</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#e53935' }}>{fmtMoney(total)}</Typography>
            <Typography variant="body2" color="text.secondary">Total des dépenses affichées</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#1976d2' }}>{expenses.length}</Typography>
            <Typography variant="body2" color="text.secondary">Lignes</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField select size="small" label="Catégorie" value={filterCat} onChange={e => setFilterCat(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Toutes</MenuItem>
            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.icon} {c.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Statut" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="paid">Payée</MenuItem>
            <MenuItem value="pending">À payer</MenuItem>
          </TextField>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {!isLoading && expenses.length === 0 && <Alert severity="info">Aucune dépense. Cliquez sur « Nouvelle dépense ».</Alert>}
          {!isLoading && expenses.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Date</TableCell><TableCell>Catégorie</TableCell><TableCell>Libellé</TableCell><TableCell>Fournisseur</TableCell>
                  <TableCell align="right">Montant</TableCell><TableCell>Méthode</TableCell><TableCell>Statut</TableCell><TableCell align="right">Actions</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {expenses.map(e => (
                    <TableRow key={e.id} hover>
                      <TableCell>{e.expense_date?.slice(0, 10)}</TableCell>
                      <TableCell>{e.category ? `${e.category.icon ?? ''} ${e.category.name}` : '—'}</TableCell>
                      <TableCell>{e.label}</TableCell>
                      <TableCell>{e.supplier ?? '—'}</TableCell>
                      <TableCell align="right">{fmtMoney(e.amount)}</TableCell>
                      <TableCell>{METHODS.find(m => m.v === e.payment_method)?.l ?? e.payment_method}</TableCell>
                      <TableCell><Chip size="small" label={e.status === 'paid' ? 'Payée' : 'À payer'} color={e.status === 'paid' ? 'success' : 'warning'} /></TableCell>
                      <TableCell align="right">
                        {e.status === 'pending' && <Button size="small" color="success" onClick={() => markPaidMutation.mutate(e.id)}>Payer</Button>}
                        <Button size="small" color="error" onClick={() => deleteMutation.mutate(e.id)}>Suppr.</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Nouvelle dépense */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle dépense</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Catégorie" value={form.expense_category_id} onChange={e => { setForm(f => ({ ...f, expense_category_id: e.target.value })); setDupMatches(null); }} fullWidth>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.icon} {c.name}</MenuItem>)}
            </TextField>
            <TextField label="Libellé" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Montant (F CFA)" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} fullWidth />
              <TextField label="Date" type="date" value={form.expense_date} onChange={e => { setForm(f => ({ ...f, expense_date: e.target.value })); setDupMatches(null); }} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Méthode" value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))} fullWidth>
                {METHODS.map(m => <MenuItem key={m.v} value={m.v}>{m.l}</MenuItem>)}
              </TextField>
              <TextField select label="Statut" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} fullWidth>
                <MenuItem value="paid">Payée</MenuItem>
                <MenuItem value="pending">À payer</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Fournisseur" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} fullWidth />
              <TextField label="Référence" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} fullWidth />
            </Box>

            {dupMatches && dupMatches.length > 0 && (
              <Alert severity="warning">
                <b>Doublon possible :</b> {dupMatches.length} dépense(s) de la même catégorie ce mois-ci existent déjà
                ({dupMatches.map(m => `${m.label} — ${fmtMoney(m.amount)}`).join(' ; ')}). Vérifiez avant d’enregistrer.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" color={dupMatches ? 'warning' : 'primary'} disabled={!form.expense_category_id || !form.label || !form.amount || createMutation.isPending} onClick={submit}>
            {createMutation.isPending ? 'Enregistrement…' : (dupMatches ? 'Enregistrer quand même' : 'Enregistrer')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Catégories */}
      <Dialog open={catsOpen} onClose={() => setCatsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Catégories de dépenses</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead><TableRow><TableCell>Catégorie</TableCell><TableCell>Code</TableCell><TableCell align="right">Dépenses</TableCell></TableRow></TableHead>
                <TableBody>{categories.map(c => (
                  <TableRow key={c.id}><TableCell>{c.icon} {c.name}</TableCell><TableCell>{c.code}</TableCell><TableCell align="right">{c.expenses_count ?? 0}</TableCell></TableRow>
                ))}</TableBody>
              </Table>
            </TableContainer>
            <Typography variant="subtitle2">Ajouter une catégorie</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" label="Icône" value={newCat.icon} onChange={e => setNewCat(c => ({ ...c, icon: e.target.value }))} sx={{ width: 80 }} />
              <TextField size="small" label="Code" value={newCat.code} onChange={e => setNewCat(c => ({ ...c, code: e.target.value.toUpperCase() }))} sx={{ width: 120 }} />
              <TextField size="small" label="Nom" value={newCat.name} onChange={e => setNewCat(c => ({ ...c, name: e.target.value }))} fullWidth />
              <Button variant="contained" disabled={!newCat.code || !newCat.name || catMutation.isPending} onClick={() => catMutation.mutate()}>Ajouter</Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setCatsOpen(false)}>Fermer</Button></DialogActions>
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

export default ExpensesDashboard;
