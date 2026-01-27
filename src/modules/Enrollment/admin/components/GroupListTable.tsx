'use client';

import { useState, useMemo } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';

import { createColumnHelper } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable, StandardMobileCard } from '@/components/shared/DataTable';
import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable';

import { useGroupsContext } from './GroupList';

import type { Group, GroupType, GroupStatus } from '../../types/group.types';

type GroupWithAction = Group & {
  action?: string;
};

// Column helper
const columnHelper = createColumnHelper<GroupWithAction>();

// Available columns configuration
const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'code', label: 'Code', defaultVisible: true },
  { id: 'name', label: 'Nom', defaultVisible: true },
  { id: 'type', label: 'Type', defaultVisible: true },
  { id: 'module', label: 'Module', defaultVisible: true },
  { id: 'level', label: 'Niveau', defaultVisible: true },
  { id: 'capacity', label: 'Capacité', defaultVisible: true },
  { id: 'teacher', label: 'Enseignant', defaultVisible: true },
  { id: 'status', label: 'Statut', defaultVisible: true },
];

/**
 * GroupListTable Component
 * Displays groups in a data table with filtering and actions
 */
export const GroupListTable = () => {
  const {
    groups,
    loading,
    pagination,
    params,
    setPage,
    setPageSize,
    setSearch,
    updateParams,
    onEdit,
    onDelete,
    onViewAssignments,
    onViewDashboard,
    onExport,
    onCreate,
    refresh,
  } = useGroupsContext();

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Get group type color
  const getTypeColor = (type: GroupType): 'primary' | 'secondary' | 'success' => {
    switch (type) {
      case 'CM':
        return 'primary';
      case 'TD':
        return 'secondary';
      case 'TP':
        return 'success';
      default:
        return 'primary';
    }
  };

  // Get status color
  const getStatusColor = (status: GroupStatus): 'success' | 'default' => {
    return status === 'Active' ? 'success' : 'default';
  };

  // Get capacity color
  const getCapacityColor = (group: Group): 'error' | 'warning' | 'success' => {
    const count = group.current_count || 0;

    if (count < group.capacity_min) return 'warning';
    if (count > group.capacity_max) return 'error';

    return 'success';
  };

  // Get fill rate
  const getFillRate = (group: Group): number => {
    const count = group.current_count || 0;

    return Math.min((count / group.capacity_max) * 100, 100);
  };

  // Columns definition
  const columns = useMemo<ColumnDef<GroupWithAction, any>[]>(
    () => [
      columnHelper.accessor('code', {
        id: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <Typography variant="body2" fontWeight={500}>
            {row.original.code}
          </Typography>
        ),
      }),
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Nom',
        cell: ({ row }) => <Typography>{row.original.name}</Typography>,
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Chip label={row.original.type} color={getTypeColor(row.original.type)} size="small" />
        ),
      }),
      columnHelper.accessor('module', {
        id: 'module',
        header: 'Module',
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2" noWrap>
              {row.original.module?.name || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.module?.code}
            </Typography>
          </Box>
        ),
      }),
      columnHelper.accessor('level', {
        id: 'level',
        header: 'Niveau',
        cell: ({ row }) => (
          <Chip label={row.original.level} variant="outlined" size="small" />
        ),
      }),
      columnHelper.display({
        id: 'capacity',
        header: 'Capacité',
        cell: ({ row }) => {
          const count = row.original.current_count || 0;
          const fillRate = getFillRate(row.original);
          const capacityColor = getCapacityColor(row.original);

          return (
            <Box sx={{ width: 150 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">
                  {count} / {row.original.capacity_max}
                </Typography>
                <Typography variant="caption" color={`${capacityColor}.main`}>
                  {fillRate.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={fillRate} color={capacityColor} sx={{ height: 6, borderRadius: 1 }} />
              {count < row.original.capacity_min && (
                <Typography variant="caption" color="warning.main">
                  Sous capacité min ({row.original.capacity_min})
                </Typography>
              )}
            </Box>
          );
        },
      }),
      columnHelper.accessor('teacher', {
        id: 'teacher',
        header: 'Enseignant',
        cell: ({ row }) => (
          <Typography>
            {row.original.teacher
              ? `${row.original.teacher.firstname} ${row.original.teacher.lastname}`
              : '-'}
          </Typography>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={row.original.status === 'Active' ? 'Actif' : 'Inactif'}
            color={getStatusColor(row.original.status)}
            size="small"
            variant="outlined"
          />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Gérer les affectations">
              <IconButton size="small" color="primary" onClick={() => onViewAssignments(row.original)}>
                <i className="ri-group-line" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Dashboard">
              <IconButton size="small" color="secondary" onClick={() => onViewDashboard(row.original)}>
                <i className="ri-dashboard-line" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exporter la liste">
              <IconButton size="small" color="info" onClick={() => onExport(row.original)}>
                <i className="ri-download-2-line" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Modifier">
              <IconButton size="small" onClick={() => onEdit(row.original)}>
                <i className="ri-edit-line" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton size="small" color="error" onClick={() => onDelete(row.original)}>
                <i className="ri-delete-bin-line" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        enableSorting: false,
      }),
    ],
    [onEdit, onDelete, onViewAssignments, onViewDashboard, onExport]
  );

  // Custom filter content
  const filterContent = (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField
        select
        size="small"
        label="Type"
        value={params.type || ''}
        onChange={e => updateParams({ type: (e.target.value as GroupType) || undefined, page: 1 })}
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">Tous</MenuItem>
        <MenuItem value="CM">CM</MenuItem>
        <MenuItem value="TD">TD</MenuItem>
        <MenuItem value="TP">TP</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label="Statut"
        value={params.status || ''}
        onChange={e => updateParams({ status: (e.target.value as GroupStatus) || undefined, page: 1 })}
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">Tous</MenuItem>
        <MenuItem value="Active">Actif</MenuItem>
        <MenuItem value="Inactive">Inactif</MenuItem>
      </TextField>
    </Box>
  );

  // DataTable configuration
  const tableConfig: DataTableConfig<Group> = {
    columns,
    data: groups,
    loading,
    pagination,
    availableColumns: AVAILABLE_COLUMNS,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onSearch: setSearch,
    onRefresh: refresh,
    searchPlaceholder: 'Rechercher...',
    emptyMessage: 'Aucun groupe disponible',
    rowsPerPageOptions: [10, 25, 50],
    headerContent: filterContent,

    // Actions
    actions: [
      {
        label: 'Nouveau groupe',
        icon: 'ri-add-line',
        color: 'primary',
        onClick: onCreate,
        disabled: loading,
      },
    ],

    // Mobile card configuration
    mobileCard: {
      renderCard: group => (
        <StandardMobileCard
          title={group.name}
          subtitle={group.code}
          status={{
            label: group.status === 'Active' ? 'Actif' : 'Inactif',
            color: getStatusColor(group.status),
          }}
          fields={[
            {
              icon: 'ri-bookmark-line',
              label: 'Type',
              value: group.type,
            },
            {
              icon: 'ri-book-line',
              label: 'Module',
              value: group.module?.name || '-',
            },
            {
              icon: 'ri-bar-chart-line',
              label: 'Niveau',
              value: group.level,
            },
            {
              icon: 'ri-group-line',
              label: 'Capacité',
              value: `${group.current_count || 0} / ${group.capacity_max}`,
            },
            {
              icon: 'ri-user-line',
              label: 'Enseignant',
              value: group.teacher
                ? `${group.teacher.firstname} ${group.teacher.lastname}`
                : '-',
            },
          ]}
          actions={[
            {
              icon: 'ri-group-line',
              color: 'primary',
              onClick: () => onViewAssignments(group),
            },
            {
              icon: 'ri-dashboard-line',
              color: 'secondary',
              onClick: () => onViewDashboard(group),
            },
            {
              icon: 'ri-download-2-line',
              color: 'info',
              onClick: () => onExport(group),
            },
            {
              icon: 'ri-edit-line',
              color: 'default',
              onClick: () => onEdit(group),
            },
            {
              icon: 'ri-delete-bin-line',
              color: 'error',
              onClick: () => onDelete(group),
            },
          ]}
          item={group}
        />
      ),
    },
  };

  return <DataTable {...tableConfig} />;
};

export default GroupListTable;
