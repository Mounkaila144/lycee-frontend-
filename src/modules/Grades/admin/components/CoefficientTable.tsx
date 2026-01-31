'use client';

import React from 'react';

import { useTranslation } from '@/shared/i18n/use-translation';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import type { EvaluationCoefficient } from '../../types/coefficient.types';

/**
 * Props for CoefficientTable
 */
interface CoefficientTableProps {
  evaluations: EvaluationCoefficient[];
  totalCoefficients: number;
  loading: boolean;
  canModify: boolean;
  onEditCoefficient: (evaluation: EvaluationCoefficient) => void;
  onViewHistory: (evaluationId: number) => void;
}

/**
 * Get color for evaluation type
 */
const getTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (type) {
    case 'CC':
    case 'CC1':
    case 'CC2':
      return 'primary';
    case 'TP':
    case 'TD':
      return 'info';
    case 'Examen':
      return 'error';
    case 'Rattrapage':
      return 'warning';
    case 'Projet':
      return 'success';
    case 'Oral':
      return 'secondary';
    default:
      return 'default';
  }
};

/**
 * CoefficientTable Component
 * Displays evaluations with their coefficients for a module
 */
export const CoefficientTable: React.FC<CoefficientTableProps> = ({
  evaluations,
  totalCoefficients,
  loading,
  canModify,
  onEditCoefficient,
  onViewHistory,
}) => {
  const { t } = useTranslation('Grades');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (!evaluations || evaluations.length === 0) {
    return (
      <Alert severity="info">
        {t('coefficientTable.noEvaluations')}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('coefficientTable.type')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('coefficientTable.name')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>{t('coefficientTable.coefficient')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>{t('coefficientTable.maxGrade')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>{t('coefficientTable.gradesEntered')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>{t('coefficientTable.status')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>{t('coefficientTable.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evaluations.map((evaluation) => (
              <TableRow
                key={evaluation.id}
                sx={{
                  backgroundColor: evaluation.has_published_grades ? '#f5f5f5' : 'transparent',
                  '&:hover': { backgroundColor: '#fafafa' },
                }}
              >
                {/* Type */}
                <TableCell>
                  <Chip
                    label={evaluation.type}
                    size="small"
                    color={getTypeColor(evaluation.type)}
                    variant="outlined"
                  />
                </TableCell>

                {/* Nom */}
                <TableCell>
                  <Typography variant="body2">{evaluation.name}</Typography>
                </TableCell>

                {/* Coefficient */}
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {evaluation.coefficient.toFixed(2)}
                  </Typography>
                </TableCell>

                {/* Note max */}
                <TableCell align="center">
                  <Typography variant="body2">{evaluation.max_score}</Typography>
                </TableCell>

                {/* Notes saisies */}
                <TableCell align="center">
                  <Typography variant="body2">{evaluation.grades_count}</Typography>
                </TableCell>

                {/* Statut */}
                <TableCell align="center">
                  {evaluation.has_published_grades ? (
                    <Chip label={t('coefficientTable.published')} size="small" color="success" />
                  ) : evaluation.has_grades ? (
                    <Chip label={t('coefficientTable.draft')} size="small" color="warning" />
                  ) : (
                    <Chip label={t('coefficientTable.empty')} size="small" variant="outlined" />
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <Tooltip title={evaluation.can_modify_coefficient ? t('coefficientTable.editCoefficient') : t('coefficientTable.requiresApproval')}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onEditCoefficient(evaluation)}
                        disabled={!canModify}
                        color={evaluation.can_modify_coefficient ? 'primary' : 'warning'}
                      >
                        <i className="ri-edit-line" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('coefficientTable.history')}>
                    <IconButton size="small" onClick={() => onViewHistory(evaluation.id)}>
                      <i className="ri-history-line" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {/* Total row */}
            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
              <TableCell colSpan={2}>
                <Typography variant="body2" fontWeight="bold">
                  {t('coefficientTable.totalCoefficients')}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body1" fontWeight="bold" color="primary">
                  {totalCoefficients.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell colSpan={4} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Box display="flex" gap={2} mt={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip label={t('coefficientTable.published')} size="small" color="success" />
          <Typography variant="caption">{t('coefficientTable.publishedLegend')}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip label={t('coefficientTable.draft')} size="small" color="warning" />
          <Typography variant="caption">{t('coefficientTable.draftLegend')}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
