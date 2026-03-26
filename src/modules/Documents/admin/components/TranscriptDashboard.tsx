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
import Tooltip from '@mui/material/Tooltip';

import type {
  Transcript,
  TranscriptStatus,
  TranscriptType,
} from '../../types';

import {
  TRANSCRIPT_TYPE_LABELS,
  TRANSCRIPT_TYPE_COLORS,
  TRANSCRIPT_STATUS_LABELS,
  TRANSCRIPT_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_TRANSCRIPTS: Transcript[] = [
  {
    id: 1, student_id: 1, semester_id: 1, academic_year_id: 1,
    type: 'semester', generated_at: '2026-03-20T10:00:00',
    document_path: '/documents/transcripts/TR-2026-001.pdf',
    status: 'validated', qr_code: 'QR-TR-001', document_number: 'TR-2026-001',
    student: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2024-001' },
    semester: { id: 1, name: 'Semestre 1', code: 'S1' },
    created_at: '2026-03-20T10:00:00', updated_at: '2026-03-20T10:00:00',
  },
  {
    id: 2, student_id: 2, semester_id: 2, academic_year_id: 1,
    type: 'semester', generated_at: '2026-03-21T14:30:00',
    document_path: '/documents/transcripts/TR-2026-002.pdf',
    status: 'generated', qr_code: 'QR-TR-002', document_number: 'TR-2026-002',
    student: { id: 2, firstname: 'Fatima', lastname: 'Ousmane', matricule: 'ETU-2024-002' },
    semester: { id: 2, name: 'Semestre 2', code: 'S2' },
    created_at: '2026-03-21T14:30:00', updated_at: '2026-03-21T14:30:00',
  },
  {
    id: 3, student_id: 3, semester_id: null, academic_year_id: 1,
    type: 'global', generated_at: '2026-03-22T09:15:00',
    document_path: '/documents/transcripts/TR-2026-003.pdf',
    status: 'validated', qr_code: 'QR-TR-003', document_number: 'TR-2026-003',
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Moussa', matricule: 'ETU-2024-003' },
    semester: null,
    created_at: '2026-03-22T09:15:00', updated_at: '2026-03-22T09:15:00',
  },
  {
    id: 4, student_id: 4, semester_id: 1, academic_year_id: 1,
    type: 'provisional', generated_at: '2026-03-23T11:00:00',
    document_path: null,
    status: 'pending', qr_code: null, document_number: 'TR-2026-004',
    student: { id: 4, firstname: 'Aissatou', lastname: 'Bah', matricule: 'ETU-2024-004' },
    semester: { id: 1, name: 'Semestre 1', code: 'S1' },
    created_at: '2026-03-23T11:00:00', updated_at: '2026-03-23T11:00:00',
  },
  {
    id: 5, student_id: 5, semester_id: 2, academic_year_id: 1,
    type: 'semester', generated_at: '2026-03-24T16:45:00',
    document_path: null,
    status: 'error', qr_code: null, document_number: 'TR-2026-005',
    student: { id: 5, firstname: 'Oumar', lastname: 'Sidibe', matricule: 'ETU-2024-005' },
    semester: { id: 2, name: 'Semestre 2', code: 'S2' },
    created_at: '2026-03-24T16:45:00', updated_at: '2026-03-24T16:45:00',
  },
];

const getStatusChipColor = (status: TranscriptStatus): 'default' | 'primary' | 'success' | 'error' => {
  switch (status) {
    case 'pending': return 'default';
    case 'generated': return 'primary';
    case 'validated': return 'success';
    case 'error': return 'error';
    default: return 'default';
  }
};

export const TranscriptDashboard: React.FC = () => {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const transcripts = DEMO_TRANSCRIPTS;

  const handleViewDetail = useCallback((transcript: Transcript) => {
    setSelectedTranscript(transcript);
    setDetailOpen(true);
  }, []);

  const handleValidate = useCallback((transcript: Transcript) => {
    setSnackbar({ open: true, message: `Relevé "${transcript.document_number}" validé avec succès`, severity: 'success' });
  }, []);

  const handleDownload = useCallback((transcript: Transcript) => {
    setSnackbar({ open: true, message: `Téléchargement de "${transcript.document_number}" en cours...`, severity: 'success' });
  }, []);

  const validatedCount = transcripts.filter(t => t.status === 'validated').length;
  const generatedCount = transcripts.filter(t => t.status === 'generated').length;
  const pendingCount = transcripts.filter(t => t.status === 'pending').length;
  const errorCount = transcripts.filter(t => t.status === 'error').length;

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
        <Typography color="text.primary">Relevés de Notes</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Relevés de Notes
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setBatchOpen(true)}>
            Génération par Lot
          </Button>
          <Button variant="contained" onClick={() => setGenerateOpen(true)}>
            + Générer un Relevé
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Validés', value: validatedCount, color: '#4caf50' },
          { label: 'Générés', value: generatedCount, color: '#1976d2' },
          { label: 'En attente', value: pendingCount, color: '#ff9800' },
          { label: 'Erreurs', value: errorCount, color: '#f44336' },
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

      {/* Transcripts Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Historique des Relevés</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Document</TableCell>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Matricule</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Semestre</TableCell>
                  <TableCell>Généré le</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transcripts.map(transcript => (
                  <TableRow key={transcript.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{transcript.document_number}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {transcript.student?.firstname} {transcript.student?.lastname}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{transcript.student?.matricule}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={TRANSCRIPT_TYPE_LABELS[transcript.type]}
                        sx={{ bgcolor: TRANSCRIPT_TYPE_COLORS[transcript.type], color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      {transcript.semester?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(transcript.generated_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={TRANSCRIPT_STATUS_LABELS[transcript.status]}
                        color={getStatusChipColor(transcript.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetail(transcript)}
                        >
                          Détails
                        </Button>
                        {transcript.status === 'generated' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleValidate(transcript)}
                          >
                            Valider
                          </Button>
                        )}
                        {transcript.document_path && (
                          <Tooltip title="Télécharger">
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              onClick={() => handleDownload(transcript)}
                            >
                              PDF
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
              <Typography variant="h6">Relevé {selectedTranscript?.document_number}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTranscript?.student?.firstname} {selectedTranscript?.student?.lastname}
              </Typography>
            </Box>
            {selectedTranscript && (
              <Chip
                label={TRANSCRIPT_STATUS_LABELS[selectedTranscript.status]}
                color={getStatusChipColor(selectedTranscript.status)}
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
                  {selectedTranscript?.student?.firstname} {selectedTranscript?.student?.lastname}
                </Typography>
                <Typography variant="body2">{selectedTranscript?.student?.matricule}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Type & Semestre</Typography>
                <Typography fontWeight="bold">
                  {selectedTranscript && TRANSCRIPT_TYPE_LABELS[selectedTranscript.type]}
                </Typography>
                <Typography variant="body2">{selectedTranscript?.semester?.name || 'Global'}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Date de génération</Typography>
                <Typography fontWeight="bold">
                  {selectedTranscript && new Date(selectedTranscript.generated_at).toLocaleDateString('fr-FR')}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">QR Code</Typography>
                <Typography>{selectedTranscript?.qr_code || 'Non généré'}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Generate Transcript Dialog */}
      <Dialog open={generateOpen} onClose={() => setGenerateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Générer un Relevé de Notes</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type de relevé</InputLabel>
              <Select label="Type de relevé" defaultValue="semester">
                <MenuItem value="semester">Semestriel</MenuItem>
                <MenuItem value="global">Global</MenuItem>
                <MenuItem value="provisional">Provisoire</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Étudiant</InputLabel>
              <Select label="Étudiant" defaultValue="">
                <MenuItem value={1}>Amadou Diallo (ETU-2024-001)</MenuItem>
                <MenuItem value={2}>Fatima Ousmane (ETU-2024-002)</MenuItem>
                <MenuItem value={3}>Ibrahim Moussa (ETU-2024-003)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Semestre</InputLabel>
              <Select label="Semestre" defaultValue="">
                <MenuItem value={1}>Semestre 1</MenuItem>
                <MenuItem value={2}>Semestre 2</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setGenerateOpen(false);
              setSnackbar({ open: true, message: 'Relevé de notes généré avec succès', severity: 'success' });
            }}
          >
            Générer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Generation Dialog */}
      <Dialog open={batchOpen} onClose={() => setBatchOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Génération par Lot</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Sélectionnez les paramètres pour générer les relevés en masse.
            </Alert>
            <FormControl fullWidth>
              <InputLabel>Type de relevé</InputLabel>
              <Select label="Type de relevé" defaultValue="semester">
                <MenuItem value="semester">Semestriel</MenuItem>
                <MenuItem value="global">Global</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Semestre</InputLabel>
              <Select label="Semestre" defaultValue="">
                <MenuItem value={1}>Semestre 1</MenuItem>
                <MenuItem value={2}>Semestre 2</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Nombre d&apos;étudiants estimé"
              type="number"
              defaultValue={150}
              fullWidth
              disabled
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setBatchOpen(false);
              setSnackbar({ open: true, message: 'Génération par lot lancée pour 150 étudiants', severity: 'success' });
            }}
          >
            Lancer la génération
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
