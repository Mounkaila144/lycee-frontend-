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
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import type {
  RoomUtilization,
  AllRoomsUtilization,
  RoomRecommendation,
  RoomUtilizationRow,
  RoomStatus,
  HeatmapIntensity,
  HeatmapCell,
} from '../../types';
import { ROOM_STATUS_CONFIG, HEATMAP_COLORS } from '../../types';

// ──── Demo Data ────

const DEMO_ROOMS_LIST = [
  { id: 1, name: 'Amphi A' },
  { id: 2, name: 'Amphi B' },
  { id: 3, name: 'Amphi C' },
  { id: 4, name: 'Salle TD-101' },
  { id: 5, name: 'Salle TD-102' },
  { id: 6, name: 'Salle TD-201' },
  { id: 7, name: 'Salle TD-203' },
  { id: 8, name: 'Labo Info-1' },
  { id: 9, name: 'Labo Info-2' },
  { id: 10, name: 'Labo Chimie' },
  { id: 11, name: 'Salle Info-1' },
  { id: 12, name: 'Salle Info-2' },
];

const DEMO_ALL_ROOMS: AllRoomsUtilization = {
  statistics: {
    total_rooms: 12,
    total_capacity: 1850,
    average_occupancy_rate: 62.3,
    total_used_hours: 3740,
    total_available_hours: 6000,
    underused_count: 3,
    normal_count: 7,
    saturated_count: 2,
  },
  type_distribution: {
    Amphi: { count: 3, average_occupancy: 78.5 },
    'Salle TD': { count: 4, average_occupancy: 65.2 },
    Laboratoire: { count: 3, average_occupancy: 52.1 },
    'Salle Info': { count: 2, average_occupancy: 71.8 },
  },
  rooms: [
    { room_id: 1, room_name: 'Amphi A', room_type: 'Amphi', capacity: 200, building: 'Bloc Sciences', used_hours: 390, free_hours: 110, occupancy_rate: 78, status: 'normale' },
    { room_id: 2, room_name: 'Amphi B', room_type: 'Amphi', capacity: 250, building: 'Bloc Sciences', used_hours: 175, free_hours: 325, occupancy_rate: 35, status: 'sous-utilisee' },
    { room_id: 3, room_name: 'Amphi C', room_type: 'Amphi', capacity: 150, building: 'Bloc Lettres', used_hours: 460, free_hours: 40, occupancy_rate: 92, status: 'saturee' },
    { room_id: 4, room_name: 'Salle TD-101', room_type: 'Salle TD', capacity: 40, building: 'Bloc Sciences', used_hours: 310, free_hours: 190, occupancy_rate: 62, status: 'normale' },
    { room_id: 5, room_name: 'Salle TD-102', room_type: 'Salle TD', capacity: 45, building: 'Bloc Sciences', used_hours: 340, free_hours: 160, occupancy_rate: 68, status: 'normale' },
    { room_id: 6, room_name: 'Salle TD-201', room_type: 'Salle TD', capacity: 35, building: 'Bloc Lettres', used_hours: 475, free_hours: 25, occupancy_rate: 95, status: 'saturee' },
    { room_id: 7, room_name: 'Salle TD-203', room_type: 'Salle TD', capacity: 40, building: 'Bloc Lettres', used_hours: 200, free_hours: 300, occupancy_rate: 40, status: 'sous-utilisee' },
    { room_id: 8, room_name: 'Labo Info-1', room_type: 'Laboratoire', capacity: 30, building: 'Bloc Sciences', used_hours: 280, free_hours: 220, occupancy_rate: 56, status: 'normale' },
    { room_id: 9, room_name: 'Labo Info-2', room_type: 'Laboratoire', capacity: 30, building: 'Bloc Sciences', used_hours: 300, free_hours: 200, occupancy_rate: 60, status: 'normale' },
    { room_id: 10, room_name: 'Labo Chimie', room_type: 'Laboratoire', capacity: 25, building: 'Bloc Sciences', used_hours: 150, free_hours: 350, occupancy_rate: 30, status: 'sous-utilisee' },
    { room_id: 11, room_name: 'Salle Info-1', room_type: 'Salle Info', capacity: 35, building: 'Bloc Admin', used_hours: 360, free_hours: 140, occupancy_rate: 72, status: 'normale' },
    { room_id: 12, room_name: 'Salle Info-2', room_type: 'Salle Info', capacity: 30, building: 'Bloc Admin', used_hours: 300, free_hours: 200, occupancy_rate: 60, status: 'normale' },
  ],
};

const DEMO_ROOM_DETAILS: Record<number, RoomUtilization> = {
  1: {
    room: { id: 1, name: 'Amphi A', type: 'Amphi', capacity: 200, building: 'Bloc Sciences', floor: 'RDC', equipments: ['Videoprojecteur', 'Microphone', 'Climatisation'] },
    occupancy: { total_available_hours: 500, total_used_hours: 390, total_free_hours: 110, occupancy_rate: 78, status: 'normale', daily_average: 4.88, weekly_average: 24.38 },
    hours_by_type: { cm: 250, td: 80, tp: 60 },
    capacity_analysis: { average_fill_rate: 72.5, oversized_sessions: 2, undersized_sessions: 8, adequate_sessions: 45 },
  },
  2: {
    room: { id: 2, name: 'Amphi B', type: 'Amphi', capacity: 250, building: 'Bloc Sciences', floor: 'RDC', equipments: ['Videoprojecteur', 'Microphone', 'Climatisation', 'Enregistrement video'] },
    occupancy: { total_available_hours: 500, total_used_hours: 175, total_free_hours: 325, occupancy_rate: 35, status: 'sous-utilisee', daily_average: 2.19, weekly_average: 10.94 },
    hours_by_type: { cm: 120, td: 35, tp: 20 },
    capacity_analysis: { average_fill_rate: 35.2, oversized_sessions: 18, undersized_sessions: 0, adequate_sessions: 12 },
  },
  3: {
    room: { id: 3, name: 'Amphi C', type: 'Amphi', capacity: 150, building: 'Bloc Lettres', floor: '1er', equipments: ['Videoprojecteur', 'Tableau blanc'] },
    occupancy: { total_available_hours: 500, total_used_hours: 460, total_free_hours: 40, occupancy_rate: 92, status: 'saturee', daily_average: 5.75, weekly_average: 28.75 },
    hours_by_type: { cm: 300, td: 120, tp: 40 },
    capacity_analysis: { average_fill_rate: 88.3, oversized_sessions: 0, undersized_sessions: 12, adequate_sessions: 55 },
  },
  4: {
    room: { id: 4, name: 'Salle TD-101', type: 'Salle TD', capacity: 40, building: 'Bloc Sciences', floor: '1er', equipments: ['Videoprojecteur', 'Tableau interactif'] },
    occupancy: { total_available_hours: 500, total_used_hours: 310, total_free_hours: 190, occupancy_rate: 62, status: 'normale', daily_average: 3.88, weekly_average: 19.38 },
    hours_by_type: { cm: 40, td: 200, tp: 70 },
    capacity_analysis: { average_fill_rate: 68.0, oversized_sessions: 3, undersized_sessions: 5, adequate_sessions: 38 },
  },
  5: {
    room: { id: 5, name: 'Salle TD-102', type: 'Salle TD', capacity: 45, building: 'Bloc Sciences', floor: '1er', equipments: ['Videoprojecteur'] },
    occupancy: { total_available_hours: 500, total_used_hours: 340, total_free_hours: 160, occupancy_rate: 68, status: 'normale', daily_average: 4.25, weekly_average: 21.25 },
    hours_by_type: { cm: 30, td: 230, tp: 80 },
    capacity_analysis: { average_fill_rate: 71.5, oversized_sessions: 2, undersized_sessions: 4, adequate_sessions: 42 },
  },
  6: {
    room: { id: 6, name: 'Salle TD-201', type: 'Salle TD', capacity: 35, building: 'Bloc Lettres', floor: '2eme', equipments: ['Videoprojecteur', 'Climatisation'] },
    occupancy: { total_available_hours: 500, total_used_hours: 475, total_free_hours: 25, occupancy_rate: 95, status: 'saturee', daily_average: 5.94, weekly_average: 29.69 },
    hours_by_type: { cm: 60, td: 320, tp: 95 },
    capacity_analysis: { average_fill_rate: 91.2, oversized_sessions: 0, undersized_sessions: 15, adequate_sessions: 48 },
  },
  7: {
    room: { id: 7, name: 'Salle TD-203', type: 'Salle TD', capacity: 40, building: 'Bloc Lettres', floor: '2eme', equipments: ['Tableau blanc'] },
    occupancy: { total_available_hours: 500, total_used_hours: 200, total_free_hours: 300, occupancy_rate: 40, status: 'sous-utilisee', daily_average: 2.50, weekly_average: 12.50 },
    hours_by_type: { cm: 20, td: 140, tp: 40 },
    capacity_analysis: { average_fill_rate: 45.0, oversized_sessions: 10, undersized_sessions: 1, adequate_sessions: 20 },
  },
  8: {
    room: { id: 8, name: 'Labo Info-1', type: 'Laboratoire', capacity: 30, building: 'Bloc Sciences', floor: 'RDC', equipments: ['Ordinateurs (30)', 'Videoprojecteur', 'Climatisation', 'Imprimante reseau'] },
    occupancy: { total_available_hours: 500, total_used_hours: 280, total_free_hours: 220, occupancy_rate: 56, status: 'normale', daily_average: 3.50, weekly_average: 17.50 },
    hours_by_type: { cm: 10, td: 50, tp: 220 },
    capacity_analysis: { average_fill_rate: 65.8, oversized_sessions: 4, undersized_sessions: 3, adequate_sessions: 30 },
  },
  9: {
    room: { id: 9, name: 'Labo Info-2', type: 'Laboratoire', capacity: 30, building: 'Bloc Sciences', floor: 'RDC', equipments: ['Ordinateurs (30)', 'Videoprojecteur', 'Climatisation'] },
    occupancy: { total_available_hours: 500, total_used_hours: 300, total_free_hours: 200, occupancy_rate: 60, status: 'normale', daily_average: 3.75, weekly_average: 18.75 },
    hours_by_type: { cm: 15, td: 55, tp: 230 },
    capacity_analysis: { average_fill_rate: 70.2, oversized_sessions: 2, undersized_sessions: 4, adequate_sessions: 34 },
  },
  10: {
    room: { id: 10, name: 'Labo Chimie', type: 'Laboratoire', capacity: 25, building: 'Bloc Sciences', floor: '1er', equipments: ['Paillasses', 'Hotte aspirante', 'Equipement chimie'] },
    occupancy: { total_available_hours: 500, total_used_hours: 150, total_free_hours: 350, occupancy_rate: 30, status: 'sous-utilisee', daily_average: 1.88, weekly_average: 9.38 },
    hours_by_type: { cm: 0, td: 30, tp: 120 },
    capacity_analysis: { average_fill_rate: 52.0, oversized_sessions: 6, undersized_sessions: 1, adequate_sessions: 15 },
  },
  11: {
    room: { id: 11, name: 'Salle Info-1', type: 'Salle Info', capacity: 35, building: 'Bloc Admin', floor: '1er', equipments: ['Ordinateurs (35)', 'Videoprojecteur', 'Climatisation', 'Tableau interactif'] },
    occupancy: { total_available_hours: 500, total_used_hours: 360, total_free_hours: 140, occupancy_rate: 72, status: 'normale', daily_average: 4.50, weekly_average: 22.50 },
    hours_by_type: { cm: 20, td: 80, tp: 260 },
    capacity_analysis: { average_fill_rate: 76.3, oversized_sessions: 1, undersized_sessions: 6, adequate_sessions: 40 },
  },
  12: {
    room: { id: 12, name: 'Salle Info-2', type: 'Salle Info', capacity: 30, building: 'Bloc Admin', floor: '1er', equipments: ['Ordinateurs (30)', 'Videoprojecteur'] },
    occupancy: { total_available_hours: 500, total_used_hours: 300, total_free_hours: 200, occupancy_rate: 60, status: 'normale', daily_average: 3.75, weekly_average: 18.75 },
    hours_by_type: { cm: 15, td: 65, tp: 220 },
    capacity_analysis: { average_fill_rate: 67.8, oversized_sessions: 3, undersized_sessions: 3, adequate_sessions: 32 },
  },
};

const DEMO_RECOMMENDATIONS: RoomRecommendation[] = [
  {
    type: 'capacity',
    severity: 'warning',
    message: 'Amphi B surdimensionne',
    room_name: 'Amphi B',
    details: 'Taux remplissage moyen 35%. Envisager affectation groupes plus grands.',
  },
  {
    type: 'liberate',
    severity: 'info',
    message: 'Labo Chimie libre vendredis',
    room_name: 'Labo Chimie',
    details: 'Aucune seance planifiee le vendredi. Potentiel 10h supplementaires.',
  },
  {
    type: 'reassign',
    severity: 'critical',
    message: 'Salle TD-201 saturee',
    room_name: 'Salle TD-201',
    details: 'Occupation 95%. Deplacer certains groupes vers Salle TD-203 (libre 60%).',
  },
  {
    type: 'equipment',
    severity: 'info',
    message: 'Salle TD-203 sans equipement adequat',
    room_name: 'Salle TD-203',
    details: 'Seul un tableau blanc disponible. Ajouter videoprojecteur pour augmenter usage.',
  },
  {
    type: 'reassign',
    severity: 'warning',
    message: 'Amphi C proche saturation',
    room_name: 'Amphi C',
    details: 'Occupation 92%. Redistribuer 2-3 seances CM vers Amphi A (78%) ou Amphi B (35%).',
  },
];

const HEATMAP_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HEATMAP_TIMESLOTS = ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'];

const DEMO_HEATMAP: HeatmapCell[] = [
  { day: 'Lundi', timeslot: '08:00-10:00', count: 9, intensity: 'very_high' },
  { day: 'Lundi', timeslot: '10:00-12:00', count: 7, intensity: 'high' },
  { day: 'Lundi', timeslot: '14:00-16:00', count: 5, intensity: 'medium' },
  { day: 'Lundi', timeslot: '16:00-18:00', count: 3, intensity: 'low' },
  { day: 'Mardi', timeslot: '08:00-10:00', count: 8, intensity: 'high' },
  { day: 'Mardi', timeslot: '10:00-12:00', count: 10, intensity: 'very_high' },
  { day: 'Mardi', timeslot: '14:00-16:00', count: 6, intensity: 'high' },
  { day: 'Mardi', timeslot: '16:00-18:00', count: 2, intensity: 'low' },
  { day: 'Mercredi', timeslot: '08:00-10:00', count: 6, intensity: 'high' },
  { day: 'Mercredi', timeslot: '10:00-12:00', count: 5, intensity: 'medium' },
  { day: 'Mercredi', timeslot: '14:00-16:00', count: 4, intensity: 'medium' },
  { day: 'Mercredi', timeslot: '16:00-18:00', count: 1, intensity: 'low' },
  { day: 'Jeudi', timeslot: '08:00-10:00', count: 10, intensity: 'very_high' },
  { day: 'Jeudi', timeslot: '10:00-12:00', count: 8, intensity: 'high' },
  { day: 'Jeudi', timeslot: '14:00-16:00', count: 7, intensity: 'high' },
  { day: 'Jeudi', timeslot: '16:00-18:00', count: 4, intensity: 'medium' },
  { day: 'Vendredi', timeslot: '08:00-10:00', count: 5, intensity: 'medium' },
  { day: 'Vendredi', timeslot: '10:00-12:00', count: 4, intensity: 'medium' },
  { day: 'Vendredi', timeslot: '14:00-16:00', count: 2, intensity: 'low' },
  { day: 'Vendredi', timeslot: '16:00-18:00', count: 0, intensity: 'empty' },
  { day: 'Samedi', timeslot: '08:00-10:00', count: 3, intensity: 'low' },
  { day: 'Samedi', timeslot: '10:00-12:00', count: 2, intensity: 'low' },
  { day: 'Samedi', timeslot: '14:00-16:00', count: 0, intensity: 'empty' },
  { day: 'Samedi', timeslot: '16:00-18:00', count: 0, intensity: 'empty' },
];

// Equipment usage demo data
const DEMO_EQUIPMENT_USAGE = [
  { equipment: 'Videoprojecteur', rooms_count: 10, total_hours_used: 3200, usage_rate: 85.3 },
  { equipment: 'Climatisation', rooms_count: 6, total_hours_used: 1950, usage_rate: 65.0 },
  { equipment: 'Ordinateurs', rooms_count: 4, total_hours_used: 1240, usage_rate: 62.0 },
  { equipment: 'Microphone', rooms_count: 3, total_hours_used: 1025, usage_rate: 68.3 },
  { equipment: 'Tableau interactif', rooms_count: 3, total_hours_used: 810, usage_rate: 54.0 },
  { equipment: 'Imprimante reseau', rooms_count: 1, total_hours_used: 280, usage_rate: 56.0 },
  { equipment: 'Enregistrement video', rooms_count: 1, total_hours_used: 175, usage_rate: 35.0 },
  { equipment: 'Hotte aspirante', rooms_count: 1, total_hours_used: 150, usage_rate: 30.0 },
];

// ──── Helper: severity colors ────

const SEVERITY_COLORS: Record<string, string> = {
  info: '#2196f3',
  warning: '#ff9800',
  critical: '#f44336',
};

const RECOMMENDATION_TYPE_LABELS: Record<string, string> = {
  reassign: 'Reassignation',
  liberate: 'Liberation',
  equipment: 'Equipement',
  capacity: 'Capacite',
};

// ──── Sort helpers ────

type SortableColumn = 'room_name' | 'room_type' | 'capacity' | 'building' | 'used_hours' | 'free_hours' | 'occupancy_rate' | 'status';
type SortDirection = 'asc' | 'desc';

function compareValues(a: RoomUtilizationRow, b: RoomUtilizationRow, column: SortableColumn, direction: SortDirection): number {
  const valA = a[column];
  const valB = b[column];
  let comparison = 0;

  if (typeof valA === 'string' && typeof valB === 'string') {
    comparison = valA.localeCompare(valB, 'fr');
  } else if (typeof valA === 'number' && typeof valB === 'number') {
    comparison = valA - valB;
  }

  return direction === 'asc' ? comparison : -comparison;
}

// ──── Occupancy color helper ────

function getOccupancyColor(rate: number): 'error' | 'warning' | 'success' | 'info' {
  if (rate >= 85) return 'error';
  if (rate >= 60) return 'success';
  if (rate >= 40) return 'warning';

  return 'info';
}

// ──── Main Component ────

export const RoomUtilizationDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Global view state
  const [filterType, setFilterType] = useState('Tous');
  const [filterBuilding, setFilterBuilding] = useState('Tous');
  const [filterCapacityMin, setFilterCapacityMin] = useState('');
  const [filterCapacityMax, setFilterCapacityMax] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortColumn, setSortColumn] = useState<SortableColumn>('room_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Individual report state
  const [selectedRoomId, setSelectedRoomId] = useState(1);

  // Data
  const allRooms = DEMO_ALL_ROOMS;
  const recommendations = DEMO_RECOMMENDATIONS;
  const roomDetail = DEMO_ROOM_DETAILS[selectedRoomId] || DEMO_ROOM_DETAILS[1];

  // ──── Filtered and sorted rooms ────

  const filteredRooms = useMemo(() => {
    let rooms = [...allRooms.rooms];

    if (filterType !== 'Tous') {
      rooms = rooms.filter((r) => r.room_type === filterType);
    }

    if (filterBuilding !== 'Tous') {
      rooms = rooms.filter((r) => r.building === filterBuilding);
    }

    if (filterCapacityMin !== '') {
      const min = parseInt(filterCapacityMin, 10);

      if (!isNaN(min)) {
        rooms = rooms.filter((r) => r.capacity >= min);
      }
    }

    if (filterCapacityMax !== '') {
      const max = parseInt(filterCapacityMax, 10);

      if (!isNaN(max)) {
        rooms = rooms.filter((r) => r.capacity <= max);
      }
    }

    if (searchText.trim() !== '') {
      const search = searchText.toLowerCase();

      rooms = rooms.filter(
        (r) =>
          r.room_name.toLowerCase().includes(search) ||
          r.room_type.toLowerCase().includes(search) ||
          r.building.toLowerCase().includes(search)
      );
    }

    rooms.sort((a, b) => compareValues(a, b, sortColumn, sortDirection));

    return rooms;
  }, [allRooms.rooms, filterType, filterBuilding, filterCapacityMin, filterCapacityMax, searchText, sortColumn, sortDirection]);

  // ──── Sort handler ────

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // ──── Heatmap lookup ────

  const getHeatmapCell = (day: string, timeslot: string): HeatmapCell | undefined => {
    return DEMO_HEATMAP.find((c) => c.day === day && c.timeslot === timeslot);
  };

  // ──── Export handlers (demo stubs) ────

  const handleExportPdf = () => {
    // Stub: would trigger PDF generation via API
  };

  const handleExportExcel = () => {
    // Stub: would trigger Excel export via API
  };

  // ──── Render: Global View Tab ────

  const renderGlobalView = () => (
    <Box>
      {/* Global KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="caption" color="text.secondary">Total Salles</Typography>
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                {allRooms.statistics.total_rooms}
              </Typography>
              <Typography variant="caption" color="text.secondary">salles disponibles</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="caption" color="text.secondary">Capacite Totale</Typography>
              <Typography variant="h3" fontWeight="bold" color="info.main">
                {allRooms.statistics.total_capacity}
              </Typography>
              <Typography variant="caption" color="text.secondary">places</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="caption" color="text.secondary">Taux Occupation Moyen</Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{ color: allRooms.statistics.average_occupancy_rate >= 70 ? '#4caf50' : allRooms.statistics.average_occupancy_rate >= 50 ? '#ff9800' : '#f44336' }}
              >
                {allRooms.statistics.average_occupancy_rate}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={allRooms.statistics.average_occupancy_rate}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                color={getOccupancyColor(allRooms.statistics.average_occupancy_rate)}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="caption" color="text.secondary">Repartition Statuts</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${allRooms.statistics.underused_count} sous-util.`}
                  size="small"
                  sx={{ bgcolor: ROOM_STATUS_CONFIG['sous-utilisee'].color, color: '#fff', fontWeight: 'bold' }}
                />
                <Chip
                  label={`${allRooms.statistics.normal_count} normales`}
                  size="small"
                  sx={{ bgcolor: ROOM_STATUS_CONFIG.normale.color, color: '#fff', fontWeight: 'bold' }}
                />
                <Chip
                  label={`${allRooms.statistics.saturated_count} saturees`}
                  size="small"
                  sx={{ bgcolor: ROOM_STATUS_CONFIG.saturee.color, color: '#fff', fontWeight: 'bold' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {allRooms.statistics.total_used_hours}h / {allRooms.statistics.total_available_hours}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Type Distribution */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Distribution par Type de Salle
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(allRooms.type_distribution).map(([typeName, data]) => (
          <Grid item xs={6} sm={3} key={typeName}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight="bold">{typeName}</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">{data.count}</Typography>
                <Typography variant="caption" color="text.secondary">salles</Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={data.average_occupancy}
                    sx={{ height: 6, borderRadius: 3 }}
                    color={getOccupancyColor(data.average_occupancy)}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Occupation moy.: {data.average_occupancy}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters Bar */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Filtres</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                  <MenuItem value="Tous">Tous</MenuItem>
                  <MenuItem value="Amphi">Amphi</MenuItem>
                  <MenuItem value="Salle TD">Salle TD</MenuItem>
                  <MenuItem value="Laboratoire">Laboratoire</MenuItem>
                  <MenuItem value="Salle Info">Salle Informatique</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Batiment</InputLabel>
                <Select value={filterBuilding} label="Batiment" onChange={(e) => setFilterBuilding(e.target.value)}>
                  <MenuItem value="Tous">Tous</MenuItem>
                  <MenuItem value="Bloc Sciences">Bloc Sciences</MenuItem>
                  <MenuItem value="Bloc Lettres">Bloc Lettres</MenuItem>
                  <MenuItem value="Bloc Admin">Bloc Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Capacite Min"
                type="number"
                value={filterCapacityMin}
                onChange={(e) => setFilterCapacityMin(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Capacite Max"
                type="number"
                value={filterCapacityMax}
                onChange={(e) => setFilterCapacityMax(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Rechercher"
                placeholder="Nom, type, batiment..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* All Rooms Table */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Toutes les Salles ({filteredRooms.length} resultats)
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortColumn === 'room_name'}
                      direction={sortColumn === 'room_name' ? sortDirection : 'asc'}
                      onClick={() => handleSort('room_name')}
                    >
                      Salle
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortColumn === 'room_type'}
                      direction={sortColumn === 'room_type' ? sortDirection : 'asc'}
                      onClick={() => handleSort('room_type')}
                    >
                      Type
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={sortColumn === 'capacity'}
                      direction={sortColumn === 'capacity' ? sortDirection : 'asc'}
                      onClick={() => handleSort('capacity')}
                    >
                      Capacite
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortColumn === 'building'}
                      direction={sortColumn === 'building' ? sortDirection : 'asc'}
                      onClick={() => handleSort('building')}
                    >
                      Batiment
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={sortColumn === 'used_hours'}
                      direction={sortColumn === 'used_hours' ? sortDirection : 'asc'}
                      onClick={() => handleSort('used_hours')}
                    >
                      Heures Utilisees
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={sortColumn === 'free_hours'}
                      direction={sortColumn === 'free_hours' ? sortDirection : 'asc'}
                      onClick={() => handleSort('free_hours')}
                    >
                      Heures Libres
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 180 }}>
                    <TableSortLabel
                      active={sortColumn === 'occupancy_rate'}
                      direction={sortColumn === 'occupancy_rate' ? sortDirection : 'asc'}
                      onClick={() => handleSort('occupancy_rate')}
                    >
                      Taux Occupation
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={sortColumn === 'status'}
                      direction={sortColumn === 'status' ? sortDirection : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Statut
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRooms.map((room) => {
                  const statusConfig = ROOM_STATUS_CONFIG[room.status];

                  return (
                    <TableRow
                      key={room.room_id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedRoomId(room.room_id);
                        setActiveTab(1);
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{room.room_name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{room.room_type}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{room.capacity}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{room.building}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{room.used_hours}h</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{room.free_hours}h</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={room.occupancy_rate}
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            color={getOccupancyColor(room.occupancy_rate)}
                          />
                          <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 40, textAlign: 'right' }}>
                            {room.occupancy_rate}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={statusConfig.label}
                          size="small"
                          sx={{ bgcolor: statusConfig.color, color: '#fff', fontWeight: 'bold' }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRooms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Aucune salle ne correspond aux filtres selectionnes.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Heatmap: Day x Timeslot */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Carte de Chaleur - Occupation Globale
      </Typography>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nombre de salles occupees par creneau horaire (tous types confondus)
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Creneau</TableCell>
                  {HEATMAP_DAYS.map((day) => (
                    <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>{day}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {HEATMAP_TIMESLOTS.map((timeslot) => (
                  <TableRow key={timeslot}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{timeslot}</TableCell>
                    {HEATMAP_DAYS.map((day) => {
                      const cell = getHeatmapCell(day, timeslot);
                      const intensity: HeatmapIntensity = cell?.intensity || 'empty';
                      const count = cell?.count ?? 0;

                      return (
                        <TableCell
                          key={day}
                          align="center"
                          sx={{
                            bgcolor: HEATMAP_COLORS[intensity],
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            border: '1px solid #e0e0e0',
                            minWidth: 70,
                          }}
                        >
                          <Tooltip title={`${day} ${timeslot}: ${count} salle(s) occupee(s)`}>
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
          <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(Object.entries(HEATMAP_COLORS) as [HeatmapIntensity, string][]).map(([key, color]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: color, borderRadius: 0.5, border: '1px solid #ccc' }} />
                <Typography variant="caption">
                  {key === 'empty' ? 'Vide' : key === 'low' ? 'Faible' : key === 'medium' ? 'Moyen' : key === 'high' ? 'Eleve' : 'Tres eleve'}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Equipment Usage Analysis */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Analyse d'Utilisation des Equipements
      </Typography>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Equipement</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Nb Salles Equipees</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Heures Utilisees</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 180 }}>Taux d'Utilisation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_EQUIPMENT_USAGE.map((eq) => (
                  <TableRow key={eq.equipment} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{eq.equipment}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{eq.rooms_count}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{eq.total_hours_used}h</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={eq.usage_rate}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color={getOccupancyColor(eq.usage_rate)}
                        />
                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 40, textAlign: 'right' }}>
                          {eq.usage_rate}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Recommandations d'Optimisation
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {recommendations.map((rec, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              variant="outlined"
              sx={{
                borderLeft: `4px solid ${SEVERITY_COLORS[rec.severity]}`,
              }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {rec.message}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Chip
                      label={rec.severity === 'critical' ? 'Critique' : rec.severity === 'warning' ? 'Attention' : 'Info'}
                      size="small"
                      sx={{
                        bgcolor: SEVERITY_COLORS[rec.severity],
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                      }}
                    />
                    <Chip
                      label={RECOMMENDATION_TYPE_LABELS[rec.type]}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Salle : {rec.room_name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {rec.details}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Export Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={handleExportPdf}>
          Export PDF
        </Button>
        <Button variant="outlined" onClick={handleExportExcel}>
          Export Excel
        </Button>
      </Box>
    </Box>
  );

  // ──── Render: Individual Report Tab ────

  const renderIndividualReport = () => {
    const detail = roomDetail;
    const statusConfig = ROOM_STATUS_CONFIG[detail.occupancy.status];
    const totalTypeHours = detail.hours_by_type.cm + detail.hours_by_type.td + detail.hours_by_type.tp;
    const totalCapacitySessions = detail.capacity_analysis.oversized_sessions + detail.capacity_analysis.undersized_sessions + detail.capacity_analysis.adequate_sessions;

    return (
      <Box>
        {/* Room Selector */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Selectionner une salle</InputLabel>
            <Select
              value={selectedRoomId}
              label="Selectionner une salle"
              onChange={(e) => setSelectedRoomId(e.target.value as number)}
            >
              {DEMO_ROOMS_LIST.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Chip
            label={statusConfig.label}
            sx={{ bgcolor: statusConfig.color, color: '#fff', fontWeight: 'bold' }}
          />
        </Box>

        {/* Room Identity Card */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              {detail.room.name}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Type</Typography>
                <Typography variant="body2" fontWeight="bold">{detail.room.type}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Capacite</Typography>
                <Typography variant="body2" fontWeight="bold">{detail.room.capacity} places</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Batiment</Typography>
                <Typography variant="body2" fontWeight="bold">{detail.room.building}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Etage</Typography>
                <Typography variant="body2" fontWeight="bold">{detail.room.floor}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Equipements</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                  {detail.room.equipments.map((eq) => (
                    <Chip key={eq} label={eq} size="small" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Occupancy Metrics Cards */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Metriques d'Occupation
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="caption" color="text.secondary">Taux d'occupation</Typography>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: statusConfig.color }}
                >
                  {detail.occupancy.occupancy_rate}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={detail.occupancy.occupancy_rate}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  color={getOccupancyColor(detail.occupancy.occupancy_rate)}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="caption" color="text.secondary">Heures Utilisees</Typography>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {detail.occupancy.total_used_hours}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  sur {detail.occupancy.total_available_hours}h disponibles
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="caption" color="text.secondary">Heures Libres</Typography>
                <Typography variant="h3" fontWeight="bold" color="success.main">
                  {detail.occupancy.total_free_hours}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  creneaux encore disponibles
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="caption" color="text.secondary">Moyenne</Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {detail.occupancy.daily_average}h/j
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {detail.occupancy.weekly_average}h/sem
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Hours by Type */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Repartition par Type de Seance
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderTop: '4px solid #1976d2' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">CM (Cours Magistraux)</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976d2' }}>
                  {detail.hours_by_type.cm}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalTypeHours > 0 ? Math.round((detail.hours_by_type.cm / totalTypeHours) * 100) : 0}% du total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderTop: '4px solid #2e7d32' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">TD (Travaux Diriges)</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#2e7d32' }}>
                  {detail.hours_by_type.td}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalTypeHours > 0 ? Math.round((detail.hours_by_type.td / totalTypeHours) * 100) : 0}% du total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderTop: '4px solid #ed6c02' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">TP (Travaux Pratiques)</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#ed6c02' }}>
                  {detail.hours_by_type.tp}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalTypeHours > 0 ? Math.round((detail.hours_by_type.tp / totalTypeHours) * 100) : 0}% du total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Capacity Analysis */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Analyse de Capacite
        </Typography>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Taux de Remplissage Moyen
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={detail.capacity_analysis.average_fill_rate}
                      sx={{ height: 12, borderRadius: 6 }}
                      color={getOccupancyColor(detail.capacity_analysis.average_fill_rate)}
                    />
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    {detail.capacity_analysis.average_fill_rate}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Moyenne du nombre d'etudiants par rapport a la capacite de la salle
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" color="error.main">
                          Sessions sur-dimensionnees
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Salle trop grande pour le groupe
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="error.main">
                        {detail.capacity_analysis.oversized_sessions}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                          Sessions sous-dimensionnees
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Salle trop petite pour le groupe
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        {detail.capacity_analysis.undersized_sessions}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          Sessions adequates
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bonne adequation salle/groupe
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {detail.capacity_analysis.adequate_sessions}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {totalCapacitySessions > 0 && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Total sessions analysees : {totalCapacitySessions} |
                  Adequation : {Math.round((detail.capacity_analysis.adequate_sessions / totalCapacitySessions) * 100)}%
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Heatmap for Individual Room */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Carte de Chaleur - {detail.room.name}
        </Typography>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Occupation de la salle par jour et creneau horaire
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Creneau</TableCell>
                    {HEATMAP_DAYS.map((day) => (
                      <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>{day}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {HEATMAP_TIMESLOTS.map((timeslot, tIdx) => (
                    <TableRow key={timeslot}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{timeslot}</TableCell>
                      {HEATMAP_DAYS.map((day, dIdx) => {
                        // Generate a deterministic pattern based on room and position
                        const seed = (selectedRoomId * 7 + dIdx * 3 + tIdx * 5) % 10;
                        let intensity: HeatmapIntensity;
                        let label: string;

                        if (seed <= 1) {
                          intensity = 'empty';
                          label = 'Libre';
                        } else if (seed <= 3) {
                          intensity = 'low';
                          label = 'Faible';
                        } else if (seed <= 5) {
                          intensity = 'medium';
                          label = 'Moyen';
                        } else if (seed <= 7) {
                          intensity = 'high';
                          label = 'Eleve';
                        } else {
                          intensity = 'very_high';
                          label = 'Occupe';
                        }

                        // Weekends are generally less occupied
                        if (day === 'Samedi' && tIdx >= 2) {
                          intensity = 'empty';
                          label = 'Libre';
                        }

                        return (
                          <TableCell
                            key={day}
                            align="center"
                            sx={{
                              bgcolor: HEATMAP_COLORS[intensity],
                              border: '1px solid #e0e0e0',
                              minWidth: 70,
                            }}
                          >
                            <Tooltip title={`${day} ${timeslot}: ${label}`}>
                              <Typography variant="caption" fontWeight="bold">
                                {label}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {(Object.entries(HEATMAP_COLORS) as [HeatmapIntensity, string][]).map(([key, color]) => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: color, borderRadius: 0.5, border: '1px solid #ccc' }} />
                  <Typography variant="caption">
                    {key === 'empty' ? 'Vide' : key === 'low' ? 'Faible' : key === 'medium' ? 'Moyen' : key === 'high' ? 'Eleve' : 'Tres eleve'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Export Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleExportPdf}>
            Export PDF
          </Button>
          <Button variant="outlined" onClick={handleExportExcel}>
            Export Excel
          </Button>
        </Box>
      </Box>
    );
  };

  // ──── Main Render ────

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Utilisation des Salles</Typography>
      </Breadcrumbs>

      {/* Title + Navigation Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Taux d'Utilisation des Salles
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
            onClick={() => router.push(`/${lang}/admin/timetable/teacher-workload`)}
          >
            Charges Enseignants
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Vue Globale" />
        <Tab label="Rapport Individuel" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && renderGlobalView()}
      {activeTab === 1 && renderIndividualReport()}
    </Box>
  );
};
