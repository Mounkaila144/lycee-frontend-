'use client'

// React Imports
import { useEffect, useState, useMemo, useCallback } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Translation Imports
import { useTranslation } from '@/shared/i18n'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { User } from '../../types/user.types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import UserAddModal from './UserAddModal'
import UserEditModal from './UserEditModal'
import { RolesManagementDialog } from './RolesManagementDialog'
import { PermissionsManagementDialog } from './PermissionsManagementDialog'

// Shared DataTable Components
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable'
import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable'

// Context Imports
import { useUsersContext } from './UsersList'

// (No additional service imports needed here)

type UserWithAction = User & {
  action?: string
}

type UserStatusType = {
  [key: string]: ThemeColor
}

// (Removed unused helper functions and vars)

// Available columns configuration (only fields returned by API)
const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'username', label: 'Username', defaultVisible: true },
  { id: 'firstname', label: 'Firstname', defaultVisible: true },
  { id: 'lastname', label: 'Lastname', defaultVisible: true },
  { id: 'full_name', label: 'Full Name', defaultVisible: false },
  { id: 'email', label: 'Email', defaultVisible: true },
  { id: 'application', label: 'Application', defaultVisible: true },
  { id: 'is_active', label: 'Status', defaultVisible: true },
  { id: 'roles', label: 'Roles', defaultVisible: true },
  { id: 'permissions', label: 'Permissions', defaultVisible: false },
  { id: 'created_at', label: 'Created At', defaultVisible: true },
  { id: 'updated_at', label: 'Updated At', defaultVisible: false }
]

const STORAGE_KEY = 'userListTableColumns'

// Column Definitions
const columnHelper = createColumnHelper<UserWithAction>()

const UserListTable = () => {
  // Translation
  const { t, locale } = useTranslation('Users')

  // Context
  const {
    users,
    loading,
    pagination,
    params,
    updateParams,
    setPage,
    setPageSize,
    setSearch,
    refresh,
    deleteUser
  } = useUsersContext()

  // States
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)

  // Removed complex column filters - API only supports simple filters

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}

    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return {}
      }
    }

    const defaultVisibility: Record<string, boolean> = {}

    AVAILABLE_COLUMNS.forEach(col => {
      defaultVisibility[col.id] = col.defaultVisible !== false
    })

    return defaultVisibility
  })

  // Save column visibility to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility))
    }
  }, [columnVisibility])

  // Handle modals
  const handleOpenAddModal = useCallback(() => {
    setAddModalOpen(true)
  }, [])

  const handleCloseAddModal = useCallback(() => {
    setAddModalOpen(false)
  }, [])

  const handleAddSuccess = useCallback(() => {
    refresh()
  }, [refresh])

  const handleOpenEditModal = useCallback((user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false)
    setSelectedUser(null)
  }, [])

  const handleEditSuccess = useCallback(() => {
    refresh()
  }, [refresh])

  // Removed complex filtering logic - API only supports simple search, application, and is_active filters

  // Column definitions
  const columns = useMemo<ColumnDef<UserWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('id', {
        id: 'id',
        header: '#',
        cell: ({ row }) => <Typography>{row.original.id || '-'}</Typography>
      }),
      columnHelper.accessor('username', {
        id: 'username',
        header: t('Username'),
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <CustomAvatar skin='light' size={34}>
              {row.original.username.charAt(0).toUpperCase()}
            </CustomAvatar>
            <Typography color='text.primary' className='font-medium'>
              {row.original.username}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('firstname', {
        id: 'firstname',
        header: t('Firstname'),
        cell: ({ row }) => <Typography>{row.original.firstname || '-'}</Typography>
      }),
      columnHelper.accessor('lastname', {
        id: 'lastname',
        header: t('Lastname'),
        cell: ({ row }) => <Typography>{row.original.lastname || '-'}</Typography>
      }),
      columnHelper.accessor('full_name', {
        id: 'full_name',
        header: t('Full Name'),
        cell: ({ row }) => <Typography>{row.original.full_name || '-'}</Typography>
      }),
      columnHelper.accessor('email', {
        id: 'email',
        header: t('Email'),
        cell: ({ row }) => <Typography>{row.original.email || '-'}</Typography>
      }),
      columnHelper.accessor('application', {
        id: 'application',
        header: t('Application'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.application}
            size='small'
            color={row.original.application === 'admin' ? 'primary' : 'secondary'}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('is_active', {
        id: 'is_active',
        header: t('Status'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.is_active ? t('Active') : t('Inactive')}
            size='small'
            color={row.original.is_active ? 'success' : 'error'}
          />
        )
      }),
      columnHelper.accessor('roles', {
        id: 'roles',
        header: t('Roles'),
        cell: ({ row }) => (
          <div className='flex gap-1 flex-wrap'>
            {row.original.roles && row.original.roles.length > 0 ? (
              row.original.roles.map((role, index) => (
                <Chip key={index} variant='tonal' label={role} size='small' color='info' />
              ))
            ) : (
              <Typography>-</Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('permissions', {
        id: 'permissions',
        header: t('Permissions'),
        cell: ({ row }) => {
          const permCount = row.original.permissions?.length || 0
          return (
            <Chip
              variant='tonal'
              label={`${permCount} ${t('permissions')}`}
              size='small'
              color='secondary'
            />
          )
        }
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: t('Created At'),
        cell: ({ row }) => (
          <Typography>
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('updated_at', {
        id: 'updated_at',
        header: t('Updated At'),
        cell: ({ row }) => (
          <Typography>
            {row.original.updated_at ? new Date(row.original.updated_at).toLocaleDateString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: t('Actions'),
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton
              size='small'
              onClick={async () => {
                if (confirm(t('Are you sure you want to delete this user?'))) {
                  try {
                    await deleteUser(row.original.id)
                  } catch (error) {
                    console.error('Failed to delete user:', error)
                  }
                }
              }}
            >
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
            <IconButton size='small'>
              <i className='ri-eye-line text-textSecondary' />
            </IconButton>
            <IconButton size='small' onClick={() => handleOpenEditModal(row.original)}>
              <i className='ri-edit-box-line text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [t, deleteUser, handleOpenEditModal]
  )

  // DataTable configuration
  const tableConfig: DataTableConfig<User> = {
    columns,
    data: users as User[],
    loading,
    pagination,
    availableColumns: AVAILABLE_COLUMNS,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onSearch: setSearch,
    onRefresh: refresh,
    searchPlaceholder: t('Search User'),
    emptyMessage: t('No data available'),
    rowsPerPageOptions: [10, 25, 50, 100],

    // Actions
    actions: [
      {
        label: t('Manage Roles'),
        icon: 'ri-shield-user-line',
        color: 'primary',
        variant: 'outlined',
        onClick: () => setRolesDialogOpen(true),
        disabled: loading
      },
      {
        label: t('Manage Permissions'),
        icon: 'ri-lock-password-line',
        color: 'primary',
        variant: 'outlined',
        onClick: () => setPermissionsDialogOpen(true),
        disabled: loading
      },
      {
        label: t('Add'),
        icon: 'ri-user-add-line',
        color: 'primary',
        onClick: handleOpenAddModal,
        disabled: loading
      }
    ],

    // Mobile card configuration
    mobileCard: {
      renderCard: user => {
        return (
          <StandardMobileCard
            avatar={
              <CustomAvatar skin='light' size={50}>
                {user.username.charAt(0).toUpperCase()}
              </CustomAvatar>
            }
            title={user.full_name || user.username}
            subtitle={`@${user.username}`}
            status={{
              label: user.is_active ? t('Active') : t('Inactive'),
              color: user.is_active ? 'success' : 'error'
            }}
            fields={[
              {
                icon: 'ri-mail-line',
                value: user.email || '-'
              },
              {
                icon: 'ri-apps-line',
                label: t('Application'),
                value: (
                  <Chip
                    variant='tonal'
                    label={user.application}
                    size='small'
                    color={user.application === 'admin' ? 'primary' : 'secondary'}
                    className='capitalize'
                  />
                )
              },
              user.roles && user.roles.length > 0
                ? {
                    icon: 'ri-shield-user-line',
                    label: t('Roles'),
                    value: user.roles.join(', ')
                  }
                : { icon: '', value: '', hidden: true },
              {
                icon: 'ri-key-line',
                label: t('Permissions'),
                value: `${user.permissions?.length || 0} ${t('permissions')}`
              },
              {
                icon: 'ri-calendar-line',
                label: t('Created'),
                value: user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'
              }
            ]}
            actions={[
              {
                icon: 'ri-delete-bin-7-line',
                color: 'error',
                onClick: async () => {
                  if (confirm(t('Are you sure you want to delete this user?'))) {
                    try {
                      await deleteUser(user.id)
                    } catch (error) {
                      console.error('Failed to delete user:', error)
                    }
                  }
                }
              },
              {
                icon: 'ri-eye-line',
                color: 'default',
                onClick: () => console.log('View user:', user)
              },
              {
                icon: 'ri-edit-box-line',
                color: 'primary',
                onClick: () => handleOpenEditModal(user)
              }
            ]}
            item={user}
          />
        )
      }
    }
  }

  return (
    <>
      <DataTable {...tableConfig} />

      {/* Add User Modal */}
      <UserAddModal open={addModalOpen} onClose={handleCloseAddModal} onSuccess={handleAddSuccess} />

      {/* Edit User Modal */}
      <UserEditModal open={editModalOpen} onClose={handleCloseEditModal} onSuccess={handleEditSuccess} user={selectedUser} />

      {/* Roles Management Dialog */}
      <RolesManagementDialog
        open={rolesDialogOpen}
        onClose={() => setRolesDialogOpen(false)}
      />

      {/* Permissions Management Dialog */}
      <PermissionsManagementDialog
        open={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
      />
    </>
  )
}

export default UserListTable
