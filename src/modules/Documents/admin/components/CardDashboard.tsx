'use client';

import React, { useMemo, useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

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

interface ApiStudent { id: number; firstname?: string; lastname?: string; matricule?: string }
interface ApiCard {
  id: number;
  card_number: string;
  issue_date: string | null;
  expiry_date: string | null;
  verification_code: string | null;
  status: string;
  student?: { id: number; matricule?: string; name?: string; classe?: string | null } | null;
}

const fmtDate = (d: string | null): string => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

export const CardDashboard: React.FC = () => {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [downloading, setDownloading] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const { data: cardsResp, isLoading, isError } = useQuery({
    queryKey: ['secondary-cards'],
    queryFn: async () => (await api().get('/admin/documents/secondary-cards')).data,
  });
  const cards = useMemo(() => toArray<ApiCard>(cardsResp), [cardsResp]);

  const { data: studentsResp } = useQuery({
    queryKey: ['students-for-cards'],
    queryFn: async () => (await api().get('/admin/enrollment/students', { params: { per_page: 100 } })).data,
  });
  const students = useMemo(
    () => toArray<ApiStudent>(studentsResp).map(s => ({ id: s.id, label: `${s.matricule ?? ''} — ${s.lastname ?? ''} ${s.firstname ?? ''}`.trim() })),
    [studentsResp],
  );

  const createMutation = useMutation({
    mutationFn: async () => (await api().post('/admin/documents/secondary-cards', { student_id: Number(newStudentId) })).data,
    onSuccess: () => {
      notify('Carte générée.');
      setCreateOpen(false);
      setNewStudentId('');
      qc.invalidateQueries({ queryKey: ['secondary-cards'] });
    },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la génération.', 'error'),
  });

  const handleDownload = async (card: ApiCard) => {
    setDownloading(card.id);
    try {
      const res = await api().get(`/admin/documents/secondary-cards/${card.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${card.card_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      notify('Échec du téléchargement.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Cartes Scolaires</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>+ Nouvelle Carte</Button>
      </Box>

      <Card>
        <CardContent>
          {isLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
          {isError && <Alert severity="error">Erreur lors du chargement des cartes.</Alert>}
          {!isLoading && !isError && cards.length === 0 && <Alert severity="info">Aucune carte enregistrée. Générez-en une.</Alert>}
          {!isLoading && !isError && cards.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>N° Carte</TableCell>
                    <TableCell>Élève</TableCell>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell>Émise le</TableCell>
                    <TableCell>Expire le</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cards.map(card => (
                    <TableRow key={card.id} hover>
                      <TableCell><Typography fontWeight="medium">{card.card_number}</Typography></TableCell>
                      <TableCell>{card.student?.name ?? '—'}</TableCell>
                      <TableCell>{card.student?.matricule ?? '—'}</TableCell>
                      <TableCell>{card.student?.classe ?? '—'}</TableCell>
                      <TableCell>{fmtDate(card.issue_date)}</TableCell>
                      <TableCell>{fmtDate(card.expiry_date)}</TableCell>
                      <TableCell><Chip size="small" label={card.verification_code} /></TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" disabled={downloading === card.id} onClick={() => handleDownload(card)}>
                          {downloading === card.id ? '…' : 'PDF'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle carte scolaire</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Élève</InputLabel>
            <Select label="Élève" value={newStudentId} onChange={e => setNewStudentId(String(e.target.value))}>
              {students.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" disabled={!newStudentId || createMutation.isPending} onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? 'Génération…' : 'Générer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
