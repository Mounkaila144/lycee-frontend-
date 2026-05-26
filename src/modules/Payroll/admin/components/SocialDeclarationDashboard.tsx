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

interface SocialDeclaration {
  id: number;
  declaration_type: string;
  declaration_number?: string | null;
  year: number;
  month: number;
  total_gross_salary?: number | string | null;
  total_employee_contributions?: number | string | null;
  total_employer_contributions?: number | string | null;
  total_amount_due?: number | string | null;
  total_employees?: number | null;
  status: string;
  due_date?: string | null;
  submission_date?: string | null;
  submission_reference?: string | null;
  payment_date?: string | null;
  payment_reference?: string | null;
}

interface PeriodRef {
  id: number;
  period_code?: string;
  name?: string;
  year: number;
  month: number;
  status: string;
}

const MONTH_NAMES = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const TYPE_LABELS: Record<string, string> = {
  cnss: 'CNSS',
  CNSS: 'CNSS',
  income_tax: 'Impôt sur le revenu',
  amo: 'AMO',
  AMO: 'AMO',
  annual_summary: 'Récapitulatif annuel',
};

const TYPE_COLORS: Record<string, string> = {
  cnss: '#1976d2',
  CNSS: '#1976d2',
  income_tax: '#ff9800',
  amo: '#9c27b0',
  AMO: '#9c27b0',
  annual_summary: '#607d8b',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  validated: 'Validée',
  submitted: 'Soumise',
  accepted: 'Acceptée',
  paid: 'Payée',
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'warning' | 'success'> = {
  draft: 'default',
  validated: 'primary',
  submitted: 'warning',
  accepted: 'primary',
  paid: 'success',
};

const fmtMoney = (n: unknown): string => (n == null ? '—' : new Intl.NumberFormat('fr-FR').format(Math.round(Number(n))) + ' F CFA');
const declLabel = (d: SocialDeclaration): string => `${TYPE_LABELS[d.declaration_type] ?? d.declaration_type} - ${MONTH_NAMES[d.month] ?? d.month} ${d.year}`;
const periodRefLabel = (p: PeriodRef): string => p.name ?? `${MONTH_NAMES[p.month] ?? p.month} ${p.year}`;
const fmtDate = (d?: string | null): string => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

export const SocialDeclarationDashboard: React.FC = () => {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [submitDialog, setSubmitDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [payDialog, setPayDialog] = useState<{ open: boolean; decl: SocialDeclaration | null }>({ open: false, decl: null });
  const [selected, setSelected] = useState<SocialDeclaration | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const [createForm, setCreateForm] = useState({ period_id: '', type: 'cnss' });
  const [submitForm, setSubmitForm] = useState({ reference: '' });
  const [payForm, setPayForm] = useState({ amount: '', method: 'bank_transfer', reference: '' });

  const onMutationError = (e: any) => {
    const errs = e?.response?.data?.errors;
    const msg = errs ? (Object.values(errs).flat()[0] as string) : (e?.response?.data?.message ?? 'Opération échouée.');
    notify(msg, 'error');
  };

  const { data: resp, isLoading, isError } = useQuery({
    queryKey: ['social-declarations'],
    queryFn: async () => (await api().get('/admin/payroll/declarations')).data,
  });
  const declarations = useMemo(() => toArray<SocialDeclaration>(resp), [resp]);

  const periodsQuery = useQuery({
    queryKey: ['payroll-periods-for-declarations'],
    queryFn: async () => (await api().get('/admin/payroll/payroll-periods')).data,
  });
  const periods = useMemo(() => toArray<PeriodRef>(periodsQuery.data), [periodsQuery.data]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['social-declarations'] });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const periodId = Number(createForm.period_id);
      const path = createForm.type === 'income_tax' ? 'income-tax' : createForm.type; // cnss | income-tax | amo

      return (await api().post(`/admin/payroll/payroll-periods/${periodId}/declarations/${path}`)).data;
    },
    onSuccess: () => { setCreateOpen(false); notify('Déclaration générée.'); invalidate(); },
    onError: onMutationError,
  });

  const validateMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/payroll/declarations/${id}/validate`)).data,
    onSuccess: () => { notify('Déclaration validée.'); invalidate(); },
    onError: onMutationError,
  });

  const submitMutation = useMutation({
    mutationFn: async () => (await api().post(`/admin/payroll/declarations/${submitDialog.id}/submit`, { reference: submitForm.reference })).data,
    onSuccess: () => { setSubmitDialog({ open: false, id: null }); setSubmitForm({ reference: '' }); notify('Déclaration soumise.'); invalidate(); },
    onError: onMutationError,
  });

  const payMutation = useMutation({
    mutationFn: async () => (await api().post(`/admin/payroll/declarations/${payDialog.decl?.id}/payment`, {
      amount: Number(payForm.amount),
      method: payForm.method,
      reference: payForm.reference,
    })).data,
    onSuccess: () => { setPayDialog({ open: false, decl: null }); setPayForm({ amount: '', method: 'bank_transfer', reference: '' }); notify('Paiement enregistré.'); invalidate(); },
    onError: onMutationError,
  });

  const pendingId = (m: typeof validateMutation): number | null => (m.isPending ? (m.variables as number) : null);

  const openSubmit = (d: SocialDeclaration) => { setSubmitForm({ reference: '' }); setSubmitDialog({ open: true, id: d.id }); };
  const openPay = (d: SocialDeclaration) => { setPayForm({ amount: String(Math.round(Number(d.total_amount_due ?? 0))), method: 'bank_transfer', reference: '' }); setPayDialog({ open: true, decl: d }); };

  const sumByType = (type: string): number =>
    declarations.filter(d => d.declaration_type === type || (type === 'cnss' && d.declaration_type === 'CNSS') || (type === 'amo' && d.declaration_type === 'AMO'))
      .reduce((sum, d) => sum + Number(d.total_amount_due ?? 0), 0);

  const cnssTotal = sumByType('cnss');
  const irTotal = sumByType('income_tax');
  const amoTotal = sumByType('amo');
  const pendingCount = declarations.filter(d => d.status !== 'paid').length;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Paie & RH</Link>
        <Typography color="text.primary">Déclarations Sociales</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Déclarations Sociales</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>+ Nouvelle Déclaration</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total CNSS', value: fmtMoney(cnssTotal), color: '#1976d2' },
          { label: 'Total IR', value: fmtMoney(irTotal), color: '#ff9800' },
          { label: 'Total AMO', value: fmtMoney(amoTotal), color: '#9c27b0' },
          { label: 'En attente', value: pendingCount, color: '#f44336' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color, fontSize: typeof stat.value === 'string' ? '1.3rem' : undefined }}>
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
          <Typography variant="h6" sx={{ mb: 2 }}>Déclarations</Typography>
          {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {isError && <Alert severity="error">Impossible de charger les déclarations.</Alert>}
          {!isLoading && !isError && declarations.length === 0 && <Alert severity="info">Aucune déclaration. Générez-en une depuis une période de paie.</Alert>}
          {!isLoading && !isError && declarations.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Libellé</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Base brute</TableCell>
                    <TableCell>Part salarié</TableCell>
                    <TableCell>Part employeur</TableCell>
                    <TableCell>Total dû</TableCell>
                    <TableCell>Échéance</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {declarations.map(d => (
                    <TableRow key={d.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{declLabel(d)}</Typography>
                        {d.declaration_number && <Typography variant="caption" color="text.secondary">{d.declaration_number}</Typography>}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={TYPE_LABELS[d.declaration_type] ?? d.declaration_type} sx={{ bgcolor: TYPE_COLORS[d.declaration_type] ?? '#607d8b', color: 'white' }} />
                      </TableCell>
                      <TableCell>{fmtMoney(d.total_gross_salary)}</TableCell>
                      <TableCell>{fmtMoney(d.total_employee_contributions)}</TableCell>
                      <TableCell>{fmtMoney(d.total_employer_contributions)}</TableCell>
                      <TableCell><Typography fontWeight="bold">{fmtMoney(d.total_amount_due)}</Typography></TableCell>
                      <TableCell>{fmtDate(d.due_date)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={STATUS_LABELS[d.status] ?? d.status} color={STATUS_COLORS[d.status] ?? 'default'} />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Button size="small" variant="outlined" onClick={() => { setSelected(d); setDetailOpen(true); }}>Détails</Button>
                          {d.status === 'draft' && (
                            <Button size="small" variant="contained" color="primary" disabled={pendingId(validateMutation) === d.id} onClick={() => validateMutation.mutate(d.id)}>
                              Valider
                            </Button>
                          )}
                          {d.status === 'validated' && (
                            <Button size="small" variant="contained" color="warning" onClick={() => openSubmit(d)}>Soumettre</Button>
                          )}
                          {(d.status === 'submitted' || d.status === 'accepted' || d.status === 'validated') && (
                            <Button size="small" variant="contained" color="success" onClick={() => openPay(d)}>Payer</Button>
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{selected && declLabel(selected)}</Typography>
              {selected?.declaration_number && <Typography variant="body2" color="text.secondary">N° : {selected.declaration_number}</Typography>}
            </Box>
            {selected && <Chip label={STATUS_LABELS[selected.status] ?? selected.status} color={STATUS_COLORS[selected.status] ?? 'default'} />}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                {selected && <Chip label={TYPE_LABELS[selected.declaration_type] ?? selected.declaration_type} sx={{ bgcolor: TYPE_COLORS[selected.declaration_type] ?? '#607d8b', color: 'white', mt: 1 }} />}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Échéance</Typography>
                <Typography fontWeight="bold">{fmtDate(selected?.due_date)}</Typography>
                <Typography variant="caption" color="text.secondary">{selected?.total_employees ?? 0} employé(s) concerné(s)</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Part salarié</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">{fmtMoney(selected?.total_employee_contributions)}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Part employeur</Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">{fmtMoney(selected?.total_employer_contributions)}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Total dû</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">{fmtMoney(selected?.total_amount_due)}</Typography>
              </Paper>
            </Grid>
            {selected?.submission_date && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Soumise le</Typography>
                  <Typography>{fmtDate(selected.submission_date)}</Typography>
                  {selected.submission_reference && <Typography variant="caption" color="text.secondary">Réf : {selected.submission_reference}</Typography>}
                </Paper>
              </Grid>
            )}
            {selected?.payment_date && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Payée le</Typography>
                  <Typography>{fmtDate(selected.payment_date)}</Typography>
                  {selected.payment_reference && <Typography variant="caption" color="text.secondary">Réf : {selected.payment_reference}</Typography>}
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Generate Declaration Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Déclaration Sociale</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">La déclaration est générée à partir d'une période de paie calculée.</Alert>
            <FormControl fullWidth>
              <InputLabel>Période de paie</InputLabel>
              <Select label="Période de paie" value={createForm.period_id} onChange={e => setCreateForm(f => ({ ...f, period_id: String(e.target.value) }))}>
                {periods.map(p => <MenuItem key={p.id} value={p.id}>{periodRefLabel(p)}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={createForm.type} onChange={e => setCreateForm(f => ({ ...f, type: String(e.target.value) }))}>
                <MenuItem value="cnss">CNSS</MenuItem>
                <MenuItem value="income_tax">Impôt sur le revenu (IR)</MenuItem>
                <MenuItem value="amo">AMO</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!createForm.period_id || generateMutation.isPending} onClick={() => generateMutation.mutate()}>
            {generateMutation.isPending ? 'Génération…' : 'Générer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={submitDialog.open} onClose={() => setSubmitDialog({ open: false, id: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Soumettre la déclaration</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField label="Référence de soumission" fullWidth value={submitForm.reference} onChange={e => setSubmitForm({ reference: e.target.value })} placeholder="Ex: CNSS-2026-02-001" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialog({ open: false, id: null })}>Annuler</Button>
          <Button variant="contained" disabled={!submitForm.reference || submitMutation.isPending} onClick={() => submitMutation.mutate()}>
            {submitMutation.isPending ? 'Envoi…' : 'Soumettre'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={payDialog.open} onClose={() => setPayDialog({ open: false, decl: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Enregistrer le paiement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Montant (F CFA)" type="number" fullWidth value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Mode de paiement</InputLabel>
              <Select label="Mode de paiement" value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: String(e.target.value) }))}>
                <MenuItem value="bank_transfer">Virement bancaire</MenuItem>
                <MenuItem value="check">Chèque</MenuItem>
                <MenuItem value="online">En ligne</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Référence" fullWidth value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialog({ open: false, decl: null })}>Annuler</Button>
          <Button variant="contained" disabled={!payForm.amount || !payForm.reference || payMutation.isPending} onClick={() => payMutation.mutate()}>
            {payMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
