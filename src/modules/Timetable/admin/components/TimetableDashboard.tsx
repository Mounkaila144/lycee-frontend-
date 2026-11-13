'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { useAuthUser } from '@/shared/hooks/useAuthUser';

import { SessionFormDialog } from './SessionFormDialog';
import { WeeklyTimetableGrid } from './WeeklyTimetableGrid';
import { flattenGrid, lyceeTimetableService } from '../services/lyceeTimetableService';
import type {
  LyceeSlot,
  SlotConflict,
  SlotPayload,
  TimetableGridResponse,
  TimetableReferenceData,
} from '../../types/lycee.types';

type ViewTab = 'classe' | 'teacher' | 'room';

interface ApiError {
  response?: { status?: number; data?: { message?: string; conflicts?: SlotConflict[]; errors?: Record<string, string[]> } };
  message?: string;
}

const extractError = (error: unknown): { message: string; conflicts: SlotConflict[] } => {
  const apiError = error as ApiError;
  const data = apiError.response?.data;
  const validationMessages = data?.errors ? Object.values(data.errors).flat() : [];

  return {
    message: [data?.message ?? apiError.message ?? 'Erreur inattendue.', ...validationMessages.slice(0, 3)].join(' '),
    conflicts: data?.conflicts ?? [],
  };
};

/**
 * Planification des emplois du temps (Administrator / Manager) : vue par classe, enseignant ou salle,
 * création / modification / suppression des séances avec détection des conflits côté serveur.
 */
export const TimetableDashboard: React.FC = () => {
  const user = useAuthUser();
  const canManage = !!user?.roles.some((role) => role === 'Administrator' || role === 'Manager');

  const [reference, setReference] = useState<(TimetableReferenceData & { classAcademicYears: Record<number, number> }) | null>(null);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [semesterId, setSemesterId] = useState<number | ''>('');
  const [tab, setTab] = useState<ViewTab>('classe');
  const [entityId, setEntityId] = useState<number | ''>('');
  const [grid, setGrid] = useState<TimetableGridResponse | null>(null);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<LyceeSlot | undefined>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formConflicts, setFormConflicts] = useState<SlotConflict[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    lyceeTimetableService
      .getReferenceData()
      .then((data) => {
        setReference(data);
        const activeSemester = data.semesters.find((semester) => semester.is_active) ?? data.semesters[0];

        if (activeSemester) {
          setSemesterId(activeSemester.id);
        }
      })
      .catch((error) => setReferenceError(extractError(error).message));
  }, []);

  const selectedSemester = reference?.semesters.find((semester) => semester.id === semesterId);

  const classesForSemester = useMemo(() => {
    if (!reference) {
      return [];
    }

    if (!selectedSemester) {
      return reference.classes;
    }

    return reference.classes.filter(
      (classe) => reference.classAcademicYears[classe.id] === selectedSemester.academic_year_id,
    );
  }, [reference, selectedSemester]);

  const entityOptions = useMemo(() => {
    if (!reference) {
      return [];
    }

    return { classe: classesForSemester, teacher: reference.teachers, room: reference.rooms }[tab];
  }, [reference, tab, classesForSemester]);

  const loadGrid = useCallback(async () => {
    if (semesterId === '' || entityId === '') {
      setGrid(null);

      return;
    }

    setLoadingGrid(true);
    setGridError(null);

    try {
      const loaders: Record<ViewTab, () => Promise<TimetableGridResponse>> = {
        classe: () => lyceeTimetableService.getClasseTimetable(Number(entityId), Number(semesterId)),
        teacher: () => lyceeTimetableService.getTeacherTimetable(Number(entityId), Number(semesterId)),
        room: () => lyceeTimetableService.getRoomTimetable(Number(entityId), Number(semesterId)),
      };

      setGrid(await loaders[tab]());
    } catch (error) {
      setGridError(extractError(error).message);
      setGrid(null);
    } finally {
      setLoadingGrid(false);
    }
  }, [semesterId, entityId, tab]);

  useEffect(() => {
    loadGrid();
  }, [loadGrid]);

  const openCreate = () => {
    setEditSlot(undefined);
    setFormError(null);
    setFormConflicts([]);
    setDialogOpen(true);
  };

  const openEdit = (slot: LyceeSlot) => {
    if (!canManage) {
      return;
    }

    setEditSlot(slot);
    setFormError(null);
    setFormConflicts([]);
    setDialogOpen(true);
  };

  const handleSave = async (payload: SlotPayload) => {
    setSaving(true);
    setFormError(null);
    setFormConflicts([]);

    try {
      if (editSlot) {
        await lyceeTimetableService.updateSlot(editSlot.id, payload);
        setSuccessMessage('Séance modifiée.');
      } else {
        await lyceeTimetableService.createSlot(payload);
        setSuccessMessage('Séance créée.');
      }

      setDialogOpen(false);
      await loadGrid();
    } catch (error) {
      const { message, conflicts } = extractError(error);

      setFormError(message);
      setFormConflicts(conflicts);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editSlot || !window.confirm('Supprimer cette séance ?')) {
      return;
    }

    setSaving(true);

    try {
      await lyceeTimetableService.deleteSlot(editSlot.id);
      setDialogOpen(false);
      setSuccessMessage('Séance supprimée.');
      await loadGrid();
    } catch (error) {
      setFormError(extractError(error).message);
    } finally {
      setSaving(false);
    }
  };

  const dialogDefaults = useMemo<Partial<SlotPayload>>(() => {
    if (entityId === '') {
      return {};
    }

    return {
      classe: { classe_id: Number(entityId) },
      teacher: { teacher_id: Number(entityId) },
      room: { room_id: Number(entityId) },
    }[tab];
  }, [tab, entityId]);

  if (referenceError) {
    return <Alert severity='error'>{referenceError}</Alert>;
  }

  if (!reference) {
    return (
      <Box display='flex' justifyContent='center' p={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant='h4' fontWeight='bold'>
          Planification des emplois du temps
        </Typography>
        {canManage && (
          <Button variant='contained' onClick={openCreate} disabled={semesterId === ''}>
            + Ajouter une séance
          </Button>
        )}
      </Box>

      {successMessage && (
        <Alert severity='success' sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={(_, value: ViewTab) => {
          setTab(value);
          setEntityId('');
        }}
        sx={{ mb: 2 }}
      >
        <Tab value='classe' label='Par classe' />
        <Tab value='teacher' label='Par enseignant' />
        <Tab value='room' label='Par salle' />
      </Tabs>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Semestre</InputLabel>
          <Select
            value={semesterId}
            label='Semestre'
            onChange={(event) => {
              setSemesterId(event.target.value === '' ? '' : Number(event.target.value));

              if (tab === 'classe') {
                setEntityId('');
              }
            }}
          >
            {reference.semesters.map((semester) => (
              <MenuItem key={semester.id} value={semester.id}>
                {semester.label}
                {semester.is_active ? ' (actif)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 220 }}>
          <InputLabel>{{ classe: 'Classe', teacher: 'Enseignant', room: 'Salle' }[tab]}</InputLabel>
          <Select
            value={entityId}
            label={{ classe: 'Classe', teacher: 'Enseignant', room: 'Salle' }[tab]}
            onChange={(event) => setEntityId(event.target.value === '' ? '' : Number(event.target.value))}
          >
            {entityOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {tab === 'room' && reference.rooms.length === 0 && (
        <Alert severity='info' sx={{ mb: 2 }}>
          Aucune salle n&apos;est enregistrée. Les séances peuvent être créées sans salle (salle de classe par défaut).
        </Alert>
      )}

      {gridError && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {gridError}
        </Alert>
      )}

      {entityId === '' ? (
        <Alert severity='info'>Sélectionnez un semestre et une {tab === 'teacher' ? 'personne' : tab === 'room' ? 'salle' : 'classe'} pour afficher l&apos;emploi du temps.</Alert>
      ) : loadingGrid ? (
        <Box display='flex' justifyContent='center' p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <WeeklyTimetableGrid
          slots={flattenGrid(grid)}
          secondaryInfo={tab === 'classe' ? 'teacher' : 'classe'}
          onSlotClick={canManage ? openEdit : undefined}
        />
      )}

      {canManage && semesterId !== '' && (
        <SessionFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          onDelete={editSlot ? handleDelete : undefined}
          editSlot={editSlot}
          saving={saving}
          semesterId={Number(semesterId)}
          defaults={dialogDefaults}
          classes={classesForSemester}
          subjects={reference.subjects}
          teachers={reference.teachers}
          rooms={reference.rooms}
          errorMessage={formError}
          conflicts={formConflicts}
        />
      )}
    </Box>
  );
};
