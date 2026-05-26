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

const STATUS_LABELS: Record<string, string> = { active: 'Actif', inactive: 'Inactif', suspended: 'Suspendu', terminated: 'Résilié' };
const STATUS_COLORS: Record<string, 'success' | 'default' | 'warning' | 'error'> = { active: 'success', inactive: 'default', suspended: 'warning', terminated: 'error' };
const fmtMoney = (n: any) => (n == null ? '—' : new Intl.NumberFormat('fr-FR').format(Math.round(Number(n))) + ' F CFA');

interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string | null;
  position: string | null;
  status: string;
  hire_date: string | null;
  contracts?: { base_salary?: number | string; status?: string }[];
}

export const SecondaryPayrollEmployees: React.FC = () => {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', department: '', position: '', hire_date: new Date().toISOString().slice(0, 10) });

  const { data: resp, isLoading } = useQuery({
    queryKey: ['payroll-employees'],
    queryFn: async () => (await api().get('/admin/payroll/employees', { params: { per_page: 100 } })).data,
  });
  const employees = useMemo(() => toArray<Employee>(resp), [resp]);

  const stats = useMemo(() => {
    const active = employees.filter(e => e.status === 'active').length;
    const mass = employees.reduce((sum, e) => {
      const c = e.contracts?.find(c => c.status === 'active') ?? e.contracts?.[0];
      return sum + Number(c?.base_salary ?? 0);
    }, 0);
    return { total: employees.length, active, mass };
  }, [employees]);

  const createMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/payroll/employees', form)).data,
    onSuccess: () => { setCreateOpen(false); setForm(f => ({ ...f, first_name: '', last_name: '', email: '' })); notify('Employé créé.'); qc.invalidateQueries({ queryKey: ['payroll-employees'] }); },
    onError: (e: any) => {
      const errs = e?.response?.data?.errors;
      const msg = errs ? Object.values(errs).flat()[0] as string : (e?.response?.data?.message ?? 'Échec de la création.');
      notify(msg, 'error');
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Gestion des Employés</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>+ Nouvel employé</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Employés', value: stats.total, color: '#1976d2' },
          { label: 'Actifs', value: stats.active, color: '#4caf50' },
          { label: 'Masse salariale', value: fmtMoney(stats.mass), color: '#ff9800' },
        ].map((c, i) => (
          <Grid key={i} size={{ xs: 12, sm: 4 }}>
            <Card><CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: c.color }}>{c.value}</Typography>
              <Typography variant="body2" color="text.secondary">{c.label}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Liste des Employés</Typography>
          {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {!isLoading && employees.length === 0 && <Alert severity="info">Aucun employé. Cliquez sur « Nouvel employé ».</Alert>}
          {!isLoading && employees.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Matricule</TableCell><TableCell>Nom complet</TableCell><TableCell>Email</TableCell><TableCell>Département</TableCell><TableCell>Poste</TableCell><TableCell>Statut</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {employees.map(e => (
                    <TableRow key={e.id} hover>
                      <TableCell>{e.employee_code}</TableCell>
                      <TableCell>{e.last_name} {e.first_name}</TableCell>
                      <TableCell>{e.email}</TableCell>
                      <TableCell>{e.department ?? '—'}</TableCell>
                      <TableCell>{e.position ?? '—'}</TableCell>
                      <TableCell><Chip size="small" label={STATUS_LABELS[e.status] ?? e.status} color={STATUS_COLORS[e.status] ?? 'default'} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvel employé</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Prénom" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} fullWidth />
              <TextField label="Nom" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} fullWidth />
            </Box>
            <TextField label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} fullWidth />
            <TextField label="Téléphone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Département" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} fullWidth>
                {['Administration', 'Enseignement', 'Surveillance', 'Comptabilité', 'Services généraux'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
              <TextField label="Poste" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} fullWidth />
            </Box>
            <TextField label="Date d'embauche" type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!form.first_name || !form.last_name || !form.email || createMutation.isPending} onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
