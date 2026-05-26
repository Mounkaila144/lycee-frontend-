'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

const TYPES = [
  { value: 'certificate_schooling', label: 'Certificat de scolarité' },
  { value: 'certificate_enrollment', label: "Attestation d'inscription" },
];

export const SecondaryCertificates: React.FC = () => {
  const qc = useQueryClient();
  const [studentId, setStudentId] = useState('');
  const [docType, setDocType] = useState('certificate_schooling');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const { data: studentsResp } = useQuery({
    queryKey: ['students-for-certs'],
    queryFn: async () => (await api().get('/admin/enrollment/students', { params: { per_page: 100 } })).data,
  });
  const students = useMemo(
    () => toArray<any>(studentsResp).map(s => ({ id: s.id, label: `${s.matricule} — ${s.lastname} ${s.firstname}` })),
    [studentsResp],
  );

  const { data: docsResp, isLoading } = useQuery({
    queryKey: ['school-certificates'],
    queryFn: async () => (await api().get('/admin/documents/school-certificates')).data,
  });
  const docs = useMemo(() => toArray<any>(docsResp), [docsResp]);

  const createMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/documents/school-certificates', { student_id: Number(studentId), document_type: docType })).data,
    onSuccess: () => { notify('Document généré.'); qc.invalidateQueries({ queryKey: ['school-certificates'] }); },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la génération.', 'error'),
  });

  const handleDownload = async (id: number, number: string) => {
    try {
      const res = await api().get(`/admin/documents/school-certificates/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      notify('Échec du téléchargement.', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Certificats &amp; Attestations</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Élève</InputLabel>
                <Select label="Élève" value={studentId} onChange={e => setStudentId(String(e.target.value))}>
                  {students.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type de document</InputLabel>
                <Select label="Type de document" value={docType} onChange={e => setDocType(String(e.target.value))}>
                  {TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button fullWidth variant="contained" disabled={!studentId || createMutation.isPending} onClick={() => createMutation.mutate()}>
                {createMutation.isPending ? 'Génération…' : 'Générer'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Documents délivrés</Typography>
          {isLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
          {!isLoading && docs.length === 0 && <Alert severity="info">Aucun document généré.</Alert>}
          {!isLoading && docs.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>N°</TableCell><TableCell>Type</TableCell><TableCell>Élève</TableCell><TableCell>Classe</TableCell><TableCell>Date</TableCell><TableCell>Code</TableCell><TableCell align="center">Action</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {docs.map(d => (
                    <TableRow key={d.id} hover>
                      <TableCell>{d.document_number}</TableCell>
                      <TableCell>{d.type_label}</TableCell>
                      <TableCell>{d.student?.name ?? '—'}</TableCell>
                      <TableCell>{d.student?.classe ?? '—'}</TableCell>
                      <TableCell>{d.issue_date ? new Date(d.issue_date).toLocaleDateString('fr-FR') : '—'}</TableCell>
                      <TableCell><Chip size="small" label={d.verification_code} /></TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" onClick={() => handleDownload(d.id, d.document_number)}>PDF</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
