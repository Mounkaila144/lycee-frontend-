'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useCurrentUser } from '../hooks/useCurrentUser';
import { useFeedback } from '../hooks/useFeedback';
import { extractErrorMessage, lyceeGradesService } from '../services/lyceeGradesService';
import type { ClassEvaluationDetail, GradeEntryPayload } from '../types';
import { EVALUATION_STATUS_COLORS, EVALUATION_STATUS_LABELS, EVALUATION_TYPE_LABELS, formatScore, toScore } from '../types';

interface RowState {
  studentId: number;
  matricule: string;
  fullName: string;
  score: string;
  isAbsent: boolean;
  comment: string;
}

const scoreToInput = (value: number | null): string => (value === null ? '' : String(value).replace('.', ','));

const parseInput = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.');

  if (normalized === '') {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : NaN;
};

const toRows = (evaluation: ClassEvaluationDetail): RowState[] =>
  (evaluation.grades ?? []).map((grade) => ({
    studentId: grade.student.id,
    matricule: grade.student.matricule ?? '',
    fullName: grade.student.full_name,
    score: scoreToInput(toScore(grade.score)),
    isAbsent: Boolean(grade.is_absent),
    comment: grade.comment ?? '',
  }));

const serialize = (rows: RowState[]): string =>
  JSON.stringify(rows.map((row) => [row.studentId, row.score.trim(), row.isAbsent, row.comment.trim()]));

/**
 * Grille de saisie des notes d'une évaluation — `/admin/teacher/grades/[evaluationId]`.
 * Élèves en lignes : note, absent, commentaire. Enregistrer, soumettre / rouvrir ;
 * Administrator : publier / dépublier et modifier une évaluation publiée (Manager : consultation et saisie hors publication).
 */
export default function EvaluationGradeEntry({ evaluationId }: { evaluationId: number }) {
  const { lang } = useParams<{ lang: string }>();
  const { user } = useCurrentUser();
  const { notify, feedbackElement } = useFeedback();

  const [evaluation, setEvaluation] = useState<ClassEvaluationDetail | null>(null);
  const [rows, setRows] = useState<RowState[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyEvaluation = useCallback((detail: ClassEvaluationDetail) => {
    const nextRows = toRows(detail);

    setEvaluation(detail);
    setRows(nextRows);
    setSavedSnapshot(serialize(nextRows));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      applyEvaluation(await lyceeGradesService.getEvaluation(evaluationId));
    } catch (err) {
      setError(await extractErrorMessage(err, "Impossible de charger l'évaluation."));
    } finally {
      setLoading(false);
    }
  }, [evaluationId, applyEvaluation]);

  useEffect(() => {
    load();
  }, [load]);

  const maxScore = toScore(evaluation?.max_score) ?? 20;
  const isPublished = evaluation?.status === 'published';
  const locked = isPublished && !user.canPublish;
  const isDirty = serialize(rows) !== savedSnapshot;

  /** Au moins une note ou absence saisie (y compris non encore enregistrée : la publication enregistre d'abord). */
  const hasEnteredGrades = rows.some((row) => row.isAbsent || row.score.trim() !== '');

  const rowErrors = useMemo(
    () =>
      rows.map((row) => {
        if (row.isAbsent) {
          return null;
        }

        const value = parseInput(row.score);

        if (value === null) {
          return null;
        }

        if (Number.isNaN(value)) {
          return 'Note invalide';
        }

        return value < 0 || value > maxScore ? `Entre 0 et ${maxScore}` : null;
      }),
    [rows, maxScore],
  );

  const hasErrors = rowErrors.some((rowError) => rowError !== null);

  const liveStats = useMemo(() => {
    const scores = rows
      .filter((row, index) => !row.isAbsent && rowErrors[index] === null)
      .map((row) => parseInput(row.score))
      .filter((value): value is number => value !== null && !Number.isNaN(value));

    if (scores.length === 0) {
      return { count: 0, average: null, highest: null, lowest: null };
    }

    return {
      count: scores.length,
      average: scores.reduce((sum, value) => sum + value, 0) / scores.length,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
    };
  }, [rows, rowErrors]);

  const absentCount = rows.filter((row) => row.isAbsent).length;

  const updateRow = (index: number, patch: Partial<RowState>) =>
    setRows((previous) => previous.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));

  const focusScore = (index: number) => {
    const next = document.getElementById(`grade-score-${index}`) as HTMLInputElement | null;

    next?.focus();
    next?.select();
  };

  const buildPayload = (): GradeEntryPayload[] =>
    rows.map((row) => {
      const value = parseInput(row.score);

      return {
        student_id: row.studentId,
        score: row.isAbsent || value === null || Number.isNaN(value) ? null : value,
        is_absent: row.isAbsent,
        comment: row.comment.trim() || null,
      };
    });

  const save = async (silent = false): Promise<boolean> => {
    if (hasErrors) {
      notify('Corrigez les notes invalides avant d’enregistrer.', 'error');

      return false;
    }

    setBusy(true);

    try {
      const updated = await lyceeGradesService.saveGrades(evaluationId, buildPayload());

      if (updated && Array.isArray(updated.grades)) {
        applyEvaluation(updated);
      } else {
        await load();
      }

      if (!silent) {
        notify('Notes enregistrées.');
      }

      return true;
    } catch (err) {
      notify(await extractErrorMessage(err, "Échec de l'enregistrement des notes."), 'error');

      return false;
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (action: 'submit' | 'reopen' | 'publish' | 'unpublish') => {
    if (action === 'submit' || action === 'publish') {
      const missing = rows.filter((row) => !row.isAbsent && row.score.trim() === '').length;

      if (missing > 0 && !window.confirm(`${missing} élève(s) sans note ni absence. Continuer ?`)) {
        return;
      }

      if (isDirty && !(await save(true))) {
        return;
      }
    }

    const labels = {
      submit: ['Évaluation soumise à la direction pour publication.', 'Échec de la soumission.'],
      reopen: ['Évaluation rouverte (brouillon).', 'Échec de la réouverture.'],
      publish: ['Évaluation publiée : visible des élèves et des parents.', 'Échec de la publication.'],
      unpublish: ['Évaluation dépubliée.', 'Échec de la dépublication.'],
    } as const;

    setBusy(true);

    try {
      const calls = {
        submit: lyceeGradesService.submitEvaluation,
        reopen: lyceeGradesService.reopenEvaluation,
        publish: lyceeGradesService.publishEvaluation,
        unpublish: lyceeGradesService.unpublishEvaluation,
      };

      await calls[action](evaluationId);
      notify(labels[action][0]);
      await load();
    } catch (err) {
      notify(await extractErrorMessage(err, labels[action][1]), 'error');
    } finally {
      setBusy(false);
    }
  };

  const backHref = user.isManager && !user.isTeacher ? `/${lang}/admin/grades/evaluations` : `/${lang}/admin/teacher/grades`;

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' p={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !evaluation) {
    return (
      <Box display='flex' flexDirection='column' gap={4}>
        <Alert severity='error'>{error ?? 'Évaluation introuvable.'}</Alert>
        <Box>
          <Button component={Link} href={backHref}>
            ← Retour
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Button component={Link} href={backHref} size='small' sx={{ mb: 2 }}>
          ← Retour aux évaluations
        </Button>
        <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
          <Typography variant='h4'>{evaluation.title}</Typography>
          <Chip
            variant='tonal'
            color={EVALUATION_STATUS_COLORS[evaluation.status]}
            label={EVALUATION_STATUS_LABELS[evaluation.status] ?? evaluation.status}
          />
        </Box>
        <Typography color='text.secondary'>
          {evaluation.classe?.name} · {evaluation.subject?.name} · {evaluation.semester?.name} ·{' '}
          {EVALUATION_TYPE_LABELS[evaluation.type] ?? evaluation.type} du{' '}
          {new Date(evaluation.evaluation_date).toLocaleDateString('fr-FR')} · noté sur {formatScore(maxScore, 0)} · coef.{' '}
          {formatScore(evaluation.weight, 1)}
          {evaluation.teacher ? ` · ${evaluation.teacher.full_name}` : ''}
        </Typography>
      </Grid>

      {locked && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='info'>
            Cette évaluation est publiée : la saisie est verrouillée. Contactez la direction pour toute correction.
          </Alert>
        </Grid>
      )}
      {isPublished && user.canPublish && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='warning'>
            Évaluation publiée : toute modification est immédiatement visible des élèves et des parents.
          </Alert>
        </Grid>
      )}
      {evaluation.status === 'submitted' && !user.canPublish && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='info'>Évaluation soumise : en attente de publication par l&apos;administrateur.</Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title={`${rows.length} élève(s)`}
            subheader={`Notés : ${liveStats.count} · Absents : ${absentCount} · Moyenne : ${formatScore(
              liveStats.average,
            )} · Max : ${formatScore(liveStats.highest)} · Min : ${formatScore(liveStats.lowest)}`}
            action={
              <Box display='flex' gap={2} flexWrap='wrap'>
                {!locked && (
                  <Button variant='contained' disabled={busy || !isDirty || hasErrors} onClick={() => save()}>
                    Enregistrer
                  </Button>
                )}
                {evaluation.status === 'draft' && (
                  <Button variant='outlined' color='warning' disabled={busy || hasErrors} onClick={() => changeStatus('submit')}>
                    Soumettre
                  </Button>
                )}
                {evaluation.status === 'submitted' && (
                  <Button variant='outlined' disabled={busy} onClick={() => changeStatus('reopen')}>
                    Rouvrir
                  </Button>
                )}
                {user.canPublish && evaluation.status !== 'published' && (
                  <Tooltip title={hasEnteredGrades ? '' : 'Aucune note saisie'}>
                    <span>
                      <Button
                        variant='contained'
                        color='success'
                        disabled={busy || hasErrors || !hasEnteredGrades}
                        onClick={() => changeStatus('publish')}
                      >
                        Publier
                      </Button>
                    </span>
                  </Tooltip>
                )}
                {user.canPublish && evaluation.status === 'published' && (
                  <Button variant='outlined' color='warning' disabled={busy} onClick={() => changeStatus('unpublish')}>
                    Dépublier
                  </Button>
                )}
              </Box>
            }
          />
          <CardContent>
            {rows.length === 0 ? (
              <Alert severity='info'>Aucun élève inscrit dans cette classe.</Alert>
            ) : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell width={40}>#</TableCell>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Élève</TableCell>
                      <TableCell width={150}>Note / {formatScore(maxScore, 0)}</TableCell>
                      <TableCell align='center' width={90}>
                        Absent
                      </TableCell>
                      <TableCell>Commentaire</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={row.studentId} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.matricule || '—'}</TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>{row.fullName}</Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            id={`grade-score-${index}`}
                            size='small'
                            value={row.isAbsent ? '' : row.score}
                            placeholder={row.isAbsent ? 'Abs.' : ''}
                            disabled={locked || row.isAbsent || busy}
                            error={rowErrors[index] !== null}
                            helperText={rowErrors[index] ?? undefined}
                            onChange={(event) => updateRow(index, { score: event.target.value })}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === 'ArrowDown') {
                                event.preventDefault();
                                focusScore(index + 1);
                              } else if (event.key === 'ArrowUp') {
                                event.preventDefault();
                                focusScore(index - 1);
                              }
                            }}
                            slotProps={{ htmlInput: { inputMode: 'decimal', style: { textAlign: 'right' } } }}
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <Checkbox
                            checked={row.isAbsent}
                            disabled={locked || busy}
                            onChange={(event) => updateRow(index, { isAbsent: event.target.checked })}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size='small'
                            value={row.comment}
                            disabled={locked || busy}
                            onChange={(event) => updateRow(index, { comment: event.target.value.slice(0, 200) })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {isDirty && !locked && (
              <Alert severity='warning' sx={{ mt: 4 }}>
                Modifications non enregistrées.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
      {feedbackElement}
    </Grid>
  );
}
