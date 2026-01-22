'use client';

import { useState, useEffect, useCallback } from 'react';

import { useTenant } from '@/shared/lib/tenant-context';

import { studentCardService } from '../services/studentCardService';

import type {
  StudentCard,
  GenerateCardRequest,
  BatchGenerateCardsRequest,
  BatchGenerateCardsResult,
  UpdateCardStatusRequest,
  UpdatePrintStatusRequest,
  VerifyCardRequest,
  VerifyCardResponse,
  CardQueryParams,
  CardStatistics,
  MyCardResponse,
} from '../../types/studentCard.types';

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Custom hook for managing student cards with server-side pagination
 */
export const useStudentCards = (initialParams?: CardQueryParams) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [cards, setCards] = useState<StudentCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    from: null,
    last_page: 1,
    per_page: 10,
    to: null,
    total: 0,
  });
  const [params, setParams] = useState<CardQueryParams>(initialParams || { page: 1, per_page: 10 });

  /**
   * Fetch cards from the API with pagination
   */
  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentCardService.getCards(tenantId, params);

      setCards(response.data);
      setPagination({
        current_page: response.current_page,
        from: (response.current_page - 1) * response.per_page + 1,
        last_page: response.last_page,
        per_page: response.per_page,
        to: Math.min(response.current_page * response.per_page, response.total),
        total: response.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cards'));
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, params]);

  /**
   * Refresh the card list
   */
  const refresh = useCallback(() => {
    fetchCards();
  }, [fetchCards]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<CardQueryParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  /**
   * Change page
   */
  const setPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  /**
   * Change page size
   */
  const setPageSize = useCallback((pageSize: number) => {
    setParams(prev => ({ ...prev, per_page: pageSize, page: 1 }));
  }, []);

  /**
   * Update search query
   */
  const setSearch = useCallback((search: string) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      search: search || undefined,
    }));
  }, []);

  /**
   * Generate card for a student
   */
  const generateCard = useCallback(
    async (data: GenerateCardRequest) => {
      try {
        setLoading(true);
        const card = await studentCardService.generate(data, tenantId);
        await fetchCards();

        return card;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to generate card'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCards]
  );

  /**
   * Batch generate cards
   */
  const batchGenerateCards = useCallback(
    async (data: BatchGenerateCardsRequest): Promise<BatchGenerateCardsResult> => {
      try {
        setLoading(true);
        const result = await studentCardService.batchGenerate(data, tenantId);
        await fetchCards();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to batch generate cards'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCards]
  );

  /**
   * Generate duplicate card
   */
  const generateDuplicate = useCallback(
    async (cardId: number, reason?: string) => {
      try {
        setLoading(true);
        const card = await studentCardService.generateDuplicate(cardId, reason, tenantId);
        await fetchCards();

        return card;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to generate duplicate'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCards]
  );

  /**
   * Update card status
   */
  const updateCardStatus = useCallback(
    async (cardId: number, data: UpdateCardStatusRequest) => {
      try {
        setLoading(true);
        const card = await studentCardService.updateStatus(cardId, data, tenantId);
        await fetchCards();

        return card;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update card status'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCards]
  );

  /**
   * Update print status
   */
  const updatePrintStatus = useCallback(
    async (cardId: number, data: UpdatePrintStatusRequest) => {
      try {
        setLoading(true);
        const card = await studentCardService.updatePrintStatus(cardId, data, tenantId);
        await fetchCards();

        return card;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update print status'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCards]
  );

  /**
   * Download card PDF
   */
  const downloadCard = useCallback(
    async (cardId: number, cardNumber: string) => {
      try {
        const blob = await studentCardService.downloadPdf(cardId, tenantId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carte_${cardNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to download card'));
        throw err;
      }
    },
    [tenantId]
  );

  /**
   * Download batch print
   */
  const downloadBatchPrint = useCallback(
    async (cardIds: number[], format: 'individual' | 'sheet_8' = 'sheet_8') => {
      try {
        const blob = await studentCardService.downloadBatchPrint(cardIds, format, tenantId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cartes_batch_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to download batch print'));
        throw err;
      }
    },
    [tenantId]
  );

  /**
   * Delete a card
   */
  const deleteCard = useCallback(
    async (cardId: number) => {
      try {
        setLoading(true);
        await studentCardService.deleteCard(cardId, tenantId);
        await fetchCards();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete card'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchCards]
  );

  // Fetch data when params change
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    loading,
    error,
    pagination,
    params,
    refresh,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    generateCard,
    batchGenerateCards,
    generateDuplicate,
    updateCardStatus,
    updatePrintStatus,
    downloadCard,
    downloadBatchPrint,
    deleteCard,
  };
};

/**
 * Custom hook for card verification
 */
export const useCardVerification = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [verificationResult, setVerificationResult] = useState<VerifyCardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Verify card via QR code data
   */
  const verifyCard = useCallback(
    async (data: VerifyCardRequest) => {
      try {
        setLoading(true);
        setError(null);
        const result = await studentCardService.verify(data, tenantId);
        setVerificationResult(result);

        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Verification failed');
        setError(errorObj);
        setVerificationResult(null);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );

  /**
   * Clear verification result
   */
  const clearVerification = useCallback(() => {
    setVerificationResult(null);
    setError(null);
  }, []);

  return {
    verificationResult,
    loading,
    error,
    verifyCard,
    clearVerification,
  };
};

/**
 * Custom hook for card statistics
 */
export const useCardStatistics = (academicYearId?: number) => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [statistics, setStatistics] = useState<CardStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeYearId, setActiveYearId] = useState<number | undefined>(academicYearId);

  // Fetch the active academic year if not provided
  useEffect(() => {
    if (academicYearId) {
      setActiveYearId(academicYearId);
      return;
    }

    const fetchActiveYear = async () => {
      try {
        const { academicCalendarService } = await import(
          '@/modules/StructureAcademique/admin/services/academicCalendarService'
        );
        const years = await academicCalendarService.getAcademicYears(tenantId);
        const activeYear = years?.find((y: { is_active: boolean }) => y.is_active);

        if (activeYear) {
          setActiveYearId(activeYear.id);
        }
      } catch (err) {
        console.error('Error fetching active academic year:', err);
      }
    };

    fetchActiveYear();
  }, [academicYearId, tenantId]);

  const fetchStatistics = useCallback(async () => {
    if (!activeYearId) {
      return; // Wait for active year to be loaded
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await studentCardService.getStatistics(tenantId, activeYearId);
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch statistics'));
    } finally {
      setLoading(false);
    }
  }, [tenantId, activeYearId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refresh: fetchStatistics,
    activeYearId,
  };
};

/**
 * Custom hook for student's own card (frontend)
 */
export const useMyCard = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;
  const [cardData, setCardData] = useState<MyCardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMyCard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentCardService.getMyCard(tenantId);
      setCardData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch my card'));
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const downloadMyCard = useCallback(async () => {
    try {
      const blob = await studentCardService.downloadMyCard(tenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ma_carte_etudiant.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to download my card'));
      throw err;
    }
  }, [tenantId]);

  const getQRCode = useCallback(async (): Promise<string> => {
    try {
      const blob = await studentCardService.getMyCardQRCode(tenantId);
      const url = window.URL.createObjectURL(blob);

      return url;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get QR code'));
      throw err;
    }
  }, [tenantId]);

  const requestDuplicate = useCallback(
    async (reason: string) => {
      try {
        setLoading(true);
        const card = await studentCardService.requestDuplicate(reason, tenantId);
        await fetchMyCard();

        return card;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to request duplicate'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, fetchMyCard]
  );

  useEffect(() => {
    fetchMyCard();
  }, [fetchMyCard]);

  return {
    cardData,
    loading,
    error,
    refresh: fetchMyCard,
    downloadMyCard,
    getQRCode,
    requestDuplicate,
  };
};
