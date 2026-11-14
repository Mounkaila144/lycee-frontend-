'use client';

import React, { useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import { useAttendanceClasses, useSemesters } from '../hooks';
import type { ClasseSummary, ReportFilters, SemesterSummary } from '../../types';

export interface AttendanceFilterValues {
  semesterId: number | '';
  classeId: number | '';
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_ATTENDANCE_FILTERS: AttendanceFilterValues = {
  semesterId: '',
  classeId: '',
  dateFrom: '',
  dateTo: '',
};

/** Convertit les valeurs du formulaire en paramètres d'API (undefined tant qu'aucun semestre). */
export const toReportFilters = (values: AttendanceFilterValues): ReportFilters | undefined => {
  if (!values.semesterId) return undefined;

  return {
    semester_id: values.semesterId,
    classe_id: values.classeId || undefined,
    date_from: values.dateFrom || undefined,
    date_to: values.dateTo || undefined,
  };
};

const defaultSemester = (semesters: SemesterSummary[]): SemesterSummary | undefined =>
  semesters.find(s => s.is_current) ?? semesters.find(s => s.is_active) ?? semesters[0];

interface AttendanceFilterBarProps {
  value: AttendanceFilterValues;
  onChange: (value: AttendanceFilterValues) => void;
  showDates?: boolean;
}

/**
 * Filtres semestre / classe / période des écrans Suivi et Rapports de présences.
 * Les classes proposées sont celles de l'utilisateur (toutes pour l'administration,
 * celles du professeur sinon) pour l'année scolaire du semestre choisi.
 */
export const AttendanceFilterBar: React.FC<AttendanceFilterBarProps> = ({ value, onChange, showDates = false }) => {
  const { data: semesters = [], isLoading: semestersLoading } = useSemesters();
  const { data: classes = [] } = useAttendanceClasses();

  useEffect(() => {
    if (value.semesterId === '' && semesters.length > 0) {
      const semester = defaultSemester(semesters);

      if (semester) onChange({ ...value, semesterId: semester.id });
    }
  }, [semesters, value, onChange]);

  const selectedSemester = semesters.find(s => s.id === value.semesterId);

  const semesterClasses = useMemo<ClasseSummary[]>(
    () => (selectedSemester
      ? classes.filter(c => !c.academic_year_id || c.academic_year_id === selectedSemester.academic_year_id)
      : classes),
    [classes, selectedSemester],
  );

  const hasOptionalFilters = value.classeId !== '' || value.dateFrom !== '' || value.dateTo !== '';

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <FormControl size="small" sx={{ minWidth: 220 }} disabled={semestersLoading}>
        <InputLabel>Semestre</InputLabel>
        <Select
          label="Semestre"
          value={selectedSemester ? value.semesterId : ''}
          onChange={e => onChange({ ...value, semesterId: e.target.value as number, classeId: '' })}
        >
          {semesters.map(s => (
            <MenuItem key={s.id} value={s.id}>
              {s.name} ({new Date(s.start_date).toLocaleDateString('fr-FR')} → {new Date(s.end_date).toLocaleDateString('fr-FR')})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Classe</InputLabel>
        <Select
          label="Classe"
          value={semesterClasses.some(c => c.id === value.classeId) ? value.classeId : ''}
          onChange={e => onChange({ ...value, classeId: e.target.value as number | '' })}
        >
          <MenuItem value="">Toutes mes classes</MenuItem>
          {semesterClasses.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {showDates && (
        <>
          <TextField
            size="small"
            type="date"
            label="Du"
            value={value.dateFrom}
            onChange={e => onChange({ ...value, dateFrom: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="date"
            label="Au"
            value={value.dateTo}
            onChange={e => onChange({ ...value, dateTo: e.target.value })}
            error={!!value.dateFrom && !!value.dateTo && value.dateTo < value.dateFrom}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </>
      )}

      {hasOptionalFilters && (
        <Button size="small" onClick={() => onChange({ ...value, classeId: '', dateFrom: '', dateTo: '' })}>
          Réinitialiser
        </Button>
      )}
    </Box>
  );
};
