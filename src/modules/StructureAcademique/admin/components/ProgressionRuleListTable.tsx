'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Typography,
  Chip,
  IconButton,
  Box,
  Alert,
} from '@mui/material';
import { createColumnHelper } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { ProgressionRule } from '../../types/progression.types';
import { getTransitionLabel } from '../../types/progression.types';
import { DataTable, StandardMobileCard } from '@/components/shared/DataTable';
import type { DataTableConfig, ColumnConfig } from '@/components/shared/DataTable';
import ProgressionRuleFormDialog from './ProgressionRuleFormDialog';
import type { Programme } from '../../types/programme.types';

type ProgressionRuleWithAction = ProgressionRule & {
  action?: string;
};

interface ProgressionRuleListTableProps {
  rules: ProgressionRule[];
  loading: boolean;
  programmes: Programme[];
  onCreateRule: (data: any) => Promise<void>;
  onUpdateRule: (id: number, data: any) => Promise<void>;
  onDeleteRule: (id: number) => Promise<void>;
  onRefresh: () => void;
}

const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'program', label: 'Programme', defaultVisible: true },
  { id: 'transition', label: 'Transition', defaultVisible: true },
  { id: 'min_credits', label: 'Crédits Min', defaultVisible: true },
  { id: 'max_debt', label: 'Dette Max', defaultVisible: true },
  { id: 'conditional_pass', label: 'Passage Conditionnel', defaultVisible: true },
  { id: 'max_repeats', label: 'Max Redoublements', defaultVisible: true },
];

const STORAGE_KEY = 'progressionRuleListTableColumns';

const columnHelper = createColumnHelper<ProgressionRuleWithAction>();

const ProgressionRuleListTable: React.FC<ProgressionRuleListTableProps> = ({
  rules,
  loading,
  programmes,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onRefresh,
}) => {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ProgressionRule | null>(null);
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

  // Handle form dialog
  const handleOpenAddDialog = useCallback(() => {
    setSelectedRule(null);
    setIsEditMode(false);
    setFormDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((rule: ProgressionRule) => {
    setSelectedRule(rule);
    setIsEditMode(true);
    setFormDialogOpen(true);
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setFormDialogOpen(false);
    setSelectedRule(null);
    setIsEditMode(false);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: any) => {
      if (isEditMode && selectedRule) {
        await onUpdateRule(selectedRule.id, data);
      } else {
        await onCreateRule(data);
      }
      handleCloseFormDialog();
    },
    [isEditMode, selectedRule, onCreateRule, onUpdateRule, handleCloseFormDialog]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette règle de progression ?')) {
        await onDeleteRule(id);
      }
    },
    [onDeleteRule]
  );

  // Column definitions
  const columns = useMemo<ColumnDef<ProgressionRuleWithAction, any>[]>(
    () => [
      columnHelper.accessor('id', {
        id: 'id',
        header: '#',
        cell: ({ row }) => <Typography>{row.original.id}</Typography>,
      }),
      columnHelper.accessor('programme_id', {
        id: 'program',
        header: 'Programme',
        cell: ({ row }) => {
          if (!row.original.programme_id) {
            return (
              <Chip variant="tonal" label="Règle Globale" size="small" color="primary" />
            );
          }
          const program = row.original.programme;
          return (
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {program?.code || '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {program?.libelle || '-'}
              </Typography>
            </Box>
          );
        },
      }),
      columnHelper.accessor('from_level', {
        id: 'transition',
        header: 'Transition',
        cell: ({ row }) => (
          <Chip
            variant="outlined"
            label={getTransitionLabel(row.original.from_level, row.original.to_level)}
            size="small"
            color="secondary"
          />
        ),
      }),
      columnHelper.accessor('min_credits_required', {
        id: 'min_credits',
        header: 'Crédits Min',
        cell: ({ row }) => (
          <Typography>
            <strong>{row.original.min_credits_required}</strong>/60
          </Typography>
        ),
      }),
      columnHelper.accessor('max_debt_allowed', {
        id: 'max_debt',
        header: 'Dette Max',
        cell: ({ row }) => (
          <Chip
            variant="tonal"
            label={`${row.original.max_debt_allowed} crédits`}
            size="small"
            color="warning"
          />
        ),
      }),
      columnHelper.accessor('allow_conditional_pass', {
        id: 'conditional_pass',
        header: 'Passage Conditionnel',
        cell: ({ row }) => (
          <Chip
            variant="tonal"
            label={row.original.allow_conditional_pass ? 'Oui' : 'Non'}
            size="small"
            color={row.original.allow_conditional_pass ? 'success' : 'error'}
          />
        ),
      }),
      columnHelper.accessor('max_repeats_before_exclusion', {
        id: 'max_repeats',
        header: 'Max Redoublements',
        cell: ({ row }) => (
          <Typography>{row.original.max_repeats_before_exclusion}</Typography>
        ),
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            <IconButton size="small" onClick={() => handleOpenEditDialog(row.original)}>
              <i className="ri-edit-line text-textSecondary" />
            </IconButton>
            <IconButton size="small" onClick={() => handleDelete(row.original.id)}>
              <i className="ri-delete-bin-line text-textSecondary" />
            </IconButton>
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [handleOpenEditDialog, handleDelete]
  );

  // DataTable configuration
  const tableConfig: DataTableConfig<ProgressionRule> = {
    columns,
    data: rules as ProgressionRule[],
    loading,
    availableColumns: AVAILABLE_COLUMNS,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    onRefresh,
    searchPlaceholder: 'Rechercher une règle',
    emptyMessage: 'Aucune règle de progression définie',

    // Actions
    actions: [
      {
        label: 'Ajouter une Règle',
        icon: 'ri-add-line',
        color: 'primary',
        onClick: handleOpenAddDialog,
        disabled: loading,
      },
    ],

    // Mobile card configuration
    mobileCard: {
      renderCard: (rule) => {
        const program = rule.programme;
        return (
          <StandardMobileCard
            title={
              rule.programme_id
                ? `${program?.code || '-'} - ${program?.libelle || '-'}`
                : 'Règle Globale'
            }
            subtitle={getTransitionLabel(rule.from_level, rule.to_level)}
            status={{
              label: rule.allow_conditional_pass ? 'Passage Conditionnel' : 'Strict',
              color: rule.allow_conditional_pass ? 'success' : 'warning',
            }}
            fields={[
              {
                icon: 'ri-medal-line',
                label: 'Crédits Min',
                value: `${rule.min_credits_required}/60`,
              },
              {
                icon: 'ri-alert-line',
                label: 'Dette Max',
                value: `${rule.max_debt_allowed} crédits`,
              },
              {
                icon: 'ri-repeat-line',
                label: 'Max Redoublements',
                value: `${rule.max_repeats_before_exclusion}`,
              },
            ]}
            actions={[
              {
                icon: 'ri-edit-line',
                color: 'primary',
                onClick: () => handleOpenEditDialog(rule),
              },
              {
                icon: 'ri-delete-bin-line',
                color: 'error',
                onClick: () => handleDelete(rule.id),
              },
            ]}
            item={rule}
          />
        );
      },
    },
  };

  return (
    <>
      {rules.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Aucune règle de progression définie. Créez une règle globale ou des règles spécifiques par
          programme.
        </Alert>
      )}

      <DataTable {...tableConfig} />

      {/* Form Dialog (Add/Edit) */}
      <ProgressionRuleFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSubmit={handleFormSubmit}
        rule={selectedRule}
        isEditMode={isEditMode}
        programmes={programmes}
      />
    </>
  );
};

export default ProgressionRuleListTable;
