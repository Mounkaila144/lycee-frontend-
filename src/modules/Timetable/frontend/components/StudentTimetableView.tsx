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

import type { UrgencyLevel, RecentChange } from '../../types';
import { DAYS, TIME_SLOTS, SESSION_TYPE_COLORS, URGENCY_CONFIG } from '../../types';

// ──── Demo Data ────

interface StudentSlot {
  id: number;
  day: string;
  start: string;
  end: string;
  module: string;
  teacher: string;
  room: string;
  building: string;
  type: 'CM' | 'TD' | 'TP';
  group: string;
  has_exception?: boolean;
  exception_type?: string;
  exception_reason?: string;
}

const DEMO_STUDENT_SLOTS: StudentSlot[] = [
  { id: 1, day: 'Lundi', start: '08:00', end: '10:00', module: 'Algorithmes', teacher: 'Dr. Dupont', room: 'Amphi A', building: 'Bât. A', type: 'CM', group: 'L3 Info G1' },
  { id: 2, day: 'Lundi', start: '10:00', end: '12:00', module: 'Base de données', teacher: 'Prof. Martin', room: 'Salle TD-101', building: 'Bât. B', type: 'TD', group: 'L3 Info G1' },
  { id: 3, day: 'Mardi', start: '08:00', end: '10:00', module: 'Réseaux', teacher: 'Dr. Bernard', room: 'Labo Info-1', building: 'Bât. C', type: 'TP', group: 'L3 Info G1' },
  { id: 4, day: 'Mardi', start: '14:00', end: '16:00', module: 'Systèmes d\'exploitation', teacher: 'Prof. Petit', room: 'Amphi A', building: 'Bât. A', type: 'CM', group: 'L3 Info G1' },
  { id: 5, day: 'Mercredi', start: '10:00', end: '12:00', module: 'Programmation Web', teacher: 'Dr. Dupont', room: 'Labo Info-1', building: 'Bât. C', type: 'TP', group: 'L3 Info G1', has_exception: true, exception_type: 'room_change', exception_reason: 'Déplacé en Labo Info-2' },
  { id: 6, day: 'Mercredi', start: '14:00', end: '16:00', module: 'Mathématiques', teacher: 'Prof. Martin', room: 'Amphi A', building: 'Bât. A', type: 'CM', group: 'L3 Info G1' },
  { id: 7, day: 'Jeudi', start: '08:00', end: '10:00', module: 'Algorithmes', teacher: 'Dr. Dupont', room: 'Salle TD-101', building: 'Bât. B', type: 'TD', group: 'L3 Info G1' },
  { id: 8, day: 'Jeudi', start: '14:00', end: '16:00', module: 'Base de données', teacher: 'Prof. Martin', room: 'Labo Info-1', building: 'Bât. C', type: 'TP', group: 'L3 Info G1' },
  { id: 9, day: 'Vendredi', start: '10:00', end: '12:00', module: 'Réseaux', teacher: 'Dr. Bernard', room: 'Salle TD-102', building: 'Bât. B', type: 'TD', group: 'L3 Info G1' },
];

const DEMO_NEXT_CLASS = {
  module: 'Algorithmes',
  teacher: 'Dr. Dupont',
  room: 'Amphi A',
  building: 'Bâtiment A, RDC',
  day: 'Lundi',
  date: '10/02/2025',
  start_time: '08:00',
  end_time: '10:00',
  minutes_until: 25,
  urgency: 'urgent' as UrgencyLevel,
  has_exception: false,
};

const DEMO_CHANGES: RecentChange[] = [
  { id: 1, type: 'room_change', module: 'Programmation Web', day: 'Mercredi', date: '12/02/2025', description: 'Changement de salle', old_value: 'Labo Info-1', new_value: 'Labo Info-2', created_at: '2025-02-09', is_read: false },
  { id: 2, type: 'cancellation', module: 'Réseaux TD', day: 'Vendredi', date: '14/02/2025', description: 'Séance annulée - enseignant absent', created_at: '2025-02-10', is_read: false },
  { id: 3, type: 'time_change', module: 'Mathématiques', day: 'Mercredi', date: '12/02/2025', description: 'Report du cours', old_value: '14:00-16:00', new_value: '16:00-18:00', created_at: '2025-02-07', is_read: true },
];

const CHANGE_ICONS: Record<string, { icon: string; color: string }> = {
  cancellation: { icon: '🚫', color: '#f44336' },
  room_change: { icon: '🔄', color: '#ff9800' },
  teacher_replacement: { icon: '👤', color: '#2196f3' },
  time_change: { icon: '📅', color: '#2196f3' },
};

// ──── Main Component ────

export const StudentTimetableView: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [weekOffset, setWeekOffset] = useState(0);

  // Week label
  const today = new Date();
  const weekStart = new Date(today);

  weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const weekEnd = new Date(weekStart);

  weekEnd.setDate(weekStart.getDate() + 4);

  const weekLabel = `${weekStart.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })} - ${weekEnd.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`;

  const totalHours = DEMO_STUDENT_SLOTS.length * 2;
  const totalSessions = DEMO_STUDENT_SLOTS.length;
  const unreadChanges = DEMO_CHANGES.filter((c) => !c.is_read).length;
  const urgencyInfo = URGENCY_CONFIG[DEMO_NEXT_CLASS.urgency];

  const getSlotForCell = (day: string, timeSlot: { start: string }) => {
    return DEMO_STUDENT_SLOTS.find((s) => s.day === day && s.start === timeSlot.start);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Typography color="text.primary">Mon Emploi du Temps</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Typography variant="h4" fontWeight="bold">Mon Emploi du Temps</Typography>
        <Button size="small" variant="outlined" startIcon={<span>👥</span>} onClick={() => router.push(`/${lang}/admin/timetable/group-view`)}>
          EDT de mon groupe
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>L3 Informatique - Groupe 1 | S1 2024-2025 | {totalSessions} séances, {totalHours}h/semaine</Typography>

      {/* Notifications Banner */}
      {unreadChanges > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} action={<Button size="small" color="inherit">Tout marquer comme lu</Button>}>
          <strong>{unreadChanges} changement(s) cette semaine</strong> - Vérifiez les modifications ci-dessous
        </Alert>
      )}

      {/* Next Class Card - Priority Widget */}
      <Card sx={{ mb: 3, borderLeft: 6, borderColor: urgencyInfo.color, bgcolor: `${urgencyInfo.color}08` }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">Prochain cours</Typography>
              <Typography variant="h5" fontWeight="bold">{DEMO_NEXT_CLASS.module}</Typography>
              <Typography variant="body1">
                {DEMO_NEXT_CLASS.day} {DEMO_NEXT_CLASS.date} | {DEMO_NEXT_CLASS.start_time} - {DEMO_NEXT_CLASS.end_time}
              </Typography>
              <Typography variant="body1">
                Enseignant: <strong>{DEMO_NEXT_CLASS.teacher}</strong>
              </Typography>
              <Typography variant="body1">
                Salle: <strong>{DEMO_NEXT_CLASS.room}</strong> ({DEMO_NEXT_CLASS.building})
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ bgcolor: urgencyInfo.color, color: '#fff', borderRadius: 2, p: 2, display: 'inline-block', minWidth: 120 }}>
                <Typography variant="h3" fontWeight="bold">
                  {DEMO_NEXT_CLASS.minutes_until < 60 ? DEMO_NEXT_CLASS.minutes_until : Math.floor(DEMO_NEXT_CLASS.minutes_until / 60)}
                </Typography>
                <Typography variant="body2">
                  {DEMO_NEXT_CLASS.minutes_until < 60 ? 'minutes' : `h${DEMO_NEXT_CLASS.minutes_until % 60} min`}
                </Typography>
              </Box>
              {DEMO_NEXT_CLASS.has_exception && (
                <Chip label="Exception active" color="error" sx={{ mt: 1 }} />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Week Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => setWeekOffset((o) => o - 1)} size="small">{'<'}</IconButton>
        <Button size="small" variant="text" onClick={() => setWeekOffset(0)}>Semaine actuelle</Button>
        <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{weekLabel}</Typography>
        <IconButton onClick={() => setWeekOffset((o) => o + 1)} size="small">{'>'}</IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Weekly Grid */}
        <Grid item xs={12} md={9}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Heure</TableCell>
                  {DAYS.slice(0, 5).map((day) => (
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
                    {DAYS.slice(0, 5).map((day) => {
                      const slot = getSlotForCell(day, ts);

                      return (
                        <TableCell key={day} sx={{ p: 0.5, height: 95, verticalAlign: 'top' }}>
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
                                <Chip label="Modifié" size="small" color="warning" sx={{ position: 'absolute', top: 2, right: 2, height: 18, fontSize: '0.55rem' }} />
                              )}
                              <Typography variant="caption" fontWeight="bold" display="block" sx={{ fontSize: '0.8rem' }}>{slot.module}</Typography>
                              <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>{slot.teacher}</Typography>
                              <Typography variant="caption" display="block" fontWeight="bold" sx={{ opacity: 0.95 }}>{slot.room}</Typography>
                              <Chip label={slot.type} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', mt: 0.25 }} />
                            </Box>
                          ) : (
                            <Box sx={{ height: '100%', bgcolor: 'action.hover', borderRadius: 1, opacity: 0.2 }} />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Legend & Export */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="CM" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.CM, color: '#fff' }} />
              <Chip label="TD" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.TD, color: '#fff' }} />
              <Chip label="TP" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.TP, color: '#fff' }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined">Export PDF</Button>
              <Button size="small" variant="outlined">Export iCal</Button>
            </Box>
          </Box>
        </Grid>

        {/* Right Sidebar - Notifications */}
        <Grid item xs={12} md={3}>
          {/* Quick Summary */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="subtitle2" gutterBottom>Cette semaine</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Total</Typography>
                <Typography variant="body2" fontWeight="bold">{totalHours}h</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Séances</Typography>
                <Typography variant="body2" fontWeight="bold">{totalSessions}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: SESSION_TYPE_COLORS.CM }} fontWeight="bold">
                    {DEMO_STUDENT_SLOTS.filter((s) => s.type === 'CM').length * 2}h
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">CM</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: SESSION_TYPE_COLORS.TD }} fontWeight="bold">
                    {DEMO_STUDENT_SLOTS.filter((s) => s.type === 'TD').length * 2}h
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">TD</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: SESSION_TYPE_COLORS.TP }} fontWeight="bold">
                    {DEMO_STUDENT_SLOTS.filter((s) => s.type === 'TP').length * 2}h
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">TP</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Modifications</Typography>
                {unreadChanges > 0 && <Badge badgeContent={unreadChanges} color="error" />}
              </Box>
              <List dense sx={{ p: 0 }}>
                {DEMO_CHANGES.map((change) => {
                  const changeInfo = CHANGE_ICONS[change.type] || { icon: '?', color: '#999' };

                  return (
                    <ListItem key={change.id} sx={{ px: 0, py: 0.5, opacity: change.is_read ? 0.5 : 1, borderLeft: 3, borderColor: changeInfo.color, pl: 1, mb: 0.5, borderRadius: 1, bgcolor: change.is_read ? 'transparent' : `${changeInfo.color}08` }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <Typography>{changeInfo.icon}</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="caption" fontWeight={change.is_read ? 'normal' : 'bold'}>{change.module}</Typography>}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">{change.day} {change.date}</Typography>
                            <Typography variant="caption">{change.description}</Typography>
                            {change.old_value && change.new_value && (
                              <Typography variant="caption" display="block" fontWeight="bold">{change.old_value} → {change.new_value}</Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
