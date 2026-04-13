export interface Cycle {
  id: number
  code: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  levels?: Level[]
}

export interface Level {
  id: number
  cycle_id: number
  code: string
  name: string
  order_index: number
  created_at: string
  updated_at: string
  cycle?: Cycle
}

export const getCycleBadgeColor = (code: string): 'primary' | 'secondary' => {
  return code === 'COL' ? 'primary' : 'secondary'
}

export const getLevelBadgeColor = (code: string): 'primary' | 'secondary' | 'info' | 'warning' | 'error' => {
  const colors: Record<string, 'primary' | 'secondary' | 'info' | 'warning' | 'error'> = {
    '6E': 'primary',
    '5E': 'primary',
    '4E': 'info',
    '3E': 'info',
    '2NDE': 'secondary',
    '1ERE': 'warning',
    TLE: 'error'
  }

  return colors[code] || 'primary'
}

export const isLyceeLevel = (code: string): boolean => {
  return ['1ERE', 'TLE'].includes(code)
}
