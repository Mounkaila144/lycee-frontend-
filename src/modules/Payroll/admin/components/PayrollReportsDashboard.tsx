'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';

import type {
  PayrollJournalEntry,
  SocialChargesReport,
  SalaryStatistics,
  ContractType,
} from '../../types';

import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_DASHBOARD_STATS = {
  total_employees: 12,
  active_contracts: 11,
  total_payroll_cost: 4850000,
  pending_advances: 2,
  current_period_status: 'draft' as const,
};

const DEMO_JOURNAL: PayrollJournalEntry[] = [
  { employee: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'EMP-001' }, base_salary: 450000, gross_salary: 525000, net_salary: 420000, total_bonuses: 75000, total_deductions: 105000 },
  { employee: { id: 2, firstname: 'Fatima', lastname: 'Moussa', matricule: 'EMP-002' }, base_salary: 300000, gross_salary: 350000, net_salary: 280000, total_bonuses: 50000, total_deductions: 70000 },
  { employee: { id: 3, firstname: 'Ibrahim', lastname: 'Souleymane', matricule: 'EMP-003' }, base_salary: 350000, gross_salary: 400000, net_salary: 320000, total_bonuses: 50000, total_deductions: 80000 },
  { employee: { id: 4, firstname: 'Aïssa', lastname: 'Abdou', matricule: 'EMP-004' }, base_salary: 100000, gross_salary: 100000, net_salary: 85000, total_bonuses: 0, total_deductions: 15000 },
  { employee: { id: 6, firstname: 'Hawa', lastname: 'Issa', matricule: 'EMP-006' }, base_salary: 500000, gross_salary: 600000, net_salary: 480000, total_bonuses: 100000, total_deductions: 120000 },
];

const DEMO_SOCIAL_CHARGES: SocialChargesReport[] = [
  { period_label: 'Janvier 2026', cnss_total: 618000, income_tax_total: 475000, amo_total: 237500, grand_total: 1330500 },
  { period_label: 'Février 2026', cnss_total: 630500, income_tax_total: 485000, amo_total: 242500, grand_total: 1358000 },
  { period_label: 'Mars 2026', cnss_total: 0, income_tax_total: 0, amo_total: 0, grand_total: 0 },
];

const DEMO_SALARY_STATS: SalaryStatistics = {
  average_salary: 380000,
  median_salary: 350000,
  min_salary: 100000,
  max_salary: 550000,
  total_mass: 4850000,
  by_department: [
    { department: 'Informatique', average: 425000, count: 4 },
    { department: 'Administration', average: 320000, count: 3 },
    { department: 'Comptabilité', average: 280000, count: 2 },
    { department: 'Services généraux', average: 200000, count: 3 },
  ],
  by_contract_type: [
    { type: 'CDI', average: 420000, count: 8 },
    { type: 'CDD', average: 350000, count: 2 },
    { type: 'Stage', average: 100000, count: 1 },
    { type: 'Interim', average: 250000, count: 1 },
  ],
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

export const PayrollReportsDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const stats = DEMO_DASHBOARD_STATS;
  const journal = DEMO_JOURNAL;
  const socialCharges = DEMO_SOCIAL_CHARGES;
  const salaryStats = DEMO_SALARY_STATS;

  const journalTotalGross = journal.reduce((sum, e) => sum + e.gross_salary, 0);
  const journalTotalNet = journal.reduce((sum, e) => sum + e.net_salary, 0);
  const journalTotalDeductions = journal.reduce((sum, e) => sum + e.total_deductions, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Paie & RH</Link>
        <Typography color="text.primary">Rapports RH</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Rapports & Statistiques RH
      </Typography>

      {/* Dashboard Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total employés', value: stats.total_employees, color: '#1976d2' },
          { label: 'Contrats actifs', value: stats.active_contracts, color: '#4caf50' },
          { label: 'Coût total paie', value: formatCurrency(stats.total_payroll_cost), color: '#ff9800' },
          { label: 'Avances en attente', value: stats.pending_advances, color: '#f44336' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color, fontSize: typeof stat.value === 'string' ? '1.3rem' : undefined }}>
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

      {/* Tabs */}
      <Card>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="Journal de Paie" />
          <Tab label="Charges Sociales" />
          <Tab label="Statistiques Salariales" />
        </Tabs>
        <CardContent>
          {/* Tab 0: Payroll Journal */}
          {tabIndex === 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Journal de Paie - Février 2026</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Employé</TableCell>
                      <TableCell>Salaire de base</TableCell>
                      <TableCell>Primes</TableCell>
                      <TableCell>Brut</TableCell>
                      <TableCell>Retenues</TableCell>
                      <TableCell>Net</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {journal.map((entry, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell><Typography fontWeight="medium">{entry.employee.matricule}</Typography></TableCell>
                        <TableCell>{entry.employee.firstname} {entry.employee.lastname}</TableCell>
                        <TableCell>{formatCurrency(entry.base_salary)}</TableCell>
                        <TableCell>{formatCurrency(entry.total_bonuses)}</TableCell>
                        <TableCell>{formatCurrency(entry.gross_salary)}</TableCell>
                        <TableCell><Typography color="error">{formatCurrency(entry.total_deductions)}</Typography></TableCell>
                        <TableCell><Typography fontWeight="bold" color="success.main">{formatCurrency(entry.net_salary)}</Typography></TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell colSpan={4}><Typography fontWeight="bold">TOTAL</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">{formatCurrency(journalTotalGross)}</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold" color="error">{formatCurrency(journalTotalDeductions)}</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold" color="success.main">{formatCurrency(journalTotalNet)}</Typography></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Tab 1: Social Charges */}
          {tabIndex === 1 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Charges Sociales - 2026</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Période</TableCell>
                      <TableCell>CNSS</TableCell>
                      <TableCell>IR</TableCell>
                      <TableCell>AMO</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {socialCharges.map((charge, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell><Typography fontWeight="medium">{charge.period_label}</Typography></TableCell>
                        <TableCell>{charge.cnss_total > 0 ? formatCurrency(charge.cnss_total) : '-'}</TableCell>
                        <TableCell>{charge.income_tax_total > 0 ? formatCurrency(charge.income_tax_total) : '-'}</TableCell>
                        <TableCell>{charge.amo_total > 0 ? formatCurrency(charge.amo_total) : '-'}</TableCell>
                        <TableCell><Typography fontWeight="bold">{charge.grand_total > 0 ? formatCurrency(charge.grand_total) : '-'}</Typography></TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><Typography fontWeight="bold">TOTAL</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">{formatCurrency(socialCharges.reduce((s, c) => s + c.cnss_total, 0))}</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">{formatCurrency(socialCharges.reduce((s, c) => s + c.income_tax_total, 0))}</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">{formatCurrency(socialCharges.reduce((s, c) => s + c.amo_total, 0))}</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold" color="primary">{formatCurrency(socialCharges.reduce((s, c) => s + c.grand_total, 0))}</Typography></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Tab 2: Salary Statistics */}
          {tabIndex === 2 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Statistiques Salariales</Typography>

              {/* Key metrics */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Salaire moyen', value: formatCurrency(salaryStats.average_salary), color: '#1976d2' },
                  { label: 'Salaire médian', value: formatCurrency(salaryStats.median_salary), color: '#4caf50' },
                  { label: 'Salaire minimum', value: formatCurrency(salaryStats.min_salary), color: '#ff9800' },
                  { label: 'Salaire maximum', value: formatCurrency(salaryStats.max_salary), color: '#9c27b0' },
                ].map((stat, idx) => (
                  <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">{stat.label}</Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* By Department */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Par département</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Département</TableCell>
                      <TableCell>Effectif</TableCell>
                      <TableCell>Salaire moyen</TableCell>
                      <TableCell>Répartition</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salaryStats.by_department.map((dept, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Typography fontWeight="medium">{dept.department}</Typography></TableCell>
                        <TableCell>{dept.count}</TableCell>
                        <TableCell>{formatCurrency(dept.average)}</TableCell>
                        <TableCell sx={{ width: '30%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(dept.count / salaryStats.by_department.reduce((s, d) => s + d.count, 0)) * 100}
                              sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption">
                              {Math.round((dept.count / salaryStats.by_department.reduce((s, d) => s + d.count, 0)) * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* By Contract Type */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Par type de contrat</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Effectif</TableCell>
                      <TableCell>Salaire moyen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salaryStats.by_contract_type.map((ct, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Chip
                            size="small"
                            label={CONTRACT_TYPE_LABELS[ct.type]}
                            sx={{ bgcolor: CONTRACT_TYPE_COLORS[ct.type], color: 'white' }}
                          />
                        </TableCell>
                        <TableCell>{ct.count}</TableCell>
                        <TableCell><Typography fontWeight="bold">{formatCurrency(ct.average)}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Paper variant="outlined" sx={{ p: 2, mt: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Masse salariale totale</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {formatCurrency(salaryStats.total_mass)}
                </Typography>
              </Paper>
            </>
          )}
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
