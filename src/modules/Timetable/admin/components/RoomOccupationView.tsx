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
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import { DAYS, TIME_SLOTS, SESSION_TYPE_COLORS } from '../../types';

// ──── Demo Data ────

const DEMO_ROOMS = [
  { id: 1, name: 'Amphithéâtre A', code: 'AMP-A', type: 'Amphithéâtre', capacity: 200, building: 'Bâtiment A', floor: 'RDC', equipment: ['Projecteur', 'Microphone'] },
  { id: 2, name: 'Salle TD-101', code: 'TD-101', type: 'Salle TD', capacity: 40, building: 'Bâtiment B', floor: '1er', equipment: ['Projecteur', 'Tableau interactif'] },
  { id: 3, name: 'Labo Info-1', code: 'LAB-I1', type: 'Laboratoire', capacity: 30, building: 'Bâtiment C', floor: 'RDC', equipment: ['Ordinateurs', 'Projecteur', 'Climatisation'] },
  { id: 4, name: 'Salle TD-102', code: 'TD-102', type: 'Salle TD', capacity: 45, building: 'Bâtiment B', floor: '1er', equipment: ['Projecteur'] },
];

interface OccupiedSlot {
  day: string;
  start: string;
  end: string;
  module: string;
  teacher: string;
  group: string;
  type: string;
}

const DEMO_OCCUPATION: Record<number, OccupiedSlot[]> = {
  1: [
    { day: 'Lundi', start: '08:00', end: '10:00', module: 'Algorithmes', teacher: 'Dr. Dupont', group: 'L3 Info G1', type: 'CM' },
    { day: 'Mardi', start: '14:00', end: '16:00', module: 'SE', teacher: 'Prof. Petit', group: 'L3 Info G1', type: 'CM' },
    { day: 'Mercredi', start: '14:00', end: '16:00', module: 'Mathématiques', teacher: 'Prof. Martin', group: 'L3 Info G1', type: 'CM' },
    { day: 'Jeudi', start: '08:00', end: '10:00', module: 'Physique', teacher: 'Dr. Leroy', group: 'M1 Info G1', type: 'CM' },
    { day: 'Jeudi', start: '10:00', end: '12:00', module: 'Chimie', teacher: 'Prof. Durand', group: 'L2 Chimie', type: 'CM' },
    { day: 'Vendredi', start: '08:00', end: '10:00', module: 'Statistiques', teacher: 'Dr. Morel', group: 'L3 Math', type: 'CM' },
  ],
  3: [
    { day: 'Lundi', start: '08:00', end: '10:00', module: 'Programmation C', teacher: 'Dr. Dupont', group: 'L2 Info G1', type: 'TP' },
    { day: 'Lundi', start: '10:00', end: '12:00', module: 'Programmation C', teacher: 'Dr. Dupont', group: 'L2 Info G2', type: 'TP' },
    { day: 'Mardi', start: '08:00', end: '10:00', module: 'Réseaux', teacher: 'Dr. Bernard', group: 'L3 Info G1', type: 'TP' },
    { day: 'Mardi', start: '10:00', end: '12:00', module: 'Réseaux', teacher: 'Dr. Bernard', group: 'L3 Info G2', type: 'TP' },
    { day: 'Mercredi', start: '10:00', end: '12:00', module: 'Web', teacher: 'Dr. Dupont', group: 'L3 Info G1', type: 'TP' },
    { day: 'Jeudi', start: '08:00', end: '10:00', module: 'BDD', teacher: 'Prof. Martin', group: 'L3 Info G1', type: 'TP' },
    { day: 'Jeudi', start: '10:00', end: '12:00', module: 'BDD', teacher: 'Prof. Martin', group: 'L3 Info G2', type: 'TP' },
    { day: 'Jeudi', start: '14:00', end: '16:00', module: 'BDD', teacher: 'Prof. Martin', group: 'L3 Info G1', type: 'TP' },
    { day: 'Vendredi', start: '08:00', end: '10:00', module: 'Java', teacher: 'Dr. Leroy', group: 'M1 Info G1', type: 'TP' },
  ],
};

// ──── Main Component ────

export const RoomOccupationView: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [roomId, setRoomId] = useState(1);
  const [weekOffset, setWeekOffset] = useState(0);

  const room = DEMO_ROOMS.find((r) => r.id === roomId)!;
  const occupation = DEMO_OCCUPATION[roomId] || [];

  // Week label
  const today = new Date();
  const weekStart = new Date(today);

  weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const weekEnd = new Date(weekStart);

  weekEnd.setDate(weekStart.getDate() + 5);

  const weekLabel = `Semaine du ${weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} au ${weekEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

  // Calculate stats
  const totalAvailable = 24; // 6 days × 4 slots
  const totalOccupied = occupation.length;
  const occupationRate = Math.round((totalOccupied / totalAvailable) * 100);
  const totalHoursOccupied = totalOccupied * 2;
  const totalHoursAvailable = totalAvailable * 2;

  // Available slots
  const availableSlots = useMemo(() => {
    const available: Array<{ day: string; start: string; end: string }> = [];

    DAYS.forEach((day) => {
      TIME_SLOTS.forEach((ts) => {
        const isOccupied = occupation.some((o) => o.day === day && o.start === ts.start);

        if (!isOccupied) {
          available.push({ day, start: ts.start, end: ts.end });
        }
      });
    });

    return available;
  }, [occupation]);

  // Daily occupation for bar chart
  const dailyOccupation = useMemo(() => {
    return DAYS.map((day) => ({
      day,
      count: occupation.filter((o) => o.day === day).length,
      rate: Math.round((occupation.filter((o) => o.day === day).length / 4) * 100),
    }));
  }, [occupation]);

  // Status badge
  const statusColor = occupationRate < 30 ? 'warning' : occupationRate > 90 ? 'error' : 'success';
  const statusLabel = occupationRate < 30 ? 'Sous-utilisée' : occupationRate > 90 ? 'Très occupée' : occupationRate > 60 ? 'Bien utilisée' : 'Partiellement occupée';

  const getSlotForCell = (day: string, timeSlot: { start: string }) => {
    return occupation.find((o) => o.day === day && o.start === timeSlot.start);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Occupation Salle</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Occupation des Salles</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<span>🏫</span>} onClick={() => router.push(`/${lang}/admin/timetable/rooms`)}>
            Gestion des Salles
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>🗓️</span>} onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>
            Planification
          </Button>
        </Box>
      </Box>

      {/* Room Selection */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Salle</InputLabel>
          <Select value={roomId} label="Salle" onChange={(e) => setRoomId(e.target.value as number)}>
            {DEMO_ROOMS.map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.code} - {r.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Semestre</InputLabel>
          <Select value={1} label="Semestre">
            <MenuItem value={1}>S1 2024-2025</MenuItem>
            <MenuItem value={2}>S2 2024-2025</MenuItem>
          </Select>
        </FormControl>
        <Chip label={statusLabel} color={statusColor as 'warning' | 'error' | 'success'} />
        <Button size="small" variant="outlined">Export PDF</Button>
      </Box>

      {/* Room Info Card */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle2">{room.name}</Typography>
              <Typography variant="caption" color="text.secondary">{room.type} - {room.building}, {room.floor}</Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="caption" color="text.secondary">Capacité</Typography>
              <Typography variant="body2" fontWeight="bold">{room.capacity} places</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Équipements</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {room.equipment.map((eq) => <Chip key={eq} label={eq} size="small" variant="outlined" />)}
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">Taux d'occupation</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress variant="determinate" value={occupationRate} sx={{ flex: 1, height: 10, borderRadius: 5 }} color={statusColor as 'warning' | 'error' | 'success'} />
                <Typography variant="body2" fontWeight="bold">{occupationRate}%</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">{totalHoursOccupied}h / {totalHoursAvailable}h</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      {occupationRate < 30 && (
        <Alert severity="info" sx={{ mb: 2 }}>Salle sous-utilisée ({occupationRate}%). Envisagez de réaffecter certaines séances d'autres salles similaires ici.</Alert>
      )}
      {occupationRate > 90 && (
        <Alert severity="warning" sx={{ mb: 2 }}>Capacité quasi maximale ({occupationRate}%). Envisagez de répartir certaines séances dans des salles alternatives.</Alert>
      )}

      {/* Week Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => setWeekOffset((o) => o - 1)} size="small">{'<'}</IconButton>
        <Button size="small" variant="text" onClick={() => setWeekOffset(0)}>Semaine actuelle</Button>
        <Typography variant="body2" fontWeight="bold">{weekLabel}</Typography>
        <IconButton onClick={() => setWeekOffset((o) => o + 1)} size="small">{'>'}</IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Weekly Grid */}
        <Grid item xs={12} md={8}>
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
                        <TableCell key={day} sx={{ p: 0.5, height: 80, verticalAlign: 'top' }}>
                          {slot ? (
                            <Box sx={{
                              bgcolor: SESSION_TYPE_COLORS[slot.type as keyof typeof SESSION_TYPE_COLORS] || '#999',
                              color: '#fff',
                              p: 0.75,
                              borderRadius: 1,
                              height: '100%',
                            }}>
                              <Typography variant="caption" fontWeight="bold" display="block" noWrap>{slot.module}</Typography>
                              <Typography variant="caption" display="block" noWrap sx={{ opacity: 0.9 }}>{slot.teacher}</Typography>
                              <Typography variant="caption" display="block" noWrap sx={{ opacity: 0.9 }}>{slot.group}</Typography>
                            </Box>
                          ) : (
                            <Box sx={{ height: '100%', bgcolor: '#e8f5e9', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="caption" color="success.main">Libre</Typography>
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Right: Stats & Available Slots */}
        <Grid item xs={12} md={4}>
          {/* Daily Occupation */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Occupation par jour</Typography>
              {dailyOccupation.map((d) => (
                <Box key={d.day} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">{d.day}</Typography>
                    <Typography variant="caption" fontWeight="bold">{d.count}/4 ({d.rate}%)</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={d.rate}
                    sx={{ height: 6, borderRadius: 3 }}
                    color={d.rate > 75 ? 'error' : d.rate > 50 ? 'warning' : 'success'}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Type Breakdown */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Répartition par type</Typography>
              {(['CM', 'TD', 'TP'] as const).map((type) => {
                const count = occupation.filter((o) => o.type === type).length;

                return (
                  <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Chip label={type} size="small" sx={{ bgcolor: SESSION_TYPE_COLORS[type], color: '#fff' }} />
                    <Typography variant="body2">{count * 2}h ({count} séances)</Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>

          {/* Available Slots */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Créneaux libres ({availableSlots.length})
              </Typography>
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {availableSlots.slice(0, 10).map((s, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                    <ListItemText
                      primary={<Typography variant="caption">{s.day} {s.start}-{s.end}</Typography>}
                    />
                  </ListItem>
                ))}
                {availableSlots.length > 10 && (
                  <ListItem disablePadding>
                    <ListItemText primary={<Typography variant="caption" color="text.secondary">+{availableSlots.length - 10} autres créneaux...</Typography>} />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
