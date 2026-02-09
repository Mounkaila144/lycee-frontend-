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
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import LinearProgress from '@mui/material/LinearProgress';
import type { CancellationRecord, CancellationStats } from '../../types';
import { NOTIFICATION_TYPE_CONFIG } from '../../types';

// ──── Demo Data ────

const DEMO_SESSIONS = [
  { id: 1, label: 'Algorithmes CM - Lundi 08:00-10:00 (Dr. Dupont)', module: 'Algorithmes', teacher: 'Dr. Dupont', group: 'L3 Info G1', day: 'Lundi', start: '08:00', end: '10:00' },
  { id: 2, label: 'BDD TD - Lundi 10:00-12:00 (Prof. Martin)', module: 'BDD', teacher: 'Prof. Martin', group: 'L3 Info G1', day: 'Lundi', start: '10:00', end: '12:00' },
  { id: 3, label: 'Reseaux TP - Mardi 08:00-10:00 (Dr. Bernard)', module: 'Reseaux', teacher: 'Dr. Bernard', group: 'L3 Info G2', day: 'Mardi', start: '08:00', end: '10:00' },
  { id: 4, label: 'SE CM - Mardi 14:00-16:00 (Prof. Petit)', module: 'SE', teacher: 'Prof. Petit', group: 'L3 Info G1', day: 'Mardi', start: '14:00', end: '16:00' },
  { id: 5, label: 'Web TP - Mercredi 10:00-12:00 (Dr. Dupont)', module: 'Programmation Web', teacher: 'Dr. Dupont', group: 'L3 Info G2', day: 'Mercredi', start: '10:00', end: '12:00' },
  { id: 6, label: 'Maths CM - Jeudi 08:00-10:00 (Prof. Leroy)', module: 'Mathematiques', teacher: 'Prof. Leroy', group: 'L3 Info G1', day: 'Jeudi', start: '08:00', end: '10:00' },
];

const DEMO_ROOMS = [
  { id: 1, name: 'Amphi A' },
  { id: 2, name: 'Salle TD-101' },
  { id: 3, name: 'Labo Info-1' },
  { id: 4, name: 'Salle TD-102' },
];

const DEMO_CANCELLATIONS: CancellationRecord[] = [
  {
    id: 1, exception_id: 101,
    slot: { id: 1, module: 'Algorithmes', teacher: 'Dr. Dupont', group: 'L3 Info G1', day_of_week: 'Lundi', start_time: '08:00', end_time: '10:00' },
    cancellation_date: '2025-02-10', reason: 'Enseignant en deplacement professionnel a Toulouse',
    status: 'active', created_by: 'Admin', created_at: '2025-02-05T10:00:00',
  },
  {
    id: 2, exception_id: 102,
    slot: { id: 3, module: 'Reseaux', teacher: 'Dr. Bernard', group: 'L3 Info G2', day_of_week: 'Mardi', start_time: '08:00', end_time: '10:00' },
    cancellation_date: '2025-02-11', reason: 'Labo Info-1 en maintenance preventive',
    status: 'rescheduled', rescheduled_to: { date: '2025-02-14', start_time: '14:00', end_time: '16:00', room: 'Salle TD-102' },
    created_by: 'Admin', created_at: '2025-02-06T14:00:00',
  },
  {
    id: 3, exception_id: 103,
    slot: { id: 4, module: 'SE', teacher: 'Prof. Petit', group: 'L3 Info G1', day_of_week: 'Mardi', start_time: '14:00', end_time: '16:00' },
    cancellation_date: '2025-02-11', reason: 'Professeur en conge maladie de courte duree',
    status: 'active', created_by: 'Admin', created_at: '2025-02-07T09:00:00',
  },
  {
    id: 4, exception_id: 104,
    slot: { id: 2, module: 'BDD', teacher: 'Prof. Martin', group: 'L3 Info G1', day_of_week: 'Lundi', start_time: '10:00', end_time: '12:00' },
    cancellation_date: '2025-01-27', reason: 'Evenement universitaire - journee portes ouvertes',
    status: 'restored', created_by: 'Admin', created_at: '2025-01-20T11:00:00', restored_at: '2025-01-25T08:30:00',
  },
  {
    id: 5, exception_id: 105,
    slot: { id: 5, module: 'Programmation Web', teacher: 'Dr. Dupont', group: 'L3 Info G2', day_of_week: 'Mercredi', start_time: '10:00', end_time: '12:00' },
    cancellation_date: '2025-01-15', reason: 'Jour ferie national',
    status: 'active', created_by: 'Admin', created_at: '2025-01-10T08:00:00',
  },
  {
    id: 6, exception_id: 106,
    slot: { id: 6, module: 'Mathematiques', teacher: 'Prof. Leroy', group: 'L3 Info G1', day_of_week: 'Jeudi', start_time: '08:00', end_time: '10:00' },
    cancellation_date: '2025-01-20', reason: 'Greve des transports - enseignant indisponible',
    status: 'rescheduled', rescheduled_to: { date: '2025-01-24', start_time: '08:00', end_time: '10:00', room: 'Amphi A' },
    created_by: 'Admin', created_at: '2025-01-18T16:00:00',
  },
];

const DEMO_STATS: CancellationStats = {
  total_cancellations: 6,
  cancellations_this_month: 3,
  rescheduled_count: 2,
  restored_count: 1,
  top_reasons: [
    { reason: 'Absence enseignant (maladie/deplacement)', count: 3 },
    { reason: 'Maintenance salle/equipement', count: 2 },
    { reason: 'Jour ferie / Evenement universitaire', count: 1 },
  ],
  by_module: [
    { module: 'Algorithmes', count: 1 },
    { module: 'Reseaux', count: 1 },
    { module: 'SE', count: 1 },
    { module: 'BDD', count: 1 },
    { module: 'Programmation Web', count: 1 },
    { module: 'Mathematiques', count: 1 },
  ],
  by_teacher: [
    { teacher: 'Dr. Dupont', count: 2 },
    { teacher: 'Prof. Martin', count: 1 },
    { teacher: 'Dr. Bernard', count: 1 },
    { teacher: 'Prof. Petit', count: 1 },
    { teacher: 'Prof. Leroy', count: 1 },
  ],
};

// ──── Status Chip Helper ────

const STATUS_CONFIG: Record<string, { label: string; color: 'error' | 'success' | 'info' | 'default' }> = {
  active: { label: 'Active', color: 'error' },
  restored: { label: 'Retablie', color: 'success' },
  rescheduled: { label: 'Reportee', color: 'info' },
};

// ──── Cancellation Card ────

const CancellationCard: React.FC<{
  record: CancellationRecord;
  onRestore: (id: number) => void;
}> = ({ record, onRestore }) => {
  const isRestorable = record.status === 'active';
  const createdDate = new Date(record.created_at);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  const canRestore = isRestorable && hoursSinceCreation < 48;

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${record.status === 'active' ? '#f44336' : record.status === 'rescheduled' ? '#2196f3' : '#4caf50'}`,
        mb: 1.5,
        opacity: record.status === 'active' ? 1 : 0.7,
        textDecoration: record.status === 'restored' ? 'line-through' : 'none',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="body1">{NOTIFICATION_TYPE_CONFIG.cancellation.icon}</Typography>
              <Chip
                label={STATUS_CONFIG[record.status]?.label || record.status}
                size="small"
                color={STATUS_CONFIG[record.status]?.color || 'default'}
              />
              <Typography variant="body2" color="text.secondary">
                {new Date(record.cancellation_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ textDecoration: record.status === 'active' ? 'line-through' : 'none', color: record.status === 'active' ? 'text.secondary' : 'text.primary' }}>
              {record.slot.module} - {record.slot.group} ({record.slot.day_of_week} {record.slot.start_time}-{record.slot.end_time})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Enseignant: {record.slot.teacher}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Raison: {record.reason}
            </Typography>
            {record.rescheduled_to && (
              <Alert severity="info" sx={{ mt: 1, py: 0 }} icon={false}>
                <Typography variant="caption">
                  Reportee au {new Date(record.rescheduled_to.date).toLocaleDateString('fr-FR')} de {record.rescheduled_to.start_time} a {record.rescheduled_to.end_time} en {record.rescheduled_to.room}
                </Typography>
              </Alert>
            )}
            {record.restored_at && (
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                Retablie le {new Date(record.restored_at).toLocaleDateString('fr-FR')}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
            {canRestore && (
              <Button size="small" variant="outlined" color="success" onClick={() => onRestore(record.id)}>
                Retablir
              </Button>
            )}
            {isRestorable && !canRestore && (
              <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>
                Delai depasse (48h)
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ──── Horizontal Bar ────

const HorizontalBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
  <Box sx={{ mb: 1.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" fontWeight="bold">{value}</Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={(value / max) * 100}
      sx={{ height: 10, borderRadius: 5, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 } }}
    />
  </Box>
);

// ──── Main Component ────

export const CancellationDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [activeTab, setActiveTab] = useState(0);
  const [cancellations, setCancellations] = useState<CancellationRecord[]>(DEMO_CANCELLATIONS);
  const [stats] = useState<CancellationStats>(DEMO_STATS);

  // History filters
  const [filterDate, setFilterDate] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Cancel form state
  const [selectedSession, setSelectedSession] = useState<number>(0);
  const [cancelDate, setCancelDate] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelType, setCancelType] = useState<'simple' | 'reschedule' | 'series'>('simple');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStart, setRescheduleStart] = useState('');
  const [rescheduleEnd, setRescheduleEnd] = useState('');
  const [rescheduleRoom, setRescheduleRoom] = useState<number>(0);
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [seriesCount, setSeriesCount] = useState(1);
  const [formSuccess, setFormSuccess] = useState(false);

  // Restore confirmation dialog
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreTargetId, setRestoreTargetId] = useState<number | null>(null);

  // ──── Handlers ────

  const handleRestore = (id: number) => {
    setRestoreTargetId(id);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = () => {
    if (restoreTargetId !== null) {
      setCancellations((prev) =>
        prev.map((c) => (c.id === restoreTargetId ? { ...c, status: 'restored' as const, restored_at: new Date().toISOString() } : c))
      );
    }

    setRestoreDialogOpen(false);
    setRestoreTargetId(null);
  };

  const handleCancelSubmit = () => {
    const session = DEMO_SESSIONS.find((s) => s.id === selectedSession);

    if (!session) return;

    const newRecord: CancellationRecord = {
      id: cancellations.length + 1,
      exception_id: 200 + cancellations.length,
      slot: { id: session.id, module: session.module, teacher: session.teacher, group: session.group, day_of_week: session.day, start_time: session.start, end_time: session.end },
      cancellation_date: cancelDate,
      reason: cancelReason,
      status: cancelType === 'reschedule' ? 'rescheduled' : 'active',
      rescheduled_to: cancelType === 'reschedule' ? { date: rescheduleDate, start_time: rescheduleStart, end_time: rescheduleEnd, room: DEMO_ROOMS.find((r) => r.id === rescheduleRoom)?.name || '' } : undefined,
      created_by: 'Admin',
      created_at: new Date().toISOString(),
    };

    setCancellations((prev) => [newRecord, ...prev]);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);

    // Reset form
    setSelectedSession(0);
    setCancelDate('');
    setCancelReason('');
    setCancelType('simple');
    setRescheduleDate('');
    setRescheduleStart('');
    setRescheduleEnd('');
    setRescheduleRoom(0);
    setSeriesCount(1);
  };

  const handleExportExcel = () => {
    alert('Export Excel declenche (demo). Les donnees seraient exportees en format .xlsx.');
  };

  // ──── Filtered History ────

  const filteredHistory = cancellations.filter((c) => {
    if (filterDate && c.cancellation_date !== filterDate) return false;
    if (filterModule && c.slot.module !== filterModule) return false;
    if (filterTeacher && c.slot.teacher !== filterTeacher) return false;
    if (filterStatus && c.status !== filterStatus) return false;

    return true;
  });

  // ──── Computed values ────

  const activeCancellations = cancellations.filter((c) => c.status === 'active');
  const uniqueModules = [...new Set(cancellations.map((c) => c.slot.module))];
  const uniqueTeachers = [...new Set(cancellations.map((c) => c.slot.teacher))];
  const isFormValid = selectedSession > 0 && cancelDate && cancelReason.length >= 10;
  const isRescheduleValid = cancelType !== 'reschedule' || (rescheduleDate && rescheduleStart && rescheduleEnd && rescheduleRoom > 0);

  const maxReasonCount = Math.max(...stats.top_reasons.map((r) => r.count), 1);
  const maxModuleCount = Math.max(...stats.by_module.map((m) => m.count), 1);
  const maxTeacherCount = Math.max(...stats.by_teacher.map((t) => t.count), 1);

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Annulations</Typography>
      </Breadcrumbs>

      {/* Title + Nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Gestion des Annulations</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<span>📅</span>} onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>
            Planification
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>🔔</span>} onClick={() => router.push(`/${lang}/admin/timetable/notifications`)}>
            Notifications
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" fontWeight="bold" color="warning.main">{stats.total_cancellations}</Typography>
              <Typography variant="body2" color="text.secondary">Total annulations</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fce4ec' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" fontWeight="bold" color="error.main">{stats.cancellations_this_month}</Typography>
              <Typography variant="body2" color="text.secondary">Ce mois</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" fontWeight="bold" color="info.main">{stats.rescheduled_count}</Typography>
              <Typography variant="body2" color="text.secondary">Reportees</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" fontWeight="bold" color="success.main">{stats.restored_count}</Typography>
              <Typography variant="body2" color="text.secondary">Retablies</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Annulations actives (${activeCancellations.length})`} />
        <Tab label="Historique" />
        <Tab label="Statistiques" />
        <Tab label="Annuler une seance" />
      </Tabs>

      {/* ──── Tab 0: Active Cancellations ──── */}
      {activeTab === 0 && (
        <Box>
          {activeCancellations.length === 0 ? (
            <Alert severity="info">Aucune annulation active actuellement.</Alert>
          ) : (
            activeCancellations.map((record) => (
              <CancellationCard key={record.id} record={record} onRestore={handleRestore} />
            ))
          )}
        </Box>
      )}

      {/* ──── Tab 1: History ──── */}
      {activeTab === 1 && (
        <Box>
          {/* Filters */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Date" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Module</InputLabel>
                    <Select value={filterModule} label="Module" onChange={(e) => setFilterModule(e.target.value)}>
                      <MenuItem value="">Tous</MenuItem>
                      {uniqueModules.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Enseignant</InputLabel>
                    <Select value={filterTeacher} label="Enseignant" onChange={(e) => setFilterTeacher(e.target.value)}>
                      <MenuItem value="">Tous</MenuItem>
                      {uniqueTeachers.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Statut</InputLabel>
                    <Select value={filterStatus} label="Statut" onChange={(e) => setFilterStatus(e.target.value)}>
                      <MenuItem value="">Tous</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="restored">Retablie</MenuItem>
                      <MenuItem value="rescheduled">Reportee</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button size="small" variant="text" onClick={() => { setFilterDate(''); setFilterModule(''); setFilterTeacher(''); setFilterStatus(''); }}>
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Export button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button size="small" variant="outlined" startIcon={<span>📊</span>} onClick={handleExportExcel}>
              Exporter Excel
            </Button>
          </Box>

          {/* Table */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date annulation</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Enseignant</TableCell>
                  <TableCell>Groupe</TableCell>
                  <TableCell>Raison</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell>Report</TableCell>
                  <TableCell>Cree par</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Aucune annulation trouvee avec ces filtres.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((record) => (
                    <TableRow
                      key={record.id}
                      hover
                      sx={{
                        opacity: record.status === 'restored' ? 0.6 : 1,
                        textDecoration: record.status === 'active' ? 'line-through' : 'none',
                        bgcolor: record.status === 'active' ? 'action.hover' : 'inherit',
                      }}
                    >
                      <TableCell>{new Date(record.cancellation_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{record.slot.module}</TableCell>
                      <TableCell>{record.slot.teacher}</TableCell>
                      <TableCell>{record.slot.group}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{record.reason}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={STATUS_CONFIG[record.status]?.label || record.status}
                          size="small"
                          color={STATUS_CONFIG[record.status]?.color || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {record.rescheduled_to ? (
                          <Typography variant="caption">
                            {new Date(record.rescheduled_to.date).toLocaleDateString('fr-FR')} {record.rescheduled_to.start_time}-{record.rescheduled_to.end_time}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>{record.created_by}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {filteredHistory.length} annulation(s) affichee(s)
          </Typography>
        </Box>
      )}

      {/* ──── Tab 2: Statistics ──── */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Top reasons */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Principales raisons d'annulation</Typography>
                <Divider sx={{ mb: 2 }} />
                {stats.top_reasons.map((item, idx) => (
                  <HorizontalBar
                    key={idx}
                    label={item.reason}
                    value={item.count}
                    max={maxReasonCount}
                    color={['#f44336', '#ff9800', '#2196f3'][idx % 3]}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* By module */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Annulations par module</Typography>
                <Divider sx={{ mb: 2 }} />
                {stats.by_module.map((item, idx) => (
                  <HorizontalBar
                    key={idx}
                    label={item.module}
                    value={item.count}
                    max={maxModuleCount}
                    color="#9c27b0"
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* By teacher */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Annulations par enseignant</Typography>
                <Divider sx={{ mb: 2 }} />
                {stats.by_teacher.map((item, idx) => (
                  <HorizontalBar
                    key={idx}
                    label={item.teacher}
                    value={item.count}
                    max={maxTeacherCount}
                    color="#00897b"
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Rate summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Taux d'annulation</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Taux global (semestre)</Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">4.2%</Typography>
                    <Typography variant="caption" color="text.disabled">6 annulations / 142 seances programmees</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Taux ce mois</Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">6.8%</Typography>
                    <Typography variant="caption" color="text.disabled">3 annulations / 44 seances ce mois</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Taux de report reussi</Typography>
                    <Typography variant="h5" fontWeight="bold" color="info.main">33.3%</Typography>
                    <Typography variant="caption" color="text.disabled">2 seances reportees sur 6 annulations</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Taux de retablissement</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">16.7%</Typography>
                    <Typography variant="caption" color="text.disabled">1 seance retablie sur 6 annulations</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ──── Tab 3: Cancel Form ──── */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Annuler une seance</Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {/* Session selector */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Seance a annuler</InputLabel>
                  <Select value={selectedSession} label="Seance a annuler" onChange={(e) => setSelectedSession(e.target.value as number)}>
                    <MenuItem value={0} disabled>Selectionner une seance</MenuItem>
                    {DEMO_SESSIONS.map((s) => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small" label="Date d'annulation" type="date"
                  value={cancelDate} onChange={(e) => setCancelDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Cancel type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Type d'annulation</Typography>
                  <RadioGroup
                    row
                    value={cancelType}
                    onChange={(e) => setCancelType(e.target.value as 'simple' | 'reschedule' | 'series')}
                  >
                    <FormControlLabel value="simple" control={<Radio size="small" />} label="Simple" />
                    <FormControlLabel value="reschedule" control={<Radio size="small" />} label="Avec report" />
                    <FormControlLabel value="series" control={<Radio size="small" />} label="Serie" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Reason */}
              <Grid item xs={12}>
                <TextField
                  fullWidth size="small" label="Raison de l'annulation (min. 10 caracteres)" multiline rows={3}
                  value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                  required
                  error={cancelReason.length > 0 && cancelReason.length < 10}
                  helperText={cancelReason.length > 0 && cancelReason.length < 10 ? `${cancelReason.length}/10 caracteres minimum` : `${cancelReason.length} caractere(s)`}
                />
              </Grid>

              {/* Reschedule fields (conditional) */}
              {cancelType === 'reschedule' && (
                <>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ py: 0.5 }}>Renseignez les informations de report ci-dessous.</Alert>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth size="small" label="Date de report" type="date"
                      value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth size="small" label="Heure debut" type="time"
                      value={rescheduleStart} onChange={(e) => setRescheduleStart(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth size="small" label="Heure fin" type="time"
                      value={rescheduleEnd} onChange={(e) => setRescheduleEnd(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Salle</InputLabel>
                      <Select value={rescheduleRoom} label="Salle" onChange={(e) => setRescheduleRoom(e.target.value as number)}>
                        <MenuItem value={0} disabled>Choisir</MenuItem>
                        {DEMO_ROOMS.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* Series fields (conditional) */}
              {cancelType === 'series' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" label="Nombre de seances a annuler" type="number"
                    value={seriesCount} onChange={(e) => setSeriesCount(Math.max(1, parseInt(e.target.value) || 1))}
                    inputProps={{ min: 1, max: 16 }}
                    helperText="Annulera les N prochaines occurrences de cette seance"
                  />
                </Grid>
              )}

              {/* Notify */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={notifyUsers} onChange={(e) => setNotifyUsers(e.target.checked)} />}
                  label="Notifier les etudiants et l'enseignant de cette annulation"
                />
              </Grid>

              {/* Preview alert */}
              {selectedSession > 0 && cancelReason.length >= 10 && cancelDate && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Confirmation requise:</strong> Vous allez annuler la seance{' '}
                      <strong>{DEMO_SESSIONS.find((s) => s.id === selectedSession)?.label}</strong>{' '}
                      du <strong>{cancelDate ? new Date(cancelDate).toLocaleDateString('fr-FR') : '...'}</strong>.
                      {cancelType === 'reschedule' && rescheduleDate && ` La seance sera reportee au ${new Date(rescheduleDate).toLocaleDateString('fr-FR')}.`}
                      {cancelType === 'series' && ` ${seriesCount} seance(s) seront annulee(s).`}
                      {notifyUsers && ' Les etudiants seront notifies.'}
                    </Typography>
                  </Alert>
                </Grid>
              )}

              {/* Success message */}
              {formSuccess && (
                <Grid item xs={12}>
                  <Alert severity="success">Annulation enregistree avec succes !</Alert>
                </Grid>
              )}

              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={handleCancelSubmit}
                  disabled={!isFormValid || !isRescheduleValid}
                >
                  {cancelType === 'simple' && 'Confirmer l\'annulation'}
                  {cancelType === 'reschedule' && 'Annuler et reporter la seance'}
                  {cancelType === 'series' && `Annuler ${seriesCount} seance(s)`}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ──── Restore Confirmation Dialog ──── */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Retablir la seance</DialogTitle>
        <DialogContent>
          {restoreTargetId && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Souhaitez-vous retablir cette seance ? Les etudiants et l'enseignant seront notifies du retablissement.
              </Typography>
              {(() => {
                const target = cancellations.find((c) => c.id === restoreTargetId);

                if (!target) return null;

                return (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>{target.slot.module}</strong> - {target.slot.day_of_week} {target.slot.start_time}-{target.slot.end_time}
                      <br />
                      Date: {new Date(target.cancellation_date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Alert>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" color="success" onClick={confirmRestore}>Retablir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
