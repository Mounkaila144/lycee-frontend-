'use client';

import React, { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

import { createApiClient } from '@/shared/lib/api-client';

const api = () => createApiClient();

function toArray<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp as T[];
  const r = resp as { data?: unknown };
  if (r && Array.isArray(r.data)) return r.data as T[];
  const nested = (r?.data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as T[];
  return [];
}

interface Option { id: number; name: string; code?: string }
interface SubjectCol { subject_id: number; name: string; code?: string; coefficient: number }
interface SubjectResult { subject_id: number; average: number | null; coefficient: number; weighted: number | null }
interface StudentRow {
  student_id: number;
  matricule: string;
  firstname: string;
  lastname: string;
  subjects: SubjectResult[];
  general_average: number | null;
  rank: number | null;
}
interface BulletinData {
  class: { id: number; name: string };
  semester_id: number | null;
  subjects: SubjectCol[];
  students: StudentRow[];
  stats: { students: number; class_average: number | null; highest: number | null; lowest: number | null; pass_count: number };
}

const fmt = (v: number | null): string => (v == null ? '—' : v.toFixed(2).replace('.', ','));

export const SecondaryBulletins: React.FC = () => {
  const [classId, setClassId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [downloading, setDownloading] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const { data: classesResp } = useQuery({ queryKey: ['classes'], queryFn: async () => (await api().get('/admin/classes')).data });
  const { data: semestersResp } = useQuery({ queryKey: ['semesters'], queryFn: async () => (await api().get('/admin/semesters')).data });
  const classes = useMemo(() => toArray<Option>(classesResp), [classesResp]);
  const semesters = useMemo(() => toArray<Option>(semestersResp), [semestersResp]);

  const canQuery = !!classId;
  const { data: bulletinResp, isLoading, isError } = useQuery({
    queryKey: ['bulletins', classId, semesterId],
    queryFn: async () => (await api().get('/admin/bulletins', { params: { class_id: classId, semester_id: semesterId || undefined } })).data,
    enabled: canQuery,
  });
  const bulletin = (bulletinResp as { data?: BulletinData })?.data;
  const subjects = bulletin?.subjects ?? [];
  const students = bulletin?.students ?? [];
  const stats = bulletin?.stats;

  const downloadPdf = async (student: StudentRow) => {
    setDownloading(student.student_id);
    try {
      const res = await api().get(`/admin/bulletins/${student.student_id}/pdf`, {
        params: { class_id: classId, semester_id: semesterId || undefined },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin-${student.matricule || student.student_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      notify('Échec du téléchargement du bulletin.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const downloadAll = async () => {
    for (const student of students) {
      if (student.general_average != null) {
        // eslint-disable-next-line no-await-in-loop
        await downloadPdf(student);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Bulletins de notes</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Classe</InputLabel>
                <Select label="Classe" value={classId} onChange={e => setClassId(String(e.target.value))}>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Période</InputLabel>
                <Select label="Période" value={semesterId} onChange={e => setSemesterId(String(e.target.value))}>
                  <MenuItem value="">Toutes</MenuItem>
                  {semesters.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button fullWidth variant="outlined" disabled={!students.length} onClick={downloadAll}>
                Générer toute la classe
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {!canQuery && <Alert severity="info">Sélectionnez une classe pour afficher les bulletins.</Alert>}
      {canQuery && isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
      {canQuery && isError && <Alert severity="error">Erreur lors du chargement des bulletins.</Alert>}
      {canQuery && !isLoading && !isError && students.length === 0 && <Alert severity="warning">Aucun élève dans cette classe.</Alert>}

      {canQuery && !isLoading && students.length > 0 && (
        <>
          {stats && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip color="primary" label={`Moyenne classe : ${fmt(stats.class_average)}`} />
              <Chip label={`Plus haute : ${fmt(stats.highest)}`} />
              <Chip label={`Plus basse : ${fmt(stats.lowest)}`} />
              <Chip color="success" label={`Admis (≥10) : ${stats.pass_count}/${stats.students}`} />
            </Box>
          )}
          <Card>
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Élève</TableCell>
                      {subjects.map(s => (
                        <TableCell key={s.subject_id} align="center" title={`${s.name} (coef ${s.coefficient})`}>
                          {s.code ?? s.name}
                          <Typography variant="caption" display="block" color="text.secondary">coef {s.coefficient}</Typography>
                        </TableCell>
                      ))}
                      <TableCell align="center"><strong>Moy. gén.</strong></TableCell>
                      <TableCell align="center">Rang</TableCell>
                      <TableCell align="center">PDF</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map(st => {
                      const bySubject = new Map(st.subjects.map(s => [s.subject_id, s]));
                      return (
                        <TableRow key={st.student_id} hover>
                          <TableCell>{st.lastname} {st.firstname}</TableCell>
                          {subjects.map(col => {
                            const r = bySubject.get(col.subject_id);
                            return <TableCell key={col.subject_id} align="center">{fmt(r?.average ?? null)}</TableCell>;
                          })}
                          <TableCell align="center"><strong>{fmt(st.general_average)}</strong></TableCell>
                          <TableCell align="center">{st.rank ?? '—'}</TableCell>
                          <TableCell align="center">
                            <Button size="small" variant="outlined" disabled={downloading === st.student_id || st.general_average == null} onClick={() => downloadPdf(st)}>
                              {downloading === st.student_id ? '…' : 'PDF'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
