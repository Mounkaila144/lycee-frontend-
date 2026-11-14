'use client';

import React, { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { useAuthUser } from '@/shared/hooks/useAuthUser';

import { useAcknowledgeAlert, useAttendanceAlerts, useTriggerAlerts } from '../hooks';
import type { AlertStatus, AlertStatusFilter, AlertType, AttendanceAlert } from '../../types';
import { ALERT_TYPE_LABELS } from '../../types';

import type { AttendanceFilterValues } from './AttendanceFilterBar';
import { AttendanceFilterBar, EMPTY_ATTENDANCE_FILTERS } from './AttendanceFilterBar';
import { StudentAttendanceHistoryDialog, attendanceErrorMessage } from './StudentAttendanceHistoryDialog';

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

const STATUS_TABS: Array<{ value: AlertStatusFilter; label: string }> = [
  { value: 'active', label: 'Actives' },
  { value: 'acknowledged', label: 'Traitées' },
  { value: 'all', label: 'Toutes' },
];

const studentLabel = (alert: AttendanceAlert): string =>
  alert.student ? `${alert.student.lastname ?? ''} ${alert.student.firstname ?? ''}`.trim() : `Élève #${alert.student_id}`;

/**
 * Suivi des absences : alertes de seuil par élève (semestre / classe) et historique individuel.
 * Le professeur ne voit que les élèves de ses classes (filtrage côté API).
 */
export const MonitoringDashboard: React.FC = () => {
  const authUser = useAuthUser();
  const roles = authUser?.roles ?? [];
  const isSupervisor = roles.includes('Administrator') || roles.includes('Manager');

  const [filters, setFilters] = useState<AttendanceFilterValues>(EMPTY_ATTENDANCE_FILTERS);
  const [statusTab, setStatusTab] = useState<AlertStatusFilter>('active');
  const [historyFor, setHistoryFor] = useState<{ id: number; name: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const semesterId = filters.semesterId || undefined;

  const alertFilters = semesterId
    ? { semester_id: semesterId, classe_id: filters.classeId || undefined, status: 'all' as const }
    : undefined;

  const { data: allAlerts = [], isLoading, error } = useAttendanceAlerts(alertFilters);
  const triggerAlerts = useTriggerAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();

  const notify = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const activeAlerts = useMemo(() => allAlerts.filter(a => a.status !== 'acknowledged'), [allAlerts]);

  const displayedAlerts = useMemo(() => {
    if (statusTab === 'active') return activeAlerts;
    if (statusTab === 'acknowledged') return allAlerts.filter(a => a.status === 'acknowledged');

    return allAlerts;
  }, [allAlerts, activeAlerts, statusTab]);

  const handleTrigger = () => {
    if (!semesterId) return;
    triggerAlerts.mutate(semesterId, {
      onSuccess: result => notify(result.alerts.length > 0
        ? `${result.alerts.length} alerte(s) créée(s) ou mise(s) à jour`
        : 'Aucun élève ne dépasse les seuils d\'absence'),
      onError: err => notify(attendanceErrorMessage(err, 'Déclenchement impossible'), 'error'),
    });
  };

  const handleAcknowledge = (alert: AttendanceAlert) => {
    acknowledgeAlert.mutate(alert.id, {
      onSuccess: () => notify(`Alerte de ${studentLabel(alert)} marquée comme traitée`),
      onError: err => notify(attendanceErrorMessage(err, 'Traitement impossible'), 'error'),
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight="bold">
          Suivi des Absences &amp; Alertes
        </Typography>
        {isSupervisor && (
          <Button
            variant="contained"
            color="warning"
            onClick={handleTrigger}
            disabled={!semesterId || triggerAlerts.isPending}
            startIcon={triggerAlerts.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Recalculer les alertes
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <AttendanceFilterBar value={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Alertes actives', value: activeAlerts.length, color: '#f44336' },
          { label: 'Avertissements', value: activeAlerts.filter(a => a.alert_type === 'threshold_warning').length, color: '#ff9800' },
          { label: 'Critiques', value: activeAlerts.filter(a => a.alert_type === 'threshold_critical').length, color: '#d32f2f' },
          { label: 'Traitées', value: allAlerts.length - activeAlerts.length, color: '#4caf50' },
        ].map(stat => (
          <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>{isLoading ? '-' : stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Tabs value={statusTab} onChange={(_, v) => setStatusTab(v)} sx={{ mb: 2 }}>
            {STATUS_TABS.map(t => <Tab key={t.value} value={t.value} label={t.label} />)}
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{attendanceErrorMessage(error, 'Impossible de charger les alertes')}</Alert>}

          {!semesterId && <Alert severity="info">Sélectionnez un semestre pour afficher les alertes.</Alert>}
          {semesterId && isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          )}
          {semesterId && !isLoading && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Élève</TableCell>
                    <TableCell>Type d&apos;alerte</TableCell>
                    <TableCell>Absences</TableCell>
                    <TableCell>Taux</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedAlerts.length === 0 && !error && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {statusTab === 'active' ? 'Aucune alerte active pour ce semestre.' : 'Aucune alerte.'}
                        {isSupervisor && statusTab === 'active' && ' Utilisez « Recalculer les alertes » après les appels.'}
                      </TableCell>
                    </TableRow>
                  )}
                  {displayedAlerts.map(alert => {
                    const rate = Number(alert.absence_rate);

                    return (
                      <TableRow key={alert.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{studentLabel(alert)}</Typography>
                          {alert.student?.email && (
                            <Typography variant="caption" color="text.secondary">{alert.student.email}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={ALERT_TYPE_LABELS[alert.alert_type] ?? alert.alert_type}
                            sx={{ bgcolor: ALERT_TYPE_COLORS[alert.alert_type] ?? '#757575', color: 'white' }}
                          />
                        </TableCell>
                        <TableCell><Typography fontWeight="bold">{alert.absence_count}</Typography></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(rate, 100)}
                              sx={{
                                width: 80, height: 8, borderRadius: 4,
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: alert.alert_type === 'threshold_critical' ? '#f44336' : '#ff9800',
                                },
                              }}
                            />
                            <Typography variant="body2" fontWeight="bold">{rate}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 280 }}>
                          <Typography variant="body2" noWrap title={alert.message}>{alert.message}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={ALERT_STATUS_CONFIG[alert.status]?.label ?? alert.status}
                            color={ALERT_STATUS_CONFIG[alert.status]?.color ?? 'info'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setHistoryFor({ id: alert.student_id, name: studentLabel(alert) })}
                            >
                              Historique
                            </Button>
                            {alert.status !== 'acknowledged' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={acknowledgeAlert.isPending}
                                onClick={() => handleAcknowledge(alert)}
                              >
                                Traiter
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <StudentAttendanceHistoryDialog
        studentId={historyFor?.id}
        studentName={historyFor?.name}
        semesterId={semesterId}
        onClose={() => setHistoryFor(null)}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
