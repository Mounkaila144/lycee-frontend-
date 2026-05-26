'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { createApiClient } from '@/shared/lib/api-client';

const api = () => createApiClient();

function unwrap<T>(resp: unknown): T | null {
  const r = resp as { data?: unknown };
  if (r && r.data !== undefined) return r.data as T;
  return (resp as T) ?? null;
}

const MONTH_NAMES = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const fmtMoney = (n: unknown): string => (n == null ? '—' : new Intl.NumberFormat('fr-FR').format(Math.round(Number(n))) + ' F CFA');

interface PeriodRef {
  id: number;
  period_code?: string;
  name?: string;
  year: number;
  month: number;
  status: string;
}

interface DashboardData {
  current_period: PeriodRef | null;
  recent_periods: PeriodRef[];
  statistics?: SalaryStatistics | { message: string } | null;
}

interface JournalEmployee {
  employee_code?: string;
  full_name?: string;
  department?: string | null;
  base_salary?: number;
  gross_salary?: number;
  net_salary?: number;
  earnings?: { bonuses?: number; total?: number };
  deductions?: { total?: number };
}

interface JournalData {
  period?: { name?: string; code?: string };
  summary?: { total_gross_salary?: number; total_deductions?: number; total_net_salary?: number; total_employees?: number };
  employees?: JournalEmployee[];
}

interface SocialChargesData {
  cnss?: { employee_contributions?: number; employer_contributions?: number; total?: number };
  amo?: { employee_contributions?: number; employer_contributions?: number; total?: number };
  cimr?: { employee_contributions?: number; employer_contributions?: number; total?: number };
  taxes?: { income_tax?: number; professional_tax?: number; training_tax?: number; total?: number };
  summary?: { total_employee_contributions?: number; total_employer_contributions?: number; grand_total?: number };
}

interface DeptStat { employee_count?: number; average_base_salary?: number; average_gross_salary?: number; average_net_salary?: number; total_cost?: number }

interface SalaryStatistics {
  period?: string | number;
  overview?: { total_employees?: number; total_payroll_cost?: number; average_monthly_cost?: number; total_periods?: number };
  salary_distribution?: { average_base_salary?: number; median_base_salary?: number; min_base_salary?: number; max_base_salary?: number; average_gross_salary?: number; average_net_salary?: number };
  by_department?: Record<string, DeptStat>;
  message?: string;
}

const periodRefLabel = (p: PeriodRef): string => p.name ?? `${MONTH_NAMES[p.month] ?? p.month} ${p.year}`;

export const PayrollReportsDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>('');

  const dashboardQuery = useQuery({
    queryKey: ['payroll-report-dashboard'],
    queryFn: async () => (await api().get('/admin/payroll/reports/dashboard')).data,
  });
  const dashboard = useMemo(() => unwrap<DashboardData>(dashboardQuery.data), [dashboardQuery.data]);
  const recentPeriods = dashboard?.recent_periods ?? [];

  useEffect(() => {
    if (selectedPeriodId === '' && recentPeriods.length > 0) {
      const preferred = recentPeriods.find(p => ['validated', 'paid', 'closed', 'calculated'].includes(p.status)) ?? recentPeriods[0];
      setSelectedPeriodId(preferred.id);
    }
  }, [recentPeriods, selectedPeriodId]);

  const statsQuery = useQuery({
    queryKey: ['payroll-salary-statistics'],
    queryFn: async () => (await api().get('/admin/payroll/reports/salary-statistics')).data,
  });
  const salaryStats = useMemo(() => unwrap<SalaryStatistics>(statsQuery.data), [statsQuery.data]);
  const statsUnavailable = !salaryStats || !!salaryStats.message || !salaryStats.overview;

  const journalQuery = useQuery({
    queryKey: ['payroll-journal', selectedPeriodId],
    queryFn: async () => (await api().get(`/admin/payroll/reports/payroll-journal/${selectedPeriodId}`)).data,
    enabled: tabIndex === 0 && selectedPeriodId !== '',
  });
  const journal = useMemo(() => unwrap<JournalData>(journalQuery.data), [journalQuery.data]);

  const chargesQuery = useQuery({
    queryKey: ['payroll-social-charges', selectedPeriodId],
    queryFn: async () => (await api().get(`/admin/payroll/reports/social-charges/${selectedPeriodId}`)).data,
    enabled: tabIndex === 1 && selectedPeriodId !== '',
  });
  const charges = useMemo(() => unwrap<SocialChargesData>(chargesQuery.data), [chargesQuery.data]);

  const departments = useMemo(() => {
    if (!salaryStats?.by_department) return [] as { department: string; stat: DeptStat }[];

    return Object.entries(salaryStats.by_department).map(([department, stat]) => ({ department, stat }));
  }, [salaryStats]);
  const totalHeadcount = departments.reduce((s, d) => s + Number(d.stat.employee_count ?? 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Paie & RH</Link>
        <Typography color="text.primary">Rapports RH</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Rapports & Statistiques RH</Typography>

      {dashboardQuery.isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
      {dashboardQuery.isError && <Alert severity="error" sx={{ mb: 3 }}>Impossible de charger le tableau de bord.</Alert>}

      {!dashboardQuery.isLoading && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total employés', value: salaryStats?.overview?.total_employees ?? '—', color: '#1976d2' },
            { label: 'Périodes traitées', value: salaryStats?.overview?.total_periods ?? recentPeriods.length, color: '#4caf50' },
            { label: 'Coût total paie', value: fmtMoney(salaryStats?.overview?.total_payroll_cost), color: '#ff9800' },
            { label: 'Coût mensuel moyen', value: fmtMoney(salaryStats?.overview?.average_monthly_cost), color: '#9c27b0' },
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
      )}

      <Card>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 1, flexWrap: 'wrap', gap: 1 }}>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
            <Tab label="Journal de Paie" />
            <Tab label="Charges Sociales" />
            <Tab label="Statistiques Salariales" />
          </Tabs>
          {(tabIndex === 0 || tabIndex === 1) && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Période</InputLabel>
              <Select label="Période" value={selectedPeriodId} onChange={e => setSelectedPeriodId(Number(e.target.value))}>
                {recentPeriods.map(p => <MenuItem key={p.id} value={p.id}>{periodRefLabel(p)}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        </Box>
        <CardContent>
          {tabIndex === 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Journal de Paie {journal?.period?.name ? `— ${journal.period.name}` : ''}</Typography>
              {selectedPeriodId === '' && <Alert severity="info">Sélectionnez une période.</Alert>}
              {journalQuery.isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
              {journalQuery.isError && <Alert severity="error">Impossible de charger le journal de paie.</Alert>}
              {!journalQuery.isLoading && !journalQuery.isError && journal && (
                (journal.employees?.length ?? 0) === 0 ? (
                  <Alert severity="info">Aucune ligne de paie pour cette période (paie non calculée).</Alert>
                ) : (
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
                        {journal.employees!.map((e, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell><Typography fontWeight="medium">{e.employee_code ?? '—'}</Typography></TableCell>
                            <TableCell>{e.full_name ?? '—'}</TableCell>
                            <TableCell>{fmtMoney(e.base_salary)}</TableCell>
                            <TableCell>{fmtMoney(e.earnings?.bonuses)}</TableCell>
                            <TableCell>{fmtMoney(e.gross_salary)}</TableCell>
                            <TableCell><Typography color="error">{fmtMoney(e.deductions?.total)}</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold" color="success.main">{fmtMoney(e.net_salary)}</Typography></TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell colSpan={4}><Typography fontWeight="bold">TOTAL</Typography></TableCell>
                          <TableCell><Typography fontWeight="bold">{fmtMoney(journal.summary?.total_gross_salary)}</Typography></TableCell>
                          <TableCell><Typography fontWeight="bold" color="error">{fmtMoney(journal.summary?.total_deductions)}</Typography></TableCell>
                          <TableCell><Typography fontWeight="bold" color="success.main">{fmtMoney(journal.summary?.total_net_salary)}</Typography></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              )}
            </>
          )}

          {tabIndex === 1 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Charges Sociales</Typography>
              {selectedPeriodId === '' && <Alert severity="info">Sélectionnez une période.</Alert>}
              {chargesQuery.isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
              {chargesQuery.isError && <Alert severity="error">Impossible de charger les charges sociales.</Alert>}
              {!chargesQuery.isLoading && !chargesQuery.isError && charges && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Cotisation</TableCell>
                        <TableCell>Part salarié</TableCell>
                        <TableCell>Part employeur</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { label: 'CNSS', d: charges.cnss },
                        { label: 'AMO', d: charges.amo },
                        { label: 'CIMR', d: charges.cimr },
                      ].map(row => (
                        <TableRow key={row.label} hover>
                          <TableCell><Typography fontWeight="medium">{row.label}</Typography></TableCell>
                          <TableCell>{fmtMoney(row.d?.employee_contributions)}</TableCell>
                          <TableCell>{fmtMoney(row.d?.employer_contributions)}</TableCell>
                          <TableCell><Typography fontWeight="bold">{fmtMoney(row.d?.total)}</Typography></TableCell>
                        </TableRow>
                      ))}
                      <TableRow hover>
                        <TableCell><Typography fontWeight="medium">Impôts (IR + taxes)</Typography></TableCell>
                        <TableCell>{fmtMoney(charges.taxes?.income_tax)}</TableCell>
                        <TableCell>{fmtMoney((Number(charges.taxes?.professional_tax ?? 0) + Number(charges.taxes?.training_tax ?? 0)))}</TableCell>
                        <TableCell><Typography fontWeight="bold">{fmtMoney(charges.taxes?.total)}</Typography></TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><Typography fontWeight="bold">TOTAL</Typography></TableCell>
                        <TableCell><Typography fontWeight="bold">{fmtMoney(charges.summary?.total_employee_contributions)}</Typography></TableCell>
                        <TableCell><Typography fontWeight="bold">{fmtMoney(charges.summary?.total_employer_contributions)}</Typography></TableCell>
                        <TableCell><Typography fontWeight="bold" color="primary">{fmtMoney(charges.summary?.grand_total)}</Typography></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {tabIndex === 2 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Statistiques Salariales</Typography>
              {statsQuery.isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
              {statsQuery.isError && <Alert severity="error">Impossible de charger les statistiques.</Alert>}
              {!statsQuery.isLoading && !statsQuery.isError && statsUnavailable && (
                <Alert severity="info">Aucune donnée statistique disponible (aucune période validée).</Alert>
              )}
              {!statsQuery.isLoading && !statsQuery.isError && !statsUnavailable && salaryStats && (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                      { label: 'Salaire de base moyen', value: fmtMoney(salaryStats.salary_distribution?.average_base_salary), color: '#1976d2' },
                      { label: 'Salaire de base médian', value: fmtMoney(salaryStats.salary_distribution?.median_base_salary), color: '#4caf50' },
                      { label: 'Salaire minimum', value: fmtMoney(salaryStats.salary_distribution?.min_base_salary), color: '#ff9800' },
                      { label: 'Salaire maximum', value: fmtMoney(salaryStats.salary_distribution?.max_base_salary), color: '#9c27b0' },
                    ].map((stat, idx) => (
                      <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary">{stat.label}</Typography>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Par département</Typography>
                  {departments.length === 0 ? (
                    <Alert severity="info">Aucune répartition par département.</Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Département</TableCell>
                            <TableCell>Effectif</TableCell>
                            <TableCell>Salaire brut moyen</TableCell>
                            <TableCell>Coût total</TableCell>
                            <TableCell>Répartition</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {departments.map(({ department, stat }, idx) => (
                            <TableRow key={idx}>
                              <TableCell><Typography fontWeight="medium">{department}</Typography></TableCell>
                              <TableCell>{stat.employee_count ?? 0}</TableCell>
                              <TableCell>{fmtMoney(stat.average_gross_salary)}</TableCell>
                              <TableCell>{fmtMoney(stat.total_cost)}</TableCell>
                              <TableCell sx={{ width: '25%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={totalHeadcount > 0 ? (Number(stat.employee_count ?? 0) / totalHeadcount) * 100 : 0}
                                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                                  />
                                  <Typography variant="caption">
                                    {totalHeadcount > 0 ? Math.round((Number(stat.employee_count ?? 0) / totalHeadcount) * 100) : 0}%
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  <Paper variant="outlined" sx={{ p: 2, mt: 1, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Masse salariale totale (coût)</Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {fmtMoney(salaryStats.overview?.total_payroll_cost)}
                    </Typography>
                  </Paper>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
