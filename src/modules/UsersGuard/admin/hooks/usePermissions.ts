'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { permissionService } from '../services/permissionService';
import type { Permission } from '../../types/permission.types';

/**
 * Custom hook for fetching all available permissions
 * Provides state management and data fetching for permissions list
 */
export const usePermissionsList = () => {
  const { tenantId } = useTenant();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch permissions from the API
   */
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await permissionService.getAllPermissions(tenantId || undefined);
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch permissions'));
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  /**
   * Refresh the permissions list
   */
  const refresh = useCallback(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Fetch permissions on mount
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refresh
  };
};
