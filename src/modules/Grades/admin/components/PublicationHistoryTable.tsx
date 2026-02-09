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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import type { PublicationRecord } from '../../types/publication.types';

interface PublicationHistoryTableProps {
  publications: PublicationRecord[];
  loading: boolean;
  onView?: (publication: PublicationRecord) => void;
  onDelete?: (publicationId: number) => void;
}

const typeLabels: Record<string, string> = {
  semester: 'Semestriel',
  module: 'Module',
  final: 'Final',
};

const scopeLabels: Record<string, string> = {
  all: 'Tous',
  validated: 'Validés',
  failed: 'Non validés',
};

const statusColors: Record<string, 'success' | 'default' | 'error'> = {
  published: 'success',
  draft: 'default',
  revoked: 'error',
};

const statusLabels: Record<string, string> = {
  published: 'Publié',
  draft: 'Brouillon',
  revoked: 'Révoqué',
};

export const PublicationHistoryTable: React.FC<PublicationHistoryTableProps> = ({
  publications,
  loading,
  onView,
  onDelete,
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

  if (publications.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          Aucune publication pour ce semestre.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Portée</TableCell>
            <TableCell align="center">Étudiants</TableCell>
            <TableCell align="center">Taux réussite</TableCell>
            <TableCell align="center">Notifications</TableCell>
            <TableCell align="center">Statut</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {publications.map((pub) => (
            <TableRow key={pub.id} hover>
              <TableCell>
                {pub.published_at
                  ? new Date(pub.published_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })
                  : new Date(pub.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    })
                }
              </TableCell>
              <TableCell>{typeLabels[pub.type] || pub.type}</TableCell>
              <TableCell>{scopeLabels[pub.scope] || pub.scope}</TableCell>
              <TableCell align="center">{pub.students_count}</TableCell>
              <TableCell align="center">
                {pub.success_rate !== null ? (
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={pub.success_rate >= 50 ? 'success.main' : 'error.main'}
                  >
                    {pub.success_rate.toFixed(1)}%
                  </Typography>
                ) : '-'}
              </TableCell>
              <TableCell align="center">
                {pub.notify_students ? (
                  <Chip label={`${pub.notification_count}`} size="small" color="info" variant="outlined" />
                ) : (
                  <Typography variant="body2" color="text.disabled">Non</Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={pub.status_label || statusLabels[pub.status] || pub.status}
                  size="small"
                  color={statusColors[pub.status] || 'default'}
                />
              </TableCell>
              <TableCell align="center">
                <Box display="flex" gap={0.5} justifyContent="center">
                  {onView && (
                    <Tooltip title="Voir détails">
                      <IconButton size="small" onClick={() => onView(pub)}>
                        <i className="ri-eye-line" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && pub.status !== 'revoked' && (
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => onDelete(pub.id)}>
                        <i className="ri-delete-bin-line" />
                      </IconButton>
                    </Tooltip>
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
