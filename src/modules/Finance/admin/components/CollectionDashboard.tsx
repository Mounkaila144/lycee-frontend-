'use client';

import React, { useMemo, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';

import { createApiClient } from '@/shared/lib/api-client';

const api = () => createApiClient();

const formatCurrency = (n: number | string | null | undefined): string => {
  const v = Number(n ?? 0);

  return new Intl.NumberFormat('fr-FR').format(Math.round(v)) + ' F CFA';
};

const studentName = (s: any): string => (s ? `${s.firstname ?? ''} ${s.lastname ?? ''}`.trim() || '—' : '—');

const firstError = (e: any): string | undefined => {
  const errors = e?.response?.data?.errors as Record<string, string[]> | undefined;

  if (errors) {
    const first = Object.values(errors)[0];

    if (Array.isArray(first) && first.length) {
      return first[0];
    }
  }

  return undefined;
};

const REMINDER_TYPE_LABELS: Record<string, string> = {
  first_notice: '1er avis',
  second_notice: '2e avis',
  final_notice: 'Avis final',
  formal_notice: 'Mise en demeure',
  email: 'Email',
  sms: 'SMS',
};

const REMINDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  sent: 'Envoyé',
  failed: 'Échec',
};

const REMINDER_STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  pending: 'warning',
  sent: 'success',
  failed: 'error',
};

const BLOCK_TYPE_LABELS: Record<string, string> = {
  enrollment: 'Inscription',
  exam_access: 'Accès examens',
  documents: 'Documents',
  reenrollment: 'Réinscription',
  all: 'Tous les services',
};

const AGING_LABELS: [string, string][] = [
  ['0-30', '0–30 jours'],
  ['31-60', '31–60 jours'],
  ['61-90', '61–90 jours'],
  ['90+', '+90 jours'],
];

type ApiReminder = {
  id: number;
  reminder_type: string;
  status: string;
  reminder_date: string;
  sent_at: string | null;
  send_methods: string[] | null;
  invoice?: { invoice_number?: string } | null;
  student?: { firstname?: string; lastname?: string; matricule?: string } | null;
};

type ApiBlock = {
  id: number;
  block_type: string;
  reason: string;
  blocked_at: string;
  unblocked_at: string | null;
  is_active: boolean;
  student?: { firstname?: string; lastname?: string; matricule?: string } | null;
};

type ApiStudent = {
  id: number;
  firstname?: string;
  lastname?: string;
  matricule?: string;
};

export const CollectionDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [blockOpen, setBlockOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const [blockForm, setBlockForm] = useState<{ student_id: string; block_type: string; reason: string }>({ student_id: '', block_type: 'all', reason: '' });

  const { data: statsResp, isLoading: statsLoading } = useQuery({
    queryKey: ['finance-collection-stats'],
    queryFn: async () => (await api().get('/admin/finance/collection/statistics')).data,
  });

  const stats = (statsResp as any)?.data ?? {};
  const aging = stats.aging ?? {};

  const { data: remindersResp, isLoading: remindersLoading, isError: remindersError } = useQuery({
    queryKey: ['finance-collection-reminders'],
    queryFn: async () => (await api().get('/admin/finance/collection/reminders', { params: { per_page: 100 } })).data,
    enabled: tab === 0,
  });

  const reminders: ApiReminder[] = (remindersResp as any)?.data ?? [];

  const { data: blocksResp, isLoading: blocksLoading, isError: blocksError } = useQuery({
    queryKey: ['finance-collection-blocks'],
    queryFn: async () => (await api().get('/admin/finance/collection/blocks', { params: { per_page: 100 } })).data,
    enabled: tab === 1,
  });

  const blocks: ApiBlock[] = (blocksResp as any)?.data ?? [];

  const { data: studentsResp } = useQuery({
    queryKey: ['finance-collection-students'],
    queryFn: async () => (await api().get('/admin/students', { params: { per_page: 100 } })).data,
    enabled: blockOpen,
  });

  const students: ApiStudent[] = (studentsResp as any)?.data ?? [];

  const generateReminders = useMutation({
    mutationFn: async () => (await api().post('/admin/finance/collection/reminders/generate')).data,
    onSuccess: (resp: any) => {
      queryClient.invalidateQueries({ queryKey: ['finance-collection-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['finance-collection-stats'] });
      setSnackbar({ open: true, message: resp?.message || 'Relances générées', severity: 'success' });
    },
    onError: (e: any) => setSnackbar({ open: true, message: e?.response?.data?.message || 'Erreur lors de la génération', severity: 'error' }),
  });

  const sendReminders = useMutation({
    mutationFn: async () => (await api().post('/admin/finance/collection/reminders/send')).data,
    onSuccess: (resp: any) => {
      queryClient.invalidateQueries({ queryKey: ['finance-collection-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['finance-collection-stats'] });
      setSnackbar({ open: true, message: resp?.message || 'Relances envoyées', severity: 'success' });
    },
    onError: (e: any) => setSnackbar({ open: true, message: e?.response?.data?.message || 'Erreur lors de l\'envoi', severity: 'error' }),
  });

  const blockServices = useMutation({
    mutationFn: async () => (await api().post('/admin/finance/collection/blocks', {
      student_id: Number(blockForm.student_id),
      block_type: blockForm.block_type,
      reason: blockForm.reason,
    })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-collection-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['finance-collection-stats'] });
      setBlockOpen(false);
      setBlockForm({ student_id: '', block_type: 'all', reason: '' });
      setSnackbar({ open: true, message: 'Services bloqués avec succès', severity: 'success' });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message || firstError(e) || 'Erreur lors du blocage';

      setSnackbar({ open: true, message: String(msg), severity: 'error' });
    },
  });

  const unblockServices = useMutation({
    mutationFn: async (id: number) => (await api().post(`/admin/finance/collection/blocks/${id}/unblock`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-collection-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['finance-collection-stats'] });
      setSnackbar({ open: true, message: 'Blocage levé', severity: 'success' });
    },
    onError: (e: any) => setSnackbar({ open: true, message: e?.response?.data?.message || 'Erreur lors du déblocage', severity: 'error' }),
  });

  const totalOverdueInAging = useMemo(
    () => AGING_LABELS.reduce((s, [k]) => s + Number(aging[k]?.amount ?? 0), 0),
    [aging],
  );

  const cards = [
    { label: 'Créances en retard', value: formatCurrency(stats.total_overdue_amount), color: '#f44336' },
    { label: 'Factures en retard', value: String(Number(stats.total_overdue_count ?? 0)), color: '#ff9800' },
    { label: 'Rappels envoyés', value: String(Number(stats.reminders_sent ?? 0)), color: '#1976d2' },
    { label: 'Blocages actifs', value: String(Number(stats.active_blocks ?? 0)), color: '#9c27b0' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Comptabilit&eacute;</Link>
        <Typography color="text.primary">Recouvrement</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Recouvrement</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setBlockOpen(true)}>Bloquer un service</Button>
          <Button
            variant="outlined"
            disabled={generateReminders.isPending}
            onClick={() => generateReminders.mutate()}
          >
            {generateReminders.isPending ? 'Génération…' : 'Générer les relances'}
          </Button>
          <Button
            variant="contained"
            disabled={sendReminders.isPending}
            onClick={() => sendReminders.mutate()}
          >
            {sendReminders.isPending ? 'Envoi…' : 'Envoyer les relances'}
          </Button>
        </Box>
      </Box>

      {statsLoading && <Box display="flex" justifyContent="center" p={2}><CircularProgress /></Box>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Rappels" />
        <Tab label="Blocages de services" />
        <Tab label="Statistiques" />
      </Tabs>

      {/* Tab 0: Reminders */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Historique des Rappels</Typography>
            {remindersError && <Alert severity="error" sx={{ mb: 2 }}>Impossible de charger les rappels.</Alert>}
            {remindersLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
            {!remindersLoading && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>&Eacute;l&egrave;ve</TableCell>
                      <TableCell>Facture</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Canaux</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date pr&eacute;vue</TableCell>
                      <TableCell>Envoy&eacute; le</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reminders.length === 0 && (
                      <TableRow><TableCell colSpan={7}><Alert severity="info">Aucun rappel. Utilisez « Générer les relances ».</Alert></TableCell></TableRow>
                    )}
                    {reminders.map(reminder => (
                      <TableRow key={reminder.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{studentName(reminder.student)}</Typography>
                          <Typography variant="caption" color="text.secondary">{reminder.student?.matricule}</Typography>
                        </TableCell>
                        <TableCell>{reminder.invoice?.invoice_number || '—'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={REMINDER_TYPE_LABELS[reminder.reminder_type] ?? reminder.reminder_type} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{(reminder.send_methods ?? []).join(', ') || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={REMINDER_STATUS_LABELS[reminder.status] ?? reminder.status}
                            color={REMINDER_STATUS_COLORS[reminder.status] ?? 'default'}
                          />
                        </TableCell>
                        <TableCell>{reminder.reminder_date ? new Date(reminder.reminder_date).toLocaleDateString('fr-FR') : '—'}</TableCell>
                        <TableCell>{reminder.sent_at ? new Date(reminder.sent_at).toLocaleDateString('fr-FR') : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Service Blocks */}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Blocages de Services</Typography>
            {blocksError && <Alert severity="error" sx={{ mb: 2 }}>Impossible de charger les blocages.</Alert>}
            {blocksLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
            {!blocksLoading && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>&Eacute;l&egrave;ve</TableCell>
                      <TableCell>Type de blocage</TableCell>
                      <TableCell>Raison</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Bloqu&eacute; le</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {blocks.length === 0 && (
                      <TableRow><TableCell colSpan={6}><Alert severity="info">Aucun blocage de service.</Alert></TableCell></TableRow>
                    )}
                    {blocks.map(block => (
                      <TableRow key={block.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{studentName(block.student)}</Typography>
                          <Typography variant="caption" color="text.secondary">{block.student?.matricule}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={BLOCK_TYPE_LABELS[block.block_type] ?? block.block_type} variant="outlined" color="error" />
                        </TableCell>
                        <TableCell><Typography variant="body2">{block.reason}</Typography></TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={block.is_active && !block.unblocked_at ? 'Actif' : 'Levé'}
                            color={block.is_active && !block.unblocked_at ? 'error' : 'success'}
                          />
                        </TableCell>
                        <TableCell>{new Date(block.blocked_at).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell align="center">
                          {block.is_active && !block.unblocked_at && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={unblockServices.isPending}
                              onClick={() => unblockServices.mutate(block.id)}
                            >
                              Lever le blocage
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Statistics (aging balance) */}
      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Indicateurs de Recouvrement</Typography>
                {[
                  { label: 'Créances en retard (montant)', value: formatCurrency(stats.total_overdue_amount), color: '#f44336' },
                  { label: 'Factures en retard', value: String(Number(stats.total_overdue_count ?? 0)), color: '#ff9800' },
                  { label: 'Rappels envoyés (ce mois)', value: String(Number(stats.reminders_sent ?? 0)), color: '#1976d2' },
                  { label: 'Blocages de services actifs', value: String(Number(stats.active_blocks ?? 0)), color: '#9c27b0' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography fontWeight="bold" sx={{ color: item.color }}>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Balance &acirc;g&eacute;e des impay&eacute;s</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tranche d&apos;anciennet&eacute;</TableCell>
                        <TableCell align="right">Factures</TableCell>
                        <TableCell align="right">Montant</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {AGING_LABELS.map(([key, label]) => (
                        <TableRow key={key} hover>
                          <TableCell>{label}</TableCell>
                          <TableCell align="right">{Number(aging[key]?.count ?? 0)}</TableCell>
                          <TableCell align="right">{formatCurrency(aging[key]?.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell><Typography fontWeight="bold">Total</Typography></TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">{AGING_LABELS.reduce((s, [k]) => s + Number(aging[k]?.count ?? 0), 0)}</Typography>
                        </TableCell>
                        <TableCell align="right"><Typography fontWeight="bold">{formatCurrency(totalOverdueInAging)}</Typography></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Create Service Block Dialog */}
      <Dialog open={blockOpen} onClose={() => setBlockOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bloquer un Service</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>&Eacute;l&egrave;ve</InputLabel>
              <Select
                label="Élève"
                value={blockForm.student_id}
                onChange={(e) => setBlockForm(f => ({ ...f, student_id: String(e.target.value) }))}
              >
                {students.length === 0 && <MenuItem value="" disabled>Aucun élève disponible</MenuItem>}
                {students.map(s => (
                  <MenuItem key={s.id} value={String(s.id)}>{studentName(s)} {s.matricule ? `(${s.matricule})` : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type de blocage</InputLabel>
              <Select
                label="Type de blocage"
                value={blockForm.block_type}
                onChange={(e) => setBlockForm(f => ({ ...f, block_type: String(e.target.value) }))}
              >
                {Object.entries(BLOCK_TYPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Raison"
              fullWidth
              multiline
              rows={2}
              placeholder="Raison du blocage..."
              value={blockForm.reason}
              onChange={(e) => setBlockForm(f => ({ ...f, reason: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!blockForm.student_id || !blockForm.reason || blockServices.isPending}
            onClick={() => blockServices.mutate()}
          >
            {blockServices.isPending ? 'Blocage…' : 'Bloquer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
