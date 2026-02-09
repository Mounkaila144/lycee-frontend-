'use client';

import React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import type { PublicationRecord } from '../../types/publication.types';

interface PublicationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  publication: PublicationRecord | null;
}

const typeLabels: Record<string, string> = {
  semester: 'Semestriel',
  module: 'Module',
  final: 'Final',
};

const scopeLabels: Record<string, string> = {
  all: 'Tous les étudiants',
  validated: 'Étudiants validés',
  failed: 'Étudiants non validés',
};

const statusLabels: Record<string, string> = {
  published: 'Publié',
  draft: 'Brouillon',
  revoked: 'Révoqué',
};

const statusColors: Record<string, 'success' | 'default' | 'error'> = {
  published: 'success',
  draft: 'default',
  revoked: 'error',
};

export const PublicationDetailDialog: React.FC<PublicationDetailDialogProps> = ({
  open,
  onClose,
  publication,
}) => {
  if (!publication) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Détails de la publication #{publication.id}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Statut</Typography>
            <Box>
              <Chip
                label={publication.status_label || statusLabels[publication.status] || publication.status}
                size="small"
                color={statusColors[publication.status] || 'default'}
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Type</Typography>
            <Typography variant="body2">{typeLabels[publication.type] || publication.type}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Portée</Typography>
            <Typography variant="body2">{scopeLabels[publication.scope] || publication.scope}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Étudiants</Typography>
            <Typography variant="body2" fontWeight={600}>{publication.students_count}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Taux de réussite</Typography>
            <Typography variant="body2" fontWeight={600}>
              {publication.success_rate !== null ? `${publication.success_rate.toFixed(1)}%` : '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Notifications</Typography>
            <Typography variant="body2">
              {publication.notify_students ? `${publication.notification_count} envoyées` : 'Non'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Publié le</Typography>
            <Typography variant="body2">
              {publication.published_at
                ? new Date(publication.published_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })
                : '-'
              }
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Par</Typography>
            <Typography variant="body2">{publication.published_by_name || '-'}</Typography>
          </Grid>
        </Grid>

        {publication.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">Notes</Typography>
            <Typography variant="body2">{publication.notes}</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
