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
import LinearProgress from '@mui/material/LinearProgress';

import type { DeliberationSession } from '../../types/deliberation.types';

interface DeliberationSessionsTableProps {
  sessions: DeliberationSession[];
  loading: boolean;
  onSelectSession: (sessionId: number) => void;
}

const getStatusChip = (status: string, label?: string) => {
  const colorMap: Record<string, 'default' | 'info' | 'success' | 'error'> = {
    planned: 'default',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'error',
  };

  const labelMap: Record<string, string> = {
    planned: 'Planifiée',
    in_progress: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
  };

  return <Chip label={label || labelMap[status] || status} size="small" color={colorMap[status] || 'default'} />;
};

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    regular: 'Ordinaire',
    rattrapage: 'Rattrapage',
    special: 'Spéciale',
  };

  return map[type] || type;
};

export const DeliberationSessionsTable: React.FC<DeliberationSessionsTableProps> = ({
  sessions,
  loading,
  onSelectSession,
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

  if (sessions.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          Aucune session de délibération. Créez-en une pour commencer.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Semestre</TableCell>
            <TableCell align="center">Statut</TableCell>
            <TableCell>Date planifiée</TableCell>
            <TableCell align="center">Progression</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {getTypeLabel(session.session_type)}
                </Typography>
              </TableCell>
              <TableCell>
                {session.semester?.name || `Semestre ${session.semester_id}`}
              </TableCell>
              <TableCell align="center">
                {getStatusChip(session.status, session.status_label)}
              </TableCell>
              <TableCell>
                {session.scheduled_at
                  ? new Date(session.scheduled_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })
                  : '-'
                }
              </TableCell>
              <TableCell align="center">
                <Box sx={{ minWidth: 120 }}>
                  <Typography variant="caption">
                    {session.deliberated_count}/{session.total_students}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={session.progress_percentage || 0}
                    sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                    color={session.progress_percentage >= 100 ? 'success' : 'primary'}
                  />
                </Box>
              </TableCell>
              <TableCell align="center">
                <Button size="small" onClick={() => onSelectSession(session.id)}>
                  {session.status === 'in_progress' ? 'Continuer' : 'Voir'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
