'use client';

import React, { useState } from 'react';

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
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import {
  EXAM_TYPE_LABELS,
  INCIDENT_TYPE_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_STATUS_LABELS,
} from '../../types';

import type {
  ExamType,
  ExamSessionStatus,
  IncidentType,
  IncidentSeverity,
} from '../../types';

// ──── Demo Data ────

const DEMO_STATISTICS = {
  total_sessions: 24,
  total_students: 450,
  average_attendance_rate: 89.2,
  total_incidents: 7,
  by_type: [
    { type: 'written' as ExamType, count: 16 },
    { type: 'oral' as ExamType, count: 5 },
    { type: 'practical' as ExamType, count: 3 },
  ],
  by_status: [
    { status: 'completed' as ExamSessionStatus, count: 12 },
    { status: 'scheduled' as ExamSessionStatus, count: 8 },
    { status: 'draft' as ExamSessionStatus, count: 3 },
    { status: 'cancelled' as ExamSessionStatus, count: 1 },
  ],
};

const DEMO_ATTENDANCE_REPORTS = [
  { exam_session_id: 1, exam_title: 'Examen Final - Algorithmes', total_students: 118, present: 110, absent: 5, late: 3, attendance_rate: 93.2, submission_rate: 95.8 },
  { exam_session_id: 2, exam_title: 'Examen Partiel - Base de données', total_students: 78, present: 70, absent: 6, late: 2, attendance_rate: 89.7, submission_rate: 92.3 },
  { exam_session_id: 3, exam_title: 'TP Noté - Réseaux', total_students: 28, present: 26, absent: 1, late: 1, attendance_rate: 92.9, submission_rate: 96.4 },
  { exam_session_id: 4, exam_title: 'Oral - Systèmes d\'exploitation', total_students: 25, present: 22, absent: 2, late: 1, attendance_rate: 88.0, submission_rate: 100 },
  { exam_session_id: 5, exam_title: 'Examen Final - Programmation Web', total_students: 95, present: 82, absent: 10, late: 3, attendance_rate: 86.3, submission_rate: 89.4 },
];

const DEMO_INCIDENT_REPORT = {
  total_incidents: 7,
  by_type: [
    { type: 'cheating' as IncidentType, count: 3 },
    { type: 'disruption' as IncidentType, count: 1 },
    { type: 'medical' as IncidentType, count: 2 },
    { type: 'material' as IncidentType, count: 1 },
  ],
  by_severity: [
    { severity: 'minor' as IncidentSeverity, count: 1 },
    { severity: 'moderate' as IncidentSeverity, count: 3 },
    { severity: 'major' as IncidentSeverity, count: 2 },
    { severity: 'critical' as IncidentSeverity, count: 1 },
  ],
};

const DEMO_SUPERVISOR_WORKLOAD = [
  { teacher: { id: 1, firstname: 'Dr.', lastname: 'Dupont' }, total_sessions: 8, as_chief: 4, as_regular: 4, upcoming_sessions: 3 },
  { teacher: { id: 2, firstname: 'Prof.', lastname: 'Martin' }, total_sessions: 6, as_chief: 2, as_regular: 4, upcoming_sessions: 2 },
  { teacher: { id: 3, firstname: 'Dr.', lastname: 'Bernard' }, total_sessions: 5, as_chief: 1, as_regular: 4, upcoming_sessions: 2 },
  { teacher: { id: 4, firstname: 'Prof.', lastname: 'Koné' }, total_sessions: 4, as_chief: 3, as_regular: 1, upcoming_sessions: 1 },
  { teacher: { id: 5, firstname: 'Dr.', lastname: 'Amadou' }, total_sessions: 3, as_chief: 0, as_regular: 3, upcoming_sessions: 2 },
];

const DEMO_ROOM_UTILIZATION = [
  { room: { id: 1, name: 'Amphi A', building: 'Bâtiment Principal', capacity: 200 }, total_exams: 8, total_hours: 24, average_occupancy_rate: 72.5 },
  { room: { id: 2, name: 'Salle 101', building: 'Bâtiment B', capacity: 40 }, total_exams: 6, total_hours: 15, average_occupancy_rate: 85.0 },
  { room: { id: 3, name: 'Amphi B', building: 'Bâtiment Principal', capacity: 150 }, total_exams: 5, total_hours: 12, average_occupancy_rate: 60.0 },
  { room: { id: 4, name: 'Labo Réseau', building: 'Bâtiment C', capacity: 30 }, total_exams: 3, total_hours: 9, average_occupancy_rate: 90.0 },
  { room: { id: 5, name: 'Salle 205', building: 'Bâtiment B', capacity: 50 }, total_exams: 2, total_hours: 4, average_occupancy_rate: 55.0 },
];

const getRateColor = (rate: number): string => {
  if (rate >= 90) return '#4caf50';
  if (rate >= 75) return '#ff9800';

  return '#f44336';
};

export const ExamReportsDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Examens</Link>
        <Typography color="text.primary">Rapports & Statistiques</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Rapports des Examens
        </Typography>
        <Button variant="outlined">
          Exporter les données
        </Button>
      </Box>

      {/* Global Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Sessions totales', value: DEMO_STATISTICS.total_sessions, color: '#1976d2' },
          { label: 'Étudiants évalués', value: DEMO_STATISTICS.total_students, color: '#9c27b0' },
          { label: 'Taux de présence', value: `${DEMO_STATISTICS.average_attendance_rate}%`, color: getRateColor(DEMO_STATISTICS.average_attendance_rate) },
          { label: 'Incidents', value: DEMO_STATISTICS.total_incidents, color: '#f44336' },
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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Présences" />
        <Tab label="Incidents" />
        <Tab label="Charge Surveillants" />
        <Tab label="Utilisation Salles" />
      </Tabs>

      {/* Tab 0: Attendance Reports */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Rapports de Présence par Session</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Examen</TableCell>
                    <TableCell align="center">Total</TableCell>
                    <TableCell align="center">Présents</TableCell>
                    <TableCell align="center">Absents</TableCell>
                    <TableCell align="center">Retards</TableCell>
                    <TableCell>Taux de présence</TableCell>
                    <TableCell>Taux de remise</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_ATTENDANCE_REPORTS.map(report => (
                    <TableRow key={report.exam_session_id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{report.exam_title}</Typography>
                      </TableCell>
                      <TableCell align="center">{report.total_students}</TableCell>
                      <TableCell align="center">
                        <Typography color="success.main" fontWeight="bold">{report.present}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography color="error.main" fontWeight="bold">{report.absent}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography color="warning.main" fontWeight="bold">{report.late}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={report.attendance_rate}
                            sx={{
                              width: 100, height: 8, borderRadius: 4,
                              '& .MuiLinearProgress-bar': { bgcolor: getRateColor(report.attendance_rate), borderRadius: 4 },
                            }}
                          />
                          <Typography variant="body2" fontWeight="bold" sx={{ color: getRateColor(report.attendance_rate) }}>
                            {report.attendance_rate}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={report.submission_rate}
                            sx={{
                              width: 100, height: 8, borderRadius: 4,
                              '& .MuiLinearProgress-bar': { bgcolor: getRateColor(report.submission_rate), borderRadius: 4 },
                            }}
                          />
                          <Typography variant="body2" fontWeight="bold" sx={{ color: getRateColor(report.submission_rate) }}>
                            {report.submission_rate}%
                          </Typography>
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

      {/* Tab 1: Incident Reports */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Par Type d&apos;Incident</Typography>
                {DEMO_INCIDENT_REPORT.by_type.map(entry => (
                  <Box key={entry.type} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{INCIDENT_TYPE_LABELS[entry.type]}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {entry.count} ({Math.round((entry.count / DEMO_INCIDENT_REPORT.total_incidents) * 100)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(entry.count / DEMO_INCIDENT_REPORT.total_incidents) * 100}
                      sx={{
                        height: 10, borderRadius: 5,
                        '& .MuiLinearProgress-bar': { bgcolor: '#1976d2', borderRadius: 5 },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Par Sévérité</Typography>
                {DEMO_INCIDENT_REPORT.by_severity.map(entry => (
                  <Box key={entry.severity} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Chip
                        size="small"
                        label={INCIDENT_SEVERITY_LABELS[entry.severity]}
                        sx={{ bgcolor: INCIDENT_SEVERITY_COLORS[entry.severity], color: 'white' }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {entry.count} ({Math.round((entry.count / DEMO_INCIDENT_REPORT.total_incidents) * 100)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(entry.count / DEMO_INCIDENT_REPORT.total_incidents) * 100}
                      sx={{
                        height: 10, borderRadius: 5,
                        '& .MuiLinearProgress-bar': { bgcolor: INCIDENT_SEVERITY_COLORS[entry.severity], borderRadius: 5 },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Résumé des Incidents</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Total', value: DEMO_INCIDENT_REPORT.total_incidents, color: '#1976d2' },
                    { label: 'Fraudes', value: DEMO_INCIDENT_REPORT.by_type.find(t => t.type === 'cheating')?.count || 0, color: '#f44336' },
                    { label: 'Médicaux', value: DEMO_INCIDENT_REPORT.by_type.find(t => t.type === 'medical')?.count || 0, color: '#ff9800' },
                    { label: 'Critiques', value: DEMO_INCIDENT_REPORT.by_severity.find(s => s.severity === 'critical')?.count || 0, color: '#d32f2f' },
                  ].map((stat, idx) => (
                    <Grid key={idx} size={{ xs: 6, md: 3 }}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                        <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Supervisor Workload */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Charge de Travail des Surveillants</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Enseignant</TableCell>
                    <TableCell align="center">Sessions Totales</TableCell>
                    <TableCell align="center">Chef de Salle</TableCell>
                    <TableCell align="center">Surveillant</TableCell>
                    <TableCell align="center">À Venir</TableCell>
                    <TableCell>Répartition</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_SUPERVISOR_WORKLOAD.map(entry => {
                    const maxSessions = Math.max(...DEMO_SUPERVISOR_WORKLOAD.map(e => e.total_sessions));

                    return (
                      <TableRow key={entry.teacher.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">
                            {entry.teacher.firstname} {entry.teacher.lastname}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="bold">{entry.total_sessions}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={entry.as_chief} color="primary" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={entry.as_regular} color="default" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={entry.upcoming_sessions} color="info" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={(entry.total_sessions / maxSessions) * 100}
                            sx={{
                              width: 120, height: 8, borderRadius: 4,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: entry.total_sessions >= 7 ? '#f44336' : entry.total_sessions >= 5 ? '#ff9800' : '#4caf50',
                                borderRadius: 4,
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Room Utilization */}
      {tab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Utilisation des Salles</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Salle</TableCell>
                    <TableCell>Bâtiment</TableCell>
                    <TableCell align="center">Capacité</TableCell>
                    <TableCell align="center">Nb Examens</TableCell>
                    <TableCell align="center">Heures Utilisées</TableCell>
                    <TableCell>Taux d&apos;occupation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_ROOM_UTILIZATION.map(entry => (
                    <TableRow key={entry.room.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{entry.room.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {entry.room.building}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{entry.room.capacity}</TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold">{entry.total_exams}</Typography>
                      </TableCell>
                      <TableCell align="center">{entry.total_hours}h</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={entry.average_occupancy_rate}
                            sx={{
                              width: 100, height: 8, borderRadius: 4,
                              '& .MuiLinearProgress-bar': { bgcolor: getRateColor(entry.average_occupancy_rate), borderRadius: 4 },
                            }}
                          />
                          <Typography variant="body2" fontWeight="bold" sx={{ color: getRateColor(entry.average_occupancy_rate) }}>
                            {entry.average_occupancy_rate}%
                          </Typography>
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
    </Box>
  );
};
