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
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';

import type {
  Diploma,
  DiplomaStatus,
} from '../../types';

import {
  DIPLOMA_TYPE_LABELS,
  DIPLOMA_STATUS_LABELS,
  DIPLOMA_STATUS_COLORS,
  DIPLOMA_MENTION_LABELS,
} from '../../types';

// ──── Demo Data ────

const DEMO_DIPLOMAS: Diploma[] = [
  {
    id: 1, student_id: 1, programme_id: 1, academic_year_id: 1,
    type: 'licence', registration_number: 'DIP-2026-001', mention: 'bien',
    status: 'delivered', document_path: '/documents/diplomas/DIP-2026-001.pdf',
    supplement_path: '/documents/diplomas/SUP-2026-001.pdf',
    delivered_at: '2026-03-15T10:00:00', delivered_by: 1,
    signed_at: '2026-03-10T14:00:00', signed_by: 1, qr_code: 'QR-DIP-001',
    student: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2024-001' },
    programme: { id: 1, name: 'Informatique', code: 'INFO' },
    created_at: '2026-03-01T08:00:00', updated_at: '2026-03-15T10:00:00',
  },
  {
    id: 2, student_id: 2, programme_id: 1, academic_year_id: 1,
    type: 'licence', registration_number: 'DIP-2026-002', mention: 'tres_bien',
    status: 'signed', document_path: '/documents/diplomas/DIP-2026-002.pdf',
    supplement_path: null,
    delivered_at: null, delivered_by: null,
    signed_at: '2026-03-18T09:00:00', signed_by: 1, qr_code: 'QR-DIP-002',
    student: { id: 2, firstname: 'Fatima', lastname: 'Ousmane', matricule: 'ETU-2024-002' },
    programme: { id: 1, name: 'Informatique', code: 'INFO' },
    created_at: '2026-03-05T08:00:00', updated_at: '2026-03-18T09:00:00',
  },
  {
    id: 3, student_id: 3, programme_id: 2, academic_year_id: 1,
    type: 'master', registration_number: 'DIP-2026-003', mention: 'assez_bien',
    status: 'generated', document_path: '/documents/diplomas/DIP-2026-003.pdf',
    supplement_path: null,
    delivered_at: null, delivered_by: null,
    signed_at: null, signed_by: null, qr_code: 'QR-DIP-003',
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Moussa', matricule: 'ETU-2024-003' },
    programme: { id: 2, name: 'Génie Civil', code: 'GC' },
    created_at: '2026-03-10T11:00:00', updated_at: '2026-03-10T11:00:00',
  },
  {
    id: 4, student_id: 4, programme_id: 3, academic_year_id: 1,
    type: 'bts', registration_number: 'DIP-2026-004', mention: 'passable',
    status: 'generated', document_path: '/documents/diplomas/DIP-2026-004.pdf',
    supplement_path: null,
    delivered_at: null, delivered_by: null,
    signed_at: null, signed_by: null, qr_code: 'QR-DIP-004',
    student: { id: 4, firstname: 'Aissatou', lastname: 'Bah', matricule: 'ETU-2024-004' },
    programme: { id: 3, name: 'Comptabilité', code: 'COMPTA' },
    created_at: '2026-03-12T15:00:00', updated_at: '2026-03-12T15:00:00',
  },
  {
    id: 5, student_id: 5, programme_id: 2, academic_year_id: 1,
    type: 'master', registration_number: 'DIP-2026-005', mention: 'excellent',
    status: 'delivered', document_path: '/documents/diplomas/DIP-2026-005.pdf',
    supplement_path: '/documents/diplomas/SUP-2026-005.pdf',
    delivered_at: '2026-03-20T16:00:00', delivered_by: 1,
    signed_at: '2026-03-18T10:00:00', signed_by: 1, qr_code: 'QR-DIP-005',
    student: { id: 5, firstname: 'Oumar', lastname: 'Sidibe', matricule: 'ETU-2024-005' },
    programme: { id: 2, name: 'Génie Civil', code: 'GC' },
    created_at: '2026-03-08T09:00:00', updated_at: '2026-03-20T16:00:00',
  },
];

const getStatusChipColor = (status: DiplomaStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'generated': return 'primary';
    case 'signed': return 'warning';
    case 'delivered': return 'success';
    case 'revoked': return 'error';
    default: return 'default';
  }
};

export const DiplomaDashboard: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [selectedDiploma, setSelectedDiploma] = useState<Diploma | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const diplomas = DEMO_DIPLOMAS;

  const handleViewDetail = useCallback((diploma: Diploma) => {
    setSelectedDiploma(diploma);
    setDetailOpen(true);
  }, []);

  const handleDeliver = useCallback((diploma: Diploma) => {
    setSelectedDiploma(diploma);
    setDeliverOpen(true);
  }, []);

  const handleDuplicate = useCallback((diploma: Diploma) => {
    setSnackbar({ open: true, message: `Diplôme "${diploma.registration_number}" dupliqué avec succès`, severity: 'success' });
  }, []);

  const handleSupplement = useCallback((diploma: Diploma) => {
    setSnackbar({ open: true, message: `Supplément au diplôme "${diploma.registration_number}" généré`, severity: 'success' });
  }, []);

  const deliveredCount = diplomas.filter(d => d.status === 'delivered').length;
  const signedCount = diplomas.filter(d => d.status === 'signed').length;
  const generatedCount = diplomas.filter(d => d.status === 'generated').length;
  const totalCount = diplomas.length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Documents Officiels
        </Link>
        <Typography color="text.primary">Diplômes</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Registre des Diplômes
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          + Générer un Diplôme
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total diplômes', value: totalCount, color: '#9c27b0' },
          { label: 'Délivrés', value: deliveredCount, color: '#4caf50' },
          { label: 'Signés', value: signedCount, color: '#ff9800' },
          { label: 'Générés', value: generatedCount, color: '#1976d2' },
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

      {/* Diplomas Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Liste des Diplômes</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Enregistrement</TableCell>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Programme</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Mention</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Supplément</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diplomas.map(diploma => (
                  <TableRow key={diploma.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{diploma.registration_number}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {diploma.student?.firstname} {diploma.student?.lastname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {diploma.student?.matricule}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">{diploma.programme?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {diploma.programme?.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={DIPLOMA_TYPE_LABELS[diploma.type]} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography>{DIPLOMA_MENTION_LABELS[diploma.mention]}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={DIPLOMA_STATUS_LABELS[diploma.status]}
                        color={getStatusChipColor(diploma.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={diploma.supplement_path ? 'Oui' : 'Non'}
                        color={diploma.supplement_path ? 'success' : 'default'}
                        variant={diploma.supplement_path ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetail(diploma)}
                        >
                          Détails
                        </Button>
                        {diploma.status === 'signed' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleDeliver(diploma)}
                          >
                            Délivrer
                          </Button>
                        )}
                        {!diploma.supplement_path && (
                          <Tooltip title="Générer le supplément">
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              onClick={() => handleSupplement(diploma)}
                            >
                              Supplément
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip title="Dupliquer">
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleDuplicate(diploma)}
                          >
                            Dupliquer
                          </Button>
                        </Tooltip>
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
              <Typography variant="h6">Diplôme {selectedDiploma?.registration_number}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDiploma?.student?.firstname} {selectedDiploma?.student?.lastname}
              </Typography>
            </Box>
            {selectedDiploma && (
              <Chip
                label={DIPLOMA_STATUS_LABELS[selectedDiploma.status]}
                color={getStatusChipColor(selectedDiploma.status)}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Étudiant</Typography>
                <Typography fontWeight="bold">
                  {selectedDiploma?.student?.firstname} {selectedDiploma?.student?.lastname}
                </Typography>
                <Typography variant="body2">{selectedDiploma?.student?.matricule}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Programme</Typography>
                <Typography fontWeight="bold">{selectedDiploma?.programme?.name}</Typography>
                <Typography variant="body2">{selectedDiploma?.programme?.code}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Mention</Typography>
                <Typography fontWeight="bold">
                  {selectedDiploma && DIPLOMA_MENTION_LABELS[selectedDiploma.mention]}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Délivré le</Typography>
                <Typography fontWeight="bold">
                  {selectedDiploma?.delivered_at
                    ? new Date(selectedDiploma.delivered_at).toLocaleDateString('fr-FR')
                    : 'Non délivré'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Create Diploma Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Générer un Diplôme</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Étudiant</InputLabel>
              <Select label="Étudiant" defaultValue="">
                <MenuItem value={1}>Amadou Diallo (ETU-2024-001)</MenuItem>
                <MenuItem value={2}>Fatima Ousmane (ETU-2024-002)</MenuItem>
                <MenuItem value={3}>Ibrahim Moussa (ETU-2024-003)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Programme</InputLabel>
              <Select label="Programme" defaultValue="">
                <MenuItem value={1}>INFO - Informatique</MenuItem>
                <MenuItem value={2}>GC - Génie Civil</MenuItem>
                <MenuItem value={3}>COMPTA - Comptabilité</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type de diplôme</InputLabel>
              <Select label="Type de diplôme" defaultValue="licence">
                <MenuItem value="licence">Licence</MenuItem>
                <MenuItem value="master">Master</MenuItem>
                <MenuItem value="doctorat">Doctorat</MenuItem>
                <MenuItem value="ingenieur">Ingénieur</MenuItem>
                <MenuItem value="bts">BTS</MenuItem>
                <MenuItem value="dut">DUT</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Mention</InputLabel>
              <Select label="Mention" defaultValue="bien">
                <MenuItem value="passable">Passable</MenuItem>
                <MenuItem value="assez_bien">Assez Bien</MenuItem>
                <MenuItem value="bien">Bien</MenuItem>
                <MenuItem value="tres_bien">Très Bien</MenuItem>
                <MenuItem value="excellent">Excellent</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setCreateOpen(false);
              setSnackbar({ open: true, message: 'Diplôme généré avec succès', severity: 'success' });
            }}
          >
            Générer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deliver Dialog */}
      <Dialog open={deliverOpen} onClose={() => setDeliverOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Délivrer le Diplôme</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Diplôme : {selectedDiploma?.registration_number} - {selectedDiploma?.student?.firstname} {selectedDiploma?.student?.lastname}
            </Alert>
            <TextField
              label="Date de délivrance"
              type="date"
              defaultValue="2026-03-26"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField label="Notes" fullWidth multiline rows={2} placeholder="Notes de délivrance" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliverOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setDeliverOpen(false);
              setSnackbar({ open: true, message: `Diplôme "${selectedDiploma?.registration_number}" délivré avec succès`, severity: 'success' });
            }}
          >
            Confirmer la délivrance
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
