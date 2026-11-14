import { createApiClient } from '@/shared/lib/api-client';

import type {
  ClassPromotionPreparation,
  ValidatePromotionsPayload,
  ValidatePromotionsResult,
} from '../../types/classPromotion.types';

const baseUrl = '/admin/enrollment/class-promotions';

/**
 * Passages de classe (Admin | Manager).
 */
export const classPromotionService = {
  async prepare(classeId: number, targetAcademicYearId?: number): Promise<ClassPromotionPreparation> {
    const { data } = await createApiClient().get<{ data: ClassPromotionPreparation }>(
      `${baseUrl}/classes/${classeId}/prepare`,
      { params: targetAcademicYearId ? { target_academic_year_id: targetAcademicYearId } : undefined },
    );

    return data.data;
  },

  /**
   * Valide en masse. Une réponse 422 contenant `data.errors` (toutes les lignes en échec)
   * est renvoyée comme un résultat normal pour afficher les erreurs ligne par ligne.
   */
  async validate(payload: ValidatePromotionsPayload): Promise<ValidatePromotionsResult> {
    try {
      const { data } = await createApiClient().post<ValidatePromotionsResult>(`${baseUrl}/validate`, payload);

      return data;
    } catch (error) {
      const response = (error as { response?: { status?: number; data?: Partial<ValidatePromotionsResult> } }).response;

      if (response?.status === 422 && response.data?.data?.errors) {
        return response.data as ValidatePromotionsResult;
      }

      throw error;
    }
  },
};
