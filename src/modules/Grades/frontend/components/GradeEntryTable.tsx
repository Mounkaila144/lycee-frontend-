'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { StudentGradeEntry, GradeCellState, AutoSaveStatus, ModuleGrade } from '../../types/grade.types';
import type { AbsenceType, AbsencePolicy } from '../../types/absence.types';
import type { SortOption } from '../hooks/useGradeEntry';
import { getAbsenceTypeColor, getAbsenceTypeLabel } from './AbsenceManagementModal';

/**
 * Props for GradeEntryTable
 */
interface GradeEntryTableProps {
  students: StudentGradeEntry[];
  loading: boolean;
  saving: boolean;
  autoSaveStatus: AutoSaveStatus;
  hasUnsavedChanges: boolean;
  searchQuery: string;
  sortBy: SortOption;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onGradeChange: (studentId: number, field: 'score' | 'is_absent' | 'comment', value: number | boolean | string | null) => void;
  onBatchChange?: (changes: Array<{ studentId: number; score: number | null; isAbsent: boolean }>) => void;
  onSave: () => void;
  onRefresh: () => void;
  onResetChanges?: () => void;
  validateScore: (value: string | number | null) => { valid: boolean; value: number | null; error?: string };
  getCellState: (entry: StudentGradeEntry) => GradeCellState;
  isPublished?: boolean;
  onRequestCorrection?: (gradeId: number, studentName: string, currentScore: number | null) => void;
  onViewHistory?: (gradeId: number, studentName: string) => void;
  enableBatchPaste?: boolean;

  // Module averages
  moduleAverages?: Map<number, ModuleGrade>;
  classAverage?: number | null;
  averagesLoading?: boolean;

  // Absence management props
  absencePolicy?: AbsencePolicy | null;
  selectedStudentIds?: Set<number>;
  onToggleStudentSelection?: (studentId: number) => void;
  onSelectAllStudents?: (studentIds: number[]) => void;
  onDeselectAllStudents?: () => void;
  onAbsenceTypeChange?: (studentId: number, absenceType: AbsenceType) => void;
  onManageAbsence?: (gradeId: number, studentName: string, currentAbsenceType: AbsenceType | null) => void;
  onMarkSelectedAbsent?: () => void;
  bulkMarkingAbsent?: boolean;
  bulkAbsenceType?: AbsenceType;
  onBulkAbsenceTypeChange?: (type: AbsenceType) => void;
}

/**
 * Get color for cell state
 */
const getCellStateColor = (state: GradeCellState): string => {
  switch (state) {
    case 'entered':
      return '#e8f5e9'; // Light green
    case 'missing':
      return '#fff3e0'; // Light orange
    case 'absent':
      return '#f5f5f5'; // Light grey
    case 'modified':
      return '#e3f2fd'; // Light blue
    default:
      return 'transparent';
  }
};

/**
 * Auto-save status indicator
 */
const AutoSaveIndicator: React.FC<{ status: AutoSaveStatus }> = ({ status }) => {
  switch (status) {
    case 'saving':
      return (
        <Chip
          icon={<i className="ri-loader-4-line" style={{ animation: 'spin 1s linear infinite' }} />}
          label="Sauvegarde..."
          size="small"
          color="info"
        />
      );
    case 'saved':
      return (
        <Chip
          icon={<i className="ri-cloud-line" />}
          label="Sauvegardé"
          size="small"
          color="success"
        />
      );
    case 'error':
      return (
        <Chip
          icon={<i className="ri-cloud-off-line" />}
          label="Erreur"
          size="small"
          color="error"
        />
      );
    default:
      return null;
  }
};

/**
 * GradeEntryTable Component
 * Table for entering student grades with validation and auto-save
 */
export const GradeEntryTable: React.FC<GradeEntryTableProps> = ({
  students = [],
  loading,
  saving,
  autoSaveStatus,
  hasUnsavedChanges,
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
  onGradeChange,
  onSave,
  onRefresh,
  onResetChanges,
  validateScore,
  getCellState,
  isPublished = false,
  onRequestCorrection,
  onViewHistory,
  // Module averages
  moduleAverages,
  classAverage,
  averagesLoading = false,
  // Absence management
  absencePolicy,
  selectedStudentIds,
  onToggleStudentSelection,
  onSelectAllStudents,
  onDeselectAllStudents,
  onAbsenceTypeChange,
  onManageAbsence,
  onMarkSelectedAbsent,
  bulkMarkingAbsent = false,
  bulkAbsenceType = 'unjustified',
  onBulkAbsenceTypeChange,
}) => {
  // Local state for input validation errors
  const [inputErrors, setInputErrors] = useState<Record<number, string>>({});
  // State for cancel confirmation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Refs for keyboard navigation
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  /**
   * Get input key for ref map
   */
  const getInputKey = useCallback((rowIndex: number, field: 'score' | 'comment') => {
    return `${rowIndex}-${field}`;
  }, []);

  /**
   * Focus on a specific cell
   */
  const focusCell = useCallback((rowIndex: number, field: 'score' | 'comment') => {
    const key = getInputKey(rowIndex, field);
    const input = inputRefs.current.get(key);
    if (input) {
      input.focus();
      input.select?.();
    }
  }, [getInputKey]);

  /**
   * Navigate to next/previous cell
   */
  const navigateCell = useCallback((
    currentRow: number,
    currentField: 'score' | 'comment',
    direction: 'next' | 'prev' | 'down' | 'up'
  ) => {
    const fields: ('score' | 'comment')[] = ['score', 'comment'];
    const currentFieldIndex = fields.indexOf(currentField);
    const maxRow = students.length - 1;

    let newRow = currentRow;
    let newField = currentField;

    switch (direction) {
      case 'next':
        if (currentFieldIndex < fields.length - 1) {
          newField = fields[currentFieldIndex + 1];
        } else if (currentRow < maxRow) {
          newRow = currentRow + 1;
          newField = fields[0];
        }
        break;
      case 'prev':
        if (currentFieldIndex > 0) {
          newField = fields[currentFieldIndex - 1];
        } else if (currentRow > 0) {
          newRow = currentRow - 1;
          newField = fields[fields.length - 1];
        }
        break;
      case 'down':
        if (currentRow < maxRow) {
          newRow = currentRow + 1;
        }
        break;
      case 'up':
        if (currentRow > 0) {
          newRow = currentRow - 1;
        }
        break;
    }

    // Skip absent students' score field
    const studentEntry = students[newRow];
    if (studentEntry?.is_absent && newField === 'score') {
      newField = 'comment';
    }

    focusCell(newRow, newField);
  }, [students, focusCell]);

  /**
   * Handle keyboard events on input fields
   */
  const handleInputKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    field: 'score' | 'comment'
  ) => {
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        navigateCell(rowIndex, field, e.shiftKey ? 'prev' : 'next');
        break;
      case 'Enter':
        e.preventDefault();
        navigateCell(rowIndex, field, e.shiftKey ? 'up' : 'down');
        break;
      case 'Escape':
        e.preventDefault();
        (e.target as HTMLInputElement).blur();
        break;
      case 'ArrowDown':
        if (field === 'score') {
          e.preventDefault();
          navigateCell(rowIndex, field, 'down');
        }
        break;
      case 'ArrowUp':
        if (field === 'score') {
          e.preventDefault();
          navigateCell(rowIndex, field, 'up');
        }
        break;
    }
  }, [navigateCell]);

  /**
   * Register input ref
   */
  const registerInputRef = useCallback((
    rowIndex: number,
    field: 'score' | 'comment',
    el: HTMLInputElement | null
  ) => {
    const key = getInputKey(rowIndex, field);
    if (el) {
      inputRefs.current.set(key, el);
    } else {
      inputRefs.current.delete(key);
    }
  }, [getInputKey]);

  /**
   * Global keyboard shortcuts (Ctrl+S for save)
   */
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !saving && !isPublished) {
          onSave();
        }
      }
    };

    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('keydown', handleGlobalKeyDown);
      return () => container.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [hasUnsavedChanges, saving, isPublished, onSave]);

  /**
   * Auto-focus first empty cell on initial load
   */
  useEffect(() => {
    if (!loading && students.length > 0 && !isPublished) {
      // Find first student without a score
      const firstEmptyIndex = students.findIndex(
        s => s.score === null && !s.is_absent
      );
      if (firstEmptyIndex >= 0) {
        // Small delay to ensure refs are registered
        setTimeout(() => focusCell(firstEmptyIndex, 'score'), 100);
      }
    }
  }, [loading, students, isPublished, focusCell]);

  /**
   * Handle cancel button click - show confirmation if there are unsaved changes
   */
  const handleCancelClick = useCallback(() => {
    if (hasUnsavedChanges) {
      setCancelDialogOpen(true);
    }
  }, [hasUnsavedChanges]);

  /**
   * Confirm cancel and reset changes
   */
  const handleConfirmCancel = useCallback(() => {
    setCancelDialogOpen(false);
    if (onResetChanges) {
      onResetChanges();
    }
    // Clear any input errors
    setInputErrors({});
  }, [onResetChanges]);

  /**
   * Handle score input change with validation
   */
  const handleScoreChange = useCallback(
    (studentId: number, value: string) => {
      const validation = validateScore(value);

      if (!validation.valid) {
        setInputErrors((prev) => ({ ...prev, [studentId]: validation.error || 'Erreur' }));
      } else {
        setInputErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[studentId];

          return newErrors;
        });
        onGradeChange(studentId, 'score', validation.value);
      }
    },
    [validateScore, onGradeChange]
  );

  /**
   * Handle absent checkbox change
   */
  const handleAbsentChange = useCallback(
    (studentId: number, checked: boolean) => {
      onGradeChange(studentId, 'is_absent', checked);
      // Clear score error when marking absent
      if (checked) {
        setInputErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[studentId];

          return newErrors;
        });
      }
    },
    [onGradeChange]
  );

  /**
   * Handle comment change
   */
  const handleCommentChange = useCallback(
    (studentId: number, value: string) => {
      // Limit to 200 characters
      const truncated = value.slice(0, 200);
      onGradeChange(studentId, 'comment', truncated || null);
    },
    [onGradeChange]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Rechercher (matricule, nom, prénom)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="ri-search-line" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 280 }}
        />

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Trier par</InputLabel>
          <Select
            value={sortBy}
            label="Trier par"
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <MenuItem value="alphabetical">Alphabétique</MenuItem>
            <MenuItem value="matricule">Matricule</MenuItem>
            <MenuItem value="score_asc">Note (croissant)</MenuItem>
            <MenuItem value="score_desc">Note (décroissant)</MenuItem>
          </Select>
        </FormControl>

        {/* Actions */}
        <Box display="flex" alignItems="center" gap={1}>
          <AutoSaveIndicator status={autoSaveStatus} />

          {/* Keyboard shortcuts hint */}
          {!isPublished && (
            <Tooltip
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="caption" display="block">
                    <strong>Raccourcis clavier:</strong>
                  </Typography>
                  <Typography variant="caption" display="block">Tab: Cellule suivante</Typography>
                  <Typography variant="caption" display="block">Shift+Tab: Cellule précédente</Typography>
                  <Typography variant="caption" display="block">Enter: Ligne suivante</Typography>
                  <Typography variant="caption" display="block">Esc: Annuler édition</Typography>
                  <Typography variant="caption" display="block">Ctrl+S: Sauvegarder</Typography>
                </Box>
              }
            >
              <IconButton size="small" color="info">
                <i className="ri-keyboard-line" />
              </IconButton>
            </Tooltip>
          )}

          {/* Cancel/Reset button - only show when there are unsaved changes */}
          {hasUnsavedChanges && onResetChanges && !isPublished && (
            <Tooltip title="Annuler les modifications">
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<i className="ri-arrow-go-back-line" />}
                onClick={handleCancelClick}
                disabled={saving}
              >
                Annuler
              </Button>
            </Tooltip>
          )}

          <Tooltip title="Rafraîchir">
            <IconButton onClick={onRefresh} disabled={saving}>
              <i className="ri-refresh-line" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Sauvegarder (Ctrl+S)">
            <span>
              <IconButton
                onClick={onSave}
                disabled={saving || !hasUnsavedChanges || isPublished}
                color={hasUnsavedChanges ? 'primary' : 'default'}
              >
                {saving ? <CircularProgress size={24} /> : <i className="ri-save-line" />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Published warning */}
      {isPublished && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Les notes sont publiées. La modification nécessite une demande de correction.
        </Alert>
      )}

      {/* Absence Policy Banner */}
      {absencePolicy && !isPublished && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          icon={<i className="ri-shield-check-line" />}
        >
          <Typography variant="caption">
            <strong>Politique absences:</strong>{' '}
            {absencePolicy.unjustified_grade_is_zero
              ? 'Absence non justifiée = note 0'
              : 'Absence non justifiée = exclue du calcul'}{' '}
            | Délai justificatif: {absencePolicy.justification_deadline_days}j
            {absencePolicy.justified_allows_replacement && ' | Remplacement autorisé si justifié'}
          </Typography>
        </Alert>
      )}

      {/* Bulk Absence Actions */}
      {selectedStudentIds && selectedStudentIds.size > 0 && !isPublished && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          icon={<i className="ri-group-line" />}
          action={
            <Box display="flex" alignItems="center" gap={1}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={bulkAbsenceType}
                  onChange={(e) => onBulkAbsenceTypeChange?.(e.target.value as AbsenceType)}
                  size="small"
                  sx={{ height: 32 }}
                >
                  <MenuItem value="unjustified">Non justifiée</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="justified">Justifiée</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="small"
                color="warning"
                onClick={onMarkSelectedAbsent}
                disabled={bulkMarkingAbsent}
                startIcon={bulkMarkingAbsent ? <CircularProgress size={16} /> : <i className="ri-user-unfollow-line" />}
              >
                Marquer absents
              </Button>
              <Button size="small" onClick={onDeselectAllStudents}>
                Annuler
              </Button>
            </Box>
          }
        >
          <Typography variant="body2">
            <strong>{selectedStudentIds.size}</strong> étudiant(s) sélectionné(s)
          </Typography>
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 600 }} ref={tableContainerRef}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {/* Multi-select column */}
              {onToggleStudentSelection && !isPublished && (
                <TableCell sx={{ fontWeight: 'bold', width: 40, textAlign: 'center', px: 0.5 }}>
                  <Checkbox
                    size="small"
                    checked={selectedStudentIds ? selectedStudentIds.size === students.length && students.length > 0 : false}
                    indeterminate={selectedStudentIds ? selectedStudentIds.size > 0 && selectedStudentIds.size < students.length : false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectAllStudents?.(students.map(s => s.student.id));
                      } else {
                        onDeselectAllStudents?.();
                      }
                    }}
                  />
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 'bold', width: 120 }}>Matricule</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 200 }}>Nom & Prénom</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 120, textAlign: 'center' }}>Note /20</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 110, textAlign: 'center' }}>Absent</TableCell>
              {moduleAverages && (
                <TableCell sx={{ fontWeight: 'bold', width: 130, textAlign: 'center' }}>
                  Moy. Module
                  {classAverage !== null && classAverage !== undefined && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Classe: {classAverage.toFixed(2)}
                    </Typography>
                  )}
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 'bold' }}>Commentaire</TableCell>
              {isPublished && (onRequestCorrection || onViewHistory) && (
                <TableCell sx={{ fontWeight: 'bold', width: 100, textAlign: 'center' }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={(onToggleStudentSelection && !isPublished ? 1 : 0) + (moduleAverages ? 1 : 0) + (isPublished && (onRequestCorrection || onViewHistory) ? 6 : 5)} align="center">
                  <Typography color="text.secondary" py={4}>
                    {searchQuery ? 'Aucun étudiant trouvé' : 'Aucun étudiant inscrit à cette évaluation'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              students.map((entry, rowIndex) => {
                const cellState = getCellState(entry);
                const bgColor = getCellStateColor(cellState);
                const hasError = inputErrors[entry.student.id];

                return (
                  <TableRow
                    key={entry.student.id}
                    sx={{
                      backgroundColor: bgColor,
                      '&:hover': { backgroundColor: bgColor, filter: 'brightness(0.97)' },
                    }}
                  >
                    {/* Multi-select checkbox */}
                    {onToggleStudentSelection && !isPublished && (
                      <TableCell align="center" sx={{ px: 0.5 }}>
                        <Checkbox
                          size="small"
                          checked={selectedStudentIds?.has(entry.student.id) ?? false}
                          onChange={() => onToggleStudentSelection(entry.student.id)}
                        />
                      </TableCell>
                    )}

                    {/* Matricule */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {entry.student.matricule}
                      </Typography>
                    </TableCell>

                    {/* Nom & Prénom */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {entry.student.photo && (
                          <Avatar
                            src={entry.student.photo}
                            sx={{ width: 28, height: 28 }}
                          />
                        )}
                        <Typography variant="body2">
                          {entry.student.lastname} {entry.student.firstname}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Note */}
                    <TableCell align="center">
                      <TextField
                        size="small"
                        type="number"
                        inputProps={{
                          min: 0,
                          max: 20,
                          step: 0.25,
                          style: { textAlign: 'center' },
                        }}
                        inputRef={(el) => registerInputRef(rowIndex, 'score', el)}
                        value={entry.score !== null ? entry.score : ''}
                        onChange={(e) => handleScoreChange(entry.student.id, e.target.value)}
                        onKeyDown={(e) => handleInputKeyDown(e as React.KeyboardEvent<HTMLInputElement>, rowIndex, 'score')}
                        disabled={entry.is_absent || isPublished}
                        error={!!hasError}
                        helperText={hasError}
                        sx={{ width: 80 }}
                      />
                    </TableCell>

                    {/* Absent + Type */}
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        <Checkbox
                          checked={entry.is_absent}
                          onChange={(e) => handleAbsentChange(entry.student.id, e.target.checked)}
                          disabled={isPublished}
                          size="small"
                        />
                        {entry.is_absent && (
                          <Tooltip title={`${getAbsenceTypeLabel(entry.absence_type)} - Cliquer pour gérer`}>
                            <Chip
                              label={entry.absence_type === 'unjustified' ? 'NJ' : entry.absence_type === 'pending' ? 'EA' : entry.absence_type === 'justified' ? 'J' : 'ABS'}
                              size="small"
                              color={getAbsenceTypeColor(entry.absence_type)}
                              sx={{ height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
                              onClick={() => {
                                if (onManageAbsence && entry.grade?.id) {
                                  onManageAbsence(
                                    entry.grade.id,
                                    `${entry.student.lastname} ${entry.student.firstname}`,
                                    entry.absence_type
                                  );
                                }
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* Moyenne Module */}
                    {moduleAverages && (() => {
                      const moduleGrade = moduleAverages.get(entry.student.id);
                      const avg = moduleGrade?.average;
                      const status = moduleGrade?.status;
                      const isFinal = moduleGrade?.is_final ?? false;
                      const missingCount = moduleGrade?.missing_evaluations_count ?? 0;

                      return (
                        <TableCell align="center">
                          {averagesLoading ? (
                            <CircularProgress size={16} />
                          ) : status === 'ABS' ? (
                            <Chip label="ABS" size="small" color="default" sx={{ fontWeight: 'bold' }} />
                          ) : avg !== null && avg !== undefined ? (
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color: avg >= 10 ? 'success.main' : 'error.main',
                                }}
                              >
                                {avg.toFixed(2)}
                              </Typography>
                              {!isFinal && missingCount > 0 && (
                                <Tooltip title={`${missingCount} note(s) manquante(s)`}>
                                  <Typography variant="caption" color="warning.main">
                                    Provisoire
                                  </Typography>
                                </Tooltip>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })()}

                    {/* Commentaire */}
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Commentaire (optionnel)"
                        inputRef={(el) => registerInputRef(rowIndex, 'comment', el)}
                        value={entry.comment || ''}
                        onChange={(e) => handleCommentChange(entry.student.id, e.target.value)}
                        onKeyDown={(e) => handleInputKeyDown(e as React.KeyboardEvent<HTMLInputElement>, rowIndex, 'comment')}
                        disabled={isPublished}
                        inputProps={{ maxLength: 200 }}
                      />
                    </TableCell>

                    {/* Actions for published grades */}
                    {isPublished && (onRequestCorrection || onViewHistory) && (
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={0.5}>
                          {onViewHistory && entry.grade?.id && (
                            <Tooltip title="Historique des modifications">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() =>
                                  onViewHistory(
                                    entry.grade!.id,
                                    `${entry.student.lastname} ${entry.student.firstname}`
                                  )
                                }
                              >
                                <i className="ri-history-line" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onRequestCorrection && entry.grade?.id && (
                            <Tooltip title="Demander une correction">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() =>
                                  onRequestCorrection(
                                    entry.grade!.id,
                                    `${entry.student.lastname} ${entry.student.firstname}`,
                                    entry.score
                                  )
                                }
                              >
                                <i className="ri-edit-circle-line" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Box display="flex" gap={2} mt={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#e8f5e9', border: '1px solid #ccc' }} />
          <Typography variant="caption">Saisie</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#fff3e0', border: '1px solid #ccc' }} />
          <Typography variant="caption">Manquante</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#f5f5f5', border: '1px solid #ccc' }} />
          <Typography variant="caption">Absent</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#e3f2fd', border: '1px solid #ccc' }} />
          <Typography variant="caption">Modifié (non sauvegardé)</Typography>
        </Box>
        <Box sx={{ mx: 1, borderLeft: '1px solid #ccc', height: 16 }} />
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip label="NJ" size="small" color="error" sx={{ height: 18, fontSize: '0.6rem' }} />
          <Typography variant="caption">Non justifiée</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip label="EA" size="small" color="warning" sx={{ height: 18, fontSize: '0.6rem' }} />
          <Typography variant="caption">En attente</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip label="J" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem' }} />
          <Typography variant="caption">Justifiée</Typography>
        </Box>
      </Box>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Annuler les modifications ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir les annuler ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit">
            Non, continuer
          </Button>
          <Button onClick={handleConfirmCancel} color="warning" variant="contained" autoFocus>
            Oui, annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
