'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { deliberationService } from '../services/deliberationService';

import type {
  DeliberationSession,
  JuryDecision,
  PendingStudent,
  CreateDeliberationRequest,
  JuryDecisionRequest,
  BulkDecisionRequest,
  DecisionReviewRequest,
} from '../../types/deliberation.types';

/**
 * Hook for managing deliberation sessions list
 */
export const useDeliberationSessions = (semesterId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [sessions, setSessions] = useState<DeliberationSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!semesterId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await deliberationService.getSessions(semesterId, tenantId);

      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
      console.error('Error fetching deliberation sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [semesterId, tenantId]);

  const createSession = useCallback(async (request: CreateDeliberationRequest): Promise<DeliberationSession | null> => {
    try {
      setError(null);
      const session = await deliberationService.createSession(request, tenantId);

      setSuccessMessage('Session de délibération créée');
      await fetchSessions();

      return session;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create session'));
      console.error('Error creating session:', err);

      return null;
    }
  }, [tenantId, fetchSessions]);

  const dismissMessage = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (semesterId) {
      fetchSessions();
    } else {
      setSessions([]);
    }
  }, [semesterId, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    successMessage,
    fetchSessions,
    createSession,
    dismissMessage,
  };
};

/**
 * Hook for managing a single deliberation session
 */
export const useDeliberationSession = (sessionId: number | null) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [session, setSession] = useState<DeliberationSession | null>(null);
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [deliberatedStudents, setDeliberatedStudents] = useState<JuryDecision[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await deliberationService.getSession(sessionId, tenantId);

      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch session'));
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, tenantId]);

  const fetchPendingStudents = useCallback(async () => {
    if (!sessionId) return;

    try {
      const data = await deliberationService.getPendingStudents(sessionId, tenantId);

      setPendingStudents(data);
    } catch (err) {
      console.error('Error fetching pending students:', err);
    }
  }, [sessionId, tenantId]);

  const fetchDeliberatedStudents = useCallback(async () => {
    if (!sessionId) return;

    try {
      const data = await deliberationService.getDeliberatedStudents(sessionId, tenantId);

      setDeliberatedStudents(data);
    } catch (err) {
      console.error('Error fetching deliberated students:', err);
    }
  }, [sessionId, tenantId]);

  const startSession = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      setActionLoading(true);
      setError(null);
      const data = await deliberationService.startSession(sessionId, tenantId);

      setSession(data);
      setSuccessMessage('Session démarrée');

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start session'));

      return false;
    } finally {
      setActionLoading(false);
    }
  }, [sessionId, tenantId]);

  const completeSession = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      setActionLoading(true);
      setError(null);
      const data = await deliberationService.completeSession(sessionId, tenantId);

      setSession(data);
      setSuccessMessage('Session terminée');

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete session'));

      return false;
    } finally {
      setActionLoading(false);
    }
  }, [sessionId, tenantId]);

  const cancelSession = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      setActionLoading(true);
      setError(null);
      const data = await deliberationService.cancelSession(sessionId, tenantId);

      setSession(data);
      setSuccessMessage('Session annulée');

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cancel session'));

      return false;
    } finally {
      setActionLoading(false);
    }
  }, [sessionId, tenantId]);

  const makeDecision = useCallback(async (request: JuryDecisionRequest): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      setError(null);
      await deliberationService.makeDecision(sessionId, request, tenantId);
      setSuccessMessage('Décision enregistrée');
      await Promise.all([fetchPendingStudents(), fetchDeliberatedStudents(), fetchSession()]);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to make decision'));

      return false;
    }
  }, [sessionId, tenantId, fetchPendingStudents, fetchDeliberatedStudents, fetchSession]);

  const makeBulkDecisions = useCallback(async (request: BulkDecisionRequest): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      setActionLoading(true);
      setError(null);
      const result = await deliberationService.makeBulkDecisions(sessionId, request, tenantId);

      setSuccessMessage(result.message || `${result.count} décisions enregistrées`);
      await Promise.all([fetchPendingStudents(), fetchDeliberatedStudents(), fetchSession()]);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to make bulk decisions'));

      return false;
    } finally {
      setActionLoading(false);
    }
  }, [sessionId, tenantId, fetchPendingStudents, fetchDeliberatedStudents, fetchSession]);

  const dismissMessage = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
      fetchPendingStudents();
      fetchDeliberatedStudents();
    } else {
      setSession(null);
      setPendingStudents([]);
      setDeliberatedStudents([]);
    }
  }, [sessionId, fetchSession, fetchPendingStudents, fetchDeliberatedStudents]);

  return {
    session,
    pendingStudents,
    deliberatedStudents,
    loading,
    actionLoading,
    error,
    successMessage,
    startSession,
    completeSession,
    cancelSession,
    makeDecision,
    makeBulkDecisions,
    dismissMessage,
    refresh: () => {
      fetchSession();
      fetchPendingStudents();
      fetchDeliberatedStudents();
    },
  };
};

/**
 * Hook for reviewing exceptional decisions
 */
export const useDecisionReview = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  const [decisions, setDecisions] = useState<JuryDecision[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDecisions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await deliberationService.getDecisionsRequiringReview(tenantId);

      setDecisions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch decisions'));
      console.error('Error fetching decisions for review:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const reviewDecision = useCallback(async (decisionId: number, request: DecisionReviewRequest): Promise<boolean> => {
    try {
      setError(null);
      await deliberationService.reviewDecision(decisionId, request, tenantId);
      await fetchDecisions();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to review decision'));

      return false;
    }
  }, [tenantId, fetchDecisions]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  return {
    decisions,
    loading,
    error,
    reviewDecision,
    refresh: fetchDecisions,
  };
};
