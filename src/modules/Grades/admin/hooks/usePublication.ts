'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { publicationService } from '../services/publicationService';

import type {
  PublicationRecord,
  CanPublishResponse,
  PublicationStatusSummary,
  PublicationHistoryEntry,
  PublishRequest,
} from '../../types/publication.types';

/**
 * Hook for publications list
 */
export const usePublications = (semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [publications, setPublications] = useState<PublicationRecord[]>([]);
  const [status, setStatus] = useState<PublicationStatusSummary | null>(null);
  const [history, setHistory] = useState<PublicationHistoryEntry[]>([]);
  const [canPublishData, setCanPublishData] = useState<CanPublishResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPublications = useCallback(async () => {
    if (!semesterId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await publicationService.getPublications(
        { semester_id: semesterId },
        tenantId
      );

      setPublications(data);
    } catch (err) {
      console.error('Error fetching publications:', err);
    } finally {
      setLoading(false);
    }
  }, [semesterId, tenantId]);

  const fetchStatus = useCallback(async () => {
    if (!semesterId) return;

    try {
      setStatusLoading(true);
      const [statusData, historyData, canPublish] = await Promise.all([
        publicationService.getStatus(semesterId, tenantId),
        publicationService.getHistory(semesterId, tenantId),
        publicationService.canPublish(semesterId, tenantId),
      ]);

      setStatus(statusData);
      setHistory(historyData);
      setCanPublishData(canPublish);
    } catch (err) {
      console.error('Error fetching publication status:', err);
    } finally {
      setStatusLoading(false);
    }
  }, [semesterId, tenantId]);

  const dismissMessage = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (semesterId) {
      fetchPublications();
      fetchStatus();
    } else {
      setPublications([]);
      setStatus(null);
      setHistory([]);
      setCanPublishData(null);
    }
  }, [semesterId, fetchPublications, fetchStatus]);

  return {
    publications,
    status,
    history,
    canPublishData,
    loading,
    statusLoading,
    error,
    successMessage,
    fetchPublications,
    fetchStatus,
    dismissMessage,
  };
};

/**
 * Hook for publication management actions
 */
export const usePublicationManagement = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [publishing, setPublishing] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const publish = useCallback(async (
    semesterId: number,
    request: PublishRequest
  ): Promise<PublicationRecord | null> => {
    try {
      setPublishing(true);
      setError(null);
      const result = await publicationService.publish(semesterId, request, tenantId);

      setSuccessMessage('Résultats publiés avec succès');

      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish'));
      console.error('Error publishing:', err);

      return null;
    } finally {
      setPublishing(false);
    }
  }, [tenantId]);

  const deletePublication = useCallback(async (publicationId: number): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);
      await publicationService.deletePublication(publicationId, tenantId);
      setSuccessMessage('Publication supprimée');

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete publication'));
      console.error('Error deleting publication:', err);

      return false;
    } finally {
      setDeleting(false);
    }
  }, [tenantId]);

  const dismissMessage = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  return {
    publishing,
    deleting,
    error,
    successMessage,
    publish,
    deletePublication,
    dismissMessage,
  };
};
