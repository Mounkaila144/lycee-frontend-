'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
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
import type { ClassSubject, TeacherAssignment, TeacherOption } from '../types';
import { formatScore } from '../types';

/**
 * Affectations professeur ↔ (classe, matière) — `/admin/grades/assignments`.
 * Grille : pour la classe choisie, une ligne par matière (coefficient du niveau/série)
 * et un sélecteur de professeur. Sauvegarde groupée via POST /assignments/bulk.
 */
export default function AssignmentsManager() {
  const { classes, teachers, activeYear, loading: refLoading, error: refError } = useReferenceData({ withTeachers: true });
  const { notify, feedbackElement } = useFeedback();

  const [classeId, setClasseId] = useState<number | ''>('');
  const [subjects, setSubjects] = useState<ClassSubject[]>([]);
  const [selection, setSelection] = useState<Record<number, number | null>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [overview, setOverview] = useState<TeacherAssignment[]>([]);

  const loadOverview = useCallback(() => {
    lyceeGradesService
      .getAssignments(activeYear ? { academic_year_id: activeYear.id } : undefined)
      .then(setOverview)
      .catch(() => setOverview([]));
  }, [activeYear]);

  useEffect(() => {
    if (!refLoading) {
      loadOverview();
    }
  }, [refLoading, loadOverview]);

  useEffect(() => {
    if (classeId === '' && classes.length > 0) {
      setClasseId(classes[0].id);
    }
  }, [classes, classeId]);

  const loadSubjects = useCallback(async (id: number) => {
    setLoadingSubjects(true);
    setSubjectsError(null);

    try {
      const list = await lyceeGradesService.getClassSubjects(id);

      setSubjects(list);
      setSelection(Object.fromEntries(list.map((subject) => [subject.id, subject.teacher?.id ?? null])));
    } catch (error) {
      setSubjects([]);
      setSubjectsError(await extractErrorMessage(error, 'Impossible de charger les matières de la classe.'));
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    if (classeId !== '') {
      loadSubjects(classeId);
    }
  }, [classeId, loadSubjects]);

  const teacherById = useMemo(() => new Map(teachers.map((teacher) => [teacher.id, teacher])), [teachers]);

  const isDirty = useMemo(
    () => subjects.some((subject) => (subject.teacher?.id ?? null) !== (selection[subject.id] ?? null)),
    [subjects, selection],
  );

  const assignmentsCountByClasse = useMemo(() => {
    const counts = new Map<number, number>();

    overview.forEach((assignment) => counts.set(assignment.classe.id, (counts.get(assignment.classe.id) ?? 0) + 1));

    return counts;
  }, [overview]);

  const handleSave = async () => {
    if (classeId === '') {
      return;
    }

    setSaving(true);

    try {
      await lyceeGradesService.bulkAssign({
        classe_id: classeId,
        items: subjects.map((subject) => ({ subject_id: subject.id, teacher_id: selection[subject.id] ?? null })),
      });
      notify('Affectations enregistrées.');
      await loadSubjects(classeId);
      loadOverview();
    } catch (error) {
      notify(await extractErrorMessage(error, "Échec de l'enregistrement des affectations."), 'error');
    } finally {
      setSaving(false);
    }
  };

  const teacherOptionFor = (subjectId: number): TeacherOption | null => {
    const id = selection[subjectId];

    if (!id) {
      return null;
    }

    return teacherById.get(id) ?? { id, full_name: subjects.find((s) => s.id === subjectId)?.teacher?.full_name ?? `#${id}` };
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
        <Typography variant='h4'>Affectations des professeurs</Typography>
        <Typography color='text.secondary'>
          Un professeur par matière et par classe{activeYear ? ` — année ${activeYear.name}` : ''}. Seul le professeur affecté
          peut créer des évaluations et saisir les notes de la matière.
        </Typography>
      </Grid>

      {refError && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error'>{refError}</Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardHeader title='Classes' subheader='Matières affectées' />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {classes.length === 0 && <Typography color='text.secondary'>Aucune classe pour l&apos;année active.</Typography>}
            {classes.map((classe) => (
              <Button
                key={classe.id}
                variant={classe.id === classeId ? 'contained' : 'text'}
                onClick={() => setClasseId(classe.id)}
                sx={{ justifyContent: 'space-between' }}
                disabled={saving}
              >
                <span>{classe.name}</span>
                <Chip size='small' label={assignmentsCountByClasse.get(classe.id) ?? 0} />
              </Button>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 9 }}>
        <Card>
          <CardHeader
            title={classes.find((classe) => classe.id === classeId)?.name ?? 'Classe'}
            subheader='Matières de la classe (coefficients du niveau / de la série)'
            action={
              <Box display='flex' gap={2} alignItems='center'>
                <TextField
                  select
                  size='small'
                  label='Classe'
                  value={classeId}
                  onChange={(event) => setClasseId(Number(event.target.value))}
                  sx={{ minWidth: 160, display: { md: 'none' } }}
                >
                  {classes.map((classe) => (
                    <MenuItem key={classe.id} value={classe.id}>
                      {classe.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant='contained' onClick={handleSave} disabled={!isDirty || saving || loadingSubjects}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </Box>
            }
          />
          <CardContent>
            {subjectsError && <Alert severity='error' sx={{ mb: 4 }}>{subjectsError}</Alert>}
            {loadingSubjects ? (
              <Box display='flex' justifyContent='center' p={4}>
                <CircularProgress size={28} />
              </Box>
            ) : subjects.length === 0 ? (
              <Alert severity='info'>
                Aucune matière configurée pour cette classe. Définissez les coefficients du niveau/série dans la structure
                académique.
              </Alert>
            ) : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Matière</TableCell>
                      <TableCell align='center'>Coef.</TableCell>
                      <TableCell align='center'>H/sem.</TableCell>
                      <TableCell sx={{ minWidth: 280 }}>Professeur</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjects.map((subject) => {
                      const changed = (subject.teacher?.id ?? null) !== (selection[subject.id] ?? null);

                      return (
                        <TableRow key={subject.id} selected={changed}>
                          <TableCell>
                            <Typography fontWeight={500}>{subject.name}</Typography>
                            {subject.code && (
                              <Typography variant='caption' color='text.secondary'>
                                {subject.code}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align='center'>{formatScore(subject.coefficient, 0)}</TableCell>
                          <TableCell align='center'>{subject.hours_per_week ? formatScore(subject.hours_per_week, 0) : '—'}</TableCell>
                          <TableCell>
                            <Autocomplete
                              size='small'
                              options={teachers}
                              value={teacherOptionFor(subject.id)}
                              getOptionLabel={(option) => option.full_name}
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              onChange={(_, value) =>
                                setSelection((previous) => ({ ...previous, [subject.id]: value?.id ?? null }))
                              }
                              renderInput={(params) => <TextField {...params} placeholder='Non affecté' />}
                            />
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
      {feedbackElement}
    </Grid>
  );
}
