export interface Series {
  id: number
  code: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SeriesFormData {
  code: string
  name: string
  description?: string | null
}

export const getSeriesBadgeColor = (code: string): 'primary' | 'secondary' | 'info' => {
  const colors: Record<string, 'primary' | 'secondary' | 'info'> = {
    A: 'primary',
    C: 'secondary',
    D: 'info'
  }

  return colors[code] || 'primary'
}
