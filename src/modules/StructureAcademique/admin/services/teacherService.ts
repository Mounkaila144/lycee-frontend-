import { createApiClient } from '@/shared/lib/api-client';

export interface Teacher {
  id: number;
  name: string;
  email: string;
  department?: string;
  phone?: string;
}

interface TeachersResponse {
  data: Teacher[];
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

class TeacherService {
  /**
   * Get all teachers (users with role 'Professeur')
   * Uses Laravel endpoint: GET /api/admin/teachers
   */
  async getTeachers(tenantId?: string): Promise<Teacher[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<TeachersResponse>('/admin/teachers', {
      params: {
        per_page: 1000 // Get all teachers
      }
    });
    
    // Transform User data to Teacher format
    const users = response.data.data;
    return users.map((user: any) => ({
      id: user.id,
      name: user.full_name || `${user.firstname} ${user.lastname}`,
      email: user.email,
      department: user.department || undefined,
      phone: user.phone || user.mobile || undefined
    }));
  }

  /**
   * Search teachers by name or email
   * Uses Laravel endpoint: GET /api/admin/teachers?search=query
   */
  async searchTeachers(query: string, tenantId?: string): Promise<Teacher[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<TeachersResponse>('/admin/teachers', {
      params: { 
        search: query,
        per_page: 100
      }
    });
    
    // Transform User data to Teacher format
    const users = response.data.data;
    return users.map((user: any) => ({
      id: user.id,
      name: user.full_name || `${user.firstname} ${user.lastname}`,
      email: user.email,
      department: user.department || undefined,
      phone: user.phone || user.mobile || undefined
    }));
  }
}

export const teacherService = new TeacherService();
