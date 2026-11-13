'use client';

import React, { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import { useAuthUser } from '@/shared/hooks/useAuthUser';

import { WeeklyTimetableGrid } from '../../admin/components/WeeklyTimetableGrid';
import { flattenGrid, lyceeTimetableService } from '../../admin/services/lyceeTimetableService';
import type { RefOption, SemesterOption, TimetableGridResponse } from '../../types/lycee.types';

/**
 * Emploi du temps enseignant.
 * - Professeur : son propre emploi du temps (GET /admin/timetable/me).
 * - Administrator / Manager : choix de l'enseignant (GET /admin/timetable/teachers/{id}).
 */
export const TeacherTimetableView: React.FC = () => {
  const user = useAuthUser();
  const isManager = !!user?.roles.some((role) => role === 'Administrator' || role === 'Manager');

  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [teachers, setTeachers] = useState<RefOption[]>([]);
  const [semesterId, setSemesterId] = useState<number | ''>('');
  const [teacherId, setTeacherId] = useState<number | ''>('');
  const [grid, setGrid] = useState<TimetableGridResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    lyceeTimetableService
      .getReferenceData()
      .then((data) => {
        setSemesters(data.semesters);
        setTeachers(data.teachers);
      })
      .catch(() => {
        setSemesters([]);
      });
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (isManager && (teacherId === '' || semesterId === '')) {
      setGrid(null);

      return;
    }

    setLoading(true);
    setError(null);

    const request = isManager
      ? lyceeTimetableService.getTeacherTimetable(Number(teacherId), Number(semesterId))
      : lyceeTimetableService.getMyTimetable(semesterId === '' ? undefined : Number(semesterId));

    request
      .then((response) => {
        setGrid(response);

        if (semesterId === '' && response.semester_id) {
          setSemesterId(response.semester_id);
        }
      })
      .catch((requestError) =>
        setError(requestError?.response?.data?.message ?? 'Impossible de charger l’emploi du temps.'),
      )
      .finally(() => setLoading(false));
  }, [user, isManager, teacherId, semesterId]);

  useEffect(() => {
    if (isManager && semesterId === '' && semesters.length > 0) {
      setSemesterId((semesters.find((semester) => semester.is_active) ?? semesters[0]).id);
    }
  }, [isManager, semesterId, semesters]);

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant='h4' fontWeight='bold' sx={{ mb: 2 }}>
        {isManager ? 'Emploi du temps enseignant' : 'Mon emploi du temps'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Semestre</InputLabel>
          <Select
            value={semesters.some((semester) => semester.id === semesterId) ? semesterId : ''}
            label='Semestre'
            onChange={(event) => setSemesterId(event.target.value === '' ? '' : Number(event.target.value))}
          >
            {semesters.map((semester) => (
              <MenuItem key={semester.id} value={semester.id}>
                {semester.label}
                {semester.is_active ? ' (actif)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isManager && (
          <FormControl size='small' sx={{ minWidth: 220 }}>
            <InputLabel>Enseignant</InputLabel>
            <Select
              value={teacherId}
              label='Enseignant'
              onChange={(event) => setTeacherId(event.target.value === '' ? '' : Number(event.target.value))}
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {grid && (
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          {grid.total_slots} séance(s) par semaine
        </Typography>
      )}

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isManager && teacherId === '' ? (
        <Alert severity='info'>Sélectionnez un enseignant.</Alert>
      ) : loading ? (
        <Box display='flex' justifyContent='center' p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <WeeklyTimetableGrid slots={flattenGrid(grid)} secondaryInfo='classe' />
      )}
    </Box>
  );
};
