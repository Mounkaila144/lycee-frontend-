'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

import { useGradeValidations, useValidationStatistics, usePublishGrades } from '../hooks';
import { GradeValidationReview } from './GradeValidationReview';
import type { GradeValidation, GradeValidationStatus } from '../../types';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable';
import type { DataTableConfig } from '@/components/shared/DataTable';

const columnHelper = createColumnHelper<GradeValidation>();

interface GradeValidationsDashboardProps {
  tenantId?: string;
  academicYearId?: number;
  semesterId?: number;
}

export const GradeValidationsDashboard: React.FC<GradeValidationsDashboardProps> = ({
  tenantId,
  academicYearId,
  semesterId,
}) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState<GradeValidationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedValidation, setSelectedValidation] = useState<GradeValidation | null>(null);
  const [publishingValidation, setPublishingValidation] = useState<GradeValidation | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Build filters
  const filters = {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    academic_year_id: academicYearId,
    semester_id: semesterId,
    search: search || undefined,
  };

  // Hooks
  const { data: validationsData, isLoading, refetch } = useGradeValidations(
    filters,
    page,
    rowsPerPage,
    tenantId
  );

  const publishMutation = usePublishGrades(tenantId);

  const { data: statistics } = useValidationStatistics(
    {
      academic_year_id: academicYearId,
      semester_id: semesterId,
    },
    tenantId
  );

  const getStatusColor = useCallback((status: GradeValidationStatus): 'warning' | 'success' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'Pending':
      case 'Submitted':
        return 'warning';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Published':
        return 'info';
      default:
        return 'default';
    }
  }, []);

  const getStatusLabel = useCallback((status: GradeValidationStatus) => {
    switch (status) {
      case 'Pending':
      case 'Submitted':
        return 'En attente';
      case 'Approved':
        return 'Validé';
      case 'Rejected':
        return 'Rejeté';
      case 'Published':
        return 'Publié';
      default:
        return status;
    }
  }, []);

  const handleOpenReview = useCallback((validation: GradeValidation) => {
    setSelectedValidation(validation);
  }, []);

  const handleCloseReview = useCallback(() => {
    setSelectedValidation(null);
  }, []);

  const handleActionComplete = useCallback(() => {
    setSelectedValidation(null);
    refetch();
  }, [refetch]);

  const handleOpenPublish = useCallback((validation: GradeValidation) => {
    setPublishError(null);
    setPublishingValidation(validation);
  }, []);

  const handleClosePublish = useCallback(() => {
    setPublishingValidation(null);
    setPublishError(null);
  }, []);

  const handleConfirmPublish = useCallback(async () => {
    if (!publishingValidation) return;

    setPublishError(null);

    try {
      await publishMutation.mutateAsync({ validationId: publishingValidation.id });
      setPublishingValidation(null);
      refetch();
    } catch (err: any) {
      setPublishError(err?.response?.data?.message || 'Erreur lors de la publication');
    }
  }, [publishingValidation, publishMutation, refetch]);

  // Column definitions
  const columns = useMemo<ColumnDef<GradeValidation, any>[]>(
    () => [
      columnHelper.accessor('module', {
        id: 'module',
        header: 'Module',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-medium'>
            {row.original.module?.name || '-'}
          </Typography>
        ),
      }),
      columnHelper.accessor('evaluation', {
        id: 'evaluation',
        header: 'Évaluation',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row.original.evaluation?.name || 'Toutes'}
          </Typography>
        ),
      }),
      columnHelper.accessor('submitter', {
        id: 'teacher',
        header: 'Enseignant',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row.original.submitter?.name || '-'}
          </Typography>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={getStatusLabel(row.original.status)}
            color={getStatusColor(row.original.status)}
            size='small'
          />
        ),
      }),
      columnHelper.accessor('statistics', {
        id: 'average',
        header: 'Moyenne',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row.original.statistics?.average?.toFixed(2) || '-'}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'pass_rate',
        header: 'Taux réussite',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row.original.statistics?.pass_rate
              ? `${row.original.statistics.pass_rate.toFixed(1)}%`
              : '-'}
          </Typography>
        ),
      }),
      columnHelper.accessor('anomalies', {
        id: 'anomalies',
        header: 'Anomalies',
        cell: ({ row }) =>
          row.original.anomalies && row.original.anomalies.length > 0 ? (
            <Chip label={row.original.anomalies.length} color='error' size='small' />
          ) : (
            <Chip label='0' color='success' size='small' />
          ),
      }),
      columnHelper.accessor('submitted_at', {
        id: 'submitted_at',
        header: 'Date soumission',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.submitted_at ? new Date(row.original.submitted_at).toLocaleDateString('fr-FR') : '-'}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton
              size='small'
              onClick={() => handleOpenReview(row.original)}
              color='info'
              title='Voir détails'
            >
              <i className='ri-eye-line' />
            </IconButton>
            {row.original.status === 'Pending' && (
              <>
                <IconButton
                  size='small'
                  color='success'
                  onClick={() => handleOpenReview(row.original)}
                  title='Valider'
                >
                  <i className='ri-check-line' />
                </IconButton>
                <IconButton
                  size='small'
                  color='error'
                  onClick={() => handleOpenReview(row.original)}
                  title='Rejeter'
                >
                  <i className='ri-close-line' />
                </IconButton>
              </>
            )}
            {row.original.status === 'Approved' && (
              <IconButton
                size='small'
                color='primary'
                onClick={() => handleOpenPublish(row.original)}
                title='Publier'
              >
                <i className='ri-upload-2-line' />
              </IconButton>
            )}
          </div>
        ),
      }),
    ],
    [getStatusColor, getStatusLabel, handleOpenReview, handleOpenPublish]
  );

  // DataTable configuration
  const tableConfig: DataTableConfig<GradeValidation> = {
    columns,
    data: validationsData?.data || [],
    loading: isLoading,
    pagination: validationsData
      ? {
          current_page: validationsData.current_page,
          last_page: validationsData.last_page,
          per_page: validationsData.per_page,
          total: validationsData.total,
        }
      : undefined,
    onPageChange: setPage,
    onPageSizeChange: (size) => {
      setRowsPerPage(size);
      setPage(1);
    },
    onSearch: setSearch,
    onRefresh: () => refetch(),
    searchPlaceholder: 'Rechercher par module, enseignant...',
    emptyMessage: 'Aucune validation trouvée',
    rowsPerPageOptions: [10, 15, 25, 50],

    // Mobile card configuration
    mobileCard: {
      renderCard: (validation) => (
        <StandardMobileCard
          title={validation.module?.name || '-'}
          subtitle={validation.evaluation?.name || 'Toutes les évaluations'}
          status={{
            label: getStatusLabel(validation.status),
            color: getStatusColor(validation.status),
          }}
          fields={[
            {
              icon: 'ri-user-line',
              label: 'Enseignant',
              value: validation.submitter?.name || '-',
            },
            {
              icon: 'ri-bar-chart-line',
              label: 'Moyenne',
              value: validation.statistics?.average?.toFixed(2) || '-',
            },
            {
              icon: 'ri-percent-line',
              label: 'Taux réussite',
              value: validation.statistics?.pass_rate
                ? `${validation.statistics.pass_rate.toFixed(1)}%`
                : '-',
            },
            {
              icon: 'ri-error-warning-line',
              label: 'Anomalies',
              value:
                validation.anomalies && validation.anomalies.length > 0 ? (
                  <Chip label={validation.anomalies.length} color='error' size='small' />
                ) : (
                  <Chip label='0' color='success' size='small' />
                ),
            },
            {
              icon: 'ri-calendar-line',
              label: 'Soumission',
              value: validation.submitted_at ? new Date(validation.submitted_at).toLocaleDateString('fr-FR') : '-',
            },
          ]}
          actions={[
            {
              icon: 'ri-eye-line',
              color: 'info' as const,
              onClick: () => handleOpenReview(validation),
            },
            ...(validation.status === 'Pending'
              ? [
                  {
                    icon: 'ri-check-line',
                    color: 'success' as const,
                    onClick: () => handleOpenReview(validation),
                  },
                  {
                    icon: 'ri-close-line',
                    color: 'error' as const,
                    onClick: () => handleOpenReview(validation),
                  },
                ]
              : []),
            ...(validation.status === 'Approved'
              ? [
                  {
                    icon: 'ri-upload-2-line',
                    color: 'primary' as const,
                    onClick: () => handleOpenPublish(validation),
                  },
                ]
              : []),
          ]}
          item={validation}
        />
      ),
    },
  };

  return (
    <Box>
      {/* Statistics Cards */}
      {statistics && (
        <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(200px, 1fr))' gap={2} mb={3}>
          <Card>
            <CardContent>
              <Typography variant='caption' color='text.secondary'>
                Total
              </Typography>
              <Typography variant='h4'>{statistics.total}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant='caption' color='text.secondary'>
                En attente
              </Typography>
              <Typography variant='h4'>{statistics.pending}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant='caption' color='text.secondary'>
                Validés
              </Typography>
              <Typography variant='h4'>{statistics.approved}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant='caption' color='text.secondary'>
                Rejetés
              </Typography>
              <Typography variant='h4'>{statistics.rejected}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant='caption' color='text.secondary'>
                Publiés
              </Typography>
              <Typography variant='h4'>{statistics.published}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant='caption' color='text.secondary'>
                Taux de rejet
              </Typography>
              <Typography variant='h4'>{statistics.rejection_rate?.toFixed(1) ?? 0}%</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Status Filter */}
      <Box mb={2}>
        <TextField
          select
          label='Statut'
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as GradeValidationStatus | 'all');
            setPage(1);
          }}
          size='small'
          sx={{ minWidth: 150 }}
        >
          <MenuItem value='all'>Tous</MenuItem>
          <MenuItem value='Pending'>En attente</MenuItem>
          <MenuItem value='Approved'>Validé</MenuItem>
          <MenuItem value='Rejected'>Rejeté</MenuItem>
          <MenuItem value='Published'>Publié</MenuItem>
        </TextField>
      </Box>

      {/* Data Table */}
      <DataTable {...tableConfig} />

      {/* Review Modal */}
      <Dialog
        open={selectedValidation !== null}
        onClose={handleCloseReview}
        maxWidth='lg'
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' },
        }}
      >
        <DialogTitle>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography variant='h6'>Détails de la validation</Typography>
            <IconButton onClick={handleCloseReview} size='small'>
              <i className='ri-close-line' />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedValidation && (
            <GradeValidationReview
              validationId={selectedValidation.id}
              initialData={selectedValidation}
              tenantId={tenantId}
              onActionComplete={handleActionComplete}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <Dialog open={publishingValidation !== null} onClose={handleClosePublish} maxWidth='xs' fullWidth>
        <DialogTitle>Publier les notes</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Publier les notes de{' '}
            <strong>{publishingValidation?.module?.name}</strong>
            {publishingValidation?.evaluation && ` - ${publishingValidation.evaluation.name}`} ?
          </Typography>
          <Typography variant='body2' color='text.secondary' className='mt-2'>
            Les notes seront visibles aux étudiants.
          </Typography>
          {publishError && (
            <Alert severity='error' className='mt-3'>{publishError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePublish} disabled={publishMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleConfirmPublish}
            disabled={publishMutation.isPending}
            startIcon={publishMutation.isPending ? <CircularProgress size={16} /> : <i className='ri-upload-2-line' />}
          >
            Publier maintenant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
