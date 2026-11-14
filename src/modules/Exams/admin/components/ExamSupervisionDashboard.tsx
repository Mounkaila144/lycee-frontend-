'use client';

import React, { useCallback, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useTenant } from '@/shared/lib/tenant-context';
import { useCurrentUser } from '@/modules/Grades/lycee/hooks/useCurrentUser';

import type {
  ExamAttendanceStatus,
  ExamSupervisor,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  ReportIncidentRequest,
  SupervisorRole,
} from '../../types';
import {
  EXAM_ATTENDANCE_STATUS_COLORS,
  EXAM_ATTENDANCE_STATUS_LABELS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
  SUPERVISOR_ROLE_LABELS,
  SUPERVISOR_STATUS_LABELS,
  apiErrorMessage,
  formatDate,
  formatTime,
  personName,
  sessionTargetLabel,
} from '../../types';
import {
  useAssignSupervisors,
  useEscalateIncident,
  useExamAttendanceStats,
  useExamIncidents,
  useExamOptions,
  useExamSession,
  useMarkStudentAttendance,
  useMarkSupervisorPresent,
  useRecordExamSubmission,
  useReplaceSupervisor,
  useReportIncident,
  useUpdateIncidentStatus,
  useVerifyExamSheet,
} from '../hooks';
import { ExamSessionPicker } from './ExamSessionPicker';

const EMPTY_INCIDENT: ReportIncidentRequest = {
  student_id: null,
  type: 'other',
  title: '',
  description: '',
  severity: 'medium',
  occurred_at_time: '',
};

/**
 * Surveillance d'une épreuve : surveillants (affectation, présence, remplacement),
 * émargement des élèves (présence, copie remise, vérification) et incidents.
 */
export const ExamSupervisionDashboard: React.FC = () => {
  const { tenantId } = useTenant();
  const tenant = tenantId || undefined;
  const { user } = useCurrentUser();
  const canManage = user.isManager;

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [tab, setTab] = useState(0);
  const [supervisorForm, setSupervisorForm] = useState<{ teacher_id: string; role: SupervisorRole; room_assignment_id: string }>({ teacher_id: '', role: 'assistant', room_assignment_id: '' });
  const [replaceTarget, setReplaceTarget] = useState<ExamSupervisor | null>(null);
  const [replacementId, setReplacementId] = useState('');
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState<ReportIncidentRequest>(EMPTY_INCIDENT);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data: options } = useExamOptions(undefined, tenant);
  const { data: session, isLoading } = useExamSession(sessionId ?? undefined, tenant);
  const { data: stats } = useExamAttendanceStats(sessionId ?? undefined, tenant);
  const { data: incidents = [] } = useExamIncidents(sessionId ?? undefined, tenant);

  const assignSupervisorsMutation = useAssignSupervisors(tenant);
  const markPresentMutation = useMarkSupervisorPresent(tenant);
  const replaceMutation = useReplaceSupervisor(tenant);
  const attendanceMutation = useMarkStudentAttendance(tenant);
  const submissionMutation = useRecordExamSubmission(tenant);
  const verifyMutation = useVerifyExamSheet(tenant);
  const reportIncidentMutation = useReportIncident(tenant);
  const incidentStatusMutation = useUpdateIncidentStatus(tenant);
  const escalateMutation = useEscalateIncident(tenant);

  const notify = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const supervisors = session?.supervisors ?? [];
  const sheets = session?.attendance_sheets ?? [];
  const rooms = session?.room_assignments ?? [];
  const teachers = options?.teachers ?? [];

  const handleAssignSupervisor = () => {
    if (!sessionId || !supervisorForm.teacher_id) {
      return;
    }

    assignSupervisorsMutation.mutate({
      sessionId,
      supervisors: [{
        teacher_id: Number(supervisorForm.teacher_id),
        role: supervisorForm.role,
        room_assignment_id: supervisorForm.room_assignment_id ? Number(supervisorForm.room_assignment_id) : null,
      }],
    }, {
      onSuccess: () => { notify('Surveillant affecté.', 'success'); setSupervisorForm(prev => ({ ...prev, teacher_id: '' })); },
      onError: error => notify(apiErrorMessage(error, 'Affectation impossible'), 'error'),
    });
  };

  const handleReplace = () => {
    if (!replaceTarget || !replacementId) {
      return;
    }

    replaceMutation.mutate({ supervisorId: replaceTarget.id, data: { replacement_teacher_id: Number(replacementId) } }, {
      onSuccess: () => { notify('Surveillant remplacé.', 'success'); setReplaceTarget(null); setReplacementId(''); },
      onError: error => notify(apiErrorMessage(error, 'Remplacement impossible'), 'error'),
    });
  };

  const handleSupervisorPresent = (supervisorId: number) => {
    markPresentMutation.mutate(supervisorId, {
      onSuccess: () => notify('Présence du surveillant enregistrée.', 'success'),
      onError: error => notify(apiErrorMessage(error, 'Enregistrement impossible'), 'error'),
    });
  };

  const handleAttendance = (sheetId: number, status: ExamAttendanceStatus) => {
    attendanceMutation.mutate({ sheetId, data: { status } }, {
      onError: error => notify(apiErrorMessage(error, 'Enregistrement de la présence impossible'), 'error'),
    });
  };

  const handleSubmission = (sheetId: number) => {
    submissionMutation.mutate(sheetId, {
      onError: error => notify(apiErrorMessage(error, 'Enregistrement de la copie impossible'), 'error'),
    });
  };

  const handleVerify = (sheetId: number) => {
    verifyMutation.mutate(sheetId, {
      onError: error => notify(apiErrorMessage(error, 'Vérification impossible'), 'error'),
    });
  };

  const handleMarkAllPresent = () => {
    sheets.filter(sheet => !sheet.arrival_time && sheet.status === 'present').forEach(sheet => handleAttendance(sheet.id, 'present'));
  };

  const openIncidentDialog = () => {
    const now = new Date();

    setIncidentForm({ ...EMPTY_INCIDENT, occurred_at_time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` });
    setIncidentOpen(true);
  };

  const handleReportIncident = () => {
    if (!sessionId) {
      return;
    }

    reportIncidentMutation.mutate({ sessionId, data: { ...incidentForm, student_id: incidentForm.student_id || null } }, {
      onSuccess: () => { notify('Incident signalé.', 'success'); setIncidentOpen(false); },
      onError: error => notify(apiErrorMessage(error, 'Signalement impossible'), 'error'),
    });
  };

  const handleIncidentStatus = (incidentId: number, status: IncidentStatus) => {
    if (status === 'escalated') {
      const reason = window.prompt('Motif de l\'escalade');

      if (!reason) {
        return;
      }

      escalateMutation.mutate({ incidentId, reason }, {
        onSuccess: () => notify('Incident escaladé.', 'success'),
        onError: error => notify(apiErrorMessage(error, 'Escalade impossible'), 'error'),
      });

      return;
    }

    incidentStatusMutation.mutate({ incidentId, data: { status } }, {
      onSuccess: () => notify('Statut de l\'incident mis à jour.', 'success'),
      onError: error => notify(apiErrorMessage(error, 'Mise à jour impossible'), 'error'),
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Typography color="inherit">Examens</Typography>
        <Typography color="text.primary">Surveillance</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Surveillance des épreuves</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <ExamSessionPicker value={sessionId} onChange={setSessionId} tenantId={tenant} />
          {session && (
            <Typography variant="body2" color="text.secondary">
              {sessionTargetLabel(session)} — {session.subject?.name ?? session.module?.name ?? ''} — {formatDate(session.exam_date)}
              {' '}{formatTime(session.start_time)}–{formatTime(session.end_time)}
            </Typography>
          )}
        </CardContent>
      </Card>

      {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}

      {session && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Élèves attendus', value: stats?.total_students ?? sheets.length, color: '#1976d2' },
              { label: 'Présents', value: stats ? `${stats.present} (${stats.present_percentage}%)` : '—', color: '#4caf50' },
              { label: 'Absents / retards', value: stats ? `${stats.absent} / ${stats.late}` : '—', color: '#f44336' },
              { label: 'Copies remises', value: stats ? `${stats.submitted} (${stats.submission_percentage}%)` : '—', color: '#9c27b0' },
            ].map(stat => (
              <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card>
            <Tabs value={tab} onChange={(_, value: number) => setTab(value)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tab label={`Surveillants (${supervisors.length})`} />
              <Tab label={`Émargement (${sheets.length})`} />
              <Tab label={`Incidents (${incidents.length})`} />
            </Tabs>
            <CardContent>
              {tab === 0 && (
                <>
                  {canManage && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <TextField
                        select
                        size="small"
                        label="Professeur"
                        value={supervisorForm.teacher_id}
                        onChange={event => setSupervisorForm(prev => ({ ...prev, teacher_id: event.target.value }))}
                        sx={{ minWidth: 220 }}
                      >
                        {teachers.map(teacher => (
                          <MenuItem key={teacher.id} value={String(teacher.id)}>{personName(teacher)}</MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        size="small"
                        label="Rôle"
                        value={supervisorForm.role}
                        onChange={event => setSupervisorForm(prev => ({ ...prev, role: event.target.value as SupervisorRole }))}
                        sx={{ minWidth: 160 }}
                      >
                        {(Object.keys(SUPERVISOR_ROLE_LABELS) as SupervisorRole[]).map(role => (
                          <MenuItem key={role} value={role}>{SUPERVISOR_ROLE_LABELS[role]}</MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        size="small"
                        label="Salle"
                        value={supervisorForm.room_assignment_id}
                        onChange={event => setSupervisorForm(prev => ({ ...prev, room_assignment_id: event.target.value }))}
                        sx={{ minWidth: 160 }}
                      >
                        <MenuItem value="">Toutes / non précisée</MenuItem>
                        {rooms.map(room => (
                          <MenuItem key={room.id} value={String(room.id)}>{room.room?.name ?? `Salle #${room.room_id}`}</MenuItem>
                        ))}
                      </TextField>
                      <Button variant="contained" onClick={handleAssignSupervisor} disabled={!supervisorForm.teacher_id || assignSupervisorsMutation.isPending}>
                        Affecter
                      </Button>
                    </Box>
                  )}
                  {supervisors.length === 0 ? (
                    <Alert severity="info">Aucun surveillant affecté.</Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Surveillant</TableCell>
                            <TableCell>Rôle</TableCell>
                            <TableCell>Salle</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Arrivée</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {supervisors.map(supervisor => (
                            <TableRow key={supervisor.id}>
                              <TableCell>{personName(supervisor.teacher) || `#${supervisor.teacher_id}`}</TableCell>
                              <TableCell>{SUPERVISOR_ROLE_LABELS[supervisor.role] ?? supervisor.role}</TableCell>
                              <TableCell>{supervisor.room_assignment?.room?.name ?? '—'}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={SUPERVISOR_STATUS_LABELS[supervisor.status] ?? supervisor.status}
                                  color={supervisor.status === 'present' ? 'success' : supervisor.status === 'replaced' ? 'default' : 'primary'}
                                />
                              </TableCell>
                              <TableCell>{formatTime(supervisor.actual_start_time) || '—'}</TableCell>
                              <TableCell align="right">
                                {supervisor.status !== 'present' && supervisor.status !== 'replaced' && (canManage || supervisor.teacher_id === user.id) && (
                                  <Button size="small" onClick={() => handleSupervisorPresent(supervisor.id)}>Présent</Button>
                                )}
                                {canManage && supervisor.status !== 'replaced' && (
                                  <Button size="small" color="warning" onClick={() => setReplaceTarget(supervisor)}>Remplacer</Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}

              {tab === 1 && (
                <>
                  {sheets.length === 0 ? (
                    <Alert severity="info">Aucun élève placé : utilisez l&apos;écran Gestion des épreuves.</Alert>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <Button size="small" variant="outlined" onClick={handleMarkAllPresent}>
                          Pointer tous les non pointés présents
                        </Button>
                      </Box>
                      <TableContainer sx={{ maxHeight: 560 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Élève</TableCell>
                              <TableCell>Salle / place</TableCell>
                              <TableCell>Présence</TableCell>
                              <TableCell>Arrivée</TableCell>
                              <TableCell>Copie</TableCell>
                              <TableCell>Vérification</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sheets.map(sheet => (
                              <TableRow key={sheet.id} hover>
                                <TableCell>
                                  {personName(sheet.student)}
                                  {sheet.student?.matricule && (
                                    <Typography variant="caption" display="block" color="text.secondary">{sheet.student.matricule}</Typography>
                                  )}
                                </TableCell>
                                <TableCell>{sheet.room_assignment?.room?.name ?? '—'} / {sheet.seat_number ?? '—'}</TableCell>
                                <TableCell>
                                  <TextField
                                    select
                                    size="small"
                                    variant="standard"
                                    value={sheet.status}
                                    onChange={event => handleAttendance(sheet.id, event.target.value as ExamAttendanceStatus)}
                                    sx={{ color: EXAM_ATTENDANCE_STATUS_COLORS[sheet.status] }}
                                  >
                                    {(Object.keys(EXAM_ATTENDANCE_STATUS_LABELS) as ExamAttendanceStatus[]).map(status => (
                                      <MenuItem key={status} value={status}>{EXAM_ATTENDANCE_STATUS_LABELS[status]}</MenuItem>
                                    ))}
                                  </TextField>
                                </TableCell>
                                <TableCell>{formatTime(sheet.arrival_time) || '—'}</TableCell>
                                <TableCell>
                                  {sheet.has_submitted ? (
                                    <Chip size="small" color="success" label={`Remise ${formatTime(sheet.submission_time)}`} />
                                  ) : (
                                    <Button size="small" disabled={sheet.status === 'absent'} onClick={() => handleSubmission(sheet.id)}>
                                      Copie remise
                                    </Button>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {sheet.verified_at ? (
                                    <Chip size="small" variant="outlined" color="success" label="Vérifiée" />
                                  ) : (
                                    <Button size="small" onClick={() => handleVerify(sheet.id)}>Vérifier</Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </>
              )}

              {tab === 2 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button variant="contained" color="error" onClick={openIncidentDialog}>Signaler un incident</Button>
                  </Box>
                  {incidents.length === 0 ? (
                    <Alert severity="success">Aucun incident signalé pour cette épreuve.</Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Heure</TableCell>
                            <TableCell>Incident</TableCell>
                            <TableCell>Élève</TableCell>
                            <TableCell>Gravité</TableCell>
                            <TableCell>Signalé par</TableCell>
                            <TableCell>Statut</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {incidents.map(incident => (
                            <TableRow key={incident.id}>
                              <TableCell>{formatTime(incident.occurred_at_time)}</TableCell>
                              <TableCell>
                                <Typography fontWeight="medium">{incident.title}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {INCIDENT_TYPE_LABELS[incident.type] ?? incident.type} — {incident.description}
                                </Typography>
                              </TableCell>
                              <TableCell>{personName(incident.student) || '—'}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={INCIDENT_SEVERITY_LABELS[incident.severity] ?? incident.severity}
                                  sx={{ bgcolor: INCIDENT_SEVERITY_COLORS[incident.severity] ?? '#9e9e9e', color: 'white' }}
                                />
                              </TableCell>
                              <TableCell>{personName(incident.reporter) || '—'}</TableCell>
                              <TableCell>
                                <TextField
                                  select
                                  size="small"
                                  variant="standard"
                                  value={incident.status}
                                  onChange={event => handleIncidentStatus(incident.id, event.target.value as IncidentStatus)}
                                >
                                  {(Object.keys(INCIDENT_STATUS_LABELS) as IncidentStatus[]).map(status => (
                                    <MenuItem key={status} value={status}>{INCIDENT_STATUS_LABELS[status]}</MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Remplacement d'un surveillant */}
      <Dialog open={!!replaceTarget} onClose={() => setReplaceTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remplacer {personName(replaceTarget?.teacher)}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Remplaçant"
            value={replacementId}
            onChange={event => setReplacementId(event.target.value)}
            sx={{ mt: 1 }}
          >
            {teachers.filter(teacher => teacher.id !== replaceTarget?.teacher_id).map(teacher => (
              <MenuItem key={teacher.id} value={String(teacher.id)}>{personName(teacher)}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplaceTarget(null)}>Annuler</Button>
          <Button variant="contained" onClick={handleReplace} disabled={!replacementId || replaceMutation.isPending}>Remplacer</Button>
        </DialogActions>
      </Dialog>

      {/* Signalement d'incident */}
      <Dialog open={incidentOpen} onClose={() => setIncidentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Signaler un incident</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Type"
                value={incidentForm.type}
                onChange={event => setIncidentForm(prev => ({ ...prev, type: event.target.value as IncidentType }))}
              >
                {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map(type => (
                  <MenuItem key={type} value={type}>{INCIDENT_TYPE_LABELS[type]}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Gravité"
                value={incidentForm.severity}
                onChange={event => setIncidentForm(prev => ({ ...prev, severity: event.target.value as IncidentSeverity }))}
              >
                {(Object.keys(INCIDENT_SEVERITY_LABELS) as IncidentSeverity[]).map(severity => (
                  <MenuItem key={severity} value={severity}>{INCIDENT_SEVERITY_LABELS[severity]}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                select
                fullWidth
                label="Élève concerné"
                value={incidentForm.student_id ?? ''}
                onChange={event => setIncidentForm(prev => ({ ...prev, student_id: event.target.value ? Number(event.target.value) : null }))}
              >
                <MenuItem value="">Aucun / collectif</MenuItem>
                {sheets.map(sheet => (
                  <MenuItem key={sheet.student_id} value={sheet.student_id}>{personName(sheet.student) || `#${sheet.student_id}`}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="time"
                label="Heure"
                value={incidentForm.occurred_at_time}
                onChange={event => setIncidentForm(prev => ({ ...prev, occurred_at_time: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Intitulé"
                value={incidentForm.title}
                onChange={event => setIncidentForm(prev => ({ ...prev, title: event.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                multiline
                minRows={3}
                label="Description"
                value={incidentForm.description}
                onChange={event => setIncidentForm(prev => ({ ...prev, description: event.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncidentOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReportIncident}
            disabled={!incidentForm.title.trim() || !incidentForm.description.trim() || !incidentForm.occurred_at_time || reportIncidentMutation.isPending}
          >
            Signaler
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
