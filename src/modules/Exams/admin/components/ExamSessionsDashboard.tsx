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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import ButtonGroup from '@mui/material/ButtonGroup';

import type {
  ExamSession,
  ExamSessionStatus,
  ExamType,
} from '../../types';

import {
  EXAM_TYPE_LABELS,
  EXAM_TYPE_COLORS,
  EXAM_SESSION_STATUS_LABELS,
  EXAM_SESSION_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_SESSIONS: ExamSession[] = [
  {
    id: 1, module_id: 1, evaluation_period_id: 1, academic_year_id: 1,
    title: 'Examen Final - Algorithmes', description: 'Examen de fin de semestre',
    type: 'written', exam_date: '2026-04-15', start_time: '08:00', end_time: '11:00',
    duration_minutes: 180, total_capacity: 120, status: 'scheduled',
    instructions: 'Aucun document autorisé', allowed_materials: 'Calculatrice simple',
    is_published: true, published_at: '2026-03-20T10:00:00', created_by: 1,
    module: { id: 1, name: 'Algorithmes', code: 'ALGO' },
    creator: { id: 1, firstname: 'Dr.', lastname: 'Dupont' },
    created_at: '2026-03-15T08:00:00', updated_at: '2026-03-20T10:00:00',
  },
  {
    id: 2, module_id: 2, evaluation_period_id: 1, academic_year_id: 1,
    title: 'Examen Partiel - Base de données', description: 'Contrôle continu n°2',
    type: 'written', exam_date: '2026-04-16', start_time: '10:00', end_time: '12:00',
    duration_minutes: 120, total_capacity: 80, status: 'draft',
    instructions: null, allowed_materials: null,
    is_published: false, published_at: null, created_by: 2,
    module: { id: 2, name: 'Base de données', code: 'BDD' },
    creator: { id: 2, firstname: 'Prof.', lastname: 'Martin' },
    created_at: '2026-03-18T09:00:00', updated_at: '2026-03-18T09:00:00',
  },
  {
    id: 3, module_id: 3, evaluation_period_id: 1, academic_year_id: 1,
    title: 'TP Noté - Réseaux', description: 'Configuration routeurs et switchs',
    type: 'practical', exam_date: '2026-04-10', start_time: '14:00', end_time: '17:00',
    duration_minutes: 180, total_capacity: 30, status: 'completed',
    instructions: 'Accès aux équipements réseau du laboratoire', allowed_materials: 'Notes de cours',
    is_published: true, published_at: '2026-03-12T08:00:00', created_by: 3,
    module: { id: 3, name: 'Réseaux', code: 'RES' },
    creator: { id: 3, firstname: 'Dr.', lastname: 'Bernard' },
    created_at: '2026-03-10T14:00:00', updated_at: '2026-04-10T17:00:00',
  },
  {
    id: 4, module_id: 4, evaluation_period_id: 1, academic_year_id: 1,
    title: 'Oral - Systèmes d\'exploitation', description: 'Présentation projet OS',
    type: 'oral', exam_date: '2026-04-18', start_time: '09:00', end_time: '12:00',
    duration_minutes: 15, total_capacity: 25, status: 'scheduled',
    instructions: 'Présentation de 10 min + 5 min questions', allowed_materials: 'Support de présentation',
    is_published: true, published_at: '2026-03-22T14:00:00', created_by: 1,
    module: { id: 4, name: 'Systèmes d\'exploitation', code: 'SYS' },
    creator: { id: 1, firstname: 'Dr.', lastname: 'Dupont' },
    created_at: '2026-03-20T11:00:00', updated_at: '2026-03-22T14:00:00',
  },
  {
    id: 5, module_id: 5, evaluation_period_id: 1, academic_year_id: 1,
    title: 'Examen Final - Programmation Web', description: null,
    type: 'written', exam_date: '2026-04-20', start_time: '08:00', end_time: '10:00',
    duration_minutes: 120, total_capacity: 100, status: 'cancelled',
    instructions: null, allowed_materials: null,
    is_published: false, published_at: null, created_by: 2,
    module: { id: 5, name: 'Programmation Web', code: 'WEB' },
    creator: { id: 2, firstname: 'Prof.', lastname: 'Martin' },
    created_at: '2026-03-19T10:00:00', updated_at: '2026-03-25T16:00:00',
  },
];

const getStatusChipColor = (status: ExamSessionStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'draft': return 'default';
    case 'scheduled': return 'primary';
    case 'ongoing': return 'warning';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

export const ExamSessionsDashboard: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Demo data
  const sessions = DEMO_SESSIONS;

  const handleViewDetail = useCallback((session: ExamSession) => {
    setSelectedSession(session);
    setDetailOpen(true);
  }, []);

  const handlePublish = useCallback((session: ExamSession) => {
    setSnackbar({ open: true, message: `"${session.title}" a été publié avec succès`, severity: 'success' });
  }, []);

  const handleCancel = useCallback((session: ExamSession) => {
    setSnackbar({ open: true, message: `"${session.title}" a été annulé`, severity: 'success' });
  }, []);

  const handleDuplicate = useCallback((session: ExamSession) => {
    setSnackbar({ open: true, message: `"${session.title}" a été dupliqué`, severity: 'success' });
  }, []);

  const scheduledCount = sessions.filter(s => s.status === 'scheduled').length;
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const totalCapacity = sessions.reduce((sum, s) => sum + s.total_capacity, 0);
  const publishedCount = sessions.filter(s => s.is_published).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Examens
        </Link>
        <Typography color="text.primary">Planification</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Planification des Examens
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          + Nouvelle Session
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Sessions planifiées', value: scheduledCount, color: '#1976d2' },
          { label: 'Sessions terminées', value: completedCount, color: '#4caf50' },
          { label: 'Capacité totale', value: totalCapacity, color: '#ff9800' },
          { label: 'Publiées', value: publishedCount, color: '#9c27b0' },
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

      {/* Sessions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Sessions d&apos;Examen</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Horaire</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Capacité</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Publié</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(session => (
                  <TableRow key={session.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{session.title}</Typography>
                      {session.description && (
                        <Typography variant="caption" color="text.secondary">
                          {session.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {session.module?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.module?.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(session.exam_date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {session.start_time} - {session.end_time}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {session.duration_minutes} min
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={EXAM_TYPE_LABELS[session.type]}
                        sx={{ bgcolor: EXAM_TYPE_COLORS[session.type], color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{session.total_capacity}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={EXAM_SESSION_STATUS_LABELS[session.status]}
                        color={getStatusChipColor(session.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={session.is_published ? 'Oui' : 'Non'}
                        color={session.is_published ? 'success' : 'default'}
                        variant={session.is_published ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetail(session)}
                        >
                          Détails
                        </Button>
                        {session.status === 'draft' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handlePublish(session)}
                          >
                            Publier
                          </Button>
                        )}
                        {session.status === 'scheduled' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancel(session)}
                          >
                            Annuler
                          </Button>
                        )}
                        <Tooltip title="Dupliquer">
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleDuplicate(session)}
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
              <Typography variant="h6">{selectedSession?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSession?.module?.name} ({selectedSession?.module?.code})
              </Typography>
            </Box>
            {selectedSession && (
              <Chip
                label={EXAM_SESSION_STATUS_LABELS[selectedSession.status]}
                color={getStatusChipColor(selectedSession.status)}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Date & Horaire</Typography>
                <Typography fontWeight="bold">
                  {selectedSession && new Date(selectedSession.exam_date).toLocaleDateString('fr-FR')}
                </Typography>
                <Typography>
                  {selectedSession?.start_time} - {selectedSession?.end_time} ({selectedSession?.duration_minutes} min)
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Type & Capacité</Typography>
                <Typography fontWeight="bold">
                  {selectedSession && EXAM_TYPE_LABELS[selectedSession.type]}
                </Typography>
                <Typography>{selectedSession?.total_capacity} places</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Matériels autorisés</Typography>
                <Typography>{selectedSession?.allowed_materials || 'Aucun'}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Instructions</Typography>
                <Typography>{selectedSession?.instructions || 'Aucune'}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Créé par</Typography>
                <Typography>
                  {selectedSession?.creator?.firstname} {selectedSession?.creator?.lastname} le{' '}
                  {selectedSession && new Date(selectedSession.created_at).toLocaleDateString('fr-FR')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Session d&apos;Examen</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Titre" fullWidth placeholder="Ex: Examen Final - Algorithmes" />
            <TextField label="Description" fullWidth multiline rows={2} />
            <FormControl fullWidth>
              <InputLabel>Module</InputLabel>
              <Select label="Module" defaultValue="">
                <MenuItem value={1}>ALGO - Algorithmes</MenuItem>
                <MenuItem value={2}>BDD - Base de données</MenuItem>
                <MenuItem value={3}>RES - Réseaux</MenuItem>
                <MenuItem value={4}>SYS - Systèmes d&apos;exploitation</MenuItem>
                <MenuItem value={5}>WEB - Programmation Web</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" defaultValue="written">
                <MenuItem value="written">Écrit</MenuItem>
                <MenuItem value="oral">Oral</MenuItem>
                <MenuItem value="practical">Pratique</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Date de l'examen"
              type="date"
              defaultValue="2026-04-20"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Heure début"
                  type="time"
                  defaultValue="08:00"
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Heure fin"
                  type="time"
                  defaultValue="11:00"
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField label="Durée (minutes)" type="number" defaultValue={180} fullWidth />
            <TextField label="Capacité totale" type="number" defaultValue={100} fullWidth />
            <TextField label="Matériels autorisés" fullWidth placeholder="Ex: Calculatrice, documents" />
            <TextField label="Instructions" fullWidth multiline rows={3} placeholder="Instructions pour les étudiants" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setCreateOpen(false);
              setSnackbar({ open: true, message: 'Session d\'examen créée avec succès', severity: 'success' });
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
