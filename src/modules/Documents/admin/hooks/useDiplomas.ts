import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { diplomaService } from '../services';
import type {
  CreateDiplomaRequest,
  UpdateDiplomaRequest,
  DeliverDiplomaRequest,
  DiplomaFilters,
} from '../../types';

export const useDiplomas = (filters?: DiplomaFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['diplomas', filters],
    queryFn: () => diplomaService.getDiplomas(filters, tenantId),
  });
};

export const useDiploma = (diplomaId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['diploma', diplomaId],
    queryFn: () => diplomaService.getDiploma(diplomaId!, tenantId),
    enabled: !!diplomaId,
  });
};

export const useCreateDiploma = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiplomaRequest) =>
      diplomaService.createDiploma(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diplomas'] });
    },
  });
};

export const useUpdateDiploma = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ diplomaId, data }: { diplomaId: number; data: UpdateDiplomaRequest }) =>
      diplomaService.updateDiploma(diplomaId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diplomas'] });
      qc.invalidateQueries({ queryKey: ['diploma'] });
    },
  });
};

export const useDeleteDiploma = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (diplomaId: number) =>
      diplomaService.deleteDiploma(diplomaId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diplomas'] });
    },
  });
};

export const useDuplicateDiploma = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (diplomaId: number) =>
      diplomaService.duplicateDiploma(diplomaId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diplomas'] });
    },
  });
};

export const useGenerateSupplement = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (diplomaId: number) =>
      diplomaService.generateSupplement(diplomaId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diplomas'] });
      qc.invalidateQueries({ queryKey: ['diploma'] });
    },
  });
};

export const useDeliverDiploma = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ diplomaId, data }: { diplomaId: number; data: DeliverDiplomaRequest }) =>
      diplomaService.deliverDiploma(diplomaId, data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diplomas'] });
      qc.invalidateQueries({ queryKey: ['diploma'] });
    },
  });
};

export const useDiplomaStatistics = (tenantId?: string) => {
  return useQuery({
    queryKey: ['diploma-statistics'],
    queryFn: () => diplomaService.getStatistics(tenantId),
  });
};
