export type SubjectCategory =
  | 'sciences'
  | 'lettres'
  | 'langues'
  | 'sciences_humaines'
  | 'education_physique'
  | 'arts'
  | 'autres'

export interface Subject {
  id: number
  code: string
  name: string
  short_name: string
  category: SubjectCategory
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubjectFormData {
  code: string
  name: string
  short_name: string
  category: SubjectCategory
  description?: string | null
  is_active?: boolean
}

export interface SubjectQueryParams {
  search?: string
  category?: SubjectCategory
  is_active?: boolean
  per_page?: number
  page?: number
}

export const SUBJECT_CATEGORIES: { value: SubjectCategory; label: string }[] = [
  { value: 'sciences', label: 'Sciences' },
  { value: 'lettres', label: 'Lettres' },
  { value: 'langues', label: 'Langues' },
  { value: 'sciences_humaines', label: 'Sciences Humaines' },
  { value: 'education_physique', label: 'Éducation Physique' },
  { value: 'arts', label: 'Arts' },
  { value: 'autres', label: 'Autres' }
]

export const getCategoryBadgeColor = (
  category: SubjectCategory
): 'primary' | 'secondary' | 'info' | 'warning' | 'error' | 'success' | 'default' => {
  const colors: Record<
    SubjectCategory,
    'primary' | 'secondary' | 'info' | 'warning' | 'error' | 'success' | 'default'
  > = {
    sciences: 'primary',
    lettres: 'secondary',
    langues: 'info',
    sciences_humaines: 'warning',
    education_physique: 'success',
    arts: 'error',
    autres: 'default'
  }

  return colors[category]
}

export const getCategoryLabel = (category: SubjectCategory): string => {
  const labels: Record<SubjectCategory, string> = {
    sciences: 'Sciences',
    lettres: 'Lettres',
    langues: 'Langues',
    sciences_humaines: 'Sciences Humaines',
    education_physique: 'Éducation Physique',
    arts: 'Arts',
    autres: 'Autres'
  }

  return labels[category]
}
