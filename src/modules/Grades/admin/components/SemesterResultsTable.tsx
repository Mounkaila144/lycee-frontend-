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
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';

import type { SemesterResult } from '../../types/grade.types';

interface SemesterResultsTableProps {
  results: SemesterResult[];
  loading: boolean;
}

const getStatusChip = (result: any) => {
  const status = result.global_status;
  const label = result.global_status_label || status;

  const colorMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    validated: 'success',
    partially_validated: 'warning',
    to_retake: 'error',
    deferred: 'info',
  };

  return <Chip label={label} size="small" color={colorMap[status] || 'default'} />;
};

const getMentionChip = (result: any) => {
  if (!result.mention || result.mention === 'Non admis') {
    return <Typography variant="body2" color="text.disabled">-</Typography>;
  }

  const colorMap: Record<string, 'success' | 'primary' | 'info' | 'warning'> = {
    'Très Bien': 'success',
    'Bien': 'primary',
    'Assez Bien': 'info',
    'Passable': 'warning',
  };

  return <Chip label={result.mention} size="small" variant="outlined" color={colorMap[result.mention] || 'default'} />;
};

export const SemesterResultsTable: React.FC<SemesterResultsTableProps> = ({
  results,
  loading,
}) => {
  if (loading) {
    return (
      <Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          Aucun résultat de semestre disponible.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Rang</TableCell>
            <TableCell>Matricule</TableCell>
            <TableCell>Étudiant</TableCell>
            <TableCell align="center">Moyenne</TableCell>
            <TableCell align="center">Mention</TableCell>
            <TableCell align="center">Modules validés</TableCell>
            <TableCell align="center">Crédits</TableCell>
            <TableCell align="center">Statut</TableCell>
            <TableCell align="center">Progression</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result: any) => (
            <TableRow
              key={result.student_id}
              hover
              sx={result.validation_blocked_by_eliminatory ? { backgroundColor: 'error.lighter' } : undefined}
            >
              {/* Rank */}
              <TableCell>
                {result.rank_display || (result.rank ? `${result.rank}/${result.total_ranked}` : '-')}
              </TableCell>

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

              {/* Average */}
              <TableCell align="center">
                {result.average !== null ? (
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={result.average >= 10 ? 'success.main' : 'error.main'}
                  >
                    {parseFloat(result.average).toFixed(2)}/20
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.disabled">ABS</Typography>
                )}
              </TableCell>

              {/* Mention */}
              <TableCell align="center">
                {getMentionChip(result)}
              </TableCell>

              {/* Modules validated */}
              <TableCell align="center">
                <Tooltip title={`${result.validated_modules_count} validés + ${result.compensated_modules_count} compensés / ${result.validated_modules_count + result.compensated_modules_count + result.failed_modules_count + result.missing_modules_count} total`}>
                  <Box>
                    <Typography variant="body2">
                      {result.validated_modules_count + result.compensated_modules_count}
                      /{result.validated_modules_count + result.compensated_modules_count + result.failed_modules_count + result.missing_modules_count}
                    </Typography>
                    {result.compensated_modules_count > 0 && (
                      <Typography variant="caption" color="warning.main">
                        ({result.compensated_modules_count} comp.)
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              </TableCell>

              {/* Credits */}
              <TableCell align="center">
                <Box>
                  <Typography variant="body2">
                    {result.acquired_credits}/{result.total_credits}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={result.total_credits > 0 ? (result.acquired_credits / result.total_credits) * 100 : 0}
                    sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                    color={result.success_rate >= 100 ? 'success' : result.success_rate >= 50 ? 'warning' : 'error'}
                  />
                </Box>
              </TableCell>

              {/* Status */}
              <TableCell align="center">
                {result.validation_blocked_by_eliminatory && result.blocking_reasons?.length > 0 ? (
                  <Tooltip title={result.blocking_reasons.join(', ')}>
                    <Box>{getStatusChip(result)}</Box>
                  </Tooltip>
                ) : (
                  getStatusChip(result)
                )}
              </TableCell>

              {/* Progression */}
              <TableCell align="center">
                {result.can_progress_next_year ? (
                  <Chip label="Oui" size="small" color="success" variant="outlined" />
                ) : (
                  <Chip label="Non" size="small" color="error" variant="outlined" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
