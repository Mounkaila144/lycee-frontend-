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

import type { ExceptionType, TimetableException } from '../../types';
import { EXCEPTION_TYPE_LABELS, EXCEPTION_TYPE_ICONS, EXCEPTION_TYPE_COLORS } from '../../types';

// ──── Demo Data ────

const DEMO_SESSIONS = [
  { id: 1, label: 'Algorithmes CM - Lundi 08:00-10:00 (Dr. Dupont)' },
  { id: 2, label: 'BDD TD - Lundi 10:00-12:00 (Prof. Martin)' },
  { id: 3, label: 'Réseaux TP - Mardi 08:00-10:00 (Dr. Bernard)' },
  { id: 4, label: 'SE CM - Mardi 14:00-16:00 (Prof. Petit)' },
  { id: 5, label: 'Web TP - Mercredi 10:00-12:00 (Dr. Dupont)' },
];

const DEMO_ROOMS = [
  { id: 1, name: 'Amphi A' },
  { id: 2, name: 'Salle TD-101' },
  { id: 3, name: 'Labo Info-1' },
  { id: 4, name: 'Salle TD-102' },
];

const DEMO_TEACHERS = [
  { id: 1, name: 'Dr. Dupont' },
  { id: 2, name: 'Prof. Martin' },
  { id: 3, name: 'Dr. Bernard' },
  { id: 5, name: 'Dr. Leroy' },
];

const DEMO_UPCOMING: TimetableException[] = [
  {
    id: 1, timetable_slot_id: 1, exception_date: '2025-02-10', exception_type: 'cancellation',
    original_values: {}, new_values: {}, reason: 'Enseignant en déplacement professionnel',
    notify_students: true, created_by: 1, created_at: '2025-02-05T10:00:00', updated_at: '2025-02-05T10:00:00',
    timetable_slot: { id: 1, module: { id: 1, name: 'Algorithmes' }, teacher: { id: 1, name: 'Dr. Dupont' }, room: { id: 1, name: 'Amphi A' }, group: { id: 1, name: 'L3 Info G1' }, day_of_week: 'Lundi', start_time: '08:00', end_time: '10:00' },
    creator: { id: 1, name: 'Admin' },
  },
  {
    id: 2, timetable_slot_id: 3, exception_date: '2025-02-11', exception_type: 'room_change',
    original_values: { room_id: 3, room_name: 'Labo Info-1' }, new_values: { room_id: 4, room_name: 'Salle TD-102' },
    reason: 'Labo Info-1 en maintenance', notify_students: true, created_by: 1,
    created_at: '2025-02-06T14:00:00', updated_at: '2025-02-06T14:00:00',
    timetable_slot: { id: 3, module: { id: 3, name: 'Réseaux' }, teacher: { id: 3, name: 'Dr. Bernard' }, room: { id: 3, name: 'Labo Info-1' }, group: { id: 1, name: 'L3 Info G1' }, day_of_week: 'Mardi', start_time: '08:00', end_time: '10:00' },
    creator: { id: 1, name: 'Admin' },
  },
  {
    id: 3, timetable_slot_id: 4, exception_date: '2025-02-11', exception_type: 'teacher_replacement',
    original_values: { teacher_id: 4, teacher_name: 'Prof. Petit' }, new_values: { teacher_id: 5, teacher_name: 'Dr. Leroy' },
    reason: 'Prof. Petit en congé maladie', notify_students: true, created_by: 1,
    created_at: '2025-02-07T09:00:00', updated_at: '2025-02-07T09:00:00',
    timetable_slot: { id: 4, module: { id: 4, name: 'Systèmes d\'exploitation' }, teacher: { id: 4, name: 'Prof. Petit' }, room: { id: 1, name: 'Amphi A' }, group: { id: 1, name: 'L3 Info G1' }, day_of_week: 'Mardi', start_time: '14:00', end_time: '16:00' },
    creator: { id: 1, name: 'Admin' },
  },
];

const DEMO_HISTORY: TimetableException[] = [
  ...DEMO_UPCOMING,
  {
    id: 4, timetable_slot_id: 2, exception_date: '2025-01-27', exception_type: 'time_change',
    original_values: { start_time: '10:00', end_time: '12:00' }, new_values: { start_time: '14:00', end_time: '16:00' },
    reason: 'Décalage pour événement universitaire', notify_students: true, created_by: 1,
    created_at: '2025-01-20T11:00:00', updated_at: '2025-01-20T11:00:00',
    timetable_slot: { id: 2, module: { id: 2, name: 'BDD' }, teacher: { id: 2, name: 'Prof. Martin' }, room: { id: 2, name: 'TD-101' }, group: { id: 1, name: 'L3 Info G1' }, day_of_week: 'Lundi', start_time: '10:00', end_time: '12:00' },
    creator: { id: 1, name: 'Admin' },
  },
  {
    id: 5, timetable_slot_id: 5, exception_date: '2025-01-15', exception_type: 'cancellation',
    original_values: {}, new_values: {}, reason: 'Jour férié', notify_students: false, created_by: 1,
    created_at: '2025-01-10T08:00:00', updated_at: '2025-01-10T08:00:00', deleted_at: '2025-01-12T10:00:00',
    timetable_slot: { id: 5, module: { id: 5, name: 'Programmation Web' }, teacher: { id: 1, name: 'Dr. Dupont' }, room: { id: 3, name: 'Labo Info-1' }, group: { id: 1, name: 'L3 Info G1' }, day_of_week: 'Mercredi', start_time: '10:00', end_time: '12:00' },
    creator: { id: 1, name: 'Admin' },
  },
];

// ──── Exception Card ────

const ExceptionCard: React.FC<{ exception: TimetableException; onCancel: (id: number) => void }> = ({ exception, onCancel }) => {
  const icon = EXCEPTION_TYPE_ICONS[exception.exception_type];
  const color = EXCEPTION_TYPE_COLORS[exception.exception_type];
  const label = EXCEPTION_TYPE_LABELS[exception.exception_type];
  const slot = exception.timetable_slot;

  return (
    <Card variant="outlined" sx={{ borderLeft: `4px solid ${color}`, mb: 1.5 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="body1">{icon}</Typography>
              <Chip label={label} size="small" sx={{ bgcolor: color, color: '#fff' }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(exception.exception_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Typography>
            </Box>
            <Typography variant="subtitle2">{slot?.module?.name} ({slot?.day_of_week} {slot?.start_time}-{slot?.end_time})</Typography>
            <Typography variant="body2" color="text.secondary">{exception.reason}</Typography>
            {exception.exception_type === 'room_change' && (
              <Typography variant="caption" color="warning.main">
                {String(exception.original_values.room_name)} → {String(exception.new_values.room_name)}
              </Typography>
            )}
            {exception.exception_type === 'teacher_replacement' && (
              <Typography variant="caption" color="warning.main">
                {String(exception.original_values.teacher_name)} → {String(exception.new_values.teacher_name)}
              </Typography>
            )}
          </Box>
          <Button size="small" color="error" onClick={() => onCancel(exception.id)}>Annuler</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// ──── Main ────

export const ExceptionDashboard: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const [activeTab, setActiveTab] = useState(0);
  const [exceptions, setExceptions] = useState(DEMO_UPCOMING);
  const [history] = useState(DEMO_HISTORY);

  // Creation form state
  const [selectedSession, setSelectedSession] = useState<number>(0);
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionType, setExceptionType] = useState<ExceptionType>('cancellation');
  const [reason, setReason] = useState('');
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [newRoomId, setNewRoomId] = useState<number>(0);
  const [newTeacherId, setNewTeacherId] = useState<number>(0);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newDate, setNewDate] = useState('');
  const [created, setCreated] = useState(false);

  const handleCancel = (id: number) => {
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  };

  const handleCreate = () => {
    setCreated(true);
    setTimeout(() => setCreated(false), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Accueil</Link>
        <Link underline="hover" color="inherit" href="#">Emplois du Temps</Link>
        <Typography color="text.primary">Modifications Ponctuelles</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Modifications Ponctuelles</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<span>🗓️</span>} onClick={() => router.push(`/${lang}/admin/timetable/schedule`)}>
            Planification
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>👥</span>} onClick={() => router.push(`/${lang}/admin/timetable/group-view`)}>
            EDT Groupe
          </Button>
          <Button size="small" variant="outlined" startIcon={<span>👨‍🏫</span>} onClick={() => router.push(`/${lang}/admin/timetable/teacher-view`)}>
            EDT Enseignant
          </Button>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Exceptions à venir (${exceptions.length})`} />
        <Tab label="Historique" />
        <Tab label="Créer une exception" />
      </Tabs>

      {/* Tab 0: Upcoming */}
      {activeTab === 0 && (
        <Box>
          {exceptions.length === 0 ? (
            <Alert severity="info">Aucune exception à venir pour les 7 prochains jours.</Alert>
          ) : (
            exceptions.map((ex) => (
              <ExceptionCard key={ex.id} exception={ex} onCancel={handleCancel} />
            ))
          )}
        </Box>
      )}

      {/* Tab 1: History */}
      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Raison</TableCell>
                <TableCell>Créé par</TableCell>
                <TableCell align="center">Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((ex) => (
                <TableRow key={ex.id} hover>
                  <TableCell>{new Date(ex.exception_date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{ex.timetable_slot?.module?.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{EXCEPTION_TYPE_ICONS[ex.exception_type]}</span>
                      <Typography variant="body2">{EXCEPTION_TYPE_LABELS[ex.exception_type]}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{ex.reason}</Typography></TableCell>
                  <TableCell>{ex.creator?.name}</TableCell>
                  <TableCell align="center">
                    {ex.deleted_at ? (
                      <Chip label="Annulée" size="small" color="default" />
                    ) : (
                      <Chip label="Active" size="small" color="success" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 2: Create */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Créer une exception</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Séance concernée</InputLabel>
                  <Select value={selectedSession} label="Séance concernée" onChange={(e) => setSelectedSession(e.target.value as number)}>
                    <MenuItem value={0} disabled>Sélectionner une séance</MenuItem>
                    {DEMO_SESSIONS.map((s) => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth size="small" label="Date de l'exception" type="date" value={exceptionDate} onChange={(e) => setExceptionDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type d'exception</InputLabel>
                  <Select value={exceptionType} label="Type d'exception" onChange={(e) => setExceptionType(e.target.value as ExceptionType)}>
                    {(Object.entries(EXCEPTION_TYPE_LABELS) as [ExceptionType, string][]).map(([key, label]) => (
                      <MenuItem key={key} value={key}>{EXCEPTION_TYPE_ICONS[key]} {label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Conditional fields */}
              {exceptionType === 'room_change' && (
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Nouvelle salle</InputLabel>
                    <Select value={newRoomId} label="Nouvelle salle" onChange={(e) => setNewRoomId(e.target.value as number)}>
                      {DEMO_ROOMS.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {exceptionType === 'teacher_replacement' && (
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Enseignant remplaçant</InputLabel>
                    <Select value={newTeacherId} label="Enseignant remplaçant" onChange={(e) => setNewTeacherId(e.target.value as number)}>
                      {DEMO_TEACHERS.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {exceptionType === 'time_change' && (
                <>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="Nouvelle heure début" type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="Nouvelle heure fin" type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} InputLabelProps={{ shrink: true }} />
                  </Grid>
                </>
              )}

              {exceptionType === 'date_change' && (
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Nouvelle date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Raison (obligatoire)" multiline rows={2} value={reason} onChange={(e) => setReason(e.target.value)} required />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel control={<Checkbox checked={notifyStudents} onChange={(e) => setNotifyStudents(e.target.checked)} />} label="Notifier les étudiants automatiquement" />
              </Grid>

              {notifyStudents && reason && selectedSession > 0 && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                    <strong>Aperçu notification:</strong>{' '}
                    {exceptionType === 'cancellation' && `Le cours du ${exceptionDate} est annulé. Raison: ${reason}`}
                    {exceptionType === 'room_change' && `Le cours du ${exceptionDate} a lieu en ${DEMO_ROOMS.find((r) => r.id === newRoomId)?.name || '...'}`}
                    {exceptionType === 'teacher_replacement' && `Le cours du ${exceptionDate} sera assuré par ${DEMO_TEACHERS.find((t) => t.id === newTeacherId)?.name || '...'}`}
                    {exceptionType === 'time_change' && `Le cours du ${exceptionDate} a lieu à ${newStartTime || '...'}`}
                    {exceptionType === 'date_change' && `Le cours du ${exceptionDate} est reporté au ${newDate || '...'}`}
                    {exceptionType === 'exceptional_session' && `Séance exceptionnelle le ${exceptionDate}. ${reason}`}
                  </Alert>
                </Grid>
              )}

              {created && (
                <Grid item xs={12}>
                  <Alert severity="success">Exception créée avec succès !</Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button variant="contained" fullWidth onClick={handleCreate} disabled={!selectedSession || !exceptionDate || !reason}>
                  Créer l'exception
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
