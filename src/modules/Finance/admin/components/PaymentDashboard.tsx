'use client';

import React, { useMemo, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import { createApiClient } from '@/shared/lib/api-client';

const api = () => createApiClient();

const formatCurrency = (n: number | string | null | undefined): string => {
  const v = Number(n ?? 0);

  return new Intl.NumberFormat('fr-FR').format(Math.round(v)) + ' F CFA';
};

const METHOD_LABELS: Record<string, string> = {
  cash: 'Espèces',
  check: 'Chèque',
  bank_transfer: 'Virement',
  card: 'Carte',
  online: 'En ligne',
  mobile_money: 'Mobile Money',
};

const METHOD_COLORS: Record<string, string> = {
  cash: '#4caf50',
  check: '#795548',
  bank_transfer: '#1976d2',
  card: '#9c27b0',
  online: '#00bcd4',
  mobile_money: '#ff9800',
};

const studentName = (s: any): string => (s ? `${s.firstname ?? ''} ${s.lastname ?? ''}`.trim() || '—' : '—');

const firstError = (e: any): string | undefined => {
  const errors = e?.response?.data?.errors as Record<string, string[]> | undefined;

  if (errors) {
    const first = Object.values(errors)[0];

    if (Array.isArray(first) && first.length) {
      return first[0];
    }
  }

  return undefined;
};

const today = () => new Date().toISOString().slice(0, 10);

type ApiPayment = {
  id: number;
  invoice_id: number;
  amount: number | string;
  payment_method: string;
  payment_date: string;
  reference_number: string | null;
  receipt_number: string | null;
  notes: string | null;
  invoice?: { id: number; invoice_number?: string } | null;
  student?: { id: number; firstname?: string; lastname?: string; matricule?: string } | null;
};

type ApiInvoice = {
  id: number;
  invoice_number: string;
  total_amount: number | string;
  paid_amount: number | string;
  status: string;
  student?: { firstname?: string; lastname?: string; matricule?: string } | null;
};

export const PaymentDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ApiPayment | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Record-payment form state
  const [form, setForm] = useState<{ invoice_id: string; amount: string; payment_method: string; reference_number: string; payment_date: string; notes: string }>({
    invoice_id: '', amount: '', payment_method: 'cash', reference_number: '', payment_date: today(), notes: '',
  });

  // Refund form state
  const [refundForm, setRefundForm] = useState<{ amount: string; reason: string }>({ amount: '', reason: '' });

  const { data: paymentsResp, isLoading, isError } = useQuery({
    queryKey: ['finance-payments'],
    queryFn: async () => (await api().get('/admin/finance/payments', { params: { per_page: 100 } })).data,
  });

  const payments: ApiPayment[] = (paymentsResp as any)?.data ?? [];

  const { data: summaryResp } = useQuery({
    queryKey: ['finance-payments-daily', today()],
    queryFn: async () => (await api().get('/admin/finance/payments/summary/daily', { params: { date: today() } })).data,
    enabled: tab === 1,
  });

  const summary = (summaryResp as any)?.data ?? {};

  const byMethod: { method: string; count: number; amount: number | string }[] = useMemo(() => {
    const bm = summary.by_method;

    if (!bm) {
      return [];
    }

    return Array.isArray(bm) ? bm : Object.values(bm);
  }, [summary]);

  const { data: invoicesResp } = useQuery({
    queryKey: ['finance-invoices-select'],
    queryFn: async () => (await api().get('/admin/finance/invoices', { params: { per_page: 100 } })).data,
    enabled: paymentOpen,
  });

  const invoices: ApiInvoice[] = (invoicesResp as any)?.data ?? [];

  const recordPayment = useMutation({
    mutationFn: async () => (await api().post('/admin/finance/payments', {
      invoice_id: Number(form.invoice_id),
      amount: Number(form.amount),
      payment_method: form.payment_method,
      payment_date: form.payment_date || null,
      reference_number: form.reference_number || null,
      notes: form.notes || null,
    })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-payments-daily'] });
      setPaymentOpen(false);
      setForm({ invoice_id: '', amount: '', payment_method: 'cash', reference_number: '', payment_date: today(), notes: '' });
      setSnackbar({ open: true, message: 'Paiement enregistré avec succès', severity: 'success' });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message || firstError(e) || 'Erreur lors de l\'enregistrement';

      setSnackbar({ open: true, message: String(msg), severity: 'error' });
    },
  });

  const refundPayment = useMutation({
    mutationFn: async () => (await api().post(`/admin/finance/payments/${selectedPayment?.id}/refund`, {
      amount: Number(refundForm.amount),
      reason: refundForm.reason,
    })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-payments'] });
      setRefundOpen(false);
      setSelectedPayment(null);
      setRefundForm({ amount: '', reason: '' });
      setSnackbar({ open: true, message: 'Remboursement effectué avec succès', severity: 'success' });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message || 'Erreur lors du remboursement';

      setSnackbar({ open: true, message: String(msg), severity: 'error' });
    },
  });

  const totalReceived = useMemo(() => payments.reduce((sum, p) => sum + Number(p.amount), 0), [payments]);
  const paymentCount = payments.length;

  const todayTotal = useMemo(
    () => payments.filter(p => String(p.payment_date).slice(0, 10) === today()).reduce((s, p) => s + Number(p.amount), 0),
    [payments],
  );

  const distinctStudents = useMemo(() => new Set(payments.map(p => p.student?.id ?? p.invoice_id)).size, [payments]);

  const openReceipt = (p: ApiPayment) => {
    setSelectedPayment(p);
    setReceiptOpen(true);
  };

  const openRefund = (p: ApiPayment) => {
    setSelectedPayment(p);
    setRefundForm({ amount: String(p.amount), reason: '' });
    setRefundOpen(true);
  };

  const cards = [
    { label: 'Total encaissé', value: formatCurrency(totalReceived), color: '#4caf50' },
    { label: 'Encaissé aujourd\'hui', value: formatCurrency(todayTotal), color: '#1976d2' },
    { label: 'Nombre de paiements', value: String(paymentCount), color: '#9c27b0' },
    { label: 'Élèves concernés', value: String(distinctStudents), color: '#ff9800' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Comptabilit&eacute;</Link>
        <Typography color="text.primary">Paiements</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Paiements</Typography>
        <Button variant="contained" onClick={() => setPaymentOpen(true)}>+ Enregistrer un paiement</Button>
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Impossible de charger les paiements.</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Liste des paiements" />
        <Tab label="Résumé du jour" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Historique des Paiements</Typography>
            {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
            {!isLoading && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Re&ccedil;u</TableCell>
                      <TableCell>&Eacute;l&egrave;ve</TableCell>
                      <TableCell>Facture</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell>M&eacute;thode</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>R&eacute;f. Transaction</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.length === 0 && (
                      <TableRow><TableCell colSpan={8}><Alert severity="info">Aucun paiement enregistré.</Alert></TableCell></TableRow>
                    )}
                    {payments.map(payment => (
                      <TableRow key={payment.id} hover>
                        <TableCell><Typography fontWeight="medium">{payment.receipt_number || '—'}</Typography></TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">{studentName(payment.student)}</Typography>
                          <Typography variant="caption" color="text.secondary">{payment.student?.matricule}</Typography>
                        </TableCell>
                        <TableCell>{payment.invoice?.invoice_number || `#${payment.invoice_id}`}</TableCell>
                        <TableCell align="right"><Typography fontWeight="bold">{formatCurrency(payment.amount)}</Typography></TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={METHOD_LABELS[payment.payment_method] ?? payment.payment_method}
                            sx={{ bgcolor: METHOD_COLORS[payment.payment_method] ?? '#757575', color: 'white' }}
                          />
                        </TableCell>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{payment.reference_number || '-'}</Typography></TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {payment.receipt_number && (
                              <Button size="small" variant="outlined" onClick={() => openReceipt(payment)}>Re&ccedil;u</Button>
                            )}
                            <Button size="small" variant="outlined" color="secondary" onClick={() => openRefund(payment)}>Rembourser</Button>
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
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">R&eacute;sum&eacute; du {summary.date ?? new Date().toLocaleDateString('fr-FR')}</Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ color: '#1976d2', my: 2 }}>{formatCurrency(summary.total_amount)}</Typography>
                <Typography variant="body2" color="text.secondary">{Number(summary.total_count ?? 0)} paiement(s) enregistr&eacute;(s)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>R&eacute;partition par m&eacute;thode</Typography>
                {byMethod.length === 0 && <Alert severity="info">Aucun paiement aujourd&apos;hui.</Alert>}
                {byMethod.map((entry, idx) => {
                  const total = Number(summary.total_amount ?? 0) || 1;

                  return (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Chip size="small" label={entry.method} />
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(entry.amount)} ({entry.count} paiement{entry.count > 1 ? 's' : ''})
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={(Number(entry.amount) / total) * 100} sx={{ height: 10, borderRadius: 5 }} />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enregistrer un Paiement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Facture</InputLabel>
              <Select
                label="Facture"
                value={form.invoice_id}
                onChange={(e) => setForm(f => ({ ...f, invoice_id: String(e.target.value) }))}
              >
                {invoices.length === 0 && <MenuItem value="" disabled>Aucune facture disponible</MenuItem>}
                {invoices.map(inv => (
                  <MenuItem key={inv.id} value={String(inv.id)}>
                    {inv.invoice_number} — {studentName(inv.student)} ({formatCurrency(Number(inv.total_amount) - Number(inv.paid_amount))} dû)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Montant"
              type="number"
              fullWidth
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>M&eacute;thode de paiement</InputLabel>
              <Select
                label="Méthode de paiement"
                value={form.payment_method}
                onChange={(e) => setForm(f => ({ ...f, payment_method: String(e.target.value) }))}
              >
                {Object.entries(METHOD_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="R&eacute;f&eacute;rence transaction"
              fullWidth
              value={form.reference_number}
              onChange={(e) => setForm(f => ({ ...f, reference_number: e.target.value }))}
            />
            <TextField
              label="Date du paiement"
              type="date"
              value={form.payment_date}
              onChange={(e) => setForm(f => ({ ...f, payment_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={2}
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            disabled={!form.invoice_id || !form.amount || recordPayment.isPending}
            onClick={() => recordPayment.mutate()}
          >
            {recordPayment.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundOpen} onClose={() => setRefundOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Demande de Remboursement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {selectedPayment && (
              <Alert severity="info">
                Paiement {selectedPayment.receipt_number || `#${selectedPayment.id}`} — {formatCurrency(selectedPayment.amount)}
              </Alert>
            )}
            <TextField
              label="Montant &agrave; rembourser"
              type="number"
              fullWidth
              value={refundForm.amount}
              onChange={(e) => setRefundForm(f => ({ ...f, amount: e.target.value }))}
            />
            <TextField
              label="Raison du remboursement"
              fullWidth
              multiline
              rows={3}
              placeholder="Ex: Double paiement, erreur de montant..."
              value={refundForm.reason}
              onChange={(e) => setRefundForm(f => ({ ...f, reason: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRefundOpen(false); setSelectedPayment(null); }}>Annuler</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={!refundForm.amount || !refundForm.reason || refundPayment.isPending}
            onClick={() => refundPayment.mutate()}
          >
            {refundPayment.isPending ? 'Traitement…' : 'Soumettre'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Re&ccedil;u de Paiement</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box sx={{ mt: 1 }}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" align="center" sx={{ mb: 2 }}>RE&Ccedil;U DE PAIEMENT</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">N&deg; Re&ccedil;u</Typography>
                    <Typography fontWeight="bold">{selectedPayment.receipt_number}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography>{new Date(selectedPayment.payment_date).toLocaleDateString('fr-FR')}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">&Eacute;l&egrave;ve</Typography>
                    <Typography fontWeight="bold">{studentName(selectedPayment.student)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Matricule</Typography>
                    <Typography>{selectedPayment.student?.matricule}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Montant</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">{formatCurrency(selectedPayment.amount)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">M&eacute;thode</Typography>
                    <Typography>{METHOD_LABELS[selectedPayment.payment_method] ?? selectedPayment.payment_method}</Typography>
                  </Grid>
                  {selectedPayment.reference_number && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary">R&eacute;f. Transaction</Typography>
                      <Typography>{selectedPayment.reference_number}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setReceiptOpen(false); setSelectedPayment(null); }}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
