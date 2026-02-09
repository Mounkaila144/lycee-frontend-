'use client';

import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

import type { FinalResult } from '../../types/finalResult.types';
import { FINAL_STATUS_LABELS, FINAL_STATUS_COLORS } from '../../types/finalResult.types';

interface FinalResultsTableProps {
  results: FinalResult[];
  loading: boolean;
}

export const FinalResultsTable: React.FC<FinalResultsTableProps> = ({ results, loading }) => {
  if (loading) {
    return (
      <>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </>
    );
  }

  if (results.length === 0) {
    return <Alert severity="info">Aucun résultat final disponible.</Alert>;
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Matricule</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell align="center">Moyenne</TableCell>
            <TableCell align="center">Crédits ECTS</TableCell>
            <TableCell align="center">Progression</TableCell>
            <TableCell align="center">Statut final</TableCell>
            <TableCell align="center">Année suivante</TableCell>
            <TableCell>Publication</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map(result => {
            const creditsPercent = result.total_credits > 0
              ? (result.acquired_credits / result.total_credits) * 100
              : 0;

            return (
              <TableRow key={result.student_id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                    {result.student?.matricule ?? result.student_id}
                  </Typography>
                </TableCell>
                <TableCell>
                  {result.student ? `${result.student.lastname} ${result.student.firstname}` : '-'}
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={result.average !== null && result.average >= 10 ? 'success.main' : 'error.main'}
                  >
                    {result.average?.toFixed(2) ?? '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box>
                    <Typography variant="body2">
                      {result.acquired_credits}/{result.total_credits}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={creditsPercent}
                      color={creditsPercent >= 100 ? 'success' : creditsPercent >= 80 ? 'warning' : 'error'}
                      sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {result.success_rate?.toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {result.final_status ? (
                    <Chip
                      label={FINAL_STATUS_LABELS[result.final_status]}
                      size="small"
                      color={FINAL_STATUS_COLORS[result.final_status]}
                    />
                  ) : (
                    <Chip label="En attente" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell align="center">
                  {result.can_progress_next_year ? (
                    <Chip label="Oui" size="small" color="success" />
                  ) : (
                    <Chip label="Non" size="small" color="error" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>
                  {result.final_published_at ? (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(result.final_published_at).toLocaleDateString('fr-FR')}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.disabled">Non publié</Typography>
                  )}
                  {result.year_locked_at && (
                    <Chip label="Verrouillé" size="small" color="default" sx={{ ml: 1 }} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
