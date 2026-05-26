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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
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

interface ApiDiploma {
  id: number;
  diploma_number: string | null;
  register_number: string | null;
  diploma_type: string | null;
  honors: string | null;
  final_gpa: string | number | null;
  specialization: string | null;
  issue_date: string | null;
  graduation_date: string | null;
  delivered_at: string | null;
  recipient_name: string | null;
  supplement_generated: boolean;
  is_duplicate: boolean;
  student?: ApiStudent | null;
  programme?: { id: number; name?: string; code?: string } | null;
}

const HONORS_LABELS: Record<string, string> = {
  passable: 'Passable',
  assez_bien: 'Assez Bien',
  bien: 'Bien',
  tres_bien: 'Très Bien',
  excellent: 'Excellent',
  none: 'Sans mention',
};

const fmtDate = (d: string | null): string => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const studentName = (s?: ApiStudent | null): string => (s ? `${s.firstname ?? ''} ${s.lastname ?? ''}`.trim() || '—' : '—');

const GENERATION_DISABLED_TOOLTIP = 'Indisponible (modèle non configuré)';

export const DiplomaDashboard: React.FC = () => {
  const qc = useQueryClient();
  const [detailOpen, setDetailOpen] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [selectedDiploma, setSelectedDiploma] = useState<ApiDiploma | null>(null);
  const [deliverForm, setDeliverForm] = useState({ recipient_name: '', recipient_id_type: 'cni', recipient_id_number: '', delivery_notes: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const { data: resp, isLoading, isError } = useQuery({
    queryKey: ['diploma-register'],
    queryFn: async () => (await api().get('/admin/documents/diplomas', { params: { per_page: 100 } })).data,
  });
  const diplomas = useMemo(() => toArray<ApiDiploma>(resp), [resp]);

  const deliverMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: typeof deliverForm }) =>
      (await api().patch(`/admin/documents/diplomas/${id}/deliver`, payload)).data,
    onSuccess: () => {
      notify('Diplôme marqué comme délivré.');
      setDeliverOpen(false);
      qc.invalidateQueries({ queryKey: ['diploma-register'] });
    },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Échec de la délivrance.', 'error'),
  });

  const handleViewDetail = (diploma: ApiDiploma) => {
    setSelectedDiploma(diploma);
    setDetailOpen(true);
  };

  const handleDeliver = (diploma: ApiDiploma) => {
    setSelectedDiploma(diploma);
    setDeliverForm({ recipient_name: '', recipient_id_type: 'cni', recipient_id_number: '', delivery_notes: '' });
    setDeliverOpen(true);
  };

  const deliveredCount = diplomas.filter(d => d.delivered_at).length;
  const pendingCount = diplomas.filter(d => !d.delivered_at).length;
  const duplicateCount = diplomas.filter(d => d.is_duplicate).length;
  const totalCount = diplomas.length;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Documents Officiels</Link>
        <Typography color="text.primary">Diplômes</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Registre des Diplômes</Typography>
        <Tooltip title={GENERATION_DISABLED_TOOLTIP}>
          <span>
            <Button variant="contained" disabled>+ Générer un Diplôme</Button>
          </span>
        </Tooltip>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total diplômes', value: totalCount, color: '#9c27b0' },
          { label: 'Délivrés', value: deliveredCount, color: '#4caf50' },
          { label: 'En attente de délivrance', value: pendingCount, color: '#ff9800' },
          { label: 'Duplicatas', value: duplicateCount, color: '#1976d2' },
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
          <Typography variant="h6" sx={{ mb: 2 }}>Liste des Diplômes</Typography>
          {isLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
          {isError && <Alert severity="error">Erreur lors du chargement du registre.</Alert>}
          {!isLoading && !isError && diplomas.length === 0 && <Alert severity="info">Aucun diplôme enregistré.</Alert>}
          {!isLoading && !isError && diplomas.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Diplôme</TableCell>
                    <TableCell>Étudiant</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Mention</TableCell>
                    <TableCell>Délivré</TableCell>
                    <TableCell>Supplément</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {diplomas.map(diploma => (
                    <TableRow key={diploma.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{diploma.diploma_number ?? diploma.register_number ?? '—'}</Typography>
                        {diploma.is_duplicate && <Chip size="small" label="Duplicata" color="info" variant="outlined" sx={{ mt: 0.5 }} />}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{studentName(diploma.student)}</Typography>
                        <Typography variant="caption" color="text.secondary">{diploma.student?.matricule ?? ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={diploma.diploma_type ?? '—'} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography>{diploma.honors ? (HONORS_LABELS[diploma.honors] ?? diploma.honors) : 'Sans mention'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={diploma.delivered_at ? 'Délivré' : 'Non délivré'} color={diploma.delivered_at ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={diploma.supplement_generated ? 'Oui' : 'Non'}
                          color={diploma.supplement_generated ? 'success' : 'default'}
                          variant={diploma.supplement_generated ? 'filled' : 'outlined'} />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Button size="small" variant="outlined" onClick={() => handleViewDetail(diploma)}>Détails</Button>
                          {!diploma.delivered_at && (
                            <Button size="small" variant="contained" color="success" onClick={() => handleDeliver(diploma)}>Délivrer</Button>
                          )}
                          {!diploma.supplement_generated && (
                            <Tooltip title={GENERATION_DISABLED_TOOLTIP}>
                              <span>
                                <Button size="small" variant="outlined" color="info" disabled>Supplément</Button>
                              </span>
                            </Tooltip>
                          )}
                          <Tooltip title={GENERATION_DISABLED_TOOLTIP}>
                            <span>
                              <Button size="small" variant="outlined" color="secondary" disabled>Dupliquer</Button>
                            </span>
                          </Tooltip>
                        </Box>
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
              <Typography variant="h6">Diplôme {selectedDiploma?.diploma_number ?? selectedDiploma?.register_number ?? ''}</Typography>
              <Typography variant="body2" color="text.secondary">{studentName(selectedDiploma?.student)}</Typography>
            </Box>
            {selectedDiploma && (
              <Chip label={selectedDiploma.delivered_at ? 'Délivré' : 'Non délivré'} color={selectedDiploma.delivered_at ? 'success' : 'default'} />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Étudiant</Typography>
                <Typography fontWeight="bold">{studentName(selectedDiploma?.student)}</Typography>
                <Typography variant="body2">{selectedDiploma?.student?.matricule ?? '—'}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Programme / Spécialité</Typography>
                <Typography fontWeight="bold">{selectedDiploma?.programme?.name ?? '—'}</Typography>
                <Typography variant="body2">{selectedDiploma?.specialization ?? selectedDiploma?.programme?.code ?? ''}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Mention / Moyenne</Typography>
                <Typography fontWeight="bold">{selectedDiploma?.honors ? (HONORS_LABELS[selectedDiploma.honors] ?? selectedDiploma.honors) : 'Sans mention'}</Typography>
                <Typography variant="body2">{selectedDiploma?.final_gpa != null ? `${selectedDiploma.final_gpa}/20` : ''}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Délivré le</Typography>
                <Typography fontWeight="bold">{fmtDate(selectedDiploma?.delivered_at ?? null)}</Typography>
                {selectedDiploma?.recipient_name && <Typography variant="body2">À : {selectedDiploma.recipient_name}</Typography>}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deliverOpen} onClose={() => setDeliverOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Délivrer le Diplôme</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Diplôme : {selectedDiploma?.diploma_number ?? selectedDiploma?.register_number ?? ''} - {studentName(selectedDiploma?.student)}
            </Alert>
            <TextField label="Nom du destinataire" fullWidth required
              value={deliverForm.recipient_name}
              onChange={e => setDeliverForm(f => ({ ...f, recipient_name: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Type de pièce</InputLabel>
              <Select label="Type de pièce" value={deliverForm.recipient_id_type}
                onChange={e => setDeliverForm(f => ({ ...f, recipient_id_type: String(e.target.value) }))}>
                <MenuItem value="cni">CNI</MenuItem>
                <MenuItem value="passport">Passeport</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>
            <TextField label="N° de pièce" fullWidth required
              value={deliverForm.recipient_id_number}
              onChange={e => setDeliverForm(f => ({ ...f, recipient_id_number: e.target.value }))} />
            <TextField label="Notes" fullWidth multiline rows={2}
              value={deliverForm.delivery_notes}
              onChange={e => setDeliverForm(f => ({ ...f, delivery_notes: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliverOpen(false)}>Annuler</Button>
          <Button variant="contained" color="success"
            disabled={!deliverForm.recipient_name || !deliverForm.recipient_id_number || deliverMutation.isPending}
            onClick={() => selectedDiploma && deliverMutation.mutate({ id: selectedDiploma.id, payload: deliverForm })}>
            {deliverMutation.isPending ? 'Envoi…' : 'Confirmer la délivrance'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
