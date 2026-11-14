'use client';

import React, { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  useFamilyAbsences,
  useFamilyJustifications,
  useFamilyStudents,
  useSubmitFamilyJustification,
} from '../hooks';

import type { JustificationStatus, JustificationType } from '../../types';

import {
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
  JUSTIFICATION_STATUS_LABELS,
  JUSTIFICATION_TYPE_LABELS,
} from '../../types';

const STATUS_COLORS: Record<JustificationStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const today = (): string => new Date().toISOString().slice(0, 10);

const formatDate = (value?: string | null): string => (value ? new Date(value).toLocaleDateString('fr-FR') : '-');

const errorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
  const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;

  return firstError || data?.message || fallback;
};

const emptyForm = () => ({
  absence_date_from: today(),
  absence_date_to: today(),
  type: 'medical' as JustificationType,
  reason: '',
  document: null as File | null,
});

/**
 * Portail Parent / Élève : absences enregistrées et justificatifs.
 * Un Parent choisit l'un de ses enfants ; un Élève ne voit que lui-même (contrôlé par l'API).
 */
export const FamilyJustificationPanel: React.FC = () => {
  const [studentId, setStudentId] = useState<number | undefined>();
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useFamilyStudents();
  const { data: absences = [], isLoading: absencesLoading } = useFamilyAbsences(studentId);
  const { data: justifications = [] } = useFamilyJustifications(studentId);
  const submitJustification = useSubmitFamilyJustification();

  useEffect(() => {
    if (!studentId && students.length > 0) {
      setStudentId(students[0].id);
    }
  }, [students, studentId]);

  const handleSubmit = () => {
    if (!studentId) return;

    if (!form.reason.trim()) {
      setSnackbar({ open: true, message: 'Le motif est obligatoire', severity: 'error' });

      return;
    }

    submitJustification.mutate(
      {
        student_id: studentId,
        absence_date_from: form.absence_date_from,
        absence_date_to: form.absence_date_to,
        type: form.type,
        reason: form.reason.trim(),
        document: form.document ?? undefined,
      },
      {
        onSuccess: () => {
          setForm(emptyForm());
          setSnackbar({ open: true, message: 'Justificatif envoyé, en attente de validation', severity: 'success' });
        },
        onError: err => setSnackbar({ open: true, message: errorMessage(err, 'Envoi impossible'), severity: 'error' }),
      },
    );
  };

  if (studentsLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Absences &amp; justificatifs
      </Typography>

      {studentsError && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage(studentsError, 'Impossible de charger les élèves')}</Alert>}
      {!studentsError && students.length === 0 && (
        <Alert severity="info">Aucun élève n&apos;est rattaché à votre compte.</Alert>
      )}

      {students.length > 1 && (
        <FormControl size="small" sx={{ minWidth: 260, mb: 3 }}>
          <InputLabel>Enfant</InputLabel>
          <Select label="Enfant" value={studentId ?? ''} onChange={e => setStudentId(Number(e.target.value))}>
            {students.map(s => (
              <MenuItem key={s.id} value={s.id}>{s.lastname} {s.firstname}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {studentId && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6">Soumettre un justificatif</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Du"
                    type="date"
                    value={form.absence_date_from}
                    onChange={e => setForm(f => ({ ...f, absence_date_from: e.target.value }))}
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                  />
                  <TextField
                    label="Au"
                    type="date"
                    value={form.absence_date_to}
                    onChange={e => setForm(f => ({ ...f, absence_date_to: e.target.value }))}
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                  />
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as JustificationType }))}>
                    {(Object.keys(JUSTIFICATION_TYPE_LABELS) as JustificationType[]).map(type => (
                      <MenuItem key={type} value={type}>{JUSTIFICATION_TYPE_LABELS[type]}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Motif"
                  multiline
                  rows={3}
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  fullWidth
                />
                <Button variant="outlined" component="label">
                  {form.document ? form.document.name : 'Joindre un document (PDF, JPG, PNG — 5 Mo max)'}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setForm(f => ({ ...f, document: e.target.files?.[0] ?? null }))}
                  />
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={submitJustification.isPending}>
                  Envoyer
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Absences et retards enregistrés</Typography>
                {absencesLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Classe / Matière</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {absences.length === 0 && (
                          <TableRow><TableCell colSpan={3} align="center">Aucune absence enregistrée.</TableCell></TableRow>
                        )}
                        {absences.map(record => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.session?.session_date)}</TableCell>
                            <TableCell>{record.session?.classe?.name ?? '-'}{record.session?.subject ? ` / ${record.session.subject.name}` : ''}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={ATTENDANCE_STATUS_LABELS[record.status]}
                                sx={{ bgcolor: ATTENDANCE_STATUS_COLORS[record.status], color: 'white' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Justificatifs envoyés</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Période</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {justifications.length === 0 && (
                        <TableRow><TableCell colSpan={3} align="center">Aucun justificatif.</TableCell></TableRow>
                      )}
                      {justifications.map(j => (
                        <TableRow key={j.id}>
                          <TableCell>{formatDate(j.absence_date_from)} → {formatDate(j.absence_date_to)}</TableCell>
                          <TableCell>{JUSTIFICATION_TYPE_LABELS[j.type] ?? j.type}</TableCell>
                          <TableCell>
                            <Chip size="small" label={JUSTIFICATION_STATUS_LABELS[j.status]} color={STATUS_COLORS[j.status]} />
                            {j.validation_notes && (
                              <Typography variant="caption" display="block" color="text.secondary">{j.validation_notes}</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
