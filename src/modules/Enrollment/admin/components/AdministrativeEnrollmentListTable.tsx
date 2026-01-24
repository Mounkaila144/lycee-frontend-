'use client';

// React Imports
import { useState, useMemo, useCallback } from 'react';

// MUI Imports
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table';

import type { ColumnDef } from '@tanstack/react-table';

// Type Imports
import type { ThemeColor } from '@core/types';
import type { AdministrativeEnrollment, AdministrativeEnrollmentStatus, AcademicLevel } from '../../types/administrativeEnrollment.types';

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar';
import { AdministrativeEnrollmentFormDialog } from './AdministrativeEnrollmentFormDialog';
import { AdministrativeEnrollmentDeleteDialog } from './AdministrativeEnrollmentDeleteDialog';
import { AdministrativeEnrollmentDetailDialog } from './AdministrativeEnrollmentDetailDialog';

// Shared DataTable Components
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable';

import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable';

// Context Imports
import { useAdministrativeEnrollmentsContext } from './AdministrativeEnrollmentList';

type EnrollmentWithAction = AdministrativeEnrollment & {
  action?: string;
};

type EnrollmentStatusColor = {
  [key in AdministrativeEnrollmentStatus]: ThemeColor;
};

const statusColorMap: EnrollmentStatusColor = {
  Actif: 'success',
  Suspendu: 'warning',
  Annulé: 'error',
  Terminé: 'info',
  Validé: 'primary',
  Rejeté: 'secondary',
};

const levelLabels: Record<AcademicLevel, string> = {
  L1: 'Licence 1',
  L2: 'Licence 2',
  L3: 'Licence 3',
  M1: 'Master 1',
  M2: 'Master 2',
};

// Available columns configuration
const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'student', label: 'Etudiant', defaultVisible: true },
  { id: 'programme', label: 'Programme', defaultVisible: true },
  { id: 'level', label: 'Niveau', defaultVisible: true },
  { id: 'semester', label: 'Semestre', defaultVisible: true },
  { id: 'status', label: 'Statut', defaultVisible: true },
  { id: 'enrollment_date', label: "Date d'inscription", defaultVisible: true },
  { id: 'academic_year', label: 'Année académique', defaultVisible: false },
  { id: 'total_credits', label: 'Crédits', defaultVisible: false },
  { id: 'created_at', label: 'Créé le', defaultVisible: false },
];

const STORAGE_KEY = 'administrativeEnrollmentListTableColumns';

// Column Definitions
const columnHelper = createColumnHelper<EnrollmentWithAction>();

const AdministrativeEnrollmentListTable = () => {
  // Context
  const {
    enrollments,
    loading,
    pagination,
    params,
    setPage,
    setPageSize,
    setFilters,
    refresh,
    downloadEnrollmentSheet,
    programmes,
    academicYears,
    semesters,
  } = useAdministrativeEnrollmentsContext();

  // States
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<AdministrativeEnrollment | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filter states
  const [programmeFilter, setProgrammeFilter] = useState<number | ''>('');
  const [semesterFilter, setSemesterFilter] = useState<number | ''>('');
  const [levelFilter, setLevelFilter] = useState<AcademicLevel | ''>('');
  const [statusFilter, setStatusFilter] = useState<AdministrativeEnrollmentStatus | ''>('');

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }

    const defaultVisibility: Record<string, boolean> = {};

    AVAILABLE_COLUMNS.forEach(col => {
      defaultVisibility[col.id] = col.defaultVisible !== false;
    });

    return defaultVisibility;
  });

  // Handle form dialog
  const handleOpenAddDialog = useCallback(() => {
    setSelectedEnrollment(null);
    setIsEditMode(false);
    setFormDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((enrollment: AdministrativeEnrollment) => {
    setSelectedEnrollment(enrollment);
    setIsEditMode(true);
    setFormDialogOpen(true);
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setFormDialogOpen(false);
    setSelectedEnrollment(null);
    setIsEditMode(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    refresh();
    handleCloseFormDialog();
  }, [refresh, handleCloseFormDialog]);

  // Handle delete dialog
  const handleOpenDeleteDialog = useCallback((enrollment: AdministrativeEnrollment) => {
    setSelectedEnrollment(enrollment);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedEnrollment(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refresh();
    handleCloseDeleteDialog();
  }, [refresh, handleCloseDeleteDialog]);

  // Handle detail dialog
  const handleViewClick = useCallback((enrollment: AdministrativeEnrollment) => {
    setSelectedEnrollment(enrollment);
    setDetailDialogOpen(true);
  }, []);

  const handleCloseDetailDialog = useCallback(() => {
    setDetailDialogOpen(false);
    setSelectedEnrollment(null);
  }, []);

  // Handle download PDF
  const handleDownloadPDF = useCallback(
    async (enrollment: AdministrativeEnrollment) => {
      try {
        await downloadEnrollmentSheet(enrollment.id);
      } catch (error) {
        console.error('Failed to download enrollment sheet:', error);
      }
    },
    [downloadEnrollmentSheet]
  );

  // Handle filter changes
  const handleProgrammeFilterChange = useCallback(
    (value: number | '') => {
      setProgrammeFilter(value);
      setFilters({ programme_id: value || undefined });
    },
    [setFilters]
  );

  const handleSemesterFilterChange = useCallback(
    (value: number | '') => {
      setSemesterFilter(value);
      setFilters({ semester_id: value || undefined });
    },
    [setFilters]
  );

  const handleLevelFilterChange = useCallback(
    (value: AcademicLevel | '') => {
      setLevelFilter(value);
      setFilters({ level: value || undefined });
    },
    [setFilters]
  );

  const handleStatusFilterChange = useCallback(
    (value: AdministrativeEnrollmentStatus | '') => {
      setStatusFilter(value);
      setFilters({ status: value || undefined });
    },
    [setFilters]
  );

  // Column definitions
  const columns = useMemo<ColumnDef<EnrollmentWithAction, any>[]>(
    () => [
      columnHelper.accessor('id', {
        id: 'id',
        header: '#',
        cell: ({ row }) => <Typography>{row.original.id || '-'}</Typography>,
      }),
      columnHelper.accessor('student', {
        id: 'student',
        header: 'Etudiant',
        cell: ({ row }) => {
          const student = row.original.student;

          return student ? (
            <div className="flex items-center gap-3">
              <CustomAvatar skin="light" size={34} color="primary">
                {student.matricule?.substring(0, 2).toUpperCase() || '??'}
              </CustomAvatar>
              <div>
                <Typography color="text.primary" className="font-medium">
                  {student.firstname} {student.lastname}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {student.matricule}
                </Typography>
              </div>
            </div>
          ) : (
            <Typography>-</Typography>
          );
        },
      }),
      columnHelper.accessor('programme', {
        id: 'programme',
        header: 'Programme',
        cell: ({ row }) => {
          const programme = row.original.programme;

          return programme ? (
            <div>
              <Typography color="text.primary">{programme.libelle}</Typography>
              <Typography variant="caption" color="text.secondary">
                {programme.code}
              </Typography>
            </div>
          ) : (
            <Typography>-</Typography>
          );
        },
      }),
      columnHelper.accessor('level', {
        id: 'level',
        header: 'Niveau',
        cell: ({ row }) => (
          <Chip
            variant="outlined"
            label={levelLabels[row.original.level] || row.original.level}
            size="small"
            color="primary"
          />
        ),
      }),
      columnHelper.accessor('semester', {
        id: 'semester',
        header: 'Semestre',
        cell: ({ row }) => {
          const semester = row.original.semester;

          return <Typography>{semester?.name || '-'}</Typography>;
        },
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Statut',
        cell: ({ row }) => (
          <Chip variant="tonal" label={row.original.status} size="small" color={statusColorMap[row.original.status]} />
        ),
      }),
      columnHelper.accessor('enrollment_date', {
        id: 'enrollment_date',
        header: "Date d'inscription",
        cell: ({ row }) => (
          <Typography>
            {row.original.enrollment_date ? new Date(row.original.enrollment_date).toLocaleDateString('fr-FR') : '-'}
          </Typography>
        ),
      }),
      columnHelper.accessor('academic_year', {
        id: 'academic_year',
        header: 'Année académique',
        cell: ({ row }) => {
          const academicYear = row.original.academic_year;

          return <Typography>{academicYear?.name || '-'}</Typography>;
        },
      }),
      columnHelper.accessor('total_credits', {
        id: 'total_credits',
        header: 'Crédits',
        cell: ({ row }) => <Typography>{row.original.total_credits ?? '-'}</Typography>,
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: 'Créé le',
        cell: ({ row }) => (
          <Typography>
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString('fr-FR') : '-'}
          </Typography>
        ),
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            <IconButton size="small" onClick={() => handleViewClick(row.original)} title="Voir détails">
              <i className="ri-eye-line text-textSecondary" />
            </IconButton>
            <IconButton size="small" onClick={() => handleDownloadPDF(row.original)} title="Télécharger fiche">
              <i className="ri-download-line text-textSecondary" />
            </IconButton>
            <IconButton size="small" onClick={() => handleOpenEditDialog(row.original)} title="Modifier">
              <i className="ri-edit-line text-textSecondary" />
            </IconButton>
            <IconButton size="small" onClick={() => handleOpenDeleteDialog(row.original)} title="Supprimer">
              <i className="ri-delete-bin-line text-textSecondary" />
            </IconButton>
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [handleViewClick, handleOpenEditDialog, handleOpenDeleteDialog, handleDownloadPDF]
  );

  // Filter components
  const filterComponents = (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Programme</InputLabel>
        <Select
          value={programmeFilter}
          label="Programme"
          onChange={e => handleProgrammeFilterChange(e.target.value as number | '')}
        >
          <MenuItem value="">Tous</MenuItem>
          {programmes.map(prog => (
            <MenuItem key={prog.id} value={prog.id}>
              {prog.libelle}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Semestre</InputLabel>
        <Select
          value={semesterFilter}
          label="Semestre"
          onChange={e => handleSemesterFilterChange(e.target.value as number | '')}
        >
          <MenuItem value="">Tous</MenuItem>
          {semesters.map(sem => (
            <MenuItem key={sem.id} value={sem.id}>
              {sem.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Niveau</InputLabel>
        <Select
          value={levelFilter}
          label="Niveau"
          onChange={e => handleLevelFilterChange(e.target.value as AcademicLevel | '')}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="L1">Licence 1</MenuItem>
          <MenuItem value="L2">Licence 2</MenuItem>
          <MenuItem value="L3">Licence 3</MenuItem>
          <MenuItem value="M1">Master 1</MenuItem>
          <MenuItem value="M2">Master 2</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Statut</InputLabel>
        <Select
          value={statusFilter}
          label="Statut"
          onChange={e => handleStatusFilterChange(e.target.value as AdministrativeEnrollmentStatus | '')}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="Actif">Actif</MenuItem>
          <MenuItem value="Suspendu">Suspendu</MenuItem>
          <MenuItem value="Annulé">Annulé</MenuItem>
          <MenuItem value="Terminé">Terminé</MenuItem>
          <MenuItem value="Validé">Validé</MenuItem>
          <MenuItem value="Rejeté">Rejeté</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  // DataTable configuration
  const tableConfig: DataTableConfig<AdministrativeEnrollment> = {
    columns,
    data: enrollments,
    loading,
    pagination,
    availableColumns: AVAILABLE_COLUMNS,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onRefresh: refresh,
    searchPlaceholder: 'Rechercher une inscription',
    emptyMessage: 'Aucune inscription administrative disponible',
    rowsPerPageOptions: [10, 25, 50, 100],
    filterComponents,

    // Actions
    actions: [
      {
        label: 'Nouvelle inscription',
        icon: 'ri-add-line',
        color: 'primary',
        onClick: handleOpenAddDialog,
        disabled: loading,
      },
    ],

    // Mobile card configuration
    mobileCard: {
      renderCard: enrollment => {
        const student = enrollment.student;
        const programme = enrollment.programme;

        return (
          <StandardMobileCard
            avatar={
              <CustomAvatar skin="light" size={50} color="primary">
                {student?.matricule?.substring(0, 2).toUpperCase() || '??'}
              </CustomAvatar>
            }
            title={student ? `${student.firstname} ${student.lastname}` : 'Etudiant inconnu'}
            subtitle={student?.matricule || '-'}
            status={{
              label: enrollment.status,
              color: statusColorMap[enrollment.status],
            }}
            fields={[
              {
                icon: 'ri-book-line',
                label: 'Programme',
                value: programme?.libelle || '-',
              },
              {
                icon: 'ri-graduation-cap-line',
                label: 'Niveau',
                value: levelLabels[enrollment.level] || enrollment.level,
              },
              {
                icon: 'ri-calendar-line',
                label: 'Semestre',
                value: enrollment.semester?.name || '-',
              },
              {
                icon: 'ri-calendar-check-line',
                label: "Date d'inscription",
                value: enrollment.enrollment_date
                  ? new Date(enrollment.enrollment_date).toLocaleDateString('fr-FR')
                  : '-',
              },
            ]}
            actions={[
              {
                icon: 'ri-eye-line',
                color: 'default',
                onClick: () => handleViewClick(enrollment),
              },
              {
                icon: 'ri-download-line',
                color: 'info',
                onClick: () => handleDownloadPDF(enrollment),
              },
              {
                icon: 'ri-edit-line',
                color: 'primary',
                onClick: () => handleOpenEditDialog(enrollment),
              },
              {
                icon: 'ri-delete-bin-line',
                color: 'error',
                onClick: () => handleOpenDeleteDialog(enrollment),
              },
            ]}
            item={enrollment}
          />
        );
      },
    },
  };

  return (
    <>
      <DataTable {...tableConfig} />

      {/* Form Dialog (Add/Edit) */}
      <AdministrativeEnrollmentFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSuccess={handleFormSuccess}
        enrollment={selectedEnrollment}
        isEditMode={isEditMode}
      />

      {/* Delete Dialog */}
      <AdministrativeEnrollmentDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onSuccess={handleDeleteSuccess}
        enrollment={selectedEnrollment}
      />

      {/* Detail Dialog */}
      <AdministrativeEnrollmentDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        enrollment={selectedEnrollment}
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog}
      />
    </>
  );
};

export default AdministrativeEnrollmentListTable;
