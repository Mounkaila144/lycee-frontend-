'use client';

import React, { useState, useCallback } from 'react';
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
import type { StudentGradeEntry, GradeCellState, AutoSaveStatus } from '../../types/grade.types';
import type { SortOption } from '../hooks/useGradeEntry';

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
  onSave: () => void;
  onRefresh: () => void;
  validateScore: (value: string | number | null) => { valid: boolean; value: number | null; error?: string };
  getCellState: (entry: StudentGradeEntry) => GradeCellState;
  isPublished?: boolean;
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
  validateScore,
  getCellState,
  isPublished = false,
}) => {
  // Local state for input validation errors
  const [inputErrors, setInputErrors] = useState<Record<number, string>>({});

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

          <Tooltip title="Rafraîchir">
            <IconButton onClick={onRefresh} disabled={saving}>
              <i className="ri-refresh-line" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Sauvegarder">
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

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: 120 }}>Matricule</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 200 }}>Nom & Prénom</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 120, textAlign: 'center' }}>Note /20</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 80, textAlign: 'center' }}>Absent</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Commentaire</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" py={4}>
                    {searchQuery ? 'Aucun étudiant trouvé' : 'Aucun étudiant inscrit à cette évaluation'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              students.map((entry) => {
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
                        value={entry.score !== null ? entry.score : ''}
                        onChange={(e) => handleScoreChange(entry.student.id, e.target.value)}
                        disabled={entry.is_absent || isPublished}
                        error={!!hasError}
                        helperText={hasError}
                        sx={{ width: 80 }}
                      />
                    </TableCell>

                    {/* Absent */}
                    <TableCell align="center">
                      <Checkbox
                        checked={entry.is_absent}
                        onChange={(e) => handleAbsentChange(entry.student.id, e.target.checked)}
                        disabled={isPublished}
                        size="small"
                      />
                    </TableCell>

                    {/* Commentaire */}
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Commentaire (optionnel)"
                        value={entry.comment || ''}
                        onChange={(e) => handleCommentChange(entry.student.id, e.target.value)}
                        disabled={isPublished}
                        inputProps={{ maxLength: 200 }}
                      />
                    </TableCell>
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
      </Box>
    </Box>
  );
};
