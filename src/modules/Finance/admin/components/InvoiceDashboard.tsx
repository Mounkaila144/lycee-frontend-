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
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';

import type {
  Invoice,
  InvoiceStatus,
  FeeType,
} from '../../types';

import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_FEE_TYPES: FeeType[] = [
  { id: 1, name: 'Frais de scolarité', code: 'SCOL', description: 'Frais de scolarité annuels', amount: 500000, currency: 'XOF', is_active: true, academic_year_id: 1, created_at: '2026-01-10T08:00:00', updated_at: '2026-01-10T08:00:00' },
  { id: 2, name: 'Frais d\'inscription', code: 'INSC', description: 'Frais d\'inscription', amount: 75000, currency: 'XOF', is_active: true, academic_year_id: 1, created_at: '2026-01-10T08:00:00', updated_at: '2026-01-10T08:00:00' },
  { id: 3, name: 'Frais de laboratoire', code: 'LABO', description: 'Accès aux laboratoires', amount: 50000, currency: 'XOF', is_active: true, academic_year_id: 1, created_at: '2026-01-10T08:00:00', updated_at: '2026-01-10T08:00:00' },
  { id: 4, name: 'Frais de bibliothèque', code: 'BIBL', description: 'Accès à la bibliothèque', amount: 25000, currency: 'XOF', is_active: true, academic_year_id: 1, created_at: '2026-01-10T08:00:00', updated_at: '2026-01-10T08:00:00' },
  { id: 5, name: 'Assurance étudiante', code: 'ASSU', description: 'Couverture santé étudiante', amount: 15000, currency: 'XOF', is_active: false, academic_year_id: 1, created_at: '2026-01-10T08:00:00', updated_at: '2026-01-10T08:00:00' },
];

const DEMO_INVOICES: Invoice[] = [
  {
    id: 1, reference: 'FAC-2026-0001', student_id: 1, academic_year_id: 1,
    amount: 575000, paid_amount: 575000, remaining_amount: 0,
    status: 'paid', due_date: '2026-03-15', issued_date: '2026-01-15', notes: null,
    items: [
      { id: 1, invoice_id: 1, fee_type_id: 1, description: 'Frais de scolarité', quantity: 1, unit_price: 500000, amount: 500000 },
      { id: 2, invoice_id: 1, fee_type_id: 2, description: 'Frais d\'inscription', quantity: 1, unit_price: 75000, amount: 75000 },
    ],
    student: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2026-001', email: 'amadou.diallo@univ.ne' },
    created_at: '2026-01-15T08:00:00', updated_at: '2026-02-20T14:00:00',
  },
  {
    id: 2, reference: 'FAC-2026-0002', student_id: 2, academic_year_id: 1,
    amount: 550000, paid_amount: 275000, remaining_amount: 275000,
    status: 'pending', due_date: '2026-04-15', issued_date: '2026-01-20', notes: 'Paiement en 2 tranches',
    items: [
      { id: 3, invoice_id: 2, fee_type_id: 1, description: 'Frais de scolarité', quantity: 1, unit_price: 500000, amount: 500000 },
      { id: 4, invoice_id: 2, fee_type_id: 3, description: 'Frais de laboratoire', quantity: 1, unit_price: 50000, amount: 50000 },
    ],
    student: { id: 2, firstname: 'Fatima', lastname: 'Ousmane', matricule: 'ETU-2026-002', email: 'fatima.ousmane@univ.ne' },
    created_at: '2026-01-20T09:00:00', updated_at: '2026-03-10T10:00:00',
  },
  {
    id: 3, reference: 'FAC-2026-0003', student_id: 3, academic_year_id: 1,
    amount: 625000, paid_amount: 0, remaining_amount: 625000,
    status: 'overdue', due_date: '2026-02-28', issued_date: '2026-01-10', notes: null,
    items: [
      { id: 5, invoice_id: 3, fee_type_id: 1, description: 'Frais de scolarité', quantity: 1, unit_price: 500000, amount: 500000 },
      { id: 6, invoice_id: 3, fee_type_id: 2, description: 'Frais d\'inscription', quantity: 1, unit_price: 75000, amount: 75000 },
      { id: 7, invoice_id: 3, fee_type_id: 3, description: 'Frais de laboratoire', quantity: 1, unit_price: 50000, amount: 50000 },
    ],
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Mahamadou', matricule: 'ETU-2026-003', email: 'ibrahim.m@univ.ne' },
    created_at: '2026-01-10T07:00:00', updated_at: '2026-03-01T00:00:00',
  },
  {
    id: 4, reference: 'FAC-2026-0004', student_id: 4, academic_year_id: 1,
    amount: 525000, paid_amount: 0, remaining_amount: 525000,
    status: 'draft', due_date: '2026-05-15', issued_date: '2026-03-25', notes: 'En attente de validation',
    items: [
      { id: 8, invoice_id: 4, fee_type_id: 1, description: 'Frais de scolarité', quantity: 1, unit_price: 500000, amount: 500000 },
      { id: 9, invoice_id: 4, fee_type_id: 4, description: 'Frais de bibliothèque', quantity: 1, unit_price: 25000, amount: 25000 },
    ],
    student: { id: 4, firstname: 'Aissatou', lastname: 'Boubacar', matricule: 'ETU-2026-004', email: 'aissatou.b@univ.ne' },
    created_at: '2026-03-25T11:00:00', updated_at: '2026-03-25T11:00:00',
  },
  {
    id: 5, reference: 'FAC-2026-0005', student_id: 5, academic_year_id: 1,
    amount: 575000, paid_amount: 575000, remaining_amount: 0,
    status: 'cancelled', due_date: '2026-03-01', issued_date: '2026-01-05', notes: 'Étudiant désinscrit',
    items: [
      { id: 10, invoice_id: 5, fee_type_id: 1, description: 'Frais de scolarité', quantity: 1, unit_price: 500000, amount: 500000 },
      { id: 11, invoice_id: 5, fee_type_id: 2, description: 'Frais d\'inscription', quantity: 1, unit_price: 75000, amount: 75000 },
    ],
    student: { id: 5, firstname: 'Moussa', lastname: 'Abdou', matricule: 'ETU-2026-005', email: 'moussa.abdou@univ.ne' },
    created_at: '2026-01-05T08:00:00', updated_at: '2026-02-15T16:00:00',
  },
];

const getStatusChipColor = (status: InvoiceStatus): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'draft': return 'default';
    case 'pending': return 'primary';
    case 'paid': return 'success';
    case 'overdue': return 'error';
    case 'cancelled': return 'warning';
    default: return 'default';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

export const InvoiceDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [feeTypeOpen, setFeeTypeOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const invoices = DEMO_INVOICES;
  const feeTypes = DEMO_FEE_TYPES;

  const handleViewDetail = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  }, []);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.remaining_amount, 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Comptabilit&eacute;
        </Link>
        <Typography color="text.primary">Facturation</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Facturation
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setFeeTypeOpen(true)}>
            Types de frais
          </Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            + Nouvelle Facture
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total facturé', value: formatCurrency(totalInvoiced), color: '#1976d2' },
          { label: 'Total encaissé', value: formatCurrency(totalPaid), color: '#4caf50' },
          { label: 'Total en retard', value: formatCurrency(totalOverdue), color: '#f44336' },
          { label: 'Taux de recouvrement', value: `${collectionRate}%`, color: '#9c27b0' },
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

      {/* Invoices Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Liste des Factures</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>R&eacute;f&eacute;rence</TableCell>
                  <TableCell>&Eacute;tudiant</TableCell>
                  <TableCell align="right">Montant</TableCell>
                  <TableCell align="right">Pay&eacute;</TableCell>
                  <TableCell align="right">Restant</TableCell>
                  <TableCell>&Eacute;ch&eacute;ance</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map(invoice => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{invoice.reference}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {invoice.student?.firstname} {invoice.student?.lastname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {invoice.student?.matricule}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">{formatCurrency(invoice.amount)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="success.main" fontWeight="bold">
                        {formatCurrency(invoice.paid_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color={invoice.remaining_amount > 0 ? 'error.main' : 'text.secondary'} fontWeight="bold">
                        {formatCurrency(invoice.remaining_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={INVOICE_STATUS_LABELS[invoice.status]}
                        color={getStatusChipColor(invoice.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetail(invoice)}
                        >
                          D&eacute;tails
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => setSnackbar({ open: true, message: `Facture ${invoice.reference} envoyée`, severity: 'success' })}
                          >
                            Envoyer
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Facture {selectedInvoice?.reference}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedInvoice?.student?.firstname} {selectedInvoice?.student?.lastname} - {selectedInvoice?.student?.matricule}
              </Typography>
            </Box>
            {selectedInvoice && (
              <Chip
                label={INVOICE_STATUS_LABELS[selectedInvoice.status]}
                color={getStatusChipColor(selectedInvoice.status)}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Montant Total</Typography>
                <Typography variant="h5" fontWeight="bold">
                  {selectedInvoice && formatCurrency(selectedInvoice.amount)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Restant &agrave; payer</Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {selectedInvoice && formatCurrency(selectedInvoice.remaining_amount)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>D&eacute;tail des lignes</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Quantit&eacute;</TableCell>
                      <TableCell align="right">Prix unitaire</TableCell>
                      <TableCell align="right">Montant</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice?.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Date d&apos;&eacute;mission</Typography>
                <Typography>{selectedInvoice && new Date(selectedInvoice.issued_date).toLocaleDateString('fr-FR')}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Date d&apos;&eacute;ch&eacute;ance</Typography>
                <Typography>{selectedInvoice && new Date(selectedInvoice.due_date).toLocaleDateString('fr-FR')}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Facture</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="&Eacute;tudiant (matricule)" fullWidth placeholder="Ex: ETU-2026-001" />
            <FormControl fullWidth>
              <InputLabel>Type de frais</InputLabel>
              <Select label="Type de frais" defaultValue="">
                {feeTypes.filter(ft => ft.is_active).map(ft => (
                  <MenuItem key={ft.id} value={ft.id}>
                    {ft.code} - {ft.name} ({formatCurrency(ft.amount)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Montant" type="number" fullWidth defaultValue={500000} />
            <TextField
              label="Date d'&eacute;ch&eacute;ance"
              type="date"
              defaultValue="2026-05-15"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField label="Notes" fullWidth multiline rows={2} placeholder="Notes optionnelles" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setCreateOpen(false);
              setSnackbar({ open: true, message: 'Facture créée avec succès', severity: 'success' });
            }}
          >
            Cr&eacute;er
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fee Types Dialog */}
      <Dialog open={feeTypeOpen} onClose={() => setFeeTypeOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Gestion des Types de Frais</DialogTitle>
        <DialogContent>
          <TableContainer sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Montant</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feeTypes.map(ft => (
                  <TableRow key={ft.id} hover>
                    <TableCell>
                      <Typography fontWeight="bold">{ft.code}</Typography>
                    </TableCell>
                    <TableCell>{ft.name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{ft.description}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">{formatCurrency(ft.amount)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ft.is_active ? 'Actif' : 'Inactif'}
                        color={ft.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeeTypeOpen(false)}>Fermer</Button>
          <Button
            variant="contained"
            onClick={() => {
              setFeeTypeOpen(false);
              setSnackbar({ open: true, message: 'Type de frais ajouté', severity: 'success' });
            }}
          >
            + Ajouter un type
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
