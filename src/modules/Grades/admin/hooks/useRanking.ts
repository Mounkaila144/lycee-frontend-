'use client';

/**
 * Ranking Hook
 * Manages state for promotion rankings dashboard
 */

import { useState, useCallback, useEffect } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { rankingService } from '../services/rankingService';

import type {
  RankedStudent,
  MentionDistribution,
  RankingFilters,
} from '../../types/ranking.types';

export const useRanking = (semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [ranking, setRanking] = useState<RankedStudent[]>([]);
  const [mentionDistribution, setMentionDistribution] = useState<MentionDistribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [generatingPalmares, setGeneratingPalmares] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<RankingFilters>({});

  const fetchRanking = useCallback(async () => {
    if (!semesterId) return;

    setLoading(true);

    try {
      const [rankData, mentionData] = await Promise.all([
        rankingService.getRanking(semesterId, filters, tenantId),
        rankingService.getMentionDistribution(semesterId, tenantId),
      ]);

      setRanking(rankData);
      setMentionDistribution(mentionData);
    } catch (err) {
      console.error('Error fetching ranking:', err);
    } finally {
      setLoading(false);
    }
  }, [semesterId, filters, tenantId]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const calculateRanking = useCallback(async () => {
    if (!semesterId) return;

    setCalculating(true);

    try {
      await rankingService.calculateRanking(semesterId, tenantId);
      await fetchRanking();
    } catch (err) {
      console.error('Error calculating ranking:', err);
    } finally {
      setCalculating(false);
    }
  }, [semesterId, tenantId, fetchRanking]);

  const generatePalmares = useCallback(async (topN: number = 10) => {
    if (!semesterId) return;

    setGeneratingPalmares(true);

    try {
      const result = await rankingService.generatePalmares(semesterId, topN, tenantId);

      if (result.file_url) {
        window.open(result.file_url, '_blank');
      }
    } catch (err) {
      console.error('Error generating palmares:', err);
    } finally {
      setGeneratingPalmares(false);
    }
  }, [semesterId, tenantId]);

  const exportExcel = useCallback(async () => {
    if (!semesterId) return;

    setExporting(true);

    try {
      const blob = await rankingService.exportExcel(semesterId, tenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `classement-S${semesterId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting ranking:', err);
    } finally {
      setExporting(false);
    }
  }, [semesterId, tenantId]);

  return {
    ranking,
    mentionDistribution,
    loading,
    calculating,
    generatingPalmares,
    exporting,
    filters,
    setFilters,
    refresh: fetchRanking,
    calculateRanking,
    generatePalmares,
    exportExcel,
  };
};
