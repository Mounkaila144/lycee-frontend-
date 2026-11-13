'use client';

import React, { useState, useCallback } from 'react';

import CircularProgress from '@mui/material/CircularProgress';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';

import { useTenant } from '@/shared/lib/tenant-context';

import type {
  ExamSession,
  ExamSessionStatus,
} from '../../types';

import {
  useExamSessions,
  usePublishExamSession,
  useCancelExamSession,
  useDuplicateExamSession,
  useDeleteExamSession,
} from '../hooks';

import {
  EXAM_TYPE_LABELS,
  EXAM_TYPE_COLORS,
  EXAM_SESSION_STATUS_LABELS,
} from '../../types';

const getStatusChipColor = (status: ExamSessionStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'draft': return 'default';
    case 'planned':
    case 'scheduled': return 'primary';
    case 'ongoing': return 'warning';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

export const ExamSessionsDashboard: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { tenantId } = useTenant();
  const [page, setPage] = useState(1);
  const { data: sessionsPage, isLoading, isError } = useExamSessions({ page }, tenantId || undefined);
  const sessions: ExamSession[] = sessionsPage?.data ?? [];

  const publishMutation = usePublishExamSession(tenantId || undefined);
  const cancelMutation = useCancelExamSession(tenantId || undefined);
  const duplicateMutation = useDuplicateExamSession(tenantId || undefined);
  const deleteMutation = useDeleteExamSession(tenantId || undefined);

  const notify = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const errorMessage = (error: unknown, fallback: string): string => {
    const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

    return responseMessage || fallback;
  };

  const handleViewDetail = useCallback((session: ExamSession) => {
    setSelectedSession(session);
    setDetailOpen(true);
  }, []);

  const handlePublish = useCallback((session: ExamSession) => {
    publishMutation.mutate(session.id, {
      onSuccess: () => notify(`"${session.title}" a été publié avec succès`, 'success'),
      onError: error => notify(errorMessage(error, 'Échec de la publication'), 'error'),
    });
  }, [publishMutation, notify]);

  const handleCancel = useCallback((session: ExamSession) => {
    if (!window.confirm(`Annuler la session "${session.title}" ?`)) {
      return;
    }

    cancelMutation.mutate({ sessionId: session.id }, {
      onSuccess: () => notify(`"${session.title}" a été annulé`, 'success'),
      onError: error => notify(errorMessage(error, 'Échec de l\'annulation'), 'error'),
    });
  }, [cancelMutation, notify]);

  const handleDuplicate = useCallback((session: ExamSession) => {
    duplicateMutation.mutate(session.id, {
      onSuccess: () => notify(`"${session.title}" a été dupliqué`, 'success'),
      onError: error => notify(errorMessage(error, 'Échec de la duplication'), 'error'),
    });
  }, [duplicateMutation, notify]);

  const handleDelete = useCallback((session: ExamSession) => {
    if (!window.confirm(`Supprimer définitivement la session "${session.title}" ?`)) {
      return;
    }

    deleteMutation.mutate(session.id, {
      onSuccess: () => notify(`"${session.title}" a été supprimé`, 'success'),
      onError: error => notify(errorMessage(error, 'Échec de la suppression'), 'error'),
    });
  }, [deleteMutation, notify]);

  const formatMaterials = (materials: ExamSession['allowed_materials']): string => {
    if (!materials || (Array.isArray(materials) && materials.length === 0)) {
      return 'Aucun';
    }

    return Array.isArray(materials) ? materials.join(', ') : materials;
  };

  const scheduledCount = sessions.filter(s => s.status === 'planned' || s.status === 'scheduled').length;
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const totalCapacity = sessions.reduce((sum, s) => sum + s.total_capacity, 0);
  const publishedCount = sessions.filter(s => s.is_published).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Examens
        </Link>
        <Typography color="text.primary">Planification</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Planification des Examens
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          + Nouvelle Session
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Sessions planifiées', value: scheduledCount, color: '#1976d2' },
          { label: 'Sessions terminées', value: completedCount, color: '#4caf50' },
          { label: 'Capacité totale', value: totalCapacity, color: '#ff9800' },
          { label: 'Publiées', value: publishedCount, color: '#9c27b0' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sessions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Sessions d&apos;Examen</Typography>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Impossible de charger les sessions d&apos;examen.
            </Alert>
          )}
          {!isLoading && !isError && sessions.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Aucune session d&apos;examen planifiée pour le moment.
            </Alert>
          )}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Horaire</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Capacité</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Publié</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(session => (
                  <TableRow key={session.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{session.title}</Typography>
                      {session.description && (
                        <Typography variant="caption" color="text.secondary">
                          {session.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {session.module?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.module?.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(session.exam_date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {session.start_time} - {session.end_time}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {session.duration_minutes} min
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={EXAM_TYPE_LABELS[session.type]}
                        sx={{ bgcolor: EXAM_TYPE_COLORS[session.type], color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{session.total_capacity}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={EXAM_SESSION_STATUS_LABELS[session.status]}
                        color={getStatusChipColor(session.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={session.is_published ? 'Oui' : 'Non'}
                        color={session.is_published ? 'success' : 'default'}
                        variant={session.is_published ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetail(session)}
                        >
                          Détails
                        </Button>
                        {session.status === 'draft' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handlePublish(session)}
                          >
                            Publier
                          </Button>
                        )}
                        {(session.status === 'planned' || session.status === 'scheduled') && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancel(session)}
                          >
                            Annuler
                          </Button>
                        )}
                        <Tooltip title="Dupliquer">
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleDuplicate(session)}
                          >
                            Dupliquer
                          </Button>
                        </Tooltip>
                        {session.status === 'draft' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(session)}
                          >
                            Supprimer
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {sessionsPage && sessionsPage.last_page > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 2 }}>
              <Button size="small" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Précédent
              </Button>
              <Typography variant="body2">
                Page {sessionsPage.current_page} / {sessionsPage.last_page}
              </Typography>
              <Button size="small" disabled={page >= sessionsPage.last_page} onClick={() => setPage(p => p + 1)}>
                Suivant
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{selectedSession?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSession?.module?.name} ({selectedSession?.module?.code})
              </Typography>
            </Box>
            {selectedSession && (
              <Chip
                label={EXAM_SESSION_STATUS_LABELS[selectedSession.status]}
                color={getStatusChipColor(selectedSession.status)}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Date & Horaire</Typography>
                <Typography fontWeight="bold">
                  {selectedSession && new Date(selectedSession.exam_date).toLocaleDateString('fr-FR')}
                </Typography>
                <Typography>
                  {selectedSession?.start_time} - {selectedSession?.end_time} ({selectedSession?.duration_minutes} min)
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Type & Capacité</Typography>
                <Typography fontWeight="bold">
                  {selectedSession && EXAM_TYPE_LABELS[selectedSession.type]}
                </Typography>
                <Typography>{selectedSession?.total_capacity} places</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Matériels autorisés</Typography>
                <Typography>{formatMaterials(selectedSession?.allowed_materials ?? null)}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Instructions</Typography>
                <Typography>{selectedSession?.instructions || 'Aucune'}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Créé le</Typography>
                <Typography>
                  {selectedSession && new Date(selectedSession.created_at).toLocaleDateString('fr-FR')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Session d&apos;Examen</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            La création d&apos;une session d&apos;examen nécessite un module rattaché à l&apos;année
            académique. Le référentiel des épreuves du lycée (matières / classes) n&apos;est pas encore
            relié aux examens : la création depuis cet écran est temporairement indisponible.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
