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
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  useAdvances,
  useApproveAdvance,
  useCreatePayrollComponent,
  useCreateSalaryScale,
  useDisburseAdvance,
  useEmployees,
  usePayrollComponents,
  useRequestAdvance,
  useSalaryScales,
} from '../hooks';
import { formatCurrency, formatDate, getPayrollErrorMessage } from '../utils/payrollFormatters';
import {
  ADVANCE_STATUS_COLORS,
  ADVANCE_STATUS_LABELS,
  ADVANCE_TYPE_LABELS,
  CALCULATION_TYPE_LABELS,
  COMPONENT_TYPE_LABELS,
  SALARY_SCALE_TYPE_LABELS,
} from '../../types';
import type {
  Advance,
  AdvanceType,
  CalculationType,
  ComponentType,
  CreateAdvanceRequest,
  CreatePayrollComponentRequest,
  CreateSalaryScaleRequest,
  DisbursementMethod,
  PayrollComponent,
  SalaryScaleType,
} from '../../types';

type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' };

const today = () => new Date().toISOString().slice(0, 10);

const componentValue = (component: PayrollComponent): string => {
  if (component.calculation_type === 'percentage') return `${Number(component.percentage ?? 0)} %`;
  if (component.calculation_type === 'fixed') return formatCurrency(component.amount);

  return `${formatCurrency(component.rate)} / ${component.calculation_type === 'hourly' ? 'h' : 'j'}`;
};

export const PayrollComponentsDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [scaleForm, setScaleForm] = useState<CreateSalaryScaleRequest | null>(null);
  const [componentForm, setComponentForm] = useState<Partial<CreatePayrollComponentRequest> | null>(null);
  const [advanceForm, setAdvanceForm] = useState<Partial<CreateAdvanceRequest> | null>(null);
  const [disbursing, setDisbursing] = useState<Advance | null>(null);
  const [disburseMethod, setDisburseMethod] = useState<DisbursementMethod>('cash');

  const scales = useSalaryScales();
  const components = usePayrollComponents();
  const advances = useAdvances();
  const { data: employeesPage } = useEmployees({ status: 'active', per_page: 200 });
  const employees = employeesPage?.data ?? [];

  const createScale = useCreateSalaryScale();
  const createComponent = useCreatePayrollComponent();
  const requestAdvance = useRequestAdvance();
  const approveAdvance = useApproveAdvance();
  const disburseAdvance = useDisburseAdvance();

  const notify = (message: string, severity: SnackbarState['severity'] = 'success') =>
    setSnackbar({ open: true, message, severity });

  const onError = (err: unknown) => notify(getPayrollErrorMessage(err), 'error');

  const employeeName = (employee?: { first_name: string; last_name: string }) =>
    employee ? `${employee.first_name} ${employee.last_name}` : '—';

  const employeeSelect = (value: number | undefined, onChange: (id: number) => void) => (
    <TextField select label="Employé" value={value ?? ''} onChange={event => onChange(Number(event.target.value))}>
      {employees.map(employee => (
        <MenuItem key={employee.id} value={employee.id}>
          {employee.employee_code} — {employee.first_name} {employee.last_name}
        </MenuItem>
      ))}
    </TextField>
  );

  const handleCreateScale = () => {
    if (!scaleForm) return;

    createScale.mutate(scaleForm, {
      onSuccess: () => {
        setScaleForm(null);
        notify('Grille salariale créée');
      },
      onError,
    });
  };

  const handleCreateComponent = () => {
    if (!componentForm) return;

    createComponent.mutate(componentForm as CreatePayrollComponentRequest, {
      onSuccess: () => {
        setComponentForm(null);
        notify('Élément de paie créé');
      },
      onError,
    });
  };

  const handleRequestAdvance = () => {
    if (!advanceForm) return;

    requestAdvance.mutate(advanceForm as CreateAdvanceRequest, {
      onSuccess: () => {
        setAdvanceForm(null);
        notify('Demande d’avance enregistrée');
      },
      onError,
    });
  };

  const handleDisburse = () => {
    if (!disbursing) return;

    disburseAdvance.mutate(
      { advanceId: disbursing.id, data: { method: disburseMethod } },
      {
        onSuccess: () => {
          setDisbursing(null);
          notify('Avance décaissée');
        },
        onError,
      },
    );
  };

  const loadingOrError = (query: { isLoading: boolean; isError: boolean; error: unknown }) => (
    <>
      {query.isLoading && <CircularProgress size={24} />}
      {query.isError && <Alert severity="error">{getPayrollErrorMessage(query.error, 'Chargement impossible')}</Alert>}
    </>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Éléments de Paie
      </Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label="Primes, indemnités & retenues" />
        <Tab label="Avances sur salaire" />
        <Tab label="Grilles salariales" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Éléments par employé</Typography>
              <Button
                variant="contained"
                onClick={() => setComponentForm({ component_type: 'allowance', calculation_type: 'fixed', name: '' })}
              >
                + Nouvel élément
              </Button>
            </Box>
            {loadingOrError(components)}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employé</TableCell>
                  <TableCell>Libellé</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Calcul</TableCell>
                  <TableCell align="right">Valeur</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(components.data ?? []).length === 0 && !components.isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun élément de paie.
                    </TableCell>
                  </TableRow>
                )}
                {(components.data ?? []).map(component => (
                  <TableRow key={component.id}>
                    <TableCell>{employeeName(component.employee)}</TableCell>
                    <TableCell>{component.name}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={COMPONENT_TYPE_LABELS[component.component_type] ?? component.component_type}
                        color={component.component_type === 'deduction' ? 'error' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>{CALCULATION_TYPE_LABELS[component.calculation_type]}</TableCell>
                    <TableCell align="right">{componentValue(component)}</TableCell>
                    <TableCell>{component.status === 'active' ? 'Actif' : component.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Avances</Typography>
              <Button
                variant="contained"
                onClick={() => setAdvanceForm({ advance_type: 'salary_advance', number_of_installments: 1, reason: '' })}
              >
                + Demande d’avance
              </Button>
            </Box>
            {loadingOrError(advances)}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>N°</TableCell>
                  <TableCell>Employé</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Montant</TableCell>
                  <TableCell align="right">Solde</TableCell>
                  <TableCell>Demandée le</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(advances.data ?? []).length === 0 && !advances.isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Aucune avance.
                    </TableCell>
                  </TableRow>
                )}
                {(advances.data ?? []).map(advance => (
                  <TableRow key={advance.id}>
                    <TableCell>{advance.advance_number}</TableCell>
                    <TableCell>{employeeName(advance.employee)}</TableCell>
                    <TableCell>{ADVANCE_TYPE_LABELS[advance.advance_type]}</TableCell>
                    <TableCell align="right">{formatCurrency(advance.amount)}</TableCell>
                    <TableCell align="right">{formatCurrency(advance.balance)}</TableCell>
                    <TableCell>{formatDate(advance.request_date)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ADVANCE_STATUS_LABELS[advance.status]}
                        color={ADVANCE_STATUS_COLORS[advance.status]}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {advance.status === 'pending' && (
                        <Button
                          size="small"
                          disabled={approveAdvance.isPending}
                          onClick={() =>
                            approveAdvance.mutate(advance.id, { onSuccess: () => notify('Avance approuvée'), onError })
                          }
                        >
                          Approuver
                        </Button>
                      )}
                      {advance.status === 'approved' && (
                        <Button size="small" onClick={() => setDisbursing(advance)}>
                          Décaisser
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Grilles salariales</Typography>
              <Button
                variant="contained"
                onClick={() =>
                  setScaleForm({
                    code: '',
                    name: '',
                    type: 'teaching',
                    effective_from: today(),
                    grades: [{ grade: '', min_salary: 0, max_salary: 0 }],
                  })
                }
              >
                + Nouvelle grille
              </Button>
            </Box>
            {loadingOrError(scales)}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Échelons</TableCell>
                  <TableCell>En vigueur depuis</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(scales.data ?? []).length === 0 && !scales.isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Aucune grille salariale.
                    </TableCell>
                  </TableRow>
                )}
                {(scales.data ?? []).map(scale => (
                  <TableRow key={scale.id}>
                    <TableCell>{scale.code}</TableCell>
                    <TableCell>{scale.name}</TableCell>
                    <TableCell>{SALARY_SCALE_TYPE_LABELS[scale.type]}</TableCell>
                    <TableCell>
                      {(scale.grades ?? []).map(grade => (
                        <Typography key={grade.grade} variant="body2">
                          {grade.grade} : {formatCurrency(grade.min_salary)} – {formatCurrency(grade.max_salary)}
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell>{formatDate(scale.effective_from)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Nouvel élément de paie */}
      <Dialog open={!!componentForm} onClose={() => setComponentForm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Nouvel élément de paie</DialogTitle>
        {componentForm && (
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {employeeSelect(componentForm.employee_id, id => setComponentForm({ ...componentForm, employee_id: id }))}
              <TextField
                select
                label="Type"
                value={componentForm.component_type}
                onChange={event =>
                  setComponentForm({ ...componentForm, component_type: event.target.value as ComponentType })
                }
              >
                {Object.entries(COMPONENT_TYPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Libellé"
                value={componentForm.name ?? ''}
                onChange={event => setComponentForm({ ...componentForm, name: event.target.value })}
              />
              <TextField
                select
                label="Mode de calcul"
                value={componentForm.calculation_type}
                onChange={event =>
                  setComponentForm({ ...componentForm, calculation_type: event.target.value as CalculationType })
                }
              >
                {(['fixed', 'percentage'] as CalculationType[]).map(value => (
                  <MenuItem key={value} value={value}>
                    {CALCULATION_TYPE_LABELS[value]}
                  </MenuItem>
                ))}
              </TextField>
              {componentForm.calculation_type === 'percentage' ? (
                <TextField
                  label="Pourcentage du salaire de base"
                  type="number"
                  value={componentForm.percentage ?? ''}
                  onChange={event => setComponentForm({ ...componentForm, percentage: Number(event.target.value) })}
                />
              ) : (
                <TextField
                  label="Montant mensuel (FCFA)"
                  type="number"
                  value={componentForm.amount ?? ''}
                  onChange={event => setComponentForm({ ...componentForm, amount: Number(event.target.value) })}
                />
              )}
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setComponentForm(null)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreateComponent}
            disabled={createComponent.isPending || !componentForm?.employee_id || !componentForm?.name}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Demande d'avance */}
      <Dialog open={!!advanceForm} onClose={() => setAdvanceForm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Demande d’avance</DialogTitle>
        {advanceForm && (
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {employeeSelect(advanceForm.employee_id, id => setAdvanceForm({ ...advanceForm, employee_id: id }))}
              <TextField
                select
                label="Type"
                value={advanceForm.advance_type}
                onChange={event => setAdvanceForm({ ...advanceForm, advance_type: event.target.value as AdvanceType })}
              >
                {Object.entries(ADVANCE_TYPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Montant (FCFA)"
                type="number"
                value={advanceForm.amount ?? ''}
                onChange={event => setAdvanceForm({ ...advanceForm, amount: Number(event.target.value) })}
              />
              <TextField
                label="Nombre de mensualités"
                type="number"
                value={advanceForm.number_of_installments ?? 1}
                onChange={event =>
                  setAdvanceForm({ ...advanceForm, number_of_installments: Math.max(1, Number(event.target.value)) })
                }
              />
              <TextField
                label="Motif"
                multiline
                minRows={2}
                value={advanceForm.reason ?? ''}
                onChange={event => setAdvanceForm({ ...advanceForm, reason: event.target.value })}
              />
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setAdvanceForm(null)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleRequestAdvance}
            disabled={
              requestAdvance.isPending || !advanceForm?.employee_id || !advanceForm?.amount || !advanceForm?.reason
            }
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Décaissement */}
      <Dialog open={!!disbursing} onClose={() => setDisbursing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Décaisser l’avance {disbursing?.advance_number}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            sx={{ mt: 1 }}
            label="Mode de décaissement"
            value={disburseMethod}
            onChange={event => setDisburseMethod(event.target.value as DisbursementMethod)}
          >
            <MenuItem value="cash">Espèces</MenuItem>
            <MenuItem value="bank_transfer">Virement</MenuItem>
            <MenuItem value="check">Chèque</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisbursing(null)}>Annuler</Button>
          <Button variant="contained" onClick={handleDisburse} disabled={disburseAdvance.isPending}>
            Décaisser
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nouvelle grille */}
      <Dialog open={!!scaleForm} onClose={() => setScaleForm(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle grille salariale</DialogTitle>
        {scaleForm && (
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Code"
                value={scaleForm.code}
                onChange={event => setScaleForm({ ...scaleForm, code: event.target.value })}
              />
              <TextField
                label="Nom"
                value={scaleForm.name}
                onChange={event => setScaleForm({ ...scaleForm, name: event.target.value })}
              />
              <TextField
                select
                label="Catégorie"
                value={scaleForm.type}
                onChange={event => setScaleForm({ ...scaleForm, type: event.target.value as SalaryScaleType })}
              >
                {Object.entries(SALARY_SCALE_TYPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="En vigueur à partir du"
                type="date"
                value={scaleForm.effective_from}
                onChange={event => setScaleForm({ ...scaleForm, effective_from: event.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Typography variant="subtitle2">Échelons</Typography>
              {scaleForm.grades.map((grade, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Échelon"
                    value={grade.grade}
                    onChange={event => {
                      const grades = [...scaleForm.grades];

                      grades[index] = { ...grade, grade: event.target.value };
                      setScaleForm({ ...scaleForm, grades });
                    }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Min"
                    value={grade.min_salary || ''}
                    onChange={event => {
                      const grades = [...scaleForm.grades];

                      grades[index] = { ...grade, min_salary: Number(event.target.value) };
                      setScaleForm({ ...scaleForm, grades });
                    }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Max"
                    value={grade.max_salary || ''}
                    onChange={event => {
                      const grades = [...scaleForm.grades];

                      grades[index] = { ...grade, max_salary: Number(event.target.value) };
                      setScaleForm({ ...scaleForm, grades });
                    }}
                  />
                </Box>
              ))}
              <Button
                size="small"
                onClick={() =>
                  setScaleForm({ ...scaleForm, grades: [...scaleForm.grades, { grade: '', min_salary: 0, max_salary: 0 }] })
                }
              >
                + Ajouter un échelon
              </Button>
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setScaleForm(null)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreateScale}
            disabled={createScale.isPending || !scaleForm?.code || !scaleForm?.name}
          >
            Créer
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
