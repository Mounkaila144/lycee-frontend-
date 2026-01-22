/**
 * Curriculum Hooks - Tronc Commun et Options
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { curriculumService } from '../services/curriculumService';
import type {
  CoreCurriculumModule,
  CoreCurriculumModuleFormData,
  SpecializationModule,
  SpecializationModuleFormData,
  ElectiveChoiceFormData,
  AvailableElectivesResponse,
  StudentCurriculumResponse,
} from '../../types';

/**
 * Hook: Get Core Curriculum for Programme Level
 */
export const useCoreCurriculum = (programmeId: number, level: string) => {
  const { tenantId } = useTenant();
  const [data, setData] = useState<CoreCurriculumModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!programmeId || !level) return;

    try {
      setLoading(true);
      setError(null);
      const result = await curriculumService.getCoreCurriculum(
        programmeId,
        level,
        tenantId || undefined
      );
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch core curriculum';
      setError(errorMessage);
      console.error('Error fetching core curriculum:', err);
    } finally {
      setLoading(false);
    }
  }, [programmeId, level, tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook: Core Curriculum Mutations
 */
export const useCoreCurriculumMutations = () => {
  const { tenantId } = useTenant();
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const addModule = async (
    programmeId: number,
    level: string,
    data: CoreCurriculumModuleFormData
  ): Promise<CoreCurriculumModule> => {
    try {
      setIsAdding(true);
      const result = await curriculumService.addCoreCurriculumModule(
        programmeId,
        level,
        data,
        tenantId || undefined
      );
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add module';
      console.error('Error adding module:', err);
      throw new Error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const removeModule = async (
    programmeId: number,
    level: string,
    moduleId: number
  ): Promise<void> => {
    try {
      setIsRemoving(true);
      await curriculumService.removeCoreCurriculumModule(
        programmeId,
        level,
        moduleId,
        tenantId || undefined
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove module';
      console.error('Error removing module:', err);
      throw new Error(errorMessage);
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    addModule,
    removeModule,
    isAdding,
    isRemoving,
  };
};

/**
 * Hook: Get Specialization Modules
 */
export const useSpecializationModules = (specializationId: number) => {
  const { tenantId } = useTenant();
  const [data, setData] = useState<SpecializationModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!specializationId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await curriculumService.getSpecializationModules(
        specializationId,
        tenantId || undefined
      );
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch specialization modules';
      setError(errorMessage);
      console.error('Error fetching specialization modules:', err);
    } finally {
      setLoading(false);
    }
  }, [specializationId, tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook: Specialization Module Mutations
 */
export const useSpecializationModuleMutations = () => {
  const { tenantId } = useTenant();
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const addModule = async (
    specializationId: number,
    data: SpecializationModuleFormData
  ): Promise<SpecializationModule> => {
    try {
      setIsAdding(true);
      const result = await curriculumService.addSpecializationModule(
        specializationId,
        data,
        tenantId || undefined
      );
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add module';
      console.error('Error adding module:', err);
      throw new Error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const removeModule = async (
    specializationId: number,
    moduleId: number
  ): Promise<void> => {
    try {
      setIsRemoving(true);
      await curriculumService.removeSpecializationModule(
        specializationId,
        moduleId,
        tenantId || undefined
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove module';
      console.error('Error removing module:', err);
      throw new Error(errorMessage);
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    addModule,
    removeModule,
    isAdding,
    isRemoving,
  };
};

/**
 * Hook: Get Available Electives
 */
export const useAvailableElectives = (specializationId: number) => {
  const { tenantId } = useTenant();
  const [data, setData] = useState<AvailableElectivesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!specializationId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await curriculumService.getAvailableElectives(
        specializationId,
        tenantId || undefined
      );
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available electives';
      setError(errorMessage);
      console.error('Error fetching available electives:', err);
    } finally {
      setLoading(false);
    }
  }, [specializationId, tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook: Elective Choice Mutations
 */
export const useElectiveChoiceMutations = () => {
  const { tenantId } = useTenant();
  const [isChoosing, setIsChoosing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const chooseElectives = async (
    specializationId: number,
    data: ElectiveChoiceFormData
  ) => {
    try {
      setIsChoosing(true);
      const result = await curriculumService.chooseElectives(
        specializationId,
        data,
        tenantId || undefined
      );
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to choose electives';
      console.error('Error choosing electives:', err);
      throw new Error(errorMessage);
    } finally {
      setIsChoosing(false);
    }
  };

  const confirmElectives = async (
    specializationId: number,
    studentId: number
  ) => {
    try {
      setIsConfirming(true);
      const result = await curriculumService.confirmElectives(
        specializationId,
        studentId,
        tenantId || undefined
      );
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm electives';
      console.error('Error confirming electives:', err);
      throw new Error(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  return {
    chooseElectives,
    confirmElectives,
    isChoosing,
    isConfirming,
  };
};

/**
 * Hook: Get Student Curriculum
 */
export const useStudentCurriculum = (params: {
  student_id: number;
  programme_id: number;
  level: string;
  specialization_id?: number;
}) => {
  const { tenantId } = useTenant();
  const [data, setData] = useState<StudentCurriculumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!params.student_id || !params.programme_id || !params.level) return;

    try {
      setLoading(true);
      setError(null);
      const result = await curriculumService.getStudentCurriculum(
        params,
        tenantId || undefined
      );
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch student curriculum';
      setError(errorMessage);
      console.error('Error fetching student curriculum:', err);
    } finally {
      setLoading(false);
    }
  }, [params.student_id, params.programme_id, params.level, params.specialization_id, tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
