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

import type {
  SocialDeclaration,
  DeclarationStatus,
  DeclarationType,
} from '../../types';

import {
  DECLARATION_TYPE_LABELS,
  DECLARATION_TYPE_COLORS,
  DECLARATION_STATUS_LABELS,
  DECLARATION_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_DECLARATIONS: SocialDeclaration[] = [
  {
    id: 1, type: 'CNSS', period_month: 2, period_year: 2026, label: 'CNSS - Février 2026',
    total_base: 4850000, total_employee_share: 242500, total_employer_share: 388000, total_amount: 630500,
    employee_count: 12, status: 'paid', due_date: '2026-03-15',
    submitted_at: '2026-03-10T10:00:00', paid_at: '2026-03-14T09:00:00', reference: 'CNSS-2026-02-001',
    created_at: '2026-02-28T00:00:00', updated_at: '2026-03-14T09:00:00',
  },
  {
    id: 2, type: 'income_tax', period_month: 2, period_year: 2026, label: 'IR - Février 2026',
    total_base: 4850000, total_employee_share: 485000, total_employer_share: 0, total_amount: 485000,
    employee_count: 12, status: 'submitted', due_date: '2026-03-15',
    submitted_at: '2026-03-12T14:00:00', paid_at: null, reference: 'IR-2026-02-001',
    created_at: '2026-02-28T00:00:00', updated_at: '2026-03-12T14:00:00',
  },
  {
    id: 3, type: 'AMO', period_month: 2, period_year: 2026, label: 'AMO - Février 2026',
    total_base: 4850000, total_employee_share: 121250, total_employer_share: 121250, total_amount: 242500,
    employee_count: 12, status: 'validated', due_date: '2026-03-15',
    submitted_at: null, paid_at: null, reference: null,
    created_at: '2026-02-28T00:00:00', updated_at: '2026-03-08T10:00:00',
  },
  {
    id: 4, type: 'CNSS', period_month: 3, period_year: 2026, label: 'CNSS - Mars 2026',
    total_base: 0, total_employee_share: 0, total_employer_share: 0, total_amount: 0,
    employee_count: 0, status: 'draft', due_date: '2026-04-15',
    submitted_at: null, paid_at: null, reference: null,
    created_at: '2026-03-01T00:00:00', updated_at: '2026-03-01T00:00:00',
  },
  {
    id: 5, type: 'income_tax', period_month: 3, period_year: 2026, label: 'IR - Mars 2026',
    total_base: 0, total_employee_share: 0, total_employer_share: 0, total_amount: 0,
    employee_count: 0, status: 'draft', due_date: '2026-04-15',
    submitted_at: null, paid_at: null, reference: null,
    created_at: '2026-03-01T00:00:00', updated_at: '2026-03-01T00:00:00',
  },
  {
    id: 6, type: 'AMO', period_month: 3, period_year: 2026, label: 'AMO - Mars 2026',
    total_base: 0, total_employee_share: 0, total_employer_share: 0, total_amount: 0,
    employee_count: 0, status: 'draft', due_date: '2026-04-15',
    submitted_at: null, paid_at: null, reference: null,
    created_at: '2026-03-01T00:00:00', updated_at: '2026-03-01T00:00:00',
  },
];

const getStatusChipColor = (status: DeclarationStatus): 'default' | 'primary' | 'warning' | 'success' => {
  switch (status) {
    case 'draft': return 'default';
    case 'validated': return 'primary';
    case 'submitted': return 'warning';
    case 'paid': return 'success';
    default: return 'default';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

export const SocialDeclarationDashboard: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDeclaration, setSelectedDeclaration] = useState<SocialDeclaration | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const declarations = DEMO_DECLARATIONS;

  const handleViewDetail = useCallback((declaration: SocialDeclaration) => {
    setSelectedDeclaration(declaration);
    setDetailOpen(true);
  }, []);

  const handleValidate = useCallback((declaration: SocialDeclaration) => {
    setSnackbar({ open: true, message: `${declaration.label} validée`, severity: 'success' });
  }, []);

  const handleSubmit = useCallback((declaration: SocialDeclaration) => {
    setSnackbar({ open: true, message: `${declaration.label} soumise`, severity: 'success' });
  }, []);

  const handleMarkPaid = useCallback((declaration: SocialDeclaration) => {
    setSnackbar({ open: true, message: `${declaration.label} marquée comme payée`, severity: 'success' });
  }, []);

  const cnssTotal = declarations.filter(d => d.type === 'CNSS' && d.total_amount > 0).reduce((sum, d) => sum + d.total_amount, 0);
  const irTotal = declarations.filter(d => d.type === 'income_tax' && d.total_amount > 0).reduce((sum, d) => sum + d.total_amount, 0);
  const amoTotal = declarations.filter(d => d.type === 'AMO' && d.total_amount > 0).reduce((sum, d) => sum + d.total_amount, 0);
  const pendingCount = declarations.filter(d => d.status !== 'paid').length;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Paie & RH</Link>
        <Typography color="text.primary">Déclarations Sociales</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Déclarations Sociales
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          + Nouvelle Déclaration
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total CNSS', value: formatCurrency(cnssTotal), color: '#1976d2' },
          { label: 'Total IR', value: formatCurrency(irTotal), color: '#ff9800' },
          { label: 'Total AMO', value: formatCurrency(amoTotal), color: '#9c27b0' },
          { label: 'En attente', value: pendingCount, color: '#f44336' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color, fontSize: typeof stat.value === 'string' ? '1.3rem' : undefined }}>
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

      {/* Declarations Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Déclarations</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Libellé</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Base</TableCell>
                  <TableCell>Part salarié</TableCell>
                  <TableCell>Part employeur</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Échéance</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {declarations.map(declaration => (
                  <TableRow key={declaration.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{declaration.label}</Typography>
                      {declaration.reference && (
                        <Typography variant="caption" color="text.secondary">{declaration.reference}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={DECLARATION_TYPE_LABELS[declaration.type]} sx={{ bgcolor: DECLARATION_TYPE_COLORS[declaration.type], color: 'white' }} />
                    </TableCell>
                    <TableCell>{declaration.total_base > 0 ? formatCurrency(declaration.total_base) : '-'}</TableCell>
                    <TableCell>{declaration.total_employee_share > 0 ? formatCurrency(declaration.total_employee_share) : '-'}</TableCell>
                    <TableCell>{declaration.total_employer_share > 0 ? formatCurrency(declaration.total_employer_share) : '-'}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{declaration.total_amount > 0 ? formatCurrency(declaration.total_amount) : '-'}</Typography>
                    </TableCell>
                    <TableCell>{new Date(declaration.due_date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <Chip size="small" label={DECLARATION_STATUS_LABELS[declaration.status]} color={getStatusChipColor(declaration.status)} />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button size="small" variant="outlined" onClick={() => handleViewDetail(declaration)}>
                          Détails
                        </Button>
                        {declaration.status === 'draft' && (
                          <Button size="small" variant="contained" color="primary" onClick={() => handleValidate(declaration)}>
                            Valider
                          </Button>
                        )}
                        {declaration.status === 'validated' && (
                          <Button size="small" variant="contained" color="warning" onClick={() => handleSubmit(declaration)}>
                            Soumettre
                          </Button>
                        )}
                        {declaration.status === 'submitted' && (
                          <Button size="small" variant="contained" color="success" onClick={() => handleMarkPaid(declaration)}>
                            Payé
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
              <Typography variant="h6">{selectedDeclaration?.label}</Typography>
              {selectedDeclaration?.reference && (
                <Typography variant="body2" color="text.secondary">Référence : {selectedDeclaration.reference}</Typography>
              )}
            </Box>
            {selectedDeclaration && (
              <Chip label={DECLARATION_STATUS_LABELS[selectedDeclaration.status]} color={getStatusChipColor(selectedDeclaration.status)} />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Type de déclaration</Typography>
                {selectedDeclaration && (
                  <Chip label={DECLARATION_TYPE_LABELS[selectedDeclaration.type]} sx={{ bgcolor: DECLARATION_TYPE_COLORS[selectedDeclaration.type], color: 'white', mt: 1 }} />
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Échéance</Typography>
                <Typography fontWeight="bold">
                  {selectedDeclaration && new Date(selectedDeclaration.due_date).toLocaleDateString('fr-FR')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedDeclaration?.employee_count} employé(s) concerné(s)
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Part salarié</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {selectedDeclaration ? formatCurrency(selectedDeclaration.total_employee_share) : '-'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Part employeur</Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {selectedDeclaration ? formatCurrency(selectedDeclaration.total_employer_share) : '-'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Total</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {selectedDeclaration ? formatCurrency(selectedDeclaration.total_amount) : '-'}
                </Typography>
              </Paper>
            </Grid>
            {selectedDeclaration?.submitted_at && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Soumise le</Typography>
                  <Typography>{new Date(selectedDeclaration.submitted_at).toLocaleDateString('fr-FR')}</Typography>
                </Paper>
              </Grid>
            )}
            {selectedDeclaration?.paid_at && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Payée le</Typography>
                  <Typography>{new Date(selectedDeclaration.paid_at).toLocaleDateString('fr-FR')}</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Create Declaration Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Déclaration Sociale</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" defaultValue="CNSS">
                <MenuItem value="CNSS">CNSS</MenuItem>
                <MenuItem value="income_tax">Impôt sur le revenu</MenuItem>
                <MenuItem value="AMO">AMO</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Mois</InputLabel>
              <Select label="Mois" defaultValue={3}>
                {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((name, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Année" type="number" fullWidth defaultValue={2026} />
            <TextField
              label="Date d'échéance"
              type="date"
              defaultValue="2026-04-15"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setCreateOpen(false);
              setSnackbar({ open: true, message: 'Déclaration créée', severity: 'success' });
            }}
          >
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
