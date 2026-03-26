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
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';

import type {
  ExamSupervisor,
  ExamAttendanceSheet,
  ExamIncident,
  ExamAttendanceStatus,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from '../../types';

import {
  SUPERVISOR_ROLE_LABELS,
  EXAM_ATTENDANCE_STATUS_LABELS,
  EXAM_ATTENDANCE_STATUS_COLORS,
  SUBMISSION_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_STATUS_LABELS,
} from '../../types';

// ──── Demo Data ────

const DEMO_SUPERVISORS: ExamSupervisor[] = [
  {
    id: 1, exam_session_id: 1, teacher_id: 1, role: 'chief', room_id: 1, is_present: true,
    teacher: { id: 1, firstname: 'Dr.', lastname: 'Dupont', email: 'dupont@univ.ne' },
    room: { id: 1, name: 'Amphi A', capacity: 120 },
    created_at: '2026-03-22T10:00:00', updated_at: '2026-04-15T07:50:00',
  },
  {
    id: 2, exam_session_id: 1, teacher_id: 2, role: 'regular', room_id: 1, is_present: true,
    teacher: { id: 2, firstname: 'Prof.', lastname: 'Martin', email: 'martin@univ.ne' },
    room: { id: 1, name: 'Amphi A', capacity: 120 },
    created_at: '2026-03-22T10:00:00', updated_at: '2026-04-15T07:55:00',
  },
  {
    id: 3, exam_session_id: 1, teacher_id: 3, role: 'regular', room_id: 2, is_present: false,
    teacher: { id: 3, firstname: 'Dr.', lastname: 'Bernard', email: 'bernard@univ.ne' },
    room: { id: 2, name: 'Salle 101', capacity: 40 },
    created_at: '2026-03-22T10:00:00', updated_at: '2026-03-22T10:00:00',
  },
  {
    id: 4, exam_session_id: 1, teacher_id: 4, role: 'chief', room_id: 2, is_present: true,
    teacher: { id: 4, firstname: 'Prof.', lastname: 'Koné', email: 'kone@univ.ne' },
    room: { id: 2, name: 'Salle 101', capacity: 40 },
    created_at: '2026-03-22T10:00:00', updated_at: '2026-04-15T07:45:00',
  },
];

const DEMO_ATTENDANCE: ExamAttendanceSheet[] = [
  { id: 1, exam_session_id: 1, student_id: 10, room_id: 1, seat_number: 'A-01', attendance_status: 'present', submission_status: 'submitted', submission_time: '2026-04-15T10:45:00', student: { id: 10, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2026-001' }, created_at: '2026-04-15T08:00:00', updated_at: '2026-04-15T10:45:00' },
  { id: 2, exam_session_id: 1, student_id: 11, room_id: 1, seat_number: 'A-02', attendance_status: 'present', submission_status: 'submitted', submission_time: '2026-04-15T10:50:00', student: { id: 11, firstname: 'Fatima', lastname: 'Moussa', matricule: 'ETU-2026-002' }, created_at: '2026-04-15T08:00:00', updated_at: '2026-04-15T10:50:00' },
  { id: 3, exam_session_id: 1, student_id: 12, room_id: 1, seat_number: 'A-03', attendance_status: 'absent', submission_status: 'not_submitted', submission_time: null, student: { id: 12, firstname: 'Ibrahim', lastname: 'Souleymane', matricule: 'ETU-2026-003' }, created_at: '2026-04-15T08:00:00', updated_at: '2026-04-15T08:00:00' },
  { id: 4, exam_session_id: 1, student_id: 13, room_id: 2, seat_number: 'B-01', attendance_status: 'late', submission_status: 'submitted', submission_time: '2026-04-15T10:55:00', student: { id: 13, firstname: 'Aissatou', lastname: 'Abdou', matricule: 'ETU-2026-004' }, created_at: '2026-04-15T08:00:00', updated_at: '2026-04-15T10:55:00' },
  { id: 5, exam_session_id: 1, student_id: 14, room_id: 2, seat_number: 'B-02', attendance_status: 'present', submission_status: 'pending', submission_time: null, student: { id: 14, firstname: 'Moussa', lastname: 'Hamidou', matricule: 'ETU-2026-005' }, created_at: '2026-04-15T08:00:00', updated_at: '2026-04-15T08:00:00' },
  { id: 6, exam_session_id: 1, student_id: 15, room_id: 1, seat_number: 'A-04', attendance_status: 'present', submission_status: 'submitted', submission_time: '2026-04-15T10:40:00', student: { id: 15, firstname: 'Mariama', lastname: 'Issaka', matricule: 'ETU-2026-006' }, created_at: '2026-04-15T08:00:00', updated_at: '2026-04-15T10:40:00' },
];

const DEMO_INCIDENTS: ExamIncident[] = [
  {
    id: 1, exam_session_id: 1, student_id: 13, type: 'cheating', title: 'Utilisation de téléphone',
    description: 'Étudiant surpris avec un téléphone portable sous la table',
    severity: 'major', occurred_at_time: '09:30', status: 'investigating',
    action_taken: 'Copie confisquée, PV en cours de rédaction', witnesses: 'Prof. Martin, Dr. Dupont',
    evidence_path: null, reported_by: 1,
    student: { id: 13, firstname: 'Aissatou', lastname: 'Abdou', matricule: 'ETU-2026-004' },
    reporter: { id: 1, firstname: 'Dr.', lastname: 'Dupont' },
    created_at: '2026-04-15T09:30:00', updated_at: '2026-04-15T09:45:00',
  },
  {
    id: 2, exam_session_id: 1, student_id: null, type: 'material', title: 'Panne de climatisation',
    description: 'La climatisation de l\'Amphi A est en panne depuis 10h00',
    severity: 'moderate', occurred_at_time: '10:00', status: 'resolved',
    action_taken: 'Ouverture des fenêtres, service technique contacté', witnesses: null,
    evidence_path: null, reported_by: 1,
    reporter: { id: 1, firstname: 'Dr.', lastname: 'Dupont' },
    created_at: '2026-04-15T10:00:00', updated_at: '2026-04-15T10:30:00',
  },
  {
    id: 3, exam_session_id: 1, student_id: 10, type: 'medical', title: 'Malaise étudiant',
    description: 'Étudiant ayant eu un malaise pendant l\'examen',
    severity: 'critical', occurred_at_time: '10:15', status: 'reported',
    action_taken: null, witnesses: 'Étudiants voisins', evidence_path: null, reported_by: 2,
    student: { id: 10, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2026-001' },
    reporter: { id: 2, firstname: 'Prof.', lastname: 'Martin' },
    created_at: '2026-04-15T10:15:00', updated_at: '2026-04-15T10:15:00',
  },
];

const getIncidentStatusColor = (status: IncidentStatus): 'warning' | 'info' | 'success' | 'error' => {
  switch (status) {
    case 'reported': return 'warning';
    case 'investigating': return 'info';
    case 'resolved': return 'success';
    case 'escalated': return 'error';
    default: return 'warning';
  }
};

export const ExamSupervisionDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const supervisors = DEMO_SUPERVISORS;
  const attendance = DEMO_ATTENDANCE;
  const incidents = DEMO_INCIDENTS;

  const presentSupervisors = supervisors.filter(s => s.is_present).length;
  const presentStudents = attendance.filter(a => a.attendance_status === 'present').length;
  const absentStudents = attendance.filter(a => a.attendance_status === 'absent').length;
  const submittedCopies = attendance.filter(a => a.submission_status === 'submitted').length;

  const handleToggleAttendance = useCallback((record: ExamAttendanceSheet) => {
    const statuses: ExamAttendanceStatus[] = ['present', 'absent', 'late'];
    const currentIdx = statuses.indexOf(record.attendance_status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];

    setSnackbar({
      open: true,
      message: `${record.student?.firstname} ${record.student?.lastname} -> ${EXAM_ATTENDANCE_STATUS_LABELS[nextStatus]}`,
      severity: 'success',
    });
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Examens</Link>
        <Typography color="text.primary">Surveillance</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Surveillance des Examens
        </Typography>
        <Button variant="contained" color="error" onClick={() => setIncidentOpen(true)}>
          Signaler un Incident
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Surveillants présents', value: `${presentSupervisors}/${supervisors.length}`, color: '#1976d2' },
          { label: 'Étudiants présents', value: presentStudents, color: '#4caf50' },
          { label: 'Absents', value: absentStudents, color: '#f44336' },
          { label: 'Copies remises', value: submittedCopies, color: '#9c27b0' },
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
        <Tab label="Surveillants" />
        <Tab label="Feuille d'Émargement" />
        <Tab label={`Incidents (${incidents.length})`} />
      </Tabs>

      {/* Tab 0: Supervisors */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Équipe de Surveillance</Typography>
              <Button variant="outlined">
                + Ajouter un Surveillant
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Enseignant</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Salle</TableCell>
                    <TableCell>Présence</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supervisors.map(sup => (
                    <TableRow key={sup.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {sup.teacher?.firstname} {sup.teacher?.lastname}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {sup.teacher?.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={SUPERVISOR_ROLE_LABELS[sup.role]}
                          color={sup.role === 'chief' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={sup.room?.name} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={sup.is_present ? 'Présent' : 'Absent'}
                          color={sup.is_present ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {!sup.is_present && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => setSnackbar({ open: true, message: `${sup.teacher?.lastname} marqué présent`, severity: 'success' })}
                            >
                              Marquer Présent
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setReplaceOpen(true)}
                          >
                            Remplacer
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Attendance Sheet */}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Feuille d&apos;Émargement</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={`P: ${presentStudents}`} sx={{ bgcolor: '#4caf50', color: 'white' }} size="small" />
                <Chip label={`A: ${absentStudents}`} sx={{ bgcolor: '#f44336', color: 'white' }} size="small" />
                <Chip label={`R: ${attendance.filter(a => a.attendance_status === 'late').length}`} sx={{ bgcolor: '#ff9800', color: 'white' }} size="small" />
              </Box>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Nom & Prénom</TableCell>
                    <TableCell>Place</TableCell>
                    <TableCell align="center">Présence</TableCell>
                    <TableCell>Copie</TableCell>
                    <TableCell>Heure remise</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.map((record, idx) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {record.student?.matricule}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {record.student?.lastname} {record.student?.firstname}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontFamily="monospace">{record.seat_number}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Cliquez pour changer le statut">
                          <Chip
                            label={EXAM_ATTENDANCE_STATUS_LABELS[record.attendance_status]}
                            sx={{
                              bgcolor: EXAM_ATTENDANCE_STATUS_COLORS[record.attendance_status],
                              color: 'white',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              minWidth: 90,
                            }}
                            onClick={() => handleToggleAttendance(record)}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={SUBMISSION_STATUS_LABELS[record.submission_status]}
                          color={record.submission_status === 'submitted' ? 'success' : record.submission_status === 'not_submitted' ? 'error' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {record.submission_time
                          ? new Date(record.submission_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
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

      {/* Tab 2: Incidents */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Incidents Signalés</Typography>
              <Button variant="contained" color="error" onClick={() => setIncidentOpen(true)}>
                + Nouveau Rapport
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Heure</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Titre</TableCell>
                    <TableCell>Étudiant</TableCell>
                    <TableCell>Sévérité</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Signalé par</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incidents.map(incident => (
                    <TableRow key={incident.id} hover>
                      <TableCell>
                        <Typography fontFamily="monospace">{incident.occurred_at_time}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={INCIDENT_TYPE_LABELS[incident.type]} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{incident.title}</Typography>
                        {incident.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 250 }} noWrap>
                            {incident.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {incident.student ? (
                          <Box>
                            <Typography variant="body2">{incident.student.lastname} {incident.student.firstname}</Typography>
                            <Typography variant="caption" color="text.secondary">{incident.student.matricule}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={INCIDENT_SEVERITY_LABELS[incident.severity]}
                          sx={{ bgcolor: INCIDENT_SEVERITY_COLORS[incident.severity], color: 'white', fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={INCIDENT_STATUS_LABELS[incident.status]}
                          color={getIncidentStatusColor(incident.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {incident.reporter?.firstname} {incident.reporter?.lastname}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSnackbar({ open: true, message: `Incident "${incident.title}" mis à jour`, severity: 'success' })}
                        >
                          Traiter
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

      {/* Report Incident Dialog */}
      <Dialog open={incidentOpen} onClose={() => setIncidentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Signaler un Incident</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Titre" fullWidth placeholder="Ex: Utilisation de téléphone" />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" defaultValue="cheating">
                <MenuItem value="cheating">Fraude</MenuItem>
                <MenuItem value="disruption">Perturbation</MenuItem>
                <MenuItem value="medical">Médical</MenuItem>
                <MenuItem value="material">Matériel</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Sévérité</InputLabel>
              <Select label="Sévérité" defaultValue="moderate">
                <MenuItem value="minor">Mineur</MenuItem>
                <MenuItem value="moderate">Modéré</MenuItem>
                <MenuItem value="major">Majeur</MenuItem>
                <MenuItem value="critical">Critique</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Étudiant concerné (optionnel)</InputLabel>
              <Select label="Étudiant concerné (optionnel)" defaultValue="">
                <MenuItem value="">Aucun</MenuItem>
                {DEMO_ATTENDANCE.map(a => (
                  <MenuItem key={a.student_id} value={a.student_id}>
                    {a.student?.matricule} - {a.student?.lastname} {a.student?.firstname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Heure de l'incident"
              type="time"
              defaultValue="09:30"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField label="Description" fullWidth multiline rows={3} />
            <TextField label="Témoins" fullWidth placeholder="Noms des témoins" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncidentOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setIncidentOpen(false);
              setSnackbar({ open: true, message: 'Incident signalé avec succès', severity: 'success' });
            }}
          >
            Signaler
          </Button>
        </DialogActions>
      </Dialog>

      {/* Replace Supervisor Dialog */}
      <Dialog open={replaceOpen} onClose={() => setReplaceOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Remplacer un Surveillant</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Surveillant remplaçant</InputLabel>
              <Select label="Surveillant remplaçant" defaultValue="">
                <MenuItem value={5}>Dr. Amadou - Disponible</MenuItem>
                <MenuItem value={6}>Prof. Issa - Disponible</MenuItem>
                <MenuItem value={7}>Dr. Hama - Disponible</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplaceOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setReplaceOpen(false);
              setSnackbar({ open: true, message: 'Surveillant remplacé avec succès', severity: 'success' });
            }}
          >
            Confirmer
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
