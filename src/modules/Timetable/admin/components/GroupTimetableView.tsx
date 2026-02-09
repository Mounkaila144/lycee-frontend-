'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';

import type { ViewMode, LoadStatus, SlotWithException } from '../../types';
import { DAYS, TIME_SLOTS, SESSION_TYPE_COLORS } from '../../types';

// ──── Demo Data ────

const DEMO_GROUPS = [
  { id: 1, name: 'L3 Info - G1', faculty: 'FST', department: 'Informatique', level: 'L3' },
  { id: 2, name: 'L3 Info - G2', faculty: 'FST', department: 'Informatique', level: 'L3' },
  { id: 3, name: 'M1 Info - G1', faculty: 'FST', department: 'Informatique', level: 'M1' },
];

const DEMO_SLOTS: SlotWithException[] = [
  { id: 1, schedule_id: 1, module_id: 1, teacher_id: 1, group_id: 1, room_id: 1, semester_id: 1, day_of_week: 'Lundi', start_time: '08:00', end_time: '10:00', type: 'CM', is_recurring: true, module: { id: 1, name: 'Algorithmes', code: 'ALGO' }, teacher: { id: 1, name: 'Dr. Dupont' }, group: { id: 1, name: 'L3 Info - G1' }, room: { id: 1, name: 'Amphi A', code: 'AMP-A' }, created_at: '', updated_at: '', color: SESSION_TYPE_COLORS.CM, duration_hours: 2 },
  { id: 2, schedule_id: 1, module_id: 2, teacher_id: 2, group_id: 1, room_id: 2, semester_id: 1, day_of_week: 'Lundi', start_time: '10:00', end_time: '12:00', type: 'TD', is_recurring: true, module: { id: 2, name: 'Base de données', code: 'BDD' }, teacher: { id: 2, name: 'Prof. Martin' }, group: { id: 1, name: 'L3 Info - G1' }, room: { id: 2, name: 'Salle TD-101', code: 'TD-101' }, created_at: '', updated_at: '', color: SESSION_TYPE_COLORS.TD, duration_hours: 2 },
  { id: 3, schedule_id: 1, module_id: 3, teacher_id: 3, group_id: 1, room_id: 3, semester_id: 1, day_of_week: 'Mardi', start_time: '08:00', end_time: '10:00', type: 'TP', is_recurring: true, module: { id: 3, name: 'Réseaux', code: 'RES' }, teacher: { id: 3, name: 'Dr. Bernard' }, group: { id: 1, name: 'L3 Info - G1' }, room: { id: 3, name: 'Labo Info-1', code: 'LAB-I1' }, created_at: '', updated_at: '', color: SESSION_TYPE_COLORS.TP, duration_hours: 2 },
  { id: 4, schedule_id: 1, module_id: 4, teacher_id: 4, group_id: 1, room_id: 1, semester_id: 1, day_of_week: 'Mardi', start_time: '14:00', end_time: '16:00', type: 'CM', is_recurring: true, module: { id: 4, name: 'Systèmes d\'exploitation', code: 'SE' }, teacher: { id: 4, name: 'Prof. Petit' }, group: { id: 1, name: 'L3 Info - G1' }, room: { id: 1, name: 'Amphi A', code: 'AMP-A' }, created_at: '', updated_at: '', color: SESSION_TYPE_COLORS.CM, duration_hours: 2 },
  { id: 5, schedule_id: 1, module_id: 5, teacher_id: 1, group_id: 1, room_id: 3, semester_id: 1, day_of_week: 'Mercredi', start_time: '10:00', end_time: '12:00', type: 'TP', is_recurring: true, module: { id: 5, name: 'Programmation Web', code: 'WEB' }, teacher: { id: 1, name: 'Dr. Dupont' }, group: { id: 1, name: 'L3 Info - G1' }, room: { id: 3, name: 'Labo Info-1', code: 'LAB-I1' }, created_at: '', updated_at: '', color: SESSION_TYPE_COLORS.TP, duration_hours: 2, has_exception: true, exception_type: 'room_change', exception_reason: 'Salle en maintenance - déplacé en Labo Info-2' },
  { id: 6, schedule_id: 1, module_id: 6, teacher_id: 2, group_id: 1, room_id: 1, semester_id: 1, day_of_week: 'Mercredi', start_time: '14:00', end_time: '16:00', type: 'CM', is_recurring: true, module: { id: 6, name: 'Mathématiques', code: 'MATH' }, teacher: { id: 2, name: 'Prof. Martin' }, group: { id: 1, name: 'L3 Info - G1' }, room: { id: 1, name: 'Amphi A', code: 'AMP-A' }, created_at: '', updated_at: '', color: SESSION_TYPE_COLORS.CM, duration_hours: 2 },
  { id: 7, schedule_id: 1, module_id: 1, teacher_id: 1, group_id: 1, room_id: 2, semester_id: 1, day_of_week: 'Jeudi', start_time: '08:00', end_time: '10:00', type: 'TD', is_recurring: true, module: { id: 1, name: 'Algorithmes', code: 'ALGO' }, teacher: { id: 1, name: 'Dr. Dupont' }, group: { id: 1, name: 'L3 Info - G1' }, room: { id: 2, name: 'Salle TD-101', code: 'TD-101' }, created_at: '', updated_at: '', color: SESSION_TYPE_COLORS.TD, duration_hours: 2 },
  { id: 8, schedule_id: 1, module_id: 2, teacher_id: 2, group_id: 1, room_id: 3, semester_id: 1, day_of_week: 'Jeudi', start_time: '14:00', end_time: '16:00', type: 'TP', is_recurring: true, module: { id: 2, name: 'Base de données', code: 'BDD' }, teacher: { id: 2, name: 'Prof. Martin' }, group: { id: 1, name: 'L3 Info - G1' }, room: { id: 3, name: 'Labo Info-1', code: 'LAB-I1' }, created_at: '', updated_at: '', color: SESSION_TYPE_COLORS.TP, duration_hours: 2 },
  { id: 9, schedule_id: 1, module_id: 3, teacher_id: 3, group_id: 1, room_id: 4, semester_id: 1, day_of_week: 'Vendredi', start_time: '10:00', end_time: '12:00', type: 'TD', is_recurring: true, module: { id: 3, name: 'Réseaux', code: 'RES' }, teacher: { id: 3, name: 'Dr. Bernard' }, group: { id: 1, name: 'L3 Info - G1' }, room: { id: 4, name: 'Salle TD-102', code: 'TD-102' }, created_at: '', updated_at: '', color: SESSION_TYPE_COLORS.TD, duration_hours: 2 },
];

const DEMO_GAPS = [
  { day: 'Mardi', start: '10:00', end: '14:00', duration_minutes: 240, duration_display: '4h0' },
];

// ──── Helper Functions ────

const getSlotForCell = (slots: SlotWithException[], day: string, timeSlot: { start: string }) => {
  return slots.find((s) => s.day_of_week === day && s.start_time === timeSlot.start);
};

const getLoadColor = (status: LoadStatus) => {
  if (status === 'normal') return 'success.main';
  if (status === 'elevated') return 'warning.main';

  return 'error.main';
};

// ──── Main Component ────

export const GroupTimetableView: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [groupId, setGroupId] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [weekOffset, setWeekOffset] = useState(0);
  const [showExceptionsOnly, setShowExceptionsOnly] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState<string>('day');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotWithException | null>(null);

  const group = DEMO_GROUPS.find((g) => g.id === groupId)!;

  // Week calculation
  const today = new Date();
  const weekStart = new Date(today);

  weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const weekEnd = new Date(weekStart);

  weekEnd.setDate(weekStart.getDate() + 5);

  const weekLabel = `Semaine du ${weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} au ${weekEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

  // Statistics
  const stats = useMemo(() => {
    const totalHours = DEMO_SLOTS.length * 2;
    const cmHours = DEMO_SLOTS.filter((s) => s.type === 'CM').length * 2;
    const tdHours = DEMO_SLOTS.filter((s) => s.type === 'TD').length * 2;
    const tpHours = DEMO_SLOTS.filter((s) => s.type === 'TP').length * 2;
    const loadStatus: LoadStatus = totalHours < 30 ? 'normal' : totalHours <= 35 ? 'elevated' : 'high';

    return { totalHours, cmHours, tdHours, tpHours, loadStatus };
  }, []);

  // Filtered slots for list view
  const filteredSlots = useMemo(() => {
    let slots = [...DEMO_SLOTS];

    if (showExceptionsOnly) slots = slots.filter((s) => s.has_exception);
    if (searchText) {
      const q = searchText.toLowerCase();

      slots = slots.filter(
        (s) =>
          s.module?.name.toLowerCase().includes(q) ||
          s.teacher?.name.toLowerCase().includes(q),
      );
    }

    const dayOrder: Record<string, number> = { Lundi: 0, Mardi: 1, Mercredi: 2, Jeudi: 3, Vendredi: 4, Samedi: 5 };

    slots.sort((a, b) => {
      let cmp = 0;

      if (sortField === 'day') cmp = (dayOrder[a.day_of_week] || 0) - (dayOrder[b.day_of_week] || 0);
      else if (sortField === 'time') cmp = a.start_time.localeCompare(b.start_time);
      else if (sortField === 'module') cmp = (a.module?.name || '').localeCompare(b.module?.name || '');

      return sortDir === 'asc' ? cmp : -cmp;
    });

    return slots;
  }, [showExceptionsOnly, searchText, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSlotClick = (e: React.MouseEvent<HTMLElement>, slot: SlotWithException) => {
    setAnchorEl(e.currentTarget);
    setSelectedSlot(slot);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Link underline="hover" color="inherit" href="#">{group.faculty}</Link>
        <Link underline="hover" color="inherit" href="#">{group.department}</Link>
        <Typography color="text.primary">{group.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">EDT Groupe - {group.name}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<span>🗓️</span>} onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>
            Planification
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>⚡</span>} onClick={() => router.push(`/${lang}/admin/timetable/exceptions`)}>
            Exceptions
          </Button>
        </Box>
      </Box>

      {/* Filters Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Groupe</InputLabel>
          <Select value={groupId} label="Groupe" onChange={(e) => setGroupId(e.target.value as number)}>
            {DEMO_GROUPS.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Semestre</InputLabel>
          <Select value={1} label="Semestre">
            <MenuItem value={1}>S1 2024-2025</MenuItem>
            <MenuItem value={2}>S2 2024-2025</MenuItem>
          </Select>
        </FormControl>
        <ButtonGroup size="small">
          <Button variant={viewMode === 'grid' ? 'contained' : 'outlined'} onClick={() => setViewMode('grid')}>Grille</Button>
          <Button variant={viewMode === 'list' ? 'contained' : 'outlined'} onClick={() => setViewMode('list')}>Liste</Button>
        </ButtonGroup>
        <Button size="small" variant={showExceptionsOnly ? 'contained' : 'outlined'} color="warning" onClick={() => setShowExceptionsOnly(!showExceptionsOnly)}>
          Exceptions
        </Button>
        <Button size="small" variant="outlined">Export CSV</Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" fontWeight="bold" color={getLoadColor(stats.loadStatus)}>{stats.totalHours}h</Typography>
              <Typography variant="caption">Total semaine</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="body2">
                <Box component="span" sx={{ color: SESSION_TYPE_COLORS.CM, fontWeight: 'bold' }}>{stats.cmHours}h CM</Box>
                {' / '}
                <Box component="span" sx={{ color: SESSION_TYPE_COLORS.TD, fontWeight: 'bold' }}>{stats.tdHours}h TD</Box>
                {' / '}
                <Box component="span" sx={{ color: SESSION_TYPE_COLORS.TP, fontWeight: 'bold' }}>{stats.tpHours}h TP</Box>
              </Typography>
              <Typography variant="caption">Répartition par type</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" fontWeight="bold" color={DEMO_GAPS.length > 0 ? 'warning.main' : 'success.main'}>{DEMO_GAPS.length}</Typography>
              <Typography variant="caption">Trous détectés (&gt;2h)</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" fontWeight="bold" color="info.main">{DEMO_SLOTS.filter((s) => s.has_exception).length}</Typography>
              <Typography variant="caption">Exceptions actives</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gaps Alert */}
      {DEMO_GAPS.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {DEMO_GAPS.length} trou(s) horaire(s) détecté(s): {DEMO_GAPS.map((g) => `${g.day} ${g.start}-${g.end} (${g.duration_display})`).join(', ')}
        </Alert>
      )}

      {/* Week Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => setWeekOffset((o) => o - 1)} size="small">{'<'}</IconButton>
        <Button size="small" variant="text" onClick={() => setWeekOffset(0)}>Semaine actuelle</Button>
        <Typography variant="body2" fontWeight="bold">{weekLabel}</Typography>
        <IconButton onClick={() => setWeekOffset((o) => o + 1)} size="small">{'>'}</IconButton>
      </Box>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Heure</TableCell>
                {DAYS.map((day) => (
                  <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>{day}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {TIME_SLOTS.map((ts) => (
                <TableRow key={ts.start}>
                  <TableCell sx={{ fontWeight: 'bold', verticalAlign: 'top', fontSize: '0.75rem' }}>
                    {ts.start}<br />{ts.end}
                  </TableCell>
                  {DAYS.map((day) => {
                    const slot = getSlotForCell(DEMO_SLOTS, day, ts);

                    return (
                      <TableCell
                        key={day}
                        sx={{
                          p: 0.5,
                          height: 90,
                          verticalAlign: 'top',
                          position: 'relative',
                          cursor: slot ? 'pointer' : 'default',
                        }}
                        onClick={(e) => slot && handleSlotClick(e, slot)}
                      >
                        {slot ? (
                          <Box
                            sx={{
                              bgcolor: slot.color || SESSION_TYPE_COLORS[slot.type],
                              color: '#fff',
                              p: 0.75,
                              borderRadius: 1,
                              height: '100%',
                              position: 'relative',
                              backgroundImage: slot.has_exception
                                ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.15) 5px, rgba(255,255,255,0.15) 10px)'
                                : undefined,
                            }}
                          >
                            {slot.has_exception && (
                              <Chip label="Exception" size="small" color="warning" sx={{ position: 'absolute', top: 2, right: 2, height: 18, fontSize: '0.6rem' }} />
                            )}
                            <Typography variant="caption" fontWeight="bold" display="block" noWrap>{slot.module?.name}</Typography>
                            <Typography variant="caption" display="block" noWrap sx={{ opacity: 0.9 }}>{slot.teacher?.name}</Typography>
                            <Typography variant="caption" display="block" noWrap sx={{ opacity: 0.9 }}>{slot.room?.name}</Typography>
                            <Chip label={slot.type} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', mt: 0.25 }} />
                          </Box>
                        ) : (
                          <Box sx={{ height: '100%', bgcolor: 'action.hover', borderRadius: 1, opacity: 0.3 }} />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Box>
          <TextField size="small" placeholder="Rechercher module ou enseignant..." value={searchText} onChange={(e) => setSearchText(e.target.value)} sx={{ mb: 2, width: 300 }} />
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><TableSortLabel active={sortField === 'day'} direction={sortField === 'day' ? sortDir : 'asc'} onClick={() => handleSort('day')}>Jour</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortField === 'time'} direction={sortField === 'time' ? sortDir : 'asc'} onClick={() => handleSort('time')}>Heure début</TableSortLabel></TableCell>
                  <TableCell>Heure fin</TableCell>
                  <TableCell><TableSortLabel active={sortField === 'module'} direction={sortField === 'module' ? sortDir : 'asc'} onClick={() => handleSort('module')}>Module</TableSortLabel></TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Enseignant</TableCell>
                  <TableCell>Salle</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSlots.map((s) => (
                  <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={(e) => handleSlotClick(e, s)}>
                    <TableCell>{s.day_of_week}</TableCell>
                    <TableCell>{s.start_time}</TableCell>
                    <TableCell>{s.end_time}</TableCell>
                    <TableCell><Typography fontWeight="bold" variant="body2">{s.module?.name}</Typography></TableCell>
                    <TableCell><Chip label={s.type} size="small" sx={{ bgcolor: SESSION_TYPE_COLORS[s.type], color: '#fff' }} /></TableCell>
                    <TableCell>{s.teacher?.name}</TableCell>
                    <TableCell>{s.room?.name}</TableCell>
                    <TableCell>{s.has_exception ? <Chip label="Exception" size="small" color="warning" /> : <Chip label="Normal" size="small" color="success" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Slot Detail Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {selectedSlot && (
          <Box sx={{ p: 2, minWidth: 280 }}>
            <Typography variant="h6" gutterBottom>{selectedSlot.module?.name}</Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2"><strong>Type:</strong> {selectedSlot.type}</Typography>
            <Typography variant="body2"><strong>Jour:</strong> {selectedSlot.day_of_week}</Typography>
            <Typography variant="body2"><strong>Horaire:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}</Typography>
            <Typography variant="body2"><strong>Enseignant:</strong> {selectedSlot.teacher?.name}</Typography>
            <Typography variant="body2"><strong>Salle:</strong> {selectedSlot.room?.name}</Typography>
            {selectedSlot.notes && <Typography variant="body2"><strong>Notes:</strong> {selectedSlot.notes}</Typography>}
            {selectedSlot.has_exception && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                <Typography variant="caption"><strong>Exception:</strong> {selectedSlot.exception_type}</Typography><br />
                <Typography variant="caption">{selectedSlot.exception_reason}</Typography>
              </Alert>
            )}
          </Box>
        )}
      </Popover>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
        <Chip label="CM - Cours Magistral" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.CM, color: '#fff' }} />
        <Chip label="TD - Travaux Dirigés" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.TD, color: '#fff' }} />
        <Chip label="TP - Travaux Pratiques" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.TP, color: '#fff' }} />
      </Box>
    </Box>
  );
};
