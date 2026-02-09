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
import ButtonGroup from '@mui/material/ButtonGroup';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';

import { SessionFormDialog } from './SessionFormDialog';
import { ConflictAlert } from './ConflictAlert';

import type {
  TimetableSlot,
  DayOfWeek,
  SessionType,
  Conflict,
} from '../../types';

import { DAYS, TIME_SLOTS, SESSION_TYPE_COLORS } from '../../types';

// ──── Demo Data ────

const DEMO_MODULES = [
  { id: 1, name: 'Algorithmes', code: 'ALGO' },
  { id: 2, name: 'Base de données', code: 'BDD' },
  { id: 3, name: 'Réseaux', code: 'RES' },
  { id: 4, name: 'Systèmes d\'exploitation', code: 'SE' },
  { id: 5, name: 'Programmation Web', code: 'WEB' },
  { id: 6, name: 'Mathématiques', code: 'MATH' },
];

const DEMO_TEACHERS = [
  { id: 1, name: 'Dr. Dupont' },
  { id: 2, name: 'Prof. Martin' },
  { id: 3, name: 'Dr. Bernard' },
  { id: 4, name: 'Prof. Petit' },
];

const DEMO_GROUPS = [
  { id: 1, name: 'L3 Info - G1', student_count: 35 },
  { id: 2, name: 'L3 Info - G2', student_count: 32 },
  { id: 3, name: 'M1 Info - G1', student_count: 25 },
];

const DEMO_ROOMS = [
  { id: 1, name: 'Amphi A', code: 'AMP-A', capacity: 200, type: 'Amphithéâtre' },
  { id: 2, name: 'Salle TD-101', code: 'TD-101', capacity: 40, type: 'Salle TD' },
  { id: 3, name: 'Labo Info-1', code: 'LAB-I1', capacity: 30, type: 'Laboratoire Informatique' },
  { id: 4, name: 'Salle TD-102', code: 'TD-102', capacity: 45, type: 'Salle TD' },
];

const DEMO_SLOTS: TimetableSlot[] = [
  {
    id: 1, schedule_id: 1, module_id: 1, teacher_id: 1, group_id: 1, room_id: 1, semester_id: 1,
    day_of_week: 'Lundi', start_time: '08:00', end_time: '10:00', type: 'CM', is_recurring: true,
    module: DEMO_MODULES[0], teacher: DEMO_TEACHERS[0], room: DEMO_ROOMS[0], group: DEMO_GROUPS[0],
    created_at: '', updated_at: '',
  },
  {
    id: 2, schedule_id: 1, module_id: 2, teacher_id: 2, group_id: 1, room_id: 2, semester_id: 1,
    day_of_week: 'Lundi', start_time: '10:00', end_time: '12:00', type: 'TD', is_recurring: true,
    module: DEMO_MODULES[1], teacher: DEMO_TEACHERS[1], room: DEMO_ROOMS[1], group: DEMO_GROUPS[0],
    created_at: '', updated_at: '',
  },
  {
    id: 3, schedule_id: 1, module_id: 3, teacher_id: 3, group_id: 1, room_id: 3, semester_id: 1,
    day_of_week: 'Mardi', start_time: '08:00', end_time: '10:00', type: 'TP', is_recurring: true,
    module: DEMO_MODULES[2], teacher: DEMO_TEACHERS[2], room: DEMO_ROOMS[2], group: DEMO_GROUPS[0],
    created_at: '', updated_at: '',
  },
  {
    id: 4, schedule_id: 1, module_id: 4, teacher_id: 4, group_id: 1, room_id: 1, semester_id: 1,
    day_of_week: 'Mardi', start_time: '14:00', end_time: '16:00', type: 'CM', is_recurring: true,
    module: DEMO_MODULES[3], teacher: DEMO_TEACHERS[3], room: DEMO_ROOMS[0], group: DEMO_GROUPS[0],
    created_at: '', updated_at: '',
  },
  {
    id: 5, schedule_id: 1, module_id: 5, teacher_id: 1, group_id: 1, room_id: 3, semester_id: 1,
    day_of_week: 'Mercredi', start_time: '10:00', end_time: '12:00', type: 'TP', is_recurring: true,
    module: DEMO_MODULES[4], teacher: DEMO_TEACHERS[0], room: DEMO_ROOMS[2], group: DEMO_GROUPS[0],
    created_at: '', updated_at: '',
  },
  {
    id: 6, schedule_id: 1, module_id: 6, teacher_id: 2, group_id: 1, room_id: 1, semester_id: 1,
    day_of_week: 'Mercredi', start_time: '14:00', end_time: '16:00', type: 'CM', is_recurring: true,
    module: DEMO_MODULES[5], teacher: DEMO_TEACHERS[1], room: DEMO_ROOMS[0], group: DEMO_GROUPS[0],
    created_at: '', updated_at: '',
  },
  {
    id: 7, schedule_id: 1, module_id: 1, teacher_id: 1, group_id: 1, room_id: 2, semester_id: 1,
    day_of_week: 'Jeudi', start_time: '08:00', end_time: '10:00', type: 'TD', is_recurring: true,
    module: DEMO_MODULES[0], teacher: DEMO_TEACHERS[0], room: DEMO_ROOMS[1], group: DEMO_GROUPS[0],
    created_at: '', updated_at: '',
  },
  {
    id: 8, schedule_id: 1, module_id: 2, teacher_id: 2, group_id: 1, room_id: 3, semester_id: 1,
    day_of_week: 'Jeudi', start_time: '14:00', end_time: '16:00', type: 'TP', is_recurring: true,
    module: DEMO_MODULES[1], teacher: DEMO_TEACHERS[1], room: DEMO_ROOMS[2], group: DEMO_GROUPS[0],
    created_at: '', updated_at: '',
  },
  {
    id: 9, schedule_id: 1, module_id: 3, teacher_id: 3, group_id: 1, room_id: 4, semester_id: 1,
    day_of_week: 'Vendredi', start_time: '10:00', end_time: '12:00', type: 'TD', is_recurring: true,
    module: DEMO_MODULES[2], teacher: DEMO_TEACHERS[2], room: DEMO_ROOMS[3], group: DEMO_GROUPS[0],
    created_at: '', updated_at: '',
  },
];

// ──── Helper ────

const getSlotForCell = (slots: TimetableSlot[], day: DayOfWeek, start: string): TimetableSlot | undefined =>
  slots.find((s) => s.day_of_week === day && s.start_time === start);

// ──── Session Card ────

const SessionCard: React.FC<{ slot: TimetableSlot; onClick: (s: TimetableSlot) => void }> = ({ slot, onClick }) => (
  <Card
    onClick={() => onClick(slot)}
    sx={{
      cursor: 'pointer',
      height: '100%',
      borderLeft: `4px solid ${SESSION_TYPE_COLORS[slot.type]}`,
      '&:hover': { boxShadow: 4, transform: 'scale(1.02)' },
      transition: 'all 0.2s',
    }}
  >
    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
      <Typography variant="subtitle2" noWrap fontWeight="bold">
        {slot.module?.name}
      </Typography>
      <Typography variant="caption" display="block" color="text.secondary" noWrap>
        {slot.teacher?.name}
      </Typography>
      <Typography variant="caption" display="block" color="text.secondary" noWrap>
        {slot.room?.name}
      </Typography>
      <Chip
        label={slot.type}
        size="small"
        sx={{
          mt: 0.5,
          backgroundColor: SESSION_TYPE_COLORS[slot.type],
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '0.65rem',
          height: 20,
        }}
      />
    </CardContent>
  </Card>
);

// ──── Main Dashboard ────

export const TimetableDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [activeTab, setActiveTab] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<number>(1);
  const [selectedTeacher, setSelectedTeacher] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<number>(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<TimetableSlot | undefined>();
  const [slots, setSlots] = useState<TimetableSlot[]>(DEMO_SLOTS);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  const handleAddSession = useCallback(() => {
    setEditSlot(undefined);
    setDialogOpen(true);
  }, []);

  const handleEditSession = useCallback((slot: TimetableSlot) => {
    setEditSlot(slot);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback((data: Partial<TimetableSlot>) => {
    if (editSlot) {
      setSlots((prev) => prev.map((s) => (s.id === editSlot.id ? { ...s, ...data } : s)));
    } else {
      const newSlot: TimetableSlot = {
        ...data as TimetableSlot,
        id: Date.now(),
        schedule_id: 1,
        semester_id: 1,
        is_recurring: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setSlots((prev) => [...prev, newSlot]);
    }

    setDialogOpen(false);
  }, [editSlot]);

  const handleDelete = useCallback((id: number) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
    setDialogOpen(false);
  }, []);

  const filteredSlots = slots;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Planification</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Planification des Emplois du Temps
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined" startIcon={<span>👥</span>} onClick={() => router.push(`/${lang}/admin/timetable/group-view`)}>
            EDT Groupe
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>👨‍🏫</span>} onClick={() => router.push(`/${lang}/admin/timetable/teacher-view`)}>
            EDT Enseignant
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>📊</span>} onClick={() => router.push(`/${lang}/admin/timetable/room-occupation`)}>
            Occupation Salles
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>🎓</span>} onClick={() => router.push(`/${lang}/admin/timetable/student-view`)}>
            EDT Étudiant
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label="Vue Groupe" />
        <Tab label="Vue Enseignant" />
        <Tab label="Vue Salle" />
        <Tab label="Vue Niveau" />
      </Tabs>

      {/* Selectors + Add button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Semestre</InputLabel>
          <Select value={1} label="Semestre">
            <MenuItem value={1}>S1 2024-2025</MenuItem>
            <MenuItem value={2}>S2 2024-2025</MenuItem>
          </Select>
        </FormControl>

        {activeTab === 0 && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Groupe</InputLabel>
            <Select value={selectedGroup} label="Groupe" onChange={(e) => setSelectedGroup(e.target.value as number)}>
              {DEMO_GROUPS.map((g) => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {activeTab === 1 && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Enseignant</InputLabel>
            <Select value={selectedTeacher} label="Enseignant" onChange={(e) => setSelectedTeacher(e.target.value as number)}>
              {DEMO_TEACHERS.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {activeTab === 2 && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Salle</InputLabel>
            <Select value={selectedRoom} label="Salle" onChange={(e) => setSelectedRoom(e.target.value as number)}>
              {DEMO_ROOMS.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ flex: 1 }} />

        <Button variant="contained" onClick={handleAddSession}>
          + Ajouter une séance
        </Button>
      </Box>

      {/* Conflict alerts */}
      {conflicts.length > 0 && <ConflictAlert conflicts={conflicts} />}

      {/* Weekly Grid */}
      <Paper variant="outlined" sx={{ overflow: 'auto', mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '100px repeat(6, 1fr)', minWidth: 900 }}>
          {/* Header row */}
          <Box sx={{ p: 1, borderBottom: 1, borderRight: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
            <Typography variant="caption" fontWeight="bold">Heure</Typography>
          </Box>
          {DAYS.map((day) => (
            <Box key={day} sx={{ p: 1, borderBottom: 1, borderRight: 1, borderColor: 'divider', bgcolor: 'action.hover', textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight="bold">{day}</Typography>
            </Box>
          ))}

          {/* Time slot rows */}
          {TIME_SLOTS.map((ts) => (
            <React.Fragment key={ts.start}>
              {/* Time label */}
              <Box sx={{ p: 1, borderBottom: 1, borderRight: 1, borderColor: 'divider', bgcolor: 'action.hover', display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight="bold">
                  {ts.start}
                  <br />
                  {ts.end}
                </Typography>
              </Box>

              {/* Day cells */}
              {DAYS.map((day) => {
                const slot = getSlotForCell(filteredSlots, day, ts.start);

                return (
                  <Box
                    key={`${day}-${ts.start}`}
                    sx={{
                      p: 0.5,
                      borderBottom: 1,
                      borderRight: 1,
                      borderColor: 'divider',
                      minHeight: 100,
                      bgcolor: slot ? 'transparent' : 'background.default',
                    }}
                  >
                    {slot ? (
                      <SessionCard slot={slot} onClick={handleEditSession} />
                    ) : (
                      <Box
                        onClick={handleAddSession}
                        sx={{
                          height: '100%',
                          minHeight: 90,
                          cursor: 'pointer',
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" color="text.disabled">+</Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Paper>

      {/* Color Legend */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Chip label="CM - Cours Magistral" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.CM, color: '#fff' }} />
        <Chip label="TD - Travaux Dirigés" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.TD, color: '#fff' }} />
        <Chip label="TP - Travaux Pratiques" size="small" sx={{ bgcolor: SESSION_TYPE_COLORS.TP, color: '#fff' }} />
      </Box>

      {/* Session Form Dialog */}
      <SessionFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        onDelete={editSlot ? () => handleDelete(editSlot.id) : undefined}
        editSlot={editSlot}
        modules={DEMO_MODULES}
        teachers={DEMO_TEACHERS}
        groups={DEMO_GROUPS}
        rooms={DEMO_ROOMS}
      />
    </Box>
  );
};
