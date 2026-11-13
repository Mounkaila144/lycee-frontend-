'use client';

import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  useBankTransfers,
  useCalculatePayroll,
  useCreatePayrollPeriod,
  useDeletePayrollPeriod,
  useGeneratePayslips,
  useMarkAsPaid,
  usePayrollPeriod,
  usePayrollPeriods,
  useValidatePayroll,
} from '../hooks';
import { formatCurrency, formatDate, getPayrollErrorMessage } from '../utils/payrollFormatters';
import { MONTH_LABELS, PAYROLL_PERIOD_STATUS_COLORS, PAYROLL_PERIOD_STATUS_LABELS } from '../../types';
import type { CreatePayrollPeriodRequest, PayrollPeriod } from '../../types';

type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' };

const lastDayOfMonth = (year: number, month: number) => {
  const date = new Date(Date.UTC(year, month, 0));

  return date.toISOString().slice(0, 10);
};

const defaultPeriodForm = (): CreatePayrollPeriodRequest => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return { year, month, payment_date: lastDayOfMonth(year, month) };
};

export const PayrollProcessingDashboard: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [periodForm, setPeriodForm] = useState<CreatePayrollPeriodRequest>(defaultPeriodForm);
  const [showTransfers, setShowTransfers] = useState(false);
  const [paymentDate, setPaymentDate] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const { data: periods = [], isLoading, isError, error } = usePayrollPeriods();
  const { data: period, isLoading: isLoadingPeriod } = usePayrollPeriod(selectedId);
  const { data: transfers = [], isLoading: isLoadingTransfers } = useBankTransfers(selectedId, showTransfers);

  const createPeriod = useCreatePayrollPeriod();
  const deletePeriod = useDeletePayrollPeriod();
  const calculate = useCalculatePayroll();
  const validate = useValidatePayroll();
  const generatePayslips = useGeneratePayslips();
  const markAsPaid = useMarkAsPaid();

  const isBusy =
    calculate.isPending || validate.isPending || generatePayslips.isPending || markAsPaid.isPending || deletePeriod.isPending;

  const notify = (message: string, severity: SnackbarState['severity'] = 'success') =>
    setSnackbar({ open: true, message, severity });

  const onError = (err: unknown) => notify(getPayrollErrorMessage(err), 'error');

  const handleCreate = () => {
    createPeriod.mutate(periodForm, {
      onSuccess: created => {
        setCreateOpen(false);
        setSelectedId(created.id);
        notify('Période de paie créée');
      },
      onError,
    });
  };

  const handleDelete = (target: PayrollPeriod) => {
    if (!window.confirm(`Supprimer la période ${target.name} ?`)) return;

    deletePeriod.mutate(target.id, {
      onSuccess: () => {
        setSelectedId(undefined);
        notify('Période supprimée');
      },
      onError,
    });
  };

  const handleMarkAsPaid = () => {
    if (!selectedId || !paymentDate) return;

    markAsPaid.mutate(
      { periodId: selectedId, paymentDate },
      {
        onSuccess: () => {
          setPaymentDate(null);
          notify('Paie marquée comme payée');
        },
        onError,
      },
    );
  };

  const records = period?.payroll_records ?? [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight="bold">
          Traitement de la Paie
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setPeriodForm(defaultPeriodForm());
            setCreateOpen(true);
          }}
        >
          + Nouvelle période
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Cycle : créer la période → calculer (employés actifs ayant un contrat actif) → valider → générer les bulletins →
        marquer comme payée.
      </Alert>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Périodes de paie
              </Typography>
              {isError && <Alert severity="error">{getPayrollErrorMessage(error, 'Impossible de charger les périodes')}</Alert>}
              {isLoading && <CircularProgress size={24} />}
              {!isLoading && periods.length === 0 && (
                <Typography color="text.secondary">Aucune période. Créez la première période de paie.</Typography>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {periods.map(item => (
                  <Button
                    key={item.id}
                    variant={item.id === selectedId ? 'contained' : 'outlined'}
                    onClick={() => {
                      setSelectedId(item.id);
                      setShowTransfers(false);
                    }}
                    sx={{ justifyContent: 'space-between', textTransform: 'none' }}
                  >
                    <span>{item.name || item.period_code}</span>
                    <Chip
                      size="small"
                      label={PAYROLL_PERIOD_STATUS_LABELS[item.status]}
                      color={PAYROLL_PERIOD_STATUS_COLORS[item.status]}
                    />
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              {!selectedId && <Typography color="text.secondary">Sélectionnez une période.</Typography>}
              {selectedId && (isLoadingPeriod || !period) && <CircularProgress />}
              {period && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="h6">
                        {period.name} ({period.period_code})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Du {formatDate(period.start_date)} au {formatDate(period.end_date)} — paiement le{' '}
                        {formatDate(period.payment_date)}
                      </Typography>
                    </Box>
                    <Chip
                      label={PAYROLL_PERIOD_STATUS_LABELS[period.status]}
                      color={PAYROLL_PERIOD_STATUS_COLORS[period.status]}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    {[
                      { label: 'Employés', value: String(period.total_employees ?? 0) },
                      { label: 'Masse brute', value: formatCurrency(period.total_gross_salary) },
                      { label: 'Retenues', value: formatCurrency(period.total_deductions) },
                      { label: 'Net à payer', value: formatCurrency(period.total_net_salary) },
                      { label: 'Charges patronales', value: formatCurrency(period.total_employer_charges) },
                      { label: 'Bulletins', value: String(period.payslips?.length ?? 0) },
                    ].map(stat => (
                      <Grid key={stat.label} size={{ xs: 6, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                        <Typography fontWeight="bold">{stat.value}</Typography>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {['draft', 'in_progress'].includes(period.status) && (
                      <>
                        <Button
                          variant="contained"
                          disabled={isBusy}
                          onClick={() =>
                            calculate.mutate(period.id, { onSuccess: () => notify('Paie calculée'), onError })
                          }
                        >
                          Calculer la paie
                        </Button>
                        <Button color="error" disabled={isBusy} onClick={() => handleDelete(period)}>
                          Supprimer
                        </Button>
                      </>
                    )}
                    {period.status === 'calculated' && (
                      <Button
                        variant="contained"
                        color="warning"
                        disabled={isBusy}
                        onClick={() => validate.mutate(period.id, { onSuccess: () => notify('Paie validée'), onError })}
                      >
                        Valider la paie
                      </Button>
                    )}
                    {['validated', 'paid', 'closed'].includes(period.status) && (
                      <>
                        <Button
                          variant="contained"
                          disabled={isBusy}
                          onClick={() =>
                            generatePayslips.mutate(period.id, {
                              onSuccess: result => notify(`${result.count} bulletin(s) généré(s)`),
                              onError,
                            })
                          }
                        >
                          Générer les bulletins
                        </Button>
                        <Button variant="outlined" onClick={() => setShowTransfers(value => !value)}>
                          {showTransfers ? 'Masquer les virements' : 'Ordres de virement'}
                        </Button>
                      </>
                    )}
                    {period.status === 'validated' && (
                      <Button
                        variant="contained"
                        color="success"
                        disabled={isBusy}
                        onClick={() => setPaymentDate(period.payment_date?.slice(0, 10) ?? '')}
                      >
                        Marquer comme payée
                      </Button>
                    )}
                  </Box>

                  {showTransfers && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Ordres de virement (employés avec compte bancaire)
                      </Typography>
                      {isLoadingTransfers ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Matricule</TableCell>
                              <TableCell>Employé</TableCell>
                              <TableCell>Compte</TableCell>
                              <TableCell align="right">Montant</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {transfers.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  Aucun employé avec compte bancaire.
                                </TableCell>
                              </TableRow>
                            )}
                            {transfers.map(transfer => (
                              <TableRow key={transfer.employee_code}>
                                <TableCell>{transfer.employee_code}</TableCell>
                                <TableCell>{transfer.employee_name}</TableCell>
                                <TableCell>{transfer.bank_account}</TableCell>
                                <TableCell align="right">{formatCurrency(transfer.amount)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </Box>
                  )}

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employé</TableCell>
                          <TableCell align="right">Base</TableCell>
                          <TableCell align="right">Brut</TableCell>
                          <TableCell align="right">Retenues</TableCell>
                          <TableCell align="right">Net</TableCell>
                          <TableCell align="right">Coût employeur</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              Aucune fiche de paie calculée pour cette période.
                            </TableCell>
                          </TableRow>
                        )}
                        {records.map(record => (
                          <TableRow key={record.id}>
                            <TableCell>
                              {record.employee
                                ? `${record.employee.first_name} ${record.employee.last_name}`
                                : `#${record.employee_id}`}
                            </TableCell>
                            <TableCell align="right">{formatCurrency(record.base_salary)}</TableCell>
                            <TableCell align="right">{formatCurrency(record.gross_salary)}</TableCell>
                            <TableCell align="right">{formatCurrency(record.total_deductions)}</TableCell>
                            <TableCell align="right">
                              <strong>{formatCurrency(record.net_salary)}</strong>
                            </TableCell>
                            <TableCell align="right">{formatCurrency(record.total_cost)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nouvelle période de paie</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Mois"
              value={periodForm.month}
              onChange={event => {
                const month = Number(event.target.value);

                setPeriodForm(prev => ({ ...prev, month, payment_date: lastDayOfMonth(prev.year, month) }));
              }}
            >
              {MONTH_LABELS.map((label, index) => (
                <MenuItem key={label} value={index + 1}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Année"
              type="number"
              value={periodForm.year}
              onChange={event => {
                const year = Number(event.target.value);

                setPeriodForm(prev => ({ ...prev, year, payment_date: lastDayOfMonth(year, prev.month) }));
              }}
            />
            <TextField
              label="Date de paiement"
              type="date"
              value={periodForm.payment_date}
              onChange={event => setPeriodForm(prev => ({ ...prev, payment_date: event.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={createPeriod.isPending}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={paymentDate !== null} onClose={() => setPaymentDate(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmer le paiement des salaires</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 1 }}
            fullWidth
            label="Date de paiement"
            type="date"
            value={paymentDate ?? ''}
            onChange={event => setPaymentDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDate(null)}>Annuler</Button>
          <Button variant="contained" color="success" onClick={handleMarkAsPaid} disabled={!paymentDate || markAsPaid.isPending}>
            Confirmer
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
