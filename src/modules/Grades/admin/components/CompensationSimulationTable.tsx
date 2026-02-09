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
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';

import type { CompensationSimulationStudent } from '../../types/compensation.types';

interface CompensationSimulationTableProps {
  students: CompensationSimulationStudent[];
  loading: boolean;
  onApplyForStudent?: (studentId: number) => void;
  onViewDetails?: (studentId: number) => void;
}

export const CompensationSimulationTable: React.FC<CompensationSimulationTableProps> = ({
  students,
  loading,
  onApplyForStudent,
  onViewDetails,
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

  if (students.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          Aucun étudiant éligible à la compensation. Lancez une simulation pour voir les résultats.
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
            <TableCell align="center">Moy. semestre</TableCell>
            <TableCell align="center">Modules compensables</TableCell>
            <TableCell align="center">Déjà compensés</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.student_id} hover>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {student.student_matricule}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {student.student_name}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {student.semester_average !== null ? (
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={student.semester_average >= 10 ? 'success.main' : 'error.main'}
                  >
                    {student.semester_average.toFixed(2)}/20
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.disabled">-</Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <Tooltip title={student.compensable_modules.map(m => `${m.module_code}: ${m.module_average?.toFixed(2) ?? 'ABS'}`).join(', ')}>
                  <Chip
                    label={student.compensable_count}
                    size="small"
                    color={student.compensable_count > 0 ? 'warning' : 'default'}
                  />
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={student.already_compensated_count}
                  size="small"
                  color={student.already_compensated_count > 0 ? 'success' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="center">
                <Box display="flex" gap={0.5} justifyContent="center">
                  {onViewDetails && (
                    <Button size="small" onClick={() => onViewDetails(student.student_id)}>
                      Détail
                    </Button>
                  )}
                  {onApplyForStudent && student.compensable_count > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => onApplyForStudent(student.student_id)}
                    >
                      Compenser
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
