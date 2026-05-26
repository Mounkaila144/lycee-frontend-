'use client';

import React, { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

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

interface ApiStudent {
  id: number;
  firstname?: string;
  lastname?: string;
  matricule?: string;
}

interface ApiDocument {
  id: number;
  document_type: string;
  document_number: string;
  issue_date: string | null;
  status: string;
  verification_code: string | null;
  student?: ApiStudent | null;
  academic_year?: { id: number; name?: string } | null;
}

const TRANSCRIPT_TYPES = ['transcript_semester', 'transcript_global', 'transcript_provisional'];

const TYPE_LABELS: Record<string, string> = {
  transcript_semester: 'Semestriel',
  transcript_global: 'Global',
  transcript_provisional: 'Provisoire',
};

const STATUS_LABELS: Record<string, string> = {
  issued: 'Émis',
  cancelled: 'Annulé',
  replaced: 'Remplacé',
};

const getStatusChipColor = (status: string): 'default' | 'success' | 'error' => {
  switch (status) {
    case 'issued': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const fmtDate = (d: string | null): string => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const studentName = (s?: ApiStudent | null): string => (s ? `${s.firstname ?? ''} ${s.lastname ?? ''}`.trim() || '—' : '—');

const GENERATION_DISABLED_TOOLTIP = 'Indisponible (modèle non configuré)';

export const TranscriptDashboard: React.FC = () => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<ApiDocument | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const { data: resp, isLoading, isError } = useQuery({
    queryKey: ['transcripts-register'],
    queryFn: async () => (await api().get('/admin/documents/verification/register', { params: { per_page: 200 } })).data,
  });

  const transcripts = useMemo(
    () => toArray<ApiDocument>(resp).filter(d => TRANSCRIPT_TYPES.includes(d.document_type)),
    [resp],
  );

  const handleViewDetail = (doc: ApiDocument) => {
    setSelected(doc);
    setDetailOpen(true);
  };

  const total = transcripts.length;
  const issued = transcripts.filter(t => t.status === 'issued').length;
  const semester = transcripts.filter(t => t.document_type === 'transcript_semester').length;
  const global = transcripts.filter(t => t.document_type === 'transcript_global').length;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Documents Officiels</Link>
        <Typography color="text.primary">Relevés de Notes</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Relevés de Notes</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={GENERATION_DISABLED_TOOLTIP}>
            <span><Button variant="outlined" disabled>Génération par Lot</Button></span>
          </Tooltip>
          <Tooltip title={GENERATION_DISABLED_TOOLTIP}>
            <span><Button variant="contained" disabled>+ Générer un Relevé</Button></span>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total relevés', value: total, color: '#9c27b0' },
          { label: 'Émis', value: issued, color: '#4caf50' },
          { label: 'Semestriels', value: semester, color: '#1976d2' },
          { label: 'Globaux', value: global, color: '#ff9800' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Registre des Relevés</Typography>
          {isLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
          {isError && <Alert severity="error">Erreur lors du chargement du registre.</Alert>}
          {!isLoading && !isError && transcripts.length === 0 && <Alert severity="info">Aucun relevé enregistré.</Alert>}
          {!isLoading && !isError && transcripts.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Document</TableCell>
                    <TableCell>Étudiant</TableCell>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Émis le</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transcripts.map(t => (
                    <TableRow key={t.id} hover>
                      <TableCell><Typography fontWeight="medium">{t.document_number}</Typography></TableCell>
                      <TableCell><Typography fontWeight="medium">{studentName(t.student)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{t.student?.matricule ?? '—'}</Typography></TableCell>
                      <TableCell>
                        <Chip size="small" label={TYPE_LABELS[t.document_type] ?? t.document_type} variant="outlined" />
                      </TableCell>
                      <TableCell>{fmtDate(t.issue_date)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={STATUS_LABELS[t.status] ?? t.status} color={getStatusChipColor(t.status)} />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" onClick={() => handleViewDetail(t)}>Détails</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Relevé {selected?.document_number}</Typography>
              <Typography variant="body2" color="text.secondary">{studentName(selected?.student)}</Typography>
            </Box>
            {selected && (
              <Chip label={STATUS_LABELS[selected.status] ?? selected.status} color={getStatusChipColor(selected.status)} />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Étudiant</Typography>
                <Typography fontWeight="bold">{studentName(selected?.student)}</Typography>
                <Typography variant="body2">{selected?.student?.matricule ?? '—'}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                <Typography fontWeight="bold">{selected ? (TYPE_LABELS[selected.document_type] ?? selected.document_type) : ''}</Typography>
                <Typography variant="body2">{selected?.academic_year?.name ?? ''}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Date d&apos;émission</Typography>
                <Typography fontWeight="bold">{fmtDate(selected?.issue_date ?? null)}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Code de vérification</Typography>
                <Typography>{selected?.verification_code || 'Non généré'}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
