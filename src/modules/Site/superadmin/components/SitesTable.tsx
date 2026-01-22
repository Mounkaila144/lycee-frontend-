'use client'

import { useMemo, useCallback } from 'react'
import { createColumnHelper } from '@tanstack/react-table'

// MUI Imports
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'

// Services & Types
import type { SiteListItem } from '../../types/site.types'
import type { ColumnDef } from '@tanstack/react-table'

// Shared Components
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable'
import type { DataTableConfig } from '@/components/shared/DataTable'

// Date formatting
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// Column helper
const columnHelper = createColumnHelper<SiteListItem>()

interface SitesTableProps {
  sites: SiteListItem[]
  isLoading: boolean
  onEdit: (site: SiteListItem) => void
  onDelete: (site: SiteListItem) => void
  onView: (site: SiteListItem) => void
  onAdd?: () => void
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onRefresh?: () => void
  onSearch?: (value: string) => void
}

/**
 * Sites Table Component
 * Using the reusable DataTable architecture
 */
export default function SitesTable({
  sites,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onAdd,
  pagination,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onSearch
}: SitesTableProps) {
  // Helper functions

  const formatLastConnection = useCallback((date: string | null) => {
    if (!date) return 'Jamais'
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })
    } catch {
      return 'N/A'
    }
  }, [])

  // Handle delete with confirmation
  const handleDelete = useCallback(
    async (site: SiteListItem) => {
      const displayName = site.company_name || site.id
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer le tenant "${displayName}" ?`)) {
        onDelete(site)
      }
    },
    [onDelete]
  )

  // Column definitions
  const columns = useMemo<ColumnDef<SiteListItem, any>[]>(
    () => [
      columnHelper.accessor('id', {
        id: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-medium'>
            {row.original.id}
          </Typography>
        )
      }),
      columnHelper.accessor('company_name', {
        id: 'company_name',
        header: 'Société',
        cell: ({ row }) => {
          const primaryDomain = row.original.domains.find(d => d.is_primary)
          const displayName = row.original.company_name || row.original.id || primaryDomain?.domain || 'Sans nom'
          const initials = displayName.substring(0, 2).toUpperCase()

          return (
            <div className='flex items-center gap-3'>
              <div className='flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>
                  {initials}
                </span>
              </div>
              <div>
                <Typography className='font-semibold'>{displayName}</Typography>
                {!row.original.company_name && (
                  <Typography variant='caption' color='warning.main' className='text-xs'>
                    Nom de société manquant
                  </Typography>
                )}
                {primaryDomain && (
                  <Typography variant='body2' color='text.secondary' className='text-xs'>
                    {primaryDomain.domain}
                  </Typography>
                )}
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('domains', {
        id: 'domains',
        header: 'Domaines',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            {row.original.domains.slice(0, 2).map(domain => (
              <div key={domain.id} className='flex items-center gap-1'>
                <Typography variant='body2' className='font-mono text-xs'>
                  {domain.domain}
                </Typography>
                {domain.is_primary && (
                  <Chip label='Principal' size='small' color='primary' sx={{ height: '16px', fontSize: '0.65rem' }} />
                )}
              </div>
            ))}
            {row.original.domains.length > 2 && (
              <Typography variant='caption' color='text.secondary'>
                +{row.original.domains.length - 2} autre(s)
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('company_email', {
        id: 'company_email',
        header: 'Email',
        cell: ({ row }) => (
          <Typography variant='body2'>{row.original.company_email || '-'}</Typography>
        )
      }),
      columnHelper.accessor('company_phone', {
        id: 'company_phone',
        header: 'Téléphone',
        cell: ({ row }) => (
          <Typography variant='body2'>{row.original.company_phone || '-'}</Typography>
        )
      }),
      columnHelper.accessor('is_active', {
        id: 'is_active',
        header: 'Statut',
        cell: ({ row }) =>
          row.original.is_active ? (
            <Chip label='Actif' size='small' color='success' />
          ) : (
            <Chip label='Inactif' size='small' color='error' />
          )
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: 'Créé le',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {formatLastConnection(row.original.created_at)}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => onView(row.original)} color='info' title='Voir les détails'>
              <i className='ri-eye-line' />
            </IconButton>
            <IconButton size='small' onClick={() => onEdit(row.original)} color='primary' title='Modifier'>
              <i className='ri-edit-box-line' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDelete(row.original)} color='error' title='Supprimer'>
              <i className='ri-delete-bin-7-line' />
            </IconButton>
          </div>
        )
      })
    ],
    [formatLastConnection, onView, onEdit, handleDelete]
  )

  // DataTable configuration
  const tableConfig: DataTableConfig<SiteListItem> = {
    columns,
    data: sites,
    loading: isLoading,
    pagination,
    onPageChange,
    onPageSizeChange,
    onSearch,
    onRefresh,
    searchPlaceholder: 'Rechercher par ID, société, email...',
    emptyMessage: 'Aucun tenant trouvé',
    rowsPerPageOptions: [10, 15, 25, 50],

    // Actions in toolbar
    actions: onAdd ? [
      {
        label: 'Nouveau Site',
        icon: 'ri-add-line',
        color: 'primary',
        onClick: onAdd
      }
    ] : [],

    // Mobile card configuration
    mobileCard: {
      renderCard: site => {
        const primaryDomain = site.domains.find(d => d.is_primary)
        const displayName = site.company_name || site.id || primaryDomain?.domain || 'Sans nom'

        return (
          <StandardMobileCard
            title={displayName}
            subtitle={primaryDomain?.domain}
            status={{
              label: site.is_active ? 'Actif' : 'Inactif',
              color: site.is_active ? 'success' : 'error'
            }}
            fields={[
              {
                icon: 'ri-fingerprint-line',
                label: 'ID Tenant',
                value: site.id
              },
              {
                icon: 'ri-global-line',
                label: 'Domaines',
                value: `${site.domains.length} domaine(s)`
              },
              {
                icon: 'ri-mail-line',
                label: 'Email',
                value: site.company_email || '-',
                hidden: !site.company_email
              },
              {
                icon: 'ri-phone-line',
                label: 'Téléphone',
                value: site.company_phone || '-',
                hidden: !site.company_phone
              },
              {
                icon: 'ri-time-line',
                label: 'Créé le',
                value: formatLastConnection(site.created_at)
              }
            ]}
            actions={[
              {
                icon: 'ri-eye-line',
                color: 'info',
                onClick: () => onView(site)
              },
              {
                icon: 'ri-edit-box-line',
                color: 'primary',
                onClick: () => onEdit(site)
              },
              {
                icon: 'ri-delete-bin-7-line',
                color: 'error',
                onClick: () => handleDelete(site)
              }
            ]}
            item={site}
          />
        )
      }
    }
  }

  return <DataTable {...tableConfig} />
}
