'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { retakeService } from '../services';
import type {
  RetakeStatistics,
  RetakeModuleSummary,
  RetakeStudentSummary,
  RetakeStudentEntry,
} from '../../types/retake.types';

/**
 * Hook for retake statistics (Story 17)
 */
export const useRetakeStatistics = (semesterId: number | null, tenantId?: string) => {
  return useQuery({
    queryKey: ['retake-statistics', semesterId],
    queryFn: () => retakeService.getStatistics(semesterId!, tenantId),
    enabled: !!semesterId,
  });
};

/**
 * Hook for retake modules list (Story 17)
 */
export const useRetakeModules = (semesterId: number | null, tenantId?: string) => {
  return useQuery({
    queryKey: ['retake-modules', semesterId],
    queryFn: () => retakeService.getModulesList(semesterId!, tenantId),
    enabled: !!semesterId,
  });
};

/**
 * Hook for retake students list with pagination (Story 17)
 */
export const useRetakeStudents = (
  semesterId: number | null,
  params?: { status?: string; page?: number; per_page?: number },
  tenantId?: string
) => {
  return useQuery({
    queryKey: ['retake-students', semesterId, params],
    queryFn: () => retakeService.getStudentsList(semesterId!, params, tenantId),
    enabled: !!semesterId,
  });
};

/**
 * Hook for module retake students detail
 */
export const useModuleRetakeStudents = (
  moduleId: number | null,
  semesterId?: number,
  tenantId?: string
) => {
  return useQuery({
    queryKey: ['module-retake-students', moduleId, semesterId],
    queryFn: () => retakeService.getModuleRetakeStudents(moduleId!, { semester_id: semesterId }, tenantId),
    enabled: !!moduleId,
  });
};

/**
 * Hook for triggering retake identification
 */
export const useIdentifyRetakes = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: number) => retakeService.identifyRetakes(semesterId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retake-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['retake-modules'] });
      queryClient.invalidateQueries({ queryKey: ['retake-students'] });
    },
  });
};

/**
 * Hook for validating retake grades (admin)
 */
export const useValidateRetakeGrades = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, semesterId }: { moduleId: number; semesterId: number }) =>
      retakeService.validateGrades(moduleId, semesterId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retake-pending-grades'] });
      queryClient.invalidateQueries({ queryKey: ['retake-modules-pending'] });
    },
  });
};

/**
 * Hook for publishing retake grades (admin)
 */
export const usePublishRetakeGrades = (tenantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, semesterId }: { moduleId: number; semesterId: number }) =>
      retakeService.publishGrades(moduleId, semesterId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retake-pending-grades'] });
      queryClient.invalidateQueries({ queryKey: ['retake-modules-pending'] });
      queryClient.invalidateQueries({ queryKey: ['retake-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['module-retake-students'] });
    },
  });
};

/**
 * Hook for exporting retake students
 */
export const useExportRetakeStudents = (tenantId?: string) => {
  return useMutation({
    mutationFn: ({ semesterId, moduleId }: { semesterId: number; moduleId?: number }) =>
      retakeService.exportStudents(semesterId, { module_id: moduleId }, tenantId),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `retake-students.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
};

/**
 * Combined hook for the full retake management dashboard (Story 17)
 */
export const useRetakeManagement = (initialSemesterId?: number | null) => {
  const [semesterId, setSemesterId] = useState<number | null>(initialSemesterId ?? null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [view, setView] = useState<'modules' | 'students' | 'module-detail'>('modules');

  const statistics = useRetakeStatistics(semesterId);
  const modules = useRetakeModules(semesterId);
  const students = useRetakeStudents(semesterId);
  const moduleStudents = useModuleRetakeStudents(selectedModuleId, semesterId ?? undefined);
  const identifyMutation = useIdentifyRetakes();
  const exportMutation = useExportRetakeStudents();

  const handleIdentify = useCallback(() => {
    if (semesterId) {
      identifyMutation.mutate(semesterId);
    }
  }, [semesterId, identifyMutation]);

  const handleExport = useCallback((moduleId?: number) => {
    if (semesterId) {
      exportMutation.mutate({ semesterId, moduleId });
    }
  }, [semesterId, exportMutation]);

  const handleSelectModule = useCallback((moduleId: number) => {
    setSelectedModuleId(moduleId);
    setView('module-detail');
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedModuleId(null);
    setView('modules');
  }, []);

  return {
    // State
    semesterId,
    setSemesterId,
    selectedModuleId,
    view,
    setView,

    // Data
    statistics: statistics.data,
    modules: modules.data ?? [],
    students: students.data,
    moduleStudents: moduleStudents.data ?? [],

    // Loading states
    statsLoading: statistics.isLoading,
    modulesLoading: modules.isLoading,
    studentsLoading: students.isLoading,
    moduleStudentsLoading: moduleStudents.isLoading,

    // Error
    error: statistics.error || modules.error || students.error,

    // Actions
    identify: handleIdentify,
    identifying: identifyMutation.isPending,
    identifyResult: identifyMutation.data,

    exportStudents: handleExport,
    exporting: exportMutation.isPending,

    selectModule: handleSelectModule,
    backToList: handleBackToList,

    // Refresh
    refresh: () => {
      statistics.refetch();
      modules.refetch();
      students.refetch();
    },
  };
};
