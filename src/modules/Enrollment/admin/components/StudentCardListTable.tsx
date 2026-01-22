'use client';

import { useState, useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

import { createColumnHelper } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';

import CustomAvatar from '@core/components/mui/Avatar';
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable';
import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable';

import type { StudentCard, CardStatus, CardPrintStatus } from '../../types/studentCard.types';
import type { PaginationMeta } from '../hooks/useStudentCards';

interface StudentCardListTableProps {
  cards: StudentCard[];
  loading: boolean;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: CardStatus | '') => void;
  onPrintStatusFilterChange: (printStatus: CardPrintStatus | '') => void;
  onViewCard: (card: StudentCard) => void;
  onDownloadCard: (card: StudentCard) => void;
  onUpdateStatus: (card: StudentCard) => void;
  onUpdatePrintStatus: (card: StudentCard) => void;
  onGenerateDuplicate: (card: StudentCard) => void;
  onDeleteCard: (card: StudentCard) => void;
  onBatchDownload: (cardIds: number[]) => void;
  onRefresh?: () => void;
  translations: Record<string, any>;
}

type StudentCardWithAction = StudentCard & {
  action?: string;
};

// Column helper
const columnHelper = createColumnHelper<StudentCardWithAction>();

// Available columns configuration
const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'student', label: 'Étudiant', defaultVisible: true },
  { id: 'card_number', label: 'N° Carte', defaultVisible: true },
  { id: 'academic_year', label: 'Année', defaultVisible: true },
  { id: 'program', label: 'Formation', defaultVisible: true },
  { id: 'status', label: 'Statut', defaultVisible: true },
  { id: 'print_status', label: 'Impression', defaultVisible: true },
  { id: 'valid_until', label: 'Valide jusqu\'à', defaultVisible: true },
];

const StudentCardListTable = ({
  cards,
  loading,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onStatusFilterChange,
  onPrintStatusFilterChange,
  onViewCard,
  onDownloadCard,
  onUpdateStatus,
  onUpdatePrintStatus,
  onGenerateDuplicate,
  onDeleteCard,
  onBatchDownload,
  onRefresh,
  translations,
}: StudentCardListTableProps) => {
  const t = translations;
  const [statusFilter, setStatusFilter] = useState<CardStatus | ''>('');
  const [printStatusFilter, setPrintStatusFilter] = useState<CardPrintStatus | ''>('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  const handleStatusFilterChange = useCallback(
    (value: CardStatus | '') => {
      setStatusFilter(value);
      onStatusFilterChange(value);
    },
    [onStatusFilterChange]
  );

  const handlePrintStatusFilterChange = useCallback(
    (value: CardPrintStatus | '') => {
      setPrintStatusFilter(value);
      onPrintStatusFilterChange(value);
    },
    [onPrintStatusFilterChange]
  );

  const handleBatchDownload = useCallback(() => {
    onBatchDownload(selectedRows);
  }, [selectedRows, onBatchDownload]);

  const getStatusColor = (status: CardStatus): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Expired':
        return 'warning';
      case 'Suspended':
        return 'error';
      case 'Revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPrintStatusColor = (status: CardPrintStatus): 'info' | 'success' | 'default' => {
    switch (status) {
      case 'Pending':
        return 'info';
      case 'Printed':
        return 'success';
      case 'Delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  // Column definitions
  const columns = useMemo<ColumnDef<StudentCardWithAction, any>[]>(
    () => [
      columnHelper.accessor('student', {
        id: 'student',
        header: t.studentCards?.student || 'Étudiant',
        cell: ({ row }) => {
          const student = row.original.student;

          if (!student) return <Typography>-</Typography>;

          return (
            <Stack direction="row" spacing={2} alignItems="center">
              <CustomAvatar src={student.photo} skin="light" size={34} color="primary">
                {student.firstname?.[0]}
                {student.lastname?.[0]}
              </CustomAvatar>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {student.firstname} {student.lastname}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {student.matricule}
                </Typography>
              </Box>
            </Stack>
          );
        },
      }),
      columnHelper.accessor('card_number', {
        id: 'card_number',
        header: t.studentCards?.cardNumber || 'N° Carte',
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontFamily="monospace">
              {row.original.card_number}
            </Typography>
            {row.original.is_duplicate && (
              <Chip label="DUP" size="small" color="warning" variant="outlined" />
            )}
          </Stack>
        ),
      }),
      columnHelper.accessor('academic_year', {
        id: 'academic_year',
        header: t.studentCards?.academicYear || 'Année',
        cell: ({ row }) => (
          <Typography>{row.original.academic_year?.name || '-'}</Typography>
        ),
      }),
      columnHelper.accessor('program', {
        id: 'program',
        header: t.studentCards?.program || 'Formation',
        cell: ({ row }) => (
          <Typography>{row.original.program?.code || '-'}</Typography>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: t.studentCards?.status || 'Statut',
        cell: ({ row }) => (
          <Chip
            label={t.studentCards?.statuses?.[row.original.status] || row.original.status}
            color={getStatusColor(row.original.status)}
            size="small"
          />
        ),
      }),
      columnHelper.accessor('print_status', {
        id: 'print_status',
        header: t.studentCards?.printStatus || 'Impression',
        cell: ({ row }) => (
          <Chip
            label={t.studentCards?.printStatuses?.[row.original.print_status] || row.original.print_status}
            color={getPrintStatusColor(row.original.print_status)}
            size="small"
            variant="outlined"
          />
        ),
      }),
      columnHelper.accessor('valid_until', {
        id: 'valid_until',
        header: t.studentCards?.validUntil || 'Valide jusqu\'à',
        cell: ({ row }) => (
          <Typography>
            {row.original.valid_until
              ? new Date(row.original.valid_until).toLocaleDateString('fr-FR')
              : '-'}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: t.common?.actions || 'Actions',
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t.studentCards?.viewCard || 'Voir la carte'}>
              <IconButton size="small" onClick={() => onViewCard(row.original)}>
                <i className="ri-eye-line" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t.studentCards?.downloadPdf || 'Télécharger PDF'}>
              <IconButton size="small" onClick={() => onDownloadCard(row.original)}>
                <i className="ri-download-2-line" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t.studentCards?.updateStatus || 'Modifier statut'}>
              <IconButton size="small" onClick={() => onUpdateStatus(row.original)}>
                <i className="ri-edit-line" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t.studentCards?.updatePrintStatus || 'Statut impression'}>
              <IconButton size="small" onClick={() => onUpdatePrintStatus(row.original)}>
                <i className="ri-printer-line" />
              </IconButton>
            </Tooltip>
            {row.original.status === 'Active' && (
              <Tooltip title={t.studentCards?.generateDuplicate || 'Générer duplicata'}>
                <IconButton size="small" onClick={() => onGenerateDuplicate(row.original)}>
                  <i className="ri-file-copy-line" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t.studentCards?.deleteCard || 'Supprimer la carte'}>
              <IconButton size="small" color="error" onClick={() => onDeleteCard(row.original)}>
                <i className="ri-delete-bin-line" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
        enableSorting: false,
      }),
    ],
    [t, onViewCard, onDownloadCard, onUpdateStatus, onUpdatePrintStatus, onGenerateDuplicate, onDeleteCard]
  );

  // Custom header content for filters
  const filterContent = (
    <Stack direction="row" spacing={2} sx={{ ml: 2 }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>{t.studentCards?.status || 'Statut'}</InputLabel>
        <Select
          value={statusFilter}
          label={t.studentCards?.status || 'Statut'}
          onChange={e => handleStatusFilterChange(e.target.value as CardStatus | '')}
        >
          <MenuItem value="">{t.common?.all || 'Tous'}</MenuItem>
          <MenuItem value="Active">{t.studentCards?.statuses?.Active || 'Active'}</MenuItem>
          <MenuItem value="Expired">{t.studentCards?.statuses?.Expired || 'Expirée'}</MenuItem>
          <MenuItem value="Suspended">{t.studentCards?.statuses?.Suspended || 'Suspendue'}</MenuItem>
          <MenuItem value="Revoked">{t.studentCards?.statuses?.Revoked || 'Révoquée'}</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>{t.studentCards?.printStatus || 'Impression'}</InputLabel>
        <Select
          value={printStatusFilter}
          label={t.studentCards?.printStatus || 'Impression'}
          onChange={e => handlePrintStatusFilterChange(e.target.value as CardPrintStatus | '')}
        >
          <MenuItem value="">{t.common?.all || 'Tous'}</MenuItem>
          <MenuItem value="Pending">{t.studentCards?.printStatuses?.Pending || 'En attente'}</MenuItem>
          <MenuItem value="Printed">{t.studentCards?.printStatuses?.Printed || 'Imprimée'}</MenuItem>
          <MenuItem value="Delivered">{t.studentCards?.printStatuses?.Delivered || 'Livrée'}</MenuItem>
        </Select>
      </FormControl>
      {selectedRows.length > 0 && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<i className="ri-printer-line" />}
          onClick={handleBatchDownload}
        >
          {t.studentCards?.batchPrint || 'Imprimer'} ({selectedRows.length})
        </Button>
      )}
    </Stack>
  );

  // DataTable configuration
  const tableConfig: DataTableConfig<StudentCard> = {
    columns,
    data: cards,
    loading,
    pagination,
    availableColumns: AVAILABLE_COLUMNS,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onPageChange,
    onPageSizeChange,
    onSearch: onSearchChange,
    onRefresh,
    searchPlaceholder: t.common?.search || 'Rechercher...',
    emptyMessage: t.common?.noData || 'Aucune donnée',
    rowsPerPageOptions: [10, 25, 50],
    headerContent: filterContent,

    // Mobile card configuration
    mobileCard: {
      renderCard: card => {
        const student = card.student;

        return (
          <StandardMobileCard
            avatar={
              <CustomAvatar src={student?.photo} skin="light" size={50} color="primary">
                {student?.firstname?.[0]}
                {student?.lastname?.[0]}
              </CustomAvatar>
            }
            title={student ? `${student.firstname} ${student.lastname}` : '-'}
            subtitle={card.card_number}
            status={{
              label: t.studentCards?.statuses?.[card.status] || card.status,
              color: getStatusColor(card.status),
            }}
            fields={[
              {
                icon: 'ri-calendar-line',
                label: t.studentCards?.academicYear || 'Année',
                value: card.academic_year?.name || '-',
              },
              {
                icon: 'ri-book-line',
                label: t.studentCards?.program || 'Formation',
                value: card.program?.code || '-',
              },
              {
                icon: 'ri-printer-line',
                label: t.studentCards?.printStatus || 'Impression',
                value: t.studentCards?.printStatuses?.[card.print_status] || card.print_status,
              },
              {
                icon: 'ri-time-line',
                label: t.studentCards?.validUntil || 'Valide jusqu\'à',
                value: card.valid_until
                  ? new Date(card.valid_until).toLocaleDateString('fr-FR')
                  : '-',
              },
            ]}
            actions={[
              {
                icon: 'ri-eye-line',
                color: 'default',
                onClick: () => onViewCard(card),
              },
              {
                icon: 'ri-download-2-line',
                color: 'info',
                onClick: () => onDownloadCard(card),
              },
              {
                icon: 'ri-edit-line',
                color: 'warning',
                onClick: () => onUpdateStatus(card),
              },
              {
                icon: 'ri-printer-line',
                color: 'primary',
                onClick: () => onUpdatePrintStatus(card),
              },
              {
                icon: 'ri-delete-bin-line',
                color: 'error',
                onClick: () => onDeleteCard(card),
              },
            ]}
            item={card}
          />
        );
      },
    },
  };

  return <DataTable {...tableConfig} />;
};

export default StudentCardListTable;
