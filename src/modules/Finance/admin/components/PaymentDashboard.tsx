'use client';

import React, { useMemo, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createApiClient } from '@/shared/lib/api-client';
import { useTenant } from '@/shared/lib/tenant-context';
import { useAuthUser } from '@/shared/hooks/useAuthUser';

import { FINANCE_PAYMENT_METHOD_LABELS, ReceiptDialog, formatXof } from './ReceiptDialog';

interface PaymentListRow {
  id: number;
  invoice_id: number;
  amount: number | string;
  payment_method: string;
  payment_date: string | null;
  reference_number?: string | null;
  receipt_number?: string | null;
  notes?: string | null;
  invoice?: { id: number; invoice_number: string } | null;
  student?: { id: number; firstname: string; lastname: string; matricule: string } | null;
  recorded_by?: { id: number; firstname?: string; lastname?: string; username?: string } | number | null;
}

interface PaymentListResponse {
  data: PaymentListRow[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

interface MethodSummary {
  method: string;
  count: number;
  amount: number;
}

interface DailySummaryResponse {
  data: {
    date: string;
    total_amount: number;
    total_count: number;
    by_method: Record<string, MethodSummary> | MethodSummary[];
  };
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const recorderName = (recordedBy: PaymentListRow['recorded_by']): string => {
  if (!recordedBy || typeof recordedBy !== 'object') return '—';
  const name = `${recordedBy.firstname ?? ''} ${recordedBy.lastname ?? ''}`.trim();

  return name || recordedBy.username || '—';
};

/**
 * Paiements & reçus (Caissier / Comptable / Admin).
 *
 * Liste paginée des encaissements réels (GET /admin/finance/payments),
 * résumé journalier (GET /payments/summary/daily), reçu imprimable et
 * remboursement (réservé Administrator / Comptable côté backend).
 * L'encaissement d'une facture se fait depuis l'écran Facturation.
 */
export const PaymentDashboard: React.FC = () => {
  const { tenantId } = useTenant();
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const authUser = useAuthUser();
  const queryClient = useQueryClient();

  const roles = authUser?.roles ?? [];
  const canRefund = roles.includes('Administrator') || roles.includes('Comptable');
  const canCloseCash = roles.some(r => ['Administrator', 'Comptable', 'Caissier'].includes(r));

  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  const [summaryDate, setSummaryDate] = useState(todayIso());

  const [receiptPaymentId, setReceiptPaymentId] = useState<number | null>(null);
  const [refundPayment, setRefundPayment] = useState<PaymentListRow | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundError, setRefundError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const listParams = useMemo(() => {
    const params: Record<string, string | number> = { page: page + 1, per_page: perPage };

    if (search.trim()) params.search = search.trim();
    if (method) params.payment_method = method;

    if (startDate) {
      params.start_date = startDate;
      params.end_date = `${endDate || startDate} 23:59:59`;
    }

    if (mineOnly) params.mine = 1;

    return params;
  }, [page, perPage, search, method, startDate, endDate, mineOnly]);

  const { data: listData, isLoading, isFetching, error } = useQuery({
    queryKey: ['payments', 'list', listParams],
    queryFn: async () => {
      const res = await createApiClient(tenantId || undefined).get<PaymentListResponse>('/admin/finance/payments', {
        params: listParams,
      });

      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['payments', 'daily-summary', summaryDate],
    queryFn: async () => {
      const res = await createApiClient(tenantId || undefined).get<DailySummaryResponse>(
        '/admin/finance/payments/summary/daily',
        { params: { date: summaryDate } },
      );

      return res.data.data;
    },
  });

  const summaryByMethod = useMemo(() => {
    const raw = summaryData?.by_method ?? [];

    return (Array.isArray(raw) ? raw : Object.values(raw)).map(entry => ({
      ...entry,
      amount: Number(entry.amount),
    }));
  }, [summaryData]);

  const refundMutation = useMutation({
    mutationFn: async (payload: { id: number; amount: number; reason: string }) => {
      const res = await createApiClient(tenantId || undefined).post(`/admin/finance/payments/${payload.id}/refund`, {
        amount: payload.amount,
        reason: payload.reason,
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const payments = listData?.data ?? [];
  const total = listData?.meta?.total ?? 0;

  const openRefund = (payment: PaymentListRow) => {
    setRefundPayment(payment);
    setRefundAmount(String(Number(payment.amount)));
    setRefundReason('');
    setRefundError(null);
  };

  const submitRefund = async () => {
    if (!refundPayment) return;
    const amount = Number(refundAmount);

    if (!Number.isFinite(amount) || amount <= 0 || amount > Number(refundPayment.amount)) {
      setRefundError('Montant invalide (doit être positif et ne pas dépasser le paiement).');

      return;
    }

    if (!refundReason.trim()) {
      setRefundError('La raison du remboursement est obligatoire.');

      return;
    }

    try {
      await refundMutation.mutateAsync({ id: refundPayment.id, amount, reason: refundReason.trim() });
      setRefundPayment(null);
      setSnackbar({ open: true, message: 'Remboursement enregistré.', severity: 'success' });
    } catch (err: any) {
      setRefundError(err?.response?.data?.message || 'Erreur lors du remboursement.');
    }
  };

  const resetPage = () => setPage(0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant='h4' fontWeight='bold'>
          Paiements &amp; reçus
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canCloseCash && (
            <Button variant='outlined' onClick={() => router.push(`/${lang}/admin/finance/cashier-close`)}>
              Clôture de caisse
            </Button>
          )}
          <Button variant='contained' onClick={() => router.push(`/${lang}/admin/finance/invoices`)}>
            Encaisser une facture
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: `Encaissé le ${summaryData?.date ?? '…'}`, value: formatXof(summaryData?.total_amount ?? 0), color: '#4caf50' },
          { label: 'Paiements du jour', value: summaryData?.total_count ?? 0, color: '#1976d2' },
          { label: 'Paiements (filtre courant)', value: total, color: '#9c27b0' },
        ].map(stat => (
          <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h5' fontWeight='bold' sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label='Liste des paiements' />
        <Tab label='Résumé journalier' />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label='Rechercher (matricule, nom, n° reçu, référence)'
                  size='small'
                  fullWidth
                  value={search}
                  onChange={e => { setSearch(e.target.value); resetPage(); }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <FormControl size='small' fullWidth>
                  <InputLabel>Mode</InputLabel>
                  <Select label='Mode' value={method} onChange={e => { setMethod(e.target.value); resetPage(); }}>
                    <MenuItem value=''>Tous</MenuItem>
                    {Object.entries(FINANCE_PAYMENT_METHOD_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <TextField
                  label='Du'
                  type='date'
                  size='small'
                  fullWidth
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); resetPage(); }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <TextField
                  label='Au'
                  type='date'
                  size='small'
                  fullWidth
                  value={endDate}
                  onChange={e => { setEndDate(e.target.value); resetPage(); }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControlLabel
                  control={<Checkbox checked={mineOnly} onChange={e => { setMineOnly(e.target.checked); resetPage(); }} />}
                  label='Mes encaissements'
                />
              </Grid>
            </Grid>

            {error instanceof Error && <Alert severity='error' sx={{ mb: 2 }}>Erreur lors du chargement des paiements.</Alert>}
            {isFetching && !isLoading && <LinearProgress sx={{ mb: 1 }} />}

            {isLoading ? (
              <Box display='flex' justifyContent='center' p={4}><CircularProgress /></Box>
            ) : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>N° reçu</TableCell>
                      <TableCell>Élève</TableCell>
                      <TableCell>Facture</TableCell>
                      <TableCell align='right'>Montant</TableCell>
                      <TableCell>Mode</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Référence</TableCell>
                      <TableCell>Encaissé par</TableCell>
                      <TableCell align='center'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align='center'>
                          <Typography color='text.secondary' sx={{ py: 3 }}>Aucun paiement trouvé.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map(payment => {
                        const amount = Number(payment.amount);
                        const isRefund = amount < 0;

                        return (
                          <TableRow key={payment.id} hover>
                            <TableCell>{payment.receipt_number ?? '—'}</TableCell>
                            <TableCell>
                              <Typography fontWeight='medium'>
                                {payment.student?.firstname} {payment.student?.lastname}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>{payment.student?.matricule}</Typography>
                            </TableCell>
                            <TableCell>{payment.invoice?.invoice_number ?? `#${payment.invoice_id}`}</TableCell>
                            <TableCell align='right'>
                              <Typography fontWeight='bold' color={isRefund ? 'warning.main' : 'inherit'}>
                                {formatXof(amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip size='small' label={FINANCE_PAYMENT_METHOD_LABELS[payment.payment_method] ?? payment.payment_method} />
                              {isRefund && <Chip size='small' color='warning' label='Remboursement' sx={{ ml: 0.5 }} />}
                            </TableCell>
                            <TableCell>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('fr-FR') : '—'}</TableCell>
                            <TableCell>{payment.reference_number || '—'}</TableCell>
                            <TableCell>{recorderName(payment.recorded_by)}</TableCell>
                            <TableCell align='center'>
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Button size='small' variant='outlined' onClick={() => setReceiptPaymentId(payment.id)}>
                                  Reçu
                                </Button>
                                {canRefund && !isRefund && (
                                  <Button size='small' variant='outlined' color='secondary' onClick={() => openRefund(payment)}>
                                    Rembourser
                                  </Button>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <TablePagination
              component='div'
              count={total}
              page={page}
              rowsPerPage={perPage}
              rowsPerPageOptions={[10, 20, 50, 100]}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={e => { setPerPage(Number(e.target.value)); setPage(0); }}
              labelRowsPerPage='Lignes par page'
            />
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TextField
                  label='Date'
                  type='date'
                  size='small'
                  value={summaryDate}
                  onChange={e => setSummaryDate(e.target.value || todayIso())}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                {summaryLoading ? (
                  <Box display='flex' justifyContent='center' p={3}><CircularProgress /></Box>
                ) : (
                  <>
                    <Typography variant='h3' fontWeight='bold' sx={{ color: '#1976d2', my: 2 }}>
                      {formatXof(summaryData?.total_amount ?? 0)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {summaryData?.total_count ?? 0} paiement(s) le {summaryData?.date}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>Répartition par mode de paiement</Typography>
                {summaryByMethod.length === 0 ? (
                  <Typography color='text.secondary'>Aucun paiement ce jour.</Typography>
                ) : (
                  summaryByMethod.map(entry => {
                    const share = summaryData?.total_amount ? (entry.amount / Number(summaryData.total_amount)) * 100 : 0;

                    return (
                      <Box key={entry.method} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Chip size='small' label={FINANCE_PAYMENT_METHOD_LABELS[entry.method] ?? entry.method} />
                          <Typography variant='body2' fontWeight='bold'>
                            {formatXof(entry.amount)} ({entry.count} paiement{entry.count > 1 ? 's' : ''})
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant='determinate'
                          value={Math.max(0, Math.min(100, share))}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <ReceiptDialog paymentId={receiptPaymentId} tenantId={tenantId} onClose={() => setReceiptPaymentId(null)} />

      <Dialog open={refundPayment !== null} onClose={() => setRefundPayment(null)} maxWidth='sm' fullWidth>
        <DialogTitle>Remboursement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {refundError && <Alert severity='error'>{refundError}</Alert>}
            {refundPayment && (
              <Alert severity='info'>
                Reçu {refundPayment.receipt_number ?? `#${refundPayment.id}`} — {formatXof(refundPayment.amount)}
              </Alert>
            )}
            <TextField
              label='Montant à rembourser'
              type='number'
              fullWidth
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
            />
            <TextField
              label='Raison du remboursement'
              fullWidth
              multiline
              rows={3}
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundPayment(null)} disabled={refundMutation.isPending}>Annuler</Button>
          <Button variant='contained' color='warning' onClick={submitRefund} disabled={refundMutation.isPending}>
            {refundMutation.isPending ? 'Traitement…' : 'Rembourser'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
