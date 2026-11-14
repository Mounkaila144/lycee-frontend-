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
import Menu from '@mui/material/Menu';
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

import { useAbsenteesList, useDetailedStatistics } from '../hooks';
import { reportService } from '../services';
import type { DetailedStatistics, ExportType, StudentExportRow } from '../../types';

import type { AttendanceFilterValues } from './AttendanceFilterBar';
import { AttendanceFilterBar, EMPTY_ATTENDANCE_FILTERS, toReportFilters } from './AttendanceFilterBar';
import { StudentAttendanceHistoryDialog, attendanceErrorMessage } from './StudentAttendanceHistoryDialog';

/** DAYOFWEEK MySQL : 1 = dimanche … 7 = samedi. */
const DAY_LABELS: Record<number, string> = {
  1: 'Dimanche',
  2: 'Lundi',
  3: 'Mardi',
  4: 'Mercredi',
  5: 'Jeudi',
  6: 'Vendredi',
  7: 'Samedi',
};

const DEFAULT_MIN_ABSENCE_RATE = 20;

const getRateColor = (rate: number): string => {
  if (rate >= 85) return '#4caf50';
  if (rate >= 70) return '#ff9800';

  return '#f44336';
};

/** Les agrégats SQL (SUM) peuvent arriver sous forme de chaînes. */
const toNumber = (value: unknown): number => Number(value ?? 0) || 0;

const percent = (part: number, total: number): number => (total > 0 ? Math.round((part / total) * 1000) / 10 : 0);

const csvCell = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value);

  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadCsv = (filename: string, headers: string[], rows: unknown[][]): void => {
  const content = [headers, ...rows].map(row => row.map(csvCell).join(';')).join('\n');
  const blob = new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const RateBar: React.FC<{ label: string; rate: number; detail?: string }> = ({ label, rate, detail }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 2 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ color: getRateColor(rate) }}>
        {rate}%{detail ? ` (${detail})` : ''}
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={Math.min(rate, 100)}
      sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { bgcolor: getRateColor(rate), borderRadius: 5 } }}
    />
  </Box>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>{message}</Typography>
);

/**
 * Rapports de présences : taux d'assiduité (par classe / matière / jour), absentéistes et export.
 * Filtres : semestre, classe, période. Le professeur ne voit que ses classes (filtrage côté API).
 */
export const ReportsDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState<AttendanceFilterValues>(EMPTY_ATTENDANCE_FILTERS);
  const [minAbsenceRate, setMinAbsenceRate] = useState<number>(DEFAULT_MIN_ABSENCE_RATE);
  const [historyFor, setHistoryFor] = useState<{ id: number; name: string } | null>(null);
  const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const invalidPeriod = !!filters.dateFrom && !!filters.dateTo && filters.dateTo < filters.dateFrom;
  const reportFilters = invalidPeriod ? undefined : toReportFilters(filters);

  const { data: statistics, isLoading: statsLoading, error: statsError } = useDetailedStatistics(reportFilters);
  const { data: absentees = [], isLoading: absenteesLoading, error: absenteesError } = useAbsenteesList(reportFilters, minAbsenceRate);

  const global = statistics?.global;
  const presenceRate = global ? toNumber(global.presence_rate) : 0;

  const byClasse = useMemo(() => (statistics?.by_classe ?? []).map(c => ({
    key: `${c.classe_id ?? 'none'}`,
    label: c.classe_name,
    total: toNumber(c.total_records),
    rate: percent(toNumber(c.present_count), toNumber(c.total_records)),
    absent: toNumber(c.absent_count),
  })), [statistics]);

  const bySubject = useMemo(() => (statistics?.by_module ?? []).map(m => ({
    key: `${m.module_id ?? 'none'}`,
    label: m.module_name,
    total: toNumber(m.total_records),
    rate: percent(toNumber(m.present_count), toNumber(m.total_records)),
    absent: toNumber(m.absent_count),
    late: toNumber(m.late_count),
  })), [statistics]);

  const byDay = useMemo(() => (statistics?.by_day ?? [])
    .map(d => ({
      day: toNumber(d.day_of_week),
      total: toNumber(d.total_records),
      absent: toNumber(d.absent_count),
    }))
    .sort((a, b) => ((a.day + 5) % 7) - ((b.day + 5) % 7)), [statistics]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleExport = async (type: ExportType) => {
    setExportAnchor(null);
    if (!reportFilters) return;

    setExporting(true);

    try {
      const suffix = `S${reportFilters.semester_id}${reportFilters.classe_id ? `-classe${reportFilters.classe_id}` : ''}`;

      if (type === 'students') {
        const { data } = await reportService.exportData<StudentExportRow>(reportFilters, 'students');

        downloadCsv(
          `presences-eleves-${suffix}.csv`,
          ['Élève', 'Email', 'Appels', 'Présent', 'Absent', 'Retard', 'Excusé', 'Taux de présence (%)', 'Taux d\'absence (%)'],
          data.map(r => [r.name, r.email, r.total_sessions, r.present_count, r.absent_count, r.late_count, r.excused_count, r.presence_rate, r.absence_rate]),
        );
        notify(`${data.length} élève(s) exporté(s)`);
      } else {
        const { data } = await reportService.exportData<DetailedStatistics['by_module'][number]>(reportFilters, 'modules');

        downloadCsv(
          `presences-matieres-${suffix}.csv`,
          ['Matière', 'Appels', 'Présent', 'Absent', 'Retard', 'Taux de présence (%)'],
          data.map(r => [
            r.module_name,
            toNumber(r.total_records),
            toNumber(r.present_count),
            toNumber(r.absent_count),
            toNumber(r.late_count),
            percent(toNumber(r.present_count), toNumber(r.total_records)),
          ]),
        );
        notify(`${data.length} matière(s) exportée(s)`);
      }
    } catch (err) {
      notify(attendanceErrorMessage(err, 'Export impossible'), 'error');
    } finally {
      setExporting(false);
    }
  };

  const loadingBox = <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight="bold">
          Rapports de Présences
        </Typography>
        <Button
          variant="outlined"
          disabled={!reportFilters || exporting}
          onClick={e => setExportAnchor(e.currentTarget)}
          startIcon={exporting ? <CircularProgress size={16} /> : undefined}
        >
          Exporter (CSV)
        </Button>
        <Menu anchorEl={exportAnchor} open={!!exportAnchor} onClose={() => setExportAnchor(null)}>
          <MenuItem onClick={() => handleExport('students')}>Présences par élève</MenuItem>
          <MenuItem onClick={() => handleExport('modules')}>Présences par matière</MenuItem>
        </Menu>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <AttendanceFilterBar value={filters} onChange={setFilters} showDates />
          {invalidPeriod && (
            <Alert severity="warning" sx={{ mt: 2 }}>La date de fin doit être postérieure ou égale à la date de début.</Alert>
          )}
        </CardContent>
      </Card>

      {statsError && (
        <Alert severity="error" sx={{ mb: 3 }}>{attendanceErrorMessage(statsError, 'Impossible de charger les statistiques')}</Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Taux de présence', value: global ? `${presenceRate}%` : '-', color: global ? getRateColor(presenceRate) : undefined },
          { label: 'Appels enregistrés', value: global ? global.total_sessions : '-', color: '#1976d2' },
          { label: 'Absences', value: global ? global.absent_count : '-', color: '#f44336' },
          { label: `Absentéistes (≥ ${minAbsenceRate}%)`, value: absenteesLoading ? '-' : absentees.length, color: '#9c27b0' },
        ].map(stat => (
          <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>{statsLoading ? '-' : stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {global && global.total_sessions === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Aucun appel enregistré pour ces critères. Les statistiques se rempliront au fur et à mesure des feuilles d&apos;appel.
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Taux d'assiduité" />
        <Tab label="Absentéistes" />
        <Tab label="Par jour" />
      </Tabs>

      {!reportFilters && !invalidPeriod && <Alert severity="info">Sélectionnez un semestre.</Alert>}

      {tab === 0 && reportFilters && (statsLoading ? loadingBox : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Par classe</Typography>
                {byClasse.length === 0 && <EmptyState message="Aucune donnée." />}
                {byClasse.map(c => (
                  <RateBar key={c.key} label={c.label} rate={c.rate} detail={`${c.absent} abs. / ${c.total} appels`} />
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Par matière</Typography>
                {bySubject.length === 0 && <EmptyState message="Aucune donnée." />}
                {bySubject.map(m => (
                  <RateBar key={m.key} label={m.label} rate={m.rate} detail={`${m.absent} abs., ${m.late} retards / ${m.total}`} />
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ))}

      {tab === 1 && reportFilters && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6">Liste des absentéistes</Typography>
              <TextField
                size="small"
                type="number"
                label="Taux d'absence minimum (%)"
                value={minAbsenceRate}
                onChange={e => setMinAbsenceRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                sx={{ width: 220 }}
              />
            </Box>
            {absenteesError && (
              <Alert severity="error" sx={{ mb: 2 }}>{attendanceErrorMessage(absenteesError, 'Impossible de charger les absentéistes')}</Alert>
            )}
            {absenteesLoading ? loadingBox : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Élève</TableCell>
                      <TableCell align="center">Appels</TableCell>
                      <TableCell align="center">Absences</TableCell>
                      <TableCell align="center">Retards</TableCell>
                      <TableCell>Taux d&apos;absence</TableCell>
                      <TableCell>Niveau</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {absentees.length === 0 && !absenteesError && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">Aucun élève au-dessus de {minAbsenceRate}% d&apos;absence.</TableCell>
                      </TableRow>
                    )}
                    {absentees.map(entry => {
                      const rate = toNumber(entry.statistics.absence_rate);

                      return (
                        <TableRow key={entry.student_id} hover>
                          <TableCell>
                            <Typography fontWeight="medium">{entry.student_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{entry.student_email}</Typography>
                          </TableCell>
                          <TableCell align="center">{entry.statistics.total_sessions}</TableCell>
                          <TableCell align="center"><Typography fontWeight="bold">{entry.statistics.absent_count}</Typography></TableCell>
                          <TableCell align="center">{entry.statistics.late_count}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(rate, 100)}
                                sx={{ width: 100, height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: rate >= 30 ? '#f44336' : '#ff9800' } }}
                              />
                              <Typography variant="body2" fontWeight="bold">{rate.toFixed(1)}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={rate >= 30 ? 'Critique' : 'Avertissement'} color={rate >= 30 ? 'error' : 'warning'} />
                          </TableCell>
                          <TableCell align="center">
                            <Button size="small" variant="outlined" onClick={() => setHistoryFor({ id: entry.student_id, name: entry.student_name })}>
                              Historique
                            </Button>
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
      )}

      {tab === 2 && reportFilters && (statsLoading ? loadingBox : (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Taux de présence par jour de la semaine</Typography>
            {byDay.length === 0 && <EmptyState message="Aucune donnée." />}
            {byDay.map(d => (
              <RateBar
                key={d.day}
                label={DAY_LABELS[d.day] ?? `Jour ${d.day}`}
                rate={percent(d.total - d.absent, d.total)}
                detail={`${d.absent} abs. / ${d.total} appels`}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      <StudentAttendanceHistoryDialog
        studentId={historyFor?.id}
        studentName={historyFor?.name}
        semesterId={reportFilters?.semester_id}
        onClose={() => setHistoryFor(null)}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
