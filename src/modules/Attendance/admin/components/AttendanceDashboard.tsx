'use client';

import React, { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';

import { lyceeGradesService } from '@/modules/Grades/lycee';

import {
  useAttendanceClasses,
  useAttendanceSessions,
  useAttendanceSheet,
  useCompleteSession,
  useCreateSession,
  useModifyRecord,
  useRecordAttendance,
  useRecordAttendanceInBulk,
} from '../hooks';

import type {
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  SessionMethod,
} from '../../types';

import {
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
  SESSION_STATUS_LABELS,
} from '../../types';

const METHOD_LABELS: Record<SessionMethod, string> = {
  manual: 'Manuel',
  mobile: 'Mobile',
  qr_code: 'QR Code',
  imported: 'Importé',
};

const STATUS_CYCLE: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

const today = (): string => new Date().toISOString().slice(0, 10);

const errorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { message?: string } } })?.response?.data;

  return data?.message || fallback;
};

const studentName = (record: AttendanceRecord): string => {
  const person = record.student_profile ?? record.student;

  return person ? `${person.lastname ?? ''} ${person.firstname ?? ''}`.trim() : `#${record.student_id}`;
};

/** « Modifié par X le … (motif) » lorsque l'enregistrement a été corrigé. */
const correctionLabel = (record: AttendanceRecord): string | null => {
  if (!record.modified_by) return null;
  const author = record.modifier ? `${record.modifier.firstname ?? ''} ${record.modifier.lastname ?? ''}`.trim() : `#${record.modified_by}`;
  const date = new Date(record.updated_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

  return `Modifié par ${author} le ${date}${record.modification_reason ? ` (${record.modification_reason})` : ''}`;
};

const sessionLabel = (session: AttendanceSession): string =>
  session.classe?.name ?? session.timetable_slot?.module?.name ?? `Séance #${session.id}`;

export const AttendanceDashboard: React.FC = () => {
  const [page, setPage] = useState(0);
  const [classeFilter, setClasseFilter] = useState<number | ''>('');
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ classe_id: '' as number | '', subject_id: '' as number | '', session_date: today(), start_time: '08:00', end_time: '10:00', method: 'manual' as SessionMethod });
  const [correction, setCorrection] = useState<{ record: AttendanceRecord; status: AttendanceStatus; reason: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data: classes = [] } = useAttendanceClasses();
  const { data: sessionsData, isLoading, error } = useAttendanceSessions({
    page: page + 1,
    classe_id: classeFilter || undefined,
  });
  const { data: sheet, isLoading: sheetLoading } = useAttendanceSheet(selectedSessionId);

  const { data: classSubjects = [] } = useQuery({
    queryKey: ['attendance', 'class-subjects', form.classe_id],
    queryFn: () => lyceeGradesService.getClassSubjects(Number(form.classe_id)),
    enabled: createOpen && !!form.classe_id,
    retry: false,
  });

  const createSession = useCreateSession();
  const recordAttendance = useRecordAttendance();
  const recordAttendanceInBulk = useRecordAttendanceInBulk();
  const completeSession = useCompleteSession();
  const modifyRecord = useModifyRecord();

  const sessions = useMemo(() => sessionsData?.data ?? [], [sessionsData]);
  const isCompleted = sheet?.session.status === 'completed';

  const stats = useMemo(() => {
    const todaySessions = sessions.filter(s => s.session_date?.slice(0, 10) === today()).length;
    const open = sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length;
    const totalRecords = sessions.reduce((sum, s) => sum + (s.records_count ?? 0), 0);
    const present = sessions.reduce((sum, s) => sum + (s.present_count ?? 0), 0);
    const absent = sessions.reduce((sum, s) => sum + (s.absent_count ?? 0), 0);

    return {
      todaySessions,
      open,
      rate: totalRecords > 0 ? `${Math.round((present / totalRecords) * 100)}%` : '-',
      absent,
    };
  }, [sessions]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleStatusToggle = (record: AttendanceRecord) => {
    if (!sheet || isCompleted) return;
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(record.status) + 1) % STATUS_CYCLE.length];

    recordAttendance.mutate(
      { session_id: sheet.session.id, student_id: record.student_id, status: nextStatus },
      {
        onSuccess: () => notify(`${studentName(record)} → ${ATTENDANCE_STATUS_LABELS[nextStatus]}`),
        onError: err => notify(errorMessage(err, 'Enregistrement impossible'), 'error'),
      },
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (!sheet || isCompleted) return;

    recordAttendanceInBulk.mutate(
      { sessionId: sheet.session.id, data: { status } },
      {
        onSuccess: () => notify(`Tous les élèves : ${ATTENDANCE_STATUS_LABELS[status]}`),
        onError: err => notify(errorMessage(err, 'Enregistrement impossible'), 'error'),
      },
    );
  };

  const handleComplete = () => {
    if (!sheet) return;
    completeSession.mutate(sheet.session.id, {
      onSuccess: () => {
        notify('Séance clôturée');
        setSelectedSessionId(undefined);
      },
      onError: err => notify(errorMessage(err, 'Clôture impossible'), 'error'),
    });
  };

  /** Correction d'un enregistrement d'une séance clôturée (motif obligatoire, tracé côté serveur). */
  const handleCorrect = () => {
    if (!correction) return;
    const reason = correction.reason.trim();

    if (!reason) {
      notify('Le motif de la correction est obligatoire', 'error');

      return;
    }

    modifyRecord.mutate(
      { recordId: correction.record.id, data: { status: correction.status, reason } },
      {
        onSuccess: () => {
          notify(`${studentName(correction.record)} → ${ATTENDANCE_STATUS_LABELS[correction.status]} (corrigé)`);
          setCorrection(null);
        },
        onError: err => notify(errorMessage(err, 'Correction impossible'), 'error'),
      },
    );
  };

  const handleCreate = () => {
    if (!form.classe_id) {
      notify('Veuillez choisir une classe', 'error');

      return;
    }

    createSession.mutate(
      {
        classe_id: Number(form.classe_id),
        subject_id: form.subject_id ? Number(form.subject_id) : undefined,
        session_date: form.session_date,
        start_time: form.start_time || undefined,
        end_time: form.end_time || undefined,
        method: form.method,
      },
      {
        onSuccess: session => {
          setCreateOpen(false);
          notify('Séance d\'appel créée');
          setSelectedSessionId(session.id);
        },
        onError: err => notify(errorMessage(err, 'Création impossible'), 'error'),
      },
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight="bold">
          Feuille d&apos;Appel
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Classe</InputLabel>
            <Select
              label="Classe"
              value={classeFilter}
              onChange={e => {
                setClasseFilter(e.target.value as number | '');
                setPage(0);
              }}
            >
              <MenuItem value="">Toutes</MenuItem>
              {classes.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => setCreateOpen(true)} disabled={classes.length === 0}>
            + Nouvelle séance
          </Button>
        </Box>
      </Box>

      {classes.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Aucune classe ne vous est attribuée (professeur principal ou créneau d&apos;emploi du temps).
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Séances aujourd\'hui', value: stats.todaySessions, color: '#1976d2' },
          { label: 'Séances ouvertes', value: stats.open, color: '#4caf50' },
          { label: 'Taux de présence (page)', value: stats.rate, color: '#ff9800' },
          { label: 'Absences (page)', value: stats.absent, color: '#f44336' },
        ].map(stat => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
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

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Séances d&apos;appel</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage(error, 'Impossible de charger les séances')}</Alert>}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell>Matière</TableCell>
                    <TableCell>Horaire</TableCell>
                    <TableCell>Méthode</TableCell>
                    <TableCell>Présents / Effectif</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Créée par</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">Aucune séance d&apos;appel.</TableCell>
                    </TableRow>
                  )}
                  {sessions.map(session => (
                    <TableRow key={session.id} hover>
                      <TableCell>{new Date(session.session_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell><Typography fontWeight="medium">{sessionLabel(session)}</Typography></TableCell>
                      <TableCell>{session.subject?.name ?? '-'}</TableCell>
                      <TableCell>{session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}</TableCell>
                      <TableCell>{METHOD_LABELS[session.method] ?? session.method}</TableCell>
                      <TableCell>{session.present_count ?? 0} / {session.records_count ?? 0}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={SESSION_STATUS_LABELS[session.status] ?? session.status}
                          color={session.status === 'completed' ? 'info' : session.status === 'cancelled' ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell>{session.creator?.firstname} {session.creator?.lastname}</TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" onClick={() => setSelectedSessionId(session.id)}>
                          {session.status === 'completed' ? 'Voir' : 'Faire l\'appel'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            component="div"
            count={sessionsData?.total ?? 0}
            page={page}
            rowsPerPage={sessionsData?.per_page ?? 15}
            rowsPerPageOptions={[]}
            onPageChange={(_, newPage) => setPage(newPage)}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedSessionId} onClose={() => setSelectedSessionId(undefined)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h6">
                Feuille d&apos;appel {sheet ? `- ${sessionLabel(sheet.session)}` : ''}
              </Typography>
              {sheet && (
                <Typography variant="body2" color="text.secondary">
                  {new Date(sheet.session.session_date).toLocaleDateString('fr-FR')} | {sheet.session.start_time?.slice(0, 5)} - {sheet.session.end_time?.slice(0, 5)}
                  {sheet.session.subject ? ` | ${sheet.session.subject.name}` : ''}
                </Typography>
              )}
            </Box>
            {sheet && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={`P: ${sheet.summary.present}`} sx={{ bgcolor: ATTENDANCE_STATUS_COLORS.present, color: 'white' }} size="small" />
                <Chip label={`A: ${sheet.summary.absent}`} sx={{ bgcolor: ATTENDANCE_STATUS_COLORS.absent, color: 'white' }} size="small" />
                <Chip label={`R: ${sheet.summary.late}`} sx={{ bgcolor: ATTENDANCE_STATUS_COLORS.late, color: 'white' }} size="small" />
                <Chip label={`E: ${sheet.summary.excused}`} sx={{ bgcolor: ATTENDANCE_STATUS_COLORS.excused, color: 'white' }} size="small" />
              </Box>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {sheetLoading || !sheet ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <>
              {!isCompleted && (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Tous les élèves sont « Présent » par défaut : cliquez sur le statut d&apos;un élève pour le marquer absent, en retard ou excusé.
                  </Alert>
                  <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" color="success" disabled={recordAttendanceInBulk.isPending} onClick={() => handleMarkAll('present')}>
                      Tout présent
                    </Button>
                    <Button size="small" variant="outlined" color="error" disabled={recordAttendanceInBulk.isPending} onClick={() => handleMarkAll('absent')}>
                      Tout absent
                    </Button>
                  </Box>
                </>
              )}
              {sheet.records.length === 0 && (
                <Alert severity="warning">Aucun élève actif inscrit dans cette classe.</Alert>
              )}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Nom & Prénom</TableCell>
                      <TableCell align="center">Statut</TableCell>
                      <TableCell>Retard</TableCell>
                      {isCompleted && <TableCell align="right">Correction</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sheet.records.map((record, idx) => (
                      <TableRow key={record.id} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {record.student_profile?.matricule ?? '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">{studentName(record)}</Typography>
                          {correctionLabel(record) && (
                            <Typography variant="caption" color="text.secondary" component="div">
                              {correctionLabel(record)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={isCompleted ? 'Séance clôturée' : 'Cliquez pour changer le statut'}>
                            <Chip
                              label={ATTENDANCE_STATUS_LABELS[record.status]}
                              sx={{
                                bgcolor: ATTENDANCE_STATUS_COLORS[record.status],
                                color: 'white',
                                cursor: isCompleted ? 'default' : 'pointer',
                                fontWeight: 'bold',
                                minWidth: 90,
                              }}
                              onClick={() => handleStatusToggle(record)}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>{record.delay_minutes ? `${record.delay_minutes} min` : '-'}</TableCell>
                        {isCompleted && (
                          <TableCell align="right">
                            <Button size="small" onClick={() => setCorrection({ record, status: record.status, reason: '' })}>
                              Corriger
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSessionId(undefined)}>Fermer</Button>
          {sheet && !isCompleted && (
            <Button variant="contained" color="primary" onClick={handleComplete} disabled={completeSession.isPending}>
              Terminer la séance
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={!!correction} onClose={() => setCorrection(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Corriger la présence</DialogTitle>
        <DialogContent>
          {correction && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="body2">
                {studentName(correction.record)} — statut actuel : {ATTENDANCE_STATUS_LABELS[correction.record.status]}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Nouveau statut</InputLabel>
                <Select
                  label="Nouveau statut"
                  value={correction.status}
                  onChange={e => setCorrection(c => (c ? { ...c, status: e.target.value as AttendanceStatus } : c))}
                >
                  {STATUS_CYCLE.map(status => (
                    <MenuItem key={status} value={status}>{ATTENDANCE_STATUS_LABELS[status]}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Motif de la correction"
                required
                multiline
                minRows={2}
                value={correction.reason}
                onChange={e => setCorrection(c => (c ? { ...c, reason: e.target.value } : c))}
                slotProps={{ htmlInput: { maxLength: 500 } }}
                helperText="Obligatoire — conservé avec l'enregistrement."
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCorrection(null)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCorrect}
            disabled={modifyRecord.isPending || !correction?.reason.trim() || correction?.status === correction?.record.status}
          >
            Enregistrer la correction
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle séance d&apos;appel</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Classe</InputLabel>
              <Select
                label="Classe"
                value={form.classe_id}
                onChange={e => setForm(f => ({ ...f, classe_id: e.target.value as number | '', subject_id: '' }))}
              >
                {classes.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!form.classe_id || classSubjects.length === 0}>
              <InputLabel>Matière</InputLabel>
              <Select
                label="Matière"
                value={form.subject_id}
                onChange={e => setForm(f => ({ ...f, subject_id: e.target.value as number | '' }))}
              >
                <MenuItem value="">
                  <em>Non précisée</em>
                </MenuItem>
                {classSubjects.map(subject => (
                  <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Date de la séance"
              type="date"
              value={form.session_date}
              onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Début"
                type="time"
                value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <TextField
                label="Fin"
                type="time"
                value={form.end_time}
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Méthode</InputLabel>
              <Select
                label="Méthode"
                value={form.method}
                onChange={e => setForm(f => ({ ...f, method: e.target.value as SessionMethod }))}
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
          <Button variant="contained" onClick={handleCreate} disabled={createSession.isPending}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

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
