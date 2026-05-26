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
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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

interface ApiCard {
  id: number;
  card_number: string;
  card_type: string;
  status: string;
  issue_date: string | null;
  expiry_date: string | null;
  qr_code: string | null;
  is_printed: boolean;
  access_permissions: string[] | null;
  replaced_by_card_id: number | null;
  student?: ApiStudent | null;
  academic_year?: { id: number; name: string } | null;
}

const CARD_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  suspended: 'Suspendue',
  expired: 'Expirée',
  lost: 'Perdue',
  stolen: 'Volée',
  replaced: 'Remplacée',
};

const getCardStatusChipColor = (status: string): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'active': return 'success';
    case 'suspended': return 'warning';
    case 'lost':
    case 'stolen': return 'error';
    default: return 'default';
  }
};

const fmtDate = (d: string | null): string => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const studentName = (s?: ApiStudent | null): string => (s ? `${s.firstname ?? ''} ${s.lastname ?? ''}`.trim() || '—' : '—');

const GENERATION_DISABLED_TOOLTIP = 'Indisponible (modèle non configuré)';

export const CardDashboard: React.FC = () => {
  const qc = useQueryClient();
  const [tabIndex, setTabIndex] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ApiCard | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const { data: cardsResp, isLoading, isError } = useQuery({
    queryKey: ['student-cards'],
    queryFn: async () => (await api().get('/admin/documents/cards', { params: { per_page: 100 } })).data,
  });
  const allCards = useMemo(() => toArray<ApiCard>(cardsResp), [cardsResp]);

  const cards = useMemo(() => allCards.filter(c => c.card_type !== 'access_badge'), [allCards]);
  const badges = useMemo(() => allCards.filter(c => c.card_type === 'access_badge'), [allCards]);

  const statusMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'suspend' | 'activate' }) =>
      (await api().post(`/admin/documents/cards/${id}/${action}`)).data,
    onSuccess: (_d, vars) => {
      notify(vars.action === 'suspend' ? 'Carte suspendue.' : 'Carte activée.');
      qc.invalidateQueries({ queryKey: ['student-cards'] });
    },
    onError: (e: any) => notify(e?.response?.data?.message ?? 'Action impossible.', 'error'),
  });

  const handleViewDetail = (card: ApiCard) => {
    setSelectedCard(card);
    setDetailOpen(true);
  };

  const activeCount = cards.filter(c => c.status === 'active').length;
  const suspendedCount = cards.filter(c => c.status === 'suspended').length;
  const totalCards = cards.length;
  const totalBadges = badges.length;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">Administration</Link>
        <Link underline="hover" color="inherit" href="#">Documents Officiels</Link>
        <Typography color="text.primary">Cartes Étudiants</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Cartes Étudiants &amp; Badges d&apos;Accès
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={GENERATION_DISABLED_TOOLTIP}>
            <span>
              <Button variant="outlined" disabled>Génération par Lot</Button>
            </span>
          </Tooltip>
          <Tooltip title={GENERATION_DISABLED_TOOLTIP}>
            <span>
              <Button variant="contained" disabled>+ Nouvelle Carte</Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total cartes', value: totalCards, color: '#1976d2' },
          { label: 'Cartes actives', value: activeCount, color: '#4caf50' },
          { label: 'Cartes suspendues', value: suspendedCount, color: '#ff9800' },
          { label: 'Badges d\'accès', value: totalBadges, color: '#9c27b0' },
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
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
            <Tab label="Cartes Étudiants" />
            <Tab label="Badges d'Accès" />
          </Tabs>

          {isLoading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
          {isError && <Alert severity="error">Erreur lors du chargement des cartes.</Alert>}

          {!isLoading && !isError && tabIndex === 0 && (
            cards.length === 0 ? <Alert severity="info">Aucune carte enregistrée.</Alert> : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>N° Carte</TableCell>
                      <TableCell>Étudiant</TableCell>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Émise le</TableCell>
                      <TableCell>Expire le</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cards.map(card => (
                      <TableRow key={card.id} hover>
                        <TableCell><Typography fontWeight="medium">{card.card_number}</Typography></TableCell>
                        <TableCell><Typography fontWeight="medium">{studentName(card.student)}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{card.student?.matricule ?? '—'}</Typography></TableCell>
                        <TableCell>{fmtDate(card.issue_date)}</TableCell>
                        <TableCell>{fmtDate(card.expiry_date)}</TableCell>
                        <TableCell>
                          <Chip size="small" label={CARD_STATUS_LABELS[card.status] ?? card.status} color={getCardStatusChipColor(card.status)} />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Button size="small" variant="outlined" onClick={() => handleViewDetail(card)}>Détails</Button>
                            {card.status === 'active' && (
                              <Button size="small" variant="outlined" color="warning" disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({ id: card.id, action: 'suspend' })}>Suspendre</Button>
                            )}
                            {card.status === 'suspended' && (
                              <Button size="small" variant="contained" color="success" disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({ id: card.id, action: 'activate' })}>Activer</Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}

          {!isLoading && !isError && tabIndex === 1 && (
            badges.length === 0 ? <Alert severity="info">Aucun badge d&apos;accès enregistré.</Alert> : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>N° Badge</TableCell>
                      <TableCell>Étudiant</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell>Expire le</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {badges.map(badge => (
                      <TableRow key={badge.id} hover>
                        <TableCell><Typography fontWeight="medium">{badge.card_number}</Typography></TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">{studentName(badge.student)}</Typography>
                          <Typography variant="caption" color="text.secondary">{badge.student?.matricule ?? ''}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {(badge.access_permissions ?? []).map((perm, idx) => (
                              <Chip key={idx} size="small" label={perm} variant="outlined" />
                            ))}
                            {(!badge.access_permissions || badge.access_permissions.length === 0) && '—'}
                          </Box>
                        </TableCell>
                        <TableCell>{fmtDate(badge.expiry_date)}</TableCell>
                        <TableCell>
                          <Chip size="small" label={CARD_STATUS_LABELS[badge.status] ?? badge.status} color={getCardStatusChipColor(badge.status)} />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {badge.status === 'active' && (
                              <Button size="small" variant="outlined" color="warning" disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({ id: badge.id, action: 'suspend' })}>Suspendre</Button>
                            )}
                            {badge.status === 'suspended' && (
                              <Button size="small" variant="contained" color="success" disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({ id: badge.id, action: 'activate' })}>Activer</Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Carte {selectedCard?.card_number}</Typography>
              <Typography variant="body2" color="text.secondary">{studentName(selectedCard?.student)}</Typography>
            </Box>
            {selectedCard && (
              <Chip label={CARD_STATUS_LABELS[selectedCard.status] ?? selectedCard.status} color={getCardStatusChipColor(selectedCard.status)} />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Étudiant</Typography>
                <Typography fontWeight="bold">{studentName(selectedCard?.student)}</Typography>
                <Typography variant="body2">{selectedCard?.student?.matricule ?? '—'}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Période de validité</Typography>
                <Typography>{fmtDate(selectedCard?.issue_date ?? null)} - {fmtDate(selectedCard?.expiry_date ?? null)}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">QR Code</Typography>
                <Typography>{selectedCard?.qr_code || 'Non généré'}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Imprimée</Typography>
                <Typography>{selectedCard?.is_printed ? 'Oui' : 'Non'}</Typography>
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
