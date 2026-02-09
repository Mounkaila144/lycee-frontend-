'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';

import type {
  TeacherWorkload,
  DepartmentWorkloadSummary,
  TeacherModuleBreakdown,
  DepartmentTeacherRow,
  WorkloadStatus,
} from '../../types';
import { DEFAULT_TD_COEFFICIENTS } from '../../types';

// ──── Demo Data ────

const DEMO_TEACHERS = [
  { id: 1, name: 'Dr. Amadou Dupont' },
  { id: 2, name: 'Prof. Fatima Martin' },
  { id: 3, name: 'Dr. Ibrahim Bernard' },
  { id: 4, name: 'Prof. Aissata Petit' },
  { id: 5, name: 'Dr. Moussa Leroy' },
  { id: 6, name: 'Dr. Halima Moreau' },
  { id: 7, name: 'Prof. Ousmane Dubois' },
  { id: 8, name: 'Dr. Mariama Laurent' },
];

const DEMO_DEPARTMENTS = [
  { id: 1, name: 'Informatique' },
  { id: 2, name: 'Mathematiques' },
];

const DEMO_SEMESTERS = [
  { id: 1, name: 'S1 2024-2025' },
  { id: 2, name: 'S2 2024-2025' },
];

const DEMO_TEACHER_WORKLOAD: TeacherWorkload = {
  teacher: {
    id: 1,
    name: 'Dr. Amadou Dupont',
    registration_number: 'ENS-2019-042',
    department: 'Informatique',
    status: 'Permanent',
    statutory_hours: 192,
  },
  period: {
    semester_id: 1,
    semester_name: 'S1 2024-2025',
    weeks_count: 16,
  },
  hours_by_type: {
    cm: 48,
    td: 64,
    tp: 32,
  },
  totals: {
    total_hours: 144,
    td_equivalent: 168.44,
    weekly_average: 9,
    session_count: 72,
  },
  comparison: {
    statutory_hours: 192,
    completion_rate: 87.7,
    status: 'normal',
  },
  overtime: {
    statutory_hours: 192,
    actual_td_equivalent: 168.44,
    overtime_hours: 0,
    has_overtime: false,
    estimated_cost: 0,
  },
  modules: [
    {
      module_id: 1,
      module_code: 'INF301',
      module_name: 'Algorithmes Avances',
      level: 'L3',
      groups: ['G1', 'G2'],
      cm_hours: 20,
      td_hours: 16,
      tp_hours: 8,
      total_hours: 44,
      session_count: 22,
    },
    {
      module_id: 2,
      module_code: 'INF302',
      module_name: 'Base de Donnees',
      level: 'L3',
      groups: ['G1'],
      cm_hours: 12,
      td_hours: 16,
      tp_hours: 8,
      total_hours: 36,
      session_count: 18,
    },
    {
      module_id: 3,
      module_code: 'INF401',
      module_name: 'Programmation Web',
      level: 'M1',
      groups: ['G1'],
      cm_hours: 16,
      td_hours: 16,
      tp_hours: 8,
      total_hours: 40,
      session_count: 20,
    },
    {
      module_id: 4,
      module_code: 'INF402',
      module_name: 'Intelligence Artificielle',
      level: 'M1',
      groups: ['G1', 'G2'],
      cm_hours: 0,
      td_hours: 16,
      tp_hours: 8,
      total_hours: 24,
      session_count: 12,
    },
  ],
};

const DEMO_TEACHER_WORKLOAD_OVERTIME: TeacherWorkload = {
  teacher: {
    id: 2,
    name: 'Prof. Fatima Martin',
    registration_number: 'ENS-2016-018',
    department: 'Informatique',
    status: 'Permanent',
    statutory_hours: 192,
  },
  period: {
    semester_id: 1,
    semester_name: 'S1 2024-2025',
    weeks_count: 16,
  },
  hours_by_type: {
    cm: 72,
    td: 80,
    tp: 48,
  },
  totals: {
    total_hours: 200,
    td_equivalent: 220.16,
    weekly_average: 12.5,
    session_count: 100,
  },
  comparison: {
    statutory_hours: 192,
    completion_rate: 114.7,
    status: 'surcharge',
  },
  overtime: {
    statutory_hours: 192,
    actual_td_equivalent: 220.16,
    overtime_hours: 28.16,
    has_overtime: true,
    estimated_cost: 1126.4,
  },
  modules: [
    {
      module_id: 5,
      module_code: 'INF201',
      module_name: 'Structures de Donnees',
      level: 'L2',
      groups: ['G1', 'G2', 'G3'],
      cm_hours: 24,
      td_hours: 24,
      tp_hours: 16,
      total_hours: 64,
      session_count: 32,
    },
    {
      module_id: 6,
      module_code: 'INF203',
      module_name: 'Programmation Orientee Objet',
      level: 'L2',
      groups: ['G1', 'G2'],
      cm_hours: 20,
      td_hours: 20,
      tp_hours: 16,
      total_hours: 56,
      session_count: 28,
    },
    {
      module_id: 7,
      module_code: 'INF305',
      module_name: 'Compilation',
      level: 'L3',
      groups: ['G1'],
      cm_hours: 16,
      td_hours: 20,
      tp_hours: 8,
      total_hours: 44,
      session_count: 22,
    },
    {
      module_id: 8,
      module_code: 'INF403',
      module_name: 'Securite Informatique',
      level: 'M1',
      groups: ['G1'],
      cm_hours: 12,
      td_hours: 16,
      tp_hours: 8,
      total_hours: 36,
      session_count: 18,
    },
  ],
};

const DEMO_WORKLOADS_BY_TEACHER: Record<number, TeacherWorkload> = {
  1: DEMO_TEACHER_WORKLOAD,
  2: DEMO_TEACHER_WORKLOAD_OVERTIME,
};

const DEMO_DEPARTMENT_TEACHERS: DepartmentTeacherRow[] = [
  { teacher_id: 1, teacher_name: 'Dr. Amadou Dupont', status: 'Permanent', cm_hours: 48, td_hours: 64, tp_hours: 32, total_hours: 144, td_equivalent: 168.44, completion_rate: 87.7, workload_status: 'normal' },
  { teacher_id: 2, teacher_name: 'Prof. Fatima Martin', status: 'Permanent', cm_hours: 72, td_hours: 80, tp_hours: 48, total_hours: 200, td_equivalent: 220.16, completion_rate: 114.7, workload_status: 'surcharge' },
  { teacher_id: 3, teacher_name: 'Dr. Ibrahim Bernard', status: 'Permanent', cm_hours: 36, td_hours: 48, tp_hours: 24, total_hours: 108, td_equivalent: 118.08, completion_rate: 61.5, workload_status: 'sous-charge' },
  { teacher_id: 4, teacher_name: 'Prof. Aissata Petit', status: 'Permanent', cm_hours: 40, td_hours: 56, tp_hours: 28, total_hours: 124, td_equivalent: 134.76, completion_rate: 70.2, workload_status: 'sous-charge' },
  { teacher_id: 5, teacher_name: 'Dr. Moussa Leroy', status: 'Vacataire', cm_hours: 24, td_hours: 32, tp_hours: 16, total_hours: 72, td_equivalent: 78.72, completion_rate: 82.0, workload_status: 'normal' },
  { teacher_id: 6, teacher_name: 'Dr. Halima Moreau', status: 'Permanent', cm_hours: 44, td_hours: 60, tp_hours: 32, total_hours: 136, td_equivalent: 147.44, completion_rate: 76.8, workload_status: 'normal' },
  { teacher_id: 7, teacher_name: 'Prof. Ousmane Dubois', status: 'Vacataire', cm_hours: 16, td_hours: 24, tp_hours: 12, total_hours: 52, td_equivalent: 56.04, completion_rate: 58.4, workload_status: 'sous-charge' },
  { teacher_id: 8, teacher_name: 'Dr. Mariama Laurent', status: 'Permanent', cm_hours: 56, td_hours: 72, tp_hours: 40, total_hours: 168, td_equivalent: 182.8, completion_rate: 95.2, workload_status: 'normal' },
];

const DEMO_DEPARTMENT_SUMMARY: DepartmentWorkloadSummary = {
  department_id: 1,
  department_name: 'Informatique',
  semester_id: 1,
  statistics: {
    total_teachers: 8,
    permanent_count: 6,
    temporary_count: 2,
    total_hours_taught: 1004,
    average_hours_per_teacher: 125.5,
    average_td_equivalent: 138.06,
    underloaded_count: 3,
    normal_count: 4,
    overloaded_count: 1,
  },
  teachers: DEMO_DEPARTMENT_TEACHERS,
};

// ──── Status Config ────

const WORKLOAD_STATUS_CONFIG: Record<WorkloadStatus, { label: string; color: 'warning' | 'success' | 'error'; bgColor: string }> = {
  'sous-charge': { label: 'Sous-charge', color: 'warning', bgColor: '#fff3e0' },
  normal: { label: 'Normal', color: 'success', bgColor: '#e8f5e9' },
  surcharge: { label: 'Surcharge', color: 'error', bgColor: '#fce4ec' },
};

// ──── TD Equivalence Info Card ────

const TDEquivalenceInfoCard: React.FC = () => (
  <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
      <Typography variant="subtitle2" gutterBottom>
        Coefficients d'equivalence TD
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip label="CM" size="small" sx={{ bgcolor: '#1565c0', color: '#fff', fontWeight: 'bold' }} />
          <Typography variant="body2">
            1h CM = <strong>{DEFAULT_TD_COEFFICIENTS.cm}h</strong> eq. TD
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip label="TD" size="small" sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 'bold' }} />
          <Typography variant="body2">
            1h TD = <strong>{DEFAULT_TD_COEFFICIENTS.td}h</strong> eq. TD
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip label="TP" size="small" sx={{ bgcolor: '#e65100', color: '#fff', fontWeight: 'bold' }} />
          <Typography variant="body2">
            1h TP = <strong>{DEFAULT_TD_COEFFICIENTS.tp}h</strong> eq. TD
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ──── Main Component ────

export const TeacherWorkloadDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [activeTab, setActiveTab] = useState(0);

  // Individual report state
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(1);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number>(1);

  // Collective report state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number>(1);
  const [selectedDeptSemesterId, setSelectedDeptSemesterId] = useState<number>(1);

  // ──── Resolved data ────

  const teacherWorkload: TeacherWorkload | null = DEMO_WORKLOADS_BY_TEACHER[selectedTeacherId] || null;
  const departmentSummary: DepartmentWorkloadSummary = DEMO_DEPARTMENT_SUMMARY;

  // ──── Handlers ────

  const handleExportPDF = () => {
    alert('Export PDF declenche (demo). Le rapport serait genere en format PDF.');
  };

  const handleExportExcel = () => {
    alert('Export Excel declenche (demo). Les donnees seraient exportees en format .xlsx.');
  };

  const handleSendEmail = () => {
    alert('Envoi par email declenche (demo). Le rapport serait envoye aux destinataires selectionnes.');
  };

  // ──── Compute module totals for individual report ────

  const computeModuleTotals = (modules: TeacherModuleBreakdown[]) => {
    return modules.reduce(
      (acc, mod) => ({
        cm_hours: acc.cm_hours + mod.cm_hours,
        td_hours: acc.td_hours + mod.td_hours,
        tp_hours: acc.tp_hours + mod.tp_hours,
        total_hours: acc.total_hours + mod.total_hours,
        session_count: acc.session_count + mod.session_count,
      }),
      { cm_hours: 0, td_hours: 0, tp_hours: 0, total_hours: 0, session_count: 0 }
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ──── Breadcrumbs ──── */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Accueil
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Emplois du Temps
        </Link>
        <Typography color="text.primary">Charges Enseignants</Typography>
      </Breadcrumbs>

      {/* ──── Title + Nav Buttons ──── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Charges Enseignants
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}
          >
            Planification
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(`/${lang}/admin/timetable/statistics`)}
          >
            Statistiques
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(`/${lang}/admin/timetable/room-utilization`)}
          >
            Utilisation Salles
          </Button>
        </Box>
      </Box>

      {/* ──── TD Equivalence Coefficients Info ──── */}
      <TDEquivalenceInfoCard />

      {/* ──── Tabs ──── */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Rapport Individuel" />
        <Tab label="Rapport Collectif" />
      </Tabs>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ──── Tab 0: Rapport Individuel ──── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <Box>
          {/* Teacher + Semester Selector */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Enseignant</InputLabel>
                    <Select
                      value={selectedTeacherId}
                      label="Enseignant"
                      onChange={(e) => setSelectedTeacherId(e.target.value as number)}
                    >
                      {DEMO_TEACHERS.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Semestre</InputLabel>
                    <Select
                      value={selectedSemesterId}
                      label="Semestre"
                      onChange={(e) => setSelectedSemesterId(e.target.value as number)}
                    >
                      {DEMO_SEMESTERS.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button variant="contained" fullWidth size="medium" disabled>
                    Charger
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {teacherWorkload ? (
            <>
              {/* ──── Teacher Identity Card ──── */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Fiche Enseignant
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Nom complet
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {teacherWorkload.teacher.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        Matricule
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {teacherWorkload.teacher.registration_number}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Departement
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {teacherWorkload.teacher.department}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        Statut
                      </Typography>
                      <Chip
                        label={teacherWorkload.teacher.status}
                        size="small"
                        color={teacherWorkload.teacher.status === 'Permanent' ? 'primary' : 'default'}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        Heures statutaires
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {teacherWorkload.teacher.statutory_hours}h
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Periode: {teacherWorkload.period.semester_name} ({teacherWorkload.period.weeks_count} semaines)
                      {' | '}Moyenne hebdomadaire: <strong>{teacherWorkload.totals.weekly_average}h</strong>
                      {' | '}Total seances: <strong>{teacherWorkload.totals.session_count}</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* ──── Hours by Type Cards ──── */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ bgcolor: '#e3f2fd', borderLeft: '4px solid #1565c0' }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="overline" color="text.secondary">
                        Cours Magistral (CM)
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ color: '#1565c0' }}>
                        {teacherWorkload.hours_by_type.cm}h
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(teacherWorkload.hours_by_type.cm / 2)} seances
                      </Typography>
                      <Chip
                        label={`Eq. TD: ${(teacherWorkload.hours_by_type.cm * DEFAULT_TD_COEFFICIENTS.cm).toFixed(1)}h`}
                        size="small"
                        sx={{ mt: 1, bgcolor: '#1565c0', color: '#fff' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ bgcolor: '#e8f5e9', borderLeft: '4px solid #2e7d32' }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="overline" color="text.secondary">
                        Travaux Diriges (TD)
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ color: '#2e7d32' }}>
                        {teacherWorkload.hours_by_type.td}h
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(teacherWorkload.hours_by_type.td / 2)} seances
                      </Typography>
                      <Chip
                        label={`Eq. TD: ${(teacherWorkload.hours_by_type.td * DEFAULT_TD_COEFFICIENTS.td).toFixed(1)}h`}
                        size="small"
                        sx={{ mt: 1, bgcolor: '#2e7d32', color: '#fff' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ bgcolor: '#fff3e0', borderLeft: '4px solid #e65100' }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="overline" color="text.secondary">
                        Travaux Pratiques (TP)
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ color: '#e65100' }}>
                        {teacherWorkload.hours_by_type.tp}h
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(teacherWorkload.hours_by_type.tp / 2)} seances
                      </Typography>
                      <Chip
                        label={`Eq. TD: ${(teacherWorkload.hours_by_type.tp * DEFAULT_TD_COEFFICIENTS.tp).toFixed(1)}h`}
                        size="small"
                        sx={{ mt: 1, bgcolor: '#e65100', color: '#fff' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* ──── TD Equivalence Calculation Card ──── */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Calcul de l'equivalence TD
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* Calculation breakdown */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                      mb: 3,
                      p: 2,
                      bgcolor: '#fafafa',
                      borderRadius: 1,
                      border: '1px dashed #ccc',
                    }}
                  >
                    <Tooltip title="Cours Magistral">
                      <Chip
                        label={`CM: ${teacherWorkload.hours_by_type.cm}h x ${DEFAULT_TD_COEFFICIENTS.cm}`}
                        sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 'bold' }}
                      />
                    </Tooltip>
                    <Typography variant="h6" color="text.secondary">+</Typography>
                    <Tooltip title="Travaux Diriges">
                      <Chip
                        label={`TD: ${teacherWorkload.hours_by_type.td}h x ${DEFAULT_TD_COEFFICIENTS.td}`}
                        sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }}
                      />
                    </Tooltip>
                    <Typography variant="h6" color="text.secondary">+</Typography>
                    <Tooltip title="Travaux Pratiques">
                      <Chip
                        label={`TP: ${teacherWorkload.hours_by_type.tp}h x ${DEFAULT_TD_COEFFICIENTS.tp}`}
                        sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 'bold' }}
                      />
                    </Tooltip>
                    <Typography variant="h6" color="text.secondary">=</Typography>
                    <Chip
                      label={`${teacherWorkload.totals.td_equivalent.toFixed(2)}h eq. TD`}
                      sx={{ bgcolor: '#311b92', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}
                    />
                  </Box>

                  {/* Detail breakdown text */}
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                    ({teacherWorkload.hours_by_type.cm} x {DEFAULT_TD_COEFFICIENTS.cm}) + ({teacherWorkload.hours_by_type.td} x {DEFAULT_TD_COEFFICIENTS.td}) + ({teacherWorkload.hours_by_type.tp} x {DEFAULT_TD_COEFFICIENTS.tp}) = {(teacherWorkload.hours_by_type.cm * DEFAULT_TD_COEFFICIENTS.cm).toFixed(1)} + {(teacherWorkload.hours_by_type.td * DEFAULT_TD_COEFFICIENTS.td).toFixed(1)} + {(teacherWorkload.hours_by_type.tp * DEFAULT_TD_COEFFICIENTS.tp).toFixed(2)} = <strong>{teacherWorkload.totals.td_equivalent.toFixed(2)}h</strong>
                  </Typography>

                  {/* Progress bar: actual vs statutory */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">
                        Equivalent TD: <strong>{teacherWorkload.totals.td_equivalent.toFixed(2)}h</strong>
                      </Typography>
                      <Typography variant="body2">
                        Heures statutaires: <strong>{teacherWorkload.comparison.statutory_hours}h</strong>
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(teacherWorkload.comparison.completion_rate, 100)}
                      sx={{
                        height: 16,
                        borderRadius: 8,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 8,
                          bgcolor:
                            teacherWorkload.comparison.status === 'surcharge'
                              ? '#f44336'
                              : teacherWorkload.comparison.status === 'normal'
                                ? '#4caf50'
                                : '#ff9800',
                        },
                      }}
                    />
                  </Box>

                  {/* Completion rate + status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                      {teacherWorkload.comparison.completion_rate}%
                    </Typography>
                    <Chip
                      label={WORKLOAD_STATUS_CONFIG[teacherWorkload.comparison.status].label}
                      color={WORKLOAD_STATUS_CONFIG[teacherWorkload.comparison.status].color}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* ──── Overtime Alert Card ──── */}
              {teacherWorkload.overtime.has_overtime && (
                <Alert
                  severity="warning"
                  sx={{ mb: 3, border: '1px solid #ff9800' }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Heures supplementaires detectees
                  </Typography>
                  <Typography variant="body2">
                    Cet enseignant depasse son volume horaire statutaire de{' '}
                    <strong>{teacherWorkload.overtime.overtime_hours.toFixed(2)}h</strong> en equivalent TD.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, mt: 1, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Heures statutaires</Typography>
                      <Typography variant="subtitle2">{teacherWorkload.overtime.statutory_hours}h</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Equivalent TD reel</Typography>
                      <Typography variant="subtitle2">{teacherWorkload.overtime.actual_td_equivalent.toFixed(2)}h</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Depassement</Typography>
                      <Typography variant="subtitle2" color="error">
                        +{teacherWorkload.overtime.overtime_hours.toFixed(2)}h
                      </Typography>
                    </Box>
                    {teacherWorkload.overtime.estimated_cost > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">Cout estime</Typography>
                        <Typography variant="subtitle2" color="error">
                          {teacherWorkload.overtime.estimated_cost.toFixed(2)} EUR
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Alert>
              )}

              {/* ──── Module Breakdown Table ──── */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Repartition par module
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Code Module</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Module</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Niveau</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Groupes</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1565c0' }}>CM</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>TD</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: '#e65100' }}>TP</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Seances</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teacherWorkload.modules.map((mod: TeacherModuleBreakdown) => (
                          <TableRow key={mod.module_id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {mod.module_code}
                              </Typography>
                            </TableCell>
                            <TableCell>{mod.module_name}</TableCell>
                            <TableCell>
                              <Chip label={mod.level} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              {mod.groups.map((g: string) => (
                                <Chip key={g} label={g} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                              ))}
                            </TableCell>
                            <TableCell align="center" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                              {mod.cm_hours}h
                            </TableCell>
                            <TableCell align="center" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                              {mod.td_hours}h
                            </TableCell>
                            <TableCell align="center" sx={{ color: '#e65100', fontWeight: 'bold' }}>
                              {mod.tp_hours}h
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="bold">
                                {mod.total_hours}h
                              </Typography>
                            </TableCell>
                            <TableCell align="center">{mod.session_count}</TableCell>
                          </TableRow>
                        ))}

                        {/* ──── Totals Summary Row ──── */}
                        {(() => {
                          const totals = computeModuleTotals(teacherWorkload.modules);

                          return (
                            <TableRow sx={{ bgcolor: '#ede7f6' }}>
                              <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>
                                TOTAL ({teacherWorkload.modules.length} modules)
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                                {totals.cm_hours}h
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                {totals.td_hours}h
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                                {totals.tp_hours}h
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                {totals.total_hours}h
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                {totals.session_count}
                              </TableCell>
                            </TableRow>
                          );
                        })()}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* ──── Export Buttons (Individual) ──── */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 3 }}>
                <Button variant="outlined" color="error" onClick={handleExportPDF}>
                  Export PDF
                </Button>
                <Button variant="outlined" color="success" onClick={handleExportExcel}>
                  Export Excel
                </Button>
                <Button variant="outlined" color="primary" onClick={handleSendEmail}>
                  Envoyer par email
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Selectionnez un enseignant et un semestre pour afficher le rapport de charge.
              Les donnees de demonstration sont disponibles pour Dr. Amadou Dupont et Prof. Fatima Martin.
            </Alert>
          )}
        </Box>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ──── Tab 1: Rapport Collectif ──── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <Box>
          {/* Department + Semester Selector */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Departement</InputLabel>
                    <Select
                      value={selectedDepartmentId}
                      label="Departement"
                      onChange={(e) => setSelectedDepartmentId(e.target.value as number)}
                    >
                      {DEMO_DEPARTMENTS.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Semestre</InputLabel>
                    <Select
                      value={selectedDeptSemesterId}
                      label="Semestre"
                      onChange={(e) => setSelectedDeptSemesterId(e.target.value as number)}
                    >
                      {DEMO_SEMESTERS.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button variant="contained" fullWidth size="medium" disabled>
                    Charger
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ──── Department Statistics Cards ──── */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e3f2fd' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {departmentSummary.statistics.total_teachers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total enseignants
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {departmentSummary.statistics.permanent_count} permanents + {departmentSummary.statistics.temporary_count} vacataires
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#f3e5f5' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#7b1fa2' }}>
                    {departmentSummary.statistics.total_hours_taught}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total heures enseignees
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Moy. {departmentSummary.statistics.average_hours_per_teacher}h/enseignant
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e8eaf6' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#283593' }}>
                    {departmentSummary.statistics.average_td_equivalent.toFixed(1)}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Moyenne eq. TD
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Equivalent TD par enseignant
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fafafa' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        {departmentSummary.statistics.underloaded_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sous-charges
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {departmentSummary.statistics.normal_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Normaux
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color="error.main">
                        {departmentSummary.statistics.overloaded_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Surcharges
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ──── Workload Distribution Summary Bar ──── */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" gutterBottom>
                Repartition de la charge - {departmentSummary.department_name}
              </Typography>
              <Box sx={{ display: 'flex', height: 24, borderRadius: 2, overflow: 'hidden', mb: 1 }}>
                <Box
                  sx={{
                    width: `${(departmentSummary.statistics.underloaded_count / departmentSummary.statistics.total_teachers) * 100}%`,
                    bgcolor: '#ff9800',
                    transition: 'width 0.3s',
                  }}
                />
                <Box
                  sx={{
                    width: `${(departmentSummary.statistics.normal_count / departmentSummary.statistics.total_teachers) * 100}%`,
                    bgcolor: '#4caf50',
                    transition: 'width 0.3s',
                  }}
                />
                <Box
                  sx={{
                    width: `${(departmentSummary.statistics.overloaded_count / departmentSummary.statistics.total_teachers) * 100}%`,
                    bgcolor: '#f44336',
                    transition: 'width 0.3s',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
                  <Typography variant="caption">
                    Sous-charges ({departmentSummary.statistics.underloaded_count})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
                  <Typography variant="caption">
                    Normaux ({departmentSummary.statistics.normal_count})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
                  <Typography variant="caption">
                    Surcharges ({departmentSummary.statistics.overloaded_count})
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* ──── Department Teachers Table ──── */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enseignants du departement - {departmentSummary.department_name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Enseignant</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1565c0' }}>CM</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>TD</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#e65100' }}>TP</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Eq. TD</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>% Charge</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Statut Charge</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentSummary.teachers.map((teacher: DepartmentTeacherRow) => {
                      const statusCfg = WORKLOAD_STATUS_CONFIG[teacher.workload_status];

                      return (
                        <TableRow
                          key={teacher.teacher_id}
                          hover
                          sx={{
                            bgcolor: statusCfg.bgColor,
                            '&:hover': { bgcolor: `${statusCfg.bgColor} !important`, filter: 'brightness(0.97)' },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {teacher.teacher_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={teacher.status}
                              size="small"
                              color={teacher.status === 'Permanent' ? 'primary' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#1565c0' }}>
                            {teacher.cm_hours}h
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#2e7d32' }}>
                            {teacher.td_hours}h
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#e65100' }}>
                            {teacher.tp_hours}h
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="bold">
                              {teacher.total_hours}h
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="bold">
                              {teacher.td_equivalent.toFixed(2)}h
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(teacher.completion_rate, 100)}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  flex: 1,
                                  bgcolor: '#e0e0e0',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    bgcolor:
                                      teacher.workload_status === 'surcharge'
                                        ? '#f44336'
                                        : teacher.workload_status === 'normal'
                                          ? '#4caf50'
                                          : '#ff9800',
                                  },
                                }}
                              />
                              <Typography variant="caption" fontWeight="bold" sx={{ minWidth: 40 }}>
                                {teacher.completion_rate}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={statusCfg.label}
                              size="small"
                              color={statusCfg.color}
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {/* ──── Department Totals Row ──── */}
                    <TableRow sx={{ bgcolor: '#ede7f6' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        TOTAL ({departmentSummary.statistics.total_teachers} enseignants)
                      </TableCell>
                      <TableCell />
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                        {departmentSummary.teachers.reduce((sum: number, t: DepartmentTeacherRow) => sum + t.cm_hours, 0)}h
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {departmentSummary.teachers.reduce((sum: number, t: DepartmentTeacherRow) => sum + t.td_hours, 0)}h
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                        {departmentSummary.teachers.reduce((sum: number, t: DepartmentTeacherRow) => sum + t.tp_hours, 0)}h
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {departmentSummary.statistics.total_hours_taught}h
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {departmentSummary.teachers.reduce((sum: number, t: DepartmentTeacherRow) => sum + t.td_equivalent, 0).toFixed(2)}h
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        Moy. {(departmentSummary.teachers.reduce((sum: number, t: DepartmentTeacherRow) => sum + t.completion_rate, 0) / departmentSummary.statistics.total_teachers).toFixed(1)}%
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* ──── Export Buttons (Collective) ──── */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 3 }}>
            <Button variant="outlined" color="error" onClick={handleExportPDF}>
              Export PDF
            </Button>
            <Button variant="outlined" color="success" onClick={handleExportExcel}>
              Export Excel
            </Button>
            <Button variant="outlined" color="primary" onClick={handleSendEmail}>
              Envoyer par email
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
