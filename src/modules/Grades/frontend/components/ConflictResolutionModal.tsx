'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { BatchConflict } from '../../types/batch.types';

/**
 * Conflict resolution choice
 */
export type ConflictChoice = 'overwrite' | 'skip';

/**
 * Resolved conflict with user decision
 */
export interface ResolvedConflict extends BatchConflict {
  choice: ConflictChoice;
}

/**
 * Props for ConflictResolutionModal
 */
interface ConflictResolutionModalProps {
  open: boolean;
  conflicts: BatchConflict[];
  onClose: () => void;
  onConfirm: (resolved: ResolvedConflict[]) => void;
}

/**
 * Format score for display
 */
const formatScore = (score: number | null, isAbsent: boolean): string => {
  if (isAbsent) return 'ABS';
  if (score === null) return '-';
  return score.toFixed(2);
};

/**
 * ConflictResolutionModal Component
 * Modal for resolving conflicts when batch pasting over existing grades
 */
export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  open,
  conflicts,
  onClose,
  onConfirm,
}) => {
  // Track individual choices (default: skip)
  const [choices, setChoices] = useState<Map<number, ConflictChoice>>(() => {
    const initial = new Map<number, ConflictChoice>();
    conflicts.forEach((c) => initial.set(c.studentId, 'skip'));
    return initial;
  });

  // Bulk selection mode
  const [selectAll, setSelectAll] = useState<boolean>(false);

  /**
   * Reset choices when conflicts change
   */
  React.useEffect(() => {
    const newChoices = new Map<number, ConflictChoice>();
    conflicts.forEach((c) => newChoices.set(c.studentId, 'skip'));
    setChoices(newChoices);
    setSelectAll(false);
  }, [conflicts]);

  /**
   * Toggle individual choice
   */
  const toggleChoice = useCallback((studentId: number) => {
    setChoices((prev) => {
      const newChoices = new Map(prev);
      const current = newChoices.get(studentId) || 'skip';
      newChoices.set(studentId, current === 'skip' ? 'overwrite' : 'skip');
      return newChoices;
    });
  }, []);

  /**
   * Handle select all toggle
   */
  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectAll(checked);
    const newChoice: ConflictChoice = checked ? 'overwrite' : 'skip';
    const newChoices = new Map<number, ConflictChoice>();
    conflicts.forEach((c) => newChoices.set(c.studentId, newChoice));
    setChoices(newChoices);
  }, [conflicts]);

  /**
   * Count statistics
   */
  const stats = useMemo(() => {
    const overwriteCount = Array.from(choices.values()).filter((c) => c === 'overwrite').length;
    const skipCount = choices.size - overwriteCount;
    return { overwriteCount, skipCount };
  }, [choices]);

  /**
   * Handle confirm
   */
  const handleConfirm = useCallback(() => {
    const resolved: ResolvedConflict[] = conflicts.map((conflict) => ({
      ...conflict,
      choice: choices.get(conflict.studentId) || 'skip',
    }));
    onConfirm(resolved);
  }, [conflicts, choices, onConfirm]);

  /**
   * Check if all are selected
   */
  const isAllSelected = useMemo(() => {
    return conflicts.every((c) => choices.get(c.studentId) === 'overwrite');
  }, [conflicts, choices]);

  /**
   * Check if some are selected
   */
  const isSomeSelected = useMemo(() => {
    const overwriteCount = conflicts.filter((c) => choices.get(c.studentId) === 'overwrite').length;
    return overwriteCount > 0 && overwriteCount < conflicts.length;
  }, [conflicts, choices]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="conflict-dialog-title"
    >
      <DialogTitle id="conflict-dialog-title" sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-alert-line" style={{ color: '#ed6c02' }} />
          <Typography variant="h6">
            Conflits détectés ({conflicts.length})
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Warning */}
        <Alert severity="warning" sx={{ mb: 2 }}>
          Les étudiants suivants ont déjà une note saisie. Sélectionnez les notes à écraser.
        </Alert>

        {/* Summary */}
        <Box display="flex" gap={2} mb={2}>
          <Chip
            label={`${stats.overwriteCount} à écraser`}
            color={stats.overwriteCount > 0 ? 'warning' : 'default'}
            size="small"
          />
          <Chip
            label={`${stats.skipCount} à ignorer`}
            color="default"
            size="small"
          />
        </Box>

        {/* Bulk actions */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                {isAllSelected ? 'Désélectionner tout' : 'Écraser tout'}
              </Typography>
            }
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleSelectAll(false)}
            disabled={stats.skipCount === conflicts.length}
          >
            Ignorer tout
          </Button>
        </Box>

        {/* Conflicts table */}
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Matricule</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  Note actuelle
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  Nouvelle note
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conflicts.map((conflict) => {
                const choice = choices.get(conflict.studentId) || 'skip';
                const willOverwrite = choice === 'overwrite';

                return (
                  <TableRow
                    key={conflict.studentId}
                    hover
                    onClick={() => toggleChoice(conflict.studentId)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: willOverwrite ? 'rgba(237, 108, 2, 0.08)' : 'inherit',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={willOverwrite} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {conflict.matricule}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {conflict.studentName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatScore(conflict.existingScore, conflict.existingIsAbsent)}
                        size="small"
                        sx={{
                          bgcolor: conflict.existingIsAbsent ? '#f5f5f5' : '#e8f5e9',
                          textDecoration: willOverwrite ? 'line-through' : 'none',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        <i className="ri-arrow-right-line" style={{ color: '#666' }} />
                        <Chip
                          label={formatScore(conflict.newScore, conflict.newIsAbsent)}
                          size="small"
                          color={willOverwrite ? 'warning' : 'default'}
                          variant={willOverwrite ? 'filled' : 'outlined'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={willOverwrite ? 'Écraser' : 'Ignorer'}
                        size="small"
                        color={willOverwrite ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={conflicts.length === 0}
        >
          Appliquer ({stats.overwriteCount + (conflicts.length - stats.overwriteCount - stats.skipCount)} modifications)
        </Button>
      </DialogActions>
    </Dialog>
  );
};
