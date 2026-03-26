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

import type {
  Employee,
  Contract,
  ContractStatus,
  ContractType,
} from '../../types';

import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_COLORS,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'EMP-001',
    email: 'amadou.diallo@ecole.ne', phone: '+227 90 12 34 56',
    date_of_birth: '1985-03-15', hire_date: '2020-09-01',
    department_id: 1, position: 'Enseignant permanent', photo: null, is_active: true,
    department: { id: 1, name: 'Informatique', code: 'INFO' },
    current_contract: {
      id: 1, employee_id: 1, type: 'CDI', start_date: '2020-09-01', end_date: null,
      base_salary: 450000, status: 'active', description: null,
      created_at: '2020-09-01T00:00:00', updated_at: '2020-09-01T00:00:00',
    },
    created_at: '2020-09-01T00:00:00', updated_at: '2026-01-15T00:00:00',
  },
  {
    id: 2, firstname: 'Fatima', lastname: 'Moussa', matricule: 'EMP-002',
    email: 'fatima.moussa@ecole.ne', phone: '+227 91 23 45 67',
    date_of_birth: '1990-07-22', hire_date: '2022-01-10',
    department_id: 2, position: 'Secrétaire administrative', photo: null, is_active: true,
    department: { id: 2, name: 'Administration', code: 'ADMIN' },
    current_contract: {
      id: 2, employee_id: 2, type: 'CDI', start_date: '2022-01-10', end_date: null,
      base_salary: 300000, status: 'active', description: null,
      created_at: '2022-01-10T00:00:00', updated_at: '2022-01-10T00:00:00',
    },
    created_at: '2022-01-10T00:00:00', updated_at: '2026-02-20T00:00:00',
  },
  {
    id: 3, firstname: 'Ibrahim', lastname: 'Souleymane', matricule: 'EMP-003',
    email: 'ibrahim.souleymane@ecole.ne', phone: '+227 92 34 56 78',
    date_of_birth: '1988-11-05', hire_date: '2023-03-01',
    department_id: 1, position: 'Enseignant vacataire', photo: null, is_active: true,
    department: { id: 1, name: 'Informatique', code: 'INFO' },
    current_contract: {
      id: 3, employee_id: 3, type: 'CDD', start_date: '2023-03-01', end_date: '2026-08-31',
      base_salary: 350000, status: 'active', description: 'Contrat vacataire annuel',
      created_at: '2023-03-01T00:00:00', updated_at: '2023-03-01T00:00:00',
    },
    created_at: '2023-03-01T00:00:00', updated_at: '2026-03-01T00:00:00',
  },
  {
    id: 4, firstname: 'Aïssa', lastname: 'Abdou', matricule: 'EMP-004',
    email: 'aissa.abdou@ecole.ne', phone: '+227 93 45 67 89',
    date_of_birth: '1995-01-18', hire_date: '2025-10-01',
    department_id: 3, position: 'Stagiaire comptabilité', photo: null, is_active: true,
    department: { id: 3, name: 'Comptabilité', code: 'COMPTA' },
    current_contract: {
      id: 4, employee_id: 4, type: 'Stage', start_date: '2025-10-01', end_date: '2026-03-31',
      base_salary: 100000, status: 'active', description: 'Stage de fin d\'études',
      created_at: '2025-10-01T00:00:00', updated_at: '2025-10-01T00:00:00',
    },
    created_at: '2025-10-01T00:00:00', updated_at: '2025-10-01T00:00:00',
  },
  {
    id: 5, firstname: 'Moussa', lastname: 'Garba', matricule: 'EMP-005',
    email: 'moussa.garba@ecole.ne', phone: '+227 94 56 78 90',
    date_of_birth: '1980-06-30', hire_date: '2018-01-15',
    department_id: 4, position: 'Agent de maintenance', photo: null, is_active: false,
    department: { id: 4, name: 'Services généraux', code: 'SG' },
    current_contract: {
      id: 5, employee_id: 5, type: 'CDI', start_date: '2018-01-15', end_date: '2025-12-31',
      base_salary: 200000, status: 'terminated', description: null,
      created_at: '2018-01-15T00:00:00', updated_at: '2025-12-31T00:00:00',
    },
    created_at: '2018-01-15T00:00:00', updated_at: '2025-12-31T00:00:00',
  },
];

const getContractStatusChipColor = (status: ContractStatus): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'active': return 'success';
    case 'suspended': return 'warning';
    case 'terminated': return 'error';
    case 'expired': return 'default';
    default: return 'default';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

export const EmployeeDashboard: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const employees = DEMO_EMPLOYEES;

  const handleViewDetail = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailOpen(true);
  }, []);

  const handleTerminate = useCallback((employee: Employee) => {
    setSnackbar({ open: true, message: `Contrat de ${employee.firstname} ${employee.lastname} résilié`, severity: 'success' });
  }, []);

  const activeCount = employees.filter(e => e.is_active).length;
  const cdiCount = employees.filter(e => e.current_contract?.type === 'CDI').length;
  const totalMass = employees.filter(e => e.is_active).reduce((sum, e) => sum + (e.current_contract?.base_salary || 0), 0);
  const terminatedCount = employees.filter(e => !e.is_active).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Paie & RH
        </Link>
        <Typography color="text.primary">Employés</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Employés
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          + Nouvel Employé
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Employés actifs', value: activeCount, color: '#4caf50' },
          { label: 'Contrats CDI', value: cdiCount, color: '#1976d2' },
          { label: 'Masse salariale', value: formatCurrency(totalMass), color: '#ff9800' },
          { label: 'Contrats terminés', value: terminatedCount, color: '#f44336' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color, fontSize: typeof stat.value === 'string' ? '1.5rem' : undefined }}>
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

      {/* Employees Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Liste des Employés</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Matricule</TableCell>
                  <TableCell>Nom complet</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Poste</TableCell>
                  <TableCell>Type contrat</TableCell>
                  <TableCell>Salaire de base</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map(employee => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{employee.matricule}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">{employee.firstname} {employee.lastname}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {employee.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">{employee.department?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {employee.department?.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      {employee.current_contract && (
                        <Chip
                          size="small"
                          label={CONTRACT_TYPE_LABELS[employee.current_contract.type]}
                          sx={{ bgcolor: CONTRACT_TYPE_COLORS[employee.current_contract.type], color: 'white' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {employee.current_contract ? formatCurrency(employee.current_contract.base_salary) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={employee.is_active ? 'Actif' : 'Inactif'}
                        color={employee.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetail(employee)}
                        >
                          Détails
                        </Button>
                        {employee.is_active && employee.current_contract?.status === 'active' && (
                          <Tooltip title="Résilier le contrat">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleTerminate(employee)}
                            >
                              Résilier
                            </Button>
                          </Tooltip>
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
              <Typography variant="h6">{selectedEmployee?.firstname} {selectedEmployee?.lastname}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEmployee?.matricule} - {selectedEmployee?.position}
              </Typography>
            </Box>
            <Chip
              label={selectedEmployee?.is_active ? 'Actif' : 'Inactif'}
              color={selectedEmployee?.is_active ? 'success' : 'default'}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                <Typography fontWeight="bold">{selectedEmployee?.email}</Typography>
                <Typography>{selectedEmployee?.phone}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Département</Typography>
                <Typography fontWeight="bold">{selectedEmployee?.department?.name}</Typography>
                <Typography>{selectedEmployee?.position}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Contrat actuel</Typography>
                {selectedEmployee?.current_contract && (
                  <>
                    <Chip
                      size="small"
                      label={CONTRACT_TYPE_LABELS[selectedEmployee.current_contract.type]}
                      sx={{ bgcolor: CONTRACT_TYPE_COLORS[selectedEmployee.current_contract.type], color: 'white', mb: 1 }}
                    />
                    <Typography>
                      Depuis le {new Date(selectedEmployee.current_contract.start_date).toLocaleDateString('fr-FR')}
                    </Typography>
                    {selectedEmployee.current_contract.end_date && (
                      <Typography variant="caption" color="text.secondary">
                        Fin : {new Date(selectedEmployee.current_contract.end_date).toLocaleDateString('fr-FR')}
                      </Typography>
                    )}
                  </>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Salaire de base</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {selectedEmployee?.current_contract ? formatCurrency(selectedEmployee.current_contract.base_salary) : '-'}
                </Typography>
                {selectedEmployee?.current_contract && (
                  <Chip
                    size="small"
                    label={CONTRACT_STATUS_LABELS[selectedEmployee.current_contract.status]}
                    color={getContractStatusChipColor(selectedEmployee.current_contract.status)}
                  />
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Informations personnelles</Typography>
                <Typography>
                  Date de naissance : {selectedEmployee?.date_of_birth ? new Date(selectedEmployee.date_of_birth).toLocaleDateString('fr-FR') : 'Non renseigné'}
                </Typography>
                <Typography>
                  Date d&apos;embauche : {selectedEmployee && new Date(selectedEmployee.hire_date).toLocaleDateString('fr-FR')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Create Employee Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvel Employé</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField label="Prénom" fullWidth />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="Nom" fullWidth />
              </Grid>
            </Grid>
            <TextField label="Matricule" fullWidth placeholder="Ex: EMP-006" />
            <TextField label="Email" type="email" fullWidth />
            <TextField label="Téléphone" fullWidth placeholder="+227 XX XX XX XX" />
            <TextField
              label="Date de naissance"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Date d'embauche"
              type="date"
              defaultValue="2026-03-26"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Département</InputLabel>
              <Select label="Département" defaultValue="">
                <MenuItem value={1}>Informatique</MenuItem>
                <MenuItem value={2}>Administration</MenuItem>
                <MenuItem value={3}>Comptabilité</MenuItem>
                <MenuItem value={4}>Services généraux</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Poste" fullWidth placeholder="Ex: Enseignant permanent" />
            <FormControl fullWidth>
              <InputLabel>Type de contrat</InputLabel>
              <Select label="Type de contrat" defaultValue="CDI">
                <MenuItem value="CDI">CDI</MenuItem>
                <MenuItem value="CDD">CDD</MenuItem>
                <MenuItem value="Interim">Intérim</MenuItem>
                <MenuItem value="Stage">Stage</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Salaire de base (FCFA)" type="number" fullWidth placeholder="Ex: 350000" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setCreateOpen(false);
              setSnackbar({ open: true, message: 'Employé créé avec succès', severity: 'success' });
            }}
          >
            Créer
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
