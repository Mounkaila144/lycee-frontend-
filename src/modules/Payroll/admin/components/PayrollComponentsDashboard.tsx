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

import type {
  SalaryScale,
  PayrollComponent,
  Advance,
  AdvanceStatus,
} from '../../types';

import {
  COMPONENT_TYPE_LABELS,
  COMPONENT_TYPE_COLORS,
  ADVANCE_STATUS_LABELS,
  ADVANCE_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_SALARY_SCALES: SalaryScale[] = [
  { id: 1, name: 'Grille A - Cadre supérieur', code: 'GR-A', grade: 'A', echelon: 1, base_amount: 500000, description: 'Cadres supérieurs et directeurs', is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
  { id: 2, name: 'Grille A - Cadre supérieur échelon 2', code: 'GR-A2', grade: 'A', echelon: 2, base_amount: 550000, description: null, is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
  { id: 3, name: 'Grille B - Cadre moyen', code: 'GR-B', grade: 'B', echelon: 1, base_amount: 350000, description: 'Enseignants et techniciens', is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
  { id: 4, name: 'Grille C - Agent', code: 'GR-C', grade: 'C', echelon: 1, base_amount: 200000, description: 'Agents administratifs', is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
  { id: 5, name: 'Grille D - Stagiaire', code: 'GR-D', grade: 'D', echelon: 1, base_amount: 100000, description: 'Stagiaires', is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
];

const DEMO_COMPONENTS: PayrollComponent[] = [
  { id: 1, name: 'Prime de rendement', code: 'PRIM-REND', type: 'bonus', is_taxable: true, is_mandatory: false, default_amount: 50000, percentage: null, description: 'Prime trimestrielle de rendement', is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
  { id: 2, name: 'Indemnité de transport', code: 'IND-TRANS', type: 'allowance', is_taxable: false, is_mandatory: true, default_amount: 25000, percentage: null, description: 'Indemnité mensuelle de transport', is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
  { id: 3, name: 'Indemnité de logement', code: 'IND-LOG', type: 'allowance', is_taxable: false, is_mandatory: false, default_amount: 75000, percentage: null, description: null, is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
  { id: 4, name: 'Heures supplémentaires', code: 'HS', type: 'overtime', is_taxable: true, is_mandatory: false, default_amount: null, percentage: 150, description: 'Taux horaire majoré à 150%', is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
  { id: 5, name: 'Retenue absence', code: 'RET-ABS', type: 'deduction', is_taxable: false, is_mandatory: false, default_amount: null, percentage: null, description: 'Retenue pour absence non justifiée', is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
  { id: 6, name: 'Prime d\'ancienneté', code: 'PRIM-ANC', type: 'bonus', is_taxable: true, is_mandatory: true, default_amount: null, percentage: 5, description: '5% par tranche de 2 ans', is_active: true, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
];

const DEMO_ADVANCES: Advance[] = [
  { id: 1, employee_id: 1, amount: 200000, reason: 'Frais médicaux urgents', requested_date: '2026-03-10', approved_date: '2026-03-12', disbursed_date: '2026-03-13', repayment_months: 3, status: 'disbursed', approved_by: 10, employee: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'EMP-001' }, created_at: '2026-03-10T00:00:00', updated_at: '2026-03-13T00:00:00' },
  { id: 2, employee_id: 2, amount: 150000, reason: 'Rentrée scolaire enfants', requested_date: '2026-03-15', approved_date: '2026-03-16', disbursed_date: null, repayment_months: 2, status: 'approved', approved_by: 10, employee: { id: 2, firstname: 'Fatima', lastname: 'Moussa', matricule: 'EMP-002' }, created_at: '2026-03-15T00:00:00', updated_at: '2026-03-16T00:00:00' },
  { id: 3, employee_id: 3, amount: 100000, reason: 'Avance sur salaire', requested_date: '2026-03-20', approved_date: null, disbursed_date: null, repayment_months: 1, status: 'requested', approved_by: null, employee: { id: 3, firstname: 'Ibrahim', lastname: 'Souleymane', matricule: 'EMP-003' }, created_at: '2026-03-20T00:00:00', updated_at: '2026-03-20T00:00:00' },
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

const getAdvanceStatusChipColor = (status: AdvanceStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'requested': return 'warning';
    case 'approved': return 'primary';
    case 'disbursed': return 'success';
    case 'rejected': return 'error';
    case 'repaid': return 'default';
    default: return 'default';
  }
};

export const PayrollComponentsDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [createScaleOpen, setCreateScaleOpen] = useState(false);
  const [createComponentOpen, setCreateComponentOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const salaryScales = DEMO_SALARY_SCALES;
  const components = DEMO_COMPONENTS;
  const advances = DEMO_ADVANCES;

  const handleApproveAdvance = useCallback((advance: Advance) => {
    setSnackbar({ open: true, message: `Avance de ${formatCurrency(advance.amount)} approuvée pour ${advance.employee?.firstname} ${advance.employee?.lastname}`, severity: 'success' });
  }, []);

  const handleDisburseAdvance = useCallback((advance: Advance) => {
    setSnackbar({ open: true, message: `Avance de ${formatCurrency(advance.amount)} décaissée`, severity: 'success' });
  }, []);

  const bonusCount = components.filter(c => c.type === 'bonus').length;
  const allowanceCount = components.filter(c => c.type === 'allowance').length;
  const deductionCount = components.filter(c => c.type === 'deduction').length;
  const pendingAdvances = advances.filter(a => a.status === 'requested').length;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Paie & RH</Link>
        <Typography color="text.primary">Éléments de Paie</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Éléments de Paie
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Grilles salariales', value: salaryScales.length, color: '#1976d2' },
          { label: 'Primes', value: bonusCount, color: '#4caf50' },
          { label: 'Indemnités / Retenues', value: allowanceCount + deductionCount, color: '#ff9800' },
          { label: 'Avances en attente', value: pendingAdvances, color: '#f44336' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>
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

      {/* Tabs */}
      <Card>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ px: 2, pt: 1 }}>
          <Tab label="Grilles Salariales" />
          <Tab label="Composantes de Paie" />
          <Tab label="Avances sur Salaire" />
        </Tabs>
        <CardContent>
          {/* Tab 0: Salary Scales */}
          {tabIndex === 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Grilles Salariales</Typography>
                <Button variant="contained" size="small" onClick={() => setCreateScaleOpen(true)}>
                  + Nouvelle Grille
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Échelon</TableCell>
                      <TableCell>Montant de base</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salaryScales.map(scale => (
                      <TableRow key={scale.id} hover>
                        <TableCell><Typography fontWeight="medium">{scale.code}</Typography></TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">{scale.name}</Typography>
                          {scale.description && <Typography variant="caption" color="text.secondary">{scale.description}</Typography>}
                        </TableCell>
                        <TableCell>{scale.grade}</TableCell>
                        <TableCell>{scale.echelon}</TableCell>
                        <TableCell><Typography fontWeight="bold">{formatCurrency(scale.base_amount)}</Typography></TableCell>
                        <TableCell>
                          <Chip size="small" label={scale.is_active ? 'Actif' : 'Inactif'} color={scale.is_active ? 'success' : 'default'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Tab 1: Payroll Components */}
          {tabIndex === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Composantes de Paie</Typography>
                <Button variant="contained" size="small" onClick={() => setCreateComponentOpen(true)}>
                  + Nouvelle Composante
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Montant / %</TableCell>
                      <TableCell>Imposable</TableCell>
                      <TableCell>Obligatoire</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {components.map(comp => (
                      <TableRow key={comp.id} hover>
                        <TableCell><Typography fontWeight="medium">{comp.code}</Typography></TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">{comp.name}</Typography>
                          {comp.description && <Typography variant="caption" color="text.secondary">{comp.description}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={COMPONENT_TYPE_LABELS[comp.type]} sx={{ bgcolor: COMPONENT_TYPE_COLORS[comp.type], color: 'white' }} />
                        </TableCell>
                        <TableCell>
                          {comp.default_amount ? formatCurrency(comp.default_amount) : comp.percentage ? `${comp.percentage}%` : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={comp.is_taxable ? 'Oui' : 'Non'} color={comp.is_taxable ? 'warning' : 'default'} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={comp.is_mandatory ? 'Oui' : 'Non'} color={comp.is_mandatory ? 'primary' : 'default'} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={comp.is_active ? 'Actif' : 'Inactif'} color={comp.is_active ? 'success' : 'default'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Tab 2: Advances */}
          {tabIndex === 2 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Avances sur Salaire</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employé</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell>Motif</TableCell>
                      <TableCell>Remboursement</TableCell>
                      <TableCell>Date demande</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {advances.map(advance => (
                      <TableRow key={advance.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{advance.employee?.firstname} {advance.employee?.lastname}</Typography>
                          <Typography variant="caption" color="text.secondary">{advance.employee?.matricule}</Typography>
                        </TableCell>
                        <TableCell><Typography fontWeight="bold">{formatCurrency(advance.amount)}</Typography></TableCell>
                        <TableCell>{advance.reason || '-'}</TableCell>
                        <TableCell>{advance.repayment_months} mois</TableCell>
                        <TableCell>{new Date(advance.requested_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <Chip size="small" label={ADVANCE_STATUS_LABELS[advance.status]} color={getAdvanceStatusChipColor(advance.status)} />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {advance.status === 'requested' && (
                              <Button size="small" variant="contained" color="primary" onClick={() => handleApproveAdvance(advance)}>
                                Approuver
                              </Button>
                            )}
                            {advance.status === 'approved' && (
                              <Button size="small" variant="contained" color="success" onClick={() => handleDisburseAdvance(advance)}>
                                Décaisser
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Salary Scale Dialog */}
      <Dialog open={createScaleOpen} onClose={() => setCreateScaleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Grille Salariale</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nom" fullWidth placeholder="Ex: Grille A - Cadre supérieur" />
            <TextField label="Code" fullWidth placeholder="Ex: GR-A" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField label="Grade" fullWidth placeholder="Ex: A" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="Échelon" type="number" fullWidth defaultValue={1} />
              </Grid>
            </Grid>
            <TextField label="Montant de base (FCFA)" type="number" fullWidth placeholder="Ex: 500000" />
            <TextField label="Description" fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateScaleOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={() => { setCreateScaleOpen(false); setSnackbar({ open: true, message: 'Grille salariale créée', severity: 'success' }); }}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Component Dialog */}
      <Dialog open={createComponentOpen} onClose={() => setCreateComponentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Composante de Paie</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nom" fullWidth placeholder="Ex: Prime de rendement" />
            <TextField label="Code" fullWidth placeholder="Ex: PRIM-REND" />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" defaultValue="bonus">
                <MenuItem value="bonus">Prime</MenuItem>
                <MenuItem value="allowance">Indemnité</MenuItem>
                <MenuItem value="overtime">Heures supplémentaires</MenuItem>
                <MenuItem value="deduction">Retenue</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Montant par défaut (FCFA)" type="number" fullWidth />
            <TextField label="Pourcentage (%)" type="number" fullWidth />
            <TextField label="Description" fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateComponentOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={() => { setCreateComponentOpen(false); setSnackbar({ open: true, message: 'Composante créée', severity: 'success' }); }}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
