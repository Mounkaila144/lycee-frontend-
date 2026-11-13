'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useFeedback } from '../hooks/useFeedback';
import { useReferenceData } from '../hooks/useReferenceData';
import { extractErrorMessage, lyceeGradesService } from '../services/lyceeGradesService';
import type { ClassEvaluation, TeacherAssignment } from '../types';
import { EVALUATION_STATUS_COLORS, EVALUATION_STATUS_LABELS, EVALUATION_TYPE_LABELS, formatScore } from '../types';
import EvaluationFormDialog from './EvaluationFormDialog';
import SubjectAppreciationsDialog from './SubjectAppreciationsDialog';

/**
 * Espace Professeur — `/admin/teacher/grades`.
 * Mes affectations (classe × matière) → mes évaluations du semestre → saisie des notes.
 */
export default function TeacherGrades() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const { semesters, defaultSemesterId, loading: refLoading } = useReferenceData({ withClasses: false });
  const { notify, feedbackElement } = useFeedback();

  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [semesterId, setSemesterId] = useState<number | ''>('');
  const [evaluations, setEvaluations] = useState<ClassEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClassEvaluation | null>(null);
  const [appreciationsOpen, setAppreciationsOpen] = useState(false);

  useEffect(() => {
    lyceeGradesService
      .getMyAssignments()
      .then((list) => {
        setAssignments(list);
        setSelectedId((current) => current ?? list[0]?.id ?? null);
      })
      .catch(async (err) => setAssignmentsError(await extractErrorMessage(err, 'Impossible de charger vos affectations.')))
      .finally(() => setAssignmentsLoading(false));
  }, []);

  useEffect(() => {
    if (semesterId === '' && defaultSemesterId) {
      setSemesterId(defaultSemesterId);
    }
  }, [defaultSemesterId, semesterId]);

  const selected = useMemo(() => assignments.find((assignment) => assignment.id === selectedId) ?? null, [assignments, selectedId]);
  const selectedSemester = semesters.find((semester) => semester.id === semesterId);
  const semesterClosed = Boolean(selectedSemester?.closed_at);

  const loadEvaluations = useCallback(async () => {
    if (!selected || !semesterId) {
      setEvaluations([]);

      return;
    }

    setLoading(true);

    try {
      setEvaluations(
        await lyceeGradesService.getEvaluations({
          classe_id: selected.classe.id,
          subject_id: selected.subject.id,
          semester_id: semesterId,
        }),
      );
    } catch (err) {
      setEvaluations([]);
      notify(await extractErrorMessage(err, 'Impossible de charger les évaluations.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [selected, semesterId, notify]);

  useEffect(() => {
    loadEvaluations();
  }, [loadEvaluations]);

  const runAction = async (action: () => Promise<unknown>, success: string, failure: string) => {
    setBusy(true);

    try {
      await action();
      notify(success);
      await loadEvaluations();
    } catch (err) {
      notify(await extractErrorMessage(err, failure), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = (evaluation: ClassEvaluation) => {
    if (!window.confirm(`Supprimer « ${evaluation.title} » et toutes ses notes ?`)) {
      return;
    }

    runAction(() => lyceeGradesService.deleteEvaluation(evaluation.id), 'Évaluation supprimée.', 'Échec de la suppression.');
  };

  if (refLoading || assignmentsLoading) {
    return (
      <Box display='flex' justifyContent='center' p={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Saisie des notes</Typography>
        <Typography color='text.secondary'>
          Créez vos évaluations, saisissez les notes puis soumettez-les : la direction les publie pour les élèves et les
          parents.
        </Typography>
      </Grid>

      {assignmentsError && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error'>{assignmentsError}</Alert>
        </Grid>
      )}

      {!assignmentsError && assignments.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='info'>
            Aucune matière ne vous est affectée pour l&apos;année en cours. La direction doit vous affecter à une classe et
            une matière (menu Notes › Affectations).
          </Alert>
        </Grid>
      )}

      {assignments.length > 0 && (
        <>
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={4}>
              {assignments.map((assignment) => (
                <Grid key={assignment.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card
                    variant='outlined'
                    sx={{ borderColor: assignment.id === selectedId ? 'primary.main' : undefined, borderWidth: assignment.id === selectedId ? 2 : 1 }}
                  >
                    <CardActionArea onClick={() => setSelectedId(assignment.id)}>
                      <CardContent>
                        <Typography variant='h6'>{assignment.classe.name}</Typography>
                        <Typography color='text.secondary'>{assignment.subject.name}</Typography>
                        <Box display='flex' gap={1} mt={2} flexWrap='wrap'>
                          {assignment.students_count !== undefined && (
                            <Chip size='small' variant='tonal' color='primary' label={`${assignment.students_count} élève(s)`} />
                          )}
                          {assignment.coefficient !== undefined && assignment.coefficient !== null && (
                            <Chip size='small' variant='tonal' label={`Coef. ${formatScore(assignment.coefficient, 0)}`} />
                          )}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {selected && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader
                  title={`${selected.classe.name} — ${selected.subject.name}`}
                  subheader='Mes évaluations'
                  action={
                    <Box display='flex' gap={2} flexWrap='wrap' alignItems='center'>
                      <TextField
                        select
                        size='small'
                        label='Semestre'
                        value={semesterId}
                        onChange={(event) => setSemesterId(Number(event.target.value))}
                        sx={{ minWidth: 140 }}
                      >
                        {semesters.map((semester) => (
                          <MenuItem key={semester.id} value={semester.id}>
                            {semester.name}
                            {semester.closed_at ? ' (clôturé)' : semester.is_active ? ' (actif)' : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Button variant='outlined' disabled={!semesterId} onClick={() => setAppreciationsOpen(true)}>
                        Appréciations
                      </Button>
                      <Button
                        variant='contained'
                        disabled={!semesterId || semesterClosed}
                        onClick={() => {
                          setEditing(null);
                          setFormOpen(true);
                        }}
                      >
                        Nouvelle évaluation
                      </Button>
                    </Box>
                  }
                />
                <CardContent>
                  {semesterClosed && (
                    <Alert severity='warning' sx={{ mb: 4 }}>
                      Ce semestre est clôturé : création d&apos;évaluations impossible.
                    </Alert>
                  )}
                  {loading ? (
                    <Box display='flex' justifyContent='center' p={4}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : evaluations.length === 0 ? (
                    <Alert severity='info'>Aucune évaluation pour ce semestre.</Alert>
                  ) : (
                    <TableContainer>
                      <Table size='small'>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Évaluation</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align='center'>Barème</TableCell>
                            <TableCell align='center'>Coef.</TableCell>
                            <TableCell align='center'>Notes</TableCell>
                            <TableCell align='center'>Moy.</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell align='right'>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {evaluations.map((evaluation) => {
                            const isPublished = evaluation.status === 'published';

                            return (
                              <TableRow key={evaluation.id} hover>
                                <TableCell>{new Date(evaluation.evaluation_date).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell>
                                  <Typography fontWeight={500}>{evaluation.title}</Typography>
                                </TableCell>
                                <TableCell>{EVALUATION_TYPE_LABELS[evaluation.type] ?? evaluation.type}</TableCell>
                                <TableCell align='center'>/{formatScore(evaluation.max_score, 0)}</TableCell>
                                <TableCell align='center'>{formatScore(evaluation.weight, 1)}</TableCell>
                                <TableCell align='center'>
                                  {evaluation.grades_count}/{evaluation.students_count}
                                </TableCell>
                                <TableCell align='center'>{formatScore(evaluation.average)}</TableCell>
                                <TableCell>
                                  <Chip
                                    size='small'
                                    variant='tonal'
                                    color={EVALUATION_STATUS_COLORS[evaluation.status]}
                                    label={EVALUATION_STATUS_LABELS[evaluation.status] ?? evaluation.status}
                                  />
                                </TableCell>
                                <TableCell align='right'>
                                  <Box display='flex' gap={1} justifyContent='flex-end' flexWrap='wrap'>
                                    <Button
                                      size='small'
                                      variant='contained'
                                      component={Link}
                                      href={`/${lang}/admin/teacher/grades/${evaluation.id}`}
                                    >
                                      {isPublished ? 'Voir' : 'Saisir'}
                                    </Button>
                                    {evaluation.status === 'draft' && (
                                      <Button
                                        size='small'
                                        color='warning'
                                        disabled={busy}
                                        onClick={() =>
                                          runAction(
                                            () => lyceeGradesService.submitEvaluation(evaluation.id),
                                            'Évaluation soumise.',
                                            'Échec de la soumission.',
                                          )
                                        }
                                      >
                                        Soumettre
                                      </Button>
                                    )}
                                    {evaluation.status === 'submitted' && (
                                      <Button
                                        size='small'
                                        disabled={busy}
                                        onClick={() =>
                                          runAction(
                                            () => lyceeGradesService.reopenEvaluation(evaluation.id),
                                            'Évaluation rouverte.',
                                            'Échec de la réouverture.',
                                          )
                                        }
                                      >
                                        Rouvrir
                                      </Button>
                                    )}
                                    {!isPublished && (
                                      <>
                                        <Button
                                          size='small'
                                          disabled={busy}
                                          onClick={() => {
                                            setEditing(evaluation);
                                            setFormOpen(true);
                                          }}
                                        >
                                          Modifier
                                        </Button>
                                        <Button size='small' color='error' disabled={busy} onClick={() => handleDelete(evaluation)}>
                                          Supprimer
                                        </Button>
                                      </>
                                    )}
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </>
      )}

      {selected && (
        <EvaluationFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSaved={(saved) => {
            setFormOpen(false);
            notify(editing ? 'Évaluation modifiée.' : 'Évaluation créée.');
            loadEvaluations();

            if (!editing && saved?.id) {
              router.push(`/${lang}/admin/teacher/grades/${saved.id}`);
            }
          }}
          classeId={selected.classe.id}
          subjectId={selected.subject.id}
          semesters={semesters}
          defaultSemesterId={semesterId || defaultSemesterId}
          evaluation={editing}
        />
      )}

      {selected && semesterId && (
        <SubjectAppreciationsDialog
          open={appreciationsOpen}
          onClose={() => setAppreciationsOpen(false)}
          onSaved={(count) => notify(`${count} appréciation(s) enregistrée(s).`)}
          classeId={selected.classe.id}
          subjectId={selected.subject.id}
          semesterId={semesterId}
          title={`${selected.classe.name} — ${selected.subject.name}${selectedSemester ? ` (${selectedSemester.name})` : ''}`}
        />
      )}
      {feedbackElement}
    </Grid>
  );
}
