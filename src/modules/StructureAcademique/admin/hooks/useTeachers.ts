'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { teacherService, type Teacher } from '../services/teacherService';

export const useTeachers = () => {
  const { tenantId } = useTenant();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherService.getTeachers(tenantId || undefined);
      setTeachers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch teachers'));
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    loading,
    error,
    refresh: fetchTeachers,
  };
};
