'use client';

import React, { useCallback, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useTenant } from '@/shared/lib/tenant-context';
import { useCurrentUser } from '@/modules/Grades/lycee/hooks/useCurrentUser';

import type { ExamSession, ExamSessionStatus } from '../../types';
import {
  EXAM_SESSION_STATUS_LABELS,
  EXAM_TYPE_COLORS,
  EXAM_TYPE_LABELS,
  apiErrorMessage,
  formatDate,
  formatTime,
  sessionTargetLabel,
} from '../../types';
import {
  useCancelExamSession,
  useChangeExamSessionStatus,
  useCreateEvaluationsFromSession,
  useDeleteExamSession,
  useDuplicateExamSession,
  useExamOptions,
  useExamSessions,
  usePublishExamSession,
} from '../hooks';
import { ExamSessionFormDialog } from './ExamSessionFormDialog';

const getStatusChipColor = (status: ExamSessionStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'planned': return 'primary';
    case 'ongoing': return 'warning';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

/**
 * Planification des examens (compositions de classe, examens blancs de niveau).
 * Admin/Manager : création et cycle de vie. Professeur : lecture.
 */
export const ExamSessionsDashboard: React.FC = () => {
  const { tenantId } = useTenant();
  const tenant = tenantId || undefined;
  const { user } = useCurrentUser();
  const canManage = user.isManager;

  const [createOpen, setCreateOpen] = useState(false);
  const [detailSession, setDetailSession] = useState<ExamSession | null>(null);
  const [cancelSession, setCancelSession] = useState<ExamSession | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [gradesSession, setGradesSession] = useState<ExamSession | null>(null);
  const [gradesForm, setGradesForm] = useState({ semester_id: '', max_score: '20', weight: '2' });
  const [statusFilter, setStatusFilter] = useState<ExamSessionStatus | ''>('');
  const [classeFilter, setClasseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data: options } = useExamOptions(undefined, tenant);

  const { data: sessionsPage, isLoading, isError } = useExamSessions({
    page,
    status: statusFilter || undefined,
    classe_id: classeFilter ? Number(classeFilter) : undefined,
  }, tenant);

  const sessions: ExamSession[] = sessionsPage?.data ?? [];

  const publishMutation = usePublishExamSession(tenant);
  const cancelMutation = useCancelExamSession(tenant);
  const duplicateMutation = useDuplicateExamSession(tenant);
  const deleteMutation = useDeleteExamSession(tenant);
  const statusMutation = useChangeExamSessionStatus(tenant);
  const evaluationsMutation = useCreateEvaluationsFromSession(tenant);

  const notify = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handlePublish = (session: ExamSession) => {
    publishMutation.mutate(session.id, {
      onSuccess: () => notify(`« ${session.title} » est publiée.`, 'success'),
      onError: error => notify(apiErrorMessage(error, 'Échec de la publication'), 'error'),
    });
  };

  const handleStatus = (session: ExamSession, status: 'ongoing' | 'completed') => {
    statusMutation.mutate({ sessionId: session.id, status }, {
      onSuccess: () => notify(status === 'ongoing' ? 'Épreuve démarrée.' : 'Épreuve terminée.', 'success'),
      onError: error => notify(apiErrorMessage(error, 'Changement de statut impossible'), 'error'),
    });
  };

  const handleConfirmCancel = () => {
    if (!cancelSession) {
      return;
    }

    cancelMutation.mutate({ sessionId: cancelSession.id, reason: cancelReason.trim() || undefined }, {
      onSuccess: () => {
        notify(`« ${cancelSession.title} » est annulée.`, 'success');
        setCancelSession(null);
      },
      onError: error => notify(apiErrorMessage(error, 'Échec de l\'annulation'), 'error'),
    });
  };

  const handleDuplicate = (session: ExamSession) => {
    duplicateMutation.mutate(session.id, {
      onSuccess: () => notify(`« ${session.title} » a été dupliquée.`, 'success'),
      onError: error => notify(apiErrorMessage(error, 'Échec de la duplication'), 'error'),
    });
  };

  const handleDelete = (session: ExamSession) => {
    if (!window.confirm(`Supprimer définitivement la session « ${session.title} » ?`)) {
      return;
    }

    deleteMutation.mutate(session.id, {
      onSuccess: () => notify(`« ${session.title} » a été supprimée.`, 'success'),
      onError: error => notify(apiErrorMessage(error, 'Échec de la suppression'), 'error'),
    });
  };

  const openGradesDialog = (session: ExamSession) => {
    setGradesForm({ semester_id: session.semester_id ? String(session.semester_id) : '', max_score: '20', weight: '2' });
    setGradesSession(session);
  };

  const handleCreateEvaluations = () => {
    if (!gradesSession) {
      return;
    }

    evaluationsMutation.mutate({
      sessionId: gradesSession.id,
      data: {
        semester_id: gradesForm.semester_id ? Number(gradesForm.semester_id) : null,
        max_score: Number(gradesForm.max_score) || 20,
        weight: Number(gradesForm.weight) || 2,
      },
    }, {
      onSuccess: response => {
        notify(`${response.message} Saisie dans Notes › Évaluations.`, 'success');
        setGradesSession(null);
      },
      onError: error => notify(apiErrorMessage(error, 'Création des évaluations impossible'), 'error'),
    });
  };

  const count = (status: ExamSessionStatus) => sessions.filter(session => session.status === status).length;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Typography color="inherit">Examens</Typography>
        <Typography color="text.primary">Planification</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight="bold">Planification des examens</Typography>
        {canManage && (
          <Button variant="contained" onClick={() => setCreateOpen(true)}>+ Nouvelle session</Button>
        )}
      </Box>

      {options && !options.lycee_ready && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          La mise à jour de la base des examens (sessions par classe et matière) n&apos;est pas encore appliquée :
          la création de sessions est indisponible.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Planifiées', value: count('planned'), color: '#1976d2' },
          { label: 'En cours', value: count('ongoing'), color: '#ff9800' },
          { label: 'Terminées', value: count('completed'), color: '#4caf50' },
          { label: 'Brouillons', value: count('draft'), color: '#9e9e9e' },
        ].map(stat => (
          <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label} (page affichée)</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Sessions d&apos;examen</Typography>
            <TextField
              select
              size="small"
              label="Statut"
              value={statusFilter}
              onChange={event => { setStatusFilter(event.target.value as ExamSessionStatus | ''); setPage(1); }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Tous</MenuItem>
              {(Object.keys(EXAM_SESSION_STATUS_LABELS) as ExamSessionStatus[]).map(status => (
                <MenuItem key={status} value={status}>{EXAM_SESSION_STATUS_LABELS[status]}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Classe"
              value={classeFilter}
              onChange={event => { setClasseFilter(event.target.value); setPage(1); }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Toutes</MenuItem>
              {(options?.classes ?? []).map(classe => (
                <MenuItem key={classe.id} value={String(classe.id)}>{classe.name}</MenuItem>
              ))}
            </TextField>
          </Box>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          )}
          {isError && <Alert severity="error" sx={{ mb: 2 }}>Impossible de charger les sessions d&apos;examen.</Alert>}
          {!isLoading && !isError && sessions.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>Aucune session d&apos;examen pour ces critères.</Alert>
          )}

          {sessions.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Épreuve</TableCell>
                    <TableCell>Classe / niveau</TableCell>
                    <TableCell>Matière</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Horaire</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="center">Salles / élèves</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map(session => (
                    <TableRow key={session.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{session.title}</Typography>
                        {session.semester && (
                          <Typography variant="caption" color="text.secondary">{session.semester.name}</Typography>
                        )}
                      </TableCell>
                      <TableCell>{sessionTargetLabel(session)}</TableCell>
                      <TableCell>{session.subject?.name ?? session.module?.name ?? '—'}</TableCell>
                      <TableCell>{formatDate(session.exam_date)}</TableCell>
                      <TableCell>
                        {formatTime(session.start_time)} – {formatTime(session.end_time)}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {session.duration_minutes} min
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={EXAM_TYPE_LABELS[session.type] ?? session.type}
                          sx={{ bgcolor: EXAM_TYPE_COLORS[session.type] ?? '#9e9e9e', color: 'white' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {session.room_assignments_count ?? 0} / {session.attendance_sheets_count ?? 0}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={EXAM_SESSION_STATUS_LABELS[session.status] ?? session.status} color={getStatusChipColor(session.status)} />
                        {session.class_evaluation_ids && session.class_evaluation_ids.length > 0 && (
                          <Chip size="small" variant="outlined" color="success" label="Notes créées" sx={{ ml: 0.5 }} />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Button size="small" variant="outlined" onClick={() => setDetailSession(session)}>Détails</Button>
                          {canManage && session.status === 'draft' && (
                            <Button size="small" variant="contained" onClick={() => handlePublish(session)}>Publier</Button>
                          )}
                          {canManage && session.status === 'planned' && (
                            <Button size="small" variant="contained" color="warning" onClick={() => handleStatus(session, 'ongoing')}>Démarrer</Button>
                          )}
                          {canManage && (session.status === 'planned' || session.status === 'ongoing') && (
                            <Button size="small" variant="contained" color="success" onClick={() => handleStatus(session, 'completed')}>Terminer</Button>
                          )}
                          {canManage && session.status === 'completed' && options?.grades_link_available
                            && !(session.class_evaluation_ids && session.class_evaluation_ids.length > 0) && (
                            <Button size="small" variant="outlined" color="success" onClick={() => openGradesDialog(session)}>Créer les notes</Button>
                          )}
                          {canManage && ['draft', 'planned', 'ongoing'].includes(session.status) && (
                            <Button size="small" variant="outlined" color="error" onClick={() => { setCancelReason(''); setCancelSession(session); }}>Annuler</Button>
                          )}
                          {canManage && (
                            <Button size="small" variant="outlined" color="secondary" onClick={() => handleDuplicate(session)}>Dupliquer</Button>
                          )}
                          {canManage && session.status === 'draft' && (
                            <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(session)}>Supprimer</Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {sessionsPage && sessionsPage.last_page > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 2 }}>
              <Button size="small" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
              <Typography variant="body2">Page {sessionsPage.current_page} / {sessionsPage.last_page}</Typography>
              <Button size="small" disabled={page >= sessionsPage.last_page} onClick={() => setPage(p => p + 1)}>Suivant</Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Détail */}
      <Dialog open={!!detailSession} onClose={() => setDetailSession(null)} maxWidth="md" fullWidth>
        {detailSession && (
          <>
            <DialogTitle>
              {detailSession.title}
              <Typography variant="body2" color="text.secondary">
                {sessionTargetLabel(detailSession)} — {detailSession.subject?.name ?? detailSession.module?.name ?? ''}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Date & horaire</Typography>
                    <Typography fontWeight="bold">{formatDate(detailSession.exam_date)}</Typography>
                    <Typography>
                      {formatTime(detailSession.start_time)} – {formatTime(detailSession.end_time)} ({detailSession.duration_minutes} min)
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Type, semestre & capacité</Typography>
                    <Typography fontWeight="bold">{EXAM_TYPE_LABELS[detailSession.type] ?? detailSession.type}</Typography>
                    <Typography>
                      {detailSession.semester?.name ?? 'Semestre non défini'} — {detailSession.total_capacity} places
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Matériel autorisé</Typography>
                    <Typography>
                      {detailSession.allowed_materials && detailSession.allowed_materials.length > 0
                        ? detailSession.allowed_materials.join(', ')
                        : 'Aucun'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Consignes</Typography>
                    <Typography>{detailSession.instructions || 'Aucune'}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Organisation</Typography>
                    <Typography>
                      {detailSession.room_assignments_count ?? 0} salle(s), {detailSession.supervisors_count ?? 0} surveillant(s),
                      {' '}{detailSession.attendance_sheets_count ?? 0} élève(s) placé(s), {detailSession.incidents_count ?? 0} incident(s)
                    </Typography>
                  </Paper>
                </Grid>
                {detailSession.status === 'cancelled' && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">
                      Session annulée{detailSession.cancellation_reason ? ` : ${detailSession.cancellation_reason}` : '.'}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailSession(null)}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Annulation */}
      <Dialog open={!!cancelSession} onClose={() => setCancelSession(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Annuler « {cancelSession?.title} »</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Motif de l'annulation"
            value={cancelReason}
            onChange={event => setCancelReason(event.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelSession(null)}>Retour</Button>
          <Button color="error" variant="contained" onClick={handleConfirmCancel} disabled={cancelMutation.isPending}>
            Annuler la session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Création des compositions (notes lycée) */}
      <Dialog open={!!gradesSession} onClose={() => setGradesSession(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer les notes de « {gradesSession?.title} »</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            Une évaluation de type composition (brouillon) est créée par classe concernée. Les élèves notés absents
            à l&apos;épreuve sont pré-saisis « absent ». Les notes se saisissent ensuite dans Notes › Évaluations.
          </Alert>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label="Semestre"
                value={gradesForm.semester_id}
                onChange={event => setGradesForm(prev => ({ ...prev, semester_id: event.target.value }))}
                helperText="Automatique : semestre de la session ou contenant sa date"
              >
                <MenuItem value="">Automatique</MenuItem>
                {(options?.semesters ?? []).map(semester => (
                  <MenuItem key={semester.id} value={String(semester.id)}>{semester.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Barème"
                value={gradesForm.max_score}
                onChange={event => setGradesForm(prev => ({ ...prev, max_score: event.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Poids"
                value={gradesForm.weight}
                onChange={event => setGradesForm(prev => ({ ...prev, weight: event.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradesSession(null)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateEvaluations} disabled={evaluationsMutation.isPending}>
            Créer les évaluations
          </Button>
        </DialogActions>
      </Dialog>

      <ExamSessionFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={message => notify(message, 'success')}
        options={options}
        tenantId={tenant}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
