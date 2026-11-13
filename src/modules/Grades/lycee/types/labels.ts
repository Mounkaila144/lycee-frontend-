import type { ClassEvaluationStatus, ClassEvaluationType, Decimal } from './lyceeGrades.types';

export const EVALUATION_TYPE_LABELS: Record<ClassEvaluationType, string> = {
  devoir: 'Devoir',
  interrogation: 'Interrogation',
  composition: 'Composition',
};

export const EVALUATION_STATUS_LABELS: Record<ClassEvaluationStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Soumise',
  published: 'Publiée',
};

export const EVALUATION_STATUS_COLORS: Record<ClassEvaluationStatus, 'default' | 'warning' | 'success'> = {
  draft: 'default',
  submitted: 'warning',
  published: 'success',
};

/**
 * Convertit une valeur décimale (nombre ou chaîne Laravel) en nombre, ou null.
 */
export function toScore(value: Decimal | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : parseFloat(value);

  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Formate une note/moyenne avec 2 décimales (virgule française), ou « — ».
 */
export function formatScore(value: Decimal | null | undefined, digits = 2): string {
  const parsed = toScore(value);

  if (parsed === null) {
    return '—';
  }

  return parsed.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/**
 * Formate un rang (1er, 2e…).
 */
export function formatRank(rank: number | null | undefined, total?: number | null): string {
  if (rank === null || rank === undefined) {
    return '—';
  }

  const suffix = rank === 1 ? 'er' : 'e';

  return total ? `${rank}${suffix} / ${total}` : `${rank}${suffix}`;
}

/**
 * Couleur MUI selon la moyenne sur 20.
 */
export function scoreColor(value: Decimal | null | undefined): 'success.main' | 'warning.main' | 'error.main' | 'text.secondary' {
  const parsed = toScore(value);

  if (parsed === null) {
    return 'text.secondary';
  }

  if (parsed >= 10) {
    return 'success.main';
  }

  return parsed >= 8 ? 'warning.main' : 'error.main';
}
