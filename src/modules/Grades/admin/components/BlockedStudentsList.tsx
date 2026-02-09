'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import Skeleton from '@mui/material/Skeleton';

import type { BlockedStudent } from '../../types/eliminatory.types';

interface BlockedStudentsListProps {
  students: BlockedStudent[];
  loading: boolean;
}

const BlockedStudentRow: React.FC<{ student: BlockedStudent }> = ({ student }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            <i className={expanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} />
          </IconButton>
        </TableCell>
        <TableCell>{student.student_matricule}</TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {student.student_name}
          </Typography>
        </TableCell>
        <TableCell align="center">
          {student.semester_average !== null ? (
            <Typography
              variant="body2"
              color={student.semester_average >= 10 ? 'success.main' : 'error.main'}
              fontWeight={500}
            >
              {student.semester_average.toFixed(2)}/20
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">-</Typography>
          )}
        </TableCell>
        <TableCell align="center">
          <Chip
            label={`${student.failed_count} module(s)`}
            size="small"
            color="error"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} sx={{ py: 0, borderBottom: expanded ? undefined : 'none' }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, pl: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                Modules éliminatoires échoués:
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Module</TableCell>
                    <TableCell align="center">Moyenne</TableCell>
                    <TableCell align="center">Seuil</TableCell>
                    <TableCell align="center">Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {student.failed_modules.map((fm) => (
                    <TableRow key={fm.module_id}>
                      <TableCell>{fm.module_code}</TableCell>
                      <TableCell>{fm.module_name}</TableCell>
                      <TableCell align="center">
                        {fm.average !== null ? (
                          <Typography variant="body2" color="error.main" fontWeight={500}>
                            {fm.average.toFixed(2)}/20
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">{fm.threshold}/20</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={fm.status === 'absent' ? 'Absent' : 'A repasser'}
                          size="small"
                          color={fm.status === 'absent' ? 'warning' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const BlockedStudentsList: React.FC<BlockedStudentsListProps> = ({
  students,
  loading,
}) => {
  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (students.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          Aucun étudiant bloqué par des modules éliminatoires.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={48} />
            <TableCell>Matricule</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell align="center">Moy. Semestre</TableCell>
            <TableCell align="center">Modules échoués</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => (
            <BlockedStudentRow key={student.student_id} student={student} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
