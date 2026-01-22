'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { moduleTeacherService } from '../services/moduleTeacherService';
import type { ModuleTeacher, AssignTeacherRequest } from '../../types/moduleTeacher.types';
import { getCurrentAcademicYear } from '../../types/moduleTeacher.types';

export const useModuleTeachers = (moduleId: number, academicYear?: string) => {
  const { tenantId } = useTenant();
  const [teachers, setTeachers] = useState<ModuleTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(academicYear || getCurrentAcademicYear());

  const fetchTeachers = useCallback(async () => {
    if (!moduleId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await moduleTeacherService.getModuleTeachers(
        moduleId,
        selectedYear,
        tenantId || undefined
      );
      setTeachers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch module teachers'));
      console.error('Error fetching module teachers:', err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, selectedYear, tenantId]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const assignTeacher = useCallback(
    async (data: AssignTeacherRequest): Promise<ModuleTeacher> => {
      const newAssignment = await moduleTeacherService.assignTeacher(moduleId, data, tenantId || undefined);
      await fetchTeachers();
      return newAssignment;
    },
    [moduleId, tenantId, fetchTeachers]
  );

  const updateAssignment = useCallback(
    async (assignmentId: number, data: Partial<AssignTeacherRequest>): Promise<ModuleTeacher> => {
      const updatedAssignment = await moduleTeacherService.updateAssignment(
        moduleId,
        assignmentId,
        data,
        tenantId || undefined
      );
      await fetchTeachers();
      return updatedAssignment;
    },
    [moduleId, tenantId, fetchTeachers]
  );

  const removeAssignment = useCallback(
    async (assignmentId: number): Promise<void> => {
      await moduleTeacherService.removeAssignment(moduleId, assignmentId, tenantId || undefined);
      await fetchTeachers();
    },
    [moduleId, tenantId, fetchTeachers]
  );

  return {
    teachers,
    loading,
    error,
    selectedYear,
    setSelectedYear,
    refresh: fetchTeachers,
    assignTeacher,
    updateAssignment,
    removeAssignment,
  };
};
