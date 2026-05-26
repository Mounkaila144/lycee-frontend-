'use client';

import React, { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';

import { createApiClient } from '@/shared/lib/api-client';

const api = () => createApiClient();

const formatCurrency = (n: number | string | null | undefined): string => {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat('fr-FR').format(Math.round(v)) + ' F CFA';
};

const getRateColor = (rate: number): string => (rate >= 80 ? '#4caf50' : rate >= 50 ? '#ff9800' : '#f44336');

const METHOD_LABELS: Record<string, string> = {
  cash: 'Espèces', check: 'Chèque', bank_transfer: 'Virement', card: 'Carte', online: 'En ligne', mobile_money: 'Mobile Money',
};

const yearStart = `${new Date().getFullYear()}-01-01`;
const yearEnd = `${new Date().getFullYear()}-12-31`;

export const FinanceReportsDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);

  const { data: dashResp, isLoading } = useQuery({
    queryKey: ['finance-dashboard'],
    queryFn: async () => (await api().get('/admin/finance/reports/dashboard')).data,
  });
  const dash = (dashResp as any)?.data ?? {};
  const summary = dash.summary ?? {};
  const currentMonth = dash.current_month ?? {};
  const trends: { month: string; collected: number | string }[] = dash.trends ?? [];

  const { data: pjResp } = useQuery({
    queryKey: ['finance-payment-journal'],
    queryFn: async () => (await api().get('/admin/finance/reports/payment-journal', { params: { start_date: yearStart, end_date: yearEnd } })).data,
    enabled: tab === 0,
  });
  const payments: any[] = (pjResp as any)?.data?.payments ?? [];

  const { data: agingResp } = useQuery({
    queryKey: ['finance-aging'],
    queryFn: async () => (await api().get('/admin/finance/reports/aging-balance')).data,
    enabled: tab === 1,
  });
  const aging = (agingResp as any)?.data?.aging ?? {};

  const { data: unpaidResp } = useQuery({
    queryKey: ['finance-unpaid'],
    queryFn: async () => (await api().get('/admin/finance/reports/unpaid-statements')).data,
    enabled: tab === 2,
  });
  const statements: any[] = (unpaidResp as any)?.data?.statements ?? [];

  const { data: cfResp } = useQuery({
    queryKey: ['finance-cashflow'],
    queryFn: async () => (await api().get('/admin/finance/reports/cash-flow-forecast')).data,
    enabled: tab === 3,
  });
  const forecast: any[] = (cfResp as any)?.data?.forecast ?? [];

  const maxTrend = useMemo(() => Math.max(1, ...trends.map(t => Number(t.collected))), [trends]);

  const cards = [
    { label: 'Recettes totales', value: formatCurrency(summary.total_paid), color: '#4caf50' },
    { label: 'Créances en cours', value: formatCurrency(summary.total_outstanding), color: '#f44336' },
    { label: 'Taux de recouvrement', value: `${Number(summary.collection_rate ?? 0)}%`, color: getRateColor(Number(summary.collection_rate ?? 0)) },
    { label: 'Encaissé ce mois', value: formatCurrency(currentMonth.collected), color: '#1976d2' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Rapports Financiers</Typography>

      {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}

      {!isLoading && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {cards.map((c, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card><CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: c.color }}>{c.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                </CardContent></Card>
              </Grid>
            ))}
          </Grid>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Recettes Mensuelles</Typography>
              <Grid container spacing={1}>
                {trends.map((t, idx) => (
                  <Grid key={idx} size={{ xs: 6, sm: 3, md: 1 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <Box sx={{ width: 18, bgcolor: 'primary.main', borderRadius: 1, height: `${(Number(t.collected) / maxTrend) * 100}%`, minHeight: 2 }} />
                      </Box>
                      <Typography variant="caption" display="block" color="text.secondary">{t.month}</Typography>
                      <Typography variant="caption" display="block" fontWeight="bold">{Number(t.collected) > 0 ? formatCurrency(t.collected) : '—'}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Journal des paiements" />
                <Tab label="Balance âgée" />
                <Tab label="États des impayés" />
                <Tab label="Prévision de trésorerie" />
              </Tabs>

              {tab === 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead><TableRow>
                      <TableCell>Date</TableCell><TableCell>Reçu</TableCell><TableCell>Élève</TableCell><TableCell>Méthode</TableCell><TableCell align="right">Montant</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {payments.length === 0 && <TableRow><TableCell colSpan={5}><Alert severity="info">Aucun paiement sur la période.</Alert></TableCell></TableRow>}
                      {payments.map(p => (
                        <TableRow key={p.id} hover>
                          <TableCell>{new Date(p.payment_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>{p.receipt_number}</TableCell>
                          <TableCell>{p.invoice?.student ? `${p.invoice.student.lastname} ${p.invoice.student.firstname}` : '—'}</TableCell>
                          <TableCell>{METHOD_LABELS[p.payment_method] ?? p.payment_method}</TableCell>
                          <TableCell align="right">{formatCurrency(p.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {tab === 1 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Tranche d&apos;ancienneté</TableCell><TableCell align="right">Factures</TableCell><TableCell align="right">Montant</TableCell></TableRow></TableHead>
                    <TableBody>
                      {[['current', 'Non échu'], ['0-30', '0–30 jours'], ['31-60', '31–60 jours'], ['61-90', '61–90 jours'], ['91-120', '91–120 jours'], ['120+', '+120 jours']].map(([key, label]) => (
                        <TableRow key={key} hover>
                          <TableCell>{label}</TableCell>
                          <TableCell align="right">{aging[key]?.count ?? 0}</TableCell>
                          <TableCell align="right">{formatCurrency(aging[key]?.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {tab === 2 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Élève</TableCell><TableCell align="right">Factures</TableCell><TableCell>Échéance la plus ancienne</TableCell><TableCell align="right">Dette</TableCell></TableRow></TableHead>
                    <TableBody>
                      {statements.length === 0 && <TableRow><TableCell colSpan={4}><Alert severity="success">Aucun impayé.</Alert></TableCell></TableRow>}
                      {statements.map((s, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{s.student?.matricule} — {s.student?.lastname} {s.student?.firstname}</TableCell>
                          <TableCell align="right">{s.invoices_count}</TableCell>
                          <TableCell>{s.oldest_due_date}</TableCell>
                          <TableCell align="right">{formatCurrency(s.total_debt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {tab === 3 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Mois</TableCell><TableCell align="right">Encaissements prévus</TableCell><TableCell>Confiance</TableCell></TableRow></TableHead>
                    <TableBody>
                      {forecast.map((f, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{f.month}</TableCell>
                          <TableCell align="right">{formatCurrency(f.expected_collections)}</TableCell>
                          <TableCell><Chip size="small" label={f.confidence} color={f.confidence === 'high' ? 'success' : f.confidence === 'medium' ? 'warning' : 'default'} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};
