'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';

import { JuryDecisionForm } from './JuryDecisionForm';
import { useDeliberationSession } from '../hooks/useDeliberation';

import type { PendingStudent, JuryDecision } from '../../types/deliberation.types';

interface DeliberationSessionViewProps {
  sessionId: number;
  onBack: () => void;
}

const decisionColorMap: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  admitted: 'success',
  admitted_with_compensation: 'warning',
  deferred: 'info',
  retake: 'warning',
  excluded: 'error',
};

const decisionLabelMap: Record<string, string> = {
  admitted: 'Admis',
  admitted_with_compensation: 'Admis (comp.)',
  deferred: 'Ajourné',
  retake: 'Rattrapage',
  excluded: 'Exclu',
};

export const DeliberationSessionView: React.FC<DeliberationSessionViewProps> = ({
  sessionId,
  onBack,
}) => {
  const [tab, setTab] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<PendingStudent | null>(null);

  const {
    session,
    pendingStudents,
    deliberatedStudents,
    loading,
    actionLoading,
    error,
    startSession,
    completeSession,
    cancelSession,
    makeDecision,
    dismissMessage,
  } = useDeliberationSession(sessionId);

  if (loading) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  if (!session) {
    return (
      <Alert severity="error">
        Session introuvable.
        <Button onClick={onBack} sx={{ ml: 2 }}>Retour</Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Session header */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={2}>
              <Button size="small" onClick={onBack} startIcon={<i className="ri-arrow-left-line" />}>
                Retour
              </Button>
              <Typography variant="h6">
                Session de délibération #{session.id}
              </Typography>
              <Chip
                label={session.status_label || session.status}
                size="small"
                color={
                  session.status === 'completed' ? 'success' :
                  session.status === 'in_progress' ? 'info' :
                  session.status === 'cancelled' ? 'error' : 'default'
                }
              />
            </Box>
          }
          action={
            <Box display="flex" gap={1}>
              {session.status === 'planned' && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={startSession}
                  disabled={actionLoading}
                  startIcon={actionLoading ? <CircularProgress size={16} /> : <i className="ri-play-line" />}
                >
                  Démarrer
                </Button>
              )}
              {session.status === 'in_progress' && (
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={completeSession}
                  disabled={actionLoading || pendingStudents.length > 0}
                  startIcon={actionLoading ? <CircularProgress size={16} /> : <i className="ri-check-line" />}
                >
                  Terminer
                </Button>
              )}
              {(session.status === 'planned' || session.status === 'in_progress') && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={cancelSession}
                  disabled={actionLoading}
                >
                  Annuler
                </Button>
              )}
            </Box>
          }
        />
        <CardContent>
          <Box display="flex" gap={3} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">Progression</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" fontWeight={500}>
                  {session.deliberated_count}/{session.total_students}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={session.progress_percentage}
                  sx={{ width: 100, height: 6, borderRadius: 3 }}
                />
              </Box>
            </Box>
            {session.location && (
              <Box>
                <Typography variant="caption" color="text.secondary">Lieu</Typography>
                <Typography variant="body2">{session.location}</Typography>
              </Box>
            )}
            {session.scheduled_at && (
              <Box>
                <Typography variant="caption" color="text.secondary">Date</Typography>
                <Typography variant="body2">
                  {new Date(session.scheduled_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={dismissMessage}>{error.message}</Alert>
      )}

      {/* Tabs */}
      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`En attente (${pendingStudents.length})`} />
          <Tab label={`Délibérés (${deliberatedStudents.length})`} />
        </Tabs>
        <Divider />
        <CardContent>
          {tab === 0 && (
            <>
              {/* Decision form for selected student */}
              {selectedStudent && session.status === 'in_progress' && (
                <Box mb={2}>
                  <JuryDecisionForm
                    student={selectedStudent}
                    onSubmit={async (req) => {
                      const success = await makeDecision(req);

                      if (success) setSelectedStudent(null);

                      return success;
                    }}
                    onCancel={() => setSelectedStudent(null)}
                  />
                </Box>
              )}

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Étudiant</TableCell>
                      <TableCell align="center">Moyenne</TableCell>
                      <TableCell align="center">Rang</TableCell>
                      <TableCell align="center">Statut</TableCell>
                      <TableCell align="center">Suggestion</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingStudents.map((s) => (
                      <TableRow key={s.student_id} hover selected={selectedStudent?.student_id === s.student_id}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">{s.student.matricule}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {s.student.full_name || `${s.student.firstname} ${s.student.lastname}`}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {s.semester_average !== null ? (
                            <Typography variant="body2" fontWeight={600} color={s.semester_average >= 10 ? 'success.main' : 'error.main'}>
                              {s.semester_average.toFixed(2)}
                            </Typography>
                          ) : '-'}
                        </TableCell>
                        <TableCell align="center">{s.semester_rank || '-'}</TableCell>
                        <TableCell align="center">
                          <Chip label={s.global_status} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="center">
                          {s.suggested_decision ? (
                            <Chip
                              label={decisionLabelMap[s.suggested_decision] || s.suggested_decision}
                              size="small"
                              color={decisionColorMap[s.suggested_decision] || 'default'}
                              variant="outlined"
                            />
                          ) : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {session.status === 'in_progress' && (
                            <Button
                              size="small"
                              variant={selectedStudent?.student_id === s.student_id ? 'contained' : 'outlined'}
                              onClick={() => setSelectedStudent(selectedStudent?.student_id === s.student_id ? null : s)}
                            >
                              Délibérer
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {pendingStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary" py={2}>Aucun étudiant en attente.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {tab === 1 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Étudiant</TableCell>
                    <TableCell align="center">Moyenne</TableCell>
                    <TableCell align="center">Décision</TableCell>
                    <TableCell>Justification</TableCell>
                    <TableCell align="center">Exceptionnel</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliberatedStudents.map((d: JuryDecision) => (
                    <TableRow key={d.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">{d.student?.matricule || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {d.student?.full_name || `${d.student?.firstname || ''} ${d.student?.lastname || ''}`}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {d.semester_average !== null && d.semester_average !== undefined ? (
                          <Typography variant="body2" fontWeight={600} color={d.semester_average >= 10 ? 'success.main' : 'error.main'}>
                            {d.semester_average.toFixed(2)}
                          </Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={d.decision_label || decisionLabelMap[d.decision] || d.decision}
                          size="small"
                          color={decisionColorMap[d.decision] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {d.justification || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {d.is_exceptional && (
                          <Chip
                            label={d.review_status === 'approved' ? 'Approuvé' : d.review_status === 'rejected' ? 'Rejeté' : 'En révision'}
                            size="small"
                            color={d.review_status === 'approved' ? 'success' : d.review_status === 'rejected' ? 'error' : 'warning'}
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {deliberatedStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" py={2}>Aucun étudiant délibéré.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
