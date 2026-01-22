'use client'

// React Imports
import { createContext, useContext, useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import ProgrammeListTable from './ProgrammeListTable'

// Hook Imports
import { useProgrammes } from '../hooks/useProgrammes'

// Service Imports
import { userService } from '@/modules/UsersGuard/admin/services/userService'
import { useTenant } from '@/shared/lib/tenant-context'

// Type Imports
import type {
  Programme,
  PaginationMeta,
  ProgrammeQueryParams,
  ProgrammeFormData,
  ChangeStatusData
} from '../../types/programme.types'
import type { User } from '@/modules/UsersGuard/types/user.types'

// Create context for sharing programme data between components
interface ProgrammesContextType {
  programmes: Programme[]
  loading: boolean
  error: Error | null
  pagination: PaginationMeta
  params: ProgrammeQueryParams
  updateParams: (newParams: Partial<ProgrammeQueryParams>) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSearch: (search: string) => void
  refresh: () => void
  createProgramme: (data: ProgrammeFormData) => Promise<Programme>
  updateProgramme: (programmeId: number, data: Partial<ProgrammeFormData>) => Promise<Programme>
  deleteProgramme: (programmeId: number) => Promise<void>
  changeStatus: (programmeId: number, data: ChangeStatusData) => Promise<Programme>
  users: any[] // Liste des users pour le champ responsable
  loadingUsers: boolean
}

const ProgrammesContext = createContext<ProgrammesContextType | undefined>(undefined)

export const useProgrammesContext = () => {
  const context = useContext(ProgrammesContext)

  if (!context) {
    throw new Error('useProgrammesContext must be used within ProgrammeList')
  }

  return context
}

/**
 * ProgrammeList Component
 * Main component for displaying programmes with table
 */
export const ProgrammeList = () => {
  const programmesData = useProgrammes()
  const { tenantId } = useTenant()
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Load users once when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true)
        const response = await userService.getUsers(tenantId || undefined, { per_page: 100 })
        setUsers(response.data)
      } catch (err) {
        console.error('Failed to load users:', err)
      } finally {
        setLoadingUsers(false)
      }
    }

    loadUsers()
  }, [tenantId])

  return (
    <ProgrammesContext.Provider value={{ ...programmesData, users, loadingUsers }}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <ProgrammeListTable />
        </Grid>
      </Grid>
    </ProgrammesContext.Provider>
  )
}

export default ProgrammeList
