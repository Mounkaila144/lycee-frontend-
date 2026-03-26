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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';

import type { AttendanceAlert, AlertType, AlertStatus } from '../../types';
import { ALERT_TYPE_LABELS } from '../../types';

// ──── Demo Data ────

const DEMO_ALERTS: AttendanceAlert[] = [
  {
    id: 1, student_id: 13, semester_id: 1, alert_type: 'threshold_critical', absence_count: 12,
    absence_rate: 40, threshold_value: 30, message: 'Taux d\'absence critique: 40% (seuil: 30%)',
    status: 'notified', notified_at: '2026-03-24T09:00:00', acknowledged_at: null, acknowledged_by: null,
    student: { id: 13, firstname: 'Aissatou', lastname: 'Abdou', matricule: 'ETU-2026-004' },
    created_at: '2026-03-24T09:00:00', updated_at: '2026-03-24T09:00:00',
  },
  {
    id: 2, student_id: 14, semester_id: 1, alert_type: 'threshold_warning', absence_count: 6,
    absence_rate: 20, threshold_value: 20, message: 'Avertissement: taux d\'absence atteint 20%',
    status: 'pending', notified_at: null, acknowledged_at: null, acknowledged_by: null,
    student: { id: 14, firstname: 'Moussa', lastname: 'Hamidou', matricule: 'ETU-2026-005' },
    created_at: '2026-03-25T10:00:00', updated_at: '2026-03-25T10:00:00',
  },
  {
    id: 3, student_id: 16, semester_id: 1, alert_type: 'repeated_absences', absence_count: 3,
    absence_rate: 15, threshold_value: 3, message: '3 absences consécutives détectées',
    status: 'acknowledged', notified_at: '2026-03-22T08:00:00', acknowledged_at: '2026-03-23T09:00:00', acknowledged_by: 1,
    student: { id: 16, firstname: 'Ousmane', lastname: 'Garba', matricule: 'ETU-2026-007' },
    created_at: '2026-03-22T08:00:00', updated_at: '2026-03-23T09:00:00',
  },
];

const DEMO_STUDENT_HISTORY = {
  stats: { total: 30, present: 22, absent: 5, late: 2, excused: 1, attendance_rate: 73.3 },
  records: [
    { date: '2026-03-26', module: 'Algorithmes', status: 'present' },
    { date: '2026-03-25', module: 'Réseaux', status: 'absent' },
    { date: '2026-03-24', module: 'BDD', status: 'present' },
    { date: '2026-03-23', module: 'Algorithmes', status: 'late' },
    { date: '2026-03-22', module: 'Réseaux', status: 'absent' },
  ],
};

const ALERT_STATUS_CONFIG: Record<AlertStatus, { label: string; color: 'warning' | 'error' | 'success' | 'info' }> = {
  pending: { label: 'En attente', color: 'warning' },
  notified: { label: 'Notifié', color: 'error' },
  acknowledged: { label: 'Traité', color: 'success' },
};

const ALERT_TYPE_COLORS: Record<AlertType, string> = {
  threshold_warning: '#ff9800',
  threshold_critical: '#f44336',
  repeated_absences: '#9c27b0',
};

export const MonitoringDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AttendanceAlert | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const filteredAlerts = tab === 0
    ? DEMO_ALERTS
    : tab === 1
      ? DEMO_ALERTS.filter(a => a.status === 'pending' || a.status === 'notified')
      : DEMO_ALERTS.filter(a => a.status === 'acknowledged');

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Présences</Link>
        <Typography color="text.primary">Suivi & Alertes</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Suivi des Absences & Alertes
        </Typography>
        <Button
          variant="contained"
          color="warning"
          onClick={() => setSnackbar({ open: true, message: '2 nouvelles alertes déclenchées', severity: 'success' })}
        >
          Déclencher les Alertes
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Alertes actives', value: DEMO_ALERTS.filter(a => a.status !== 'acknowledged').length, color: '#f44336' },
          { label: 'Avertissements', value: DEMO_ALERTS.filter(a => a.alert_type === 'threshold_warning').length, color: '#ff9800' },
          { label: 'Critiques', value: DEMO_ALERTS.filter(a => a.alert_type === 'threshold_critical').length, color: '#d32f2f' },
          { label: 'Traitées', value: DEMO_ALERTS.filter(a => a.status === 'acknowledged').length, color: '#4caf50' },
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

      {/* Alerts Table */}
      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Toutes" />
            <Tab label="Actives" />
            <Tab label="Traitées" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Type d&apos;alerte</TableCell>
                  <TableCell>Absences</TableCell>
                  <TableCell>Taux</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlerts.map(alert => (
                  <TableRow key={alert.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {alert.student?.lastname} {alert.student?.firstname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alert.student?.matricule}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ALERT_TYPE_LABELS[alert.alert_type]}
                        sx={{ bgcolor: ALERT_TYPE_COLORS[alert.alert_type], color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{alert.absence_count}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(alert.absence_rate, 100)}
                          sx={{
                            width: 80, height: 8, borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: alert.absence_rate >= 30 ? '#f44336' : alert.absence_rate >= 20 ? '#ff9800' : '#4caf50',
                            },
                          }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {alert.absence_rate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250 }}>
                      <Typography variant="body2" noWrap>{alert.message}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ALERT_STATUS_CONFIG[alert.status].label}
                        color={ALERT_STATUS_CONFIG[alert.status].color}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => { setSelectedAlert(alert); setHistoryOpen(true); }}
                        >
                          Historique
                        </Button>
                        {alert.status !== 'acknowledged' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => setSnackbar({ open: true, message: 'Alerte marquée comme traitée', severity: 'success' })}
                          >
                            Traiter
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Student History Dialog */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Historique de Présences - {selectedAlert?.student?.lastname} {selectedAlert?.student?.firstname}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
            {[
              { label: 'Total séances', value: DEMO_STUDENT_HISTORY.stats.total },
              { label: 'Présent', value: DEMO_STUDENT_HISTORY.stats.present, color: '#4caf50' },
              { label: 'Absent', value: DEMO_STUDENT_HISTORY.stats.absent, color: '#f44336' },
              { label: 'Retard', value: DEMO_STUDENT_HISTORY.stats.late, color: '#ff9800' },
              { label: 'Excusé', value: DEMO_STUDENT_HISTORY.stats.excused, color: '#2196f3' },
              { label: 'Taux', value: `${DEMO_STUDENT_HISTORY.stats.attendance_rate}%`, color: '#1976d2' },
            ].map((stat, idx) => (
              <Grid key={idx} size={{ xs: 4, md: 2 }}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_STUDENT_HISTORY.records.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(r.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{r.module}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.status === 'present' ? 'Présent' : r.status === 'absent' ? 'Absent' : r.status === 'late' ? 'En retard' : 'Excusé'}
                        color={r.status === 'present' ? 'success' : r.status === 'absent' ? 'error' : r.status === 'late' ? 'warning' : 'info'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
