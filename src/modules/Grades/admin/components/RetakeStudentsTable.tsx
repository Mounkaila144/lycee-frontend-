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
import Box from '@mui/material/Box';

import type { RetakeStudentEntry } from '../../types/retake.types';

interface RetakeStudentsTableProps {
  students: RetakeStudentEntry[];
  loading: boolean;
  showModule?: boolean;
}

const getStatusChip = (status: string) => {
  const map: Record<string, { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error' }> = {
    pending_entry: { label: 'En attente', color: 'default' },
    draft: { label: 'Brouillon', color: 'warning' },
    submitted: { label: 'Soumis', color: 'info' },
    validated: { label: 'Validé', color: 'success' },
    published: { label: 'Publié', color: 'success' },
  };

  const info = map[status] ?? { label: status, color: 'default' as const };

  return <Chip label={info.label} size="small" color={info.color} />;
};

export const RetakeStudentsTable: React.FC<RetakeStudentsTableProps> = ({
  students,
  loading,
  showModule = false,
}) => {
  if (loading) {
    return (
      <>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </>
    );
  }

  if (students.length === 0) {
    return <Alert severity="info">Aucun étudiant en rattrapage.</Alert>;
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Matricule</TableCell>
            <TableCell>Nom</TableCell>
            {showModule && <TableCell>Module</TableCell>}
            <TableCell align="center">Moy. initiale</TableCell>
            <TableCell align="center">Note rattrapage</TableCell>
            <TableCell align="center">Nouvelle moy.</TableCell>
            <TableCell align="center">Progression</TableCell>
            <TableCell align="center">Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map(entry => (
            <TableRow key={entry.retake_enrollment_id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  {entry.student.matricule}
                </Typography>
              </TableCell>
              <TableCell>
                {entry.student.firstname} {entry.student.lastname}
              </TableCell>
              {showModule && (
                <TableCell>{entry.module?.name ?? '-'}</TableCell>
              )}
              <TableCell align="center">
                <Typography
                  variant="body2"
                  color={entry.original_average !== null && entry.original_average < 10 ? 'error.main' : 'text.primary'}
                >
                  {entry.original_average?.toFixed(2) ?? '-'}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {entry.is_absent ? (
                  <Chip label="ABS" size="small" color="default" />
                ) : entry.retake_score !== null ? (
                  <Typography variant="body2" fontWeight="bold">
                    {entry.retake_score.toFixed(2)}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.disabled">-</Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={entry.new_average !== null && entry.new_average >= 10 ? 'success.main' : 'error.main'}
                >
                  {entry.new_average?.toFixed(2) ?? '-'}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {entry.is_improved ? (
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    <Typography variant="body2" color="success.main">
                      <i className="ri-arrow-up-line" />
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +{entry.improvement_amount?.toFixed(2)}
                    </Typography>
                  </Box>
                ) : entry.retake_score !== null ? (
                  <Typography variant="body2" color="text.secondary">
                    <i className="ri-arrow-right-line" />
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell align="center">
                {getStatusChip(entry.status)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
