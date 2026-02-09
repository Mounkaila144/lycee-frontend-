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

import type { ModuleStudentResult } from '../../types/moduleResult.types';

interface ModuleResultsTableProps {
  results: ModuleStudentResult[];
  loading: boolean;
}

const getStatusChip = (result: ModuleStudentResult) => {
  const colorMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    validated: 'success',
    compensated: 'warning',
    failed: 'error',
    absent: 'info',
    pending: 'default',
  };

  const labelMap: Record<string, string> = {
    validated: 'Validé',
    compensated: 'Compensé',
    failed: 'Non validé',
    absent: 'Absent',
    pending: 'En attente',
  };

  return (
    <Chip
      label={result.status_label || labelMap[result.status] || result.status}
      size="small"
      color={colorMap[result.status] || 'default'}
    />
  );
};

const getMentionChip = (result: ModuleStudentResult) => {
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

export const ModuleResultsTable: React.FC<ModuleResultsTableProps> = ({ results, loading }) => {
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
          Aucun résultat disponible. Cliquez sur &quot;Générer&quot; pour calculer les résultats.
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
            <TableCell align="center">Statut</TableCell>
            <TableCell align="center">Publié</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.student_id} hover>
              <TableCell>
                {result.rank_display || (result.rank ? `${result.rank}/${result.total_ranked}` : '-')}
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {result.student?.matricule || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {result.student?.full_name || `${result.student?.firstname || ''} ${result.student?.lastname || ''}`.trim() || '-'}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {result.average !== null ? (
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={result.average >= 10 ? 'success.main' : 'error.main'}
                  >
                    {result.average.toFixed(2)}/20
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.disabled">ABS</Typography>
                )}
              </TableCell>
              <TableCell align="center">
                {getMentionChip(result)}
              </TableCell>
              <TableCell align="center">
                {getStatusChip(result)}
              </TableCell>
              <TableCell align="center">
                {result.is_published ? (
                  <Chip label="Oui" size="small" color="success" variant="outlined" />
                ) : (
                  <Chip label="Non" size="small" variant="outlined" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
