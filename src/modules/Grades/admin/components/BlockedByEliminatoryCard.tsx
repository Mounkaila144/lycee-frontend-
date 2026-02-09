'use client';

import React, { useState } from 'react';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';

import type { SemesterResult } from '../../types/grade.types';

interface BlockedByEliminatoryCardProps {
  blockedStudents: SemesterResult[];
  loading: boolean;
}

export const BlockedByEliminatoryCard: React.FC<BlockedByEliminatoryCardProps> = ({
  blockedStudents,
  loading,
}) => {
  const [expanded, setExpanded] = useState(true);

  if (blockedStudents.length === 0 && !loading) return null;

  return (
    <Card sx={{ mb: 3, border: '1px solid', borderColor: 'error.light' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <i className="ri-error-warning-line" style={{ color: 'var(--mui-palette-error-main)' }} />
            <Typography variant="h6" color="error.main">
              Bloqués par éliminatoire
            </Typography>
            <Chip
              label={blockedStudents.length}
              size="small"
              color="error"
            />
          </Box>
        }
        action={
          <IconButton onClick={() => setExpanded(!expanded)}>
            <i className={expanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
          </IconButton>
        }
      />
      <Collapse in={expanded}>
        <CardContent sx={{ pt: 0 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Étudiant</TableCell>
                    <TableCell align="center">Moyenne</TableCell>
                    <TableCell>Raisons du blocage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blockedStudents.map((result: any) => (
                    <TableRow key={result.student_id} sx={{ backgroundColor: 'error.lighter' }}>
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
                          <Typography variant="body2" fontWeight={600} color="error.main">
                            {parseFloat(result.average).toFixed(2)}/20
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {result.blocking_reasons && result.blocking_reasons.length > 0 ? (
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {result.blocking_reasons.map((reason: string, idx: number) => (
                              <Tooltip key={idx} title={reason}>
                                <Chip label={reason} size="small" color="error" variant="outlined" sx={{ maxWidth: 200 }} />
                              </Tooltip>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Module éliminatoire non validé</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};
