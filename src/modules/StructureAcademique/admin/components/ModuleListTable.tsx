'use client';

// React Imports
import { useState, useMemo, useCallback } from 'react';

// MUI Imports
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';

// Translation Imports
import { useTranslation } from '@/shared/i18n';

// Type Imports
import type { ThemeColor } from '@core/types';
import type { Module, ModuleType } from '../../types/module.types';
import {
  getModuleTypeLabel,
  getModuleTypeBadgeColor,
  getModuleLevelLabel,
  getModuleSemesterLabel,
} from '../../types/module.types';

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar';
import ModuleFormDialog from './ModuleFormDialog';
import ModuleDeleteDialog from './ModuleDeleteDialog';
import ModulePrerequisitesDialog from './ModulePrerequisitesDialog';
import ModuleDependencyGraphDialog from './ModuleDependencyGraphDialog';
import ModuleTeachersDialog from './ModuleTeachersDialog';
import EvaluationConfigDialog from './EvaluationConfigDialog';

// Shared DataTable Components
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable';
import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable';

// Context Imports
import { useModulesContext } from './ModuleList';

type ModuleWithAction = Module & {
  action?: string;
};

// Available columns configuration
const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'code', label: 'Code', defaultVisible: true },
  { id: 'name', label: 'Nom', defaultVisible: true },
  { id: 'level', label: 'Niveau', defaultVisible: true },
  { id: 'semester', label: 'Semestre', defaultVisible: true },
  { id: 'credits_ects', label: 'Crédits ECTS', defaultVisible: true },
  { id: 'coefficient', label: 'Coefficient', defaultVisible: true },
  { id: 'type', label: 'Type', defaultVisible: true },
  { id: 'total_hours', label: 'Volume Horaire', defaultVisible: true },
  { id: 'is_eliminatory', label: 'Éliminatoire', defaultVisible: false },
  { id: 'programs_count', label: 'Filières', defaultVisible: false },
  { id: 'created_at', label: 'Créé le', defaultVisible: false },
];

const STORAGE_KEY = 'moduleListTableColumns';

// Column Definitions
const columnHelper = createColumnHelper<ModuleWithAction>();

const ModuleListTable = () => {
  // Translation
  const { t } = useTranslation('StructureAcademique');

  // Context
  const {
    modules,
    loading,
    pagination,
    setPage,
    setPageSize,
    setSearch,
    refresh,
    createModule,
    updateModule,
    deleteModule,
  } = useModulesContext();

  // States
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prerequisitesDialogOpen, setPrerequisitesDialogOpen] = useState(false);
  const [dependencyGraphDialogOpen, setDependencyGraphDialogOpen] = useState(false);
  const [teachersDialogOpen, setTeachersDialogOpen] = useState(false);
  const [evaluationConfigDialogOpen, setEvaluationConfigDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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

    AVAILABLE_COLUMNS.forEach((col) => {
      defaultVisibility[col.id] = col.defaultVisible !== false;
    });

    return defaultVisibility;
  });

  // Save column visibility to localStorage
  useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

  // Handle form dialog
  const handleOpenAddDialog = useCallback(() => {
    setSelectedModule(null);
    setIsEditMode(false);
    setFormDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((module: Module) => {
    setSelectedModule(module);
    setIsEditMode(true);
    setFormDialogOpen(true);
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setFormDialogOpen(false);
    setSelectedModule(null);
    setIsEditMode(false);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: any) => {
      try {
        if (isEditMode && selectedModule) {
          await updateModule(selectedModule.id, data);
        } else {
          await createModule(data);
        }
        handleCloseFormDialog();
      } catch (error) {
        console.error('Error submitting form:', error);
        throw error;
      }
    },
    [isEditMode, selectedModule, createModule, updateModule, handleCloseFormDialog]
  );

  // Handle delete dialog
  const handleOpenDeleteDialog = useCallback((module: Module) => {
    setSelectedModule(module);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedModule(null);
  }, []);

  const handleDeleteSuccess = useCallback(async () => {
    if (selectedModule) {
      try {
        await deleteModule(selectedModule.id);
        handleCloseDeleteDialog();
      } catch (error) {
        console.error('Error deleting module:', error);
      }
    }
  }, [selectedModule, deleteModule, handleCloseDeleteDialog]);

  // Handle prerequisites dialog
  const handleOpenPrerequisitesDialog = useCallback((module: Module) => {
    setSelectedModule(module);
    setPrerequisitesDialogOpen(true);
  }, []);

  const handleClosePrerequisitesDialog = useCallback(() => {
    setPrerequisitesDialogOpen(false);
    setSelectedModule(null);
  }, []);

  // Handle dependency graph dialog
  const handleOpenDependencyGraphDialog = useCallback((module: Module) => {
    setSelectedModule(module);
    setDependencyGraphDialogOpen(true);
  }, []);

  const handleCloseDependencyGraphDialog = useCallback(() => {
    setDependencyGraphDialogOpen(false);
    setSelectedModule(null);
  }, []);

  // Handle teachers dialog
  const handleOpenTeachersDialog = useCallback((module: Module) => {
    setSelectedModule(module);
    setTeachersDialogOpen(true);
  }, []);

  const handleCloseTeachersDialog = useCallback(() => {
    setTeachersDialogOpen(false);
    setSelectedModule(null);
  }, []);

  // Handle evaluation config dialog
  const handleOpenEvaluationConfigDialog = useCallback((module: Module) => {
    setSelectedModule(module);
    setEvaluationConfigDialogOpen(true);
  }, []);

  const handleCloseEvaluationConfigDialog = useCallback(() => {
    setEvaluationConfigDialogOpen(false);
    setSelectedModule(null);
  }, []);

  // Column definitions
  const columns = useMemo<ColumnDef<ModuleWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        ),
      },
      columnHelper.accessor('id', {
        id: 'id',
        header: '#',
        cell: ({ row }) => <Typography>{row.original.id || '-'}</Typography>,
      }),
      columnHelper.accessor('code', {
        id: 'code',
        header: t('Code'),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <CustomAvatar skin="light" size={34} color="primary">
              {row.original.code.substring(0, 2).toUpperCase()}
            </CustomAvatar>
            <Typography color="text.primary" className="font-medium">
              {row.original.code}
            </Typography>
          </div>
        ),
      }),
      columnHelper.accessor('name', {
        id: 'name',
        header: t('Nom'),
        cell: ({ row }) => <Typography>{row.original.name || '-'}</Typography>,
      }),
      columnHelper.accessor('level', {
        id: 'level',
        header: t('Niveau'),
        cell: ({ row }) => (
          <Chip
            variant="tonal"
            label={row.original.level}
            size="small"
            color={row.original.level.startsWith('L') ? 'primary' : 'secondary'}
          />
        ),
      }),
      columnHelper.accessor('semester', {
        id: 'semester',
        header: t('Semestre'),
        cell: ({ row }) => <Typography>{row.original.semester}</Typography>,
      }),
      columnHelper.accessor('credits_ects', {
        id: 'credits_ects',
        header: t('Crédits ECTS'),
        cell: ({ row }) => (
          <Chip variant="tonal" label={`${row.original.credits_ects} ECTS`} size="small" color="success" />
        ),
      }),
      columnHelper.accessor('coefficient', {
        id: 'coefficient',
        header: t('Coefficient'),
        cell: ({ row }) => <Typography>{row.original.coefficient}</Typography>,
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: t('Type'),
        cell: ({ row }) => (
          <Chip
            variant="tonal"
            label={row.original.type}
            size="small"
            color={getModuleTypeBadgeColor(row.original.type)}
          />
        ),
      }),
      columnHelper.accessor('total_hours', {
        id: 'total_hours',
        header: t('Volume Horaire'),
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {row.original.total_hours}h
            </Typography>
            <Typography variant="caption" color="text.secondary">
              CM:{row.original.hours_cm || 0} TD:{row.original.hours_td || 0} TP:{row.original.hours_tp || 0}
            </Typography>
          </Box>
        ),
      }),
      columnHelper.accessor('is_eliminatory', {
        id: 'is_eliminatory',
        header: t('Éliminatoire'),
        cell: ({ row }) =>
          row.original.is_eliminatory ? (
            <Chip variant="tonal" label="Éliminatoire" size="small" color="error" />
          ) : (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          ),
      }),
      columnHelper.accessor('programs_count', {
        id: 'programs_count',
        header: t('Filières'),
        cell: ({ row }) => {
          const programmes = row.original.programmes || row.original.programs || [];
          const count = programmes.length;

          if (count === 0) {
            return (
              <Typography variant="body2" color="text.secondary">
                Aucune
              </Typography>
            );
          }
          
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {programmes.slice(0, 2).map((prog: any) => (
                <Chip
                  key={prog.id}
                  variant="tonal"
                  label={prog.code || prog.libelle}
                  size="small"
                  color="info"
                  title={prog.libelle}
                />
              ))}
              {count > 2 && (
                <Chip
                  variant="tonal"
                  label={`+${count - 2}`}
                  size="small"
                  color="default"
                  title={programmes.slice(2).map((p: any) => p.libelle).join(', ')}
                />
              )}
            </Box>
          );
        },
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: t('Créé le'),
        cell: ({ row }) => (
          <Typography>
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : '-'}
          </Typography>
        ),
      }),
      columnHelper.accessor('action', {
        header: t('Actions'),
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            {/* Manage Prerequisites button */}
            <IconButton
              size="small"
              onClick={() => handleOpenPrerequisitesDialog(row.original)}
              title="Gérer les prérequis"
            >
              <i className="ri-links-line text-textSecondary" />
            </IconButton>

            {/* View Dependency Graph button */}
            <IconButton
              size="small"
              onClick={() => handleOpenDependencyGraphDialog(row.original)}
              title="Graphe de dépendances"
            >
              <i className="ri-node-tree text-textSecondary" />
            </IconButton>

            {/* Manage Teachers button */}
            <IconButton
              size="small"
              onClick={() => handleOpenTeachersDialog(row.original)}
              title="Affecter des enseignants"
            >
              <i className="ri-user-line text-textSecondary" />
            </IconButton>

            {/* Evaluation Configuration button */}
            <IconButton
              size="small"
              onClick={() => handleOpenEvaluationConfigDialog(row.original)}
              title="Configuration des évaluations"
            >
              <i className="ri-file-list-3-line text-textSecondary" />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => handleOpenDeleteDialog(row.original)}
              disabled={!row.original.can_be_deleted}
            >
              <i className="ri-delete-bin-line text-textSecondary" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleOpenEditDialog(row.original)}
              disabled={!row.original.can_be_modified}
            >
              <i className="ri-edit-line text-textSecondary" />
            </IconButton>
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [t, handleOpenDeleteDialog, handleOpenEditDialog, handleOpenPrerequisitesDialog, handleOpenDependencyGraphDialog, handleOpenTeachersDialog, handleOpenEvaluationConfigDialog]
  );

  // DataTable configuration
  const tableConfig: DataTableConfig<Module> = {
    columns,
    data: modules as Module[],
    loading,
    pagination: pagination || undefined,
    availableColumns: AVAILABLE_COLUMNS,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onSearch: setSearch,
    onRefresh: refresh,
    searchPlaceholder: t('Rechercher un module'),
    emptyMessage: t('Aucun module disponible'),
    rowsPerPageOptions: [10, 25, 50, 100],

    // Actions
    actions: [
      {
        label: t('Ajouter'),
        icon: 'ri-add-line',
        color: 'primary',
        onClick: handleOpenAddDialog,
        disabled: loading,
      },
    ],

    // Mobile card configuration
    mobileCard: {
      renderCard: (module) => {
        return (
          <StandardMobileCard
            avatar={
              <CustomAvatar skin="light" size={50} color="primary">
                {module.code.substring(0, 2).toUpperCase()}
              </CustomAvatar>
            }
            title={module.name}
            subtitle={module.code}
            status={{
              label: module.type,
              color: getModuleTypeBadgeColor(module.type),
            }}
            fields={[
              {
                icon: 'ri-stack-line',
                label: t('Niveau'),
                value: module.level,
              },
              {
                icon: 'ri-calendar-line',
                label: t('Semestre'),
                value: module.semester,
              },
              {
                icon: 'ri-medal-line',
                label: t('Crédits ECTS'),
                value: `${module.credits_ects} ECTS`,
              },
              {
                icon: 'ri-time-line',
                label: t('Volume Horaire'),
                value: `${module.total_hours}h`,
              },
              {
                icon: 'ri-calculator-line',
                label: t('Coefficient'),
                value: module.coefficient.toString(),
              },
              {
                icon: 'ri-book-line',
                label: t('Filières'),
                value: (() => {
                  const programmes = module.programmes || module.programs || [];
                  if (programmes.length === 0) return 'Aucune';
                  if (programmes.length === 1) return programmes[0].libelle;
                  return `${programmes.length} filières`;
                })(),
              },
              module.is_eliminatory
                ? {
                    icon: 'ri-alert-line',
                    label: t('Éliminatoire'),
                    value: 'Oui',
                  }
                : { icon: '', value: '', hidden: true },
            ]}
            actions={[
              {
                icon: 'ri-links-line',
                color: 'default',
                onClick: () => handleOpenPrerequisitesDialog(module),
              },
              {
                icon: 'ri-node-tree',
                color: 'default',
                onClick: () => handleOpenDependencyGraphDialog(module),
              },
              {
                icon: 'ri-user-line',
                color: 'default',
                onClick: () => handleOpenTeachersDialog(module),
              },
              {
                icon: 'ri-delete-bin-line',
                color: 'error',
                onClick: () => {
                  if (module.can_be_deleted) {
                    handleOpenDeleteDialog(module);
                  }
                },
              },
              {
                icon: 'ri-edit-line',
                color: 'primary',
                onClick: () => {
                  if (module.can_be_modified) {
                    handleOpenEditDialog(module);
                  }
                },
              },
            ]}
            item={module}
          />
        );
      },
    },
  };

  return (
    <>
      <DataTable {...tableConfig} />

      {/* Form Dialog (Add/Edit) */}
      <ModuleFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSubmit={handleFormSubmit}
        module={selectedModule}
        isEditMode={isEditMode}
      />

      {/* Delete Dialog */}
      <ModuleDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onSuccess={handleDeleteSuccess}
        module={selectedModule}
      />

      {/* Prerequisites Dialog */}
      <ModulePrerequisitesDialog
        open={prerequisitesDialogOpen}
        onClose={handleClosePrerequisitesDialog}
        module={selectedModule}
      />

      {/* Dependency Graph Dialog */}
      <ModuleDependencyGraphDialog
        open={dependencyGraphDialogOpen}
        onClose={handleCloseDependencyGraphDialog}
        module={selectedModule}
      />

      {/* Teachers Dialog */}
      <ModuleTeachersDialog
        open={teachersDialogOpen}
        onClose={handleCloseTeachersDialog}
        module={selectedModule}
      />

      {/* Evaluation Configuration Dialog */}
      {selectedModule && (
        <EvaluationConfigDialog
          open={evaluationConfigDialogOpen}
          onClose={handleCloseEvaluationConfigDialog}
          moduleId={selectedModule.id}
          moduleName={selectedModule.name}
          semesterId={1}
          semesterName="Semestre 1"
        />
      )}
    </>
  );
};

export default ModuleListTable;
