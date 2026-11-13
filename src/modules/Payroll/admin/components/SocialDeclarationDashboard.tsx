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
  useDeclarations,
  useGenerateAnnualSummary,
  useGenerateDeclaration,
  usePayrollPeriods,
  useRecordDeclarationPayment,
  useSubmitDeclaration,
  useValidateDeclaration,
} from '../hooks';
import type { GeneratedDeclarationType } from '../services/declarationService';
import { formatCurrency, formatDate, getPayrollErrorMessage, toNumber } from '../utils/payrollFormatters';
import { DECLARATION_STATUS_COLORS, DECLARATION_STATUS_LABELS, DECLARATION_TYPE_LABELS } from '../../types';
import type { DeclarationPaymentMethod, DeclarationStatus, SocialDeclaration } from '../../types';

type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' };

const GENERATED_TYPES: { value: GeneratedDeclarationType; label: string }[] = [
  { value: 'cnss', label: 'CNSS' },
  { value: 'income-tax', label: 'Impôt sur le revenu (retenues)' },
  { value: 'amo', label: 'AMO' },
];

const PAYABLE_STATUSES: DeclarationStatus[] = ['validated', 'submitted', 'accepted'];

export const SocialDeclarationDashboard: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [generateOpen, setGenerateOpen] = useState(false);

  const [generateForm, setGenerateForm] = useState<{ periodId?: number; type: GeneratedDeclarationType }>({
    type: 'cnss',
  });

  const [submitting, setSubmitting] = useState<SocialDeclaration | null>(null);
  const [submitReference, setSubmitReference] = useState('');
  const [paying, setPaying] = useState<SocialDeclaration | null>(null);

  const [payment, setPayment] = useState<{ amount: number; method: DeclarationPaymentMethod; reference: string }>({
    amount: 0,
    method: 'bank_transfer',
    reference: '',
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const { data: declarations = [], isLoading, isError, error } = useDeclarations({ year });
  const { data: periods = [] } = usePayrollPeriods();
  const validatedPeriods = periods.filter(period => ['validated', 'paid', 'closed'].includes(period.status));

  const generate = useGenerateDeclaration();
  const annualSummary = useGenerateAnnualSummary();
  const validate = useValidateDeclaration();
  const submit = useSubmitDeclaration();
  const recordPayment = useRecordDeclarationPayment();

  const notify = (message: string, severity: SnackbarState['severity'] = 'success') =>
    setSnackbar({ open: true, message, severity });

  const onError = (err: unknown) => notify(getPayrollErrorMessage(err), 'error');

  const handleGenerate = () => {
    if (!generateForm.periodId) return;

    generate.mutate(
      { periodId: generateForm.periodId, type: generateForm.type },
      {
        onSuccess: () => {
          setGenerateOpen(false);
          notify('Déclaration générée');
        },
        onError,
      },
    );
  };

  const handleSubmit = () => {
    if (!submitting) return;

    submit.mutate(
      { declarationId: submitting.id, data: { reference: submitReference } },
      {
        onSuccess: () => {
          setSubmitting(null);
          notify('Déclaration soumise');
        },
        onError,
      },
    );
  };

  const handlePayment = () => {
    if (!paying) return;

    recordPayment.mutate(
      { declarationId: paying.id, data: payment },
      {
        onSuccess: () => {
          setPaying(null);
          notify('Paiement enregistré');
        },
        onError,
      },
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight="bold">
          Déclarations Sociales
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            type="number"
            label="Année"
            value={year}
            onChange={event => setYear(Number(event.target.value))}
            sx={{ width: 110 }}
          />
          <Button
            variant="outlined"
            disabled={annualSummary.isPending}
            onClick={() => annualSummary.mutate(year, { onSuccess: () => notify('Récapitulatif annuel généré'), onError })}
          >
            Récapitulatif annuel {year}
          </Button>
          <Button variant="contained" onClick={() => setGenerateOpen(true)}>
            + Générer une déclaration
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          {isError && <Alert severity="error">{getPayrollErrorMessage(error, 'Impossible de charger les déclarations')}</Alert>}
          {isLoading ? (
            <CircularProgress />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>N°</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Période</TableCell>
                    <TableCell>Échéance</TableCell>
                    <TableCell align="right">Montant dû</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {declarations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Aucune déclaration pour {year}. Les déclarations se génèrent à partir d’une paie validée.
                      </TableCell>
                    </TableRow>
                  )}
                  {declarations.map(declaration => (
                    <TableRow key={declaration.id}>
                      <TableCell>{declaration.declaration_number}</TableCell>
                      <TableCell>{DECLARATION_TYPE_LABELS[declaration.declaration_type] ?? declaration.declaration_type}</TableCell>
                      <TableCell>
                        {declaration.payroll_period?.name ??
                          (declaration.month ? `${declaration.month}/${declaration.year}` : declaration.year)}
                      </TableCell>
                      <TableCell>{formatDate(declaration.due_date)}</TableCell>
                      <TableCell align="right">{formatCurrency(declaration.total_amount_due)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={DECLARATION_STATUS_LABELS[declaration.status]}
                          color={DECLARATION_STATUS_COLORS[declaration.status]}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {declaration.status === 'draft' && (
                          <Button
                            size="small"
                            disabled={validate.isPending}
                            onClick={() =>
                              validate.mutate(declaration.id, { onSuccess: () => notify('Déclaration validée'), onError })
                            }
                          >
                            Valider
                          </Button>
                        )}
                        {declaration.status === 'validated' && (
                          <Button
                            size="small"
                            onClick={() => {
                              setSubmitReference('');
                              setSubmitting(declaration);
                            }}
                          >
                            Soumettre
                          </Button>
                        )}
                        {PAYABLE_STATUSES.includes(declaration.status) && (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => {
                              setPayment({
                                amount: toNumber(declaration.total_amount_due),
                                method: 'bank_transfer',
                                reference: '',
                              });
                              setPaying(declaration);
                            }}
                          >
                            Payer
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={generateOpen} onClose={() => setGenerateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Générer une déclaration</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {validatedPeriods.length === 0 && (
              <Alert severity="warning">Aucune période de paie validée : validez d’abord une paie.</Alert>
            )}
            <TextField
              select
              label="Période de paie (validée)"
              value={generateForm.periodId ?? ''}
              onChange={event => setGenerateForm(prev => ({ ...prev, periodId: Number(event.target.value) }))}
            >
              {validatedPeriods.map(period => (
                <MenuItem key={period.id} value={period.id}>
                  {period.name || period.period_code}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Type"
              value={generateForm.type}
              onChange={event =>
                setGenerateForm(prev => ({ ...prev, type: event.target.value as GeneratedDeclarationType }))
              }
            >
              {GENERATED_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleGenerate} disabled={generate.isPending || !generateForm.periodId}>
            Générer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!submitting} onClose={() => setSubmitting(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Soumettre {submitting?.declaration_number}</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 1 }}
            fullWidth
            label="Référence de dépôt"
            value={submitReference}
            onChange={event => setSubmitReference(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitting(null)}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submit.isPending || !submitReference}>
            Soumettre
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!paying} onClose={() => setPaying(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Paiement {paying?.declaration_number}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Montant (FCFA)"
              type="number"
              value={payment.amount}
              onChange={event => setPayment(prev => ({ ...prev, amount: Number(event.target.value) }))}
            />
            <TextField
              select
              label="Mode de paiement"
              value={payment.method}
              onChange={event => setPayment(prev => ({ ...prev, method: event.target.value as DeclarationPaymentMethod }))}
            >
              <MenuItem value="bank_transfer">Virement</MenuItem>
              <MenuItem value="check">Chèque</MenuItem>
              <MenuItem value="online">En ligne</MenuItem>
              <MenuItem value="other">Autre</MenuItem>
            </TextField>
            <TextField
              label="Référence"
              value={payment.reference}
              onChange={event => setPayment(prev => ({ ...prev, reference: event.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaying(null)}>Annuler</Button>
          <Button variant="contained" onClick={handlePayment} disabled={recordPayment.isPending || !payment.reference}>
            Enregistrer
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
