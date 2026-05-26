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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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

interface SalaryGrade {
  grade?: string;
  min_salary?: number | string;
  max_salary?: number | string;
}

interface SalaryScale {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  type: string;
  grades?: SalaryGrade[] | null;
  is_active?: boolean;
}

interface PayrollComponent {
  id: number;
  code?: string;
  name: string;
  description?: string | null;
  component_type: string;
  calculation_type?: string;
  amount?: number | string | null;
  percentage?: number | string | null;
  rate?: number | string | null;
  is_taxable?: boolean;
  is_recurring?: boolean;
  status?: string;
  employee?: { id: number; first_name?: string; last_name?: string; full_name?: string } | null;
}

interface Advance {
  id: number;
  employee_id: number;
  amount: number | string;
  reason?: string | null;
  advance_type?: string;
  number_of_installments?: number | null;
  request_date?: string | null;
  status: string;
  employee?: { id: number; first_name?: string; last_name?: string; full_name?: string; employee_code?: string } | null;
}

interface Employee {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  employee_code?: string;
}

const SCALE_TYPE_LABELS: Record<string, string> = {
  teaching: 'Enseignant',
  administrative: 'Administratif',
  technical: 'Technique',
  management: 'Direction',
  other: 'Autre',
};

const COMPONENT_TYPE_LABELS: Record<string, string> = {
  bonus: 'Prime',
  allowance: 'Indemnité',
  deduction: 'Retenue',
  overtime: 'Heures supp.',
  commission: 'Commission',
  benefit: 'Avantage',
  reimbursement: 'Remboursement',
};

const COMPONENT_TYPE_COLORS: Record<string, string> = {
  bonus: '#4caf50',
  allowance: '#1976d2',
  deduction: '#f44336',
  overtime: '#ff9800',
  commission: '#9c27b0',
  benefit: '#009688',
  reimbursement: '#795548',
};

const ADVANCE_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  requested: 'Demandée',
  approved: 'Approuvée',
  disbursed: 'Décaissée',
  rejected: 'Rejetée',
  repaid: 'Remboursée',
  active: 'Active',
};

const ADVANCE_STATUS_COLORS: Record<string, 'default' | 'primary' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  requested: 'warning',
  approved: 'primary',
  disbursed: 'success',
  active: 'success',
  rejected: 'error',
  repaid: 'default',
};

const fmtMoney = (n: unknown): string => (n == null ? '—' : new Intl.NumberFormat('fr-FR').format(Math.round(Number(n))) + ' F CFA');
const empName = (e?: { first_name?: string; last_name?: string; full_name?: string } | null): string =>
  e?.full_name ?? (`${e?.last_name ?? ''} ${e?.first_name ?? ''}`.trim() || '—');

export const PayrollComponentsDashboard: React.FC = () => {
  const qc = useQueryClient();
  const [tabIndex, setTabIndex] = useState(0);
  const [createScaleOpen, setCreateScaleOpen] = useState(false);
  const [createComponentOpen, setCreateComponentOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const [scaleForm, setScaleForm] = useState({
    code: '', name: '', type: 'administrative', grade: '', min_salary: '', max_salary: '',
    effective_from: new Date().toISOString().slice(0, 10),
  });

  const [componentForm, setComponentForm] = useState({
    employee_id: '', component_type: 'bonus', name: '', calculation_type: 'fixed', amount: '', percentage: '', rate: '',
  });

  const onMutationError = (e: any) => {
    const errs = e?.response?.data?.errors;
    const msg = errs ? (Object.values(errs).flat()[0] as string) : (e?.response?.data?.message ?? 'Opération échouée.');
    notify(msg, 'error');
  };

  const scalesQuery = useQuery({
    queryKey: ['payroll-salary-scales'],
    queryFn: async () => (await api().get('/admin/payroll/salary-scales')).data,
  });
  const salaryScales = useMemo(() => toArray<SalaryScale>(scalesQuery.data), [scalesQuery.data]);

  const componentsQuery = useQuery({
    queryKey: ['payroll-components'],
    queryFn: async () => (await api().get('/admin/payroll/components')).data,
  });
  const components = useMemo(() => toArray<PayrollComponent>(componentsQuery.data), [componentsQuery.data]);

  const advancesQuery = useQuery({
    queryKey: ['payroll-advances'],
    queryFn: async () => (await api().get('/admin/payroll/advances')).data,
  });
  const advances = useMemo(() => toArray<Advance>(advancesQuery.data), [advancesQuery.data]);

  const employeesQuery = useQuery({
    queryKey: ['payroll-employees-select'],
    queryFn: async () => (await api().get('/admin/payroll/employees', { params: { per_page: 200 } })).data,
  });
  const employees = useMemo(() => toArray<Employee>(employeesQuery.data), [employeesQuery.data]);

  const createScaleMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: scaleForm.code,
        name: scaleForm.name,
        type: scaleForm.type,
        effective_from: scaleForm.effective_from,
        grades: [
          {
            grade: scaleForm.grade || scaleForm.code,
            min_salary: Number(scaleForm.min_salary) || 0,
            max_salary: Number(scaleForm.max_salary) || 0,
          },
        ],
      };

      return (await api().post('/admin/payroll/salary-scales', payload)).data;
    },
    onSuccess: () => { setCreateScaleOpen(false); notify('Grille salariale créée.'); qc.invalidateQueries({ queryKey: ['payroll-salary-scales'] }); },
    onError: onMutationError,
  });

  const createComponentMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        employee_id: Number(componentForm.employee_id),
        component_type: componentForm.component_type,
        name: componentForm.name,
        calculation_type: componentForm.calculation_type,
      };

      if (componentForm.calculation_type === 'fixed') payload.amount = Number(componentForm.amount) || 0;
      if (componentForm.calculation_type === 'percentage') payload.percentage = Number(componentForm.percentage) || 0;
      if (componentForm.calculation_type === 'hourly' || componentForm.calculation_type === 'daily') payload.rate = Number(componentForm.rate) || 0;

      return (await api().post('/admin/payroll/components', payload)).data;
    },
    onSuccess: () => { setCreateComponentOpen(false); notify('Élément de paie créé.'); qc.invalidateQueries({ queryKey: ['payroll-components'] }); },
    onError: onMutationError,
  });

  const approveAdvanceMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/payroll/advances/${id}/approve`)).data,
    onSuccess: () => { notify('Avance approuvée.'); qc.invalidateQueries({ queryKey: ['payroll-advances'] }); },
    onError: onMutationError,
  });

  const disburseAdvanceMutation = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/payroll/advances/${id}/disburse`, { method: 'bank_transfer' })).data,
    onSuccess: () => { notify('Avance décaissée.'); qc.invalidateQueries({ queryKey: ['payroll-advances'] }); },
    onError: onMutationError,
  });

  const pendingId = (m: typeof approveAdvanceMutation): number | null => (m.isPending ? (m.variables as number) : null);

  const componentValue = (c: PayrollComponent): string => {
    if (c.calculation_type === 'percentage' && c.percentage != null) return `${c.percentage}%`;
    if ((c.calculation_type === 'hourly' || c.calculation_type === 'daily') && c.rate != null) return fmtMoney(c.rate);
    if (c.amount != null) return fmtMoney(c.amount);
    return '—';
  };

  const scaleAmountRange = (s: SalaryScale): string => {
    const g = s.grades?.[0];
    if (!g) return '—';
    if (g.min_salary != null && g.max_salary != null) return `${fmtMoney(g.min_salary)} – ${fmtMoney(g.max_salary)}`;
    return fmtMoney(g.min_salary ?? g.max_salary);
  };

  const bonusCount = components.filter(c => c.component_type === 'bonus').length;
  const allowanceCount = components.filter(c => c.component_type === 'allowance').length;
  const deductionCount = components.filter(c => c.component_type === 'deduction').length;
  const pendingAdvances = advances.filter(a => a.status === 'requested' || a.status === 'pending').length;

  const renderTableState = (q: { isLoading: boolean; isError: boolean }, empty: string, count: number) => {
    if (q.isLoading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    if (q.isError) return <Alert severity="error">Erreur de chargement des données.</Alert>;
    if (count === 0) return <Alert severity="info">{empty}</Alert>;

    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Paie & RH</Link>
        <Typography color="text.primary">Éléments de Paie</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Éléments de Paie</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Grilles salariales', value: salaryScales.length, color: '#1976d2' },
          { label: 'Primes', value: bonusCount, color: '#4caf50' },
          { label: 'Indemnités / Retenues', value: allowanceCount + deductionCount, color: '#ff9800' },
          { label: 'Avances en attente', value: pendingAdvances, color: '#f44336' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="Grilles Salariales" />
          <Tab label="Composantes de Paie" />
          <Tab label="Avances sur Salaire" />
        </Tabs>
        <CardContent>
          {tabIndex === 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Grilles Salariales</Typography>
                <Button variant="contained" size="small" onClick={() => setCreateScaleOpen(true)}>+ Nouvelle Grille</Button>
              </Box>
              {renderTableState(scalesQuery, 'Aucune grille salariale.', salaryScales.length)}
              {!scalesQuery.isLoading && !scalesQuery.isError && salaryScales.length > 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Nom</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Échelons</TableCell>
                        <TableCell>Fourchette (1er échelon)</TableCell>
                        <TableCell>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salaryScales.map(scale => (
                        <TableRow key={scale.id} hover>
                          <TableCell><Typography fontWeight="medium">{scale.code}</Typography></TableCell>
                          <TableCell>
                            <Typography fontWeight="medium">{scale.name}</Typography>
                            {scale.description && <Typography variant="caption" color="text.secondary">{scale.description}</Typography>}
                          </TableCell>
                          <TableCell>{SCALE_TYPE_LABELS[scale.type] ?? scale.type}</TableCell>
                          <TableCell>{scale.grades?.length ?? 0}</TableCell>
                          <TableCell><Typography fontWeight="bold">{scaleAmountRange(scale)}</Typography></TableCell>
                          <TableCell>
                            <Chip size="small" label={scale.is_active ? 'Actif' : 'Inactif'} color={scale.is_active ? 'success' : 'default'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {tabIndex === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Composantes de Paie</Typography>
                <Button variant="contained" size="small" onClick={() => setCreateComponentOpen(true)}>+ Nouvelle Composante</Button>
              </Box>
              {renderTableState(componentsQuery, 'Aucune composante de paie.', components.length)}
              {!componentsQuery.isLoading && !componentsQuery.isError && components.length > 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Nom</TableCell>
                        <TableCell>Employé</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Montant / %</TableCell>
                        <TableCell>Imposable</TableCell>
                        <TableCell>Récurrent</TableCell>
                        <TableCell>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {components.map(comp => (
                        <TableRow key={comp.id} hover>
                          <TableCell><Typography fontWeight="medium">{comp.code ?? '—'}</Typography></TableCell>
                          <TableCell>
                            <Typography fontWeight="medium">{comp.name}</Typography>
                            {comp.description && <Typography variant="caption" color="text.secondary">{comp.description}</Typography>}
                          </TableCell>
                          <TableCell>{empName(comp.employee)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={COMPONENT_TYPE_LABELS[comp.component_type] ?? comp.component_type} sx={{ bgcolor: COMPONENT_TYPE_COLORS[comp.component_type] ?? '#607d8b', color: 'white' }} />
                          </TableCell>
                          <TableCell>{componentValue(comp)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={comp.is_taxable ? 'Oui' : 'Non'} color={comp.is_taxable ? 'warning' : 'default'} variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={comp.is_recurring ? 'Oui' : 'Non'} color={comp.is_recurring ? 'primary' : 'default'} variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={comp.status === 'active' ? 'Actif' : (comp.status ?? '—')} color={comp.status === 'active' ? 'success' : 'default'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {tabIndex === 2 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Avances sur Salaire</Typography>
              {renderTableState(advancesQuery, 'Aucune avance sur salaire.', advances.length)}
              {!advancesQuery.isLoading && !advancesQuery.isError && advances.length > 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employé</TableCell>
                        <TableCell>Montant</TableCell>
                        <TableCell>Motif</TableCell>
                        <TableCell>Échéances</TableCell>
                        <TableCell>Date demande</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {advances.map(advance => (
                        <TableRow key={advance.id} hover>
                          <TableCell>
                            <Typography fontWeight="medium">{empName(advance.employee)}</Typography>
                            <Typography variant="caption" color="text.secondary">{advance.employee?.employee_code}</Typography>
                          </TableCell>
                          <TableCell><Typography fontWeight="bold">{fmtMoney(advance.amount)}</Typography></TableCell>
                          <TableCell>{advance.reason || '—'}</TableCell>
                          <TableCell>{advance.number_of_installments ? `${advance.number_of_installments} mois` : '—'}</TableCell>
                          <TableCell>{advance.request_date ? new Date(advance.request_date).toLocaleDateString('fr-FR') : '—'}</TableCell>
                          <TableCell>
                            <Chip size="small" label={ADVANCE_STATUS_LABELS[advance.status] ?? advance.status} color={ADVANCE_STATUS_COLORS[advance.status] ?? 'default'} />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              {(advance.status === 'requested' || advance.status === 'pending') && (
                                <Button size="small" variant="contained" color="primary" disabled={pendingId(approveAdvanceMutation) === advance.id} onClick={() => approveAdvanceMutation.mutate(advance.id)}>
                                  Approuver
                                </Button>
                              )}
                              {advance.status === 'approved' && (
                                <Button size="small" variant="contained" color="success" disabled={pendingId(disburseAdvanceMutation) === advance.id} onClick={() => disburseAdvanceMutation.mutate(advance.id)}>
                                  Décaisser
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={createScaleOpen} onClose={() => setCreateScaleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Grille Salariale</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Code" fullWidth value={scaleForm.code} onChange={e => setScaleForm(f => ({ ...f, code: e.target.value }))} placeholder="Ex: GR-A" />
            <TextField label="Nom" fullWidth value={scaleForm.name} onChange={e => setScaleForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Grille A - Cadre supérieur" />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={scaleForm.type} onChange={e => setScaleForm(f => ({ ...f, type: String(e.target.value) }))}>
                {Object.entries(SCALE_TYPE_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Grade / échelon" fullWidth value={scaleForm.grade} onChange={e => setScaleForm(f => ({ ...f, grade: e.target.value }))} placeholder="Ex: A1" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField label="Salaire min (F CFA)" type="number" fullWidth value={scaleForm.min_salary} onChange={e => setScaleForm(f => ({ ...f, min_salary: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="Salaire max (F CFA)" type="number" fullWidth value={scaleForm.max_salary} onChange={e => setScaleForm(f => ({ ...f, max_salary: e.target.value }))} />
              </Grid>
            </Grid>
            <TextField label="Date d'effet" type="date" fullWidth value={scaleForm.effective_from} onChange={e => setScaleForm(f => ({ ...f, effective_from: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateScaleOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!scaleForm.code || !scaleForm.name || createScaleMutation.isPending} onClick={() => createScaleMutation.mutate()}>
            {createScaleMutation.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createComponentOpen} onClose={() => setCreateComponentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Composante de Paie</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Employé</InputLabel>
              <Select label="Employé" value={componentForm.employee_id} onChange={e => setComponentForm(f => ({ ...f, employee_id: String(e.target.value) }))}>
                {employees.map(emp => <MenuItem key={emp.id} value={emp.id}>{empName(emp)} {emp.employee_code ? `(${emp.employee_code})` : ''}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Nom" fullWidth value={componentForm.name} onChange={e => setComponentForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Prime de rendement" />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={componentForm.component_type} onChange={e => setComponentForm(f => ({ ...f, component_type: String(e.target.value) }))}>
                {Object.entries(COMPONENT_TYPE_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Mode de calcul</InputLabel>
              <Select label="Mode de calcul" value={componentForm.calculation_type} onChange={e => setComponentForm(f => ({ ...f, calculation_type: String(e.target.value) }))}>
                <MenuItem value="fixed">Montant fixe</MenuItem>
                <MenuItem value="percentage">Pourcentage</MenuItem>
                <MenuItem value="hourly">Taux horaire</MenuItem>
                <MenuItem value="daily">Taux journalier</MenuItem>
              </Select>
            </FormControl>
            {componentForm.calculation_type === 'fixed' && (
              <TextField label="Montant (F CFA)" type="number" fullWidth value={componentForm.amount} onChange={e => setComponentForm(f => ({ ...f, amount: e.target.value }))} />
            )}
            {componentForm.calculation_type === 'percentage' && (
              <TextField label="Pourcentage (%)" type="number" fullWidth value={componentForm.percentage} onChange={e => setComponentForm(f => ({ ...f, percentage: e.target.value }))} />
            )}
            {(componentForm.calculation_type === 'hourly' || componentForm.calculation_type === 'daily') && (
              <TextField label="Taux (F CFA)" type="number" fullWidth value={componentForm.rate} onChange={e => setComponentForm(f => ({ ...f, rate: e.target.value }))} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateComponentOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!componentForm.employee_id || !componentForm.name || createComponentMutation.isPending} onClick={() => createComponentMutation.mutate()}>
            {createComponentMutation.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
