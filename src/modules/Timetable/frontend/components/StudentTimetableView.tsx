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

import { WeeklyTimetableGrid } from '../../admin/components/WeeklyTimetableGrid';
import { flattenGrid, lyceeTimetableService } from '../../admin/services/lyceeTimetableService';
import type { RefOption, SemesterOption, TimetableGridResponse } from '../../types/lycee.types';

/**
 * Emploi du temps d'un élève (Administrator / Manager) : classe → élève → emploi du temps de sa classe active.
 * Backend : GET /admin/timetable/students/{studentId}
 */
export const StudentTimetableView: React.FC = () => {
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [classes, setClasses] = useState<RefOption[]>([]);
  const [students, setStudents] = useState<RefOption[]>([]);
  const [semesterId, setSemesterId] = useState<number | ''>('');
  const [classeId, setClasseId] = useState<number | ''>('');
  const [studentId, setStudentId] = useState<number | ''>('');
  const [grid, setGrid] = useState<TimetableGridResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lyceeTimetableService
      .getReferenceData()
      .then((data) => {
        setSemesters(data.semesters);
        setClasses(data.classes);
        const activeSemester = data.semesters.find((semester) => semester.is_active) ?? data.semesters[0];

        if (activeSemester) {
          setSemesterId(activeSemester.id);
        }
      })
      .catch((requestError) => setError(requestError?.response?.data?.message ?? 'Erreur de chargement.'));
  }, []);

  useEffect(() => {
    setStudentId('');
    setStudents([]);

    if (classeId === '') {
      return;
    }

    lyceeTimetableService
      .getClasseStudents(Number(classeId))
      .then(setStudents)
      .catch(() => setStudents([]));
  }, [classeId]);

  useEffect(() => {
    if (studentId === '') {
      setGrid(null);

      return;
    }

    setLoading(true);
    setError(null);

    lyceeTimetableService
      .getStudentTimetable(Number(studentId), semesterId === '' ? undefined : Number(semesterId))
      .then(setGrid)
      .catch((requestError) => setError(requestError?.response?.data?.message ?? 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, [studentId, semesterId]);

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant='h4' fontWeight='bold' sx={{ mb: 2 }}>
        Emploi du temps d&apos;un élève
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Semestre</InputLabel>
          <Select
            value={semesterId}
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

        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Classe</InputLabel>
          <Select
            value={classeId}
            label='Classe'
            onChange={(event) => setClasseId(event.target.value === '' ? '' : Number(event.target.value))}
          >
            {classes.map((classe) => (
              <MenuItem key={classe.id} value={classe.id}>
                {classe.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 240 }} disabled={classeId === ''}>
          <InputLabel>Élève</InputLabel>
          <Select
            value={studentId}
            label='Élève'
            onChange={(event) => setStudentId(event.target.value === '' ? '' : Number(event.target.value))}
          >
            {students.map((student) => (
              <MenuItem key={student.id} value={student.id}>
                {student.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {grid?.classe === null && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          Cet élève n&apos;est affecté à aucune classe active.
        </Alert>
      )}

      {studentId === '' ? (
        <Alert severity='info'>Sélectionnez une classe puis un élève.</Alert>
      ) : loading ? (
        <Box display='flex' justifyContent='center' p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <WeeklyTimetableGrid slots={flattenGrid(grid)} />
      )}
    </Box>
  );
};
