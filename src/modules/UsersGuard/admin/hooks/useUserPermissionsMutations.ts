'use client';

import { useState, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { userService } from '../services/userService';
import type { User } from '../../types/user.types';

/**
 * Custom hook for managing user permissions mutations (add, remove, sync)
 * Provides state management for permission operations
 */
export const useUserPermissionsMutations = (userId: number) => {
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Add permissions to the user
   */
  const addPermissions = useCallback(
    async (permissions: string[]): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);
        const updatedUser = await userService.addPermissions(userId, permissions, tenantId || undefined);
        return updatedUser;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add permissions');
        setError(error);
        console.error('Error adding permissions:', err);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, tenantId]
  );

  /**
   * Remove permissions from the user
   */
  const removePermissions = useCallback(
    async (permissions: string[]): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);
        const updatedUser = await userService.removePermissions(userId, permissions, tenantId || undefined);
        return updatedUser;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to remove permissions');
        setError(error);
        console.error('Error removing permissions:', err);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, tenantId]
  );

  /**
   * Sync (replace all) permissions for the user
   */
  const syncPermissions = useCallback(
    async (permissions: string[]): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);
        const updatedUser = await userService.syncPermissions(userId, permissions, tenantId || undefined);
        return updatedUser;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sync permissions');
        setError(error);
        console.error('Error syncing permissions:', err);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, tenantId]
  );

  return {
    addPermissions,
    removePermissions,
    syncPermissions,
    loading,
    error
  };
};
