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
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  useActivateContract,
  useCreateContract,
  useCreateEmployee,
  useDeleteEmployee,
  useEmployee,
  useEmployees,
  useTerminateContract,
} from '../hooks';
import { formatCurrency, formatDate, getPayrollErrorMessage } from '../utils/payrollFormatters';
import {
  CONTRACT_STATUS_COLORS,
  CONTRACT_STATUS_LABELS,
  CONTRACT_TYPE_LABELS,
  EMPLOYEE_STATUS_COLORS,
  EMPLOYEE_STATUS_LABELS,
} from '../../types';
import type {
  Contract,
  ContractType,
  CreateContractRequest,
  CreateEmployeeRequest,
  Employee,
  EmployeeStatus,
} from '../../types';

type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' };

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_EMPLOYEE: CreateEmployeeRequest = {
  first_name: '',
  last_name: '',
  email: '',
  hire_date: today(),
  phone: '',
  department: '',
  position: '',
  cnss_number: '',
  bank_name: '',
  bank_account_number: '',
};

const EMPTY_CONTRACT: CreateContractRequest = {
  contract_type: 'permanent',
  start_date: today(),
  end_date: null,
  base_salary: 0,
};

const activeContractOf = (employee: Employee): Contract | undefined =>
  employee.contracts?.find(contract => contract.status === 'active');

/** Remove empty optional values so that backend validation does not reject them. */
const compact = <T extends object>(payload: T): T =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== null)) as T;

export const EmployeeDashboard: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EmployeeStatus | ''>('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const [createOpen, setCreateOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<CreateEmployeeRequest>(EMPTY_EMPLOYEE);
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [contractForm, setContractForm] = useState<CreateContractRequest | null>(null);
  const [terminating, setTerminating] = useState<Contract | null>(null);
  const [termination, setTermination] = useState({ termination_date: today(), reason: '' });
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const { data, isLoading, isError, error } = useEmployees({
    search: search || undefined,
    status: status || undefined,
    page: page + 1,
    per_page: perPage,
  });

  const { data: selected, isLoading: isLoadingSelected } = useEmployee(selectedId);

  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const createContract = useCreateContract();
  const activateContract = useActivateContract();
  const terminateContract = useTerminateContract();

  const notify = (message: string, severity: SnackbarState['severity'] = 'success') =>
    setSnackbar({ open: true, message, severity });

  const onError = (err: unknown) => notify(getPayrollErrorMessage(err), 'error');

  const employees = data?.data ?? [];

  const handleCreateEmployee = () => {
    createEmployee.mutate(compact(employeeForm), {
      onSuccess: () => {
        setCreateOpen(false);
        setEmployeeForm(EMPTY_EMPLOYEE);
        notify('Employé créé avec succès');
      },
      onError,
    });
  };

  const handleDeleteEmployee = (employee: Employee) => {
    if (!window.confirm(`Supprimer l'employé ${employee.first_name} ${employee.last_name} ?`)) return;

    deleteEmployee.mutate(employee.id, {
      onSuccess: () => notify('Employé supprimé'),
      onError,
    });
  };

  const handleCreateContract = () => {
    if (!selectedId || !contractForm) return;

    createContract.mutate(
      { employeeId: selectedId, data: compact({ ...contractForm, base_salary: Number(contractForm.base_salary) }) },
      {
        onSuccess: () => {
          setContractForm(null);
          notify('Contrat créé (brouillon). Activez-le pour l’inclure dans la paie.');
        },
        onError,
      },
    );
  };

  const handleActivateContract = (contract: Contract) => {
    activateContract.mutate(
      { employeeId: contract.employee_id, contractId: contract.id },
      { onSuccess: () => notify('Contrat activé'), onError },
    );
  };

  const handleTerminateContract = () => {
    if (!terminating) return;

    terminateContract.mutate(
      { employeeId: terminating.employee_id, contractId: terminating.id, data: termination },
      {
        onSuccess: () => {
          setTerminating(null);
          notify('Contrat résilié');
        },
        onError,
      },
    );
  };

  const setField = (field: keyof CreateEmployeeRequest) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setEmployeeForm(prev => ({ ...prev, [field]: event.target.value }));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Employés
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          + Nouvel employé
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Rechercher (nom, matricule, email)"
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 280 }}
          />
          <TextField
            select
            size="small"
            label="Statut"
            value={status}
            onChange={event => {
              setStatus(event.target.value as EmployeeStatus | '');
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Tous</MenuItem>
            {Object.entries(EMPLOYEE_STATUS_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isError && <Alert severity="error">{getPayrollErrorMessage(error, 'Impossible de charger les employés')}</Alert>}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Nom complet</TableCell>
                    <TableCell>Département / Poste</TableCell>
                    <TableCell>Contrat</TableCell>
                    <TableCell align="right">Salaire de base</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary" sx={{ py: 3 }}>
                          Aucun employé enregistré.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {employees.map(employee => {
                    const contract = activeContractOf(employee);

                    return (
                      <TableRow key={employee.id} hover>
                        <TableCell>{employee.employee_code}</TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">
                            {employee.first_name} {employee.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{employee.department || '—'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.position || ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {contract ? (
                            <Chip size="small" label={CONTRACT_TYPE_LABELS[contract.contract_type]} color="primary" />
                          ) : (
                            <Chip size="small" label="Aucun contrat actif" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell align="right">{contract ? formatCurrency(contract.base_salary) : '—'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={EMPLOYEE_STATUS_LABELS[employee.status]}
                            color={EMPLOYEE_STATUS_COLORS[employee.status]}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button size="small" variant="outlined" onClick={() => setSelectedId(employee.id)}>
                              Détails
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteEmployee(employee)}
                            >
                              Supprimer
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            component="div"
            count={data?.total ?? 0}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={perPage}
            onRowsPerPageChange={event => {
              setPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[15, 30, 50]}
            labelRowsPerPage="Lignes par page"
          />
        </CardContent>
      </Card>

      {/* Détail employé + contrats */}
      <Dialog open={!!selectedId} onClose={() => setSelectedId(undefined)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selected ? `${selected.first_name} ${selected.last_name} — ${selected.employee_code}` : 'Employé'}
        </DialogTitle>
        <DialogContent>
          {isLoadingSelected || !selected ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography>{selected.email}</Typography>
                  <Typography>{selected.phone || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Poste
                  </Typography>
                  <Typography>
                    {selected.department || '—'} / {selected.position || '—'}
                  </Typography>
                  <Typography>Embauché le {formatDate(selected.hire_date)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Banque
                  </Typography>
                  <Typography>
                    {selected.bank_name || '—'} {selected.bank_account_number || ''}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    N° CNSS
                  </Typography>
                  <Typography>{selected.cnss_number || '—'}</Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Contrats</Typography>
                <Button size="small" variant="contained" onClick={() => setContractForm(EMPTY_CONTRACT)}>
                  + Nouveau contrat
                </Button>
              </Box>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>N°</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Période</TableCell>
                    <TableCell align="right">Salaire de base</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(selected.contracts ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Aucun contrat. Un contrat actif est requis pour inclure l’employé dans la paie.
                      </TableCell>
                    </TableRow>
                  )}
                  {(selected.contracts ?? []).map(contract => (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.contract_number}</TableCell>
                      <TableCell>{CONTRACT_TYPE_LABELS[contract.contract_type]}</TableCell>
                      <TableCell>
                        {formatDate(contract.start_date)} → {contract.end_date ? formatDate(contract.end_date) : '…'}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(contract.base_salary)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={CONTRACT_STATUS_LABELS[contract.status]}
                          color={CONTRACT_STATUS_COLORS[contract.status]}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {contract.status === 'draft' && (
                          <Button
                            size="small"
                            onClick={() => handleActivateContract(contract)}
                            disabled={activateContract.isPending}
                          >
                            Activer
                          </Button>
                        )}
                        {contract.status === 'active' && (
                          <Button size="small" color="error" onClick={() => setTerminating(contract)}>
                            Résilier
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedId(undefined)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Création employé */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvel employé</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 6 }}>
              <TextField label="Prénom" required fullWidth value={employeeForm.first_name} onChange={setField('first_name')} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Nom" required fullWidth value={employeeForm.last_name} onChange={setField('last_name')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Email" type="email" required fullWidth value={employeeForm.email} onChange={setField('email')} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Téléphone" fullWidth value={employeeForm.phone} onChange={setField('phone')} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Date d'embauche"
                type="date"
                required
                fullWidth
                value={employeeForm.hire_date}
                onChange={setField('hire_date')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Département / Service" fullWidth value={employeeForm.department} onChange={setField('department')} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Poste" fullWidth value={employeeForm.position} onChange={setField('position')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="N° CNSS" fullWidth value={employeeForm.cnss_number} onChange={setField('cnss_number')} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Banque" fullWidth value={employeeForm.bank_name} onChange={setField('bank_name')} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="N° de compte"
                fullWidth
                value={employeeForm.bank_account_number}
                onChange={setField('bank_account_number')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreateEmployee}
            disabled={
              createEmployee.isPending ||
              !employeeForm.first_name ||
              !employeeForm.last_name ||
              !employeeForm.email ||
              !employeeForm.hire_date
            }
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Création contrat */}
      <Dialog open={!!contractForm} onClose={() => setContractForm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Nouveau contrat</DialogTitle>
        {contractForm && (
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                select
                label="Type de contrat"
                value={contractForm.contract_type}
                onChange={event => setContractForm({ ...contractForm, contract_type: event.target.value as ContractType })}
              >
                {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Date de début"
                type="date"
                value={contractForm.start_date}
                onChange={event => setContractForm({ ...contractForm, start_date: event.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Date de fin (CDD)"
                type="date"
                value={contractForm.end_date ?? ''}
                onChange={event => setContractForm({ ...contractForm, end_date: event.target.value || null })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Salaire de base mensuel (FCFA)"
                type="number"
                value={contractForm.base_salary || ''}
                onChange={event => setContractForm({ ...contractForm, base_salary: Number(event.target.value) })}
              />
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setContractForm(null)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreateContract}
            disabled={createContract.isPending || !contractForm?.start_date || !contractForm?.base_salary}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Résiliation */}
      <Dialog open={!!terminating} onClose={() => setTerminating(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Résilier le contrat {terminating?.contract_number}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Date de fin"
              type="date"
              value={termination.termination_date}
              onChange={event => setTermination(prev => ({ ...prev, termination_date: event.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Motif"
              multiline
              minRows={2}
              value={termination.reason}
              onChange={event => setTermination(prev => ({ ...prev, reason: event.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTerminating(null)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleTerminateContract}
            disabled={terminateContract.isPending || !termination.reason}
          >
            Résilier
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
