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
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useFeedback } from '../hooks/useFeedback';
import { useReferenceData } from '../hooks/useReferenceData';
import { extractErrorMessage, lyceeGradesService } from '../services/lyceeGradesService';
import type { ClassEvaluation, ClassEvaluationStatus } from '../types';
import { EVALUATION_STATUS_COLORS, EVALUATION_STATUS_LABELS, EVALUATION_TYPE_LABELS, formatScore } from '../types';

/**
 * Liste des évaluations (Admin/Manager) — `/admin/grades/evaluations`.
 * Filtres classe / matière / semestre / statut, publication unitaire et en masse, dépublication.
 */
export default function EvaluationsAdmin() {
  const { lang } = useParams<{ lang: string }>();
  const { classes, semesters, subjects, defaultSemesterId, loading: refLoading, error: refError } = useReferenceData({
    withSubjects: true,
  });
  const { notify, feedbackElement } = useFeedback();

  const [classeId, setClasseId] = useState<number | ''>('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [semesterId, setSemesterId] = useState<number | ''>('');
  const [status, setStatus] = useState<ClassEvaluationStatus | ''>('submitted');
  const [evaluations, setEvaluations] = useState<ClassEvaluation[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (semesterId === '' && defaultSemesterId) {
      setSemesterId(defaultSemesterId);
    }
  }, [defaultSemesterId, semesterId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await lyceeGradesService.getEvaluations({
        classe_id: classeId || undefined,
        subject_id: subjectId || undefined,
        semester_id: semesterId || undefined,
        status: status || undefined,
      });

      setEvaluations(list);
      setSelected([]);
    } catch (err) {
      setEvaluations([]);
      setError(await extractErrorMessage(err, 'Impossible de charger les évaluations.'));
    } finally {
      setLoading(false);
    }
  }, [classeId, subjectId, semesterId, status]);

  useEffect(() => {
    if (!refLoading) {
      load();
    }
  }, [refLoading, load]);

  const publishable = useMemo(() => evaluations.filter((evaluation) => evaluation.status === 'submitted'), [evaluations]);
  const submittedCount = useMemo(() => evaluations.filter((evaluation) => evaluation.status === 'submitted').length, [evaluations]);

  const toggle = (id: number) =>
    setSelected((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]));

  const runAction = async <T,>(action: () => Promise<T>, success: string | ((result: T) => string), failure: string) => {
    setBusy(true);

    try {
      const result = await action();

      notify(typeof success === 'function' ? success(result) : success);
      await load();
    } catch (err) {
      notify(await extractErrorMessage(err, failure), 'error');
    } finally {
      setBusy(false);
    }
  };

  /**
   * publish-bulk ne publie que les évaluations « soumises » d'un semestre :
   * on regroupe la sélection par semestre (filtre « Tous » possible).
   */
  const publishSelected = () => {
    const bySemester = new Map<number, number[]>();

    evaluations
      .filter((evaluation) => selected.includes(evaluation.id) && evaluation.semester?.id)
      .forEach((evaluation) => {
        const ids = bySemester.get(evaluation.semester.id) ?? [];

        ids.push(evaluation.id);
        bySemester.set(evaluation.semester.id, ids);
      });

    runAction(
      async () => {
        let count = 0;

        for (const [semester, ids] of bySemester) {
          const result = await lyceeGradesService.publishBulk({ semester_id: semester, evaluation_ids: ids });

          count += result.published_count ?? ids.length;
        }

        return count;
      },
      (count) => `${count} évaluation(s) publiée(s).`,
      'Échec de la publication.',
    );
  };

  const publishAllSubmitted = () => {
    if (!semesterId) {
      notify('Choisissez un semestre pour publier en masse.', 'warning');

      return;
    }

    const scope = classeId ? `de la classe ${classes.find((classe) => classe.id === classeId)?.name ?? ''}` : 'de toutes les classes';

    if (!window.confirm(`Publier toutes les évaluations soumises ${scope} pour ce semestre ?`)) {
      return;
    }

    runAction(
      () => lyceeGradesService.publishBulk({ semester_id: semesterId, classe_id: classeId || undefined }),
      (result) => result.message ?? `${result.published_count ?? 0} évaluation(s) publiée(s).`,
      'Échec de la publication en masse.',
    );
  };

  if (refLoading) {
    return (
      <Box display='flex' justifyContent='center' p={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Évaluations</Typography>
        <Typography color='text.secondary'>
          Contrôlez les évaluations saisies par les professeurs et publiez-les : seules les évaluations publiées sont visibles
          des élèves et des parents et comptent dans les bulletins.
        </Typography>
      </Grid>

      {refError && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error'>{refError}</Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField select fullWidth size='small' label='Classe' value={classeId} onChange={(e) => setClasseId(e.target.value === '' ? '' : Number(e.target.value))}>
                  <MenuItem value=''>Toutes</MenuItem>
                  {classes.map((classe) => (
                    <MenuItem key={classe.id} value={classe.id}>
                      {classe.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField select fullWidth size='small' label='Matière' value={subjectId} onChange={(e) => setSubjectId(e.target.value === '' ? '' : Number(e.target.value))}>
                  <MenuItem value=''>Toutes</MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField select fullWidth size='small' label='Semestre' value={semesterId} onChange={(e) => setSemesterId(e.target.value === '' ? '' : Number(e.target.value))}>
                  <MenuItem value=''>Tous</MenuItem>
                  {semesters.map((semester) => (
                    <MenuItem key={semester.id} value={semester.id}>
                      {semester.name}
                      {semester.is_active ? ' (actif)' : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField select fullWidth size='small' label='Statut' value={status} onChange={(e) => setStatus(e.target.value as ClassEvaluationStatus | '')}>
                  <MenuItem value=''>Tous</MenuItem>
                  {(Object.keys(EVALUATION_STATUS_LABELS) as ClassEvaluationStatus[]).map((key) => (
                    <MenuItem key={key} value={key}>
                      {EVALUATION_STATUS_LABELS[key]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title={`${evaluations.length} évaluation(s)`}
            subheader={submittedCount > 0 ? `${submittedCount} soumise(s) en attente de publication` : undefined}
            action={
              <Box display='flex' gap={2} flexWrap='wrap'>
                <Button variant='outlined' disabled={busy || selected.length === 0} onClick={publishSelected}>
                  Publier la sélection ({selected.length})
                </Button>
                <Button variant='contained' disabled={busy || submittedCount === 0 || !semesterId} onClick={publishAllSubmitted}>
                  Publier toutes les soumises
                </Button>
              </Box>
            }
          />
          <CardContent>
            {error && <Alert severity='error' sx={{ mb: 4 }}>{error}</Alert>}
            {loading ? (
              <Box display='flex' justifyContent='center' p={4}>
                <CircularProgress size={28} />
              </Box>
            ) : evaluations.length === 0 ? (
              <Alert severity='info'>Aucune évaluation ne correspond aux filtres.</Alert>
            ) : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell padding='checkbox'>
                        <Checkbox
                          indeterminate={selected.length > 0 && selected.length < publishable.length}
                          checked={publishable.length > 0 && selected.length === publishable.length}
                          onChange={(event) => setSelected(event.target.checked ? publishable.map((item) => item.id) : [])}
                        />
                      </TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Classe</TableCell>
                      <TableCell>Matière</TableCell>
                      <TableCell>Évaluation</TableCell>
                      <TableCell>Professeur</TableCell>
                      <TableCell align='center'>Sem.</TableCell>
                      <TableCell align='center'>Notes</TableCell>
                      <TableCell align='center'>Moy.</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id} hover>
                        <TableCell padding='checkbox'>
                          <Checkbox
                            disabled={evaluation.status !== 'submitted'}
                            checked={selected.includes(evaluation.id)}
                            onChange={() => toggle(evaluation.id)}
                          />
                        </TableCell>
                        <TableCell>{new Date(evaluation.evaluation_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{evaluation.classe?.name}</TableCell>
                        <TableCell>{evaluation.subject?.name}</TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>{evaluation.title}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {EVALUATION_TYPE_LABELS[evaluation.type] ?? evaluation.type} · /{formatScore(evaluation.max_score, 0)} · coef.{' '}
                            {formatScore(evaluation.weight, 1)}
                          </Typography>
                        </TableCell>
                        <TableCell>{evaluation.teacher?.full_name ?? '—'}</TableCell>
                        <TableCell align='center'>{evaluation.semester?.name}</TableCell>
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
                          <Box display='flex' gap={1} justifyContent='flex-end'>
                            <Button size='small' component={Link} href={`/${lang}/admin/teacher/grades/${evaluation.id}`}>
                              Notes
                            </Button>
                            {evaluation.status === 'published' ? (
                              <Tooltip title='Repasser en « soumise » (masquée des élèves et parents)'>
                                <span>
                                  <Button
                                    size='small'
                                    color='warning'
                                    disabled={busy}
                                    onClick={() =>
                                      runAction(
                                        () => lyceeGradesService.unpublishEvaluation(evaluation.id),
                                        'Évaluation dépubliée.',
                                        'Échec de la dépublication.',
                                      )
                                    }
                                  >
                                    Dépublier
                                  </Button>
                                </span>
                              </Tooltip>
                            ) : (
                              <Button
                                size='small'
                                color='success'
                                disabled={busy}
                                onClick={() =>
                                  runAction(
                                    () => lyceeGradesService.publishEvaluation(evaluation.id),
                                    'Évaluation publiée.',
                                    'Échec de la publication.',
                                  )
                                }
                              >
                                Publier
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
      {feedbackElement}
    </Grid>
  );
}
