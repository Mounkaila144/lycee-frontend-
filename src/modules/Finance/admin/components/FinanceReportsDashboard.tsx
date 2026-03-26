'use client';

import React, { useState } from 'react';

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
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import type { PaymentMethod } from '../../types';

import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_DASHBOARD = {
  total_revenue: 3250000,
  total_outstanding: 1425000,
  collection_rate: 69.5,
  monthly_revenue: [
    { month: 'Jan 2026', amount: 850000 },
    { month: 'Fév 2026', amount: 720000 },
    { month: 'Mar 2026', amount: 680000 },
    { month: 'Avr 2026', amount: 450000 },
    { month: 'Mai 2026', amount: 350000 },
    { month: 'Juin 2026', amount: 200000 },
  ],
};

const DEMO_PAYMENT_JOURNAL = [
  { id: 1, date: '2026-03-25', reference: 'PAY-2026-0006', student_name: 'Fatima Ousmane', description: 'Paiement partiel scolarité', debit: 0, credit: 100000, balance: 3250000, method: 'mobile_money' as PaymentMethod },
  { id: 2, date: '2026-03-25', reference: 'PAY-2026-0003', student_name: 'Ibrahim Mahamadou', description: 'Paiement partiel espèces', debit: 0, credit: 200000, balance: 3150000, method: 'cash' as PaymentMethod },
  { id: 3, date: '2026-03-20', reference: 'PAY-2026-0005', student_name: 'Aissatou Boubacar', description: 'Paiement échoué - fonds insuffisants', debit: 525000, credit: 0, balance: 2950000, method: 'bank_transfer' as PaymentMethod },
  { id: 4, date: '2026-03-01', reference: 'PAY-2026-0002', student_name: 'Fatima Ousmane', description: 'Première tranche scolarité', debit: 0, credit: 275000, balance: 2950000, method: 'mobile_money' as PaymentMethod },
  { id: 5, date: '2026-02-20', reference: 'RFD-2026-0001', student_name: 'Amadou Diallo', description: 'Remboursement double paiement', debit: 50000, credit: 0, balance: 2675000, method: 'check' as PaymentMethod },
  { id: 6, date: '2026-02-15', reference: 'PAY-2026-0001', student_name: 'Amadou Diallo', description: 'Paiement intégral scolarité', debit: 0, credit: 575000, balance: 2725000, method: 'bank_transfer' as PaymentMethod },
];

const DEMO_AGING_BALANCE = [
  { range: '0-30 jours', count: 12, amount: 450000, percentage: 31.6 },
  { range: '31-60 jours', count: 8, amount: 380000, percentage: 26.7 },
  { range: '61-90 jours', count: 5, amount: 325000, percentage: 22.8 },
  { range: '91-180 jours', count: 3, amount: 170000, percentage: 11.9 },
  { range: '+180 jours', count: 2, amount: 100000, percentage: 7.0 },
];

const DEMO_UNPAID_STATEMENTS = [
  { student: { id: 3, firstname: 'Ibrahim', lastname: 'Mahamadou', matricule: 'ETU-2026-003' }, total_invoiced: 625000, total_paid: 200000, total_remaining: 425000, overdue_invoices: 1, oldest_due_date: '2026-02-28' },
  { student: { id: 4, firstname: 'Aissatou', lastname: 'Boubacar', matricule: 'ETU-2026-004' }, total_invoiced: 525000, total_paid: 0, total_remaining: 525000, overdue_invoices: 1, oldest_due_date: '2026-05-15' },
  { student: { id: 2, firstname: 'Fatima', lastname: 'Ousmane', matricule: 'ETU-2026-002' }, total_invoiced: 550000, total_paid: 375000, total_remaining: 175000, overdue_invoices: 0, oldest_due_date: '2026-04-15' },
  { student: { id: 8, firstname: 'Abdoulaye', lastname: 'Issa', matricule: 'ETU-2026-008' }, total_invoiced: 500000, total_paid: 100000, total_remaining: 400000, overdue_invoices: 1, oldest_due_date: '2026-03-01' },
  { student: { id: 9, firstname: 'Mariama', lastname: 'Adamou', matricule: 'ETU-2026-009' }, total_invoiced: 575000, total_paid: 300000, total_remaining: 275000, overdue_invoices: 1, oldest_due_date: '2026-03-15' },
];

const DEMO_CASH_FLOW = [
  { month: 'Avr 2026', expected_income: 1200000, actual_income: 0, expected_expenses: 300000, net_flow: 900000 },
  { month: 'Mai 2026', expected_income: 800000, actual_income: 0, expected_expenses: 250000, net_flow: 550000 },
  { month: 'Juin 2026', expected_income: 600000, actual_income: 0, expected_expenses: 200000, net_flow: 400000 },
  { month: 'Juil 2026', expected_income: 400000, actual_income: 0, expected_expenses: 150000, net_flow: 250000 },
  { month: 'Août 2026', expected_income: 200000, actual_income: 0, expected_expenses: 100000, net_flow: 100000 },
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

const getRateColor = (rate: number): string => {
  if (rate >= 80) return '#4caf50';
  if (rate >= 60) return '#ff9800';

  return '#f44336';
};

export const FinanceReportsDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Comptabilit&eacute;</Link>
        <Typography color="text.primary">Rapports Financiers</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Rapports Financiers
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setSnackbar({ open: true, message: 'Export comptable généré', severity: 'success' })}
        >
          Export comptable
        </Button>
      </Box>

      {/* Treasury Dashboard */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Recettes totales', value: formatCurrency(DEMO_DASHBOARD.total_revenue), color: '#4caf50' },
          { label: 'Créances en cours', value: formatCurrency(DEMO_DASHBOARD.total_outstanding), color: '#f44336' },
          { label: 'Taux de recouvrement', value: `${DEMO_DASHBOARD.collection_rate}%`, color: getRateColor(DEMO_DASHBOARD.collection_rate) },
          { label: 'Recette mensuelle moy.', value: formatCurrency(Math.round(DEMO_DASHBOARD.total_revenue / 6)), color: '#1976d2' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
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

      {/* Monthly Revenue Chart (as table) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Recettes Mensuelles</Typography>
          <Grid container spacing={1}>
            {DEMO_DASHBOARD.monthly_revenue.map((entry, idx) => {
              const maxAmount = Math.max(...DEMO_DASHBOARD.monthly_revenue.map(e => e.amount));

              return (
                <Grid key={idx} size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">{entry.month}</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#1976d2' }}>
                      {formatCurrency(entry.amount)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(entry.amount / maxAmount) * 100}
                      sx={{
                        height: 8, borderRadius: 4, mt: 1,
                        '& .MuiLinearProgress-bar': { bgcolor: '#1976d2', borderRadius: 4 },
                      }}
                    />
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Journal des paiements" />
        <Tab label="Balance &acirc;g&eacute;e" />
        <Tab label="&Eacute;tats des impay&eacute;s" />
        <Tab label="Pr&eacute;vision de tr&eacute;sorerie" />
      </Tabs>

      {/* Tab 0: Payment Journal */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Journal des Paiements</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>R&eacute;f&eacute;rence</TableCell>
                    <TableCell>&Eacute;tudiant</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>M&eacute;thode</TableCell>
                    <TableCell align="right">D&eacute;bit</TableCell>
                    <TableCell align="right">Cr&eacute;dit</TableCell>
                    <TableCell align="right">Solde</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_PAYMENT_JOURNAL.map(entry => (
                    <TableRow key={entry.id} hover>
                      <TableCell>{new Date(entry.date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{entry.reference}</Typography>
                      </TableCell>
                      <TableCell>{entry.student_name}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{entry.description}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={PAYMENT_METHOD_LABELS[entry.method]}
                          sx={{ bgcolor: PAYMENT_METHOD_COLORS[entry.method], color: 'white' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {entry.debit > 0 ? (
                          <Typography color="error.main" fontWeight="bold">{formatCurrency(entry.debit)}</Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {entry.credit > 0 ? (
                          <Typography color="success.main" fontWeight="bold">{formatCurrency(entry.credit)}</Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">{formatCurrency(entry.balance)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Aging Balance */}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Balance &Acirc;g&eacute;e des Cr&eacute;ances</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tranche</TableCell>
                    <TableCell align="center">Nombre de factures</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell>R&eacute;partition</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_AGING_BALANCE.map((entry, idx) => {
                    const color = idx === 0 ? '#4caf50' : idx === 1 ? '#8bc34a' : idx === 2 ? '#ff9800' : idx === 3 ? '#f44336' : '#d32f2f';

                    return (
                      <TableRow key={entry.range} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{entry.range}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={entry.count} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" sx={{ color }}>{formatCurrency(entry.amount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={entry.percentage}
                              sx={{
                                width: 150, height: 10, borderRadius: 5,
                                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 },
                              }}
                            />
                            <Typography variant="body2" fontWeight="bold" sx={{ color }}>
                              {entry.percentage}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">Total</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold">
                        {DEMO_AGING_BALANCE.reduce((sum, e) => sum + e.count, 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {formatCurrency(DEMO_AGING_BALANCE.reduce((sum, e) => sum + e.amount, 0))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">100%</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Unpaid Statements */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>&Eacute;tats des Impay&eacute;s</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>&Eacute;tudiant</TableCell>
                    <TableCell align="right">Total factur&eacute;</TableCell>
                    <TableCell align="right">Total pay&eacute;</TableCell>
                    <TableCell align="right">Restant</TableCell>
                    <TableCell align="center">Factures en retard</TableCell>
                    <TableCell>Plus ancienne &eacute;ch&eacute;ance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_UNPAID_STATEMENTS.map(entry => {
                    const paymentRate = entry.total_invoiced > 0 ? (entry.total_paid / entry.total_invoiced) * 100 : 0;

                    return (
                      <TableRow key={entry.student.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">
                            {entry.student.firstname} {entry.student.lastname}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.student.matricule}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography>{formatCurrency(entry.total_invoiced)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="success.main">{formatCurrency(entry.total_paid)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="error.main" fontWeight="bold">
                            {formatCurrency(entry.total_remaining)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={paymentRate}
                            sx={{
                              width: 80, height: 4, borderRadius: 2, mt: 0.5,
                              '& .MuiLinearProgress-bar': { bgcolor: getRateColor(paymentRate), borderRadius: 2 },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {entry.overdue_invoices > 0 ? (
                            <Chip size="small" label={entry.overdue_invoices} color="error" />
                          ) : (
                            <Chip size="small" label="0" color="success" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(entry.oldest_due_date).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Cash Flow Forecast */}
      {tab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Pr&eacute;vision de Tr&eacute;sorerie</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mois</TableCell>
                    <TableCell align="right">Recettes pr&eacute;vues</TableCell>
                    <TableCell align="right">D&eacute;penses pr&eacute;vues</TableCell>
                    <TableCell align="right">Flux net</TableCell>
                    <TableCell>Projection</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_CASH_FLOW.map(entry => {
                    const maxFlow = Math.max(...DEMO_CASH_FLOW.map(e => e.expected_income));

                    return (
                      <TableRow key={entry.month} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{entry.month}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="success.main" fontWeight="bold">
                            {formatCurrency(entry.expected_income)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="error.main">
                            {formatCurrency(entry.expected_expenses)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" sx={{ color: entry.net_flow >= 0 ? '#4caf50' : '#f44336' }}>
                            {formatCurrency(entry.net_flow)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={(entry.expected_income / maxFlow) * 100}
                            sx={{
                              width: 120, height: 8, borderRadius: 4,
                              '& .MuiLinearProgress-bar': { bgcolor: '#1976d2', borderRadius: 4 },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell><Typography fontWeight="bold">Total</Typography></TableCell>
                    <TableCell align="right">
                      <Typography color="success.main" fontWeight="bold">
                        {formatCurrency(DEMO_CASH_FLOW.reduce((sum, e) => sum + e.expected_income, 0))}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="error.main" fontWeight="bold">
                        {formatCurrency(DEMO_CASH_FLOW.reduce((sum, e) => sum + e.expected_expenses, 0))}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="success.main">
                        {formatCurrency(DEMO_CASH_FLOW.reduce((sum, e) => sum + e.net_flow, 0))}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
