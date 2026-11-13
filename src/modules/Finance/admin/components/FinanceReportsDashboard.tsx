'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
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
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { useTenant } from '@/shared/lib/tenant-context';

import type { AgingBucketKey, PaymentMethod, ReportAmount } from '../../types';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS } from '../../types';
import {
  useFinanceDashboard,
  usePaymentJournal,
  useAgingBalance,
  useUnpaidStatements,
  useCashFlowForecast,
  useExportAccounting,
} from '../hooks/useFinanceReports';

const AGING_BUCKETS: Array<{ key: AgingBucketKey; label: string; color: string }> = [
  { key: 'current', label: 'Non échu', color: '#4caf50' },
  { key: '0-30', label: '0-30 jours', color: '#8bc34a' },
  { key: '31-60', label: '31-60 jours', color: '#ff9800' },
  { key: '61-90', label: '61-90 jours', color: '#f57c00' },
  { key: '91-120', label: '91-120 jours', color: '#f44336' },
  { key: '120+', label: '+120 jours', color: '#d32f2f' },
];

const CONFIDENCE_LABELS: Record<string, { label: string; color: 'success' | 'warning' | 'default' }> = {
  high: { label: 'Élevée', color: 'success' },
  medium: { label: 'Moyenne', color: 'warning' },
  low: { label: 'Faible', color: 'default' },
};

const toNumber = (value: ReportAmount | null | undefined): number => Number(value ?? 0) || 0;

const formatCurrency = (amount: ReportAmount | null | undefined): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(
    toNumber(amount),
  );

const methodLabel = (method: string): string => PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method;

const methodColor = (method: string): string => PAYMENT_METHOD_COLORS[method as PaymentMethod] ?? '#757575';

const getRateColor = (rate: number): string => {
  if (rate >= 80) return '#4caf50';
  if (rate >= 60) return '#ff9800';

  return '#f44336';
};

const isoDate = (date: Date): string => date.toISOString().slice(0, 10);

const QueryState: React.FC<{ isLoading: boolean; error: unknown; isEmpty?: boolean; emptyLabel?: string }> = ({
  isLoading,
  error,
  isEmpty,
  emptyLabel,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Impossible de charger ce rapport.</Alert>;
  }

  if (isEmpty) {
    return <Alert severity="info">{emptyLabel ?? 'Aucune donnée.'}</Alert>;
  }

  return null;
};

export const FinanceReportsDashboard: React.FC = () => {
  const { tenantId } = useTenant();
  const tenant = tenantId || undefined;

  const today = new Date();
  const [tab, setTab] = useState(0);
  const [startDate, setStartDate] = useState(isoDate(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [endDate, setEndDate] = useState(isoDate(today));

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const dashboard = useFinanceDashboard(undefined, tenant);
  const journal = usePaymentJournal({ start_date: startDate, end_date: endDate }, tenant);
  const aging = useAgingBalance(tenant);
  const unpaid = useUnpaidStatements(undefined, tenant);
  const cashFlow = useCashFlowForecast(6, tenant);
  const exportMutation = useExportAccounting(tenant);

  const summary = dashboard.data?.summary;
  const trends = dashboard.data?.trends ?? [];
  const maxTrend = Math.max(1, ...trends.map((t) => toNumber(t.collected)));
  const collectionRate = Number(summary?.collection_rate ?? 0);

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({ start_date: startDate, end_date: endDate });
      const header = ['date', 'reference', 'compte_debit', 'compte_credit', 'montant', 'description', 'matricule'];

      const rows = result.entries.map((e) =>
        [e.date, e.reference, e.account_debit, e.account_credit, e.amount, e.description, e.student_matricule ?? '']
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(';'),
      );

      const blob = new Blob([[header.join(';'), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `export_comptable_${startDate}_${endDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: `Export comptable généré (${result.summary.total_entries} écritures)`, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: "Échec de l'export comptable", severity: 'error' });
    }
  };

  const agingTotal = toNumber(aging.data?.total_outstanding);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Rapports Financiers
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            type="date"
            size="small"
            label="Du"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            size="small"
            label="Au"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="outlined" onClick={handleExport} disabled={exportMutation.isPending || !startDate || !endDate}>
            Export comptable (CSV)
          </Button>
        </Box>
      </Box>

      {/* Treasury Dashboard */}
      <QueryState isLoading={dashboard.isLoading} error={dashboard.error} />
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total facturé', value: formatCurrency(summary.total_invoiced), color: '#1976d2' },
            { label: 'Total encaissé', value: formatCurrency(summary.total_paid), color: '#4caf50' },
            { label: 'Créances en cours', value: formatCurrency(summary.total_outstanding), color: '#f44336' },
            { label: 'Dont en retard', value: formatCurrency(summary.total_overdue), color: '#d32f2f' },
            { label: 'Taux de recouvrement', value: `${collectionRate}%`, color: getRateColor(collectionRate) },
          ].map((stat) => (
            <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color }}>
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
      )}

      {trends.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Encaissements mensuels (12 derniers mois)
            </Typography>
            <Grid container spacing={1}>
              {trends.map((entry) => (
                <Grid key={entry.month} size={{ xs: 6, sm: 4, md: 2 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {entry.month}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ color: '#1976d2' }}>
                      {formatCurrency(entry.collected)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(toNumber(entry.collected) / maxTrend) * 100}
                      sx={{ height: 6, borderRadius: 3, mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} variant="scrollable">
        <Tab label="Journal des encaissements" />
        <Tab label="Balance âgée" />
        <Tab label="États des impayés" />
        <Tab label="Prévision de trésorerie" />
      </Tabs>

      {/* Tab 0: Payment Journal */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6">Journal des encaissements</Typography>
              {journal.data && (
                <Typography variant="body2" color="text.secondary">
                  {journal.data.summary.total_count} paiement(s) — {formatCurrency(journal.data.summary.total_amount)}
                </Typography>
              )}
            </Box>
            <QueryState
              isLoading={journal.isLoading}
              error={journal.error}
              isEmpty={journal.data?.payments.length === 0}
              emptyLabel="Aucun paiement sur la période."
            />
            {journal.data && journal.data.payments.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Reçu</TableCell>
                      <TableCell>Facture</TableCell>
                      <TableCell>Élève</TableCell>
                      <TableCell>Méthode</TableCell>
                      <TableCell>Saisi par</TableCell>
                      <TableCell align="right">Montant</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {journal.data.payments.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{new Date(p.payment_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{p.receipt_number ?? p.reference_number ?? '—'}</TableCell>
                        <TableCell>{p.invoice?.invoice_number ?? '—'}</TableCell>
                        <TableCell>
                          {p.invoice?.student ? (
                            <>
                              <Typography variant="body2" fontWeight="medium">
                                {p.invoice.student.firstname} {p.invoice.student.lastname}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {p.invoice.student.matricule}
                              </Typography>
                            </>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={methodLabel(p.payment_method)}
                            sx={{ bgcolor: methodColor(p.payment_method), color: 'white' }}
                          />
                        </TableCell>
                        <TableCell>
                          {p.recorded_by
                            ? `${p.recorded_by.firstname ?? ''} ${p.recorded_by.lastname ?? ''}`.trim() || p.recorded_by.username
                            : '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="success.main" fontWeight="bold">
                            {formatCurrency(p.amount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Aging Balance */}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Balance âgée des créances
            </Typography>
            <QueryState isLoading={aging.isLoading} error={aging.error} />
            {aging.data && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tranche</TableCell>
                      <TableCell align="center">Factures</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell>Répartition</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {AGING_BUCKETS.map(({ key, label, color }) => {
                      const bucket = aging.data.aging[key];
                      const amount = toNumber(bucket?.amount);
                      const percentage = agingTotal > 0 ? Math.round((amount / agingTotal) * 1000) / 10 : 0;

                      return (
                        <TableRow key={key} hover>
                          <TableCell>
                            <Typography fontWeight="medium">{label}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip size="small" label={bucket?.count ?? 0} />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold" sx={{ color }}>
                              {formatCurrency(amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{
                                  width: 150,
                                  height: 10,
                                  borderRadius: 5,
                                  '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 },
                                }}
                              />
                              <Typography variant="body2" fontWeight="bold" sx={{ color }}>
                                {percentage}%
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
                          {AGING_BUCKETS.reduce((sum, b) => sum + (aging.data.aging[b.key]?.count ?? 0), 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">{formatCurrency(agingTotal)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          Généré le {aging.data.generated_at}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Unpaid Statements */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6">États des impayés</Typography>
              {unpaid.data && (
                <Typography variant="body2" color="text.secondary">
                  {unpaid.data.summary.total_students} élève(s) — {formatCurrency(unpaid.data.summary.total_amount)}
                </Typography>
              )}
            </Box>
            <QueryState
              isLoading={unpaid.isLoading}
              error={unpaid.error}
              isEmpty={unpaid.data?.statements.length === 0}
              emptyLabel="Aucun impayé."
            />
            {unpaid.data && unpaid.data.statements.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Élève</TableCell>
                      <TableCell align="center">Factures</TableCell>
                      <TableCell align="center">En retard</TableCell>
                      <TableCell>Plus ancienne échéance</TableCell>
                      <TableCell align="right">Restant dû</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unpaid.data.statements.map((entry) => {
                      const overdueCount = entry.invoices.filter((i) => i.days_overdue > 0).length;

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
                          <TableCell align="center">{entry.invoices_count}</TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={overdueCount}
                              color={overdueCount > 0 ? 'error' : 'success'}
                              variant={overdueCount > 0 ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell>{entry.oldest_due_date}</TableCell>
                          <TableCell align="right">
                            <Typography color="error.main" fontWeight="bold">
                              {formatCurrency(entry.total_debt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Cash Flow Forecast */}
      {tab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Prévision de trésorerie (6 mois)
            </Typography>
            <QueryState isLoading={cashFlow.isLoading} error={cashFlow.error} />
            {cashFlow.data && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mois</TableCell>
                      <TableCell align="right">Factures à échoir</TableCell>
                      <TableCell align="right">Échéanciers</TableCell>
                      <TableCell align="right">Moyenne historique</TableCell>
                      <TableCell>Confiance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cashFlow.data.forecast.map((entry) => {
                      const confidence = CONFIDENCE_LABELS[entry.confidence] ?? CONFIDENCE_LABELS.low;

                      return (
                        <TableRow key={entry.month} hover>
                          <TableCell>
                            <Typography fontWeight="medium">{entry.month}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="success.main" fontWeight="bold">
                              {formatCurrency(entry.expected_collections)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{formatCurrency(entry.scheduled_payments)}</TableCell>
                          <TableCell align="right">{formatCurrency(entry.historical_average)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={confidence.label} color={confidence.color} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">Total attendu</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="success.main" fontWeight="bold">
                          {formatCurrency(cashFlow.data.total_expected)}
                        </Typography>
                      </TableCell>
                      <TableCell colSpan={3} />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
