'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
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
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { RoomFormDialog } from './RoomFormDialog';
import type { Room, RoomType } from '../../types';
import { ROOM_TYPES } from '../../types';

// ──── Demo Data ────

const DEMO_ROOMS: Room[] = [
  { id: 1, code: 'AMP-A', name: 'Amphithéâtre A', type: 'Amphithéâtre', capacity: 200, building: 'Bâtiment A', floor: 'RDC', equipment: ['Projecteur', 'Microphone'], is_available: true, occupation_rate: 65, created_at: '', updated_at: '' },
  { id: 2, code: 'AMP-B', name: 'Amphithéâtre B', type: 'Amphithéâtre', capacity: 150, building: 'Bâtiment A', floor: 'RDC', equipment: ['Projecteur', 'Microphone', 'Caméra'], is_available: true, occupation_rate: 45, created_at: '', updated_at: '' },
  { id: 3, code: 'TD-101', name: 'Salle TD-101', type: 'Salle TD', capacity: 40, building: 'Bâtiment B', floor: '1er', equipment: ['Projecteur', 'Tableau interactif'], is_available: true, occupation_rate: 80, created_at: '', updated_at: '' },
  { id: 4, code: 'TD-102', name: 'Salle TD-102', type: 'Salle TD', capacity: 45, building: 'Bâtiment B', floor: '1er', equipment: ['Projecteur'], is_available: true, occupation_rate: 55, created_at: '', updated_at: '' },
  { id: 5, code: 'TD-201', name: 'Salle TD-201', type: 'Salle TD', capacity: 35, building: 'Bâtiment B', floor: '2ème', equipment: ['Projecteur', 'Climatisation'], is_available: false, unavailable_reason: 'Rénovation', unavailable_from: '2025-01-15', unavailable_to: '2025-02-15', occupation_rate: 0, created_at: '', updated_at: '' },
  { id: 6, code: 'LAB-I1', name: 'Labo Info-1', type: 'Laboratoire Informatique', capacity: 30, building: 'Bâtiment C', floor: 'RDC', equipment: ['Ordinateurs', 'Projecteur', 'Climatisation'], is_available: true, occupation_rate: 90, created_at: '', updated_at: '' },
  { id: 7, code: 'LAB-I2', name: 'Labo Info-2', type: 'Laboratoire Informatique', capacity: 25, building: 'Bâtiment C', floor: 'RDC', equipment: ['Ordinateurs', 'Projecteur'], is_available: true, occupation_rate: 70, created_at: '', updated_at: '' },
  { id: 8, code: 'LAB-S1', name: 'Labo Sciences-1', type: 'Laboratoire Sciences', capacity: 20, building: 'Bâtiment D', floor: 'RDC', equipment: ['Projecteur'], is_available: true, occupation_rate: 30, created_at: '', updated_at: '' },
];

// ──── Summary Card ────

const SummaryCard: React.FC<{ title: string; value: string | number; color?: string }> = ({ title, value, color }) => (
  <Card>
    <CardContent sx={{ textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ color }}>{value}</Typography>
    </CardContent>
  </Card>
);

// ──── Main Dashboard ────

export const RoomManagementDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [rooms, setRooms] = useState<Room[]>(DEMO_ROOMS);
  const [filterType, setFilterType] = useState<string>('');
  const [filterCapacity, setFilterCapacity] = useState<string>('');
  const [filterBuilding, setFilterBuilding] = useState<string>('');
  const [filterAvailability, setFilterAvailability] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | undefined>();
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockRoomId, setBlockRoomId] = useState<number>(0);
  const [blockReason, setBlockReason] = useState('');
  const [blockFrom, setBlockFrom] = useState('');
  const [blockTo, setBlockTo] = useState('');

  const filteredRooms = rooms.filter((r) => {
    if (filterType && r.type !== filterType) return false;
    if (filterCapacity && r.capacity < Number(filterCapacity)) return false;
    if (filterBuilding && !r.building?.toLowerCase().includes(filterBuilding.toLowerCase())) return false;
    if (filterAvailability === 'available' && !r.is_available) return false;
    if (filterAvailability === 'unavailable' && r.is_available) return false;

    return true;
  });

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.is_available).length;
  const maintenanceRooms = rooms.filter((r) => !r.is_available).length;
  const avgOccupation = Math.round(rooms.filter((r) => r.is_available).reduce((acc, r) => acc + (r.occupation_rate || 0), 0) / availableRooms);

  const handleSaveRoom = (data: Partial<Room>) => {
    if (editRoom) {
      setRooms((prev) => prev.map((r) => (r.id === editRoom.id ? { ...r, ...data } : r)));
    } else {
      setRooms((prev) => [...prev, { ...data, id: Date.now(), is_available: true, occupation_rate: 0, equipment: data.equipment || [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Room]);
    }

    setFormOpen(false);
    setEditRoom(undefined);
  };

  const handleBlock = (id: number) => {
    setBlockRoomId(id);
    setBlockReason('');
    setBlockFrom('');
    setBlockTo('');
    setBlockDialogOpen(true);
  };

  const confirmBlock = () => {
    setRooms((prev) => prev.map((r) =>
      r.id === blockRoomId ? { ...r, is_available: false, unavailable_reason: blockReason, unavailable_from: blockFrom, unavailable_to: blockTo, occupation_rate: 0 } : r,
    ));
    setBlockDialogOpen(false);
  };

  const handleUnblock = (id: number) => {
    setRooms((prev) => prev.map((r) =>
      r.id === id ? { ...r, is_available: true, unavailable_reason: undefined, unavailable_from: undefined, unavailable_to: undefined } : r,
    ));
  };

  const handleDelete = (id: number) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const occupationColor = (rate: number) => {
    if (rate >= 80) return 'error';
    if (rate >= 50) return 'warning';

    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Gestion des Salles</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Gestion des Salles</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<span>📊</span>} onClick={() => router.push(`/${lang}/admin/timetable/room-occupation`)}>
            Voir l'occupation détaillée
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>🗓️</span>} onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>
            Planification
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Total Salles" value={totalRooms} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Disponibles" value={availableRooms} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="En maintenance" value={maintenanceRooms} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Occupation moyenne" value={`${avgOccupation}%`} color="#1976d2" />
        </Grid>
      </Grid>

      {/* Filters + Add Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
            <MenuItem value="">Tous</MenuItem>
            {ROOM_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" label="Capacité min" type="number" value={filterCapacity} onChange={(e) => setFilterCapacity(e.target.value)} sx={{ width: 130 }} />
        <TextField size="small" label="Bâtiment" value={filterBuilding} onChange={(e) => setFilterBuilding(e.target.value)} sx={{ width: 140 }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Disponibilité</InputLabel>
          <Select value={filterAvailability} label="Disponibilité" onChange={(e) => setFilterAvailability(e.target.value)}>
            <MenuItem value="">Toutes</MenuItem>
            <MenuItem value="available">Disponibles</MenuItem>
            <MenuItem value="unavailable">Indisponibles</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={() => { setEditRoom(undefined); setFormOpen(true); }}>
          + Ajouter une salle
        </Button>
      </Box>

      {/* Rooms Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">Capacité</TableCell>
              <TableCell>Bâtiment</TableCell>
              <TableCell>Étage</TableCell>
              <TableCell>Équipements</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell align="center">Occupation</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRooms.map((room) => (
              <TableRow key={room.id} hover>
                <TableCell><Typography variant="body2" fontWeight="bold">{room.code}</Typography></TableCell>
                <TableCell>{room.name}</TableCell>
                <TableCell><Chip label={room.type} size="small" variant="outlined" /></TableCell>
                <TableCell align="center">{room.capacity}</TableCell>
                <TableCell>{room.building || '-'}</TableCell>
                <TableCell>{room.floor || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {room.equipment.map((eq) => <Chip key={eq} label={eq} size="small" sx={{ fontSize: '0.65rem' }} />)}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {room.is_available ? (
                    <Chip label="Disponible" size="small" color="success" />
                  ) : (
                    <Tooltip title={room.unavailable_reason || ''}>
                      <Chip label="Indisponible" size="small" color="error" />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="center">
                  {room.is_available ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={room.occupation_rate || 0} color={occupationColor(room.occupation_rate || 0)} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                      <Typography variant="caption">{room.occupation_rate}%</Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.disabled">-</Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button size="small" onClick={() => { setEditRoom(room); setFormOpen(true); }}>Modifier</Button>
                    <Button size="small" color="info" onClick={() => router.push(`/${lang}/admin/timetable/room-occupation`)}>Occupation</Button>
                    {room.is_available ? (
                      <Button size="small" color="warning" onClick={() => handleBlock(room.id)}>Bloquer</Button>
                    ) : (
                      <Button size="small" color="success" onClick={() => handleUnblock(room.id)}>Débloquer</Button>
                    )}
                    <Button size="small" color="error" onClick={() => handleDelete(room.id)}>Suppr.</Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Room Form Dialog */}
      <RoomFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditRoom(undefined); }} onSave={handleSaveRoom} editRoom={editRoom} />

      {/* Block Dialog */}
      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Bloquer la salle</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Raison" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth label="Du" type="date" value={blockFrom} onChange={(e) => setBlockFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
          <TextField fullWidth label="Au" type="date" value={blockTo} onChange={(e) => setBlockTo(e.target.value)} InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" color="warning" onClick={confirmBlock} disabled={!blockReason}>Bloquer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
