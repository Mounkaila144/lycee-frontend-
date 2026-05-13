'use client';

import React, { useState, useCallback, useMemo } from 'react';

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
import CircularProgress from '@mui/material/CircularProgress';

import { useTenant } from '@/shared/lib/tenant-context';
import { useAcademicYears } from '@/modules/StructureAcademique/admin/hooks/useAcademicYears';
import { studentService } from '@/modules/Enrollment/admin/services/studentService';
import type { Student } from '@/modules/Enrollment/types/student.types';

import type { Invoice, InvoiceStatus } from '../../types';
import { INVOICE_STATUS_LABELS } from '../../types';
import { useInvoices, useFeeTypes, useCreateInvoice } from '../hooks/useInvoices';

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

interface CreateFormState {
  matricule: string;
  feeTypeId: number | '';
  amount: string;
  dueDate: string;
  notes: string;
}

const initialForm: CreateFormState = {
  matricule: '',
  feeTypeId: '',
  amount: '',
  dueDate: '',
  notes: '',
};

export const InvoiceDashboard: React.FC = () => {
  const { tenantId } = useTenant();
  const { academicYears } = useAcademicYears();
  const activeYear = useMemo(() => academicYears.find(y => y.is_active), [academicYears]);

  const { data: invoicesData, isLoading: invoicesLoading, error: invoicesError } = useInvoices(undefined, tenantId || undefined);
  const { data: feeTypesData, isLoading: feeTypesLoading } = useFeeTypes(tenantId || undefined);
  const createInvoiceMutation = useCreateInvoice(tenantId || undefined);

  // Backend renvoie total_amount/paid_amount en string ; on normalise vers le
  // shape attendu par l'UI (amount/paid_amount/remaining_amount en number).
  const invoices: Invoice[] = useMemo(() => {
    const raw = (invoicesData?.data as any[]) || [];

    return raw.map((inv): Invoice => {
      const amount = Number(inv.amount ?? inv.total_amount ?? 0);
      const paid = Number(inv.paid_amount ?? 0);

      return {
        ...inv,
        amount,
        paid_amount: paid,
        remaining_amount: Number(inv.remaining_amount ?? amount - paid),
        reference: inv.reference ?? inv.invoice_number,
        issued_date: inv.issued_date ?? inv.invoice_date,
        items: inv.items ?? [],
      } as Invoice;
    });
  }, [invoicesData]);
  const feeTypes = feeTypesData?.data || [];

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState<CreateFormState>(initialForm);
  const [matriculeLookupLoading, setMatriculeLookupLoading] = useState(false);
  const [resolvedStudent, setResolvedStudent] = useState<Student | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleViewDetail = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  }, []);

  const handleOpenCreate = () => {
    setForm({ ...initialForm, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) });
    setResolvedStudent(null);
    setCreateError(null);
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    if (createInvoiceMutation.isPending) return;
    setCreateOpen(false);
  };

  const handleFeeTypeChange = (feeTypeId: number) => {
    const ft = feeTypes.find(f => f.id === feeTypeId);

    setForm(prev => ({ ...prev, feeTypeId, amount: ft ? String(Number((ft as any).default_amount ?? ft.amount ?? 0)) : prev.amount }));
  };

  const handleResolveMatricule = async () => {
    if (!form.matricule.trim()) return;
    setMatriculeLookupLoading(true);
    setResolvedStudent(null);

    try {
      const result = await studentService.getStudents(tenantId || undefined, { search: form.matricule.trim(), per_page: 5 });
      const exact = result.data.find(s => s.matricule.toLowerCase() === form.matricule.trim().toLowerCase()) || result.data[0] || null;

      setResolvedStudent(exact);

      if (!exact) {
        setCreateError(`Aucun étudiant trouvé pour le matricule "${form.matricule}".`);
      } else {
        setCreateError(null);
      }
    } catch (err) {
      console.error(err);
      setCreateError("Erreur lors de la recherche de l'étudiant.");
    } finally {
      setMatriculeLookupLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreateError(null);

    if (!resolvedStudent) {
      setCreateError('Vérifiez le matricule de l\'étudiant avant de créer la facture.');

      return;
    }

    if (!activeYear) {
      setCreateError('Aucune année académique active n\'est définie.');

      return;
    }

    if (!form.feeTypeId) {
      setCreateError('Sélectionnez un type de frais.');

      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setCreateError('Le montant doit être un nombre positif.');

      return;
    }

    if (!form.dueDate) {
      setCreateError('La date d\'échéance est obligatoire.');

      return;
    }

    const feeType = feeTypes.find(f => f.id === form.feeTypeId);

    try {
      await createInvoiceMutation.mutateAsync({
        student_id: resolvedStudent.id,
        academic_year_id: activeYear.id,
        due_date: form.dueDate,
        notes: form.notes || undefined,
        items: [
          {
            fee_type_id: form.feeTypeId as number,
            quantity: 1,
            unit_price: amount,
            // Backend exige description; on dérive du type de frais sélectionné
            description: feeType ? `${feeType.code} — ${feeType.name}` : 'Frais',
          } as any,
        ],
      });
      setCreateOpen(false);
      setSnackbar({ open: true, message: `Facture créée pour ${resolvedStudent.firstname} ${resolvedStudent.lastname} (${feeType?.code ?? ''}).`, severity: 'success' });
    } catch (err: any) {
      console.error(err);
      setCreateError(err?.response?.data?.message || 'Erreur lors de la création de la facture.');
    }
  };

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
          <Button variant="contained" onClick={handleOpenCreate} disabled={feeTypesLoading || !activeYear}>
            + Nouvelle Facture
          </Button>
        </Box>
      </Box>

      {!activeYear && !invoicesLoading && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Aucune année académique active. Activez une année dans <strong>Structure / Calendrier académique</strong> avant de créer des factures.
        </Alert>
      )}

      {invoicesError instanceof Error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {invoicesError.message || 'Erreur lors du chargement des factures.'}
        </Alert>
      )}

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
          {invoicesLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
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
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary" sx={{ py: 3 }}>
                          Aucune facture pour l&apos;instant.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map(invoice => (
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
                          <Button size="small" variant="outlined" onClick={() => handleViewDetail(invoice)}>
                            D&eacute;tails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
                    {selectedInvoice?.items?.map(item => (
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={createOpen} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Facture</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {createError && <Alert severity="error">{createError}</Alert>}

            {activeYear && (
              <Alert severity="info">
                Année académique : <strong>{activeYear.name}</strong>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                label="Matricule étudiant"
                fullWidth
                placeholder="Ex: 2026-0001"
                value={form.matricule}
                onChange={e => setForm(prev => ({ ...prev, matricule: e.target.value }))}
                onBlur={handleResolveMatricule}
              />
              <Button
                variant="outlined"
                onClick={handleResolveMatricule}
                disabled={matriculeLookupLoading || !form.matricule.trim()}
                sx={{ mt: 0.5, whiteSpace: 'nowrap' }}
              >
                {matriculeLookupLoading ? <CircularProgress size={20} /> : 'Vérifier'}
              </Button>
            </Box>

            {resolvedStudent && (
              <Alert severity="success">
                Étudiant identifié : <strong>{resolvedStudent.firstname} {resolvedStudent.lastname}</strong> ({resolvedStudent.matricule})
              </Alert>
            )}

            <FormControl fullWidth>
              <InputLabel>Type de frais</InputLabel>
              <Select
                label="Type de frais"
                value={form.feeTypeId}
                onChange={e => handleFeeTypeChange(Number(e.target.value))}
              >
                {feeTypes.length === 0 ? (
                  <MenuItem disabled value="">
                    Aucun type de frais configuré
                  </MenuItem>
                ) : (
                  feeTypes.filter(ft => ft.is_active !== false).map(ft => (
                    <MenuItem key={ft.id} value={ft.id}>
                      {ft.code} - {ft.name} ({formatCurrency(Number((ft as any).default_amount ?? ft.amount ?? 0))})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              label="Montant (XOF)"
              type="number"
              fullWidth
              value={form.amount}
              onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
              required
            />

            <TextField
              label="Date d'échéance"
              type="date"
              value={form.dueDate}
              onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={2}
              placeholder="Notes optionnelles"
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate} disabled={createInvoiceMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createInvoiceMutation.isPending || !resolvedStudent || !activeYear}
          >
            {createInvoiceMutation.isPending ? 'Création…' : 'Créer'}
          </Button>
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
