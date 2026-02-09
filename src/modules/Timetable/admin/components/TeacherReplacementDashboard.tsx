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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

// ──── Types ────

type AvailabilityStatus = 'available' | 'occupied' | 'partial';
type ReplacementStatus = 'active' | 'completed' | 'cancelled';
type DateRangeMode = 'single' | 'range' | 'until_notice';

interface TeacherSuggestion {
  id: number; name: string; initials: string; department: string;
  availability: AvailabilityStatus; weeklyLoad: number; maxLoad: number;
  priority: 'same_module' | 'same_department' | 'available';
  priorityLabel: string; conflict: boolean; conflictDetail?: string;
}

interface Replacement {
  id: number; originalTeacher: string; replacementTeacher: string;
  module: string; moduleCode: string; group: string;
  startDate: string; endDate: string | null; untilNotice: boolean;
  reason: string; status: ReplacementStatus; hoursReplaced: number; createdAt: string;
}

// ──── Demo Data ────

const DEMO_SESSIONS = [
  { id: 1, label: 'Algorithmes CM - Lundi 08:00-10:00 (Dr. Dupont)' },
  { id: 2, label: 'BDD TD - Lundi 10:00-12:00 (Prof. Martin)' },
  { id: 3, label: 'Reseaux TP - Mardi 08:00-10:00 (Dr. Bernard)' },
  { id: 4, label: 'SE CM - Mardi 14:00-16:00 (Prof. Petit)' },
  { id: 5, label: 'IA CM - Mercredi 10:00-12:00 (Dr. Moreau)' },
];

const DEMO_SUGGESTIONS: TeacherSuggestion[] = [
  { id: 10, name: 'Dr. Lefebvre', initials: 'DL', department: 'Informatique', availability: 'available', weeklyLoad: 12, maxLoad: 20, priority: 'same_module', priorityLabel: 'Meme module', conflict: false },
  { id: 11, name: 'Prof. Garcia', initials: 'PG', department: 'Informatique', availability: 'available', weeklyLoad: 8, maxLoad: 20, priority: 'same_department', priorityLabel: 'Meme departement', conflict: false },
  { id: 12, name: 'Dr. Roux', initials: 'DR', department: 'Informatique', availability: 'partial', weeklyLoad: 16, maxLoad: 20, priority: 'same_department', priorityLabel: 'Meme departement', conflict: false },
  { id: 13, name: 'Prof. Faure', initials: 'PF', department: 'Mathematiques', availability: 'available', weeklyLoad: 10, maxLoad: 20, priority: 'available', priorityLabel: 'Disponible', conflict: false },
  { id: 14, name: 'Dr. Simon', initials: 'DS', department: 'Mathematiques', availability: 'occupied', weeklyLoad: 19, maxLoad: 20, priority: 'available', priorityLabel: 'Disponible', conflict: true, conflictDetail: 'Cours de Statistiques Mardi 08:00-10:00' },
  { id: 15, name: 'Prof. Lambert', initials: 'PL', department: 'Physique', availability: 'available', weeklyLoad: 6, maxLoad: 20, priority: 'available', priorityLabel: 'Disponible', conflict: false },
];

const DEMO_ACTIVE: Replacement[] = [
  { id: 1, originalTeacher: 'Dr. Dupont', replacementTeacher: 'Dr. Lefebvre', module: 'Algorithmes', moduleCode: 'ALGO301', group: 'L3 Info G1', startDate: '2025-02-03', endDate: '2025-02-14', untilNotice: false, reason: 'Conge maladie', status: 'active', hoursReplaced: 8, createdAt: '2025-02-01' },
  { id: 2, originalTeacher: 'Prof. Martin', replacementTeacher: 'Prof. Garcia', module: 'BDD', moduleCode: 'BDD301', group: 'L3 Info G2', startDate: '2025-02-10', endDate: null, untilNotice: true, reason: 'Mission de recherche', status: 'active', hoursReplaced: 4, createdAt: '2025-02-08' },
  { id: 3, originalTeacher: 'Dr. Bernard', replacementTeacher: 'Dr. Roux', module: 'Reseaux', moduleCode: 'RES301', group: 'L3 Info G1', startDate: '2025-02-10', endDate: '2025-02-10', untilNotice: false, reason: 'Formation professionnelle', status: 'active', hoursReplaced: 2, createdAt: '2025-02-09' },
];

const DEMO_HISTORY: Replacement[] = [
  ...DEMO_ACTIVE,
  { id: 4, originalTeacher: 'Prof. Petit', replacementTeacher: 'Prof. Faure', module: 'SE', moduleCode: 'SE301', group: 'L3 Info G1', startDate: '2025-01-13', endDate: '2025-01-24', untilNotice: false, reason: 'Conference internationale', status: 'completed', hoursReplaced: 8, createdAt: '2025-01-10' },
  { id: 5, originalTeacher: 'Dr. Dupont', replacementTeacher: 'Dr. Lefebvre', module: 'Algorithmes', moduleCode: 'ALGO301', group: 'L3 Info G1', startDate: '2025-01-06', endDate: '2025-01-06', untilNotice: false, reason: 'Rendez-vous medical', status: 'completed', hoursReplaced: 2, createdAt: '2025-01-04' },
  { id: 6, originalTeacher: 'Prof. Martin', replacementTeacher: 'Prof. Lambert', module: 'BDD', moduleCode: 'BDD301', group: 'L3 Info G2', startDate: '2024-12-16', endDate: '2024-12-20', untilNotice: false, reason: 'Conge personnel', status: 'completed', hoursReplaced: 4, createdAt: '2024-12-14' },
  { id: 7, originalTeacher: 'Dr. Bernard', replacementTeacher: 'Dr. Roux', module: 'Reseaux', moduleCode: 'RES301', group: 'L3 Info G1', startDate: '2024-12-09', endDate: '2024-12-09', untilNotice: false, reason: 'Urgence familiale', status: 'cancelled', hoursReplaced: 0, createdAt: '2024-12-08' },
  { id: 8, originalTeacher: 'Dr. Moreau', replacementTeacher: 'Prof. Garcia', module: 'IA', moduleCode: 'IA301', group: 'L3 Info G1', startDate: '2024-11-25', endDate: '2024-12-06', untilNotice: false, reason: 'Conge maladie', status: 'completed', hoursReplaced: 8, createdAt: '2024-11-22' },
];

const AVAILABILITY_CFG: Record<AvailabilityStatus, { label: string; color: 'success' | 'error' | 'warning' }> = {
  available: { label: 'Disponible', color: 'success' },
  occupied: { label: 'Occupe', color: 'error' },
  partial: { label: 'Partiellement libre', color: 'warning' },
};

const STATUS_CFG: Record<ReplacementStatus, { label: string; color: 'success' | 'info' | 'default' }> = {
  active: { label: 'Actif', color: 'info' },
  completed: { label: 'Termine', color: 'success' },
  cancelled: { label: 'Annule', color: 'default' },
};

const PRIORITY_COLORS: Record<string, string> = {
  same_module: '#1976d2', same_department: '#2e7d32', available: '#ed6c02',
};

// ──── Summary Card ────

const SummaryCard: React.FC<{ title: string; value: string | number; subtitle: string; color: string }> = ({ title, value, subtitle, color }) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ color, my: 0.5 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
    </CardContent>
  </Card>
);

// ──── Main Component ────

export const TeacherReplacementDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [activeTab, setActiveTab] = useState(0);
  const [activeReplacements, setActiveReplacements] = useState(DEMO_ACTIVE);
  const [historyFilter, setHistoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReplacementStatus | ''>('');
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [endTargetId, setEndTargetId] = useState<number | null>(null);

  // New replacement form state
  const [selectedSession, setSelectedSession] = useState<number>(0);
  const [selectedReplacer, setSelectedReplacer] = useState<number>(0);
  const [dateRangeMode, setDateRangeMode] = useState<DateRangeMode>('single');
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [replacementReason, setReplacementReason] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleEndReplacement = (id: number) => { setEndTargetId(id); setEndDialogOpen(true); };

  const confirmEndReplacement = () => {
    setActiveReplacements(prev => prev.filter(r => r.id !== endTargetId));
    setEndDialogOpen(false);
    setEndTargetId(null);
  };

  const handleSubmitReplacement = () => {
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
    setSelectedSession(0); setSelectedReplacer(0); setReplacementReason('');
    setSingleDate(''); setStartDate(''); setEndDate('');
  };

  const filteredHistory = DEMO_HISTORY.filter(r => {
    const matchTeacher = !historyFilter || r.originalTeacher.toLowerCase().includes(historyFilter.toLowerCase()) || r.replacementTeacher.toLowerCase().includes(historyFilter.toLowerCase());
    return matchTeacher && (!statusFilter || r.status === statusFilter);
  });

  const selectedSuggestion = DEMO_SUGGESTIONS.find(s => s.id === selectedReplacer);
  const totalHours = DEMO_HISTORY.reduce((s, r) => s + r.hoursReplaced, 0);
  const teachersInvolved = new Set([...DEMO_HISTORY.map(r => r.originalTeacher), ...DEMO_HISTORY.map(r => r.replacementTeacher)]).size;

  const mostReplaced = Object.entries(
    DEMO_HISTORY.reduce<Record<string, number>>((a, r) => { a[r.originalTeacher] = (a[r.originalTeacher] || 0) + 1; return a; }, {})
  ).sort((a, b) => b[1] - a[1]);

  const mostActiveReplacers = Object.entries(
    DEMO_HISTORY.reduce<Record<string, number>>((a, r) => { a[r.replacementTeacher] = (a[r.replacementTeacher] || 0) + r.hoursReplaced; return a; }, {})
  ).sort((a, b) => b[1] - a[1]);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR');

  const fmtPeriod = (r: Replacement) => {
    if (r.untilNotice) return `Depuis ${fmtDate(r.startDate)}`;
    if (r.startDate === r.endDate) return fmtDate(r.startDate);
    return `${fmtDate(r.startDate)} - ${r.endDate ? fmtDate(r.endDate) : ''}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Remplacement Enseignants</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Gestion des Remplacements</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>Planification</Button>
          <Button size="small" variant="outlined" onClick={() => router.push(`/${lang}/admin/timetable/notifications`)}>Notifications</Button>
          <Button size="small" variant="contained" color="secondary" onClick={() => alert('Export Excel en cours...')}>Export Excel</Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Remplacements actifs" value={activeReplacements.length} subtitle="En cours actuellement" color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Ce semestre" value={DEMO_HISTORY.length} subtitle="Total des remplacements" color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Heures remplacees" value={`${totalHours}h`} subtitle="Depuis debut du semestre" color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Enseignants impliques" value={teachersInvolved} subtitle="Remplacants et remplaces" color="#9c27b0" />
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Remplacements actifs (${activeReplacements.length})`} />
        <Tab label="Historique" />
        <Tab label="Nouveau remplacement" />
        <Tab label="Statistiques" />
      </Tabs>

      {/* Tab 0: Active Replacements */}
      {activeTab === 0 && (
        <Box>
          {activeReplacements.length === 0 ? (
            <Alert severity="info">Aucun remplacement actif en cours.</Alert>
          ) : (
            <Grid container spacing={2}>
              {activeReplacements.map(r => (
                <Grid item xs={12} md={6} key={r.id}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid #1976d2' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={r.moduleCode} size="small" color="primary" variant="outlined" />
                          <Typography variant="subtitle1" fontWeight="bold">{r.module}</Typography>
                        </Box>
                        <Chip label={r.untilNotice ? 'Jusqu\'a nouvel ordre' : STATUS_CFG[r.status].label} size="small" color={STATUS_CFG[r.status].color} />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#ef5350' }}>{r.originalTeacher.charAt(0)}</Avatar>
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>{r.originalTeacher}</Typography>
                        <Typography variant="body2" color="text.secondary">-&gt;</Typography>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#66bb6a' }}>{r.replacementTeacher.charAt(0)}</Avatar>
                        <Typography variant="body2" fontWeight="bold">{r.replacementTeacher}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">Groupe: {r.group} | {r.hoursReplaced}h remplacees</Typography>
                      <Typography variant="body2" color="text.secondary">{fmtPeriod(r)}</Typography>
                      <Typography variant="caption" color="text.secondary">Raison: {r.reason}</Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button size="small" color="error" variant="outlined" onClick={() => handleEndReplacement(r.id)}>Terminer le remplacement</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Tab 1: History */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField size="small" label="Rechercher un enseignant" value={historyFilter} onChange={e => setHistoryFilter(e.target.value)} sx={{ minWidth: 240 }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Statut</InputLabel>
              <Select value={statusFilter} label="Statut" onChange={e => setStatusFilter(e.target.value as ReplacementStatus | '')}>
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="completed">Termine</MenuItem>
                <MenuItem value="cancelled">Annule</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Module</TableCell>
                  <TableCell>Enseignant original</TableCell>
                  <TableCell>Remplacant</TableCell>
                  <TableCell>Periode</TableCell>
                  <TableCell>Raison</TableCell>
                  <TableCell align="center">Heures</TableCell>
                  <TableCell align="center">Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{r.module}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.moduleCode} - {r.group}</Typography>
                    </TableCell>
                    <TableCell>{r.originalTeacher}</TableCell>
                    <TableCell>{r.replacementTeacher}</TableCell>
                    <TableCell><Typography variant="body2">{fmtPeriod(r)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>{r.reason}</Typography></TableCell>
                    <TableCell align="center">{r.hoursReplaced}h</TableCell>
                    <TableCell align="center">
                      <Chip label={STATUS_CFG[r.status].label} size="small" color={STATUS_CFG[r.status].color} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tab 2: New Replacement */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Configurer le remplacement</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Seance a remplacer</InputLabel>
                  <Select value={selectedSession} label="Seance a remplacer" onChange={e => setSelectedSession(e.target.value as number)}>
                    <MenuItem value={0} disabled>Selectionner une seance</MenuItem>
                    {DEMO_SESSIONS.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Periode de remplacement</Typography>
                <RadioGroup value={dateRangeMode} onChange={e => setDateRangeMode(e.target.value as DateRangeMode)}>
                  <FormControlLabel value="single" control={<Radio size="small" />} label="Date unique" />
                  <FormControlLabel value="range" control={<Radio size="small" />} label="Plage de dates" />
                  <FormControlLabel value="until_notice" control={<Radio size="small" />} label="Jusqu'a nouvel ordre" />
                </RadioGroup>
                {dateRangeMode === 'single' && (
                  <TextField fullWidth size="small" type="date" label="Date" value={singleDate} onChange={e => setSingleDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 1 }} />
                )}
                {dateRangeMode === 'range' && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField fullWidth size="small" type="date" label="Debut" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <TextField fullWidth size="small" type="date" label="Fin" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                  </Box>
                )}
                {dateRangeMode === 'until_notice' && (
                  <TextField fullWidth size="small" type="date" label="A partir du" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 1 }} />
                )}
                <Divider sx={{ my: 2 }} />
                <TextField fullWidth size="small" label="Raison du remplacement" multiline rows={2} value={replacementReason} onChange={e => setReplacementReason(e.target.value)} />
                {selectedSuggestion?.conflict && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Conflit detecte : {selectedSuggestion.conflictDetail}. Ce remplacement pourrait creer un chevauchement.
                  </Alert>
                )}
                {formSuccess && <Alert severity="success" sx={{ mt: 2 }}>Remplacement cree avec succes !</Alert>}
                <Button variant="contained" fullWidth sx={{ mt: 2 }} disabled={!selectedSession || !selectedReplacer || !replacementReason} onClick={handleSubmitReplacement}>
                  Creer le remplacement
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Enseignants suggeres</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Tries par priorite : meme module &gt; meme departement &gt; disponible
                </Typography>
                <List disablePadding>
                  {DEMO_SUGGESTIONS.map((t, idx) => (
                    <React.Fragment key={t.id}>
                      {idx > 0 && <Divider />}
                      <ListItem
                        sx={{ cursor: 'pointer', bgcolor: selectedReplacer === t.id ? 'action.selected' : 'transparent', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
                        onClick={() => setSelectedReplacer(t.id)}
                      >
                        <ListItemAvatar>
                          <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: `${AVAILABILITY_CFG[t.availability].color}.main`, border: '2px solid #fff' }} />}>
                            <Avatar sx={{ bgcolor: PRIORITY_COLORS[t.priority] }}>{t.initials}</Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="subtitle2">{t.name}</Typography>
                              <Chip label={t.priorityLabel} size="small" sx={{ bgcolor: PRIORITY_COLORS[t.priority], color: '#fff', height: 20, fontSize: '0.7rem' }} />
                              <Chip label={AVAILABILITY_CFG[t.availability].label} size="small" color={AVAILABILITY_CFG[t.availability].color} variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" component="span">{t.department} | {t.weeklyLoad}h cette semaine</Typography>
                              <LinearProgress variant="determinate" value={(t.weeklyLoad / t.maxLoad) * 100} sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                color={t.weeklyLoad > 16 ? 'error' : t.weeklyLoad > 12 ? 'warning' : 'primary'} />
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Radio checked={selectedReplacer === t.id} size="small" onChange={() => setSelectedReplacer(t.id)} />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Statistics */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Enseignants les plus remplaces</Typography>
                <List disablePadding>
                  {mostReplaced.map(([name, count], idx) => (
                    <ListItem key={name} disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: idx === 0 ? '#ef5350' : idx === 1 ? '#ff9800' : '#9e9e9e' }}>{idx + 1}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={name} secondary={`${count} remplacement(s)`} />
                      <Box sx={{ width: 80 }}>
                        <LinearProgress variant="determinate" value={(count / Math.max(...mostReplaced.map(m => m[1]))) * 100} color={idx === 0 ? 'error' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Remplacants les plus actifs</Typography>
                <List disablePadding>
                  {mostActiveReplacers.map(([name, hours], idx) => (
                    <ListItem key={name} disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: idx === 0 ? '#66bb6a' : idx === 1 ? '#42a5f5' : '#9e9e9e' }}>{idx + 1}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={name} secondary={`${hours}h de remplacement`} />
                      <Chip label={`${hours}h`} size="small" color={idx === 0 ? 'success' : 'default'} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Tendance mensuelle</Typography>
                {[
                  { month: 'Fevrier 2025', count: 3, hours: 14 },
                  { month: 'Janvier 2025', count: 2, hours: 10 },
                  { month: 'Decembre 2024', count: 2, hours: 4 },
                  { month: 'Novembre 2024', count: 1, hours: 8 },
                ].map(item => (
                  <Box key={item.month} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{item.month}</Typography>
                      <Typography variant="body2" fontWeight="bold">{item.count} rempl. / {item.hours}h</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(item.hours / 14) * 100} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="primary">{totalHours}h</Typography>
                  <Typography variant="body2" color="text.secondary">Total heures remplacees ce semestre</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* End Replacement Confirmation Dialog */}
      <Dialog open={endDialogOpen} onClose={() => setEndDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Terminer le remplacement</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Etes-vous sur de vouloir mettre fin a ce remplacement ? L'enseignant original reprendra ses seances.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={confirmEndReplacement}>Terminer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
