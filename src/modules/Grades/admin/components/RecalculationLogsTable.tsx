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
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

import type { RecalculationLog } from '../../types/retake.types';

interface RecalculationLogsTableProps {
  logs: RecalculationLog[];
  loading: boolean;
}

const LogRow: React.FC<{ log: RecalculationLog }> = ({ log }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            <i className={expanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} />
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
            {log.student?.matricule ?? log.student_id}
          </Typography>
        </TableCell>
        <TableCell>
          {log.student ? `${log.student.lastname} ${log.student.firstname}` : '-'}
        </TableCell>
        <TableCell>
          <Chip label={log.trigger} size="small" variant="outlined" />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={`${log.changes?.length ?? 0} changement${(log.changes?.length ?? 0) > 1 ? 's' : ''}`}
            size="small"
            color={log.changes?.length > 0 ? 'info' : 'default'}
          />
        </TableCell>
        <TableCell>
          <Typography variant="caption" color="text.secondary">
            {new Date(log.recalculated_at).toLocaleString('fr-FR')}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, pl: 6 }}>
              {log.changes && log.changes.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      <TableCell align="center">Ancienne moy.</TableCell>
                      <TableCell align="center">Nouvelle moy.</TableCell>
                      <TableCell align="center">Amélioré</TableCell>
                      <TableCell>Ancien statut</TableCell>
                      <TableCell>Nouveau statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {log.changes.map((change, index) => (
                      <TableRow key={index}>
                        <TableCell>{change.module_name}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="error.main">
                            {change.old_average.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color={change.improved ? 'success.main' : 'text.primary'} fontWeight="bold">
                            {change.new_average.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {change.improved ? (
                            <Chip label={`+${(change.new_average - change.old_average).toFixed(2)}`} size="small" color="success" />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>{change.old_status ?? '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={change.new_status ?? '-'}
                            size="small"
                            color={change.new_status === 'validated' ? 'success' : change.new_status === 'partially_validated' ? 'warning' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">Aucun changement enregistré.</Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const RecalculationLogsTable: React.FC<RecalculationLogsTableProps> = ({ logs, loading }) => {
  if (loading) {
    return (
      <>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </>
    );
  }

  if (logs.length === 0) {
    return <Alert severity="info">Aucun recalcul effectué pour ce semestre.</Alert>;
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 50 }} />
            <TableCell>Matricule</TableCell>
            <TableCell>Étudiant</TableCell>
            <TableCell>Déclencheur</TableCell>
            <TableCell align="center">Changements</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map(log => (
            <LogRow key={log.id} log={log} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
