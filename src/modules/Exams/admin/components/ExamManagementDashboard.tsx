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
import Snackbar from '@mui/material/Snackbar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';

import type { ExamSession, ExamAttendanceSheet, ExamType } from '../../types';
import { EXAM_TYPE_LABELS, EXAM_SESSION_STATUS_LABELS } from '../../types';

// ──── Demo Data ────

const DEMO_SESSIONS: ExamSession[] = [
  {
    id: 1, module_id: 1, evaluation_period_id: 1, academic_year_id: 1,
    title: 'Examen Final - Algorithmes', description: null,
    type: 'written', exam_date: '2026-04-15', start_time: '08:00', end_time: '11:00',
    duration_minutes: 180, total_capacity: 120, status: 'scheduled',
    instructions: 'Aucun document autorisé', allowed_materials: 'Calculatrice simple',
    is_published: true, published_at: '2026-03-20T10:00:00', created_by: 1,
    module: { id: 1, name: 'Algorithmes', code: 'ALGO' },
    created_at: '2026-03-15T08:00:00', updated_at: '2026-03-20T10:00:00',
  },
  {
    id: 2, module_id: 2, evaluation_period_id: 1, academic_year_id: 1,
    title: 'Examen Partiel - Base de données', description: null,
    type: 'written', exam_date: '2026-04-16', start_time: '10:00', end_time: '12:00',
    duration_minutes: 120, total_capacity: 80, status: 'draft',
    instructions: null, allowed_materials: null,
    is_published: false, published_at: null, created_by: 2,
    module: { id: 2, name: 'Base de données', code: 'BDD' },
    created_at: '2026-03-18T09:00:00', updated_at: '2026-03-18T09:00:00',
  },
];

const DEMO_STUDENTS: ExamAttendanceSheet[] = [
  { id: 1, exam_session_id: 1, student_id: 10, room_id: 1, seat_number: 'A-01', attendance_status: 'present', submission_status: 'pending', submission_time: null, student: { id: 10, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2026-001' }, room: { id: 1, name: 'Amphi A', capacity: 120 }, created_at: '2026-03-26T08:00:00', updated_at: '2026-03-26T08:00:00' },
  { id: 2, exam_session_id: 1, student_id: 11, room_id: 1, seat_number: 'A-02', attendance_status: 'present', submission_status: 'pending', submission_time: null, student: { id: 11, firstname: 'Fatima', lastname: 'Moussa', matricule: 'ETU-2026-002' }, room: { id: 1, name: 'Amphi A', capacity: 120 }, created_at: '2026-03-26T08:00:00', updated_at: '2026-03-26T08:00:00' },
  { id: 3, exam_session_id: 1, student_id: 12, room_id: 1, seat_number: 'A-03', attendance_status: 'present', submission_status: 'pending', submission_time: null, student: { id: 12, firstname: 'Ibrahim', lastname: 'Souleymane', matricule: 'ETU-2026-003' }, room: { id: 1, name: 'Amphi A', capacity: 120 }, created_at: '2026-03-26T08:00:00', updated_at: '2026-03-26T08:00:00' },
  { id: 4, exam_session_id: 1, student_id: 13, room_id: 2, seat_number: 'B-01', attendance_status: 'present', submission_status: 'pending', submission_time: null, student: { id: 13, firstname: 'Aissatou', lastname: 'Abdou', matricule: 'ETU-2026-004' }, room: { id: 2, name: 'Salle 101', capacity: 40 }, created_at: '2026-03-26T08:00:00', updated_at: '2026-03-26T08:00:00' },
  { id: 5, exam_session_id: 1, student_id: 14, room_id: 2, seat_number: 'B-02', attendance_status: 'present', submission_status: 'pending', submission_time: null, student: { id: 14, firstname: 'Moussa', lastname: 'Hamidou', matricule: 'ETU-2026-005' }, room: { id: 2, name: 'Salle 101', capacity: 40 }, created_at: '2026-03-26T08:00:00', updated_at: '2026-03-26T08:00:00' },
];

const DEMO_CHECKLIST = [
  { key: 'rooms_assigned', label: 'Salles assignées', is_completed: true, completed_at: '2026-03-22T10:00:00' },
  { key: 'supervisors_assigned', label: 'Surveillants assignés', is_completed: true, completed_at: '2026-03-23T14:00:00' },
  { key: 'students_assigned', label: 'Étudiants inscrits', is_completed: true, completed_at: '2026-03-24T09:00:00' },
  { key: 'materials_defined', label: 'Matériels définis', is_completed: true, completed_at: '2026-03-24T10:00:00' },
  { key: 'instructions_set', label: 'Consignes rédigées', is_completed: true, completed_at: '2026-03-24T11:00:00' },
  { key: 'schedule_validated', label: 'Emploi du temps validé', is_completed: false, completed_at: null },
  { key: 'subjects_printed', label: 'Sujets imprimés', is_completed: false, completed_at: null },
  { key: 'published', label: 'Examen publié', is_completed: false, completed_at: null },
];

export const ExamManagementDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [selectedSession, setSelectedSession] = useState<ExamSession>(DEMO_SESSIONS[0]);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const students = DEMO_STUDENTS;
  const checklist = DEMO_CHECKLIST;
  const completedItems = checklist.filter(c => c.is_completed).length;
  const completionRate = Math.round((completedItems / checklist.length) * 100);

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Examens</Link>
        <Typography color="text.primary">Gestion des Épreuves</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Épreuves
        </Typography>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Session d&apos;examen</InputLabel>
          <Select
            label="Session d'examen"
            value={selectedSession.id}
            onChange={(e) => {
              const found = DEMO_SESSIONS.find(s => s.id === e.target.value);
              if (found) {
                setSelectedSession(found);
              }
            }}
          >
            {DEMO_SESSIONS.map(s => (
              <MenuItem key={s.id} value={s.id}>
                {s.title} - {s.module?.code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Étudiants inscrits', value: students.length, color: '#1976d2' },
          { label: 'Salles utilisées', value: new Set(students.map(s => s.room_id)).size, color: '#4caf50' },
          { label: 'Capacité totale', value: selectedSession.total_capacity, color: '#ff9800' },
          { label: 'Préparation', value: `${completionRate}%`, color: completionRate === 100 ? '#4caf50' : '#ff9800' },
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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Étudiants Assignés" />
        <Tab label="Matériels & Consignes" />
        <Tab label="Checklist de Préparation" />
      </Tabs>

      {/* Tab 0: Assigned Students */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Étudiants Assignés</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => setSnackbar({ open: true, message: 'Attribution automatique effectuée pour 45 étudiants', severity: 'success' })}
                >
                  Auto-Assigner
                </Button>
                <Button variant="outlined">
                  Assigner Manuellement
                </Button>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Nom & Prénom</TableCell>
                    <TableCell>Salle</TableCell>
                    <TableCell>Place</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((entry, idx) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {entry.student?.matricule}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {entry.student?.lastname} {entry.student?.firstname}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={entry.room?.name} color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography fontFamily="monospace">{entry.seat_number}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" color="error">
                          Retirer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Materials & Instructions */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Matériels Autorisés</Typography>
                  <Button variant="outlined" size="small" onClick={() => setMaterialsOpen(true)}>
                    Modifier
                  </Button>
                </Box>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography>
                    {selectedSession.allowed_materials || 'Aucun matériel autorisé'}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Consignes</Typography>
                  <Button variant="outlined" size="small" onClick={() => setMaterialsOpen(true)}>
                    Modifier
                  </Button>
                </Box>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography>
                    {selectedSession.instructions || 'Aucune consigne définie'}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Informations de la Session</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                      <Typography fontWeight="bold">{EXAM_TYPE_LABELS[selectedSession.type]}</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Durée</Typography>
                      <Typography fontWeight="bold">{selectedSession.duration_minutes} minutes</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                      <Typography fontWeight="bold">{EXAM_SESSION_STATUS_LABELS[selectedSession.status]}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Preparation Checklist */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Checklist de Préparation</Typography>
              <Chip
                label={`${completionRate}% terminé`}
                color={completionRate === 100 ? 'success' : 'warning'}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                  height: 12, borderRadius: 6,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: completionRate === 100 ? '#4caf50' : '#ff9800',
                    borderRadius: 6,
                  },
                }}
              />
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>Étape</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date de complétion</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checklist.map(item => (
                    <TableRow key={item.key} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={item.is_completed}
                          onChange={() => setSnackbar({ open: true, message: `"${item.label}" mis à jour`, severity: 'success' })}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={item.is_completed ? 'normal' : 'bold'} sx={{ textDecoration: item.is_completed ? 'line-through' : 'none' }}>
                          {item.label}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.is_completed ? 'Terminé' : 'En attente'}
                          color={item.is_completed ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        {item.completed_at
                          ? new Date(item.completed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Edit Materials Dialog */}
      <Dialog open={materialsOpen} onClose={() => setMaterialsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier Matériels & Consignes</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Matériels autorisés"
              defaultValue={selectedSession.allowed_materials || ''}
              fullWidth
              multiline
              rows={3}
              placeholder="Ex: Calculatrice simple, 1 feuille A4 recto-verso"
            />
            <TextField
              label="Consignes"
              defaultValue={selectedSession.instructions || ''}
              fullWidth
              multiline
              rows={4}
              placeholder="Instructions spéciales pour les étudiants"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaterialsOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setMaterialsOpen(false);
              setSnackbar({ open: true, message: 'Matériels et consignes mis à jour', severity: 'success' });
            }}
          >
            Enregistrer
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
