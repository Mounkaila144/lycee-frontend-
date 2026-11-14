'use client';

import React, { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import type { CreateExamSessionRequest, ExamOptions, ExamType } from '../../types';
import { EXAM_TYPE_LABELS, apiErrorMessage } from '../../types';
import { useAvailableRooms, useCreateExamSession, useValidateSchedule } from '../hooks';

interface ExamSessionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (message: string) => void;
  options?: ExamOptions;
  tenantId?: string;
}

type TargetMode = 'classe' | 'level';

interface FormState {
  target: TargetMode;
  classe_id: string;
  level_id: string;
  subject_id: string;
  semester_id: string;
  title: string;
  type: ExamType;
  exam_date: string;
  start_time: string;
  end_time: string;
  instructions: string;
  materials: string;
  room_ids: number[];
}

const EMPTY_FORM: FormState = {
  target: 'classe',
  classe_id: '',
  level_id: '',
  subject_id: '',
  semester_id: '',
  title: '',
  type: 'normal',
  exam_date: '',
  start_time: '08:00',
  end_time: '10:00',
  instructions: '',
  materials: '',
  room_ids: [],
};

/**
 * Création d'une session d'examen lycée : une matière, pour une classe (composition)
 * ou pour tout un niveau (examen blanc), avec date, horaires et salle(s).
 */
export const ExamSessionFormDialog: React.FC<ExamSessionFormDialogProps> = ({ open, onClose, onCreated, options, tenantId }) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateExamSession(tenantId);
  const validateMutation = useValidateSchedule(tenantId);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setError(null);
      validateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const roomParams = form.exam_date && form.start_time && form.end_time
    ? { date: form.exam_date, start_time: form.start_time, end_time: form.end_time }
    : undefined;

  const { data: availableRooms = [], isFetching: roomsLoading } = useAvailableRooms(roomParams, tenantId);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(prev => ({ ...prev, [key]: value }));

  const selectedSubject = options?.subjects.find(subject => String(subject.id) === form.subject_id);
  const selectedClasse = options?.classes.find(classe => String(classe.id) === form.classe_id);
  const selectedLevel = options?.levels.find(level => String(level.id) === form.level_id);

  const suggestedTitle = useMemo(() => {
    if (!selectedSubject) {
      return '';
    }

    const target = form.target === 'classe' ? selectedClasse?.name : selectedLevel?.name;

    return `${EXAM_TYPE_LABELS[form.type]} de ${selectedSubject.name}${target ? ` — ${target}` : ''}`;
  }, [selectedSubject, selectedClasse, selectedLevel, form.target, form.type]);

  const selectedCapacity = availableRooms
    .filter(room => form.room_ids.includes(room.id))
    .reduce((sum, room) => sum + (room.capacity ?? 0), 0);

  const canSubmit = !!form.subject_id
    && (form.target === 'classe' ? !!form.classe_id : !!form.level_id)
    && !!form.exam_date && !!form.start_time && !!form.end_time;

  const buildPayload = (): CreateExamSessionRequest => ({
    subject_id: Number(form.subject_id),
    classe_id: form.target === 'classe' ? Number(form.classe_id) : null,
    level_id: form.target === 'level' ? Number(form.level_id) : null,
    academic_year_id: form.target === 'level' ? options?.academic_year_id ?? null : null,
    semester_id: form.semester_id ? Number(form.semester_id) : null,
    title: form.title.trim() || suggestedTitle,
    type: form.type,
    exam_date: form.exam_date,
    start_time: form.start_time,
    end_time: form.end_time,
    instructions: form.instructions.trim() || undefined,
    allowed_materials: form.materials
      ? form.materials.split(',').map(item => item.trim()).filter(Boolean)
      : undefined,
    room_ids: form.room_ids.length > 0 ? form.room_ids : undefined,
  });

  const handleCheckSchedule = () => {
    const payload = buildPayload();

    validateMutation.mutate({
      exam_date: payload.exam_date,
      start_time: payload.start_time,
      end_time: payload.end_time,
      classe_id: payload.classe_id,
      level_id: payload.level_id,
      academic_year_id: payload.academic_year_id,
      room_ids: payload.room_ids,
    });
  };

  const handleSubmit = () => {
    setError(null);
    createMutation.mutate(buildPayload(), {
      onSuccess: session => {
        onCreated(`Session « ${session.title} » créée (brouillon).`);
        onClose();
      },
      onError: err => setError(apiErrorMessage(err, 'Échec de la création de la session.')),
    });
  };

  const toggleRoom = (roomId: number) => {
    set('room_ids', form.room_ids.includes(roomId)
      ? form.room_ids.filter(id => id !== roomId)
      : [...form.room_ids, roomId]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Nouvelle session d&apos;examen</DialogTitle>
      <DialogContent>
        {options && !options.lycee_ready && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            La mise à jour de la base (sessions par classe/matière) n&apos;est pas encore installée sur cet
            établissement : la création échouera tant qu&apos;elle n&apos;est pas appliquée.
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={form.target}
              onChange={(_, value: TargetMode | null) => value && set('target', value)}
            >
              <ToggleButton value="classe">Une classe</ToggleButton>
              <ToggleButton value="level">Tout un niveau (examen commun)</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            {form.target === 'classe' ? (
              <TextField
                select
                fullWidth
                required
                label="Classe"
                value={form.classe_id}
                onChange={event => set('classe_id', event.target.value)}
              >
                {(options?.classes ?? []).map(classe => (
                  <MenuItem key={classe.id} value={String(classe.id)}>{classe.name}</MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                select
                fullWidth
                required
                label="Niveau"
                value={form.level_id}
                onChange={event => set('level_id', event.target.value)}
                helperText="Toutes les classes du niveau pour l'année en cours"
              >
                {(options?.levels ?? []).map(level => (
                  <MenuItem key={level.id} value={String(level.id)}>{level.name}</MenuItem>
                ))}
              </TextField>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              required
              label="Matière"
              value={form.subject_id}
              onChange={event => set('subject_id', event.target.value)}
            >
              {(options?.subjects ?? []).map(subject => (
                <MenuItem key={subject.id} value={String(subject.id)}>{subject.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Type d'épreuve"
              value={form.type}
              onChange={event => set('type', event.target.value as ExamType)}
            >
              {(Object.keys(EXAM_TYPE_LABELS) as ExamType[]).map(type => (
                <MenuItem key={type} value={type}>{EXAM_TYPE_LABELS[type]}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Semestre"
              value={form.semester_id}
              onChange={event => set('semester_id', event.target.value)}
              helperText="Par défaut : semestre contenant la date"
            >
              <MenuItem value="">Automatique</MenuItem>
              {(options?.semesters ?? []).map(semester => (
                <MenuItem key={semester.id} value={String(semester.id)}>{semester.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Intitulé"
              value={form.title}
              placeholder={suggestedTitle}
              onChange={event => set('title', event.target.value)}
              helperText={!form.title && suggestedTitle ? `Laissé vide : « ${suggestedTitle} »` : ' '}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Date"
              value={form.exam_date}
              onChange={event => set('exam_date', event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              required
              type="time"
              label="Début"
              value={form.start_time}
              onChange={event => set('start_time', event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              required
              type="time"
              label="Fin"
              value={form.end_time}
              onChange={event => set('end_time', event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Salle(s) disponibles sur ce créneau
              {form.room_ids.length > 0 && ` — capacité sélectionnée : ${selectedCapacity} places`}
            </Typography>
            {!roomParams && (
              <Typography variant="body2" color="text.secondary">Choisissez la date et les horaires.</Typography>
            )}
            {roomParams && !roomsLoading && availableRooms.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Aucune salle libre (les salles se créent dans Emploi du temps › Salles). Vous pourrez les affecter plus tard.
              </Typography>
            )}
            {availableRooms.map(room => (
              <FormControlLabel
                key={room.id}
                control={<Checkbox size="small" checked={form.room_ids.includes(room.id)} onChange={() => toggleRoom(room.id)} />}
                label={`${room.name} (${room.capacity} places)`}
              />
            ))}
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Matériel autorisé"
              placeholder="Calculatrice, règle…"
              helperText="Séparer par des virgules"
              value={form.materials}
              onChange={event => set('materials', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Consignes"
              value={form.instructions}
              onChange={event => set('instructions', event.target.value)}
            />
          </Grid>

          {validateMutation.data && (
            <Grid size={{ xs: 12 }}>
              {validateMutation.data.valid ? (
                <Alert severity="success">Aucun conflit d&apos;horaire détecté.</Alert>
              ) : (
                <Alert severity="warning">
                  {validateMutation.data.conflicts.map((conflict, index) => (
                    <div key={index}>
                      {conflict.type === 'room_conflict'
                        ? `Salle ${conflict.room_name} déjà occupée`
                        : `${conflict.classe ?? 'Classe'} déjà en épreuve`}
                      {' '}: « {conflict.conflicting_session} » ({conflict.time})
                    </div>
                  ))}
                </Alert>
              )}
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleCheckSchedule} disabled={!canSubmit || validateMutation.isPending}>
          Vérifier les conflits
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || createMutation.isPending}>
          Créer la session
        </Button>
      </DialogActions>
    </Dialog>
  );
};
