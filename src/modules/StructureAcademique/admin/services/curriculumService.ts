/**
 * Curriculum Service - Tronc Commun et Options
 */

import { createApiClient } from '@/shared/lib/api-client';
import type {
  CoreCurriculumModule,
  CoreCurriculumModuleFormData,
  CoreCurriculumResponse,
  SpecializationModule,
  SpecializationModuleFormData,
  SpecializationModulesResponse,
  AvailableElectivesResponse,
  ElectiveChoiceFormData,
  StudentCurriculumResponse,
  CurriculumResult,
} from '../../types';

class CurriculumService {
  /**
   * Get Core Curriculum for a Programme Level
   */
  async getCoreCurriculum(
    programmeId: number,
    level: string,
    tenantId?: string
  ): Promise<CoreCurriculumModule[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<CoreCurriculumResponse>(
      `/admin/programmes/${programmeId}/core-curriculum/${level}`
    );
    return response.data.data;
  }

  /**
   * Add Module to Core Curriculum
   */
  async addCoreCurriculumModule(
    programmeId: number,
    level: string,
    data: CoreCurriculumModuleFormData,
    tenantId?: string
  ): Promise<CoreCurriculumModule> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ data: CoreCurriculumModule }>(
      `/admin/programmes/${programmeId}/core-curriculum/${level}`,
      data
    );
    return response.data.data;
  }

  /**
   * Remove Module from Core Curriculum
   */
  async removeCoreCurriculumModule(
    programmeId: number,
    level: string,
    moduleId: number,
    tenantId?: string
  ): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(
      `/admin/programmes/${programmeId}/core-curriculum/${level}/${moduleId}`
    );
  }

  /**
   * Get Specialization Modules
   */
  async getSpecializationModules(
    specializationId: number,
    tenantId?: string
  ): Promise<SpecializationModule[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<SpecializationModulesResponse>(
      `/admin/specializations/${specializationId}/modules`
    );
    return response.data.data;
  }

  /**
   * Add Module to Specialization
   */
  async addSpecializationModule(
    specializationId: number,
    data: SpecializationModuleFormData,
    tenantId?: string
  ): Promise<SpecializationModule> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ data: SpecializationModule }>(
      `/admin/specializations/${specializationId}/modules`,
      data
    );
    return response.data.data;
  }

  /**
   * Remove Module from Specialization
   */
  async removeSpecializationModule(
    specializationId: number,
    moduleId: number,
    tenantId?: string
  ): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(
      `/admin/specializations/${specializationId}/modules/${moduleId}`
    );
  }

  /**
   * Get Available Electives for Specialization
   */
  async getAvailableElectives(
    specializationId: number,
    tenantId?: string
  ): Promise<AvailableElectivesResponse> {
    const client = createApiClient(tenantId);
    const response = await client.get<AvailableElectivesResponse>(
      `/admin/specializations/${specializationId}/electives`
    );
    return response.data;
  }

  /**
   * Choose Elective Modules (Student)
   */
  async chooseElectives(
    specializationId: number,
    data: ElectiveChoiceFormData,
    tenantId?: string
  ): Promise<CurriculumResult> {
    const client = createApiClient(tenantId);
    const response = await client.post<CurriculumResult>(
      `/admin/specializations/${specializationId}/choose-electives`,
      data
    );
    return response.data;
  }

  /**
   * Confirm Elective Choices (Student)
   */
  async confirmElectives(
    specializationId: number,
    studentId: number,
    tenantId?: string
  ): Promise<CurriculumResult> {
    const client = createApiClient(tenantId);
    const response = await client.post<CurriculumResult>(
      `/admin/specializations/${specializationId}/confirm-electives`,
      { student_id: studentId }
    );
    return response.data;
  }

  /**
   * Get Complete Student Curriculum
   */
  async getStudentCurriculum(
    params: {
      student_id: number;
      programme_id: number;
      level: string;
      specialization_id?: number;
    },
    tenantId?: string
  ): Promise<StudentCurriculumResponse> {
    const client = createApiClient(tenantId);
    const response = await client.get<StudentCurriculumResponse>(
      '/admin/student-curriculum',
      { params }
    );
    return response.data;
  }
}

export const curriculumService = new CurriculumService();
