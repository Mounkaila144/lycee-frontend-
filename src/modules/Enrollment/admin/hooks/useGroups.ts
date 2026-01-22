'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { groupService } from '../services/groupService';

import type {
  Group,
  GroupFormData,
  GroupQueryParams,
  GroupAssignment,
  GroupStatistics,
  AutoAssignRequest,
  AutoAssignPreviewResult,
  AutoAssignResult,
  ManualAssignRequest,
} from '../../types/group.types';

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Custom hook for managing groups with server-side pagination
 */
export const useGroups = (initialParams?: GroupQueryParams) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    from: null,
    last_page: 1,
    per_page: 10,
    to: null,
    total: 0,
  });
  const [params, setParams] = useState<GroupQueryParams>(initialParams || { page: 1, per_page: 10 });

  /**
   * Fetch groups from the API with pagination
   */
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupService.getGroups(tenantId, params);

      setGroups(response.data);
      setPagination({
        current_page: response.current_page,
        from: (response.current_page - 1) * response.per_page + 1,
        last_page: response.last_page,
        per_page: response.per_page,
        to: Math.min(response.current_page * response.per_page, response.total),
        total: response.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch groups'));
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, params]);

  /**
   * Refresh the group list
   */
  const refresh = useCallback(() => {
    fetchGroups();
  }, [fetchGroups]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<GroupQueryParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  /**
   * Change page
   */
  const setPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  /**
   * Change page size
   */
  const setPageSize = useCallback((pageSize: number) => {
    setParams(prev => ({ ...prev, per_page: pageSize, page: 1 }));
  }, []);

  /**
   * Update search query
   */
  const setSearch = useCallback((search: string) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      search: search || undefined,
    }));
  }, []);

  /**
   * Create a new group
   */
  const createGroup = useCallback(
    async (data: GroupFormData) => {
      try {
        setLoading(true);
        setError(null);
        const newGroup = await groupService.create(data, tenantId);
        await fetchGroups();

        return newGroup;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create group'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchGroups]
  );

  /**
   * Update an existing group
   */
  const updateGroup = useCallback(
    async (groupId: number, data: Partial<GroupFormData>) => {
      try {
        setLoading(true);
        setError(null);
        const updatedGroup = await groupService.update(groupId, data, tenantId);
        await fetchGroups();

        return updatedGroup;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update group'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchGroups]
  );

  /**
   * Delete a group
   */
  const deleteGroup = useCallback(
    async (groupId: number) => {
      try {
        setLoading(true);
        setError(null);
        await groupService.delete(groupId, tenantId);
        await fetchGroups();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete group'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchGroups]
  );

  // Fetch data when params change
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    pagination,
    params,
    refresh,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    createGroup,
    updateGroup,
    deleteGroup,
  };
};

/**
 * Custom hook for group assignments operations
 */
export const useGroupAssignments = (groupId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [assignments, setAssignments] = useState<GroupAssignment[]>([]);
  const [statistics, setStatistics] = useState<GroupStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    from: null,
    last_page: 1,
    per_page: 50,
    to: null,
    total: 0,
  });

  /**
   * Fetch group students
   */
  const fetchAssignments = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await groupService.getGroupStudents(groupId, tenantId, {
        per_page: pagination.per_page,
        page: pagination.current_page,
      });

      setAssignments(response.data);
      setPagination(prev => ({
        ...prev,
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
        from: (response.current_page - 1) * response.per_page + 1,
        to: Math.min(response.current_page * response.per_page, response.total),
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch group assignments'));
    } finally {
      setLoading(false);
    }
  }, [groupId, tenantId, pagination.per_page, pagination.current_page]);

  /**
   * Fetch group statistics
   */
  const fetchStatistics = useCallback(async () => {
    if (!groupId) return;

    try {
      const stats = await groupService.getStatistics(groupId, tenantId);
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching group statistics:', err);
    }
  }, [groupId, tenantId]);

  /**
   * Assign student to group
   */
  const assignStudent = useCallback(
    async (data: ManualAssignRequest) => {
      if (!groupId) throw new Error('No group selected');

      try {
        setLoading(true);
        const assignment = await groupService.assignStudent(groupId, data, tenantId);
        await fetchAssignments();
        await fetchStatistics();

        return assignment;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to assign student'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [groupId, tenantId, fetchAssignments, fetchStatistics]
  );

  /**
   * Remove student from group
   */
  const removeStudent = useCallback(
    async (assignmentId: number) => {
      try {
        setLoading(true);
        await groupService.removeStudent(assignmentId, tenantId);
        await fetchAssignments();
        await fetchStatistics();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to remove student'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchAssignments, fetchStatistics]
  );

  /**
   * Move student to another group
   */
  const moveStudent = useCallback(
    async (studentId: number, newGroupId: number, reason?: string) => {
      if (!groupId) throw new Error('No group selected');

      try {
        setLoading(true);
        const assignment = await groupService.moveStudent(groupId, studentId, newGroupId, reason, tenantId);
        await fetchAssignments();
        await fetchStatistics();

        return assignment;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to move student'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [groupId, tenantId, fetchAssignments, fetchStatistics]
  );

  /**
   * Export group students to Excel
   */
  const exportStudents = useCallback(async () => {
    if (!groupId) return;

    try {
      const blob = await groupService.exportStudents(groupId, tenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `group_${groupId}_students.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to export students'));
      throw err;
    }
  }, [groupId, tenantId]);

  // Fetch data when groupId changes
  useEffect(() => {
    if (groupId) {
      fetchAssignments();
      fetchStatistics();
    }
  }, [groupId, fetchAssignments, fetchStatistics]);

  return {
    assignments,
    statistics,
    loading,
    error,
    pagination,
    refresh: fetchAssignments,
    assignStudent,
    removeStudent,
    moveStudent,
    exportStudents,
  };
};

/**
 * Custom hook for auto-assignment operations
 */
export const useAutoAssignment = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [preview, setPreview] = useState<AutoAssignPreviewResult | null>(null);
  const [result, setResult] = useState<AutoAssignResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Preview auto-assignment
   */
  const previewAutoAssign = useCallback(
    async (data: AutoAssignRequest) => {
      try {
        setLoading(true);
        setError(null);
        const previewResult = await groupService.previewAutoAssign(data, tenantId);
        setPreview(previewResult);

        return previewResult;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to preview auto-assignment'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );

  /**
   * Execute auto-assignment
   */
  const executeAutoAssign = useCallback(
    async (data: AutoAssignRequest) => {
      try {
        setLoading(true);
        setError(null);
        const assignResult = await groupService.autoAssign(data, tenantId);
        setResult(assignResult);
        setPreview(null);

        return assignResult;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to execute auto-assignment'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );

  /**
   * Clear preview
   */
  const clearPreview = useCallback(() => {
    setPreview(null);
    setResult(null);
  }, []);

  return {
    preview,
    result,
    loading,
    error,
    previewAutoAssign,
    executeAutoAssign,
    clearPreview,
  };
};

/**
 * Custom hook for fetching unassigned students
 */
export const useUnassignedStudents = (moduleId: number | null, level: string | null, academicYearId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [students, setStudents] = useState<
    {
      id: number;
      matricule: string;
      firstname: string;
      lastname: string;
      email: string;
      program_id: number;
      level: string;
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUnassigned = useCallback(async () => {
    if (!moduleId || !level || !academicYearId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await groupService.getUnassignedStudents(moduleId, level, academicYearId, tenantId);
      setStudents(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch unassigned students'));
    } finally {
      setLoading(false);
    }
  }, [moduleId, level, academicYearId, tenantId]);

  useEffect(() => {
    fetchUnassigned();
  }, [fetchUnassigned]);

  return {
    students,
    loading,
    error,
    refresh: fetchUnassigned,
  };
};
