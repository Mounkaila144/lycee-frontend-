'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { extractErrorMessage, lyceeGradesService, saveBlob } from '../services/lyceeGradesService';
import {
  EVALUATION_TYPE_LABELS,
  formatRank,
  formatScore,
  scoreColor,
  toScore,
} from '../types';
import type {
  SemesterRef,
  StudentResultSubject,
  StudentResults,
  StudentResultsResponse,
} from '../types';

interface StudentGradesReportProps {

  /** Charge les résultats de l'élève pour un semestre (undefined = semestre actif côté backend). */
  loader: (semesterId?: number) => Promise<StudentResultsResponse>;

  /** Afficher le bouton de téléchargement du bulletin PDF. */
  allowReportCardDownload?: boolean;
}

/** Colonnes masquées sur mobile pour éviter un tableau trop large. */
const hideOnMobile = { display: { xs: 'none', md: 'table-cell' } } as const;

const formatDate = (value: string | null | undefined): string =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '—';

const countEvaluations = (results: StudentResults | null): number =>
  results?.subjects?.reduce((total, subject) => total + (subject.evaluations?.length ?? 0), 0) ?? 0;

function SummaryItem({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <Box>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='h6' sx={{ color }}>
        {value}
      </Typography>
    </Box>
  );
}

function SubjectRow({ row }: { row: StudentResultSubject }) {
  const [open, setOpen] = useState(false);
  const evaluations = row.evaluations ?? [];

  return (
    <Fragment>
      <TableRow hover sx={{ '& > td': { borderBottom: open ? 'unset' : undefined } }}>
        <TableCell padding='checkbox'>
          <IconButton
            size='small'
            aria-label={open ? 'Masquer les évaluations' : 'Afficher les évaluations'}
            onClick={() => setOpen((value) => !value)}
            disabled={evaluations.length === 0}
          >
            <i className={open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant='body2' fontWeight={500}>
            {row.subject?.name ?? '—'}
          </Typography>
          {row.teacher && (
            <Typography variant='caption' color='text.secondary' sx={{ display: { xs: 'block', md: 'none' } }}>
              {row.teacher.full_name}
            </Typography>
          )}
        </TableCell>
        <TableCell align='right'>{formatScore(row.coefficient, 0)}</TableCell>
        <TableCell align='right' sx={{ color: scoreColor(row.average), fontWeight: 600 }}>
          {formatScore(row.average)}
        </TableCell>
        <TableCell align='right' sx={hideOnMobile}>
          {formatScore(row.class_average)}
        </TableCell>
        <TableCell align='right'>{formatRank(row.rank)}</TableCell>
        <TableCell sx={hideOnMobile}>{row.appreciation || '—'}</TableCell>
        <TableCell sx={hideOnMobile}>{row.teacher?.full_name ?? '—'}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={8}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ my: 2, ml: { xs: 0, md: 6 } }}>
              {row.appreciation && (
                <Typography variant='body2' sx={{ mb: 1, display: { xs: 'block', md: 'none' } }}>
                  <strong>Appréciation :</strong> {row.appreciation}
                </Typography>
              )}
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Évaluation</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align='right'>Note</TableCell>
                      <TableCell align='right' sx={hideOnMobile}>
                        Poids
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evaluations.map((evaluation) => {
                      const score = toScore(evaluation.score);

                      return (
                        <TableRow key={evaluation.id}>
                          <TableCell>{evaluation.title}</TableCell>
                          <TableCell>{EVALUATION_TYPE_LABELS[evaluation.type] ?? evaluation.type}</TableCell>
                          <TableCell>{formatDate(evaluation.date)}</TableCell>
                          <TableCell align='right'>
                            {evaluation.is_absent ? (
                              <Chip size='small' color='warning' label='Absent' />
                            ) : score === null ? (
                              '—'
                            ) : (
                              `${formatScore(score)} / ${formatScore(evaluation.max_score, 0)}`
                            )}
                          </TableCell>
                          <TableCell align='right' sx={hideOnMobile}>
                            {formatScore(evaluation.weight, 0)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

/**
 * Relevé de notes lycée d'un élève (portail élève et fiche enfant du parent) :
 * sélecteur de semestre, moyennes par matière avec détail des évaluations,
 * synthèse (moyenne générale, rang, mention…) et téléchargement du bulletin PDF.
 */
export function StudentGradesReport({ loader, allowReportCardDownload = true }: StudentGradesReportProps) {
  const [semesterId, setSemesterId] = useState<number | undefined>(undefined);
  const [results, setResults] = useState<StudentResults | null>(null);
  const [semesters, setSemesters] = useState<SemesterRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const load = useCallback(
    async (requestedSemesterId?: number, isActive: () => boolean = () => true) => {
      setLoading(true);
      setError(null);
      setDownloadError(null);

      try {
        const response = await loader(requestedSemesterId);

        if (!isActive()) {
          return;
        }

        const data = response?.data ?? null;
        const metaSemesters = response?.meta?.semesters ?? [];

        setResults(data);
        setSemesters((previous) => {
          if (metaSemesters.length > 0) {
            return metaSemesters;
          }

          if (data?.semester && !previous.some((semester) => semester.id === data.semester?.id)) {
            return [...previous, data.semester];
          }

          return previous;
        });

        if (requestedSemesterId === undefined && data?.semester) {
          setSemesterId(data.semester.id);
        }
      } catch (loadError) {
        if (isActive()) {
          setResults(null);
          setError(await extractErrorMessage(loadError, 'Impossible de charger les notes.'));
        }
      } finally {
        if (isActive()) {
          setLoading(false);
        }
      }
    },
    [loader],
  );

  useEffect(() => {
    let active = true;

    load(undefined, () => active);

    return () => {
      active = false;
    };

    // Chargement initial uniquement (semestre actif) ; les changements passent par handleSemesterChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSemesterChange = (value: number) => {
    setSemesterId(value);
    load(value);
  };

  const evaluationsCount = useMemo(() => countEvaluations(results), [results]);
  const currentSemester = results?.semester ?? semesters.find((semester) => semester.id === semesterId) ?? null;

  const handleDownload = async () => {
    if (!results?.student || !currentSemester) {
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      const blob = await lyceeGradesService.downloadStudentReportCard(results.student.id, currentSemester.id);
      const studentLabel = results.student.matricule || results.student.id;

      saveBlob(blob, `bulletin-${studentLabel}-${currentSemester.name}.pdf`);
    } catch (downloadFailure) {
      setDownloadError(await extractErrorMessage(downloadFailure, 'Impossible de télécharger le bulletin.'));
    } finally {
      setDownloading(false);
    }
  };

  const generalAverage = results?.general_average ?? null;
  const annualAverage = results?.annual ? toScore(results.annual.average) : null;

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent='space-between'
      >
        <FormControl size='small' sx={{ minWidth: 200 }} disabled={loading || semesters.length === 0}>
          <InputLabel id='student-grades-semester'>Semestre</InputLabel>
          <Select
            labelId='student-grades-semester'
            label='Semestre'
            value={semesterId ?? ''}
            onChange={(event) => handleSemesterChange(Number(event.target.value))}
          >
            {semesters.map((semester) => (
              <MenuItem key={semester.id} value={semester.id}>
                {semester.name}
                {semester.is_active ? ' (en cours)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {allowReportCardDownload && (
          <Button
            variant='contained'
            startIcon={downloading ? <CircularProgress size={16} color='inherit' /> : <i className='ri-file-pdf-2-line' />}
            onClick={handleDownload}
            disabled={loading || downloading || !results?.student || !currentSemester || evaluationsCount === 0}
          >
            Télécharger le bulletin (PDF)
          </Button>
        )}
      </Stack>

      {downloadError && (
        <Alert severity='error' onClose={() => setDownloadError(null)}>
          {downloadError}
        </Alert>
      )}

      {loading && (
        <Box display='flex' justifyContent='center' p={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Alert severity='error'>{error}</Alert>}

      {!loading && !error && (!results || evaluationsCount === 0) && (
        <Alert severity='info'>Aucune note publiée pour ce semestre.</Alert>
      )}

      {!loading && !error && results && evaluationsCount > 0 && (
        <>
          <Card variant='outlined'>
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <SummaryItem
                    label='Moyenne générale'
                    value={generalAverage === null ? '—' : `${formatScore(generalAverage)} / 20`}
                    color={scoreColor(generalAverage)}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <SummaryItem label='Rang' value={formatRank(results.rank, results.class_size)} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <SummaryItem label='Mention' value={results.mention || '—'} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <SummaryItem label='Distinction' value={results.distinction || '—'} />
                </Grid>
                {annualAverage !== null && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SummaryItem
                      label='Moyenne annuelle'
                      value={
                        annualAverage === null
                          ? '—'
                          : `${formatScore(annualAverage)} / 20${results.annual?.rank ? ` · ${formatRank(results.annual.rank, results.class_size)}` : ''}`
                      }
                      color={scoreColor(annualAverage)}
                    />
                  </Grid>
                )}
                {results.classe && (
                  <Grid size={{ xs: 12, md: annualAverage !== null ? 6 : 12 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Classe
                    </Typography>
                    <Typography variant='body1'>
                      {results.classe.name}
                      {currentSemester ? ` · ${currentSemester.name}` : ''}
                    </Typography>
                  </Grid>
                )}
                {results.general_appreciation && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Appréciation générale
                    </Typography>
                    <Typography variant='body2'>{results.general_appreciation}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell padding='checkbox' />
                  <TableCell>Matière</TableCell>
                  <TableCell align='right'>Coef.</TableCell>
                  <TableCell align='right'>Moyenne</TableCell>
                  <TableCell align='right' sx={hideOnMobile}>
                    Moy. classe
                  </TableCell>
                  <TableCell align='right'>Rang</TableCell>
                  <TableCell sx={hideOnMobile}>Appréciation</TableCell>
                  <TableCell sx={hideOnMobile}>Professeur</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.subjects.map((row) => (
                  <SubjectRow key={row.subject?.id ?? row.subject?.name} row={row} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Stack>
  );
}

export default StudentGradesReport;
