'use client';

import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid2';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
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

import type { AttendanceReport, ExamStatisticsFilters, ExamAttendanceStatus, IncidentSeverity, IncidentStatus, IncidentType } from '../../types';
import {
  EXAM_ATTENDANCE_STATUS_LABELS,
  EXAM_SESSION_STATUS_LABELS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
  formatDate,
  formatTime,
} from '../../types';
import {
  useExamAttendanceReport,
  useExamIncidentReport,
  useExamOptions,
  useExamStatistics,
  useRoomUtilization,
  useSupervisorWorkload,
} from '../hooks';
import { ExamSessionPicker } from './ExamSessionPicker';

const label = <T extends string>(labels: Record<T, string>, key: string): string => labels[key as T] ?? key;

const downloadAttendanceCsv = (report: AttendanceReport) => {
  const rows = [
    ['Élève', 'Salle', 'Place', 'Présence', 'Arrivée', 'Copie remise', 'Heure de remise'],
    ...report.students.map(student => [
      student.student_name ?? '',
      student.room ?? '',
      student.seat ?? '',
      label(EXAM_ATTENDANCE_STATUS_LABELS, student.status),
      formatTime(student.arrival_time),
      student.has_submitted ? 'Oui' : 'Non',
      formatTime(student.submission_time),
    ]),
  ];

  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `emargement_${report.session.id}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Rapports d'examens : statistiques globales (par matière), charge des surveillants,
 * occupation des salles, et rapports d'émargement / d'incidents d'une session.
 */
export const ExamReportsDashboard: React.FC = () => {
  const { tenantId } = useTenant();
  const tenant = tenantId || undefined;

  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState<ExamStatisticsFilters>({});
  const [sessionId, setSessionId] = useState<number | null>(null);

  const period = filters.start_date && filters.end_date ? { start_date: filters.start_date, end_date: filters.end_date } : undefined;

  const { data: options } = useExamOptions(undefined, tenant);
  const { data: statistics, isLoading: statsLoading, isError: statsError } = useExamStatistics(filters, tenant);
  const { data: workload = [] } = useSupervisorWorkload(period, tenant);
  const { data: utilization = [] } = useRoomUtilization(period, tenant);
  const { data: attendanceReport, isLoading: attendanceLoading } = useExamAttendanceReport(sessionId ?? undefined, tenant);
  const { data: incidentReport } = useExamIncidentReport(sessionId ?? undefined, tenant);

  const setFilter = (key: keyof ExamStatisticsFilters, value: string) => {
    setFilters(prev => {
      const next = { ...prev } as Record<string, string | number | undefined>;

      if (!value) {
        delete next[key];
      } else {
        next[key] = key === 'start_date' || key === 'end_date' ? value : Number(value);
      }

      return next as ExamStatisticsFilters;
    });
  };

  const attendance = statistics?.attendance_stats;

  const attendanceRate = attendance && attendance.total_attendance_records > 0
    ? Math.round((attendance.present / attendance.total_attendance_records) * 100)
    : null;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Typography color="inherit">Examens</Typography>
        <Typography color="text.primary">Rapports & statistiques</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Rapports & statistiques</Typography>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)} sx={{ px: 2 }}>
          <Tab label="Vue d'ensemble" />
          <Tab label="Rapport d'une session" />
        </Tabs>
      </Card>

      {tab === 0 && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Du"
                    value={filters.start_date ?? ''}
                    onChange={event => setFilter('start_date', event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Au"
                    value={filters.end_date ?? ''}
                    onChange={event => setFilter('end_date', event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    helperText="Période appliquée si les deux dates sont saisies"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Classe"
                    value={filters.classe_id ? String(filters.classe_id) : ''}
                    onChange={event => setFilter('classe_id', event.target.value)}
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    {(options?.classes ?? []).map(classe => (
                      <MenuItem key={classe.id} value={String(classe.id)}>{classe.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Matière"
                    value={filters.subject_id ? String(filters.subject_id) : ''}
                    onChange={event => setFilter('subject_id', event.target.value)}
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    {(options?.subjects ?? []).map(subject => (
                      <MenuItem key={subject.id} value={String(subject.id)}>{subject.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {statsLoading && <LinearProgress sx={{ mb: 2 }} />}
          {statsError && <Alert severity="error" sx={{ mb: 2 }}>Impossible de charger les statistiques.</Alert>}

          {statistics && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Sessions', value: statistics.overview.total_sessions, color: '#1976d2' },
                  { label: 'Élèves examinés', value: statistics.overview.total_students_examined, color: '#9c27b0' },
                  { label: 'Taux de présence', value: attendanceRate === null ? '—' : `${attendanceRate} %`, color: '#4caf50' },
                  { label: 'Incidents', value: statistics.incident_stats.total_incidents, color: '#f44336' },
                ].map(stat => (
                  <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                        <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Sessions par statut</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {Object.entries(statistics.overview.by_status).map(([status, total]) => (
                          <Chip key={status} label={`${label(EXAM_SESSION_STATUS_LABELS, status)} : ${total}`} />
                        ))}
                        {Object.keys(statistics.overview.by_status).length === 0 && (
                          <Typography color="text.secondary">Aucune session sur la période.</Typography>
                        )}
                      </Box>
                      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Présence aux épreuves</Typography>
                      <Typography>
                        {attendance?.present ?? 0} présent(s), {attendance?.absent ?? 0} absent(s), {attendance?.late ?? 0} retard(s)
                        {' '}sur {attendance?.total_attendance_records ?? 0} convocation(s)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Incidents</Typography>
                      <Typography variant="subtitle2" color="text.secondary">Par type</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {Object.entries(statistics.incident_stats.by_type).map(([type, total]) => (
                          <Chip key={type} label={`${label<IncidentType>(INCIDENT_TYPE_LABELS, type)} : ${total}`} />
                        ))}
                        {Object.keys(statistics.incident_stats.by_type).length === 0 && <Typography color="text.secondary">Aucun</Typography>}
                      </Box>
                      <Typography variant="subtitle2" color="text.secondary">Par gravité</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {Object.entries(statistics.incident_stats.by_severity).map(([severity, total]) => (
                          <Chip
                            key={severity}
                            label={`${label<IncidentSeverity>(INCIDENT_SEVERITY_LABELS, severity)} : ${total}`}
                            sx={{ bgcolor: INCIDENT_SEVERITY_COLORS[severity as IncidentSeverity] ?? undefined, color: 'white' }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Par matière</Typography>
                  {(statistics.by_subject ?? []).length === 0 ? (
                    <Alert severity="info">Aucune session rattachée à une matière.</Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Matière</TableCell>
                            <TableCell align="right">Sessions</TableCell>
                            <TableCell align="right">Élèves</TableCell>
                            <TableCell align="right">Absences</TableCell>
                            <TableCell align="right">Incidents</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statistics.by_subject.map(row => (
                            <TableRow key={row.subject_id}>
                              <TableCell>{row.subject_name ?? `#${row.subject_id}`}</TableCell>
                              <TableCell align="right">{row.total_sessions}</TableCell>
                              <TableCell align="right">{row.total_students}</TableCell>
                              <TableCell align="right">{row.absent}</TableCell>
                              <TableCell align="right">{row.incidents}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Charge des surveillants</Typography>
                  {workload.length === 0 ? (
                    <Alert severity="info">Aucune surveillance enregistrée.</Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Professeur</TableCell>
                            <TableCell align="right">Surveillances</TableCell>
                            <TableCell align="right">Effectuées</TableCell>
                            <TableCell align="right">Heures</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {workload.map(row => (
                            <TableRow key={row.teacher_id}>
                              <TableCell>{`${row.last_name ?? ''} ${row.first_name ?? ''}`.trim()}</TableCell>
                              <TableCell align="right">{row.total_supervisions}</TableCell>
                              <TableCell align="right">{Number(row.completed)}</TableCell>
                              <TableCell align="right">{(Number(row.total_minutes) / 60).toFixed(1)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Occupation des salles</Typography>
                  {utilization.length === 0 ? (
                    <Alert severity="info">Aucune salle utilisée.</Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Salle</TableCell>
                            <TableCell align="right">Épreuves</TableCell>
                            <TableCell align="right">Élèves (moy.)</TableCell>
                            <TableCell align="right">Capacité</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {utilization.map(row => (
                            <TableRow key={row.room_id}>
                              <TableCell>{row.room_name}</TableCell>
                              <TableCell align="right">{row.times_used}</TableCell>
                              <TableCell align="right">{Number(row.avg_students).toFixed(1)}</TableCell>
                              <TableCell align="right">{row.room_capacity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {tab === 1 && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <ExamSessionPicker value={sessionId} onChange={setSessionId} tenantId={tenant} hideCancelled={false} />
            </CardContent>
          </Card>

          {attendanceLoading && <LinearProgress sx={{ mb: 2 }} />}

          {attendanceReport && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">Émargement — {attendanceReport.session.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[attendanceReport.session.classe, attendanceReport.session.subject].filter(Boolean).join(' — ')}
                      {' '}— {formatDate(attendanceReport.session.date)}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => downloadAttendanceCsv(attendanceReport)}
                    disabled={attendanceReport.students.length === 0}
                  >
                    Exporter (CSV)
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={`Convoqués : ${attendanceReport.summary.total_registered}`} />
                  <Chip color="success" label={`Présents : ${attendanceReport.summary.present}`} />
                  <Chip color="error" label={`Absents : ${attendanceReport.summary.absent}`} />
                  <Chip color="warning" label={`Retards : ${attendanceReport.summary.late}`} />
                  <Chip label={`Exclus : ${attendanceReport.summary.excluded}`} />
                  <Chip color="primary" label={`Copies remises : ${attendanceReport.summary.submitted}`} />
                </Box>
                {attendanceReport.students.length === 0 ? (
                  <Alert severity="info">Aucun élève placé sur cette session.</Alert>
                ) : (
                  <TableContainer sx={{ maxHeight: 480 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Élève</TableCell>
                          <TableCell>Salle / place</TableCell>
                          <TableCell>Présence</TableCell>
                          <TableCell>Arrivée</TableCell>
                          <TableCell>Copie</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendanceReport.students.map(student => (
                          <TableRow key={student.student_id}>
                            <TableCell>{student.student_name}</TableCell>
                            <TableCell>{student.room ?? '—'} / {student.seat ?? '—'}</TableCell>
                            <TableCell>{label<ExamAttendanceStatus>(EXAM_ATTENDANCE_STATUS_LABELS, student.status)}</TableCell>
                            <TableCell>{formatTime(student.arrival_time) || '—'}</TableCell>
                            <TableCell>{student.has_submitted ? `Remise ${formatTime(student.submission_time)}` : '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {incidentReport && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Incidents ({incidentReport.summary.total_incidents})
                </Typography>
                {incidentReport.incidents.length === 0 ? (
                  <Alert severity="success">Aucun incident sur cette session.</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Heure</TableCell>
                          <TableCell>Incident</TableCell>
                          <TableCell>Élève</TableCell>
                          <TableCell>Gravité</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Signalé par</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {incidentReport.incidents.map(incident => (
                          <TableRow key={incident.id}>
                            <TableCell>{formatTime(incident.occurred_at)}</TableCell>
                            <TableCell>
                              <Typography fontWeight="medium">{incident.title}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {label<IncidentType>(INCIDENT_TYPE_LABELS, incident.type)} — {incident.description}
                              </Typography>
                            </TableCell>
                            <TableCell>{incident.student?.name ?? '—'}</TableCell>
                            <TableCell>{label<IncidentSeverity>(INCIDENT_SEVERITY_LABELS, incident.severity)}</TableCell>
                            <TableCell>{label<IncidentStatus>(INCIDENT_STATUS_LABELS, incident.status)}</TableCell>
                            <TableCell>{incident.reported_by ?? '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};
