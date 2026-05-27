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

interface Option { id: number; name: string }
interface SubjectResult { subject_id: number; average: number | null }
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
  subjects: { subject_id: number; name: string; code?: string; coefficient: number }[];
  students: StudentRow[];
  stats: { students: number; class_average: number | null };
}

const fmt = (v: number | null): string => (v == null ? '—' : v.toFixed(2).replace('.', ','));

/**
 * Annual transcript (relevé de notes annuel) — aggregates grades over all
 * periods of the year. Reuses the secondary bulletin endpoint with no period.
 */
export const TranscriptDashboard: React.FC = () => {
  const [classId, setClassId] = useState('');
  const [downloading, setDownloading] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const { data: classesResp } = useQuery({ queryKey: ['classes'], queryFn: async () => (await api().get('/admin/classes')).data });
  const classes = useMemo(() => toArray<Option>(classesResp), [classesResp]);

  const canQuery = !!classId;
  const { data: bulletinResp, isLoading, isError } = useQuery({
    queryKey: ['transcripts', classId],
    queryFn: async () => (await api().get('/admin/bulletins', { params: { class_id: classId } })).data,
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
        params: { class_id: classId },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `releve-${student.matricule || student.student_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      notify('Échec du téléchargement du relevé.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Relevés de notes (annuels)</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Classe</InputLabel>
                <Select label="Classe" value={classId} onChange={e => setClassId(String(e.target.value))}>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {!canQuery && <Alert severity="info">Sélectionnez une classe pour afficher les relevés annuels.</Alert>}
      {canQuery && isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
      {canQuery && isError && <Alert severity="error">Erreur lors du chargement des relevés.</Alert>}
      {canQuery && !isLoading && !isError && students.length === 0 && <Alert severity="warning">Aucun élève dans cette classe.</Alert>}

      {canQuery && !isLoading && students.length > 0 && (
        <Card>
          <CardContent>
            {stats && (
              <Box sx={{ mb: 2 }}>
                <Chip color="primary" label={`Moyenne classe : ${fmt(stats.class_average)} · ${stats.students} élève(s)`} />
              </Box>
            )}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Élève</TableCell>
                    {subjects.map(s => <TableCell key={s.subject_id} align="center">{s.code ?? s.name}</TableCell>)}
                    <TableCell align="center"><strong>Moy. gén.</strong></TableCell>
                    <TableCell align="center">Rang</TableCell>
                    <TableCell align="center">Relevé PDF</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map(st => {
                    const bySubject = new Map(st.subjects.map(s => [s.subject_id, s]));
                    return (
                      <TableRow key={st.student_id} hover>
                        <TableCell>{st.lastname} {st.firstname}</TableCell>
                        {subjects.map(col => <TableCell key={col.subject_id} align="center">{fmt(bySubject.get(col.subject_id)?.average ?? null)}</TableCell>)}
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
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
