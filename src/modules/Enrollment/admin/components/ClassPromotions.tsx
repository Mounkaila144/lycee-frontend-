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

import { useFeedback } from '@/modules/Grades/lycee/hooks/useFeedback';
import { extractErrorMessage, lyceeGradesService } from '@/modules/Grades/lycee/services/lyceeGradesService';
import type { AcademicYearOption, ClasseOption } from '@/modules/Grades/lycee/types';
import { formatRank, formatScore, scoreColor } from '@/modules/Grades/lycee/types';

import { classPromotionService } from '../services/classPromotionService';
import type {
  ClassPromotionPreparation,
  DepartReason,
  PromotionDecision,
  PromotionStudentRow,
  PromotionTargetClasse,
} from '../../types/classPromotion.types';

interface RowState {
  selected: boolean;
  decision: PromotionDecision | '';
  targetClasseId: number | '';
  departReason: DepartReason;
}

const DECISION_LABELS: Record<PromotionDecision, string> = {
  passage: 'Passage',
  redoublement: 'Redoublement',
  depart: 'Départ',
};

const DEPART_REASONS: DepartReason[] = ['Abandon', 'Transfert', 'Exclusion', 'Diplôme'];

const classeLabel = (classe: PromotionTargetClasse): string =>
  classe.max_capacity ? `${classe.name} (${classe.enrolled_count}/${classe.max_capacity})` : classe.name;

const initialRowState = (row: PromotionStudentRow): RowState => ({
  selected: row.target_enrollment === null && row.proposed_decision !== null,
  decision: row.proposed_decision ?? '',
  targetClasseId: row.proposed_target_classe_id ?? '',
  departReason: 'Abandon',
});

/**
 * Passages de classe de fin d'année — `/admin/enrollment/reenrollments` (Admin | Manager).
 * Pour chaque élève de la classe source : moyenne annuelle, décision proposée (≥ 10 → passage,
 * sinon redoublement ; « départ » si l'élève a répondu non à la campagne), classe cible, puis validation en masse.
 */
export function ClassPromotions() {
  const { notify, feedbackElement } = useFeedback();

  const [years, setYears] = useState<AcademicYearOption[]>([]);
  const [sourceYearId, setSourceYearId] = useState<number | ''>('');
  const [targetYearId, setTargetYearId] = useState<number | ''>('');
  const [classes, setClasses] = useState<ClasseOption[]>([]);
  const [classeId, setClasseId] = useState<number | ''>('');
  const [preparation, setPreparation] = useState<ClassPromotionPreparation | null>(null);
  const [rows, setRows] = useState<Record<number, RowState>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    lyceeGradesService
      .getAcademicYears()
      .then((list) => {
        setYears(list);
        const active = list.find((year) => year.is_active) ?? list[0];

        if (active) {
          setSourceYearId(active.id);
        }
      })
      .catch(async (err) => setError(await extractErrorMessage(err, 'Impossible de charger les années scolaires.')));
  }, []);

  useEffect(() => {
    if (!sourceYearId) {
      return;
    }

    setClasseId('');
    setTargetYearId('');
    setPreparation(null);
    lyceeGradesService
      .getClasses(sourceYearId)
      .then((list) => setClasses([...list].sort((a, b) => a.name.localeCompare(b.name))))
      .catch(async (err) => setError(await extractErrorMessage(err, 'Impossible de charger les classes.')));
  }, [sourceYearId]);

  const load = useCallback(async () => {
    if (!classeId) {
      return;
    }

    setLoading(true);
    setError(null);
    setRowErrors({});

    try {
      const data = await classPromotionService.prepare(classeId, targetYearId || undefined);

      setPreparation(data);
      setRows(Object.fromEntries(data.students.map((row) => [row.student.id, initialRowState(row)])));

      if (!targetYearId && data.target_academic_year) {
        setTargetYearId(data.target_academic_year.id);
      }
    } catch (err) {
      setPreparation(null);
      setError(await extractErrorMessage(err, 'Impossible de préparer les passages de cette classe.'));
    } finally {
      setLoading(false);
    }
  }, [classeId, targetYearId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRow = (studentId: number, patch: Partial<RowState>) =>
    setRows((current) => ({ ...current, [studentId]: { ...current[studentId], ...patch } }));

  const changeDecision = (row: PromotionStudentRow, decision: PromotionDecision | '') => {
    const candidates =
      decision === 'passage' || decision === 'redoublement' ? (preparation?.target_classes[decision] ?? []) : [];

    const keepProposed = decision === row.proposed_decision && row.proposed_target_classe_id !== null;

    updateRow(row.student.id, {
      decision,
      selected: decision !== '' && row.target_enrollment === null,
      targetClasseId: keepProposed
        ? (row.proposed_target_classe_id as number)
        : candidates.length === 1
          ? candidates[0].id
          : '',
    });
  };

  const selectableRows = useMemo(
    () => (preparation?.students ?? []).filter((row) => row.target_enrollment === null),
    [preparation],
  );

  const selectedRows = selectableRows.filter((row) => rows[row.student.id]?.selected);
  const allSelected = selectableRows.length > 0 && selectedRows.length === selectableRows.length;

  const toggleAll = (checked: boolean) =>
    setRows((current) => {
      const next = { ...current };

      selectableRows.forEach((row) => {
        next[row.student.id] = { ...next[row.student.id], selected: checked && next[row.student.id].decision !== '' };
      });

      return next;
    });

  const validate = async () => {
    if (!preparation || !targetYearId) {
      return;
    }

    const incomplete = selectedRows.filter((row) => {
      const state = rows[row.student.id];

      return state.decision === '' || (state.decision !== 'depart' && state.targetClasseId === '');
    });

    if (incomplete.length > 0) {
      notify(`${incomplete.length} élève(s) sélectionné(s) sans décision ou sans classe cible.`, 'warning');

      return;
    }

    setSubmitting(true);
    setRowErrors({});

    try {
      const result = await classPromotionService.validate({
        source_classe_id: preparation.classe.id,
        target_academic_year_id: targetYearId,
        items: selectedRows.map((row) => {
          const state = rows[row.student.id];

          return {
            student_id: row.student.id,
            decision: state.decision as PromotionDecision,
            target_classe_id: state.decision === 'depart' ? null : (state.targetClasseId as number),
            depart_reason: state.decision === 'depart' ? state.departReason : null,
          };
        }),
      });

      const errors = Object.fromEntries(result.data.errors.map((item) => [item.student_id, item.message]));

      notify(result.message, result.data.errors.length === 0 ? 'success' : 'warning');
      await load();
      setRowErrors(errors);
    } catch (err) {
      notify(await extractErrorMessage(err, 'La validation des passages a échoué.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const targetYearOptions = years.filter((year) => year.id !== sourceYearId);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Card>
        <CardHeader
          title='Passages de classe'
          subheader="Fin d'année : passage en classe supérieure, redoublement ou départ de l'établissement"
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label='Année source'
                value={sourceYearId}
                onChange={(event) => setSourceYearId(Number(event.target.value))}
              >
                {years.map((year) => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.name}
                    {year.is_active ? ' (active)' : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label='Classe'
                value={classeId}
                onChange={(event) => setClasseId(Number(event.target.value))}
                disabled={classes.length === 0}
                helperText={sourceYearId && classes.length === 0 ? 'Aucune classe pour cette année' : undefined}
              >
                {classes.map((classe) => (
                  <MenuItem key={classe.id} value={classe.id}>
                    {classe.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label='Année cible'
                value={targetYearId}
                onChange={(event) => setTargetYearId(Number(event.target.value))}
              >
                {targetYearOptions.map((year) => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity='error'>{error}</Alert>}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && preparation && (
        <Card>
          <CardHeader
            title={`${preparation.classe.name} → ${preparation.target_academic_year?.name ?? 'année cible ?'}`}
            subheader={
              preparation.next_level
                ? `Niveau supérieur : ${preparation.next_level.name}`
                : 'Dernier niveau : pas de passage possible (choisir « Départ »)'
            }
            action={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant='outlined' onClick={() => load()} disabled={submitting}>
                  Réinitialiser les propositions
                </Button>
                <Button
                  variant='contained'
                  onClick={validate}
                  disabled={submitting || selectedRows.length === 0 || !targetYearId}
                  startIcon={submitting ? <CircularProgress size={18} color='inherit' /> : undefined}
                >
                  Valider la sélection ({selectedRows.length})
                </Button>
              </Box>
            }
          />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!preparation.target_academic_year && (
              <Alert severity='warning'>
                Aucune année scolaire suivante n&apos;existe : créez-la (Structure académique) puis sélectionnez-la comme
                année cible.
              </Alert>
            )}
            {!preparation.grades_available && (
              <Alert severity='info'>
                Les notes lycée ne sont pas disponibles : aucune décision n&apos;est proposée, saisissez-les manuellement.
              </Alert>
            )}
            {preparation.target_academic_year &&
              preparation.next_level &&
              preparation.target_classes.passage.length === 0 && (
                <Alert severity='warning'>
                  Aucune classe de {preparation.next_level.name} n&apos;existe pour {preparation.target_academic_year.name}.
                </Alert>
              )}

            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={selectedRows.length > 0 && !allSelected}
                        onChange={(event) => toggleAll(event.target.checked)}
                        disabled={selectableRows.length === 0}
                      />
                    </TableCell>
                    <TableCell>Élève</TableCell>
                    <TableCell align='right'>Moy. annuelle</TableCell>
                    <TableCell align='center'>Rang</TableCell>
                    <TableCell align='center'>Souhait</TableCell>
                    <TableCell sx={{ minWidth: 170 }}>Décision</TableCell>
                    <TableCell sx={{ minWidth: 220 }}>Classe cible / motif</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preparation.students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align='center'>
                        Aucun élève inscrit dans cette classe.
                      </TableCell>
                    </TableRow>
                  )}
                  {preparation.students.map((row) => {
                    const state = rows[row.student.id] ?? initialRowState(row);
                    const done = row.target_enrollment !== null;

                    const candidates =
                      state.decision === 'passage' || state.decision === 'redoublement'
                        ? preparation.target_classes[state.decision]
                        : [];

                    return (
                      <TableRow key={row.student.id} hover selected={state.selected}>
                        <TableCell padding='checkbox'>
                          <Checkbox
                            checked={state.selected}
                            disabled={done || state.decision === ''}
                            onChange={(event) => updateRow(row.student.id, { selected: event.target.checked })}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' fontWeight={500}>
                            {row.student.full_name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {row.student.matricule ?? '—'}
                          </Typography>
                          {rowErrors[row.student.id] && (
                            <Typography variant='caption' color='error' display='block'>
                              {rowErrors[row.student.id]}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2' fontWeight={600} color={scoreColor(row.annual_average)}>
                            {formatScore(row.annual_average)}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>{formatRank(row.annual_rank)}</TableCell>
                        <TableCell align='center'>
                          {row.intention === null ? (
                            '—'
                          ) : (
                            <Chip
                              size='small'
                              color={row.intention ? 'success' : 'warning'}
                              label={row.intention ? 'Se réinscrit' : 'Ne se réinscrit pas'}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {done ? (
                            <Chip
                              size='small'
                              color='success'
                              variant='outlined'
                              label={`${row.target_enrollment?.assignment_type} – ${row.target_enrollment?.classe_name ?? ''}`}
                            />
                          ) : (
                            <TextField
                              select
                              fullWidth
                              size='small'
                              value={state.decision}
                              onChange={(event) => changeDecision(row, event.target.value as PromotionDecision | '')}
                              SelectProps={{ displayEmpty: true }}
                            >
                              <MenuItem value=''>
                                <em>À décider</em>
                              </MenuItem>
                              {(Object.keys(DECISION_LABELS) as PromotionDecision[]).map((decision) => (
                                <MenuItem
                                  key={decision}
                                  value={decision}
                                  disabled={decision === 'passage' && !preparation.next_level}
                                >
                                  {DECISION_LABELS[decision]}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                          {!done && row.final_decision && (
                            <Typography variant='caption' color='text.secondary'>
                              Décision enregistrée : {row.final_decision}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {!done && state.decision === 'depart' && (
                            <TextField
                              select
                              fullWidth
                              size='small'
                              label='Motif'
                              value={state.departReason}
                              onChange={(event) =>
                                updateRow(row.student.id, { departReason: event.target.value as DepartReason })
                              }
                            >
                              {DEPART_REASONS.map((reason) => (
                                <MenuItem key={reason} value={reason}>
                                  {reason}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                          {!done && (state.decision === 'passage' || state.decision === 'redoublement') && (
                            <TextField
                              select
                              fullWidth
                              size='small'
                              label='Classe cible'
                              value={state.targetClasseId}
                              onChange={(event) => updateRow(row.student.id, { targetClasseId: Number(event.target.value) })}
                              error={candidates.length === 0}
                              helperText={candidates.length === 0 ? 'Aucune classe disponible' : undefined}
                            >
                              {candidates.map((classe) => (
                                <MenuItem key={classe.id} value={classe.id}>
                                  {classeLabel(classe)}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {feedbackElement}
    </Box>
  );
}

export default ClassPromotions;
