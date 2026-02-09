'use client';

import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';

import type { RetakeStudentEntry } from '../../types/retake.types';

interface RetakeGradeTableProps {
  entries: RetakeStudentEntry[];
  loading: boolean;
  onUpdateGrade: (enrollmentId: number, score: number | null, isAbsent: boolean, comment?: string | null) => void;
  readOnly?: boolean;
}

export const RetakeGradeTable: React.FC<RetakeGradeTableProps> = ({
  entries,
  loading,
  onUpdateGrade,
  readOnly = false,
}) => {
  if (loading) {
    return (
      <>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </>
    );
  }

  if (entries.length === 0) {
    return <Alert severity="info">Aucun étudiant inscrit en rattrapage pour ce module.</Alert>;
  }

  const handleScoreChange = (enrollmentId: number, value: string, entry: RetakeStudentEntry) => {
    if (value === '') {
      onUpdateGrade(enrollmentId, null, false);

      return;
    }

    const parsed = parseFloat(value);

    if (!isNaN(parsed) && parsed >= 0 && parsed <= 20) {
      onUpdateGrade(enrollmentId, parsed, false);
    }
  };

  const handleAbsentToggle = (enrollmentId: number, isAbsent: boolean) => {
    onUpdateGrade(enrollmentId, null, isAbsent);
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 50 }}>#</TableCell>
            <TableCell>Matricule</TableCell>
            <TableCell>Nom & Prénom</TableCell>
            <TableCell align="center">Moy. initiale</TableCell>
            <TableCell align="center" sx={{ width: 120 }}>Note rattrapage</TableCell>
            <TableCell align="center" sx={{ width: 80 }}>Absent</TableCell>
            <TableCell align="center">Nouvelle moy.</TableCell>
            <TableCell align="center">Progression</TableCell>
            <TableCell align="center">Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry, index) => {
            const isAbsent = entry.is_absent;
            const hasScore = entry.retake_score !== null;

            return (
              <TableRow
                key={entry.retake_enrollment_id}
                hover
                sx={{
                  backgroundColor: entry.is_improved ? 'success.lighter' : undefined,
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                    {entry.student.matricule}
                  </Typography>
                </TableCell>
                <TableCell>
                  {entry.student.lastname} {entry.student.firstname}
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    color={entry.original_average !== null && entry.original_average < 10 ? 'error.main' : 'text.primary'}
                    fontWeight="bold"
                  >
                    {entry.original_average?.toFixed(2) ?? '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {readOnly ? (
                    <Typography variant="body2">
                      {isAbsent ? 'ABS' : entry.retake_score?.toFixed(2) ?? '-'}
                    </Typography>
                  ) : (
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 0, max: 20, step: 0.25 }}
                      value={isAbsent ? '' : (entry.retake_score ?? '')}
                      onChange={(e) => handleScoreChange(entry.retake_enrollment_id, e.target.value, entry)}
                      disabled={isAbsent}
                      sx={{ width: 100 }}
                      placeholder="0-20"
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  {readOnly ? (
                    isAbsent ? <Chip label="ABS" size="small" /> : null
                  ) : (
                    <Checkbox
                      checked={isAbsent}
                      onChange={(e) => handleAbsentToggle(entry.retake_enrollment_id, e.target.checked)}
                      size="small"
                    />
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
                    <Tooltip title={`+${entry.improvement_amount?.toFixed(2)} points`}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        <i className="ri-arrow-up-line" style={{ color: 'green' }} />
                        <Typography variant="caption" color="success.main">
                          +{entry.improvement_amount?.toFixed(2)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : hasScore && !isAbsent ? (
                    <Tooltip title="Pas d'amélioration">
                      <i className="ri-arrow-right-line" style={{ color: 'gray' }} />
                    </Tooltip>
                  ) : null}
                </TableCell>
                <TableCell align="center">
                  {entry.status === 'published' && <Chip label="Publié" size="small" color="success" />}
                  {entry.status === 'validated' && <Chip label="Validé" size="small" color="info" />}
                  {entry.status === 'submitted' && <Chip label="Soumis" size="small" color="warning" />}
                  {entry.status === 'draft' && <Chip label="Brouillon" size="small" />}
                  {entry.status === 'pending_entry' && <Chip label="Non saisi" size="small" variant="outlined" />}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
