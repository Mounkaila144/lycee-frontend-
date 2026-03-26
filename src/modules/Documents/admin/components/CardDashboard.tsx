'use client';

import React, { useState, useCallback } from 'react';

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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';

import type {
  StudentCard as StudentCardType,
  AccessBadge,
  CardStatus,
  BadgeStatus,
} from '../../types';

import {
  CARD_STATUS_LABELS,
  CARD_STATUS_COLORS,
  BADGE_STATUS_LABELS,
} from '../../types';

// ──── Demo Data ────

const DEMO_CARDS: StudentCardType[] = [
  {
    id: 1, student_id: 1, academic_year_id: 1, card_number: 'CARD-2026-001',
    status: 'active', issued_at: '2026-01-15T08:00:00', expires_at: '2027-01-15',
    photo_path: '/photos/etu-001.jpg', qr_code: 'QR-CARD-001', replaced_by: null,
    student: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2024-001' },
    created_at: '2026-01-15T08:00:00', updated_at: '2026-01-15T08:00:00',
  },
  {
    id: 2, student_id: 2, academic_year_id: 1, card_number: 'CARD-2026-002',
    status: 'active', issued_at: '2026-01-15T08:30:00', expires_at: '2027-01-15',
    photo_path: '/photos/etu-002.jpg', qr_code: 'QR-CARD-002', replaced_by: null,
    student: { id: 2, firstname: 'Fatima', lastname: 'Ousmane', matricule: 'ETU-2024-002' },
    created_at: '2026-01-15T08:30:00', updated_at: '2026-01-15T08:30:00',
  },
  {
    id: 3, student_id: 3, academic_year_id: 1, card_number: 'CARD-2026-003',
    status: 'suspended', issued_at: '2026-01-15T09:00:00', expires_at: '2027-01-15',
    photo_path: '/photos/etu-003.jpg', qr_code: 'QR-CARD-003', replaced_by: null,
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Moussa', matricule: 'ETU-2024-003' },
    created_at: '2026-01-15T09:00:00', updated_at: '2026-03-10T14:00:00',
  },
  {
    id: 4, student_id: 4, academic_year_id: 1, card_number: 'CARD-2026-004',
    status: 'lost', issued_at: '2026-01-15T09:30:00', expires_at: '2027-01-15',
    photo_path: '/photos/etu-004.jpg', qr_code: 'QR-CARD-004', replaced_by: 6,
    student: { id: 4, firstname: 'Aissatou', lastname: 'Bah', matricule: 'ETU-2024-004' },
    created_at: '2026-01-15T09:30:00', updated_at: '2026-03-20T11:00:00',
  },
  {
    id: 5, student_id: 5, academic_year_id: 1, card_number: 'CARD-2026-005',
    status: 'expired', issued_at: '2025-01-15T10:00:00', expires_at: '2026-01-15',
    photo_path: '/photos/etu-005.jpg', qr_code: 'QR-CARD-005', replaced_by: null,
    student: { id: 5, firstname: 'Oumar', lastname: 'Sidibe', matricule: 'ETU-2024-005' },
    created_at: '2025-01-15T10:00:00', updated_at: '2026-01-15T00:00:00',
  },
];

const DEMO_BADGES: AccessBadge[] = [
  {
    id: 1, student_id: 1, badge_number: 'BADGE-001', status: 'active',
    access_level: 'standard', issued_at: '2026-01-20T08:00:00', expires_at: '2027-01-20',
    permissions: ['bibliothèque', 'laboratoire', 'restaurant'],
    student: { id: 1, firstname: 'Amadou', lastname: 'Diallo', matricule: 'ETU-2024-001' },
    created_at: '2026-01-20T08:00:00', updated_at: '2026-01-20T08:00:00',
  },
  {
    id: 2, student_id: 2, badge_number: 'BADGE-002', status: 'active',
    access_level: 'premium', issued_at: '2026-01-20T08:30:00', expires_at: '2027-01-20',
    permissions: ['bibliothèque', 'laboratoire', 'restaurant', 'salle sport', 'parking'],
    student: { id: 2, firstname: 'Fatima', lastname: 'Ousmane', matricule: 'ETU-2024-002' },
    created_at: '2026-01-20T08:30:00', updated_at: '2026-01-20T08:30:00',
  },
  {
    id: 3, student_id: 3, badge_number: 'BADGE-003', status: 'suspended',
    access_level: 'standard', issued_at: '2026-01-20T09:00:00', expires_at: '2027-01-20',
    permissions: ['bibliothèque', 'restaurant'],
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Moussa', matricule: 'ETU-2024-003' },
    created_at: '2026-01-20T09:00:00', updated_at: '2026-03-10T14:00:00',
  },
];

const getCardStatusChipColor = (status: CardStatus): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'active': return 'success';
    case 'suspended': return 'warning';
    case 'expired': return 'default';
    case 'lost': return 'error';
    case 'replaced': return 'default';
    default: return 'default';
  }
};

const getBadgeStatusChipColor = (status: BadgeStatus): 'default' | 'success' | 'warning' => {
  switch (status) {
    case 'active': return 'success';
    case 'suspended': return 'warning';
    case 'expired': return 'default';
    default: return 'default';
  }
};

export const CardDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<StudentCardType | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const cards = DEMO_CARDS;
  const badges = DEMO_BADGES;

  const handleViewDetail = useCallback((card: StudentCardType) => {
    setSelectedCard(card);
    setDetailOpen(true);
  }, []);

  const handleSuspend = useCallback((card: StudentCardType) => {
    setSnackbar({ open: true, message: `Carte "${card.card_number}" suspendue`, severity: 'success' });
  }, []);

  const handleActivate = useCallback((card: StudentCardType) => {
    setSnackbar({ open: true, message: `Carte "${card.card_number}" activée`, severity: 'success' });
  }, []);

  const handleReplace = useCallback((card: StudentCardType) => {
    setSelectedCard(card);
    setReplaceOpen(true);
  }, []);

  const handlePrint = useCallback((card: StudentCardType) => {
    setSnackbar({ open: true, message: `Impression de la carte "${card.card_number}" lancée`, severity: 'success' });
  }, []);

  const activeCount = cards.filter(c => c.status === 'active').length;
  const suspendedCount = cards.filter(c => c.status === 'suspended').length;
  const totalCards = cards.length;
  const totalBadges = badges.length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Documents Officiels
        </Link>
        <Typography color="text.primary">Cartes Étudiants</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Cartes Étudiants & Badges d&apos;Accès
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setBatchOpen(true)}>
            Génération par Lot
          </Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            + Nouvelle Carte
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total cartes', value: totalCards, color: '#1976d2' },
          { label: 'Cartes actives', value: activeCount, color: '#4caf50' },
          { label: 'Cartes suspendues', value: suspendedCount, color: '#ff9800' },
          { label: 'Badges actifs', value: totalBadges, color: '#9c27b0' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card>
        <CardContent>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
            <Tab label="Cartes Étudiants" />
            <Tab label="Badges d'Accès" />
          </Tabs>

          {tabIndex === 0 && (
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
                      <TableCell>
                        <Typography fontWeight="medium">{card.card_number}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {card.student?.firstname} {card.student?.lastname}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{card.student?.matricule}</Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(card.issued_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {new Date(card.expires_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={CARD_STATUS_LABELS[card.status]}
                          color={getCardStatusChipColor(card.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewDetail(card)}
                          >
                            Détails
                          </Button>
                          {card.status === 'active' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleSuspend(card)}
                            >
                              Suspendre
                            </Button>
                          )}
                          {card.status === 'suspended' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleActivate(card)}
                            >
                              Activer
                            </Button>
                          )}
                          <Tooltip title="Remplacer la carte">
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              onClick={() => handleReplace(card)}
                            >
                              Remplacer
                            </Button>
                          </Tooltip>
                          <Tooltip title="Imprimer">
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              onClick={() => handlePrint(card)}
                            >
                              Imprimer
                            </Button>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabIndex === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Badge</TableCell>
                    <TableCell>Étudiant</TableCell>
                    <TableCell>Niveau d&apos;accès</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell>Expire le</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {badges.map(badge => (
                    <TableRow key={badge.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{badge.badge_number}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {badge.student?.firstname} {badge.student?.lastname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {badge.student?.matricule}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={badge.access_level}
                          variant="outlined"
                          color={badge.access_level === 'premium' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {badge.permissions.map((perm, idx) => (
                            <Chip key={idx} size="small" label={perm} variant="outlined" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(badge.expires_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={BADGE_STATUS_LABELS[badge.status]}
                          color={getBadgeStatusChipColor(badge.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {badge.status === 'active' && (
                            <Button size="small" variant="outlined" color="warning">
                              Suspendre
                            </Button>
                          )}
                          {badge.status === 'suspended' && (
                            <Button size="small" variant="contained" color="success">
                              Activer
                            </Button>
                          )}
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Carte {selectedCard?.card_number}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCard?.student?.firstname} {selectedCard?.student?.lastname}
              </Typography>
            </Box>
            {selectedCard && (
              <Chip
                label={CARD_STATUS_LABELS[selectedCard.status]}
                color={getCardStatusChipColor(selectedCard.status)}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Étudiant</Typography>
                <Typography fontWeight="bold">
                  {selectedCard?.student?.firstname} {selectedCard?.student?.lastname}
                </Typography>
                <Typography variant="body2">{selectedCard?.student?.matricule}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Période de validité</Typography>
                <Typography>
                  {selectedCard && new Date(selectedCard.issued_at).toLocaleDateString('fr-FR')} -{' '}
                  {selectedCard && new Date(selectedCard.expires_at).toLocaleDateString('fr-FR')}
                </Typography>
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
                <Typography variant="subtitle2" color="text.secondary">Remplacée par</Typography>
                <Typography>{selectedCard?.replaced_by ? `Carte #${selectedCard.replaced_by}` : 'N/A'}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Create Card Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle Carte Étudiant</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Étudiant</InputLabel>
              <Select label="Étudiant" defaultValue="">
                <MenuItem value={1}>Amadou Diallo (ETU-2024-001)</MenuItem>
                <MenuItem value={2}>Fatima Ousmane (ETU-2024-002)</MenuItem>
                <MenuItem value={3}>Ibrahim Moussa (ETU-2024-003)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setCreateOpen(false);
              setSnackbar({ open: true, message: 'Carte étudiant créée avec succès', severity: 'success' });
            }}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Dialog */}
      <Dialog open={batchOpen} onClose={() => setBatchOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Génération par Lot</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Générer des cartes étudiants en masse pour une année académique.
            </Alert>
            <TextField
              label="Nombre d&apos;étudiants"
              type="number"
              defaultValue={250}
              fullWidth
              disabled
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setBatchOpen(false);
              setSnackbar({ open: true, message: 'Génération de 250 cartes lancée', severity: 'success' });
            }}
          >
            Lancer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Replace Dialog */}
      <Dialog open={replaceOpen} onClose={() => setReplaceOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Remplacer la Carte</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Carte : {selectedCard?.card_number} - {selectedCard?.student?.firstname} {selectedCard?.student?.lastname}
            </Alert>
            <FormControl fullWidth>
              <InputLabel>Raison</InputLabel>
              <Select label="Raison" defaultValue="">
                <MenuItem value="lost">Perte</MenuItem>
                <MenuItem value="damaged">Endommagée</MenuItem>
                <MenuItem value="stolen">Volée</MenuItem>
                <MenuItem value="expired">Expirée</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Commentaire" fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplaceOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setReplaceOpen(false);
              setSnackbar({ open: true, message: `Carte "${selectedCard?.card_number}" remplacée avec succès`, severity: 'success' });
            }}
          >
            Remplacer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
