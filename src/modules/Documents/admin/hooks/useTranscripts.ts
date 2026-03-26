import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { transcriptService } from '../services';
import type {
  GenerateTranscriptRequest,
  BatchTranscriptRequest,
  TranscriptFilters,
} from '../../types';

export const useTranscripts = (filters?: TranscriptFilters, tenantId?: string) => {
  return useQuery({
    queryKey: ['transcripts', filters],
    queryFn: () => transcriptService.getTranscripts(filters, tenantId),
  });
};

export const useTranscript = (transcriptId?: number, tenantId?: string) => {
  return useQuery({
    queryKey: ['transcript', transcriptId],
    queryFn: () => transcriptService.getTranscript(transcriptId!, tenantId),
    enabled: !!transcriptId,
  });
};

export const useGenerateSemesterTranscript = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateTranscriptRequest) =>
      transcriptService.generateSemester(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transcripts'] });
    },
  });
};

export const useGenerateGlobalTranscript = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateTranscriptRequest) =>
      transcriptService.generateGlobal(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transcripts'] });
    },
  });
};

export const useBatchTranscripts = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchTranscriptRequest) =>
      transcriptService.generateBatch(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transcripts'] });
    },
  });
};

export const useValidateTranscript = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (transcriptId: number) =>
      transcriptService.validateTranscript(transcriptId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transcripts'] });
      qc.invalidateQueries({ queryKey: ['transcript'] });
    },
  });
};

export const useTranscriptStatistics = (tenantId?: string) => {
  return useQuery({
    queryKey: ['transcript-statistics'],
    queryFn: () => transcriptService.getStatistics(tenantId),
  });
};
