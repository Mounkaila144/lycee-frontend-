'use client';

import React, { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import type { DayOfWeek } from '../../types';
import { DAYS } from '../../types';
import type { LyceeSlot, RefOption, SlotConflict, SlotPayload } from '../../types/lycee.types';

interface SessionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: SlotPayload) => void;
  onDelete?: () => void;
  editSlot?: LyceeSlot;
  saving?: boolean;
  semesterId: number;
  defaults?: Partial<SlotPayload>;
  classes: RefOption[];
  subjects: RefOption[];
  teachers: RefOption[];
  rooms: RefOption[];
  errorMessage?: string | null;
  conflicts?: SlotConflict[];
}

/**
 * Création / modification d'une séance : classe, matière, enseignant, salle (optionnelle), jour et horaires.
 * Les conflits (enseignant, classe, salle) sont détectés côté serveur et affichés ici.
 */
export const SessionFormDialog: React.FC<SessionFormDialogProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  editSlot,
  saving = false,
  semesterId,
  defaults,
  classes,
  subjects,
  teachers,
  rooms,
  errorMessage,
  conflicts = [],
}) => {
  const [classeId, setClasseId] = useState<number | ''>('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [teacherId, setTeacherId] = useState<number | ''>('');
  const [roomId, setRoomId] = useState<number | ''>('');
  const [day, setDay] = useState<DayOfWeek>('Lundi');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setClasseId(editSlot?.classe_id ?? defaults?.classe_id ?? '');
    setSubjectId(editSlot?.subject_id ?? defaults?.subject_id ?? '');
    setTeacherId(editSlot?.teacher_id ?? defaults?.teacher_id ?? '');
    setRoomId(editSlot?.room_id ?? defaults?.room_id ?? '');
    setDay(editSlot?.day_of_week ?? defaults?.day_of_week ?? 'Lundi');
    setStartTime(editSlot?.start_time ?? defaults?.start_time ?? '08:00');
    setEndTime(editSlot?.end_time ?? defaults?.end_time ?? '09:00');
    setNotes(editSlot?.notes ?? '');
  }, [open, editSlot, defaults]);

  const canSave = classeId !== '' && subjectId !== '' && teacherId !== '' && startTime < endTime && !saving;

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    onSave({
      classe_id: Number(classeId),
      subject_id: Number(subjectId),
      teacher_id: Number(teacherId),
      room_id: roomId === '' ? null : Number(roomId),
      semester_id: semesterId,
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
      notes: notes || null,
    });
  };

  const renderSelect = (
    label: string,
    value: number | '',
    onChange: (value: number | '') => void,
    options: RefOption[],
    optional = false,
  ) => (
    <FormControl fullWidth size='small'>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
      >
        {optional && <MenuItem value=''>— Aucune —</MenuItem>}
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{editSlot ? 'Modifier la séance' : 'Nouvelle séance'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          {renderSelect('Classe', classeId, setClasseId, classes)}
          {renderSelect('Matière', subjectId, setSubjectId, subjects)}
          {renderSelect('Enseignant', teacherId, setTeacherId, teachers)}
          {renderSelect('Salle', roomId, setRoomId, rooms, true)}
          <FormControl fullWidth size='small'>
            <InputLabel>Jour</InputLabel>
            <Select value={day} label='Jour' onChange={(event) => setDay(event.target.value as DayOfWeek)}>
              {DAYS.map((dayOption) => (
                <MenuItem key={dayOption} value={dayOption}>
                  {dayOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size='small'
              type='time'
              label='Début'
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              size='small'
              type='time'
              label='Fin'
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              error={startTime >= endTime}
              fullWidth
            />
          </Box>
          <TextField
            size='small'
            label='Notes'
            multiline
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            sx={{ gridColumn: '1 / -1' }}
          />
        </Box>

        {errorMessage && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {errorMessage}
            {conflicts.length > 0 && (
              <Box component='ul' sx={{ m: 0, pl: 2 }}>
                {conflicts.map((conflict, index) => (
                  <li key={`${conflict.type}-${index}`}>{conflict.message}</li>
                ))}
              </Box>
            )}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        {onDelete && (
          <Button color='error' onClick={onDelete} sx={{ mr: 'auto' }} disabled={saving}>
            Supprimer
          </Button>
        )}
        <Button onClick={onClose}>Annuler</Button>
        <Button variant='contained' onClick={handleSave} disabled={!canSave}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
