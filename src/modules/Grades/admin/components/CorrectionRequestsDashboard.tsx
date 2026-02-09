'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
} from '@mui/material';

import { useCorrectionRequests } from '../hooks';
import { CorrectionRequestReview } from './CorrectionRequestReview';
import type { CorrectionRequest, CorrectionRequestStatus } from '../../types';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable';
import type { DataTableConfig } from '@/components/shared/DataTable';

const columnHelper = createColumnHelper<CorrectionRequest>();

interface CorrectionRequestsDashboardProps {
  tenantId?: string;
}

const getStatusColor = (status: CorrectionRequestStatus): 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'error';
    default:
      return 'warning';
  }
};

const getStatusLabel = (status: CorrectionRequestStatus): string => {
  switch (status) {
    case 'Pending':
      return 'En attente';
    case 'Approved':
      return 'Approuvée';
    case 'Rejected':
      return 'Rejetée';
    default:
      return status;
  }
};

export const CorrectionRequestsDashboard: React.FC<CorrectionRequestsDashboardProps> = ({
  tenantId,
}) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState<CorrectionRequestStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<CorrectionRequest | null>(null);

  const filters = {
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const { data: requestsData, isLoading, refetch } = useCorrectionRequests(
    filters,
    page,
    rowsPerPage,
    tenantId
  );

  const handleOpenReview = useCallback((request: CorrectionRequest) => {
    setSelectedRequest(request);
  }, []);

  const handleCloseReview = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const handleActionComplete = useCallback(() => {
    setSelectedRequest(null);
    refetch();
  }, [refetch]);

  const columns = useMemo<ColumnDef<CorrectionRequest, any>[]>(
    () => [
      columnHelper.display({
        id: 'student',
        header: 'Étudiant',
        cell: ({ row }) => {
          const student = row.original.grade?.student;

          return (
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {student?.full_name || (student ? `${student.lastname || ''} ${student.firstname || ''}`.trim() : '-')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {student?.matricule || '-'}
              </Typography>
            </Box>
          );
        },
      }),
      columnHelper.display({
        id: 'module',
        header: 'Module / Évaluation',
        cell: ({ row }) => {
          const evaluation = row.original.grade?.evaluation;

          return (
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {evaluation?.module?.name || '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {evaluation?.name || '-'} ({evaluation?.type || '-'})
              </Typography>
            </Box>
          );
        },
      }),
      columnHelper.display({
        id: 'values',
        header: 'Note actuelle → Proposée',
        cell: ({ row }) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {row.original.current_value ?? row.original.old_score ?? '-'}
            </Typography>
            <i className="ri-arrow-right-line" style={{ fontSize: 14, color: '#999' }} />
            <Typography variant="body2" fontWeight="bold" color="primary">
              {row.original.proposed_value ?? row.original.new_score ?? '-'}
            </Typography>
          </Box>
        ),
      }),
      columnHelper.accessor('reason', {
        id: 'reason',
        header: 'Motif',
        cell: ({ row }) => (
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {row.original.reason}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'requested_by',
        header: 'Demandé par',
        cell: ({ row }) => (
          <Typography variant="body2">
            {row.original.requester?.name || row.original.requested_by_user?.name || '-'}
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
            size="small"
          />
        ),
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: 'Date demande',
        cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {new Date(row.original.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              color="info"
              onClick={() => handleOpenReview(row.original)}
              title="Voir détails"
            >
              <i className="ri-eye-line" />
            </IconButton>
            {row.original.status === 'Pending' && (
              <>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleOpenReview(row.original)}
                  title="Approuver"
                >
                  <i className="ri-check-line" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleOpenReview(row.original)}
                  title="Rejeter"
                >
                  <i className="ri-close-line" />
                </IconButton>
              </>
            )}
          </Box>
        ),
      }),
    ],
    [handleOpenReview]
  );

  const tableConfig: DataTableConfig<CorrectionRequest> = {
    columns,
    data: requestsData?.data || [],
    loading: isLoading,
    pagination: requestsData
      ? {
          current_page: requestsData.current_page,
          last_page: requestsData.last_page,
          per_page: requestsData.per_page,
          total: requestsData.total,
        }
      : undefined,
    onPageChange: setPage,
    onPageSizeChange: (size) => {
      setRowsPerPage(size);
      setPage(1);
    },
    onSearch: setSearch,
    onRefresh: () => refetch(),
    searchPlaceholder: 'Rechercher par étudiant, module...',
    emptyMessage: 'Aucune demande de correction',
    rowsPerPageOptions: [10, 15, 25, 50],

    mobileCard: {
      renderCard: (request) => (
        <StandardMobileCard
          title={
            request.grade?.student?.full_name ||
            (request.grade?.student
              ? `${request.grade.student.lastname || ''} ${request.grade.student.firstname || ''}`.trim()
              : 'Étudiant inconnu')
          }
          subtitle={request.grade?.evaluation?.module?.name || '-'}
          status={{
            label: getStatusLabel(request.status),
            color: getStatusColor(request.status),
          }}
          fields={[
            {
              icon: 'ri-book-line',
              label: 'Évaluation',
              value: request.grade?.evaluation?.name || '-',
            },
            {
              icon: 'ri-arrow-left-right-line',
              label: 'Note',
              value: `${request.current_value ?? request.old_score ?? '-'} → ${request.proposed_value ?? request.new_score ?? '-'}`,
            },
            {
              icon: 'ri-chat-3-line',
              label: 'Motif',
              value: request.reason.length > 50 ? `${request.reason.substring(0, 50)}...` : request.reason,
            },
            {
              icon: 'ri-user-line',
              label: 'Demandé par',
              value: request.requester?.name || request.requested_by_user?.name || '-',
            },
            {
              icon: 'ri-calendar-line',
              label: 'Date',
              value: new Date(request.created_at).toLocaleDateString('fr-FR'),
            },
          ]}
          actions={[
            {
              icon: 'ri-eye-line',
              color: 'info' as const,
              onClick: () => handleOpenReview(request),
            },
            ...(request.status === 'Pending'
              ? [
                  {
                    icon: 'ri-check-line',
                    color: 'success' as const,
                    onClick: () => handleOpenReview(request),
                  },
                  {
                    icon: 'ri-close-line',
                    color: 'error' as const,
                    onClick: () => handleOpenReview(request),
                  },
                ]
              : []),
          ]}
          item={request}
        />
      ),
    },
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Demandes de Correction
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gérez les demandes de correction de notes soumises par les enseignants.
        </Typography>
      </Box>

      {/* Status Filter */}
      <Box mb={2}>
        <TextField
          select
          label="Statut"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as CorrectionRequestStatus | 'all');
            setPage(1);
          }}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Toutes</MenuItem>
          <MenuItem value="Pending">En attente</MenuItem>
          <MenuItem value="Approved">Approuvées</MenuItem>
          <MenuItem value="Rejected">Rejetées</MenuItem>
        </TextField>
      </Box>

      {/* Data Table */}
      <DataTable {...tableConfig} />

      {/* Review Dialog */}
      <Dialog
        open={selectedRequest !== null}
        onClose={handleCloseReview}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Détails de la demande de correction</Typography>
            <IconButton onClick={handleCloseReview} size="small">
              <i className="ri-close-line" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <CorrectionRequestReview
              request={selectedRequest}
              tenantId={tenantId}
              onActionComplete={handleActionComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
