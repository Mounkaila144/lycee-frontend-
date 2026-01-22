'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid2';

import { createColumnHelper } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';

import {
  useEnrollmentValidation,
  useValidationStatistics,
} from '../hooks/useEnrollmentValidation';
import { useAcademicYears } from '@/modules/StructureAcademique/admin/hooks/useAcademicYears';

import EnrollmentValidationDialog from './EnrollmentValidationDialog';
import EnrollmentRejectDialog from './EnrollmentRejectDialog';

import { DataTable, StandardMobileCard } from '@/components/shared/DataTable';
import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable';
import CustomAvatar from '@core/components/mui/Avatar';

import type { PedagogicalEnrollment, PedagogicalEnrollmentStatus } from '../../types/validation.types';

type EnrollmentWithAction = PedagogicalEnrollment & {
  action?: string;
};

const columnHelper = createColumnHelper<EnrollmentWithAction>();

const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'student', label: 'Étudiant', defaultVisible: true },
  { id: 'program', label: 'Programme', defaultVisible: true },
  { id: 'level', label: 'Niveau', defaultVisible: true },
  { id: 'total_modules', label: 'Modules', defaultVisible: true },
  { id: 'total_ects', label: 'ECTS', defaultVisible: true },
  { id: 'checks', label: 'Vérifications', defaultVisible: true },
  { id: 'status', label: 'Statut', defaultVisible: true },
  { id: 'created_at', label: 'Soumis le', defaultVisible: true },
];

/**
 * EnrollmentValidationDashboard Component
 * Dashboard for validating pedagogical enrollments
 */
export const EnrollmentValidationDashboard = () => {
  // Get academic years for filtering
  const { academicYears, loading: loadingAcademicYears } = useAcademicYears();
  const currentAcademicYear = academicYears.find(y => y.is_active) || academicYears[0];
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | undefined>(undefined);

  // Set initial academic year when data loads
  useEffect(() => {
    if (currentAcademicYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(currentAcademicYear.id);
    }
  }, [currentAcademicYear, selectedAcademicYearId]);

  const {
    enrollments,
    loading,
    error,
    pagination,
    params,
    setPage,
    setPageSize,
    setSearch,
    updateParams,
    validateEnrollment,
    rejectEnrollment,
    batchValidate,
    refresh,
  } = useEnrollmentValidation({
    status: 'Pending',
    academic_year_id: selectedAcademicYearId,
  });

  const { statistics, loading: loadingStats } = useValidationStatistics(selectedAcademicYearId);

  const [searchValue, setSearchValue] = useState(params.search || '');
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<PedagogicalEnrollment | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handle search with debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    const timeoutId = setTimeout(() => {
      setSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [setSearch]);

  // Get status color
  const getStatusColor = (status: PedagogicalEnrollmentStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
    switch (status) {
      case 'Draft':
        return 'default';
      case 'Complete':
        return 'primary';
      case 'Pending':
        return 'warning';
      case 'Validated':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status: PedagogicalEnrollmentStatus): string => {
    switch (status) {
      case 'Draft':
        return 'Brouillon';
      case 'Complete':
        return 'Complète';
      case 'Pending':
        return 'En attente';
      case 'Validated':
        return 'Validée';
      case 'Rejected':
        return 'Rejetée';
      case 'Cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  // Handle validate
  const handleValidate = useCallback((enrollment: PedagogicalEnrollment) => {
    setSelectedEnrollment(enrollment);
    setValidateDialogOpen(true);
  }, []);

  // Handle reject
  const handleReject = useCallback((enrollment: PedagogicalEnrollment) => {
    setSelectedEnrollment(enrollment);
    setRejectDialogOpen(true);
  }, []);

  // Handle validate submit
  const handleValidateSubmit = useCallback(async (notes?: string) => {
    if (!selectedEnrollment) return;

    try {
      await validateEnrollment({
        enrollment_id: selectedEnrollment.id,
        validation_notes: notes,
      });
      setValidateDialogOpen(false);
      setSelectedEnrollment(null);
      setSnackbar({ open: true, message: 'Inscription validée avec succès', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors de la validation',
        severity: 'error',
      });
    }
  }, [selectedEnrollment, validateEnrollment]);

  // Handle reject submit
  const handleRejectSubmit = useCallback(async (reason: string) => {
    if (!selectedEnrollment) return;

    try {
      await rejectEnrollment({
        enrollment_id: selectedEnrollment.id,
        rejection_reason: reason,
      });
      setRejectDialogOpen(false);
      setSelectedEnrollment(null);
      setSnackbar({ open: true, message: 'Inscription rejetée', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors du rejet',
        severity: 'error',
      });
    }
  }, [selectedEnrollment, rejectEnrollment]);

  // Columns definition
  const columns = useMemo<ColumnDef<EnrollmentWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      columnHelper.accessor('student', {
        id: 'student',
        header: 'Étudiant',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CustomAvatar skin="light" size={32} color="primary">
              {row.original.student?.firstname?.charAt(0)}
            </CustomAvatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {row.original.student?.firstname} {row.original.student?.lastname}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.original.student?.matricule}
              </Typography>
            </Box>
          </Box>
        ),
      }),
      columnHelper.accessor('program', {
        id: 'program',
        header: 'Programme',
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2" noWrap>
              {row.original.program?.name || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.program?.code}
            </Typography>
          </Box>
        ),
      }),
      columnHelper.accessor('level', {
        id: 'level',
        header: 'Niveau',
        cell: ({ row }) => (
          <Chip label={row.original.level} size="small" variant="outlined" />
        ),
      }),
      columnHelper.accessor('total_modules', {
        id: 'total_modules',
        header: 'Modules',
        cell: ({ row }) => <Typography variant="body2">{row.original.total_modules || 0}</Typography>,
      }),
      columnHelper.accessor('total_ects', {
        id: 'total_ects',
        header: 'ECTS',
        cell: ({ row }) => <Typography variant="body2">{row.original.total_ects || 0}</Typography>,
      }),
      columnHelper.display({
        id: 'checks',
        header: 'Vérifications',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Tooltip title="Modules obligatoires">
              <Chip
                icon={<i className={row.original.modules_check ? 'ri-check-line' : 'ri-close-line'} />}
                label="Mod"
                size="small"
                color={row.original.modules_check ? 'success' : 'error'}
                variant="outlined"
              />
            </Tooltip>
            <Tooltip title="Groupes assignés">
              <Chip
                icon={<i className={row.original.groups_check ? 'ri-check-line' : 'ri-close-line'} />}
                label="Grp"
                size="small"
                color={row.original.groups_check ? 'success' : 'error'}
                variant="outlined"
              />
            </Tooltip>
            <Tooltip title="Prérequis">
              <Chip
                icon={<i className={row.original.prerequisites_check ? 'ri-check-line' : 'ri-close-line'} />}
                label="Pré"
                size="small"
                color={row.original.prerequisites_check ? 'success' : 'error'}
                variant="outlined"
              />
            </Tooltip>
          </Box>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={getStatusLabel(row.original.status)}
            color={getStatusColor(row.original.status)}
            size="small"
          />
        ),
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: 'Soumis le',
        cell: ({ row }) => (
          <Typography variant="body2">
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString('fr-FR') : '-'}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Valider">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleValidate(row.original)}
                disabled={row.original.status !== 'Pending'}
              >
                <i className="ri-check-line" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rejeter">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleReject(row.original)}
                disabled={row.original.status !== 'Pending'}
              >
                <i className="ri-close-line" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      }),
    ],
    [handleValidate, handleReject]
  );

  // Table configuration
  const tableConfig: DataTableConfig<PedagogicalEnrollment> = {
    columns,
    data: enrollments,
    loading,
    pagination,
    availableColumns: AVAILABLE_COLUMNS,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onRefresh: refresh,
    emptyMessage: 'Aucune inscription disponible',
    rowsPerPageOptions: [10, 25, 50],
    actions: [
      {
        label: 'Actualiser',
        icon: 'ri-refresh-line',
        color: 'primary',
        variant: 'outlined',
        onClick: refresh,
        disabled: loading,
      },
    ],
    mobileCard: {
      renderCard: enrollment => (
        <StandardMobileCard
          avatar={
            <CustomAvatar skin="light" size={50} color="primary">
              {enrollment.student?.firstname?.charAt(0)}
            </CustomAvatar>
          }
          title={`${enrollment.student?.firstname} ${enrollment.student?.lastname}`}
          subtitle={enrollment.student?.matricule}
          status={{
            label: getStatusLabel(enrollment.status),
            color: getStatusColor(enrollment.status),
          }}
          fields={[
            {
              icon: 'ri-book-line',
              label: 'Programme',
              value: enrollment.program?.name || '-',
            },
            {
              icon: 'ri-graduation-cap-line',
              label: 'Niveau',
              value: enrollment.level,
            },
            {
              icon: 'ri-calendar-line',
              label: 'Soumis le',
              value: enrollment.created_at
                ? new Date(enrollment.created_at).toLocaleDateString('fr-FR')
                : '-',
            },
          ]}
          actions={
            enrollment.status === 'Pending'
              ? [
                  {
                    icon: 'ri-check-line',
                    color: 'success',
                    onClick: () => handleValidate(enrollment),
                  },
                  {
                    icon: 'ri-close-line',
                    color: 'error',
                    onClick: () => handleReject(enrollment),
                  },
                ]
              : []
          }
          item={enrollment}
        />
      ),
    },
  };

  return (
    <Box>
      {/* Statistics Cards */}
      {!loadingStats && statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {statistics.by_status.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {statistics.by_status.validated}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Validées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {statistics.by_status.rejected}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejetées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {statistics.validation_rate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taux validation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader title="Validation des Inscriptions Pédagogiques" />
        <Divider />

        {/* Filters */}
        <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            select
            size="small"
            label="Année académique"
            value={selectedAcademicYearId || ''}
            onChange={e => {
              const yearId = e.target.value ? Number(e.target.value) : undefined;
              setSelectedAcademicYearId(yearId);
              updateParams({ academic_year_id: yearId, page: 1 });
            }}
            sx={{ minWidth: 180 }}
            disabled={loadingAcademicYears}
          >
            {academicYears.map(year => (
              <MenuItem key={year.id} value={year.id}>
                {year.label || year.year} {year.is_active ? '(active)' : ''}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchValue}
            onChange={e => handleSearchChange(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-search-line" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Statut"
            value={params.status || 'Pending'}
            onChange={e => updateParams({ status: e.target.value as PedagogicalEnrollmentStatus, page: 1 })}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="Pending">En attente</MenuItem>
            <MenuItem value="Validated">Validées</MenuItem>
            <MenuItem value="Rejected">Rejetées</MenuItem>
            <MenuItem value="">Toutes</MenuItem>
          </TextField>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mx: 3, mb: 2 }}>
            {error.message}
          </Alert>
        )}

        {/* Data Table */}
        <Box sx={{ px: 3, pb: 3 }}>
          <DataTable {...tableConfig} />
        </Box>
      </Card>

      {/* Validate Dialog */}
      <EnrollmentValidationDialog
        open={validateDialogOpen}
        enrollment={selectedEnrollment}
        onClose={() => {
          setValidateDialogOpen(false);
          setSelectedEnrollment(null);
        }}
        onConfirm={handleValidateSubmit}
      />

      {/* Reject Dialog */}
      <EnrollmentRejectDialog
        open={rejectDialogOpen}
        enrollment={selectedEnrollment}
        onClose={() => {
          setRejectDialogOpen(false);
          setSelectedEnrollment(null);
        }}
        onConfirm={handleRejectSubmit}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnrollmentValidationDashboard;
