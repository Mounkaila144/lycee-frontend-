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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// ──── Demo Data ────

const DEMO_RATES = {
  overall_rate: 82.5,
  by_module: [
    { module_id: 1, module_name: 'Algorithmes', rate: 88, total_sessions: 15 },
    { module_id: 2, module_name: 'Base de données', rate: 85, total_sessions: 12 },
    { module_id: 3, module_name: 'Réseaux', rate: 78, total_sessions: 10 },
    { module_id: 4, module_name: 'Systèmes', rate: 75, total_sessions: 8 },
    { module_id: 5, module_name: 'Programmation Web', rate: 90, total_sessions: 14 },
  ],
  by_group: [
    { group_id: 1, group_name: 'L3 Info - G1', rate: 85 },
    { group_id: 2, group_name: 'L3 Info - G2', rate: 80 },
    { group_id: 3, group_name: 'M1 Info - G1', rate: 82 },
  ],
};

const DEMO_ABSENTEES = [
  { student: { id: 13, firstname: 'Aissatou', lastname: 'Abdou', matricule: 'ETU-2026-004' }, absence_count: 12, absence_rate: 40, last_absence_date: '2026-03-25' },
  { student: { id: 14, firstname: 'Moussa', lastname: 'Hamidou', matricule: 'ETU-2026-005' }, absence_count: 8, absence_rate: 26.7, last_absence_date: '2026-03-24' },
  { student: { id: 16, firstname: 'Ousmane', lastname: 'Garba', matricule: 'ETU-2026-007' }, absence_count: 6, absence_rate: 20, last_absence_date: '2026-03-22' },
];

const DEMO_STATISTICS = {
  total_sessions: 59,
  total_students: 92,
  average_attendance_rate: 82.5,
  by_day: [
    { day: 'Lundi', rate: 85 },
    { day: 'Mardi', rate: 83 },
    { day: 'Mercredi', rate: 80 },
    { day: 'Jeudi', rate: 84 },
    { day: 'Vendredi', rate: 78 },
  ],
  trend: [
    { week: 'Sem. 8', rate: 88 },
    { week: 'Sem. 9', rate: 85 },
    { week: 'Sem. 10', rate: 82 },
    { week: 'Sem. 11', rate: 80 },
    { week: 'Sem. 12', rate: 83 },
  ],
};

const getRateColor = (rate: number): string => {
  if (rate >= 85) return '#4caf50';
  if (rate >= 70) return '#ff9800';

  return '#f44336';
};

export const ReportsDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Présences</Link>
        <Typography color="text.primary">Rapports & Statistiques</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Rapports de Présences
        </Typography>
        <Button variant="outlined">
          Exporter les données
        </Button>
      </Box>

      {/* Global Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Taux global', value: `${DEMO_STATISTICS.average_attendance_rate}%`, color: getRateColor(DEMO_STATISTICS.average_attendance_rate) },
          { label: 'Sessions totales', value: DEMO_STATISTICS.total_sessions, color: '#1976d2' },
          { label: 'Étudiants suivis', value: DEMO_STATISTICS.total_students, color: '#9c27b0' },
          { label: 'Absentéistes', value: DEMO_ABSENTEES.length, color: '#f44336' },
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
        <Tab label="Taux d'Assiduité" />
        <Tab label="Absentéistes" />
        <Tab label="Statistiques Détaillées" />
      </Tabs>

      {/* Tab 0: Attendance Rates */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Par Module</Typography>
                {DEMO_RATES.by_module.map(m => (
                  <Box key={m.module_id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{m.module_name}</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: getRateColor(m.rate) }}>
                        {m.rate}% ({m.total_sessions} séances)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={m.rate}
                      sx={{
                        height: 10, borderRadius: 5,
                        '& .MuiLinearProgress-bar': { bgcolor: getRateColor(m.rate), borderRadius: 5 },
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
                <Typography variant="h6" sx={{ mb: 2 }}>Par Groupe</Typography>
                {DEMO_RATES.by_group.map(g => (
                  <Box key={g.group_id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{g.group_name}</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: getRateColor(g.rate) }}>
                        {g.rate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={g.rate}
                      sx={{
                        height: 10, borderRadius: 5,
                        '& .MuiLinearProgress-bar': { bgcolor: getRateColor(g.rate), borderRadius: 5 },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Absentees List */}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Liste des Absentéistes</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Étudiant</TableCell>
                    <TableCell>Matricule</TableCell>
                    <TableCell align="center">Nb Absences</TableCell>
                    <TableCell>Taux d&apos;absence</TableCell>
                    <TableCell>Dernière absence</TableCell>
                    <TableCell>Niveau</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_ABSENTEES.map(entry => (
                    <TableRow key={entry.student.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {entry.student.lastname} {entry.student.firstname}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {entry.student.matricule}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold">{entry.absence_count}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(entry.absence_rate, 100)}
                            sx={{
                              width: 100, height: 8, borderRadius: 4,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: entry.absence_rate >= 30 ? '#f44336' : '#ff9800',
                              },
                            }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {entry.absence_rate.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(entry.last_absence_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={entry.absence_rate >= 30 ? 'Critique' : 'Avertissement'}
                          color={entry.absence_rate >= 30 ? 'error' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Detailed Statistics */}
      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Taux par Jour de la Semaine</Typography>
                {DEMO_STATISTICS.by_day.map(d => (
                  <Box key={d.day} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{d.day}</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: getRateColor(d.rate) }}>
                        {d.rate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={d.rate}
                      sx={{
                        height: 10, borderRadius: 5,
                        '& .MuiLinearProgress-bar': { bgcolor: getRateColor(d.rate), borderRadius: 5 },
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
                <Typography variant="h6" sx={{ mb: 2 }}>Tendance Hebdomadaire</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Semaine</TableCell>
                        <TableCell>Taux</TableCell>
                        <TableCell>Évolution</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {DEMO_STATISTICS.trend.map((t, idx) => {
                        const prev = idx > 0 ? DEMO_STATISTICS.trend[idx - 1].rate : t.rate;
                        const diff = t.rate - prev;

                        return (
                          <TableRow key={t.week}>
                            <TableCell>{t.week}</TableCell>
                            <TableCell>
                              <Typography fontWeight="bold" sx={{ color: getRateColor(t.rate) }}>
                                {t.rate}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {idx > 0 && (
                                <Chip
                                  size="small"
                                  label={`${diff >= 0 ? '+' : ''}${diff}%`}
                                  color={diff >= 0 ? 'success' : 'error'}
                                  variant="outlined"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
