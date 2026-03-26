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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';

import type {
  AbsenceJustification,
  JustificationType,
  JustificationStatus,
} from '../../types';

import {
  JUSTIFICATION_TYPE_LABELS,
} from '../../types';

// ──── Demo Data ────

const DEMO_JUSTIFICATIONS: AbsenceJustification[] = [
  {
    id: 1, student_id: 10, absence_date_from: '2026-03-20', absence_date_to: '2026-03-21',
    type: 'medical', reason: 'Consultation médicale urgente', document_path: '/docs/medical_cert.pdf',
    status: 'pending', submitted_by: 10, validated_by: null, validated_at: null, validation_notes: null,
    student: { id: 10, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2026-001' },
    submitter: { id: 10, firstname: 'Amadou', lastname: 'Diallo' },
    created_at: '2026-03-22T09:00:00', updated_at: '2026-03-22T09:00:00',
  },
  {
    id: 2, student_id: 11, absence_date_from: '2026-03-18', absence_date_to: '2026-03-18',
    type: 'family', reason: 'Décès dans la famille', document_path: null,
    status: 'approved', submitted_by: 11, validated_by: 1, validated_at: '2026-03-19T10:00:00', validation_notes: 'Justificatif accepté',
    student: { id: 11, firstname: 'Fatima', lastname: 'Moussa', matricule: 'ETU-2026-002' },
    submitter: { id: 11, firstname: 'Fatima', lastname: 'Moussa' },
    validator: { id: 1, firstname: 'Dr.', lastname: 'Dupont' },
    created_at: '2026-03-19T08:00:00', updated_at: '2026-03-19T10:00:00',
  },
  {
    id: 3, student_id: 13, absence_date_from: '2026-03-15', absence_date_to: '2026-03-15',
    type: 'administrative', reason: 'Renouvellement titre de séjour', document_path: '/docs/admin_doc.pdf',
    status: 'rejected', submitted_by: 13, validated_by: 1, validated_at: '2026-03-16T14:00:00', validation_notes: 'Convocation datée hors période',
    student: { id: 13, firstname: 'Aissatou', lastname: 'Abdou', matricule: 'ETU-2026-004' },
    submitter: { id: 13, firstname: 'Aissatou', lastname: 'Abdou' },
    validator: { id: 1, firstname: 'Dr.', lastname: 'Dupont' },
    created_at: '2026-03-16T09:00:00', updated_at: '2026-03-16T14:00:00',
  },
  {
    id: 4, student_id: 15, absence_date_from: '2026-03-24', absence_date_to: '2026-03-25',
    type: 'medical', reason: 'Hospitalisation', document_path: '/docs/hospital.pdf',
    status: 'pending', submitted_by: 15, validated_by: null, validated_at: null, validation_notes: null,
    student: { id: 15, firstname: 'Mariama', lastname: 'Issaka', matricule: 'ETU-2026-006' },
    submitter: { id: 15, firstname: 'Mariama', lastname: 'Issaka' },
    created_at: '2026-03-25T11:00:00', updated_at: '2026-03-25T11:00:00',
  },
];

const STATUS_CONFIG: Record<JustificationStatus, { label: string; color: 'warning' | 'success' | 'error' }> = {
  pending: { label: 'En attente', color: 'warning' },
  approved: { label: 'Approuvé', color: 'success' },
  rejected: { label: 'Rejeté', color: 'error' },
};

export const JustificationDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [validateOpen, setValidateOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedJustification, setSelectedJustification] = useState<AbsenceJustification | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [notes, setNotes] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const filteredJustifications = tab === 0
    ? DEMO_JUSTIFICATIONS
    : tab === 1
      ? DEMO_JUSTIFICATIONS.filter(j => j.status === 'pending')
      : tab === 2
        ? DEMO_JUSTIFICATIONS.filter(j => j.status === 'approved')
        : DEMO_JUSTIFICATIONS.filter(j => j.status === 'rejected');

  const handleValidate = useCallback((justification: AbsenceJustification) => {
    setSelectedJustification(justification);
    setDecision('approved');
    setNotes('');
    setValidateOpen(true);
  }, []);

  const handleSubmitValidation = useCallback(() => {
    setValidateOpen(false);
    setSnackbar({
      open: true,
      message: `Justificatif ${decision === 'approved' ? 'approuvé' : 'rejeté'} avec succès`,
      severity: 'success',
    });
  }, [decision]);

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Présences</Link>
        <Typography color="text.primary">Justificatifs</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Justificatifs
        </Typography>
        <Button variant="contained" onClick={() => setSubmitOpen(true)}>
          + Soumettre Justificatif
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: DEMO_JUSTIFICATIONS.length, color: '#1976d2' },
          { label: 'En attente', value: DEMO_JUSTIFICATIONS.filter(j => j.status === 'pending').length, color: '#ff9800' },
          { label: 'Approuvés', value: DEMO_JUSTIFICATIONS.filter(j => j.status === 'approved').length, color: '#4caf50' },
          { label: 'Rejetés', value: DEMO_JUSTIFICATIONS.filter(j => j.status === 'rejected').length, color: '#f44336' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs + Table */}
      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Tous" />
            <Tab label="En attente" />
            <Tab label="Approuvés" />
            <Tab label="Rejetés" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Période</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Motif</TableCell>
                  <TableCell>Document</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJustifications.map(j => (
                  <TableRow key={j.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {j.student?.lastname} {j.student?.firstname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {j.student?.matricule}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(j.absence_date_from).toLocaleDateString('fr-FR')}
                      {j.absence_date_from !== j.absence_date_to && ` → ${new Date(j.absence_date_to).toLocaleDateString('fr-FR')}`}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={JUSTIFICATION_TYPE_LABELS[j.type]} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap>{j.reason}</Typography>
                    </TableCell>
                    <TableCell>
                      {j.document_path ? (
                        <Chip size="small" label="Télécharger" color="primary" variant="outlined" clickable />
                      ) : (
                        <Typography variant="body2" color="text.secondary">Aucun</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={STATUS_CONFIG[j.status].label}
                        color={STATUS_CONFIG[j.status].color}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {j.status === 'pending' && (
                        <Button size="small" variant="outlined" onClick={() => handleValidate(j)}>
                          Traiter
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredJustifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        Aucun justificatif trouvé
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Validate Dialog */}
      <Dialog open={validateOpen} onClose={() => setValidateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Traiter le Justificatif</DialogTitle>
        <DialogContent>
          {selectedJustification && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Alert severity="info">
                <strong>{selectedJustification.student?.lastname} {selectedJustification.student?.firstname}</strong> -
                {' '}{JUSTIFICATION_TYPE_LABELS[selectedJustification.type]}
                <br />
                {selectedJustification.reason}
              </Alert>
              <FormControl fullWidth>
                <InputLabel>Décision</InputLabel>
                <Select
                  value={decision}
                  label="Décision"
                  onChange={e => setDecision(e.target.value as 'approved' | 'rejected')}
                >
                  <MenuItem value="approved">Approuver</MenuItem>
                  <MenuItem value="rejected">Rejeter</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Notes de validation"
                multiline
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color={decision === 'approved' ? 'success' : 'error'}
            onClick={handleSubmitValidation}
          >
            {decision === 'approved' ? 'Approuver' : 'Rejeter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={submitOpen} onClose={() => setSubmitOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Soumettre un Justificatif</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="ID Étudiant" type="number" fullWidth />
            <TextField label="Date début absence" type="date" slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField label="Date fin absence" type="date" slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" defaultValue="medical">
                <MenuItem value="medical">Médical</MenuItem>
                <MenuItem value="family">Familial</MenuItem>
                <MenuItem value="administrative">Administratif</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Motif" multiline rows={3} fullWidth />
            <Button variant="outlined" component="label">
              Joindre un document
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={() => { setSubmitOpen(false); setSnackbar({ open: true, message: 'Justificatif soumis', severity: 'success' }); }}>
            Soumettre
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
