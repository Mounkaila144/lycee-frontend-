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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';

import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../../types';

import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_PAYMENTS: Payment[] = [
  {
    id: 1, reference: 'PAY-2026-0001', invoice_id: 1, student_id: 1,
    amount: 575000, method: 'bank_transfer', status: 'completed',
    transaction_reference: 'VIR-2026-ABC123', payment_date: '2026-02-15',
    notes: 'Paiement intégral', receipt_number: 'REC-0001', received_by: 1,
    student: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2026-001' },
    created_at: '2026-02-15T10:00:00', updated_at: '2026-02-15T10:00:00',
  },
  {
    id: 2, reference: 'PAY-2026-0002', invoice_id: 2, student_id: 2,
    amount: 275000, method: 'mobile_money', status: 'completed',
    transaction_reference: 'MM-2026-XYZ789', payment_date: '2026-03-01',
    notes: 'Première tranche', receipt_number: 'REC-0002', received_by: 1,
    student: { id: 2, firstname: 'Fatima', lastname: 'Ousmane', matricule: 'ETU-2026-002' },
    created_at: '2026-03-01T14:00:00', updated_at: '2026-03-01T14:00:00',
  },
  {
    id: 3, reference: 'PAY-2026-0003', invoice_id: 3, student_id: 3,
    amount: 200000, method: 'cash', status: 'pending',
    transaction_reference: null, payment_date: '2026-03-25',
    notes: 'Paiement partiel en espèces', receipt_number: null, received_by: null,
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Mahamadou', matricule: 'ETU-2026-003' },
    created_at: '2026-03-25T09:00:00', updated_at: '2026-03-25T09:00:00',
  },
  {
    id: 4, reference: 'PAY-2026-0004', invoice_id: 1, student_id: 1,
    amount: 50000, method: 'check', status: 'refunded',
    transaction_reference: 'CHQ-2026-456', payment_date: '2026-02-10',
    notes: 'Remboursement - double paiement', receipt_number: 'REC-0004', received_by: 2,
    student: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2026-001' },
    created_at: '2026-02-10T11:00:00', updated_at: '2026-02-20T15:00:00',
  },
  {
    id: 5, reference: 'PAY-2026-0005', invoice_id: 4, student_id: 4,
    amount: 525000, method: 'bank_transfer', status: 'failed',
    transaction_reference: 'VIR-2026-FAIL01', payment_date: '2026-03-20',
    notes: 'Fonds insuffisants', receipt_number: null, received_by: null,
    student: { id: 4, firstname: 'Aissatou', lastname: 'Boubacar', matricule: 'ETU-2026-004' },
    created_at: '2026-03-20T16:00:00', updated_at: '2026-03-20T16:30:00',
  },
  {
    id: 6, reference: 'PAY-2026-0006', invoice_id: 2, student_id: 2,
    amount: 100000, method: 'mobile_money', status: 'completed',
    transaction_reference: 'MM-2026-DEF456', payment_date: '2026-03-25',
    notes: null, receipt_number: 'REC-0006', received_by: 1,
    student: { id: 2, firstname: 'Fatima', lastname: 'Ousmane', matricule: 'ETU-2026-002' },
    created_at: '2026-03-25T08:30:00', updated_at: '2026-03-25T08:30:00',
  },
];

const DEMO_DAILY_SUMMARY = {
  date: '2026-03-25',
  total_payments: 3,
  total_amount: 325000,
  by_method: [
    { method: 'cash' as PaymentMethod, count: 1, amount: 200000 },
    { method: 'mobile_money' as PaymentMethod, count: 1, amount: 100000 },
    { method: 'bank_transfer' as PaymentMethod, count: 1, amount: 25000 },
  ],
};

const getStatusChipColor = (status: PaymentStatus): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'pending': return 'warning';
    case 'completed': return 'success';
    case 'failed': return 'error';
    case 'refunded': return 'default';
    default: return 'default';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

export const PaymentDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const payments = DEMO_PAYMENTS;

  const handleViewReceipt = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptOpen(true);
  }, []);

  const totalReceived = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0);
  const completedCount = payments.filter(p => p.status === 'completed').length;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Comptabilit&eacute;
        </Link>
        <Typography color="text.primary">Paiements</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Paiements
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setRefundOpen(true)}>
            Remboursement
          </Button>
          <Button variant="contained" onClick={() => setPaymentOpen(true)}>
            + Enregistrer un paiement
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total encaissé', value: formatCurrency(totalReceived), color: '#4caf50' },
          { label: 'En attente', value: formatCurrency(totalPending), color: '#ff9800' },
          { label: 'Remboursé', value: formatCurrency(totalRefunded), color: '#9c27b0' },
          { label: 'Paiements complétés', value: completedCount, color: '#1976d2' },
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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Liste des paiements" />
        <Tab label="Résumé du jour" />
      </Tabs>

      {/* Tab 0: Payments List */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Historique des Paiements</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>R&eacute;f&eacute;rence</TableCell>
                    <TableCell>&Eacute;tudiant</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell>M&eacute;thode</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>R&eacute;f. Transaction</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map(payment => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{payment.reference}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {payment.student?.firstname} {payment.student?.lastname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.student?.matricule}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">{formatCurrency(payment.amount)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={PAYMENT_METHOD_LABELS[payment.method]}
                          sx={{ bgcolor: PAYMENT_METHOD_COLORS[payment.method], color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={PAYMENT_STATUS_LABELS[payment.status]}
                          color={getStatusChipColor(payment.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {payment.transaction_reference || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {payment.receipt_number && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewReceipt(payment)}
                            >
                              Re&ccedil;u
                            </Button>
                          )}
                          {payment.status === 'completed' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setRefundOpen(true);
                              }}
                            >
                              Rembourser
                            </Button>
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
      )}

      {/* Tab 1: Daily Summary */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  R&eacute;sum&eacute; du {new Date(DEMO_DAILY_SUMMARY.date).toLocaleDateString('fr-FR')}
                </Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ color: '#1976d2', my: 2 }}>
                  {formatCurrency(DEMO_DAILY_SUMMARY.total_amount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {DEMO_DAILY_SUMMARY.total_payments} paiement(s) enregistr&eacute;(s)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>R&eacute;partition par m&eacute;thode</Typography>
                {DEMO_DAILY_SUMMARY.by_method.map(entry => (
                  <Box key={entry.method} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Chip
                        size="small"
                        label={PAYMENT_METHOD_LABELS[entry.method]}
                        sx={{ bgcolor: PAYMENT_METHOD_COLORS[entry.method], color: 'white' }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(entry.amount)} ({entry.count} paiement{entry.count > 1 ? 's' : ''})
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(entry.amount / DEMO_DAILY_SUMMARY.total_amount) * 100}
                      sx={{
                        height: 10, borderRadius: 5,
                        '& .MuiLinearProgress-bar': { bgcolor: PAYMENT_METHOD_COLORS[entry.method], borderRadius: 5 },
                      }}
                    />
                  </Box>
                ))}
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
            <TextField label="R&eacute;f&eacute;rence facture" fullWidth placeholder="Ex: FAC-2026-0001" />
            <TextField label="Montant" type="number" fullWidth defaultValue={275000} />
            <FormControl fullWidth>
              <InputLabel>M&eacute;thode de paiement</InputLabel>
              <Select label="Méthode de paiement" defaultValue="cash">
                <MenuItem value="cash">Esp&egrave;ces</MenuItem>
                <MenuItem value="bank_transfer">Virement bancaire</MenuItem>
                <MenuItem value="check">Ch&egrave;que</MenuItem>
                <MenuItem value="mobile_money">Mobile Money</MenuItem>
              </Select>
            </FormControl>
            <TextField label="R&eacute;f&eacute;rence transaction" fullWidth placeholder="Ex: VIR-2026-XXX" />
            <TextField
              label="Date du paiement"
              type="date"
              defaultValue="2026-03-26"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField label="Notes" fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setPaymentOpen(false);
              setSnackbar({ open: true, message: 'Paiement enregistré avec succès', severity: 'success' });
            }}
          >
            Enregistrer
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
                Paiement {selectedPayment.reference} - {formatCurrency(selectedPayment.amount)}
              </Alert>
            )}
            <TextField label="Montant &agrave; rembourser" type="number" fullWidth defaultValue={selectedPayment?.amount || 0} />
            <TextField label="Raison du remboursement" fullWidth multiline rows={3} placeholder="Ex: Double paiement, erreur de montant..." />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRefundOpen(false); setSelectedPayment(null); }}>Annuler</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setRefundOpen(false);
              setSelectedPayment(null);
              setSnackbar({ open: true, message: 'Demande de remboursement soumise', severity: 'success' });
            }}
          >
            Soumettre
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
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">&Eacute;tudiant</Typography>
                    <Typography fontWeight="bold">
                      {selectedPayment.student?.firstname} {selectedPayment.student?.lastname}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Matricule</Typography>
                    <Typography>{selectedPayment.student?.matricule}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Montant</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(selectedPayment.amount)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">M&eacute;thode</Typography>
                    <Typography>{PAYMENT_METHOD_LABELS[selectedPayment.method]}</Typography>
                  </Grid>
                  {selectedPayment.transaction_reference && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary">R&eacute;f. Transaction</Typography>
                      <Typography>{selectedPayment.transaction_reference}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setReceiptOpen(false); setSelectedPayment(null); }}>Fermer</Button>
          <Button
            variant="contained"
            onClick={() => setSnackbar({ open: true, message: 'Reçu téléchargé', severity: 'success' })}
          >
            T&eacute;l&eacute;charger PDF
          </Button>
        </DialogActions>
      </Dialog>

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
