'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
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

import { useCurrentUser } from '../hooks/useCurrentUser';
import { useFeedback } from '../hooks/useFeedback';
import { useReferenceData } from '../hooks/useReferenceData';
import { extractErrorMessage, lyceeGradesService, saveBlob } from '../services/lyceeGradesService';
import type { ClassResults, ClasseOption, StudentRef, TeacherAssignment } from '../types';
import { formatRank, formatScore, scoreColor } from '../types';
import StudentAppreciationDialog from './StudentAppreciationDialog';

const slug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();

/**
 * Résultats & bulletins d'une classe — `/admin/grades/class-results`.
 * Admin/Manager : toutes les classes. Professeur : classes dont il est PP (toutes matières)
 * ou affecté (ses matières uniquement, filtrées côté API).
 */
export default function ClassResultsView() {
  const { user, ready } = useCurrentUser();
  const { semesters, defaultSemesterId, loading: refLoading } = useReferenceData({ withClasses: false });
  const { notify, feedbackElement } = useFeedback();

  const [classes, setClasses] = useState<ClasseOption[]>([]);
  const [myAssignments, setMyAssignments] = useState<TeacherAssignment[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classeId, setClasseId] = useState<number | ''>('');
  const [semesterId, setSemesterId] = useState<number | ''>('');
  const [includeUnpublished, setIncludeUnpublished] = useState(false);
  const [results, setResults] = useState<ClassResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [appreciationStudent, setAppreciationStudent] = useState<StudentRef | null>(null);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const load = async () => {
      setClassesLoading(true);

      try {
        if (user.isManager) {
          setClasses(await lyceeGradesService.getClasses());
        } else {
          const [teacherClasses, assignments] = await Promise.all([
            lyceeGradesService.getTeacherClasses().catch(() => [] as ClasseOption[]),
            lyceeGradesService.getMyAssignments().catch(() => [] as TeacherAssignment[]),
          ]);
          const merged = new Map<number, ClasseOption>();

          teacherClasses.forEach((classe) => merged.set(classe.id, classe));
          assignments.forEach((assignment) => {
            if (!merged.has(assignment.classe.id)) {
              merged.set(assignment.classe.id, {
                id: assignment.classe.id,
                name: assignment.classe.name,
                academic_year_id: assignment.academic_year_id,
              });
            }
          });
          setMyAssignments(assignments);
          setClasses(Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (err) {
        setError(await extractErrorMessage(err, 'Impossible de charger les classes.'));
      } finally {
        setClassesLoading(false);
      }
    };

    load();
  }, [ready, user.isManager]);

  useEffect(() => {
    if (classeId === '' && classes.length > 0) {
      setClasseId(classes[0].id);
    }
  }, [classes, classeId]);

  useEffect(() => {
    if (semesterId === '' && defaultSemesterId) {
      setSemesterId(defaultSemesterId);
    }
  }, [defaultSemesterId, semesterId]);

  const selectedClasse = classes.find((classe) => classe.id === classeId);
  const isHeadTeacher =
    user.id !== null &&
    (selectedClasse?.head_teacher_id === user.id || results?.classe.head_teacher?.id === user.id);
  const canManageClass = user.isManager || isHeadTeacher;

  const editableSubjectIds = useMemo<number[] | null>(
    () =>
      user.isManager
        ? null
        : myAssignments.filter((assignment) => assignment.classe.id === classeId).map((assignment) => assignment.subject.id),
    [user.isManager, myAssignments, classeId],
  );

  const load = useCallback(async () => {
    if (!classeId || !semesterId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setResults(await lyceeGradesService.getClassResults(classeId, semesterId, includeUnpublished));
    } catch (err) {
      setResults(null);
      setError(await extractErrorMessage(err, 'Impossible de charger les résultats.'));
    } finally {
      setLoading(false);
    }
  }, [classeId, semesterId, includeUnpublished]);

  useEffect(() => {
    load();
  }, [load]);

  const semesterName = semesters.find((semester) => semester.id === semesterId)?.name ?? '';

  const downloadClassPdf = async () => {
    if (!classeId || !semesterId) {
      return;
    }

    setDownloading('class');

    try {
      const blob = await lyceeGradesService.downloadClassReportCards(classeId, semesterId);

      saveBlob(blob, `bulletins-${slug(selectedClasse?.name ?? String(classeId))}-${slug(semesterName)}.pdf`);
    } catch (err) {
      notify(await extractErrorMessage(err, 'Échec du téléchargement des bulletins.'), 'error');
    } finally {
      setDownloading(null);
    }
  };

  const downloadStudentPdf = async (student: StudentRef) => {
    if (!semesterId) {
      return;
    }

    setDownloading(`student-${student.id}`);

    try {
      const blob = await lyceeGradesService.downloadStudentReportCard(student.id, semesterId);

      saveBlob(blob, `bulletin-${slug(student.full_name)}-${slug(semesterName)}.pdf`);
    } catch (err) {
      notify(await extractErrorMessage(err, 'Échec du téléchargement du bulletin.'), 'error');
    } finally {
      setDownloading(null);
    }
  };

  const students = useMemo(
    () =>
      [...(results?.students ?? [])].sort(
        (a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER) || a.student.full_name.localeCompare(b.student.full_name),
      ),
    [results],
  );

  const rankedCount = students.filter((row) => row.rank !== null).length;
  const subjects = results?.subjects ?? [];
  const stats = results?.stats;

  if (refLoading || classesLoading) {
    return (
      <Box display='flex' justifyContent='center' p={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4'>Résultats &amp; bulletins</Typography>
        <Typography color='text.secondary'>
          Moyennes par matière, moyenne générale, rang et mention. Les bulletins PDF ne tiennent compte que des évaluations
          publiées.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Grid container spacing={4} alignItems='center'>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select fullWidth size='small' label='Classe' value={classeId} onChange={(e) => setClasseId(Number(e.target.value))}>
                  {classes.map((classe) => (
                    <MenuItem key={classe.id} value={classe.id}>
                      {classe.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField select fullWidth size='small' label='Semestre' value={semesterId} onChange={(e) => setSemesterId(Number(e.target.value))}>
                  {semesters.map((semester) => (
                    <MenuItem key={semester.id} value={semester.id}>
                      {semester.name}
                      {semester.is_active ? ' (actif)' : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={includeUnpublished} onChange={(e) => setIncludeUnpublished(e.target.checked)} />}
                  label='Inclure les notes non publiées'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }} display='flex' justifyContent={{ sm: 'flex-end' }}>
                {canManageClass && (
                  <Button variant='contained' disabled={!results || downloading !== null || students.length === 0} onClick={downloadClassPdf}>
                    {downloading === 'class' ? 'Génération…' : 'Bulletins PDF'}
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {classes.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='info'>Aucune classe accessible.</Alert>
        </Grid>
      )}

      {error && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error'>{error}</Alert>
        </Grid>
      )}

      {includeUnpublished && results && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='warning'>Vue provisoire : les évaluations non publiées (brouillons, soumises) sont prises en compte.</Alert>
        </Grid>
      )}

      {stats && (
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={4}>
            {[
              { label: 'Moyenne de classe', value: formatScore(stats.class_average) },
              { label: 'Plus forte moyenne', value: formatScore(stats.highest) },
              { label: 'Plus faible moyenne', value: formatScore(stats.lowest) },
              { label: 'Taux de réussite (≥ 10)', value: stats.pass_rate === null ? '—' : `${formatScore(stats.pass_rate, 1)} %` },
              { label: 'Élèves classés', value: `${rankedCount} / ${stats.class_size ?? students.length}` },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 6, md: 'grow' }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='caption' color='text.secondary'>
                      {item.label}
                    </Typography>
                    <Typography variant='h5'>{item.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title={results ? `${results.classe.name} — ${results.semester?.name ?? semesterName}` : 'Résultats'}
            subheader={!user.isManager && !isHeadTeacher ? 'Vous ne voyez que vos matières.' : undefined}
          />
          <CardContent>
            {loading ? (
              <Box display='flex' justifyContent='center' p={4}>
                <CircularProgress size={28} />
              </Box>
            ) : !results ? null : students.length === 0 ? (
              <Alert severity='info'>Aucun élève inscrit dans cette classe.</Alert>
            ) : (
              <TableContainer sx={{ maxHeight: '70vh' }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rang</TableCell>
                      <TableCell sx={{ minWidth: 180 }}>Élève</TableCell>
                      {subjects.map((subject) => (
                        <TableCell key={subject.id} align='center'>
                          <Tooltip title={`${subject.name}${subject.teacher ? ` — ${subject.teacher.full_name}` : ''}`}>
                            <span>
                              {subject.code || subject.name}
                              <Typography variant='caption' display='block' color='text.secondary'>
                                coef. {formatScore(subject.coefficient, 0)}
                              </Typography>
                            </span>
                          </Tooltip>
                        </TableCell>
                      ))}
                      <TableCell align='center'>Moy. gén.</TableCell>
                      <TableCell>Mention</TableCell>
                      <TableCell>Distinction</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((row) => (
                      <TableRow key={row.student.id} hover>
                        <TableCell>{formatRank(row.rank)}</TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>{row.student.full_name}</Typography>
                          {row.student.matricule && (
                            <Typography variant='caption' color='text.secondary'>
                              {row.student.matricule}
                            </Typography>
                          )}
                        </TableCell>
                        {subjects.map((subject) => {
                          const cell = row.subjects?.[String(subject.id)];

                          return (
                            <TableCell key={subject.id} align='center'>
                              <Typography variant='body2' color={scoreColor(cell?.average)}>
                                {formatScore(cell?.average)}
                              </Typography>
                              {cell?.rank ? (
                                <Typography variant='caption' color='text.secondary'>
                                  {formatRank(cell.rank)}
                                </Typography>
                              ) : null}
                            </TableCell>
                          );
                        })}
                        <TableCell align='center'>
                          <Typography fontWeight={700} color={scoreColor(row.general_average)}>
                            {formatScore(row.general_average)}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.mention ?? '—'}</TableCell>
                        <TableCell>
                          {row.distinction ? (
                            <Chip
                              size='small'
                              variant='tonal'
                              color={row.distinction === 'Avertissement' ? 'error' : 'success'}
                              label={row.distinction}
                            />
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell align='right'>
                          <Box display='flex' gap={1} justifyContent='flex-end'>
                            <Button size='small' onClick={() => setAppreciationStudent(row.student)}>
                              Appréciations
                            </Button>
                            {canManageClass && (
                              <Button
                                size='small'
                                variant='outlined'
                                disabled={downloading !== null}
                                onClick={() => downloadStudentPdf(row.student)}
                              >
                                {downloading === `student-${row.student.id}` ? '…' : 'PDF'}
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {stats && (
                      <>
                        {(
                          [
                            ['Moyenne de classe', 'class_average', stats.class_average],
                            ['Plus forte', 'highest', stats.highest],
                            ['Plus faible', 'lowest', stats.lowest],
                          ] as const
                        ).map(([label, key, general]) => (
                          <TableRow key={key} sx={{ backgroundColor: 'action.hover' }}>
                            <TableCell />
                            <TableCell>
                              <Typography variant='body2' fontWeight={600}>
                                {label}
                              </Typography>
                            </TableCell>
                            {subjects.map((subject) => (
                              <TableCell key={subject.id} align='center'>
                                {formatScore(stats.by_subject?.[String(subject.id)]?.[key])}
                              </TableCell>
                            ))}
                            <TableCell align='center'>
                              <Typography fontWeight={600}>{formatScore(general)}</Typography>
                            </TableCell>
                            <TableCell colSpan={3} />
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {semesterId && (
        <StudentAppreciationDialog
          open={appreciationStudent !== null}
          onClose={() => setAppreciationStudent(null)}
          onSaved={() => notify('Appréciations enregistrées.')}
          student={appreciationStudent}
          semesterId={semesterId}
          canEditGeneral={canManageClass}
          editableSubjectIds={editableSubjectIds}
        />
      )}
      {feedbackElement}
    </Grid>
  );
}
