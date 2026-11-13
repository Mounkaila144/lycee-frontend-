'use client';

import { useEffect, useMemo, useState } from 'react';

import { lyceeGradesService } from '../services/lyceeGradesService';
import type { AcademicYearOption, ClasseOption, SemesterRef, TeacherOption } from '../types';

interface UseReferenceDataOptions {
  withClasses?: boolean;
  withTeachers?: boolean;
  withSubjects?: boolean;
}

interface SubjectOption {
  id: number;
  name: string;
  code?: string | null;
}

/**
 * Charge les données de référence pour les écrans de notes : années (avec semestres),
 * classes de l'année active, professeurs, matières.
 */
export function useReferenceData({ withClasses = true, withTeachers = false, withSubjects = false }: UseReferenceDataOptions = {}) {
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [classes, setClasses] = useState<ClasseOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [years, classList, teacherList, subjectList] = await Promise.all([
          lyceeGradesService.getAcademicYears(),
          withClasses ? lyceeGradesService.getClasses() : Promise.resolve([] as ClasseOption[]),
          withTeachers ? lyceeGradesService.getTeachers() : Promise.resolve([] as TeacherOption[]),
          withSubjects ? lyceeGradesService.getSubjects() : Promise.resolve([] as SubjectOption[]),
        ]);

        if (!cancelled) {
          setAcademicYears(years);
          setClasses(classList);
          setTeachers(teacherList);
          setSubjects(subjectList);
        }
      } catch {
        if (!cancelled) {
          setError('Impossible de charger les données de référence (années, classes…).');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [withClasses, withTeachers, withSubjects]);

  const activeYear = useMemo(
    () => academicYears.find((year) => year.is_active) ?? academicYears[0] ?? null,
    [academicYears],
  );

  const semesters: SemesterRef[] = useMemo(() => activeYear?.semesters ?? [], [activeYear]);

  const defaultSemesterId = useMemo(
    () => semesters.find((semester) => semester.is_active)?.id ?? semesters[0]?.id ?? null,
    [semesters],
  );

  return { academicYears, activeYear, semesters, defaultSemesterId, classes, teachers, subjects, loading, error };
}
