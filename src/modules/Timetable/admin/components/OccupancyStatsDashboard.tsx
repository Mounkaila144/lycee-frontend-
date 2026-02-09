'use client';

import React, { useState, useCallback } from 'react';

import { useRouter, useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import type {
  OccupancyKPIs,
  OccupancyByDay,
  SessionTypeDistribution,
  HeatmapCell,
  HeatmapIntensity,
  RoomOccupancyStat,
  TeacherOccupancyStat,
  OccupancyStatus,
} from '../../types';

import { OCCUPANCY_STATUS_CONFIG, HEATMAP_COLORS } from '../../types';

// ─── Demo Data ───────────────────────────────────────────────────────────────

const DEMO_KPIS: OccupancyKPIs = {
  occupancy_rate: 68.5,
  total_available_hours: 2500,
  total_used_hours: 1712,
  total_free_hours: 788,
  underused_rooms_count: 3,
  saturated_rooms_count: 2,
  overloaded_teachers_count: 4,
  status: 'optimal',
};

const DEMO_BY_DAY: OccupancyByDay[] = [
  { day: 'Lundi', total_hours: 85, average_per_week: 17, session_count: 28 },
  { day: 'Mardi', total_hours: 92, average_per_week: 18.4, session_count: 31 },
  { day: 'Mercredi', total_hours: 65, average_per_week: 13, session_count: 22 },
  { day: 'Jeudi', total_hours: 88, average_per_week: 17.6, session_count: 29 },
  { day: 'Vendredi', total_hours: 72, average_per_week: 14.4, session_count: 24 },
];

const DEMO_SESSION_TYPES: SessionTypeDistribution[] = [
  { type: 'CM', count: 120, hours: 240, percentage: 35, color: '#1976d2' },
  { type: 'TD', count: 150, hours: 300, percentage: 44, color: '#388e3c' },
  { type: 'TP', count: 80, hours: 160, percentage: 21, color: '#f57c00' },
];

const DEMO_TIMESLOTS = ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'];
const DEMO_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

const DEMO_HEATMAP: HeatmapCell[] = [
  { day: 'Lundi', timeslot: '08:00-10:00', count: 5, intensity: 'high' },
  { day: 'Lundi', timeslot: '10:00-12:00', count: 7, intensity: 'very_high' },
  { day: 'Lundi', timeslot: '14:00-16:00', count: 4, intensity: 'medium' },
  { day: 'Lundi', timeslot: '16:00-18:00', count: 2, intensity: 'low' },
  { day: 'Mardi', timeslot: '08:00-10:00', count: 6, intensity: 'high' },
  { day: 'Mardi', timeslot: '10:00-12:00', count: 8, intensity: 'very_high' },
  { day: 'Mardi', timeslot: '14:00-16:00', count: 5, intensity: 'high' },
  { day: 'Mardi', timeslot: '16:00-18:00', count: 3, intensity: 'medium' },
  { day: 'Mercredi', timeslot: '08:00-10:00', count: 3, intensity: 'medium' },
  { day: 'Mercredi', timeslot: '10:00-12:00', count: 4, intensity: 'medium' },
  { day: 'Mercredi', timeslot: '14:00-16:00', count: 1, intensity: 'low' },
  { day: 'Mercredi', timeslot: '16:00-18:00', count: 0, intensity: 'empty' },
  { day: 'Jeudi', timeslot: '08:00-10:00', count: 6, intensity: 'high' },
  { day: 'Jeudi', timeslot: '10:00-12:00', count: 7, intensity: 'very_high' },
  { day: 'Jeudi', timeslot: '14:00-16:00', count: 5, intensity: 'high' },
  { day: 'Jeudi', timeslot: '16:00-18:00', count: 2, intensity: 'low' },
  { day: 'Vendredi', timeslot: '08:00-10:00', count: 4, intensity: 'medium' },
  { day: 'Vendredi', timeslot: '10:00-12:00', count: 5, intensity: 'high' },
  { day: 'Vendredi', timeslot: '14:00-16:00', count: 3, intensity: 'medium' },
  { day: 'Vendredi', timeslot: '16:00-18:00', count: 1, intensity: 'low' },
];

const DEMO_TOP_ROOMS: RoomOccupancyStat[] = [
  { id: 1, name: 'Amphi A', type: 'Amphitheatre', capacity: 300, used_hours: 42, available_hours: 45, free_hours: 3, occupancy_rate: 93, status: 'sature' },
  { id: 2, name: 'Salle Info-1', type: 'Salle TP', capacity: 30, used_hours: 38, available_hours: 45, free_hours: 7, occupancy_rate: 84, status: 'optimal' },
  { id: 3, name: 'Salle TD-101', type: 'Salle TD', capacity: 40, used_hours: 35, available_hours: 45, free_hours: 10, occupancy_rate: 78, status: 'optimal' },
  { id: 4, name: 'Amphi B', type: 'Amphitheatre', capacity: 250, used_hours: 33, available_hours: 45, free_hours: 12, occupancy_rate: 73, status: 'normal' },
  { id: 5, name: 'Salle TD-205', type: 'Salle TD', capacity: 35, used_hours: 30, available_hours: 45, free_hours: 15, occupancy_rate: 67, status: 'normal' },
];

const DEMO_TOP_TEACHERS: TeacherOccupancyStat[] = [
  { id: 1, name: 'Dr. Dupont', department: 'Informatique', total_hours: 120, weekly_hours: 24, cm_hours: 48, td_hours: 36, tp_hours: 36, workload_percentage: 133, status: 'surcharge' },
  { id: 2, name: 'Pr. Martin', department: 'Mathematiques', total_hours: 110, weekly_hours: 22, cm_hours: 60, td_hours: 30, tp_hours: 20, workload_percentage: 122, status: 'surcharge' },
  { id: 3, name: 'Dr. Bernard', department: 'Physique', total_hours: 95, weekly_hours: 19, cm_hours: 40, td_hours: 35, tp_hours: 20, workload_percentage: 106, status: 'normal' },
  { id: 4, name: 'Dr. Leroy', department: 'Informatique', total_hours: 90, weekly_hours: 18, cm_hours: 30, td_hours: 30, tp_hours: 30, workload_percentage: 100, status: 'normal' },
  { id: 5, name: 'Mme. Petit', department: 'Langues', total_hours: 85, weekly_hours: 17, cm_hours: 20, td_hours: 45, tp_hours: 20, workload_percentage: 94, status: 'normal' },
];

interface DemoAnomaly {
  type: 'warning' | 'info' | 'error';
  message: string;
}

const DEMO_ANOMALIES: DemoAnomaly[] = [
  { type: 'warning', message: 'Amphi A utilise a 95% - Risque de conflit de reservation' },
  { type: 'info', message: 'Salle TD-203 libre tous les vendredis apres-midi - Possibilite de reassignation' },
  { type: 'error', message: 'Dr. Dupont: 24h/semaine - Charge horaire excessive (max recommande: 18h)' },
  { type: 'warning', message: 'Creneau 16h-18h sous-utilise le mercredi - Seulement 1 salle occupee' },
];

const DEMO_SEMESTERS = [
  { id: 1, label: 'S1 - 2025/2026' },
  { id: 2, label: 'S2 - 2025/2026' },
  { id: 3, label: 'S1 - 2024/2025' },
  { id: 4, label: 'S2 - 2024/2025' },
];

// ─── Helper sub-components ───────────────────────────────────────────────────

const getStatusChipColor = (status: OccupancyStatus): 'warning' | 'info' | 'success' | 'error' => {
  switch (status) {
    case 'sous-utilise':
      return 'warning';
    case 'normal':
      return 'info';
    case 'optimal':
      return 'success';
    case 'sature':
      return 'error';
    default:
      return 'info';
  }
};

const getTeacherStatusChipColor = (status: 'sous-charge' | 'normal' | 'surcharge'): 'warning' | 'info' | 'error' => {
  switch (status) {
    case 'sous-charge':
      return 'warning';
    case 'normal':
      return 'info';
    case 'surcharge':
      return 'error';
    default:
      return 'info';
  }
};

const getTeacherStatusLabel = (status: 'sous-charge' | 'normal' | 'surcharge'): string => {
  switch (status) {
    case 'sous-charge':
      return 'Sous-charge';
    case 'normal':
      return 'Normal';
    case 'surcharge':
      return 'Surcharge';
    default:
      return status;
  }
};

const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  statusChip?: { label: string; color: 'warning' | 'info' | 'success' | 'error' };
  borderColor?: string;
}> = ({ title, value, subtitle, color, statusChip, borderColor }) => (
  <Card sx={{ height: '100%', borderLeft: borderColor ? `4px solid ${borderColor}` : undefined }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h4" sx={{ color: color || 'text.primary', fontWeight: 'bold' }}>
          {value}
        </Typography>
        {statusChip && (
          <Chip label={statusChip.label} size="small" color={statusChip.color} />
        )}
      </Box>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const OccupancyStatsDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Using demo data
  const kpis = DEMO_KPIS;
  const byDay = DEMO_BY_DAY;
  const sessionTypes = DEMO_SESSION_TYPES;
  const heatmap = DEMO_HEATMAP;
  const topRooms = DEMO_TOP_ROOMS;
  const topTeachers = DEMO_TOP_TEACHERS;
  const anomalies = DEMO_ANOMALIES;

  const maxDayHours = Math.max(...byDay.map((d) => d.total_hours));

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1200);
  }, []);

  const getHeatmapCell = (day: string, timeslot: string): HeatmapCell | undefined => {
    return heatmap.find((cell) => cell.day === day && cell.timeslot === timeslot);
  };

  const getIntensityLabel = (intensity: HeatmapIntensity): string => {
    switch (intensity) {
      case 'empty':
        return 'Vide';
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyen';
      case 'high':
        return 'Eleve';
      case 'very_high':
        return 'Tres eleve';
      default:
        return '';
    }
  };

  return (
    <Box>
      {/* ── Breadcrumbs ─────────────────────────────────────────────────── */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          href={`/${lang}/admin`}
          underline="hover"
          color="inherit"
          onClick={(e) => {
            e.preventDefault();
            router.push(`/${lang}/admin`);
          }}
        >
          Accueil
        </Link>
        <Link
          href={`/${lang}/admin/timetable`}
          underline="hover"
          color="inherit"
          onClick={(e) => {
            e.preventDefault();
            router.push(`/${lang}/admin/timetable`);
          }}
        >
          Emplois du Temps
        </Link>
        <Typography color="text.primary">Statistiques d&apos;Occupation</Typography>
      </Breadcrumbs>

      {/* ── Title + Navigation Buttons ──────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight="bold">
          Statistiques d&apos;Occupation
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push(`/${lang}/admin/timetable/planning`)}
          >
            Planification
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push(`/${lang}/admin/timetable/export`)}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push(`/${lang}/admin/timetable/teacher-workload`)}
          >
            Charges Enseignants
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push(`/${lang}/admin/timetable/room-usage`)}
          >
            Utilisation Salles
          </Button>
        </Box>
      </Box>

      {/* ── Semester Filter + Refresh ───────────────────────────────────── */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="semester-select-label">Semestre</InputLabel>
                <Select
                  labelId="semester-select-label"
                  value={selectedSemester}
                  label="Semestre"
                  onChange={(e) => setSelectedSemester(e.target.value as number)}
                >
                  {DEMO_SEMESTERS.map((sem) => (
                    <MenuItem key={sem.id} value={sem.id}>
                      {sem.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Button
                variant="contained"
                size="small"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? 'Actualisation...' : 'Actualiser les statistiques'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={4} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Derniere mise a jour : {lastUpdated.toLocaleDateString('fr-FR')} a {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {refreshing && <LinearProgress sx={{ mb: 2 }} />}

      {/* ── KPI Cards Row ───────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Taux d'occupation global"
            value={`${kpis.occupancy_rate}%`}
            subtitle={`${kpis.total_used_hours}h utilisees / ${kpis.total_available_hours}h disponibles`}
            color={OCCUPANCY_STATUS_CONFIG[kpis.status]?.color}
            statusChip={{
              label: OCCUPANCY_STATUS_CONFIG[kpis.status]?.label || kpis.status,
              color: getStatusChipColor(kpis.status),
            }}
            borderColor={OCCUPANCY_STATUS_CONFIG[kpis.status]?.color}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Salles sous-utilisees"
            value={kpis.underused_rooms_count}
            subtitle="Taux d'occupation < 40%"
            color="#ff9800"
            borderColor="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Salles saturees"
            value={kpis.saturated_rooms_count}
            subtitle="Taux d'occupation > 90%"
            color="#f44336"
            borderColor="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Enseignants surcharges"
            value={kpis.overloaded_teachers_count}
            subtitle="Charge > 120% du volume prevu"
            color="#f44336"
            borderColor="#f44336"
          />
        </Grid>
      </Grid>

      {/* ── Occupation par jour + Repartition des seances ───────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left: Occupation par jour (simulated bar chart) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Occupation par jour
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {byDay.map((day) => (
                  <Box key={day.day}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {day.day}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {day.total_hours}h ({day.session_count} seances)
                      </Typography>
                    </Box>
                    <Tooltip title={`Moyenne hebdomadaire: ${day.average_per_week}h`}>
                      <LinearProgress
                        variant="determinate"
                        value={(day.total_hours / maxDayHours) * 100}
                        sx={{
                          height: 20,
                          borderRadius: 2,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            backgroundColor:
                              day.total_hours >= 90
                                ? '#f44336'
                                : day.total_hours >= 80
                                  ? '#ff9800'
                                  : day.total_hours >= 70
                                    ? '#4caf50'
                                    : '#2196f3',
                          },
                        }}
                      />
                    </Tooltip>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, backgroundColor: '#2196f3' }} />
                  <Typography variant="caption">{'< 70h'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, backgroundColor: '#4caf50' }} />
                  <Typography variant="caption">70-79h</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, backgroundColor: '#ff9800' }} />
                  <Typography variant="caption">80-89h</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, backgroundColor: '#f44336' }} />
                  <Typography variant="caption">{'>= 90h'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Repartition des seances (simulated pie chart) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Repartition des seances
              </Typography>

              {/* Stacked horizontal bar */}
              <Box sx={{ mt: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', height: 40, borderRadius: 2, overflow: 'hidden' }}>
                  {sessionTypes.map((st) => (
                    <Tooltip key={st.type} title={`${st.type}: ${st.percentage}% (${st.hours}h)`}>
                      <Box
                        sx={{
                          width: `${st.percentage}%`,
                          backgroundColor: st.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'opacity 0.2s',
                          '&:hover': { opacity: 0.85 },
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>
                          {st.type} {st.percentage}%
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Box>

              {/* Detail cards for each type */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                {sessionTypes.map((st) => (
                  <Box
                    key={st.type}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: st.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {st.type}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {st.type === 'CM' ? 'Cours Magistraux' : st.type === 'TD' ? 'Travaux Diriges' : 'Travaux Pratiques'}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {st.percentage}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {st.count} seances
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {st.hours}h au total
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Heatmap Grid ────────────────────────────────────────────────── */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Carte de chaleur - Occupation par creneau
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nombre de salles occupees par creneau horaire
          </Typography>

          <TableContainer>
            <Table size="small" sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 120, fontWeight: 'bold' }}>Creneau</TableCell>
                  {DEMO_DAYS.map((day) => (
                    <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_TIMESLOTS.map((timeslot) => (
                  <TableRow key={timeslot}>
                    <TableCell sx={{ fontWeight: 'medium' }}>{timeslot}</TableCell>
                    {DEMO_DAYS.map((day) => {
                      const cell = getHeatmapCell(day, timeslot);
                      const intensity: HeatmapIntensity = cell?.intensity || 'empty';
                      const count = cell?.count ?? 0;

                      return (
                        <TableCell
                          key={`${day}-${timeslot}`}
                          align="center"
                          sx={{
                            backgroundColor: HEATMAP_COLORS[intensity],
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            border: '2px solid #fff',
                            borderRadius: 1,
                            cursor: 'default',
                            transition: 'transform 0.1s',
                            '&:hover': {
                              outline: '2px solid #1976d2',
                              outlineOffset: -2,
                            },
                          }}
                        >
                          <Tooltip title={`${day} ${timeslot}: ${count} salle(s) - ${getIntensityLabel(intensity)}`}>
                            <span>{count}</span>
                          </Tooltip>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Heatmap Legend */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {(Object.entries(HEATMAP_COLORS) as [HeatmapIntensity, string][]).map(([key, color]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    backgroundColor: color,
                    border: '1px solid #ccc',
                  }}
                />
                <Typography variant="caption">{getIntensityLabel(key)}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ── Top Rooms + Top Teachers ────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Top 5 Salles les plus utilisees */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 5 - Salles les plus utilisees
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Salle</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="center">Capacite</TableCell>
                      <TableCell align="center">Heures</TableCell>
                      <TableCell align="center">Taux</TableCell>
                      <TableCell align="center">Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topRooms.map((room) => (
                      <TableRow key={room.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {room.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {room.type}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{room.capacity}</TableCell>
                        <TableCell align="center">
                          <Tooltip title={`${room.used_hours}h / ${room.available_hours}h (${room.free_hours}h libres)`}>
                            <span>{room.used_hours}h</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={room.occupancy_rate}
                              sx={{
                                flex: 1,
                                height: 8,
                                borderRadius: 4,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: OCCUPANCY_STATUS_CONFIG[room.status]?.color || '#2196f3',
                                },
                              }}
                            />
                            <Typography variant="caption" fontWeight="bold" sx={{ minWidth: 32 }}>
                              {room.occupancy_rate}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={OCCUPANCY_STATUS_CONFIG[room.status]?.label || room.status}
                            size="small"
                            color={getStatusChipColor(room.status)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top 5 Enseignants les plus charges */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 5 - Enseignants les plus charges
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Enseignant</TableCell>
                      <TableCell>Departement</TableCell>
                      <TableCell align="center">Total (h)</TableCell>
                      <TableCell align="center">Hebdo (h)</TableCell>
                      <TableCell align="center">Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topTeachers.map((teacher) => (
                      <TableRow key={teacher.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {teacher.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {teacher.department}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={`CM: ${teacher.cm_hours}h | TD: ${teacher.td_hours}h | TP: ${teacher.tp_hours}h`}>
                            <span>{teacher.total_hours}h</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={teacher.weekly_hours > 20 ? 'error.main' : 'text.primary'}
                          >
                            {teacher.weekly_hours}h
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getTeacherStatusLabel(teacher.status)}
                            size="small"
                            color={getTeacherStatusChipColor(teacher.status)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Anomaly Alerts Section ──────────────────────────────────────── */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Alertes et Anomalies
            </Typography>
            <Chip
              label={`${anomalies.length} alerte(s)`}
              size="small"
              color={anomalies.some((a) => a.type === 'error') ? 'error' : 'warning'}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {anomalies.map((anomaly, index) => (
              <Alert
                key={index}
                severity={anomaly.type}
                variant="outlined"
                sx={{
                  '& .MuiAlert-message': { width: '100%' },
                }}
              >
                <AlertTitle>
                  {anomaly.type === 'error'
                    ? 'Critique'
                    : anomaly.type === 'warning'
                      ? 'Attention'
                      : 'Information'}
                </AlertTitle>
                {anomaly.message}
              </Alert>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
