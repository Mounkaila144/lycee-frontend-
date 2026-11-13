import { createApiClient } from '@/shared/lib/api-client'
import type { Classe, ClasseStudent } from '../../types/classe.types'

/**
 * Espace Professeur — « Mes classes ».
 * Backend : `Modules/StructureAcademique/Routes/teacher.php`
 *   GET /api/frontend/teacher/my-classes
 *   GET /api/frontend/teacher/my-classes/{classe}/students
 */
export const teacherClassesService = {
  async myClasses(): Promise<Classe[]> {
    const { data } = await createApiClient().get<{ data: Classe[] }>('/frontend/teacher/my-classes')

    return data.data
  },

  async classStudents(classeId: number, search?: string): Promise<ClasseStudent[]> {
    const { data } = await createApiClient().get<{ data: ClasseStudent[] }>(
      `/frontend/teacher/my-classes/${classeId}/students`,
      { params: { per_page: 200, ...(search ? { search } : {}) } }
    )

    return data.data
  }
}
