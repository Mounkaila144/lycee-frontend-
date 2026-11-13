'use client';

import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { usePayrollJournal, usePayrollPeriods, useSalaryStatistics, useSocialCharges } from '../hooks';
import { formatCurrency, getPayrollErrorMessage } from '../utils/payrollFormatters';
import type { Money } from '../../types';

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Card>
    <CardContent sx={{ textAlign: 'center' }}>
      <Typography variant="h6" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

export const PayrollReportsDashboard: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [periodId, setPeriodId] = useState<number | undefined>();

  const statistics = useSalaryStatistics({ year });
  const { data: periods = [] } = usePayrollPeriods();
  const calculatedPeriods = periods.filter(period => !['draft', 'in_progress'].includes(period.status));
  const journal = usePayrollJournal(periodId);
  const charges = useSocialCharges(periodId);

  const stats = statistics.data;
  const hasStats = !!stats?.overview;

  const chargeRows: { label: string; employee: Money; employer: Money; total: Money }[] = charges.data
    ? [
        {
          label: 'CNSS',
          employee: charges.data.cnss.employee_contributions,
          employer: charges.data.cnss.employer_contributions,
          total: charges.data.cnss.total,
        },
        {
          label: 'AMO',
          employee: charges.data.amo.employee_contributions,
          employer: charges.data.amo.employer_contributions,
          total: charges.data.amo.total,
        },
        {
          label: 'CIMR',
          employee: charges.data.cimr.employee_contributions,
          employer: charges.data.cimr.employer_contributions,
          total: charges.data.cimr.total,
        },
      ]
    : [];

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight="bold">
          Rapports RH
        </Typography>
        <TextField
          size="small"
          type="number"
          label="Année"
          value={year}
          onChange={event => setYear(Number(event.target.value))}
          sx={{ width: 120 }}
        />
      </Box>

      {/* Statistiques salariales annuelles */}
      {statistics.isLoading && <CircularProgress />}
      {statistics.isError && (
        <Alert severity="error">{getPayrollErrorMessage(statistics.error, 'Impossible de charger les statistiques')}</Alert>
      )}
      {!statistics.isLoading && !hasStats && (
        <Alert severity="info">{stats?.message ?? 'Aucune donnée disponible'} pour {year}.</Alert>
      )}
      {hasStats && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Employés payés" value={String(stats.overview?.total_employees ?? 0)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Coût total de la paie" value={formatCurrency(stats.overview?.total_payroll_cost)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Coût mensuel moyen" value={formatCurrency(stats.overview?.average_monthly_cost)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Salaire net moyen" value={formatCurrency(stats.salary_distribution?.average_net_salary)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Salaire de base médian" value={formatCurrency(stats.salary_distribution?.median_base_salary)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Salaire de base min" value={formatCurrency(stats.salary_distribution?.min_base_salary)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Salaire de base max" value={formatCurrency(stats.salary_distribution?.max_base_salary)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Taux de retenues" value={`${Number(stats.deductions?.deduction_rate ?? 0)} %`} />
          </Grid>
        </Grid>
      )}

      {/* Rapports par période */}
      <Card>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">Journal de paie et charges sociales</Typography>
          <TextField
            select
            size="small"
            label="Période calculée"
            value={periodId ?? ''}
            onChange={event => setPeriodId(Number(event.target.value))}
            sx={{ maxWidth: 320 }}
          >
            {calculatedPeriods.length === 0 && <MenuItem disabled>Aucune période calculée</MenuItem>}
            {calculatedPeriods.map(period => (
              <MenuItem key={period.id} value={period.id}>
                {period.name || period.period_code}
              </MenuItem>
            ))}
          </TextField>

          {periodId && (journal.isLoading || charges.isLoading) && <CircularProgress />}
          {journal.isError && <Alert severity="error">{getPayrollErrorMessage(journal.error)}</Alert>}

          {journal.data && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Employé</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell align="right">Base</TableCell>
                    <TableCell align="right">Brut</TableCell>
                    <TableCell align="right">Retenues</TableCell>
                    <TableCell align="right">Net</TableCell>
                    <TableCell align="right">Coût total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {journal.data.employees.map(row => (
                    <TableRow key={row.employee_code}>
                      <TableCell>{row.employee_code}</TableCell>
                      <TableCell>{row.full_name}</TableCell>
                      <TableCell>{row.department || '—'}</TableCell>
                      <TableCell align="right">{formatCurrency(row.base_salary)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.gross_salary)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.deductions?.total)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.net_salary)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.total_cost)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4}>
                      <strong>Totaux ({journal.data.summary.total_employees ?? 0} employés)</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(journal.data.summary.total_gross_salary)}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(journal.data.summary.total_deductions)}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(journal.data.summary.total_net_salary)}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(journal.data.summary.total_cost)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {charges.data && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Charges sociales et fiscales
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Organisme</TableCell>
                    <TableCell align="right">Part salariale</TableCell>
                    <TableCell align="right">Part patronale</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chargeRows.map(row => (
                    <TableRow key={row.label}>
                      <TableCell>{row.label}</TableCell>
                      <TableCell align="right">{formatCurrency(row.employee)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.employer)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.total)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>Impôts et taxes</TableCell>
                    <TableCell align="right">{formatCurrency(charges.data.taxes.income_tax)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(
                        Number(charges.data.taxes.professional_tax) + Number(charges.data.taxes.training_tax),
                      )}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(charges.data.taxes.total)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Total général</strong>
                    </TableCell>
                    <TableCell colSpan={3} align="right">
                      <strong>{formatCurrency(charges.data.summary.grand_total)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
