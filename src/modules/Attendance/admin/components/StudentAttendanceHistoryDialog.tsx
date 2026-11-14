'use client';

import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useStudentHistory } from '../hooks';
import { ATTENDANCE_STATUS_COLORS, ATTENDANCE_STATUS_LABELS } from '../../types';

export const attendanceErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { message?: string } } })?.response?.data;

  return data?.message || fallback;
};

interface StudentAttendanceHistoryDialogProps {

  /** Compte utilisateur de l'élève (users.id). */
  studentId?: number;
  studentName?: string;
  semesterId?: number;
  onClose: () => void;
}

/** Historique de présences d'un élève sur le semestre (suivi individuel). */
export const StudentAttendanceHistoryDialog: React.FC<StudentAttendanceHistoryDialogProps> = ({
  studentId,
  studentName,
  semesterId,
  onClose,
}) => {
  const { data, isLoading, error } = useStudentHistory(studentId, semesterId);
  const stats = data?.statistics;

  return (
    <Dialog open={!!studentId} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Historique de présences — {studentName ?? `Élève #${studentId}`}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mt: 1 }}>{attendanceErrorMessage(error, 'Impossible de charger l\'historique')}</Alert>}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        )}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
            {[
              { label: 'Appels', value: stats.total_sessions },
              { label: 'Présent', value: stats.present_count, color: ATTENDANCE_STATUS_COLORS.present },
              { label: 'Absent', value: stats.absent_count, color: ATTENDANCE_STATUS_COLORS.absent },
              { label: 'Retard', value: stats.late_count, color: ATTENDANCE_STATUS_COLORS.late },
              { label: 'Excusé', value: stats.excused_count, color: ATTENDANCE_STATUS_COLORS.excused },
              { label: 'Taux d\'absence', value: `${stats.absence_rate}%`, color: '#1976d2' },
            ].map(stat => (
              <Grid key={stat.label} size={{ xs: 4, md: 2 }}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {data && (
          <>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell>Matière</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Observation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.records.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Aucun appel enregistré pour cet élève sur le semestre.</TableCell>
                    </TableRow>
                  )}
                  {data.records.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {record.session?.session_date
                          ? new Date(record.session.session_date).toLocaleDateString('fr-FR')
                          : '-'}
                        {record.session?.start_time ? ` ${record.session.start_time.slice(0, 5)}` : ''}
                      </TableCell>
                      <TableCell>{record.session?.classe?.name ?? '-'}</TableCell>
                      <TableCell>{record.session?.subject?.name ?? record.session?.timetable_slot?.module?.name ?? '-'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={ATTENDANCE_STATUS_LABELS[record.status] ?? record.status}
                          sx={{ bgcolor: ATTENDANCE_STATUS_COLORS[record.status], color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>{record.notes ?? (record.delay_minutes ? `${record.delay_minutes} min de retard` : '')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
