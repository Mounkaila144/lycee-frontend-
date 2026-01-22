'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { roleService } from '../services/roleService';
import type { Role } from '../../types/role.types';

/**
 * Custom hook for fetching all available roles
 * Provides state management and data fetching for roles list
 */
export const useRolesList = () => {
  const { tenantId } = useTenant();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch roles from the API
   */
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleService.getAllRoles(tenantId || undefined);
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch roles'));
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  /**
   * Refresh the roles list
   */
  const refresh = useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    refresh
  };
};
