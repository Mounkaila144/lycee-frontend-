'use client';

import { useMemo } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';
import { createApiClient } from '@/shared/lib/api-client';
import type { Student } from '../../types/student.types';
import { PaymentsDialog } from '@/modules/Finance/admin/components/InvoiceDashboard';
import { CreateInvoiceForStudentDialog } from '@/modules/Finance/admin/components/CreateInvoiceForStudentDialog';
import type { Invoice } from '@/modules/Finance/types';

interface InvoiceRow {
  id: number;
  invoice_number: string;
  reference?: string;
  status: string;
  total_amount: number | string;
  amount?: number | string;
  paid_amount?: number | string;
  due_date: string;
  invoice_date?: string;
  payments?: PaymentRow[];
}

interface PaymentRow {
  id: number;
  invoice_id: number;
  amount: number | string;
  payment_method?: string;
  reference_number?: string | null;
  payment_date?: string | null;
  status?: string;
}

interface StudentFinancialDialogProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

const STATUS_LABEL: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  draft: { label: 'Brouillon', color: 'default' },
  pending: { label: 'En attente', color: 'primary' },
  partial: { label: 'Partielle', color: 'warning' },
  paid: { label: 'Payée', color: 'success' },
  overdue: { label: 'En retard', color: 'error' },
  cancelled: { label: 'Annulée', color: 'default' },
};

export const StudentFinancialDialog: React.FC<StudentFinancialDialogProps> = ({ student, open, onClose }) => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [paymentsInvoice, setPaymentsInvoice] = useState<Invoice | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleDownloadPdf = useCallback(async (invoice: InvoiceRow) => {
    try {
      const client = createApiClient(tenantId || undefined);
      const response = await client.get<Blob>(`/admin/finance/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      const reference = invoice.reference ?? invoice.invoice_number;

      link.href = url;
      link.download = `facture_${reference}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Erreur lors du téléchargement de la facture.',
        severity: 'error',
      });
    }
  }, [tenantId]);

  const handleOpenPayments = (inv: InvoiceRow) => {
    const amount = Number(inv.amount ?? inv.total_amount ?? 0);
    const paid = (inv.payments ?? [])
      .filter(p => (p.status ?? 'completed') !== 'refunded' && (p.status ?? 'completed') !== 'failed')
      .reduce((s, p) => s + Number(p.amount), 0);

    // PaymentsDialog attend un Invoice avec amount/paid_amount/remaining_amount/reference/student.
    setPaymentsInvoice({
      ...(inv as any),
      amount,
      paid_amount: paid,
      remaining_amount: Math.max(0, amount - paid),
      reference: inv.reference ?? inv.invoice_number,
      student: student ? {
        id: student.id,
        firstname: student.firstname,
        lastname: student.lastname,
        matricule: student.matricule,
      } : undefined,
    } as unknown as Invoice);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-financial', student?.id],
    queryFn: async () => {
      const client = createApiClient(tenantId || undefined);
      const res = await client.get('/admin/finance/invoices', {
        params: { student_id: student!.id, per_page: 100 },
      });
      return res.data;
    },
    enabled: open && !!student,
  });

  const invoices: InvoiceRow[] = useMemo(() => {
    const raw = (data?.data as any[]) ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const totals = useMemo(() => {
    let totalAmount = 0;
    let totalPaid = 0;

    invoices.forEach(inv => {
      const amount = Number(inv.amount ?? inv.total_amount ?? 0);
      const paid = (inv.payments ?? [])
        .filter(p => (p.status ?? 'completed') !== 'refunded' && (p.status ?? 'completed') !== 'failed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      totalAmount += amount;
      totalPaid += paid;
    });

    return {
      totalAmount,
      totalPaid,
      remaining: Math.max(0, totalAmount - totalPaid),
      collectionRate: totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0,
      countTotal: invoices.length,
      countPaid: invoices.filter(i => i.status === 'paid').length,
      countOverdue: invoices.filter(i => i.status === 'overdue').length,
      countPartial: invoices.filter(i => {
        const a = Number(i.amount ?? i.total_amount ?? 0);
        const p = (i.payments ?? []).reduce((s, x) => s + Number(x.amount), 0);
        return p > 0 && p < a;
      }).length,
    };
  }, [invoices]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Situation financière</Typography>
            {student && (
              <Typography variant="body2" color="text.secondary">
                {student.firstname} {student.lastname} — {student.matricule}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {totals.countTotal > 0 && (
              <Chip
                color={totals.remaining === 0 ? 'success' : totals.countOverdue > 0 ? 'error' : 'primary'}
                label={
                  totals.remaining === 0
                    ? 'À jour'
                    : totals.countOverdue > 0
                      ? `${totals.countOverdue} en retard`
                      : `${formatCurrency(totals.remaining)} restant`
                }
              />
            )}
            <Button
              variant="contained"
              onClick={() => setCreateOpen(true)}
              startIcon={<i className="ri-add-line" />}
            >
              Nouvelle facture
            </Button>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error instanceof Error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'Erreur lors du chargement de la situation financière.'}
          </Alert>
        )}

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : invoices.length === 0 ? (
          <Alert severity="info">Aucune facture pour cet étudiant.</Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Total facturé</Typography>
                  <Typography variant="h6" fontWeight="bold">{formatCurrency(totals.totalAmount)}</Typography>
                  <Typography variant="caption" color="text.secondary">{totals.countTotal} facture(s)</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Total payé</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">{formatCurrency(totals.totalPaid)}</Typography>
                  <Typography variant="caption" color="text.secondary">{totals.countPaid} soldée(s)</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Restant dû</Typography>
                  <Typography variant="h6" fontWeight="bold" color={totals.remaining > 0 ? 'error.main' : 'text.secondary'}>
                    {formatCurrency(totals.remaining)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {totals.countOverdue} en retard · {totals.countPartial} partielle(s)
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">Taux de recouvrement</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">{totals.collectionRate}%</Typography>
                  <Typography variant="caption" color="text.secondary">payé / facturé</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Factures
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Référence</TableCell>
                    <TableCell>Échéance</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell align="right">Payé</TableCell>
                    <TableCell align="right">Restant</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Paiements</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map(inv => {
                    const amount = Number(inv.amount ?? inv.total_amount ?? 0);
                    const paid = (inv.payments ?? [])
                      .filter(p => (p.status ?? 'completed') !== 'refunded' && (p.status ?? 'completed') !== 'failed')
                      .reduce((s, p) => s + Number(p.amount), 0);
                    const remaining = Math.max(0, amount - paid);
                    const reference = inv.reference ?? inv.invoice_number;
                    const meta = STATUS_LABEL[inv.status] ?? { label: inv.status, color: 'default' as const };

                    return (
                      <TableRow key={inv.id} hover>
                        <TableCell>{reference}</TableCell>
                        <TableCell>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-FR') : '—'}</TableCell>
                        <TableCell align="right">{formatCurrency(amount)}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          {formatCurrency(paid)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: remaining > 0 ? 'error.main' : 'text.secondary', fontWeight: 'bold' }}>
                          {formatCurrency(remaining)}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={meta.label} color={meta.color} />
                        </TableCell>
                        <TableCell>
                          {(inv.payments ?? []).length === 0 ? (
                            <Typography variant="caption" color="text.secondary">aucun</Typography>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                              {(inv.payments ?? []).map(p => (
                                <Typography key={p.id} variant="caption">
                                  {p.payment_date ? new Date(p.payment_date).toLocaleDateString('fr-FR') : '—'}
                                  {' · '}
                                  {p.payment_method ?? '—'}
                                  {' · '}
                                  <strong>{formatCurrency(Number(p.amount))}</strong>
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Enregistrer / voir paiements">
                              <IconButton
                                size="small"
                                color={remaining > 0 ? 'primary' : 'default'}
                                onClick={() => handleOpenPayments(inv)}
                              >
                                <i className="ri-money-dollar-circle-line" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Télécharger PDF">
                              <IconButton size="small" color="secondary" onClick={() => handleDownloadPdf(inv)}>
                                <i className="ri-download-2-line" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>

      <CreateInvoiceForStudentDialog
        student={student}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={message => {
          setSnackbar({ open: true, message, severity: 'success' });
          queryClient.invalidateQueries({ queryKey: ['student-financial', student?.id] });
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
        }}
      />

      <PaymentsDialog
        invoice={paymentsInvoice}
        tenantId={tenantId}
        onClose={() => {
          setPaymentsInvoice(null);
          queryClient.invalidateQueries({ queryKey: ['student-financial', student?.id] });
        }}
        onSuccess={message => setSnackbar({ open: true, message, severity: 'success' })}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
