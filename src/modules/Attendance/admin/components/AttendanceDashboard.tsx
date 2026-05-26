'use client';

import React, { useState, useCallback, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

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
import CircularProgress from '@mui/material/CircularProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';

import { createApiClient } from '@/shared/lib/api-client';

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

const METHOD_LABELS: Record<SessionMethod, string> = {
  manual: 'Manuel',
  mobile: 'Mobile',
  qr_code: 'QR Code',
  imported: 'Importé',
};

const SESSION_STATUS_LABELS: Record<string, string> = {
  draft: 'Ouverte',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

/** A session is editable (call can be taken) while it's draft or in_progress. */
const isSessionOpen = (s?: { status?: string } | null): boolean =>
  s?.status === 'draft' || s?.status === 'in_progress';

interface SlotOption {
  id: number;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  type?: string;
  module?: { name?: string; code?: string };
}

/** Normalise une réponse API qui peut être paginée ({data:[...]}) ou un tableau brut. */
function toArray<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp as T[];
  const r = resp as { data?: unknown };
  if (r && Array.isArray(r.data)) return r.data as T[];
  const nested = (r?.data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as T[];
  return [];
}

export const AttendanceDashboard: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ class_id: string; subject_id: string; session_date: string; method: SessionMethod }>({
    class_id: '',
    subject_id: '',
    session_date: new Date().toISOString().slice(0, 10),
    method: 'manual',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const notify = useCallback((message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // ──── Real API data ────
  const { data: sessionsResp, isLoading, isError, error } = useAttendanceSessions();
  const sessions = useMemo(() => toArray<AttendanceSession>(sessionsResp), [sessionsResp]);

  const { data: sheetResp, isLoading: sheetLoading } = useAttendanceSheet(sheetOpen ? selectedSession?.id : undefined);
  // getAttendanceSheet returns { session, records, summary }
  const sheetRecords = useMemo(() => toArray<AttendanceRecord>((sheetResp as any)?.records ?? sheetResp), [sheetResp]);

  // Classes & subjects for the "create session" form (secondary model).
  const { data: classesResp } = useQuery({
    queryKey: ['classes-for-attendance'],
    queryFn: async () => (await createApiClient().get('/admin/classes')).data,
    enabled: createOpen,
  });
  const classes = useMemo(() => toArray<{ id: number; name: string }>(classesResp), [classesResp]);

  const { data: subjectsResp } = useQuery({
    queryKey: ['subjects-for-attendance'],
    queryFn: async () => (await createApiClient().get('/admin/subjects')).data,
    enabled: createOpen,
  });
  const subjects = useMemo(() => toArray<{ id: number; name: string; code?: string }>(subjectsResp), [subjectsResp]);

  const createSession = useCreateSession();
  const recordAttendance = useRecordAttendance();
  const completeSession = useCompleteSession();

  const handleOpenSheet = useCallback((session: AttendanceSession) => {
    setSelectedSession(session);
    setSheetOpen(true);
  }, []);

  const handleStatusToggle = useCallback((record: AttendanceRecord) => {
    if (!selectedSession) return;
    if (!isSessionOpen(selectedSession)) {
      notify("La session est terminée : modification impossible.", 'error');
      return;
    }
    const statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];
    const currentIdx = statuses.indexOf(record.status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];

    recordAttendance.mutate(
      { session_id: selectedSession.id, student_id: record.student_id, status: nextStatus },
      {
        onSuccess: () => notify(`${record.student?.firstname ?? ''} ${record.student?.lastname ?? ''} → ${ATTENDANCE_STATUS_LABELS[nextStatus]}`),
        onError: (e: any) => notify(e?.response?.data?.message ?? "Échec de l'enregistrement.", 'error'),
      },
    );
  }, [selectedSession, recordAttendance, notify]);

  const handleCreateSession = useCallback(() => {
    if (!createForm.class_id || !createForm.subject_id) {
      notify('Sélectionnez une classe et une matière.', 'error');
      return;
    }
    createSession.mutate(
      {
        class_id: Number(createForm.class_id),
        subject_id: Number(createForm.subject_id),
        session_date: createForm.session_date,
        method: createForm.method,
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          notify('Session créée avec succès');
        },
        onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la création de la session.', 'error'),
      },
    );
  }, [createForm, createSession, notify]);

  const handleCompleteSession = useCallback(() => {
    if (!selectedSession) return;
    completeSession.mutate(selectedSession.id, {
      onSuccess: () => {
        setSheetOpen(false);
        notify('Session terminée avec succès');
      },
      onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la clôture.', 'error'),
    });
  }, [selectedSession, completeSession, notify]);

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'draft': return 'success';
      case 'in_progress': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const stats = useMemo(() => {
    const present = sheetRecords.filter(r => r.status === 'present').length;
    const absent = sheetRecords.filter(r => r.status === 'absent').length;
    const late = sheetRecords.filter(r => r.status === 'late').length;
    const excused = sheetRecords.filter(r => r.status === 'excused').length;
    return { present, absent, late, excused, total: sheetRecords.length };
  }, [sheetRecords]);

  const today = new Date().toISOString().slice(0, 10);
  const openCount = sessions.filter(s => s.status === 'open').length;
  const todayCount = sessions.filter(s => s.session_date === today).length;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Typography color="text.primary">Gestion des Présences</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Feuille d&apos;Appel</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>+ Nouvelle Session</Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Sessions aujourd'hui", value: todayCount, color: '#1976d2' },
          { label: 'Sessions ouvertes', value: openCount, color: '#4caf50' },
          { label: 'Total sessions', value: sessions.length, color: '#ff9800' },
          { label: 'Présents (session ouverte)', value: stats.present, color: '#4caf50' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sessions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Sessions d&apos;Appel</Typography>

          {isLoading && (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          )}
          {isError && (
            <Alert severity="error">{(error as any)?.response?.data?.message ?? 'Erreur de chargement des sessions.'}</Alert>
          )}
          {!isLoading && !isError && sessions.length === 0 && (
            <Alert severity="info">
              Aucune session d&apos;appel. Cliquez sur « Nouvelle Session » pour en créer une à partir d&apos;un créneau d&apos;emploi du temps.
            </Alert>
          )}

          {!isLoading && !isError && sessions.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell>Matière</TableCell>
                    <TableCell>Méthode</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Créé par</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map(session => (
                    <TableRow key={session.id} hover>
                      <TableCell>{new Date(session.session_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell><Typography fontWeight="medium">{session.classe?.name ?? '—'}</Typography></TableCell>
                      <TableCell>{session.subject?.name ?? '—'}</TableCell>
                      <TableCell>{METHOD_LABELS[session.method] ?? session.method}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={SESSION_STATUS_LABELS[session.status] ?? session.status}
                          color={getStatusColor(session.status)}
                        />
                      </TableCell>
                      <TableCell>{session.creator?.firstname} {session.creator?.lastname}</TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" onClick={() => handleOpenSheet(session)}>
                          {isSessionOpen(session) ? "Faire l'appel" : 'Voir'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Attendance Sheet Dialog */}
      <Dialog open={sheetOpen} onClose={() => setSheetOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Feuille d&apos;Appel — {selectedSession?.classe?.name ?? ''}{selectedSession?.subject?.name ? ` · ${selectedSession.subject.name}` : ''}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSession && new Date(selectedSession.session_date).toLocaleDateString('fr-FR')}
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
          {sheetLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
          {!sheetLoading && sheetRecords.length === 0 && (
            <Alert severity="info">Aucun élève rattaché à cette session.</Alert>
          )}
          {!sheetLoading && sheetRecords.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Nom &amp; Prénom</TableCell>
                    <TableCell align="center">Statut</TableCell>
                    <TableCell>Retard</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sheetRecords.map((record, idx) => (
                    <TableRow key={record.id ?? record.student_id} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell><Typography variant="body2" fontFamily="monospace">{record.student?.matricule}</Typography></TableCell>
                      <TableCell><Typography fontWeight="medium">{record.student?.lastname} {record.student?.firstname}</Typography></TableCell>
                      <TableCell align="center">
                        <Tooltip title={selectedSession?.status === 'open' ? 'Cliquez pour changer le statut' : 'Session terminée'}>
                          <span>
                            <Chip
                              label={ATTENDANCE_STATUS_LABELS[record.status]}
                              sx={{ bgcolor: ATTENDANCE_STATUS_COLORS[record.status], color: 'white', cursor: selectedSession?.status === 'open' ? 'pointer' : 'default', fontWeight: 'bold', minWidth: 90 }}
                              onClick={() => handleStatusToggle(record)}
                            />
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{record.delay_minutes ? `${record.delay_minutes} min` : '-'}</TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSheetOpen(false)}>Fermer</Button>
          {selectedSession?.status === 'open' && (
            <Button variant="contained" color="primary" onClick={handleCompleteSession} disabled={completeSession.isPending}>
              {completeSession.isPending ? 'Clôture…' : 'Terminer la Session'}
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
              value={createForm.session_date}
              onChange={(e) => setCreateForm(f => ({ ...f, session_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Classe</InputLabel>
              <Select
                label="Classe"
                value={createForm.class_id}
                onChange={(e) => setCreateForm(f => ({ ...f, class_id: String(e.target.value) }))}
              >
                {classes.length === 0 && <MenuItem value="" disabled>Aucune classe</MenuItem>}
                {classes.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Matière</InputLabel>
              <Select
                label="Matière"
                value={createForm.subject_id}
                onChange={(e) => setCreateForm(f => ({ ...f, subject_id: String(e.target.value) }))}
              >
                {subjects.length === 0 && <MenuItem value="" disabled>Aucune matière</MenuItem>}
                {subjects.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.code ? `${s.code} — ${s.name}` : s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Méthode</InputLabel>
              <Select
                label="Méthode"
                value={createForm.method}
                onChange={(e) => setCreateForm(f => ({ ...f, method: e.target.value as SessionMethod }))}
              >
                <MenuItem value="manual">Manuel</MenuItem>
                <MenuItem value="mobile">Mobile</MenuItem>
                <MenuItem value="qr_code">QR Code</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateSession} disabled={createSession.isPending}>
            {createSession.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
