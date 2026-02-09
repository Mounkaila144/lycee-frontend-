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
import Paper from '@mui/material/Paper';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

import type { ViewMode, LoadStatus, UrgencyLevel, RecentChange } from '../../types';
import { DAYS, TIME_SLOTS, SESSION_TYPE_COLORS, LOAD_STATUS_CONFIG, URGENCY_CONFIG } from '../../types';

// ──── Demo Data ────

interface TeacherSlot {
  id: number;
  day: string;
  start: string;
  end: string;
  module: string;
  group: string;
  room: string;
  type: 'CM' | 'TD' | 'TP';
  has_exception?: boolean;
  exception_type?: string;
  exception_reason?: string;
}

const DEMO_TEACHER_SLOTS: TeacherSlot[] = [
  { id: 1, day: 'Lundi', start: '08:00', end: '10:00', module: 'Algorithmes', group: 'L3 Info G1', room: 'Amphi A', type: 'CM' },
  { id: 2, day: 'Lundi', start: '10:00', end: '12:00', module: 'Algorithmes', group: 'L3 Info G2', room: 'Amphi A', type: 'CM' },
  { id: 3, day: 'Mardi', start: '08:00', end: '10:00', module: 'Programmation Web', group: 'L3 Info G1', room: 'Labo Info-1', type: 'TP' },
  { id: 4, day: 'Mercredi', start: '10:00', end: '12:00', module: 'Programmation Web', group: 'L3 Info G2', room: 'Labo Info-1', type: 'TP', has_exception: true, exception_type: 'room_change', exception_reason: 'Déplacé en Labo Info-2 (maintenance)' },
  { id: 5, day: 'Jeudi', start: '08:00', end: '10:00', module: 'Algorithmes', group: 'L3 Info G1', room: 'Salle TD-101', type: 'TD' },
  { id: 6, day: 'Jeudi', start: '14:00', end: '16:00', module: 'Algorithmes', group: 'L3 Info G2', room: 'Salle TD-102', type: 'TD' },
  { id: 7, day: 'Vendredi', start: '10:00', end: '12:00', module: 'Programmation Web', group: 'M1 Info G1', room: 'Labo Info-2', type: 'TP' },
  { id: 8, day: 'Samedi', start: '08:00', end: '10:00', module: 'Algorithmes', group: 'M1 Info G1', room: 'Salle TD-102', type: 'TD' },
];

const DEMO_NEXT_CLASS = {
  module: 'Algorithmes',
  group: 'L3 Info G1',
  room: 'Amphi A',
  building: 'Bâtiment A',
  day: 'Lundi',
  date: '10/02/2025',
  start_time: '08:00',
  end_time: '10:00',
  minutes_until: 95,
  urgency: 'soon' as UrgencyLevel,
  has_exception: false,
};

const DEMO_CHANGES: RecentChange[] = [
  { id: 1, type: 'room_change', module: 'Programmation Web', day: 'Mercredi', date: '12/02/2025', description: 'Changement de salle', old_value: 'Labo Info-1', new_value: 'Labo Info-2', created_at: '2025-02-09', is_read: false },
  { id: 2, type: 'cancellation', module: 'Algorithmes', day: 'Samedi', date: '15/02/2025', description: 'Séance annulée', old_value: '08:00-10:00', created_at: '2025-02-08', is_read: true },
];

const CHANGE_ICONS: Record<string, string> = {
  cancellation: '🚫',
  room_change: '🔄',
  teacher_replacement: '👤',
  time_change: '📅',
};

// ──── Main Component ────

export const TeacherTimetableView: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [weekOffset, setWeekOffset] = useState(0);
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Week label
  const today = new Date();
  const weekStart = new Date(today);

  weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const weekEnd = new Date(weekStart);

  weekEnd.setDate(weekStart.getDate() + 5);

  const weekLabel = `Semaine du ${weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} au ${weekEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

  // Filtered slots
  const filteredSlots = useMemo(() => {
    let slots = [...DEMO_TEACHER_SLOTS];

    if (filterModule !== 'all') slots = slots.filter((s) => s.module === filterModule);
    if (filterType !== 'all') slots = slots.filter((s) => s.type === filterType);

    return slots;
  }, [filterModule, filterType]);

  // Stats
  const stats = useMemo(() => {
    const totalHours = DEMO_TEACHER_SLOTS.length * 2;
    const cmHours = DEMO_TEACHER_SLOTS.filter((s) => s.type === 'CM').length * 2;
    const tdHours = DEMO_TEACHER_SLOTS.filter((s) => s.type === 'TD').length * 2;
    const tpHours = DEMO_TEACHER_SLOTS.filter((s) => s.type === 'TP').length * 2;
    const groups = [...new Set(DEMO_TEACHER_SLOTS.map((s) => s.group))];
    const loadStatus: LoadStatus = totalHours < 20 ? 'normal' : totalHours <= 30 ? 'elevated' : 'high';

    return { totalHours, cmHours, tdHours, tpHours, groups, loadStatus };
  }, []);

  const modules = [...new Set(DEMO_TEACHER_SLOTS.map((s) => s.module))];
  const unreadChanges = DEMO_CHANGES.filter((c) => !c.is_read).length;

  const getSlotForCell = (day: string, timeSlot: { start: string }) => {
    return filteredSlots.find((s) => s.day === day && s.start === timeSlot.start);
  };

  const urgencyInfo = URGENCY_CONFIG[DEMO_NEXT_CLASS.urgency];

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Mon Emploi du Temps</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Typography variant="h4" fontWeight="bold">Mon Emploi du Temps</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<span>🗓️</span>} onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>
            Planification
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>⚡</span>} onClick={() => router.push(`/${lang}/admin/timetable/exceptions`)}>
            Exceptions
          </Button>
        </Box>
      </Box>
      <Chip label={`Vous enseignez à ${stats.groups.length} groupes différents`} size="small" color="info" sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Next Class Card */}
          <Card sx={{ mb: 3, borderLeft: 4, borderColor: urgencyInfo.color }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Prochain cours</Typography>
                  <Typography variant="h6" fontWeight="bold">{DEMO_NEXT_CLASS.module}</Typography>
                  <Typography variant="body2">
                    {DEMO_NEXT_CLASS.day} {DEMO_NEXT_CLASS.date} | {DEMO_NEXT_CLASS.start_time} - {DEMO_NEXT_CLASS.end_time}
                  </Typography>
                  <Typography variant="body2">
                    Salle: <strong>{DEMO_NEXT_CLASS.room}</strong> ({DEMO_NEXT_CLASS.building}) | Groupe: <strong>{DEMO_NEXT_CLASS.group}</strong>
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label={DEMO_NEXT_CLASS.minutes_until < 60 ? `${DEMO_NEXT_CLASS.minutes_until} min` : `${Math.floor(DEMO_NEXT_CLASS.minutes_until / 60)}h${DEMO_NEXT_CLASS.minutes_until % 60}`}
                    sx={{ bgcolor: urgencyInfo.color, color: '#fff', fontWeight: 'bold', fontSize: '1rem', height: 36 }}
                  />
                  <Typography variant="caption" display="block" color="text.secondary">avant le cours</Typography>
                </Box>
              </Box>
              {DEMO_NEXT_CLASS.has_exception && (
                <Alert severity="error" sx={{ mt: 1 }}>Exception active sur ce cours</Alert>
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Module</InputLabel>
              <Select value={filterModule} label="Module" onChange={(e) => setFilterModule(e.target.value)}>
                <MenuItem value="all">Tous les modules</MenuItem>
                {modules.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="CM">CM</MenuItem>
                <MenuItem value="TD">TD</MenuItem>
                <MenuItem value="TP">TP</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ flex: 1 }} />
            <Button size="small" variant="outlined">Export PDF</Button>
            <Button size="small" variant="outlined">Export iCal</Button>
            <Button size="small" variant="outlined">Export Excel</Button>
          </Box>

          {/* Week Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={() => setWeekOffset((o) => o - 1)} size="small">{'<'}</IconButton>
            <Button size="small" variant="text" onClick={() => setWeekOffset(0)}>Semaine actuelle</Button>
            <Typography variant="body2" fontWeight="bold">{weekLabel}</Typography>
            <IconButton onClick={() => setWeekOffset((o) => o + 1)} size="small">{'>'}</IconButton>
          </Box>

          {/* Weekly Grid */}
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
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', verticalAlign: 'top' }}>
                      {ts.start}<br />{ts.end}
                    </TableCell>
                    {DAYS.map((day) => {
                      const slot = getSlotForCell(day, ts);

                      return (
                        <TableCell key={day} sx={{ p: 0.5, height: 85, verticalAlign: 'top' }}>
                          {slot ? (
                            <Box sx={{
                              bgcolor: SESSION_TYPE_COLORS[slot.type],
                              color: '#fff',
                              p: 0.75,
                              borderRadius: 1,
                              height: '100%',
                              position: 'relative',
                              backgroundImage: slot.has_exception ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.15) 5px, rgba(255,255,255,0.15) 10px)' : undefined,
                            }}>
                              {slot.has_exception && (
                                <Chip label="!" size="small" color="warning" sx={{ position: 'absolute', top: 2, right: 2, height: 18, minWidth: 18, fontSize: '0.6rem' }} />
                              )}
                              <Typography variant="caption" fontWeight="bold" display="block" noWrap>{slot.module}</Typography>
                              <Typography variant="caption" display="block" noWrap sx={{ opacity: 0.9 }}>{slot.group}</Typography>
                              <Typography variant="caption" display="block" noWrap sx={{ opacity: 0.9 }}>{slot.room}</Typography>
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

          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
            <Chip label="CM" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.CM, color: '#fff' }} />
            <Chip label="TD" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.TD, color: '#fff' }} />
            <Chip label="TP" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.TP, color: '#fff' }} />
          </Box>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Stats Card */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Charge d'enseignement</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" fontWeight="bold" color={LOAD_STATUS_CONFIG[stats.loadStatus].color}>{stats.totalHours}h</Typography>
                <Chip label={LOAD_STATUS_CONFIG[stats.loadStatus].label} size="small" sx={{ bgcolor: LOAD_STATUS_CONFIG[stats.loadStatus].color, color: '#fff' }} />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">CM</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.cmHours}h</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">TD</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.tdHours}h</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">TP</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.tpHours}h</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">Groupes enseignés: <strong>{stats.groups.length}</strong></Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                {stats.groups.map((g) => <Chip key={g} label={g} size="small" variant="outlined" />)}
              </Box>
            </CardContent>
          </Card>

          {/* Recent Changes */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Modifications récentes</Typography>
                {unreadChanges > 0 && (
                  <Badge badgeContent={unreadChanges} color="warning">
                    <Chip label="Nouveaux" size="small" color="warning" variant="outlined" />
                  </Badge>
                )}
              </Box>
              <List dense>
                {DEMO_CHANGES.map((change) => (
                  <ListItem key={change.id} sx={{ px: 0, opacity: change.is_read ? 0.6 : 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Typography variant="body1">{CHANGE_ICONS[change.type] || '?'}</Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={change.is_read ? 'normal' : 'bold'}>
                          {change.module} - {change.day} {change.date}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">{change.description}</Typography>
                          {change.old_value && change.new_value && (
                            <Typography variant="caption" display="block">{change.old_value} → <strong>{change.new_value}</strong></Typography>
                          )}
                        </Box>
                      }
                    />
                    {!change.is_read && (
                      <Button size="small" variant="text" sx={{ fontSize: '0.65rem', minWidth: 'auto' }}>Lu</Button>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
