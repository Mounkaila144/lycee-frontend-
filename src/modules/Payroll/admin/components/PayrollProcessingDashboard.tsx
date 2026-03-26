'use client';

import React, { useState, useCallback } from 'react';

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
import LinearProgress from '@mui/material/LinearProgress';

import type {
  PayrollPeriod,
  PayrollPeriodStatus,
  Payslip,
} from '../../types';

import {
  PAYROLL_PERIOD_STATUS_LABELS,
  PAYROLL_PERIOD_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_PERIODS: PayrollPeriod[] = [
  {
    id: 1, month: 3, year: 2026, label: 'Mars 2026',
    start_date: '2026-03-01', end_date: '2026-03-31',
    status: 'draft', total_gross: null, total_net: null, total_deductions: null,
    employee_count: null, calculated_at: null, validated_at: null, paid_at: null,
    calculated_by: null, validated_by: null,
    created_at: '2026-03-01T00:00:00', updated_at: '2026-03-01T00:00:00',
  },
  {
    id: 2, month: 2, year: 2026, label: 'Février 2026',
    start_date: '2026-02-01', end_date: '2026-02-28',
    status: 'paid', total_gross: 4850000, total_net: 3880000, total_deductions: 970000,
    employee_count: 12, calculated_at: '2026-02-25T10:00:00', validated_at: '2026-02-26T14:00:00', paid_at: '2026-02-28T09:00:00',
    calculated_by: 1, validated_by: 2,
    created_at: '2026-02-01T00:00:00', updated_at: '2026-02-28T09:00:00',
  },
  {
    id: 3, month: 1, year: 2026, label: 'Janvier 2026',
    start_date: '2026-01-01', end_date: '2026-01-31',
    status: 'paid', total_gross: 4750000, total_net: 3800000, total_deductions: 950000,
    employee_count: 12, calculated_at: '2026-01-25T10:00:00', validated_at: '2026-01-26T14:00:00', paid_at: '2026-01-31T09:00:00',
    calculated_by: 1, validated_by: 2,
    created_at: '2026-01-01T00:00:00', updated_at: '2026-01-31T09:00:00',
  },
  {
    id: 4, month: 12, year: 2025, label: 'Décembre 2025',
    start_date: '2025-12-01', end_date: '2025-12-31',
    status: 'paid', total_gross: 5200000, total_net: 4160000, total_deductions: 1040000,
    employee_count: 14, calculated_at: '2025-12-25T10:00:00', validated_at: '2025-12-26T14:00:00', paid_at: '2025-12-31T09:00:00',
    calculated_by: 1, validated_by: 2,
    created_at: '2025-12-01T00:00:00', updated_at: '2025-12-31T09:00:00',
  },
];

const DEMO_PAYSLIPS: Payslip[] = [
  { id: 1, payroll_period_id: 2, employee_id: 1, base_salary: 450000, gross_salary: 525000, net_salary: 420000, total_bonuses: 75000, total_deductions: 105000, cnss_employee: 26250, cnss_employer: 42000, income_tax: 52500, amo_employee: 13125, amo_employer: 13125, employee: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'EMP-001' }, created_at: '2026-02-25T00:00:00', updated_at: '2026-02-25T00:00:00' },
  { id: 2, payroll_period_id: 2, employee_id: 2, base_salary: 300000, gross_salary: 350000, net_salary: 280000, total_bonuses: 50000, total_deductions: 70000, cnss_employee: 17500, cnss_employer: 28000, income_tax: 35000, amo_employee: 8750, amo_employer: 8750, employee: { id: 2, firstname: 'Fatima', lastname: 'Moussa', matricule: 'EMP-002' }, created_at: '2026-02-25T00:00:00', updated_at: '2026-02-25T00:00:00' },
  { id: 3, payroll_period_id: 2, employee_id: 3, base_salary: 350000, gross_salary: 400000, net_salary: 320000, total_bonuses: 50000, total_deductions: 80000, cnss_employee: 20000, cnss_employer: 32000, income_tax: 40000, amo_employee: 10000, amo_employer: 10000, employee: { id: 3, firstname: 'Ibrahim', lastname: 'Souleymane', matricule: 'EMP-003' }, created_at: '2026-02-25T00:00:00', updated_at: '2026-02-25T00:00:00' },
];

const getStatusChipColor = (status: PayrollPeriodStatus): 'default' | 'primary' | 'warning' | 'success' => {
  switch (status) {
    case 'draft': return 'default';
    case 'calculated': return 'primary';
    case 'validated': return 'warning';
    case 'paid': return 'success';
    default: return 'default';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

const MONTH_NAMES = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export const PayrollProcessingDashboard: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const periods = DEMO_PERIODS;
  const payslips = DEMO_PAYSLIPS;

  const handleViewDetail = useCallback((period: PayrollPeriod) => {
    setSelectedPeriod(period);
    setDetailOpen(true);
  }, []);

  const handleCalculate = useCallback((period: PayrollPeriod) => {
    setSnackbar({ open: true, message: `Paie de ${period.label} calculée avec succès`, severity: 'success' });
  }, []);

  const handleValidate = useCallback((period: PayrollPeriod) => {
    setSnackbar({ open: true, message: `Paie de ${period.label} validée`, severity: 'success' });
  }, []);

  const handleGeneratePayslips = useCallback((period: PayrollPeriod) => {
    setSnackbar({ open: true, message: `Bulletins de paie générés pour ${period.label}`, severity: 'success' });
  }, []);

  const handleBankTransfers = useCallback((period: PayrollPeriod) => {
    setSnackbar({ open: true, message: `Ordres de virement générés pour ${period.label}`, severity: 'success' });
  }, []);

  const handleMarkAsPaid = useCallback((period: PayrollPeriod) => {
    setSnackbar({ open: true, message: `${period.label} marqué comme payé`, severity: 'success' });
  }, []);

  const draftCount = periods.filter(p => p.status === 'draft').length;
  const paidCount = periods.filter(p => p.status === 'paid').length;
  const totalPaid = periods.filter(p => p.total_net).reduce((sum, p) => sum + (p.total_net || 0), 0);
  const totalEmployees = periods.find(p => p.status === 'paid')?.employee_count || 0;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Paie & RH</Link>
        <Typography color="text.primary">Traitement Paie</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Traitement de la Paie
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          + Nouvelle Période
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Périodes en brouillon', value: draftCount, color: '#9e9e9e' },
          { label: 'Périodes payées', value: paidCount, color: '#4caf50' },
          { label: 'Total net versé', value: formatCurrency(totalPaid), color: '#1976d2' },
          { label: 'Employés concernés', value: totalEmployees, color: '#ff9800' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color, fontSize: typeof stat.value === 'string' ? '1.5rem' : undefined }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Periods Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Périodes de Paie</Typography>
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
                      <Typography fontWeight="medium">{period.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(period.start_date).toLocaleDateString('fr-FR')} - {new Date(period.end_date).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>{period.employee_count || '-'}</TableCell>
                    <TableCell>{period.total_gross ? formatCurrency(period.total_gross) : '-'}</TableCell>
                    <TableCell><Typography fontWeight="bold">{period.total_net ? formatCurrency(period.total_net) : '-'}</Typography></TableCell>
                    <TableCell>{period.total_deductions ? formatCurrency(period.total_deductions) : '-'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={PAYROLL_PERIOD_STATUS_LABELS[period.status]} color={getStatusChipColor(period.status)} />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button size="small" variant="outlined" onClick={() => handleViewDetail(period)}>
                          Détails
                        </Button>
                        {period.status === 'draft' && (
                          <Button size="small" variant="contained" color="primary" onClick={() => handleCalculate(period)}>
                            Calculer
                          </Button>
                        )}
                        {period.status === 'calculated' && (
                          <Button size="small" variant="contained" color="warning" onClick={() => handleValidate(period)}>
                            Valider
                          </Button>
                        )}
                        {period.status === 'validated' && (
                          <>
                            <Button size="small" variant="outlined" color="secondary" onClick={() => handleGeneratePayslips(period)}>
                              Bulletins
                            </Button>
                            <Button size="small" variant="outlined" color="info" onClick={() => handleBankTransfers(period)}>
                              Virements
                            </Button>
                            <Button size="small" variant="contained" color="success" onClick={() => handleMarkAsPaid(period)}>
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
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Période : {selectedPeriod?.label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPeriod && `${new Date(selectedPeriod.start_date).toLocaleDateString('fr-FR')} - ${new Date(selectedPeriod.end_date).toLocaleDateString('fr-FR')}`}
              </Typography>
            </Box>
            {selectedPeriod && (
              <Chip label={PAYROLL_PERIOD_STATUS_LABELS[selectedPeriod.status]} color={getStatusChipColor(selectedPeriod.status)} />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPeriod?.total_gross && (
            <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Brut total</Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">{formatCurrency(selectedPeriod.total_gross)}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Net total</Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">{formatCurrency(selectedPeriod.total_net!)}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Retenues</Typography>
                  <Typography variant="h5" fontWeight="bold" color="error">{formatCurrency(selectedPeriod.total_deductions!)}</Typography>
                </Paper>
              </Grid>
            </Grid>
          )}

          {selectedPeriod?.status === 'paid' && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Bulletins de Paie</Typography>
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
                    {payslips.map(payslip => (
                      <TableRow key={payslip.id}>
                        <TableCell>
                          <Typography fontWeight="medium">{payslip.employee?.firstname} {payslip.employee?.lastname}</Typography>
                        </TableCell>
                        <TableCell>{formatCurrency(payslip.base_salary)}</TableCell>
                        <TableCell>{formatCurrency(payslip.total_bonuses)}</TableCell>
                        <TableCell>{formatCurrency(payslip.gross_salary)}</TableCell>
                        <TableCell>{formatCurrency(payslip.cnss_employee)}</TableCell>
                        <TableCell>{formatCurrency(payslip.income_tax)}</TableCell>
                        <TableCell>{formatCurrency(payslip.amo_employee)}</TableCell>
                        <TableCell><Typography fontWeight="bold" color="success.main">{formatCurrency(payslip.net_salary)}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {selectedPeriod?.status === 'draft' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Cette période est en brouillon. Cliquez sur &quot;Calculer&quot; pour lancer le calcul de la paie.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Create Period Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Période de Paie</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Mois</InputLabel>
              <Select label="Mois" defaultValue={4}>
                {MONTH_NAMES.slice(1).map((name, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Année" type="number" fullWidth defaultValue={2026} />
            <TextField
              label="Date de début"
              type="date"
              defaultValue="2026-04-01"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Date de fin"
              type="date"
              defaultValue="2026-04-30"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setCreateOpen(false);
              setSnackbar({ open: true, message: 'Période de paie créée', severity: 'success' });
            }}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
