'use client';

import { useState, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { roleService } from '../services/roleService';
import type { User } from '../../types/user.types';

/**
 * Custom hook for managing user roles mutations (add, remove, sync)
 * Provides state management for role operations
 */
export const useUserRolesMutations = (userId: number) => {
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Add roles to the user
   */
  const addRoles = useCallback(
    async (roles: string[]): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);
        const updatedUser = await roleService.addRoles(userId, roles, tenantId || undefined);
        return updatedUser;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add roles');
        setError(error);
        console.error('Error adding roles:', err);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, tenantId]
  );

  /**
   * Remove roles from the user
   */
  const removeRoles = useCallback(
    async (roles: string[]): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);
        const updatedUser = await roleService.removeRoles(userId, roles, tenantId || undefined);
        return updatedUser;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to remove roles');
        setError(error);
        console.error('Error removing roles:', err);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, tenantId]
  );

  /**
   * Sync (replace all) roles for the user
   */
  const syncRoles = useCallback(
    async (roles: string[]): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);
        const updatedUser = await roleService.syncRoles(userId, roles, tenantId || undefined);
        return updatedUser;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sync roles');
        setError(error);
        console.error('Error syncing roles:', err);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, tenantId]
  );

  return {
    addRoles,
    removeRoles,
    syncRoles,
    loading,
    error
  };
};
