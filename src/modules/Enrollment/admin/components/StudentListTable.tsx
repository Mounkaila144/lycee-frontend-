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

// Type Imports
import type { ThemeColor } from '@core/types'
import type { Student, StudentStatus } from '../../types/student.types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { StudentFormDialog } from './StudentFormDialog'
import { StudentDeleteDialog } from './StudentDeleteDialog'
import { StudentDetailDialog } from './StudentDetailDialog'
import { StudentImportWizard } from './StudentImportWizard'
import { PedagogicalEnrollmentWizard } from './PedagogicalEnrollmentWizard'

// Shared DataTable Components
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable'
import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable'

// Context Imports
import { useStudentsContext } from './StudentList'

// Service Imports
import { studentService } from '../services/studentService'

// Tenant Context
import { useTenant } from '@/shared/lib/tenant-context'

type StudentWithAction = Student & {
  action?: string
}

type StudentStatusColor = {
  [key in StudentStatus]: ThemeColor
}

const statusColorMap: StudentStatusColor = {
  Actif: 'success',
  Suspendu: 'warning',
  Exclu: 'error',
  Diplômé: 'info',
  Abandon: 'secondary',
  Transféré: 'primary'
}

// Available columns configuration
const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'matricule', label: 'Matricule', defaultVisible: true },
  { id: 'firstname', label: 'Prénom', defaultVisible: true },
  { id: 'lastname', label: 'Nom', defaultVisible: true },
  { id: 'email', label: 'Email', defaultVisible: true },
  { id: 'mobile', label: 'Mobile', defaultVisible: true },
  { id: 'status', label: 'Statut', defaultVisible: true },
  { id: 'sex', label: 'Sexe', defaultVisible: false },
  { id: 'birthdate', label: 'Date de naissance', defaultVisible: false },
  { id: 'nationality', label: 'Nationalité', defaultVisible: false },
  { id: 'created_at', label: 'Créé le', defaultVisible: false },
  { id: 'updated_at', label: 'Modifié le', defaultVisible: false }
]

const STORAGE_KEY = 'studentListTableColumns'

// Column Definitions
const columnHelper = createColumnHelper<StudentWithAction>()

const StudentListTable = () => {
  // Tenant
  const { tenantId } = useTenant()

  // Context
  const { students, loading, pagination, setPage, setPageSize, setSearch, refresh, params } =
    useStudentsContext()

  // States
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false)
  const [enrollmentStudent, setEnrollmentStudent] = useState<Student | null>(null)

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
    setSelectedStudent(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }, [])

  const handleOpenEditDialog = useCallback((student: Student) => {
    setSelectedStudent(student)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }, [])

  const handleCloseFormDialog = useCallback(() => {
    setFormDialogOpen(false)
    setSelectedStudent(null)
    setIsEditMode(false)
  }, [])

  const handleFormSuccess = useCallback(() => {
    refresh()
    handleCloseFormDialog()
  }, [refresh, handleCloseFormDialog])

  // Handle delete dialog
  const handleOpenDeleteDialog = useCallback((student: Student) => {
    setSelectedStudent(student)
    setDeleteDialogOpen(true)
  }, [])

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false)
    setSelectedStudent(null)
  }, [])

  const handleDeleteSuccess = useCallback(() => {
    refresh()
    handleCloseDeleteDialog()
  }, [refresh, handleCloseDeleteDialog])

  // Handle export to Excel
  const handleExportExcel = useCallback(async () => {
    try {
      setExporting(true)
      const blob = await studentService.exportToExcel(
        {
          search: params.search,
          status: params.status,
          sex: params.sex,
          nationality: params.nationality,
        },
        tenantId || undefined
      )

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `etudiants_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }, [params, tenantId])

  // Handle view (open detail modal)
  const handleViewClick = useCallback((student: Student) => {
    setSelectedStudentId(student.id)
    setDetailDialogOpen(true)
  }, [])

  // Handle close detail dialog
  const handleCloseDetailDialog = useCallback(() => {
    setDetailDialogOpen(false)
    setSelectedStudentId(null)
  }, [])

  // Handle edit from detail dialog
  const handleEditFromDetail = useCallback((student: Student) => {
    setSelectedStudent(student)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }, [])

  // Handle delete from detail dialog
  const handleDeleteFromDetail = useCallback((student: Student) => {
    setSelectedStudent(student)
    setDeleteDialogOpen(true)
  }, [])

  // Handle pedagogical enrollment
  const handleOpenEnrollmentDialog = useCallback((student: Student) => {
    setEnrollmentStudent(student)
    setEnrollmentDialogOpen(true)
  }, [])

  const handleCloseEnrollmentDialog = useCallback(() => {
    setEnrollmentDialogOpen(false)
    setEnrollmentStudent(null)
  }, [])

  const handleEnrollmentSuccess = useCallback(() => {
    refresh()
    handleCloseEnrollmentDialog()
  }, [refresh, handleCloseEnrollmentDialog])

  // Column definitions
  const columns = useMemo<ColumnDef<StudentWithAction, any>[]>(
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
      columnHelper.accessor('matricule', {
        id: 'matricule',
        header: 'Matricule',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <CustomAvatar skin='light' size={34} color='primary'>
              {row.original.matricule.substring(0, 2).toUpperCase()}
            </CustomAvatar>
            <Typography color='text.primary' className='font-medium'>
              {row.original.matricule}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('firstname', {
        id: 'firstname',
        header: 'Prénom',
        cell: ({ row }) => <Typography>{row.original.firstname || '-'}</Typography>
      }),
      columnHelper.accessor('lastname', {
        id: 'lastname',
        header: 'Nom',
        cell: ({ row }) => (
          <Typography className='font-medium'>{row.original.lastname || '-'}</Typography>
        )
      }),
      columnHelper.accessor('email', {
        id: 'email',
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email || '-'}</Typography>
      }),
      columnHelper.accessor('mobile', {
        id: 'mobile',
        header: 'Mobile',
        cell: ({ row }) => <Typography>{row.original.mobile || '-'}</Typography>
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.status}
            size='small'
            color={statusColorMap[row.original.status]}
          />
        )
      }),
      columnHelper.accessor('sex', {
        id: 'sex',
        header: 'Sexe',
        cell: ({ row }) => {
          const sexLabels = { M: 'Masculin', F: 'Féminin', O: 'Autre' }

          return <Typography>{sexLabels[row.original.sex] || '-'}</Typography>
        }
      }),
      columnHelper.accessor('birthdate', {
        id: 'birthdate',
        header: 'Date de naissance',
        cell: ({ row }) => (
          <Typography>
            {row.original.birthdate
              ? new Date(row.original.birthdate).toLocaleDateString('fr-FR')
              : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('nationality', {
        id: 'nationality',
        header: 'Nationalité',
        cell: ({ row }) => <Typography>{row.original.nationality || '-'}</Typography>
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: 'Créé le',
        cell: ({ row }) => (
          <Typography>
            {row.original.created_at
              ? new Date(row.original.created_at).toLocaleDateString('fr-FR')
              : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('updated_at', {
        id: 'updated_at',
        header: 'Modifié le',
        cell: ({ row }) => (
          <Typography>
            {row.original.updated_at
              ? new Date(row.original.updated_at).toLocaleDateString('fr-FR')
              : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton
              size='small'
              onClick={() => handleViewClick(row.original)}
              title='Voir détails'
            >
              <i className='ri-eye-line text-textSecondary' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => handleOpenEditDialog(row.original)}
              title='Modifier'
            >
              <i className='ri-edit-line text-textSecondary' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => handleOpenDeleteDialog(row.original)}
              title='Supprimer'
            >
              <i className='ri-delete-bin-line text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [handleViewClick, handleOpenEditDialog, handleOpenDeleteDialog, handleOpenEnrollmentDialog]
  )

  // DataTable configuration
  const tableConfig: DataTableConfig<Student> = {
    columns,
    data: students as Student[],
    loading,
    pagination,
    availableColumns: AVAILABLE_COLUMNS,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onSearch: setSearch,
    onRefresh: refresh,
    searchPlaceholder: 'Rechercher un étudiant',
    emptyMessage: 'Aucun étudiant disponible',
    rowsPerPageOptions: [10, 25, 50, 100],

    // Actions
    actions: [
      {
        label: 'Ajouter',
        icon: 'ri-add-line',
        color: 'primary',
        onClick: handleOpenAddDialog,
        disabled: loading
      },
      {
        label: 'Importer',
        icon: 'ri-upload-2-line',
        color: 'info',
        variant: 'outlined',
        onClick: () => setImportDialogOpen(true),
        disabled: loading
      },
      {
        label: exporting ? 'Export...' : 'Export Excel',
        icon: 'ri-file-excel-2-line',
        color: 'success',
        variant: 'outlined',
        onClick: handleExportExcel,
        disabled: loading || exporting || students.length === 0
      }
    ],

    // Mobile card configuration
    mobileCard: {
      renderCard: student => {
        return (
          <StandardMobileCard
            avatar={
              <CustomAvatar skin='light' size={50} color='primary'>
                {student.matricule.substring(0, 2).toUpperCase()}
              </CustomAvatar>
            }
            title={`${student.firstname} ${student.lastname}`}
            subtitle={student.matricule}
            status={{
              label: student.status,
              color: statusColorMap[student.status]
            }}
            fields={[
              {
                icon: 'ri-mail-line',
                label: 'Email',
                value: student.email
              },
              {
                icon: 'ri-phone-line',
                label: 'Mobile',
                value: student.mobile
              },
              {
                icon: 'ri-user-line',
                label: 'Sexe',
                value: student.sex === 'M' ? 'Masculin' : student.sex === 'F' ? 'Féminin' : 'Autre'
              },
              {
                icon: 'ri-calendar-line',
                label: 'Date de naissance',
                value: student.birthdate
                  ? new Date(student.birthdate).toLocaleDateString('fr-FR')
                  : '-'
              },
              {
                icon: 'ri-flag-line',
                label: 'Nationalité',
                value: student.nationality || '-'
              }
            ]}
            actions={[
              {
                icon: 'ri-eye-line',
                color: 'default',
                onClick: () => handleViewClick(student)
              },
              {
                icon: 'ri-book-open-line',
                color: 'primary',
                onClick: () => handleOpenEnrollmentDialog(student)
              },
              {
                icon: 'ri-edit-line',
                color: 'info',
                onClick: () => handleOpenEditDialog(student)
              },
              {
                icon: 'ri-delete-bin-line',
                color: 'error',
                onClick: () => handleOpenDeleteDialog(student)
              }
            ]}
            item={student}
          />
        )
      }
    }
  }

  return (
    <>
      <DataTable {...tableConfig} />

      {/* Form Dialog (Add/Edit) */}
      <StudentFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSuccess={handleFormSuccess}
        student={selectedStudent}
        isEditMode={isEditMode}
      />

      {/* Delete Dialog */}
      <StudentDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onSuccess={handleDeleteSuccess}
        student={selectedStudent}
      />

      {/* Detail Dialog */}
      <StudentDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        studentId={selectedStudentId}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      {/* Import Wizard Dialog */}
      <StudentImportWizard
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={refresh}
      />

      {/* Pedagogical Enrollment Wizard */}
      {enrollmentStudent && (
        <PedagogicalEnrollmentWizard
          open={enrollmentDialogOpen}
          onClose={handleCloseEnrollmentDialog}
          studentId={enrollmentStudent.id}
          programId={(enrollmentStudent as any).programme_id || 1}
          level="L1"
          semesterId={1}
          academicYearId={1}
          studentInfo={{
            matricule: enrollmentStudent.matricule,
            firstname: enrollmentStudent.firstname,
            lastname: enrollmentStudent.lastname
          }}
          onEnrollmentComplete={handleEnrollmentSuccess}
        />
      )}
    </>
  )
}

export default StudentListTable
