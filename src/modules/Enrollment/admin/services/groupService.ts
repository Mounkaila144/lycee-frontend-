import { createApiClient } from '@/shared/lib/api-client';

import type {
  Group,
  GroupFormData,
  GroupAssignment,
  GroupQueryParams,
  PaginatedGroupsResponse,
  GroupStatistics,
  AutoAssignRequest,
  AutoAssignPreviewResult,
  AutoAssignResult,
  ManualAssignRequest,
  GroupStudentsQueryParams,
  UnassignedStudentsResponse,
  MyGroupsResponse,
} from '../../types/group.types';

/**
 * Group Response (single)
 */
export interface GroupResponse {
  data: Group;
  message?: string;
}

/**
 * Group Assignments Response
 */
export interface GroupAssignmentsResponse {
  data: GroupAssignment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Transform API response to match frontend types
 */
const transformGroupFromAPI = (apiGroup: any): Group => {
  return {
    ...apiGroup,
    // Transform capacity object to separate fields
    capacity_min: apiGroup.capacity?.min ?? apiGroup.capacity_min,
    capacity_max: apiGroup.capacity?.max ?? apiGroup.capacity_max,
    current_count: apiGroup.capacity?.current ?? apiGroup.current_count ?? 0,
    fill_rate: apiGroup.fill_rate,
    is_below_minimum: apiGroup.is_below_minimum,
    is_above_maximum: apiGroup.is_above_maximum ?? false,
    remaining_capacity: apiGroup.capacity?.available ?? apiGroup.remaining_capacity,

    // Transform programme to program
    program: apiGroup.programme ? {
      id: apiGroup.programme.id,
      code: apiGroup.programme.code,
      name: apiGroup.programme.libelle || apiGroup.programme.name,
    } : apiGroup.program,
  };
};

/**
 * Group Service
 * Handles all API communication related to groups and assignments
 */
class GroupService {
  private baseUrl = '/admin/enrollment/groups';
  private frontendUrl = '/frontend/enrollment';

  /**
   * Fetch paginated groups with filters
   */
  async getGroups(tenantId?: string, params?: GroupQueryParams): Promise<PaginatedGroupsResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      if (params?.per_page) queryParams.append('per_page', String(params.per_page));
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.search) queryParams.append('search', params.search);
      if (params?.module_id) queryParams.append('module_id', String(params.module_id));
      if (params?.program_id) queryParams.append('program_id', String(params.program_id));
      if (params?.level) queryParams.append('level', params.level);
      if (params?.academic_year_id) queryParams.append('academic_year_id', String(params.academic_year_id));
      if (params?.semester_id) queryParams.append('semester_id', String(params.semester_id));
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

      const queryString = queryParams.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await client.get<any>(url);

      // Transform groups to match frontend types
      // API returns { data: [], meta: { current_page, ... } }
      // Frontend expects { data: [], current_page, ... }
      const apiData = response.data;

      return {
        data: apiData.data.map(transformGroupFromAPI),
        current_page: apiData.meta?.current_page ?? apiData.current_page ?? 1,
        last_page: apiData.meta?.last_page ?? apiData.last_page ?? 1,
        per_page: apiData.meta?.per_page ?? apiData.per_page ?? 10,
        total: apiData.meta?.total ?? apiData.total ?? 0,
      };
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  /**
   * Get group by ID
   */
  async getById(id: number, tenantId?: string): Promise<Group> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<GroupResponse>(`${this.baseUrl}/${id}`);

      return transformGroupFromAPI(response.data.data);
    } catch (error) {
      console.error(`Error fetching group ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new group
   */
  async create(data: GroupFormData, tenantId?: string): Promise<Group> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<GroupResponse>(this.baseUrl, data);

      return transformGroupFromAPI(response.data.data);
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * Update group
   */
  async update(id: number, data: Partial<GroupFormData>, tenantId?: string): Promise<Group> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.put<GroupResponse>(`${this.baseUrl}/${id}`, data);

      return transformGroupFromAPI(response.data.data);
    } catch (error) {
      console.error(`Error updating group ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete group (soft delete)
   */
  async delete(id: number, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting group ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get group statistics
   */
  async getStatistics(id: number, tenantId?: string): Promise<GroupStatistics> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: GroupStatistics }>(`${this.baseUrl}/${id}/statistics`);

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching statistics for group ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get students in a group
   */
  async getGroupStudents(
    groupId: number,
    tenantId?: string,
    params?: GroupStudentsQueryParams
  ): Promise<GroupAssignmentsResponse> {
    try {
      const client = createApiClient(tenantId);
      const queryParams = new URLSearchParams();

      if (params?.per_page) queryParams.append('per_page', String(params.per_page));
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = queryString
        ? `${this.baseUrl}/${groupId}/students?${queryString}`
        : `${this.baseUrl}/${groupId}/students`;

      const response = await client.get<any>(url);

      // API returns { data: [], meta: { total, current_page, ... } }
      // Frontend expects { data: [], total, current_page, ... }
      const apiData = response.data;

      return {
        data: apiData.data || [],
        current_page: apiData.meta?.current_page ?? apiData.current_page ?? 1,
        last_page: apiData.meta?.last_page ?? apiData.last_page ?? 1,
        per_page: apiData.meta?.per_page ?? apiData.per_page ?? 50,
        total: apiData.meta?.total ?? apiData.total ?? 0,
      };
    } catch (error) {
      console.error(`Error fetching students for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get unassigned students for a module
   */
  async getUnassignedStudents(
    moduleId: number,
    level: string,
    academicYearId: number,
    tenantId?: string,
    programId?: number
  ): Promise<UnassignedStudentsResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<UnassignedStudentsResponse>(
        `${this.baseUrl}/unassigned-students`,
        {
          params: {
            module_id: moduleId,
            level,
            academic_year_id: academicYearId,
            ...(programId && { program_id: programId }),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching unassigned students:', error);
      throw error;
    }
  }

  /**
   * Preview auto-assignment
   */
  async previewAutoAssign(data: AutoAssignRequest, tenantId?: string): Promise<AutoAssignPreviewResult> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ data: AutoAssignPreviewResult }>(
        `${this.baseUrl}/auto-assign/preview`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error previewing auto-assignment:', error);
      throw error;
    }
  }

  /**
   * Execute auto-assignment
   */
  async autoAssign(data: AutoAssignRequest, tenantId?: string): Promise<AutoAssignResult> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ data: AutoAssignResult }>(`${this.baseUrl}/auto-assign`, data);

      return response.data.data;
    } catch (error) {
      console.error('Error executing auto-assignment:', error);
      throw error;
    }
  }

  /**
   * Manually assign student to group
   */
  async assignStudent(groupId: number, data: ManualAssignRequest, tenantId?: string): Promise<GroupAssignment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ data: GroupAssignment }>(
        `${this.baseUrl}/${groupId}/assign-student`,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Error assigning student to group:', error);
      throw error;
    }
  }

  /**
   * Remove student from group
   * Route: DELETE /admin/enrollment/group-assignments/{assignment}
   */
  async removeStudent(assignmentId: number, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.delete(`/admin/enrollment/group-assignments/${assignmentId}`);
    } catch (error) {
      console.error(`Error removing assignment ${assignmentId}:`, error);
      throw error;
    }
  }

  /**
   * Move student between groups
   * Route: POST /admin/enrollment/groups/{group}/move-student
   */
  async moveStudent(
    currentGroupId: number,
    studentId: number,
    newGroupId: number,
    reason?: string,
    tenantId?: string
  ): Promise<GroupAssignment> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.post<{ data: GroupAssignment }>(
        `${this.baseUrl}/${currentGroupId}/move-student`,
        {
          student_id: studentId,
          to_group_id: newGroupId,
          reason,
        }
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error moving student:`, error);
      throw error;
    }
  }

  /**
   * Export group students to Excel
   */
  async exportStudents(groupId: number, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.baseUrl}/${groupId}/students/export`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error(`Error exporting students for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get my groups (student frontend)
   */
  async getMyGroups(academicYearId?: number, tenantId?: string): Promise<MyGroupsResponse> {
    try {
      const client = createApiClient(tenantId);
      const params = academicYearId ? { academic_year_id: academicYearId } : {};
      const response = await client.get<MyGroupsResponse>(`${this.frontendUrl}/my-groups`, { params });

      return response.data;
    } catch (error) {
      console.error('Error fetching my groups:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const groupService = new GroupService();
