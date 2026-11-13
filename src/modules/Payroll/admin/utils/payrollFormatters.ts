import type { Money } from '../../types';

export const toNumber = (value: Money | null | undefined): number => {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCurrency = (value: Money | null | undefined): string =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(toNumber(value))} FCFA`;

export const formatDate = (value: string | null | undefined): string =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '—';

/**
 * Extract a readable message from an axios error (422 validation or business rule).
 */
export const getPayrollErrorMessage = (error: unknown, fallback = 'Une erreur est survenue'): string => {
  const data = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response
    ?.data;

  if (data?.errors) {
    const first = Object.values(data.errors)[0];

    if (first?.length) return first[0];
  }

  return data?.message || fallback;
};
