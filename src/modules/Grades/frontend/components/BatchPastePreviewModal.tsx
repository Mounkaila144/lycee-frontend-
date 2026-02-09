'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import type {
  PastedData,
  BatchValidationResult,
  BatchConflict,
} from '../../types/batch.types';
import type { StudentGradeEntry } from '../../types/grade.types';
import { ConflictResolutionModal, type ResolvedConflict } from './ConflictResolutionModal';

interface BatchPastePreviewModalProps {
  open: boolean;
  onClose: () => void;
  pastedData: PastedData | null;
  validation: BatchValidationResult | null;
  students: StudentGradeEntry[];
  onApply: (mappedData: MappedGradeData[]) => void;
  applying?: boolean;
}

export interface MappedGradeData {
  studentId: number;
  score: number | null;
  isAbsent: boolean;
  rowIndex: number;
}

/**
 * BatchPastePreviewModal Component
 * Shows preview of pasted data with validation before applying
 */
export const BatchPastePreviewModal: React.FC<BatchPastePreviewModalProps> = ({
  open,
  onClose,
  pastedData,
  validation,
  students,
  onApply,
  applying = false,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [resolvedConflicts, setResolvedConflicts] = useState<Map<number, 'overwrite' | 'skip'>>(new Map());

  // Map pasted data to students (by order)
  const mappedData = useMemo(() => {
    if (!pastedData || !validation) return [];

    const result: MappedGradeData[] = [];

    validation.validData.forEach((row, index) => {
      // Map by row index to student (assumes same order)
      if (index < students.length) {
        result.push({
          studentId: students[index].student.id,
          score: row.score,
          isAbsent: row.isAbsent,
          rowIndex: row.rowIndex,
        });
      }
    });

    return result;
  }, [pastedData, validation, students]);

  // Detect conflicts (students with existing grades)
  const conflicts = useMemo(() => {
    if (!validation) return [];

    const result: BatchConflict[] = [];

    validation.validData.forEach((row, index) => {
      if (index >= students.length) return;

      const student = students[index];
      const hasExistingGrade = student.score !== null || student.is_absent;
      const hasChange = row.score !== student.score || row.isAbsent !== student.is_absent;

      if (hasExistingGrade && hasChange) {
        result.push({
          rowIndex: row.rowIndex,
          studentId: student.student.id,
          studentName: `${student.student.lastname} ${student.student.firstname}`,
          matricule: student.student.matricule,
          existingScore: student.score,
          existingIsAbsent: student.is_absent,
          newScore: row.score,
          newIsAbsent: row.isAbsent,
        });
      }
    });

    return result;
  }, [validation, students]);

  // Count of new grades (no conflict)
  const newGradesCount = useMemo(() => {
    return mappedData.filter((m) => {
      const student = students.find((s) => s.student.id === m.studentId);
      return student && student.score === null && !student.is_absent;
    }).length;
  }, [mappedData, students]);

  // Handle apply - check for conflicts first
  const handleApply = useCallback(() => {
    if (conflicts.length > 0 && resolvedConflicts.size === 0) {
      // Show conflict resolution modal
      setConflictModalOpen(true);
    } else {
      // Apply with resolved conflicts
      applyWithConflicts();
    }
  }, [conflicts, resolvedConflicts]);

  // Apply grades considering resolved conflicts
  const applyWithConflicts = useCallback(() => {
    const dataToApply = mappedData.filter((m) => {
      // Check if this is a conflict
      const conflict = conflicts.find((c) => c.studentId === m.studentId);
      if (conflict) {
        // Only include if resolved as 'overwrite'
        return resolvedConflicts.get(m.studentId) === 'overwrite';
      }
      // Not a conflict - include it
      return true;
    });

    if (dataToApply.length > 0) {
      onApply(dataToApply);
    } else {
      onClose();
    }
  }, [mappedData, conflicts, resolvedConflicts, onApply, onClose]);

  // Handle conflict resolution
  const handleConflictResolution = useCallback((resolved: ResolvedConflict[]) => {
    const newResolved = new Map<number, 'overwrite' | 'skip'>();
    resolved.forEach((r) => {
      newResolved.set(r.studentId, r.choice);
    });
    setResolvedConflicts(newResolved);
    setConflictModalOpen(false);

    // Apply immediately after resolution
    const dataToApply = mappedData.filter((m) => {
      const conflict = conflicts.find((c) => c.studentId === m.studentId);
      if (conflict) {
        const resolvedItem = resolved.find((r) => r.studentId === m.studentId);
        return resolvedItem?.choice === 'overwrite';
      }
      return true;
    });

    if (dataToApply.length > 0) {
      onApply(dataToApply);
    } else {
      onClose();
    }
  }, [mappedData, conflicts, onApply, onClose]);

  if (!pastedData || !validation) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="batch-paste-dialog-title"
    >
      <DialogTitle id="batch-paste-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-clipboard-line" style={{ fontSize: 24 }} />
          <Typography variant="h6">Prévisualisation du collage</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Summary */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Chip
            icon={<i className="ri-file-list-3-line" />}
            label={`${validation.totalRows} lignes collées`}
            variant="outlined"
          />
          <Chip
            icon={<i className="ri-checkbox-circle-line" />}
            label={`${validation.validRows} valides`}
            color="success"
            variant="outlined"
          />
          {validation.invalidRows > 0 && (
            <Chip
              icon={<i className="ri-error-warning-line" />}
              label={`${validation.invalidRows} erreurs`}
              color="error"
              variant="outlined"
            />
          )}
          {newGradesCount > 0 && (
            <Chip
              icon={<i className="ri-add-circle-line" />}
              label={`${newGradesCount} nouvelles`}
              color="info"
              variant="outlined"
            />
          )}
          {conflicts.length > 0 && (
            <Chip
              icon={<i className="ri-alert-line" />}
              label={`${conflicts.length} conflits`}
              color="warning"
              variant="outlined"
            />
          )}
        </Box>

        {/* Warnings */}
        {validation.validRows > students.length && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Vous avez collé plus de notes ({validation.validRows}) que d&apos;étudiants ({students.length}).
            Seules les {students.length} premières notes seront appliquées.
          </Alert>
        )}

        {validation.validRows < students.length && validation.validRows > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {validation.validRows} notes seront appliquées aux {validation.validRows} premiers étudiants.
            {students.length - validation.validRows} étudiants ne seront pas affectés.
          </Alert>
        )}

        {conflicts.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>{conflicts.length} étudiant(s)</strong> ont déjà une note saisie.
            Vous devrez choisir d&apos;écraser ou ignorer ces notes.
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label={`Aperçu (${Math.min(validation.validRows, students.length)})`} />
          {validation.invalidRows > 0 && (
            <Tab label={`Erreurs (${validation.invalidRows})`} />
          )}
        </Tabs>

        {/* Preview Tab */}
        {activeTab === 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Matricule</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nom & Prénom</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Note actuelle</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nouvelle note</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.slice(0, validation.validRows).map((student, index) => {
                  const pastedRow = validation.validData[index];
                  const hasChange = pastedRow && (
                    pastedRow.score !== student.score ||
                    pastedRow.isAbsent !== student.is_absent
                  );

                  return (
                    <TableRow
                      key={student.student.id}
                      sx={{
                        bgcolor: hasChange ? '#fff8e1' : 'inherit',
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.student.matricule}</TableCell>
                      <TableCell>
                        {student.student.lastname} {student.student.firstname}
                      </TableCell>
                      <TableCell>
                        {student.is_absent ? (
                          <Chip label="ABS" size="small" color="default" />
                        ) : student.score !== null ? (
                          student.score.toFixed(2)
                        ) : (
                          <Typography color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {pastedRow ? (
                          pastedRow.isAbsent ? (
                            <Chip label="ABS" size="small" color="warning" />
                          ) : pastedRow.score !== null ? (
                            <Typography fontWeight="bold" color="primary">
                              {pastedRow.score.toFixed(2)}
                            </Typography>
                          ) : (
                            <Typography color="text.secondary">-</Typography>
                          )
                        ) : (
                          <Typography color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasChange ? (
                          <Chip
                            label="Modification"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label="Inchangé"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Errors Tab */}
        {activeTab === 1 && validation.invalidRows > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ligne</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Valeur</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Erreur</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {validation.errors.map((error) => (
                  <TableRow key={error.rowIndex}>
                    <TableCell>{error.lineNumber}</TableCell>
                    <TableCell>
                      <code>
                        {error.parsedValues.map(v => v.rawValue).join(' | ')}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Typography color="error" variant="body2">
                        {error.errors.join(', ')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={applying}>
          Annuler
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          color={conflicts.length > 0 ? 'warning' : 'primary'}
          disabled={applying || mappedData.length === 0}
          startIcon={applying ? <CircularProgress size={20} /> : <i className={conflicts.length > 0 ? 'ri-alert-line' : 'ri-check-line'} />}
        >
          {applying
            ? 'Application...'
            : conflicts.length > 0
            ? `Gérer ${conflicts.length} conflits et appliquer`
            : `Appliquer ${mappedData.length} notes`}
        </Button>
      </DialogActions>

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        open={conflictModalOpen}
        conflicts={conflicts}
        onClose={() => setConflictModalOpen(false)}
        onConfirm={handleConflictResolution}
      />
    </Dialog>
  );
};
