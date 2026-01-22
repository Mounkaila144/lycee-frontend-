'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Tooltip,
  Grid,
} from '@mui/material';
import { createColumnHelper } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { useTenant } from '@/shared/lib/tenant-context';
import { optionService } from '../services/optionService';
import { programmeService } from '@/modules/StructureAcademique/admin/services/programmeService';
import { OptionFormDialog } from './OptionFormDialog';
import { OptionDeleteDialog } from './OptionDeleteDialog';
import type { Option, OptionStatus } from '../../types/option.types';

// Shared DataTable Components
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable';
import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable';

// Hook to fetch programmes using the StructureAcademique service
const useProgrammes = () => {
  const { tenantId } = useTenant();
  const [programmes, setProgrammes] = useState<Array<{ id: number; code: string; libelle: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        // Use the programmeService from StructureAcademique module
        const response = await programmeService.getProgrammes(tenantId || undefined, {
          per_page: 100, // Get all programmes for the dropdown
        });
        setProgrammes(response.data || []);
      } catch (err) {
        console.error('Error fetching programmes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammes();
  }, [tenantId]);

  return { programmes, loading };
};

const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];

const statusColors: Record<OptionStatus, 'success' | 'warning' | 'default'> = {
  Open: 'success',
  Closed: 'warning',
  Archived: 'default',
};

const statusLabels: Record<OptionStatus, string> = {
  Open: 'Ouvert',
  Closed: 'Fermé',
  Archived: 'Archivé',
};

// Available columns configuration
const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'code', label: 'Code', defaultVisible: true },
  { id: 'name', label: 'Nom', defaultVisible: true },
  { id: 'programme', label: 'Programme', defaultVisible: true },
  { id: 'level', label: 'Niveau', defaultVisible: true },
  { id: 'capacity', label: 'Capacité', defaultVisible: true },
  { id: 'period', label: 'Période de choix', defaultVisible: true },
  { id: 'status', label: 'Statut', defaultVisible: true },
  { id: 'description', label: 'Description', defaultVisible: false },
];

const STORAGE_KEY = 'optionListTableColumns';

// Column Definitions
const columnHelper = createColumnHelper<Option>();

export const OptionList = () => {
  const { tenantId } = useTenant();
  const { programmes, loading: programmesLoading } = useProgrammes();

  // State
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '' as OptionStatus | '',
    level: '',
    programme_id: '' as string | number,
  });

  // Dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

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

  // Save column visibility to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

  // Fetch options
  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page: page + 1,
        per_page: rowsPerPage,
      };

      if (filters.status) params.status = filters.status;
      if (filters.level) params.level = filters.level;
      if (filters.programme_id) params.programme_id = filters.programme_id;
      if (filters.search) params.search = filters.search;

      const response = await optionService.getOptions(params, tenantId || undefined);

      setOptions(response.data || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching options:', err);
      setError('Erreur lors du chargement des options');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, tenantId]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // Handlers
  const handleCreate = () => {
    setSelectedOption(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (option: Option) => {
    setSelectedOption(option);
    setFormDialogOpen(true);
  };

  const handleDelete = (option: Option) => {
    setSelectedOption(option);
    setDeleteDialogOpen(true);
  };

  const handleFormSuccess = () => {
    fetchOptions();
  };

  const handleDeleteSuccess = () => {
    fetchOptions();
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const getCapacityProgress = (option: Option) => {
    const enrolled = option.enrolled_count || 0;
    const capacity = option.capacity || 1;
    return (enrolled / capacity) * 100;
  };

  // Column definitions
  const columns = useMemo<ColumnDef<Option, any>[]>(
    () => [
      columnHelper.accessor('code', {
        id: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <Typography variant="body2" fontWeight={600}>
            {row.original.code}
          </Typography>
        ),
      }),
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Nom',
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2">{row.original.name}</Typography>
            {row.original.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ maxWidth: 200, display: 'block' }}
              >
                {row.original.description}
              </Typography>
            )}
          </Box>
        ),
      }),
      columnHelper.accessor('programme_id', {
        id: 'programme',
        header: 'Programme',
        cell: ({ row }) => (
          <Chip
            label={row.original.program?.code || `#${row.original.programme_id}`}
            size="small"
            variant="outlined"
          />
        ),
      }),
      columnHelper.accessor('level', {
        id: 'level',
        header: 'Niveau',
        cell: ({ row }) => <Typography>{row.original.level}</Typography>,
      }),
      columnHelper.accessor('capacity', {
        id: 'capacity',
        header: 'Capacité',
        cell: ({ row }) => {
          const progress = getCapacityProgress(row.original);
          return (
            <Box sx={{ minWidth: 100 }}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption">
                  {row.original.enrolled_count || 0}/{row.original.capacity}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(progress, 100)}
                color={progress >= 100 ? 'error' : 'primary'}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          );
        },
      }),
      columnHelper.accessor('choice_start_date', {
        id: 'period',
        header: 'Période de choix',
        cell: ({ row }) => (
          <Box>
            <Typography variant="caption" display="block">
              {row.original.choice_start_date
                ? new Date(row.original.choice_start_date).toLocaleDateString('fr-FR')
                : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              au{' '}
              {row.original.choice_end_date
                ? new Date(row.original.choice_end_date).toLocaleDateString('fr-FR')
                : '-'}
            </Typography>
          </Box>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Statut',
        cell: ({ row }) => (
          <Chip
            label={statusLabels[row.original.status]}
            size="small"
            color={statusColors[row.original.status]}
          />
        ),
      }),
      columnHelper.accessor('description', {
        id: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
            {row.original.description || '-'}
          </Typography>
        ),
      }),
      {
        id: 'action',
        header: 'Actions',
        cell: ({ row }: any) => (
          <div className="flex items-center gap-0.5">
            <Tooltip title="Modifier">
              <IconButton size="small" onClick={() => handleEdit(row.original)}>
                <i className="ri-edit-line text-textSecondary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton size="small" onClick={() => handleDelete(row.original)}>
                <i className="ri-delete-bin-line text-textSecondary" />
              </IconButton>
            </Tooltip>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [handleEdit, handleDelete]
  );

  // DataTable configuration
  const tableConfig: DataTableConfig<Option> = {
    columns,
    data: options,
    loading,
    pagination: {
      page,
      pageSize: rowsPerPage,
      total,
    },
    availableColumns: AVAILABLE_COLUMNS,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onPageChange: setPage,
    onPageSizeChange: (size) => {
      setRowsPerPage(size);
      setPage(0);
    },
    onSearch: (search) => handleFilterChange('search', search),
    onRefresh: fetchOptions,
    searchPlaceholder: 'Rechercher une option',
    emptyMessage: 'Aucune option trouvée',
    rowsPerPageOptions: [5, 10, 25, 50],

    // Actions
    actions: [
      {
        label: 'Nouvelle option',
        icon: 'ri-add-line',
        color: 'primary',
        onClick: handleCreate,
        disabled: programmesLoading || loading,
      },
    ],

    // Mobile card configuration
    mobileCard: {
      renderCard: (option) => {
        const progress = getCapacityProgress(option);
        return (
          <StandardMobileCard
            title={option.name}
            subtitle={option.code}
            status={{
              label: statusLabels[option.status],
              color: statusColors[option.status],
            }}
            fields={[
              {
                icon: 'ri-book-line',
                label: 'Programme',
                value: option.program?.code || `#${option.programme_id}`,
              },
              {
                icon: 'ri-bar-chart-line',
                label: 'Niveau',
                value: option.level,
              },
              {
                icon: 'ri-group-line',
                label: 'Capacité',
                value: `${option.enrolled_count || 0}/${option.capacity} (${Math.round(progress)}%)`,
              },
              {
                icon: 'ri-calendar-line',
                label: 'Période',
                value: option.choice_start_date && option.choice_end_date
                  ? `${new Date(option.choice_start_date).toLocaleDateString('fr-FR')} - ${new Date(option.choice_end_date).toLocaleDateString('fr-FR')}`
                  : '-',
              },
              ...(option.description
                ? [
                    {
                      icon: 'ri-file-text-line',
                      label: 'Description',
                      value: option.description,
                    },
                  ]
                : []),
            ]}
            actions={[
              {
                icon: 'ri-edit-line',
                color: 'info' as const,
                onClick: () => handleEdit(option),
              },
              {
                icon: 'ri-delete-bin-line',
                color: 'error' as const,
                onClick: () => handleDelete(option),
              },
            ]}
            item={option}
          />
        );
      },
    },
  };

  return (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select
                  value={filters.programme_id}
                  label="Programme"
                  onChange={(e) => handleFilterChange('programme_id', e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {programmes.map((prog) => (
                    <MenuItem key={prog.id} value={prog.id}>
                      {prog.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Niveau</InputLabel>
                <Select
                  value={filters.level}
                  label="Niveau"
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.status}
                  label="Statut"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Open">Ouvert</MenuItem>
                  <MenuItem value="Closed">Fermé</MenuItem>
                  <MenuItem value="Archived">Archivé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setFilters({ search: '', status: '', level: '', programme_id: '' })}
              >
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* DataTable */}
      <DataTable {...tableConfig} />

      {/* Dialogs */}
      <OptionFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        option={selectedOption}
        onSuccess={handleFormSuccess}
        programmes={programmes}
      />

      <OptionDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        option={selectedOption}
        onSuccess={handleDeleteSuccess}
      />
    </Box>
  );
};

export default OptionList;
