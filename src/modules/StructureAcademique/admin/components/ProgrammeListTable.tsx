'use client'

// React Imports
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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
import type { Programme, ProgrammeStatus } from '../../types/programme.types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import ProgrammeFormDialog from './ProgrammeFormDialog'
import ProgrammeDeleteDialog from './ProgrammeDeleteDialog'
import ProgrammeActivationDialog from './ProgrammeActivationDialog'
import ProgrammeHistoryDialog from './ProgrammeHistoryDialog'
import ProgrammeImportDialog from './ProgrammeImportDialog'
import ProgrammeExportDialog from './ProgrammeExportDialog'
import { ProgrammeLevelBadges } from './ProgrammeLevelBadges'
import { ProgrammeLevelDialog } from './ProgrammeLevelDialog'
import ProgrammeCreditConfigDialog from './ProgrammeCreditConfigDialog'
import GlobalCreditConfigDialog from './GlobalCreditConfigDialog'
import EliminatoryModulesDialog from './EliminatoryModulesDialog'
import ProgrammeModulesDialog from './ProgrammeModulesDialog'
import { MaquetteGenerationDialog } from './MaquetteGenerationDialog'
import type { ProgrammeLevel } from '../../types/programmeLevel.types'

// Shared DataTable Components
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable'
import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable'

// Context Imports
import { useProgrammesContext } from './ProgrammeList'

type ProgrammeWithAction = Programme & {
  action?: string
}

type ProgrammeStatusColor = {
  [key in ProgrammeStatus]: ThemeColor
}

const statusColorMap: ProgrammeStatusColor = {
  'Brouillon': 'warning',
  'Actif': 'success',
  'Inactif': 'error',
  'Archivé': 'secondary'
}

// Available columns configuration
const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'code', label: 'Code', defaultVisible: true },
  { id: 'libelle', label: 'Libellé', defaultVisible: true },
  { id: 'type', label: 'Type', defaultVisible: true },
  { id: 'duree_annees', label: 'Durée (années)', defaultVisible: true },
  { id: 'statut', label: 'Statut', defaultVisible: true },
  { id: 'responsable', label: 'Responsable', defaultVisible: true },
  { id: 'levels_count', label: 'Niveaux', defaultVisible: false },
  { id: 'students_count', label: 'Étudiants', defaultVisible: false },
  { id: 'created_at', label: 'Créé le', defaultVisible: false },
  { id: 'updated_at', label: 'Modifié le', defaultVisible: false }
]

const STORAGE_KEY = 'programmeListTableColumns'

// Column Definitions
const columnHelper = createColumnHelper<ProgrammeWithAction>()

const ProgrammeListTable = () => {
  // Translation
  const { t } = useTranslation('StructureAcademique')
  
  // Router
  const router = useRouter()

  // Context
  const {
    programmes,
    loading,
    pagination,
    setPage,
    setPageSize,
    setSearch,
    refresh,
    deleteProgramme
  } = useProgrammesContext()

  // States
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activationDialogOpen, setActivationDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [levelDialogOpen, setLevelDialogOpen] = useState(false)
  const [creditConfigDialogOpen, setCreditConfigDialogOpen] = useState(false)
  const [globalCreditConfigDialogOpen, setGlobalCreditConfigDialogOpen] = useState(false)
  const [eliminatoryModulesDialogOpen, setEliminatoryModulesDialogOpen] = useState(false)
  const [modulesDialogOpen, setModulesDialogOpen] = useState(false)
  const [maquetteDialogOpen, setMaquetteDialogOpen] = useState(false)
  const [activationAction, setActivationAction] = useState<'activate' | 'deactivate'>('activate')
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

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

  // Handle form dialog
  const handleOpenAddDialog = useCallback(() => {
    setSelectedProgramme(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }, [])

  const handleOpenEditDialog = useCallback((programme: Programme) => {
    setSelectedProgramme(programme)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }, [])

  const handleCloseFormDialog = useCallback(() => {
    setFormDialogOpen(false)
    setSelectedProgramme(null)
    setIsEditMode(false)
  }, [])

  const handleFormSuccess = useCallback(() => {
    refresh()
    handleCloseFormDialog()
  }, [refresh, handleCloseFormDialog])

  // Handle delete dialog
  const handleOpenDeleteDialog = useCallback((programme: Programme) => {
    setSelectedProgramme(programme)
    setDeleteDialogOpen(true)
  }, [])

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false)
    setSelectedProgramme(null)
  }, [])

  const handleDeleteSuccess = useCallback(() => {
    refresh()
    handleCloseDeleteDialog()
  }, [refresh, handleCloseDeleteDialog])

  // Handle activation dialog
  const handleOpenActivationDialog = useCallback((programme: Programme, action: 'activate' | 'deactivate') => {
    setSelectedProgramme(programme)
    setActivationAction(action)
    setActivationDialogOpen(true)
  }, [])

  const handleCloseActivationDialog = useCallback(() => {
    setActivationDialogOpen(false)
    setSelectedProgramme(null)
  }, [])

  const handleActivationSuccess = useCallback(() => {
    refresh()
    handleCloseActivationDialog()
  }, [refresh, handleCloseActivationDialog])

  // Handle history dialog
  const handleOpenHistoryDialog = useCallback((programme: Programme) => {
    setSelectedProgramme(programme)
    setHistoryDialogOpen(true)
  }, [])

  const handleCloseHistoryDialog = useCallback(() => {
    setHistoryDialogOpen(false)
    setSelectedProgramme(null)
  }, [])

  // Handle import/export dialogs
  const handleOpenImportDialog = useCallback(() => {
    setImportDialogOpen(true)
  }, [])

  const handleCloseImportDialog = useCallback(() => {
    setImportDialogOpen(false)
  }, [])

  const handleImportSuccess = useCallback(() => {
    refresh()
  }, [refresh])

  const handleOpenExportDialog = useCallback(() => {
    setExportDialogOpen(true)
  }, [])

  const handleCloseExportDialog = useCallback(() => {
    setExportDialogOpen(false)
  }, [])

  // Handle level dialog
  const handleOpenLevelDialog = useCallback((programme: Programme) => {
    setSelectedProgramme(programme)
    setLevelDialogOpen(true)
  }, [])

  const handleCloseLevelDialog = useCallback(() => {
    setLevelDialogOpen(false)
    setSelectedProgramme(null)
  }, [])

  const handleLevelSuccess = useCallback(() => {
    refresh()
  }, [refresh])

  // Handle credit config dialog
  const handleOpenCreditConfigDialog = useCallback((programme: Programme) => {
    setSelectedProgramme(programme)
    setCreditConfigDialogOpen(true)
  }, [])

  const handleCloseCreditConfigDialog = useCallback(() => {
    setCreditConfigDialogOpen(false)
    setSelectedProgramme(null)
  }, [])

  // Handle global credit config dialog
  const handleOpenGlobalCreditConfigDialog = useCallback(() => {
    setGlobalCreditConfigDialogOpen(true)
  }, [])

  const handleCloseGlobalCreditConfigDialog = useCallback(() => {
    setGlobalCreditConfigDialogOpen(false)
  }, [])

  // Handle eliminatory modules dialog
  const handleOpenEliminatoryModulesDialog = useCallback((programme: Programme) => {
    setSelectedProgramme(programme)
    setEliminatoryModulesDialogOpen(true)
  }, [])

  const handleCloseEliminatoryModulesDialog = useCallback(() => {
    setEliminatoryModulesDialogOpen(false)
    setSelectedProgramme(null)
  }, [])

  // Handle modules dialog
  const handleOpenModulesDialog = useCallback((programme: Programme) => {
    setSelectedProgramme(programme)
    setModulesDialogOpen(true)
  }, [])

  const handleCloseModulesDialog = useCallback(() => {
    setModulesDialogOpen(false)
    setSelectedProgramme(null)
  }, [])

  const handleModulesSuccess = useCallback(() => {
    refresh()
  }, [refresh])

  // Handle maquette dialog
  const handleOpenMaquetteDialog = useCallback((programme: Programme) => {
    setSelectedProgramme(programme)
    setMaquetteDialogOpen(true)
  }, [])

  const handleCloseMaquetteDialog = useCallback(() => {
    setMaquetteDialogOpen(false)
    setSelectedProgramme(null)
  }, [])

  // Column definitions
  const columns = useMemo<ColumnDef<ProgrammeWithAction, any>[]>(
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
      columnHelper.accessor('code', {
        id: 'code',
        header: t('Code'),
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <CustomAvatar skin='light' size={34} color='primary'>
              {row.original.code.substring(0, 2).toUpperCase()}
            </CustomAvatar>
            <Typography color='text.primary' className='font-medium'>
              {row.original.code}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('libelle', {
        id: 'libelle',
        header: t('Libellé'),
        cell: ({ row }) => <Typography>{row.original.libelle || '-'}</Typography>
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: t('Type'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.type}
            size='small'
            color={
              row.original.type === 'Licence' ? 'primary' :
              row.original.type === 'Master' ? 'secondary' :
              'info'
            }
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('duree_annees', {
        id: 'duree_annees',
        header: t('Durée (années)'),
        cell: ({ row }) => (
          <Typography>
            {row.original.duree_annees} {row.original.duree_annees > 1 ? 'ans' : 'an'}
          </Typography>
        )
      }),
      columnHelper.accessor('statut', {
        id: 'statut',
        header: t('Statut'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.statut}
            size='small'
            color={statusColorMap[row.original.statut]}
          />
        )
      }),
      columnHelper.accessor('responsable', {
        id: 'responsable',
        header: t('Responsable'),
        cell: ({ row }) => {
          const responsable = row.original.responsable;
          if (!responsable) return <Typography>-</Typography>;
          
          // Display email if name is null
          const displayName = responsable.name || responsable.email || '-';
          return <Typography>{displayName}</Typography>;
        }
      }),
      columnHelper.accessor('levels_count', {
        id: 'levels_count',
        header: t('Niveaux'),
        cell: ({ row }) => {
          // Handle both formats: array of strings ["L1","L2"] or array of objects [{id, level}]
          const levels = row.original.levels?.map(l => {
            if (typeof l === 'string') {
              return l as ProgrammeLevel;
            }
            return l.level as ProgrammeLevel;
          }) || [];
          
          return levels.length > 0 ? (
            <ProgrammeLevelBadges levels={levels} size="small" max={3} />
          ) : (
            <Chip
              variant='outlined'
              label={t('None')}
              size='small'
              color='default'
            />
          );
        }
      }),
      columnHelper.accessor('students_count', {
        id: 'students_count',
        header: t('Étudiants'),
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={`${row.original.students_count || 0}`}
            size='small'
            color='default'
          />
        )
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: t('Créé le'),
        cell: ({ row }) => (
          <Typography>
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('updated_at', {
        id: 'updated_at',
        header: t('Modifié le'),
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
            {/* Manage Levels button */}
            <IconButton
              size='small'
              onClick={() => handleOpenLevelDialog(row.original)}
              title="Gérer les niveaux"
            >
              <i className='ri-list-check text-textSecondary' />
            </IconButton>

            {/* Manage Modules button */}
            <IconButton
              size='small'
              onClick={() => handleOpenModulesDialog(row.original)}
              title="Gérer les modules"
            >
              <i className='ri-book-line text-textSecondary' />
            </IconButton>

            {/* Configure ECTS Credits button */}
            <IconButton
              size='small'
              onClick={() => handleOpenCreditConfigDialog(row.original)}
              title="Configuration Crédits ECTS"
            >
              <i className='ri-medal-line text-textSecondary' />
            </IconButton>

            {/* Eliminatory Modules button */}
            <IconButton
              size='small'
              onClick={() => handleOpenEliminatoryModulesDialog(row.original)}
              title="Modules Éliminatoires"
            >
              <i className='ri-alert-line text-textSecondary' />
            </IconButton>

            {/* Generate Maquette PDF button */}
            <IconButton
              size='small'
              onClick={() => handleOpenMaquetteDialog(row.original)}
              title="Générer Maquette PDF"
            >
              <i className='ri-file-pdf-line text-error' />
            </IconButton>

            {/* Activation/Deactivation button */}
            {row.original.statut === 'Actif' ? (
              <IconButton
                size='small'
                onClick={() => handleOpenActivationDialog(row.original, 'deactivate')}
                title={t('Désactiver')}
              >
                <i className='ri-pause-circle-line text-warning' />
              </IconButton>
            ) : row.original.statut === 'Inactif' || row.original.statut === 'Brouillon' ? (
              <IconButton
                size='small'
                onClick={() => handleOpenActivationDialog(row.original, 'activate')}
                title={t('Activer')}
              >
                <i className='ri-play-circle-line text-success' />
              </IconButton>
            ) : null}

            {/* History button */}
            <IconButton
              size='small'
              onClick={() => handleOpenHistoryDialog(row.original)}
              title={t('Historique')}
            >
              <i className='ri-history-line text-textSecondary' />
            </IconButton>

            <IconButton
              size='small'
              onClick={() => handleOpenDeleteDialog(row.original)}
              disabled={!row.original.can_be_deleted}
            >
              <i className='ri-delete-bin-line text-textSecondary' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => handleOpenEditDialog(row.original)}
              disabled={!row.original.can_be_modified}
            >
              <i className='ri-edit-line text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [t, handleOpenDeleteDialog, handleOpenEditDialog, handleOpenActivationDialog, handleOpenHistoryDialog, handleOpenLevelDialog, handleOpenCreditConfigDialog, handleOpenEliminatoryModulesDialog, handleOpenModulesDialog, handleOpenMaquetteDialog]
  )

  // DataTable configuration
  const tableConfig: DataTableConfig<Programme> = {
    columns,
    data: programmes as Programme[],
    loading,
    pagination,
    availableColumns: AVAILABLE_COLUMNS,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onSearch: setSearch,
    onRefresh: refresh,
    searchPlaceholder: t('Rechercher un programme'),
    emptyMessage: t('Aucun programme disponible'),
    rowsPerPageOptions: [10, 25, 50, 100],

    // Actions
    actions: [
      {
        label: t('Ajouter'),
        icon: 'ri-add-line',
        color: 'primary',
        onClick: handleOpenAddDialog,
        disabled: loading
      },
      {
        label: 'Configuration Globale ECTS',
        icon: 'ri-medal-line',
        color: 'secondary',
        onClick: handleOpenGlobalCreditConfigDialog,
        disabled: loading
      },
      {
        label: t('Importer'),
        icon: 'ri-upload-line',
        color: 'secondary',
        onClick: handleOpenImportDialog,
        disabled: loading
      },
      {
        label: t('Exporter'),
        icon: 'ri-download-line',
        color: 'info',
        onClick: handleOpenExportDialog,
        disabled: loading
      }
    ],

    // Mobile card configuration
    mobileCard: {
      renderCard: programme => {
        return (
          <StandardMobileCard
            avatar={
              <CustomAvatar skin='light' size={50} color='primary'>
                {programme.code.substring(0, 2).toUpperCase()}
              </CustomAvatar>
            }
            title={programme.libelle}
            subtitle={programme.code}
            status={{
              label: programme.statut,
              color: statusColorMap[programme.statut]
            }}
            fields={[
              {
                icon: 'ri-book-line',
                label: t('Type'),
                value: (
                  <Chip
                    variant='tonal'
                    label={programme.type}
                    size='small'
                    color={
                      programme.type === 'Licence' ? 'primary' :
                      programme.type === 'Master' ? 'secondary' :
                      'info'
                    }
                  />
                )
              },
              {
                icon: 'ri-time-line',
                label: t('Durée'),
                value: `${programme.duree_annees} ${programme.duree_annees > 1 ? 'ans' : 'an'}`
              },
              programme.responsable
                ? {
                    icon: 'ri-user-line',
                    label: t('Responsable'),
                    value: programme.responsable.name || programme.responsable.email || '-'
                  }
                : { icon: '', value: '', hidden: true },
              {
                icon: 'ri-list-check',
                label: t('Niveaux'),
                value: `${programme.levels_count || 0}`
              },
              {
                icon: 'ri-group-line',
                label: t('Étudiants'),
                value: `${programme.students_count || 0}`
              },
              {
                icon: 'ri-calendar-line',
                label: t('Créé le'),
                value: programme.created_at ? new Date(programme.created_at).toLocaleDateString() : '-'
              }
            ]}
            actions={[
              // Manage Levels action
              {
                icon: 'ri-list-check',
                color: 'default',
                onClick: () => handleOpenLevelDialog(programme)
              },
              // Configure ECTS Credits action
              {
                icon: 'ri-medal-line',
                color: 'default',
                onClick: () => handleOpenCreditConfigDialog(programme)
              },
              // Eliminatory Modules action
              {
                icon: 'ri-alert-line',
                color: 'default',
                onClick: () => handleOpenEliminatoryModulesDialog(programme)
              },
              // Activation/Deactivation action
              ...(programme.statut === 'Actif'
                ? [
                    {
                      icon: 'ri-pause-circle-line',
                      color: 'warning' as const,
                      onClick: () => handleOpenActivationDialog(programme, 'deactivate')
                    }
                  ]
                : programme.statut === 'Inactif' || programme.statut === 'Brouillon'
                ? [
                    {
                      icon: 'ri-play-circle-line',
                      color: 'success' as const,
                      onClick: () => handleOpenActivationDialog(programme, 'activate')
                    }
                  ]
                : []),
              {
                icon: 'ri-history-line',
                color: 'default',
                onClick: () => handleOpenHistoryDialog(programme)
              },
              {
                icon: 'ri-delete-bin-line',
                color: 'error',
                onClick: () => {
                  if (programme.can_be_deleted) {
                    handleOpenDeleteDialog(programme)
                  }
                }
              },
              {
                icon: 'ri-edit-line',
                color: 'primary',
                onClick: () => {
                  if (programme.can_be_modified) {
                    handleOpenEditDialog(programme)
                  }
                }
              }
            ]}
            item={programme}
          />
        )
      }
    }
  }

  return (
    <>
      <DataTable {...tableConfig} />

      {/* Form Dialog (Add/Edit) */}
      <ProgrammeFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSuccess={handleFormSuccess}
        programme={selectedProgramme}
        isEditMode={isEditMode}
      />

      {/* Delete Dialog */}
      <ProgrammeDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onSuccess={handleDeleteSuccess}
        programme={selectedProgramme}
      />

      {/* Activation/Deactivation Dialog */}
      <ProgrammeActivationDialog
        open={activationDialogOpen}
        onClose={handleCloseActivationDialog}
        onSuccess={handleActivationSuccess}
        programme={selectedProgramme}
        action={activationAction}
      />

      {/* History Dialog */}
      <ProgrammeHistoryDialog
        open={historyDialogOpen}
        onClose={handleCloseHistoryDialog}
        programme={selectedProgramme}
      />

      {/* Import Dialog */}
      <ProgrammeImportDialog
        open={importDialogOpen}
        onClose={handleCloseImportDialog}
        onSuccess={handleImportSuccess}
      />

      {/* Export Dialog */}
      <ProgrammeExportDialog
        open={exportDialogOpen}
        onClose={handleCloseExportDialog}
      />

      {/* Level Management Dialog */}
      <ProgrammeLevelDialog
        open={levelDialogOpen}
        onClose={handleCloseLevelDialog}
        onSuccess={handleLevelSuccess}
        programme={selectedProgramme}
      />

      {/* Credit Configuration Dialog */}
      <ProgrammeCreditConfigDialog
        open={creditConfigDialogOpen}
        onClose={handleCloseCreditConfigDialog}
        programme={selectedProgramme}
      />

      {/* Global Credit Configuration Dialog */}
      <GlobalCreditConfigDialog
        open={globalCreditConfigDialogOpen}
        onClose={handleCloseGlobalCreditConfigDialog}
      />

      {/* Eliminatory Modules Dialog */}
      <EliminatoryModulesDialog
        open={eliminatoryModulesDialogOpen}
        onClose={handleCloseEliminatoryModulesDialog}
        programme={selectedProgramme}
      />

      {/* Modules Management Dialog */}
      <ProgrammeModulesDialog
        open={modulesDialogOpen}
        onClose={handleCloseModulesDialog}
        onSuccess={handleModulesSuccess}
        programme={selectedProgramme}
      />

      {/* Maquette Generation Dialog */}
      {selectedProgramme && (
        <MaquetteGenerationDialog
          open={maquetteDialogOpen}
          onClose={handleCloseMaquetteDialog}
          programme={selectedProgramme}
        />
      )}
    </>
  )
}

export default ProgrammeListTable
