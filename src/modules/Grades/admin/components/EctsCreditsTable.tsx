'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import type { SemesterResult } from '../../types/grade.types';

interface EctsCreditsTableProps {
  results: SemesterResult[];
  loading: boolean;
  onViewStudent?: (studentId: number) => void;
}

export const EctsCreditsTable: React.FC<EctsCreditsTableProps> = ({
  results,
  loading,
  onViewStudent,
}) => {
  if (loading) {
    return (
      <Box>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          Aucune donnée ECTS disponible.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Matricule</TableCell>
            <TableCell>Étudiant</TableCell>
            <TableCell align="center">Moy. Semestre</TableCell>
            <TableCell align="center">Crédits acquis</TableCell>
            <TableCell align="center">Crédits totaux</TableCell>
            <TableCell align="center">Taux de réussite</TableCell>
            <TableCell align="center">Modules validés</TableCell>
            <TableCell align="center">Modules compensés</TableCell>
            <TableCell align="center">Progression</TableCell>
            {onViewStudent && <TableCell align="center">Détails</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result: any) => {
            const successRate = result.total_credits > 0
              ? (result.acquired_credits / result.total_credits) * 100
              : 0;

            return (
              <TableRow key={result.student_id} hover>
                {/* Matricule */}
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {result.student?.matricule || '-'}
                  </Typography>
                </TableCell>

                {/* Student name */}
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {result.student?.full_name || `${result.student?.firstname || ''} ${result.student?.lastname || ''}`.trim() || '-'}
                  </Typography>
                </TableCell>

                {/* Semester average */}
                <TableCell align="center">
                  {result.average !== null ? (
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={result.average >= 10 ? 'success.main' : 'error.main'}
                    >
                      {parseFloat(result.average).toFixed(2)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.disabled">-</Typography>
                  )}
                </TableCell>

                {/* Acquired credits */}
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={result.acquired_credits >= result.total_credits ? 'success.main' : 'warning.main'}
                  >
                    {result.acquired_credits}
                  </Typography>
                </TableCell>

                {/* Total credits */}
                <TableCell align="center">
                  <Typography variant="body2">{result.total_credits}</Typography>
                </TableCell>

                {/* Success rate */}
                <TableCell align="center">
                  <Box sx={{ minWidth: 80 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {successRate.toFixed(1)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(successRate, 100)}
                      sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                      color={successRate >= 100 ? 'success' : successRate >= 50 ? 'warning' : 'error'}
                    />
                  </Box>
                </TableCell>

                {/* Validated modules */}
                <TableCell align="center">
                  <Chip
                    label={result.validated_modules_count}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </TableCell>

                {/* Compensated modules */}
                <TableCell align="center">
                  {result.compensated_modules_count > 0 ? (
                    <Chip
                      label={result.compensated_modules_count}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body2" color="text.disabled">0</Typography>
                  )}
                </TableCell>

                {/* Can progress */}
                <TableCell align="center">
                  {result.can_progress_next_year ? (
                    <Chip label="Oui" size="small" color="success" variant="outlined" />
                  ) : (
                    <Chip label="Non" size="small" color="error" variant="outlined" />
                  )}
                </TableCell>

                {/* View details */}
                {onViewStudent && (
                  <TableCell align="center">
                    <Tooltip title="Voir détails ECTS">
                      <IconButton size="small" onClick={() => onViewStudent(result.student_id)}>
                        <i className="ri-eye-line" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
