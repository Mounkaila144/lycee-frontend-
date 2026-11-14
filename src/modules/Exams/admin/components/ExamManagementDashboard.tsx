'use client';

import React, { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useTenant } from '@/shared/lib/tenant-context';
import { useCurrentUser } from '@/modules/Grades/lycee/hooks/useCurrentUser';

import {
  apiErrorMessage,
  formatDate,
  formatTime,
  personName,
  sessionTargetLabel,
} from '../../types';
import {
  useAssignRoom,
  useAssignStudents,
  useAutoAssignStudents,
  useAvailableRooms,
  useEligibleStudents,
  useExamSession,
  usePreparationChecklist,
  useReassignExamStudent,
  useRemoveExamStudent,
  useRemoveRoom,
  useUpdateExamInstructions,
  useUpdateExamMaterials,
} from '../hooks';
import { ExamSessionPicker } from './ExamSessionPicker';

/**
 * Gestion des épreuves : salles de la session, placement des élèves éligibles
 * (inscrits actifs des classes concernées) et préparation (matériel, consignes).
 */
export const ExamManagementDashboard: React.FC = () => {
  const { tenantId } = useTenant();
  const tenant = tenantId || undefined;
  const { user } = useCurrentUser();
  const canManage = user.isManager;

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [tab, setTab] = useState(0);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [roomToAdd, setRoomToAdd] = useState('');
  const [materials, setMaterials] = useState('');
  const [instructions, setInstructions] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data: session, isLoading: sessionLoading } = useExamSession(sessionId ?? undefined, tenant);
  const { data: eligible = [], isLoading: eligibleLoading } = useEligibleStudents(sessionId ?? undefined, tenant);
  const { data: checklist } = usePreparationChecklist(sessionId ?? undefined, tenant);

  const roomParams = session
    ? { date: session.exam_date.substring(0, 10), start_time: formatTime(session.start_time), end_time: formatTime(session.end_time) }
    : undefined;

  const { data: availableRooms = [] } = useAvailableRooms(canManage ? roomParams : undefined, tenant);

  const assignRoomMutation = useAssignRoom(tenant);
  const removeRoomMutation = useRemoveRoom(tenant);
  const assignStudentsMutation = useAssignStudents(tenant);
  const autoAssignMutation = useAutoAssignStudents(tenant);
  const removeStudentMutation = useRemoveExamStudent(tenant);
  const reassignMutation = useReassignExamStudent(tenant);
  const materialsMutation = useUpdateExamMaterials(tenant);
  const instructionsMutation = useUpdateExamInstructions(tenant);

  const notify = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  useEffect(() => {
    setSelectedStudentIds([]);
    setMaterials(session?.allowed_materials?.join(', ') ?? '');
    setInstructions(session?.instructions ?? '');
  }, [session?.id, session?.allowed_materials, session?.instructions]);

  const rooms = session?.room_assignments ?? [];
  const sheets = session?.attendance_sheets ?? [];
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const placed = sheets.length;

  const handleAddRoom = () => {
    if (!sessionId || !roomToAdd) {
      return;
    }

    assignRoomMutation.mutate({ sessionId, data: { rooms: [{ room_id: Number(roomToAdd) }] } }, {
      onSuccess: () => { notify('Salle affectée.', 'success'); setRoomToAdd(''); },
      onError: error => notify(apiErrorMessage(error, 'Affectation de la salle impossible'), 'error'),
    });
  };

  const handleRemoveRoom = (roomAssignmentId: number) => {
    if (!sessionId || !window.confirm('Retirer cette salle ? Les élèves qui y sont placés seront retirés de la session.')) {
      return;
    }

    removeRoomMutation.mutate({ sessionId, roomAssignmentId }, {
      onSuccess: () => notify('Salle retirée.', 'success'),
      onError: error => notify(apiErrorMessage(error, 'Retrait impossible'), 'error'),
    });
  };

  const handleAssignSelected = () => {
    if (!sessionId || selectedStudentIds.length === 0) {
      return;
    }

    assignStudentsMutation.mutate({ sessionId, data: { student_ids: selectedStudentIds } }, {
      onSuccess: created => { notify(`${created.length} élève(s) placé(s).`, 'success'); setSelectedStudentIds([]); },
      onError: error => notify(apiErrorMessage(error, 'Placement impossible'), 'error'),
    });
  };

  const handleAutoAssign = () => {
    if (!sessionId) {
      return;
    }

    autoAssignMutation.mutate(sessionId, {
      onSuccess: created => notify(`${created.length} élève(s) placé(s) automatiquement.`, 'success'),
      onError: error => notify(apiErrorMessage(error, 'Placement automatique impossible'), 'error'),
    });
  };

  const handleRemoveStudent = (sheetId: number) => {
    removeStudentMutation.mutate(sheetId, {
      onSuccess: () => notify('Élève retiré de la session.', 'success'),
      onError: error => notify(apiErrorMessage(error, 'Retrait impossible'), 'error'),
    });
  };

  const handleReassign = (sheetId: number, roomAssignmentId: number) => {
    reassignMutation.mutate({ sheetId, data: { room_assignment_id: roomAssignmentId } }, {
      onSuccess: () => notify('Élève déplacé.', 'success'),
      onError: error => notify(apiErrorMessage(error, 'Déplacement impossible'), 'error'),
    });
  };

  const handleSavePreparation = () => {
    if (!sessionId) {
      return;
    }

    const materialList = materials.split(',').map(item => item.trim()).filter(Boolean);
    const onError = (fallback: string) => (error: unknown) => notify(apiErrorMessage(error, fallback), 'error');

    if (materialList.length === 0 && !instructions.trim()) {
      notify('Rien à enregistrer.', 'error');

      return;
    }

    if (materialList.length > 0) {
      materialsMutation.mutate({ sessionId, materials: materialList }, {
        onSuccess: () => notify('Préparation enregistrée.', 'success'),
        onError: onError('Enregistrement du matériel impossible'),
      });
    }

    if (instructions.trim()) {
      instructionsMutation.mutate({ sessionId, data: { instructions: instructions.trim() } }, {
        onSuccess: () => notify('Préparation enregistrée.', 'success'),
        onError: onError('Enregistrement des consignes impossible'),
      });
    }
  };

  const toggleStudent = (studentId: number) => {
    setSelectedStudentIds(prev => (prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Typography color="inherit">Examens</Typography>
        <Typography color="text.primary">Gestion des épreuves</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Gestion des épreuves</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <ExamSessionPicker value={sessionId} onChange={setSessionId} tenantId={tenant} />
          {session && (
            <Typography variant="body2" color="text.secondary">
              {sessionTargetLabel(session)} — {session.subject?.name ?? session.module?.name ?? ''} — {formatDate(session.exam_date)}
              {' '}{formatTime(session.start_time)}–{formatTime(session.end_time)}
            </Typography>
          )}
        </CardContent>
      </Card>

      {sessionLoading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}

      {session && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Salles', value: rooms.length },
              { label: 'Capacité', value: totalCapacity },
              { label: 'Élèves placés', value: placed },
              { label: 'Éligibles restants', value: eligible.length },
            ].map(stat => (
              <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card>
            <Tabs value={tab} onChange={(_, value: number) => setTab(value)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tab label="Salles" />
              <Tab label={`Élèves (${placed})`} />
              <Tab label="Préparation" />
            </Tabs>
            <CardContent>
              {tab === 0 && (
                <>
                  {canManage && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <TextField
                        select
                        size="small"
                        label="Salle libre sur le créneau"
                        value={roomToAdd}
                        onChange={event => setRoomToAdd(event.target.value)}
                        sx={{ minWidth: 260 }}
                        helperText={availableRooms.length === 0 ? 'Aucune salle libre (Emploi du temps › Salles)' : ' '}
                      >
                        {availableRooms.map(room => (
                          <MenuItem key={room.id} value={String(room.id)}>{room.name} ({room.capacity} places)</MenuItem>
                        ))}
                      </TextField>
                      <Button variant="contained" onClick={handleAddRoom} disabled={!roomToAdd || assignRoomMutation.isPending} sx={{ alignSelf: 'flex-start' }}>
                        Affecter la salle
                      </Button>
                    </Box>
                  )}
                  {rooms.length === 0 ? (
                    <Alert severity="info">Aucune salle affectée à cette session.</Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Salle</TableCell>
                            <TableCell>Places</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Remplissage</TableCell>
                            {canManage && <TableCell align="right">Actions</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rooms.map(room => (
                            <TableRow key={room.id}>
                              <TableCell>{room.room?.name ?? `Salle #${room.room_id}`}</TableCell>
                              <TableCell>{room.assigned_students} / {room.capacity}</TableCell>
                              <TableCell>
                                <LinearProgress
                                  variant="determinate"
                                  value={room.capacity > 0 ? Math.min(100, (room.assigned_students / room.capacity) * 100) : 0}
                                />
                              </TableCell>
                              {canManage && (
                                <TableCell align="right">
                                  <Button size="small" color="error" onClick={() => handleRemoveRoom(room.id)}>Retirer</Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}

              {tab === 1 && (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        Élèves éligibles ({eligible.length})
                      </Typography>
                      {canManage && (
                        <>
                          <Button size="small" variant="outlined" onClick={handleAssignSelected} disabled={selectedStudentIds.length === 0 || assignStudentsMutation.isPending}>
                            Placer la sélection ({selectedStudentIds.length})
                          </Button>
                          <Button size="small" variant="contained" onClick={handleAutoAssign} disabled={eligible.length === 0 || autoAssignMutation.isPending}>
                            Tout placer
                          </Button>
                        </>
                      )}
                    </Box>
                    {rooms.length === 0 && (
                      <Alert severity="warning" sx={{ mb: 1 }}>Affectez d&apos;abord au moins une salle.</Alert>
                    )}
                    {eligibleLoading && <LinearProgress />}
                    {!eligibleLoading && eligible.length === 0 && (
                      <Alert severity="info">Aucun élève éligible restant (inscrits actifs de la classe ou du niveau).</Alert>
                    )}
                    {eligible.length > 0 && (
                      <TableContainer sx={{ maxHeight: 480 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {canManage && (
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    size="small"
                                    checked={selectedStudentIds.length === eligible.length}
                                    indeterminate={selectedStudentIds.length > 0 && selectedStudentIds.length < eligible.length}
                                    onChange={event => setSelectedStudentIds(event.target.checked ? eligible.map(student => student.id) : [])}
                                  />
                                </TableCell>
                              )}
                              <TableCell>Élève</TableCell>
                              <TableCell>Classe</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {eligible.map(student => (
                              <TableRow key={student.id} hover>
                                {canManage && (
                                  <TableCell padding="checkbox">
                                    <Checkbox size="small" checked={selectedStudentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} />
                                  </TableCell>
                                )}
                                <TableCell>
                                  {personName(student)}
                                  {student.matricule && (
                                    <Typography variant="caption" display="block" color="text.secondary">{student.matricule}</Typography>
                                  )}
                                </TableCell>
                                <TableCell>{student.classe_name ?? '—'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Élèves placés ({placed})</Typography>
                    {sheets.length === 0 ? (
                      <Alert severity="info">Aucun élève placé.</Alert>
                    ) : (
                      <TableContainer sx={{ maxHeight: 480 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Élève</TableCell>
                              <TableCell>Salle</TableCell>
                              <TableCell>Place</TableCell>
                              {canManage && <TableCell align="right">Actions</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sheets.map(sheet => (
                              <TableRow key={sheet.id} hover>
                                <TableCell>
                                  {personName(sheet.student)}
                                  {sheet.student?.matricule && (
                                    <Typography variant="caption" display="block" color="text.secondary">{sheet.student.matricule}</Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {canManage && rooms.length > 1 ? (
                                    <TextField
                                      select
                                      size="small"
                                      variant="standard"
                                      value={sheet.exam_room_assignment_id ?? ''}
                                      onChange={event => handleReassign(sheet.id, Number(event.target.value))}
                                    >
                                      {rooms.map(room => (
                                        <MenuItem key={room.id} value={room.id}>{room.room?.name ?? `Salle #${room.room_id}`}</MenuItem>
                                      ))}
                                    </TextField>
                                  ) : (
                                    sheet.room_assignment?.room?.name ?? '—'
                                  )}
                                </TableCell>
                                <TableCell>{sheet.seat_number ?? '—'}</TableCell>
                                {canManage && (
                                  <TableCell align="right">
                                    <Button size="small" color="error" onClick={() => handleRemoveStudent(sheet.id)}>Retirer</Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Grid>
                </Grid>
              )}

              {tab === 2 && (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Matériel et consignes</Typography>
                    <TextField
                      fullWidth
                      label="Matériel autorisé"
                      helperText="Séparer par des virgules"
                      value={materials}
                      onChange={event => setMaterials(event.target.value)}
                      disabled={!canManage}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Consignes"
                      value={instructions}
                      onChange={event => setInstructions(event.target.value)}
                      disabled={!canManage}
                    />
                    {canManage && (
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={handleSavePreparation}
                        disabled={materialsMutation.isPending || instructionsMutation.isPending}
                      >
                        Enregistrer
                      </Button>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Récapitulatif</Typography>
                    {checklist ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography>Élèves placés : <strong>{checklist.students_count}</strong></Typography>
                        <Typography>
                          Surveillants nécessaires (1 pour 30 élèves) : <strong>{checklist.supervisors_needed}</strong>
                          {' '}— affectés : <strong>{session.supervisors?.length ?? 0}</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {checklist.rooms.map(room => (
                            <Chip key={room.room} label={`${room.room} : ${room.assigned}/${room.capacity}`} variant="outlined" />
                          ))}
                        </Box>
                        <Chip
                          sx={{ alignSelf: 'flex-start' }}
                          color={checklist.checklist_items['Supervisors confirmed'] ? 'success' : 'default'}
                          label={checklist.checklist_items['Supervisors confirmed'] ? 'Surveillants confirmés' : 'Surveillants non confirmés'}
                        />
                      </Box>
                    ) : (
                      <LinearProgress />
                    )}
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
