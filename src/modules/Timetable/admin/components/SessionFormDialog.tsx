'use client';

import React, { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import type { TimetableSlot, SessionType, DayOfWeek, ModuleRef, TeacherRef, GroupRef, RoomRef } from '../../types';
import { DAYS, SESSION_TYPE_COLORS } from '../../types';

interface SessionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<TimetableSlot>) => void;
  onDelete?: () => void;
  editSlot?: TimetableSlot;
  modules?: ModuleRef[];
  teachers?: TeacherRef[];
  groups?: GroupRef[];
  rooms?: RoomRef[];
}

const TIME_OPTIONS = ['08:00', '10:00', '14:00', '16:00'];
const END_TIME_MAP: Record<string, string> = { '08:00': '10:00', '10:00': '12:00', '14:00': '16:00', '16:00': '18:00' };

export const SessionFormDialog: React.FC<SessionFormDialogProps> = ({
  open, onClose, onSave, onDelete, editSlot, modules = [], teachers = [], groups = [], rooms = [],
}) => {
  const [moduleId, setModuleId] = useState<number>(0);
  const [teacherId, setTeacherId] = useState<number>(0);
  const [groupId, setGroupId] = useState<number>(0);
  const [roomId, setRoomId] = useState<number>(0);
  const [type, setType] = useState<SessionType>('CM');
  const [day, setDay] = useState<DayOfWeek>('Lundi');
  const [startTime, setStartTime] = useState('08:00');
  const [isRecurring, setIsRecurring] = useState(true);
  const [notes, setNotes] = useState('');
  const [conflictMessage, setConflictMessage] = useState('');

  useEffect(() => {
    if (editSlot) {
      setModuleId(editSlot.module_id);
      setTeacherId(editSlot.teacher_id || 0);
      setGroupId(editSlot.group_id);
      setRoomId(editSlot.room_id || 0);
      setType(editSlot.type);
      setDay(editSlot.day_of_week);
      setStartTime(editSlot.start_time);
      setIsRecurring(editSlot.is_recurring);
      setNotes(editSlot.notes || '');
    } else {
      setModuleId(modules[0]?.id || 0);
      setTeacherId(teachers[0]?.id || 0);
      setGroupId(groups[0]?.id || 0);
      setRoomId(rooms[0]?.id || 0);
      setType('CM');
      setDay('Lundi');
      setStartTime('08:00');
      setIsRecurring(true);
      setNotes('');
    }

    setConflictMessage('');
  }, [editSlot, open, modules, teachers, groups, rooms]);

  const handleCheckConflicts = () => {
    // Demo conflict check
    if (day === 'Lundi' && startTime === '08:00' && !editSlot) {
      setConflictMessage('Conflit enseignant: Dr. Dupont déjà occupé Lundi 08:00-10:00 (Algorithmes CM)');
    } else {
      setConflictMessage('');
    }
  };

  const handleSave = () => {
    const selectedModule = modules.find((m) => m.id === moduleId);
    const selectedTeacher = teachers.find((t) => t.id === teacherId);
    const selectedGroup = groups.find((g) => g.id === groupId);
    const selectedRoom = rooms.find((r) => r.id === roomId);

    onSave({
      module_id: moduleId,
      teacher_id: teacherId,
      group_id: groupId,
      room_id: roomId,
      type,
      day_of_week: day,
      start_time: startTime,
      end_time: END_TIME_MAP[startTime] || '10:00',
      is_recurring: isRecurring,
      notes,
      module: selectedModule,
      teacher: selectedTeacher,
      group: selectedGroup,
      room: selectedRoom,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editSlot ? 'Modifier séance' : 'Nouvelle séance'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Module</InputLabel>
              <Select value={moduleId} label="Module" onChange={(e) => setModuleId(e.target.value as number)}>
                {modules.map((m) => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Enseignant</InputLabel>
              <Select value={teacherId} label="Enseignant" onChange={(e) => setTeacherId(e.target.value as number)}>
                {teachers.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Groupe</InputLabel>
              <Select value={groupId} label="Groupe" onChange={(e) => setGroupId(e.target.value as number)}>
                {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Salle</InputLabel>
              <Select value={roomId} label="Salle" onChange={(e) => setRoomId(e.target.value as number)}>
                {rooms.map((r) => <MenuItem key={r.id} value={r.id}>{r.name} ({r.capacity})</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={type} label="Type" onChange={(e) => setType(e.target.value as SessionType)}>
                <MenuItem value="CM">CM - Cours Magistral</MenuItem>
                <MenuItem value="TD">TD - Travaux Dirigés</MenuItem>
                <MenuItem value="TP">TP - Travaux Pratiques</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Jour</InputLabel>
              <Select value={day} label="Jour" onChange={(e) => setDay(e.target.value as DayOfWeek)}>
                {DAYS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Heure début</InputLabel>
              <Select value={startTime} label="Heure début" onChange={(e) => setStartTime(e.target.value)}>
                {TIME_OPTIONS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              size="small"
              label="Heure fin"
              value={END_TIME_MAP[startTime] || ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />}
              label="Récurrent (chaque semaine du semestre)"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Notes"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="outlined" size="small" onClick={handleCheckConflicts}>
              Vérifier conflits
            </Button>
          </Grid>

          {conflictMessage && (
            <Grid item xs={12}>
              <Alert severity="error">{conflictMessage}</Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        {onDelete && (
          <Button color="error" onClick={onDelete} sx={{ mr: 'auto' }}>
            Supprimer
          </Button>
        )}
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSave}>Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
};
