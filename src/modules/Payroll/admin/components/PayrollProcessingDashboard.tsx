'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';

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

function unwrap<T>(resp: unknown): T | null {
  const r = resp as { data?: unknown };
  if (r && r.data !== undefined) return r.data as T;
  return (resp as T) ?? null;
}

interface PayrollEmployee {
  id: number;
  employee_code?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

interface PayrollRecord {
  id: number;
  base_salary?: number | string;
  bonuses?: number | string;
  gross_salary?: number | string;
  cnss_employee?: number | string;
  income_tax?: number | string;
  amo_employee?: number | string;
  net_salary?: number | string;
  employee?: PayrollEmployee;
}

interface PayrollPeriod {
  id: number;
  period_code?: string;
  name?: string;
  year: number;
  month: number;
  start_date: string;
  end_date: string;
  payment_date?: string | null;
  status: string;
  total_employees?: number | null;
  total_gross_salary?: number | string | null;
  total_deductions?: number | string | null;
  total_net_salary?: number | string | null;
  payroll_records?: PayrollRecord[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  calculated: 'Calculée',
  validated: 'Validée',
  paid: 'Payée',
  closed: 'Clôturée',
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'warning' | 'success' | 'info'> = {
  draft: 'default',
  in_progress: 'info',
  calculated: 'primary',
  validated: 'warning',
  paid: 'success',
  closed: 'default',
};

const MONTH_NAMES = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const fmtMoney = (n: unknown): string => (n == null ? '—' : new Intl.NumberFormat('fr-FR').format(Math.round(Number(n))) + ' F CFA');
const periodLabel = (p: PayrollPeriod): string => p.name ?? `${MONTH_NAMES[p.month] ?? p.month} ${p.year}`;
const fmtDate = (d?: string | null): string => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

export const PayrollProcessingDashboard: React.FC = () => {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const now = new Date();
  const [form, setForm] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    payment_date: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
  });

  const { data: resp, isLoading, isError } = useQuery({
    queryKey: ['payroll-periods'],
    queryFn: async () => (await api().get('/admin/payroll/payroll-periods')).data,
  });
  const periods = useMemo(() => toArray<PayrollPeriod>(resp), [resp]);

  const { data: detailResp, isLoading: detailLoading } = useQuery({
    queryKey: ['payroll-period', selectedId],
    queryFn: async () => (await api().get(`/admin/payroll/payroll-periods/${selectedId}`)).data,
    enabled: detailOpen && selectedId != null,
  });
  const detail = useMemo(() => unwrap<PayrollPeriod>(detailResp), [detailResp]);
  const records = detail?.payroll_records ?? [];

  const onMutationError = (e: any) => {
    const errs = e?.response?.data?.errors;
    const msg = errs ? (Object.values(errs).flat()[0] as string) : (e?.response?.data?.message ?? 'Opération échouée.');
    notify(msg, 'error');
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['payroll-periods'] });
    qc.invalidateQueries({ queryKey: ['payroll-period'] });
  };

  const createMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/payroll/payroll-periods', form)).data,
    onSuccess: () => { setCreateOpen(false); notify('Période de paie créée.'); invalidate(); },
    onError: onMutationError,
  });

  const calculateMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/payroll/payroll-periods/${id}/calculate`)).data,
    onSuccess: () => { notify('Paie calculée avec succès.'); invalidate(); },
    onError: onMutationError,
  });

  const validateMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/payroll/payroll-periods/${id}/validate`)).data,
    onSuccess: () => { notify('Paie validée avec succès.'); invalidate(); },
    onError: onMutationError,
  });

  const payslipsMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/payroll/payroll-periods/${id}/generate-payslips`)).data,
    onSuccess: (d: any) => { notify(`Bulletins générés (${d?.count ?? 0}).`); invalidate(); },
    onError: onMutationError,
  });

  const transfersMutation = useMutation({
    mutationFn: async (id: number) => (await api().get(`/admin/payroll/payroll-periods/${id}/bank-transfers`)).data,
    onSuccess: (d: any) => { notify(`Fichier de virements généré (${d?.count ?? 0} ligne(s)).`); },
    onError: onMutationError,
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/payroll/payroll-periods/${id}/mark-as-paid`, { payment_date: new Date().toISOString().slice(0, 10) })).data,
    onSuccess: () => { notify('Période marquée comme payée.'); invalidate(); },
    onError: onMutationError,
  });

  const pendingId = (m: typeof calculateMutation): number | null => (m.isPending ? (m.variables as number) : null);

  const draftCount = periods.filter(p => p.status === 'draft' || p.status === 'in_progress').length;
  const paidCount = periods.filter(p => p.status === 'paid' || p.status === 'closed').length;
  const totalPaid = periods.filter(p => p.status === 'paid' || p.status === 'closed').reduce((sum, p) => sum + Number(p.total_net_salary ?? 0), 0);
  const totalEmployees = periods.find(p => p.status === 'paid' || p.status === 'closed')?.total_employees ?? 0;

  const openDetail = (id: number) => { setSelectedId(id); setDetailOpen(true); };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Paie & RH</Link>
        <Typography color="text.primary">Traitement Paie</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Traitement de la Paie</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>+ Nouvelle Période</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Périodes en brouillon', value: draftCount, color: '#9e9e9e' },
          { label: 'Périodes payées', value: paidCount, color: '#4caf50' },
          { label: 'Total net versé', value: fmtMoney(totalPaid), color: '#1976d2' },
          { label: 'Employés concernés', value: totalEmployees, color: '#ff9800' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color, fontSize: typeof stat.value === 'string' ? '1.5rem' : undefined }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Périodes de Paie</Typography>
          {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {isError && <Alert severity="error">Impossible de charger les périodes de paie.</Alert>}
          {!isLoading && !isError && periods.length === 0 && <Alert severity="info">Aucune période de paie. Cliquez sur « Nouvelle Période ».</Alert>}
          {!isLoading && !isError && periods.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Période</TableCell>
                    <TableCell>Employés</TableCell>
                    <TableCell>Brut total</TableCell>
                    <TableCell>Net total</TableCell>
                    <TableCell>Retenues</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {periods.map(period => (
                    <TableRow key={period.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{periodLabel(period)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fmtDate(period.start_date)} - {fmtDate(period.end_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>{period.total_employees ?? '—'}</TableCell>
                      <TableCell>{fmtMoney(period.total_gross_salary)}</TableCell>
                      <TableCell><Typography fontWeight="bold">{fmtMoney(period.total_net_salary)}</Typography></TableCell>
                      <TableCell>{fmtMoney(period.total_deductions)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={STATUS_LABELS[period.status] ?? period.status} color={STATUS_COLORS[period.status] ?? 'default'} />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Button size="small" variant="outlined" onClick={() => openDetail(period.id)}>Détails</Button>
                          {(period.status === 'draft' || period.status === 'in_progress') && (
                            <Button size="small" variant="contained" color="primary" disabled={pendingId(calculateMutation) === period.id} onClick={() => calculateMutation.mutate(period.id)}>
                              Calculer
                            </Button>
                          )}
                          {period.status === 'calculated' && (
                            <Button size="small" variant="contained" color="warning" disabled={pendingId(validateMutation) === period.id} onClick={() => validateMutation.mutate(period.id)}>
                              Valider
                            </Button>
                          )}
                          {period.status === 'validated' && (
                            <>
                              <Button size="small" variant="outlined" color="secondary" disabled={pendingId(payslipsMutation) === period.id} onClick={() => payslipsMutation.mutate(period.id)}>
                                Bulletins
                              </Button>
                              <Button size="small" variant="outlined" color="info" disabled={pendingId(transfersMutation) === period.id} onClick={() => transfersMutation.mutate(period.id)}>
                                Virements
                              </Button>
                              <Button size="small" variant="contained" color="success" disabled={pendingId(markPaidMutation) === period.id} onClick={() => markPaidMutation.mutate(period.id)}>
                                Payer
                              </Button>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Période : {detail ? periodLabel(detail) : '…'}</Typography>
              {detail && (
                <Typography variant="body2" color="text.secondary">
                  {fmtDate(detail.start_date)} - {fmtDate(detail.end_date)}
                </Typography>
              )}
            </Box>
            {detail && <Chip label={STATUS_LABELS[detail.status] ?? detail.status} color={STATUS_COLORS[detail.status] ?? 'default'} />}
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {!detailLoading && detail && (
            <>
              <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Brut total</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">{fmtMoney(detail.total_gross_salary)}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Net total</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">{fmtMoney(detail.total_net_salary)}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Retenues</Typography>
                    <Typography variant="h5" fontWeight="bold" color="error">{fmtMoney(detail.total_deductions)}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {records.length > 0 ? (
                <>
                  <Typography variant="h6" sx={{ mb: 2 }}>Lignes de paie</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employé</TableCell>
                          <TableCell>Salaire de base</TableCell>
                          <TableCell>Primes</TableCell>
                          <TableCell>Brut</TableCell>
                          <TableCell>CNSS</TableCell>
                          <TableCell>IR</TableCell>
                          <TableCell>AMO</TableCell>
                          <TableCell>Net</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.map(rec => (
                          <TableRow key={rec.id}>
                            <TableCell>
                              <Typography fontWeight="medium">
                                {rec.employee?.full_name ?? (`${rec.employee?.last_name ?? ''} ${rec.employee?.first_name ?? ''}`.trim() || '—')}
                              </Typography>
                            </TableCell>
                            <TableCell>{fmtMoney(rec.base_salary)}</TableCell>
                            <TableCell>{fmtMoney(rec.bonuses)}</TableCell>
                            <TableCell>{fmtMoney(rec.gross_salary)}</TableCell>
                            <TableCell>{fmtMoney(rec.cnss_employee)}</TableCell>
                            <TableCell>{fmtMoney(rec.income_tax)}</TableCell>
                            <TableCell>{fmtMoney(rec.amo_employee)}</TableCell>
                            <TableCell><Typography fontWeight="bold" color="success.main">{fmtMoney(rec.net_salary)}</Typography></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Alert severity="info">
                  Aucune ligne de paie pour cette période. Lancez le calcul depuis la liste pour générer les bulletins.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Période de Paie</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Mois</InputLabel>
              <Select label="Mois" value={form.month} onChange={e => setForm(f => ({ ...f, month: Number(e.target.value) }))}>
                {MONTH_NAMES.slice(1).map((name, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Année" type="number" fullWidth value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
            <TextField
              label="Date de paiement"
              type="date"
              value={form.payment_date}
              onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
