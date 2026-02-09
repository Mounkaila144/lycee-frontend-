'use client';

/**
 * Procès-Verbal Hook
 * Manages state for PV generation, templates, and archive
 */

import { useState, useCallback, useEffect } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { procesVerbalService } from '../services/procesVerbalService';

import type {
  PVTemplate,
  PVGenerationLog,
  PVSearchFilters,
  PVTemplateFormData,
} from '../../types/procesVerbal.types';

export const useProcesVerbal = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [pvLogs, setPvLogs] = useState<PVGenerationLog[]>([]);
  const [templates, setTemplates] = useState<PVTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState<PVSearchFilters>({});

  const fetchPVs = useCallback(async () => {
    setLoading(true);

    try {
      const [logs, tmpls] = await Promise.all([
        procesVerbalService.searchPVs(filters, tenantId),
        procesVerbalService.getTemplates(tenantId),
      ]);

      setPvLogs(logs);
      setTemplates(tmpls);
    } catch (err) {
      console.error('Error fetching PVs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, tenantId]);

  useEffect(() => {
    fetchPVs();
  }, [fetchPVs]);

  const generatePV = useCallback(async (sessionId: number, templateId?: number) => {
    setGenerating(true);

    try {
      const result = await procesVerbalService.generatePV(sessionId, templateId, tenantId);

      await fetchPVs();

      if (result.file_url) {
        window.open(result.file_url, '_blank');
      }

      return result;
    } catch (err) {
      console.error('Error generating PV:', err);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, [tenantId, fetchPVs]);

  const downloadPV = useCallback(async (pvId: number, filename: string) => {
    try {
      const blob = await procesVerbalService.downloadPV(pvId, tenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PV:', err);
    }
  }, [tenantId]);

  const createTemplate = useCallback(async (data: PVTemplateFormData) => {
    try {
      await procesVerbalService.createTemplate(data, tenantId);
      await fetchPVs();
    } catch (err) {
      console.error('Error creating template:', err);
      throw err;
    }
  }, [tenantId, fetchPVs]);

  const updateTemplate = useCallback(async (templateId: number, data: Partial<PVTemplateFormData>) => {
    try {
      await procesVerbalService.updateTemplate(templateId, data, tenantId);
      await fetchPVs();
    } catch (err) {
      console.error('Error updating template:', err);
      throw err;
    }
  }, [tenantId, fetchPVs]);

  const deleteTemplate = useCallback(async (templateId: number) => {
    try {
      await procesVerbalService.deleteTemplate(templateId, tenantId);
      await fetchPVs();
    } catch (err) {
      console.error('Error deleting template:', err);
      throw err;
    }
  }, [tenantId, fetchPVs]);

  return {
    pvLogs,
    templates,
    loading,
    generating,
    filters,
    setFilters,
    refresh: fetchPVs,
    generatePV,
    downloadPV,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
