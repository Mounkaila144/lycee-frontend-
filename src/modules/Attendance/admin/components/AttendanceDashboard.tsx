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
import CircularProgress from '@mui/material/CircularProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import ButtonGroup from '@mui/material/ButtonGroup';

import {
  useAttendanceSessions,
  useAttendanceSheet,
  useCreateSession,
  useRecordAttendance,
  useCompleteSession,
} from '../hooks';

import type {
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  SessionMethod,
} from '../../types';

import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_SESSIONS: AttendanceSession[] = [
  {
    id: 1, timetable_slot_id: 1, session_date: '2026-03-26', start_time: '08:00', end_time: '10:00',
    status: 'open', method: 'manual', created_by: 1, completed_by: null, completed_at: null, notes: null,
    timetable_slot: { id: 1, module_id: 1, teacher_id: 1, group_id: 1, room_id: 1, day_of_week: 'Jeudi', start_time: '08:00', end_time: '10:00', type: 'CM', module: { id: 1, name: 'Algorithmes', code: 'ALGO' } },
    creator: { id: 1, firstname: 'Dr.', lastname: 'Dupont' },
    created_at: '2026-03-26T08:00:00', updated_at: '2026-03-26T08:00:00',
  },
  {
    id: 2, timetable_slot_id: 2, session_date: '2026-03-26', start_time: '10:00', end_time: '12:00',
    status: 'completed', method: 'manual', created_by: 2, completed_by: 2, completed_at: '2026-03-26T12:00:00', notes: null,
    timetable_slot: { id: 2, module_id: 2, teacher_id: 2, group_id: 1, room_id: 2, day_of_week: 'Jeudi', start_time: '10:00', end_time: '12:00', type: 'TD', module: { id: 2, name: 'Base de données', code: 'BDD' } },
    creator: { id: 2, firstname: 'Prof.', lastname: 'Martin' },
    created_at: '2026-03-26T10:00:00', updated_at: '2026-03-26T12:00:00',
  },
  {
    id: 3, timetable_slot_id: 3, session_date: '2026-03-25', start_time: '14:00', end_time: '16:00',
    status: 'completed', method: 'qr_code', created_by: 1, completed_by: 1, completed_at: '2026-03-25T16:00:00', notes: null,
    timetable_slot: { id: 3, module_id: 3, teacher_id: 3, group_id: 2, room_id: 3, day_of_week: 'Mercredi', start_time: '14:00', end_time: '16:00', type: 'TP', module: { id: 3, name: 'Réseaux', code: 'RES' } },
    creator: { id: 3, firstname: 'Dr.', lastname: 'Bernard' },
    created_at: '2026-03-25T14:00:00', updated_at: '2026-03-25T16:00:00',
  },
];

const DEMO_STUDENTS = [
  { id: 10, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2026-001' },
  { id: 11, firstname: 'Fatima', lastname: 'Moussa', matricule: 'ETU-2026-002' },
  { id: 12, firstname: 'Ibrahim', lastname: 'Souleymane', matricule: 'ETU-2026-003' },
  { id: 13, firstname: 'Aissatou', lastname: 'Abdou', matricule: 'ETU-2026-004' },
  { id: 14, firstname: 'Moussa', lastname: 'Hamidou', matricule: 'ETU-2026-005' },
  { id: 15, firstname: 'Mariama', lastname: 'Issaka', matricule: 'ETU-2026-006' },
  { id: 16, firstname: 'Ousmane', lastname: 'Garba', matricule: 'ETU-2026-007' },
  { id: 17, firstname: 'Hadiza', lastname: 'Mahamane', matricule: 'ETU-2026-008' },
];

const DEMO_SHEET: AttendanceRecord[] = DEMO_STUDENTS.map((s, i) => ({
  id: i + 1,
  attendance_session_id: 1,
  student_id: s.id,
  status: (['present', 'present', 'present', 'absent', 'present', 'late', 'present', 'excused'] as AttendanceStatus[])[i],
  arrival_time: i === 5 ? '08:15' : null,
  delay_minutes: i === 5 ? 15 : null,
  notes: null,
  recorded_by: 1,
  modified_by: null,
  modification_reason: null,
  student: s,
  created_at: '2026-03-26T08:00:00',
  updated_at: '2026-03-26T08:00:00',
}));

const METHOD_LABELS: Record<SessionMethod, string> = {
  manual: 'Manuel',
  mobile: 'Mobile',
  qr_code: 'QR Code',
  imported: 'Importé',
};

export const AttendanceDashboard: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // In production, use real hooks:
  // const { data: sessionsData, isLoading } = useAttendanceSessions(filters);
  // For now, demo data:
  const sessions = DEMO_SESSIONS;
  const sheetRecords = DEMO_SHEET;

  const handleOpenSheet = useCallback((session: AttendanceSession) => {
    setSelectedSession(session);
    setSheetOpen(true);
  }, []);

  const handleStatusToggle = useCallback((record: AttendanceRecord) => {
    const statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];
    const currentIdx = statuses.indexOf(record.status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];

    // In production: recordAttendance.mutate(...)
    setSnackbar({
      open: true,
      message: `${record.student?.firstname} ${record.student?.lastname} → ${ATTENDANCE_STATUS_LABELS[nextStatus]}`,
      severity: 'success',
    });
  }, []);

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'open': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getSessionStats = () => {
    const present = sheetRecords.filter(r => r.status === 'present').length;
    const absent = sheetRecords.filter(r => r.status === 'absent').length;
    const late = sheetRecords.filter(r => r.status === 'late').length;
    const excused = sheetRecords.filter(r => r.status === 'excused').length;

    return { present, absent, late, excused, total: sheetRecords.length };
  };

  const stats = getSessionStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Typography color="text.primary">Gestion des Présences</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Feuille d&apos;Appel
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          + Nouvelle Session
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Sessions aujourd\'hui', value: sessions.filter(s => s.session_date === '2026-03-26').length, color: '#1976d2' },
          { label: 'Sessions ouvertes', value: sessions.filter(s => s.status === 'open').length, color: '#4caf50' },
          { label: 'Taux présence moyen', value: `${Math.round((stats.present / stats.total) * 100)}%`, color: '#ff9800' },
          { label: 'Absences non justifiées', value: stats.absent, color: '#f44336' },
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
          <Typography variant="h6" sx={{ mb: 2 }}>Sessions d&apos;Appel</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Horaire</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Méthode</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Enseignant</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(session => (
                  <TableRow key={session.id} hover>
                    <TableCell>{new Date(session.session_date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {session.timetable_slot?.module?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.timetable_slot?.module?.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{session.start_time} - {session.end_time}</TableCell>
                    <TableCell>
                      <Chip size="small" label={session.timetable_slot?.type} />
                    </TableCell>
                    <TableCell>{METHOD_LABELS[session.method]}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={session.status === 'open' ? 'Ouverte' : session.status === 'completed' ? 'Terminée' : 'Annulée'}
                        color={getStatusColor(session.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {session.creator?.firstname} {session.creator?.lastname}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenSheet(session)}
                      >
                        {session.status === 'open' ? 'Faire l\'appel' : 'Voir'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Attendance Sheet Dialog */}
      <Dialog open={sheetOpen} onClose={() => setSheetOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                Feuille d&apos;Appel - {selectedSession?.timetable_slot?.module?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSession && new Date(selectedSession.session_date).toLocaleDateString('fr-FR')} | {selectedSession?.start_time} - {selectedSession?.end_time}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={`P: ${stats.present}`} sx={{ bgcolor: ATTENDANCE_STATUS_COLORS.present, color: 'white' }} size="small" />
              <Chip label={`A: ${stats.absent}`} sx={{ bgcolor: ATTENDANCE_STATUS_COLORS.absent, color: 'white' }} size="small" />
              <Chip label={`R: ${stats.late}`} sx={{ bgcolor: ATTENDANCE_STATUS_COLORS.late, color: 'white' }} size="small" />
              <Chip label={`E: ${stats.excused}`} sx={{ bgcolor: ATTENDANCE_STATUS_COLORS.excused, color: 'white' }} size="small" />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" color="success">
              Tout Présent
            </Button>
            <Button size="small" variant="outlined" color="error">
              Tout Absent
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Matricule</TableCell>
                  <TableCell>Nom & Prénom</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell>Retard</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sheetRecords.map((record, idx) => (
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
                    <TableCell align="center">
                      <Tooltip title="Cliquez pour changer le statut">
                        <Chip
                          label={ATTENDANCE_STATUS_LABELS[record.status]}
                          sx={{
                            bgcolor: ATTENDANCE_STATUS_COLORS[record.status],
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            minWidth: 90,
                          }}
                          onClick={() => handleStatusToggle(record)}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {record.delay_minutes ? `${record.delay_minutes} min` : '-'}
                    </TableCell>
                    <TableCell>
                      {record.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSheetOpen(false)}>Fermer</Button>
          {selectedSession?.status === 'open' && (
            <Button variant="contained" color="primary">
              Terminer la Session
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Session d&apos;Appel</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Date de la session"
              type="date"
              defaultValue="2026-03-26"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Créneau</InputLabel>
              <Select label="Créneau" defaultValue="">
                <MenuItem value={1}>Lundi 08:00-10:00 - ALGO (CM)</MenuItem>
                <MenuItem value={2}>Lundi 10:00-12:00 - BDD (TD)</MenuItem>
                <MenuItem value={3}>Mercredi 14:00-16:00 - RES (TP)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Méthode</InputLabel>
              <Select label="Méthode" defaultValue="manual">
                <MenuItem value="manual">Manuel</MenuItem>
                <MenuItem value="mobile">Mobile</MenuItem>
                <MenuItem value="qr_code">QR Code</MenuItem>
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
              setSnackbar({ open: true, message: 'Session créée avec succès', severity: 'success' });
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
