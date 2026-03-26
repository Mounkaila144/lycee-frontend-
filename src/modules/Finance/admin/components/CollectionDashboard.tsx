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
import Paper from '@mui/material/Paper';
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
import LinearProgress from '@mui/material/LinearProgress';

import type {
  Reminder,
  ReminderStatus,
  ServiceBlock,
  PaymentPlan,
} from '../../types';

import {
  REMINDER_STATUS_LABELS,
  REMINDER_STATUS_COLORS,
  REMINDER_TYPE_LABELS,
  SERVICE_BLOCK_STATUS_LABELS,
  SERVICE_BLOCK_STATUS_COLORS,
  PAYMENT_PLAN_STATUS_LABELS,
  PAYMENT_PLAN_STATUS_COLORS,
} from '../../types';

// ──── Demo Data ────

const DEMO_REMINDERS: Reminder[] = [
  {
    id: 1, invoice_id: 3, student_id: 3, type: 'email', status: 'sent',
    message: 'Rappel de paiement - Facture FAC-2026-0003 en retard',
    sent_at: '2026-03-10T08:00:00', acknowledged_at: null, escalation_level: 1,
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Mahamadou', matricule: 'ETU-2026-003' },
    created_at: '2026-03-10T08:00:00', updated_at: '2026-03-10T08:00:00',
  },
  {
    id: 2, invoice_id: 3, student_id: 3, type: 'sms', status: 'sent',
    message: 'Urgent: Votre facture FAC-2026-0003 est en retard. Veuillez régulariser.',
    sent_at: '2026-03-15T09:00:00', acknowledged_at: null, escalation_level: 2,
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Mahamadou', matricule: 'ETU-2026-003' },
    created_at: '2026-03-15T09:00:00', updated_at: '2026-03-15T09:00:00',
  },
  {
    id: 3, invoice_id: 2, student_id: 2, type: 'email', status: 'acknowledged',
    message: 'Rappel aimable - Solde restant sur facture FAC-2026-0002',
    sent_at: '2026-03-20T10:00:00', acknowledged_at: '2026-03-21T14:00:00', escalation_level: 1,
    student: { id: 2, firstname: 'Fatima', lastname: 'Ousmane', matricule: 'ETU-2026-002' },
    created_at: '2026-03-20T10:00:00', updated_at: '2026-03-21T14:00:00',
  },
  {
    id: 4, invoice_id: 3, student_id: 3, type: 'letter', status: 'escalated',
    message: 'Mise en demeure - Dernier avis avant blocage des services',
    sent_at: '2026-03-22T08:00:00', acknowledged_at: null, escalation_level: 3,
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Mahamadou', matricule: 'ETU-2026-003' },
    created_at: '2026-03-22T08:00:00', updated_at: '2026-03-22T08:00:00',
  },
  {
    id: 5, invoice_id: 4, student_id: 4, type: 'email', status: 'pending',
    message: 'Rappel de paiement - Facture FAC-2026-0004',
    sent_at: null, acknowledged_at: null, escalation_level: 1,
    student: { id: 4, firstname: 'Aissatou', lastname: 'Boubacar', matricule: 'ETU-2026-004' },
    created_at: '2026-03-25T11:00:00', updated_at: '2026-03-25T11:00:00',
  },
];

const DEMO_SERVICE_BLOCKS: ServiceBlock[] = [
  {
    id: 1, student_id: 3, reason: 'Non-paiement des frais de scolarité - 3 mois de retard',
    blocked_services: ['Accès bibliothèque', 'Inscription examens', 'Certificats'],
    status: 'active', blocked_at: '2026-03-22T10:00:00', lifted_at: null, lifted_by: null,
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Mahamadou', matricule: 'ETU-2026-003' },
    created_at: '2026-03-22T10:00:00', updated_at: '2026-03-22T10:00:00',
  },
  {
    id: 2, student_id: 6, reason: 'Frais de laboratoire impayés',
    blocked_services: ['Accès laboratoire'],
    status: 'lifted', blocked_at: '2026-02-15T08:00:00', lifted_at: '2026-03-01T09:00:00', lifted_by: 1,
    student: { id: 6, firstname: 'Oumarou', lastname: 'Sidi', matricule: 'ETU-2026-006' },
    created_at: '2026-02-15T08:00:00', updated_at: '2026-03-01T09:00:00',
  },
];

const DEMO_PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 1, student_id: 3, invoice_id: 3, total_amount: 625000,
    installments_count: 4, installment_amount: 156250,
    start_date: '2026-04-01', status: 'active',
    schedules: [
      { id: 1, invoice_id: 3, installment_number: 1, amount: 156250, due_date: '2026-04-01', paid_date: null, is_paid: false, created_at: '', updated_at: '' },
      { id: 2, invoice_id: 3, installment_number: 2, amount: 156250, due_date: '2026-05-01', paid_date: null, is_paid: false, created_at: '', updated_at: '' },
      { id: 3, invoice_id: 3, installment_number: 3, amount: 156250, due_date: '2026-06-01', paid_date: null, is_paid: false, created_at: '', updated_at: '' },
      { id: 4, invoice_id: 3, installment_number: 4, amount: 156250, due_date: '2026-07-01', paid_date: null, is_paid: false, created_at: '', updated_at: '' },
    ],
    student: { id: 3, firstname: 'Ibrahim', lastname: 'Mahamadou', matricule: 'ETU-2026-003' },
    created_at: '2026-03-25T14:00:00', updated_at: '2026-03-25T14:00:00',
  },
  {
    id: 2, student_id: 7, invoice_id: 7, total_amount: 500000,
    installments_count: 3, installment_amount: 166667,
    start_date: '2026-02-01', status: 'completed',
    schedules: [
      { id: 5, invoice_id: 7, installment_number: 1, amount: 166667, due_date: '2026-02-01', paid_date: '2026-02-01', is_paid: true, created_at: '', updated_at: '' },
      { id: 6, invoice_id: 7, installment_number: 2, amount: 166667, due_date: '2026-03-01', paid_date: '2026-02-28', is_paid: true, created_at: '', updated_at: '' },
      { id: 7, invoice_id: 7, installment_number: 3, amount: 166666, due_date: '2026-04-01', paid_date: '2026-03-20', is_paid: true, created_at: '', updated_at: '' },
    ],
    student: { id: 7, firstname: 'Hawa', lastname: 'Garba', matricule: 'ETU-2026-007' },
    created_at: '2026-01-25T10:00:00', updated_at: '2026-03-20T10:00:00',
  },
];

const DEMO_COLLECTION_STATS = {
  total_outstanding: 1425000,
  total_reminders_sent: 12,
  total_service_blocks: 3,
  total_payment_plans: 5,
  total_write_offs: 1,
  recovery_rate: 68.5,
  average_days_overdue: 32,
};

const getReminderStatusColor = (status: ReminderStatus): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'pending': return 'warning';
    case 'sent': return 'primary';
    case 'acknowledged': return 'success';
    case 'escalated': return 'error';
    default: return 'default';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

export const CollectionDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          Administration
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Comptabilit&eacute;
        </Link>
        <Typography color="text.primary">Recouvrement</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Recouvrement
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setBlockOpen(true)}>
            Bloquer un service
          </Button>
          <Button variant="contained" onClick={() => setReminderOpen(true)}>
            + Nouveau rappel
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Créances en cours', value: formatCurrency(DEMO_COLLECTION_STATS.total_outstanding), color: '#f44336' },
          { label: 'Taux de recouvrement', value: `${DEMO_COLLECTION_STATS.recovery_rate}%`, color: '#4caf50' },
          { label: 'Rappels envoyés', value: DEMO_COLLECTION_STATS.total_reminders_sent, color: '#1976d2' },
          { label: 'Jours moy. retard', value: DEMO_COLLECTION_STATS.average_days_overdue, color: '#ff9800' },
        ].map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Rappels" />
        <Tab label="Blocages de services" />
        <Tab label="Plans de paiement" />
        <Tab label="Statistiques" />
      </Tabs>

      {/* Tab 0: Reminders */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Historique des Rappels</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>&Eacute;tudiant</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Niveau</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Envoy&eacute; le</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_REMINDERS.map(reminder => (
                    <TableRow key={reminder.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {reminder.student?.firstname} {reminder.student?.lastname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reminder.student?.matricule}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={REMINDER_TYPE_LABELS[reminder.type]} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {reminder.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`Niveau ${reminder.escalation_level}`}
                          color={reminder.escalation_level >= 3 ? 'error' : reminder.escalation_level >= 2 ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={REMINDER_STATUS_LABELS[reminder.status]}
                          color={getReminderStatusColor(reminder.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {reminder.sent_at ? new Date(reminder.sent_at).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {reminder.status === 'pending' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => setSnackbar({ open: true, message: 'Rappel envoyé', severity: 'success' })}
                          >
                            Envoyer
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Service Blocks */}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Blocages de Services</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>&Eacute;tudiant</TableCell>
                    <TableCell>Raison</TableCell>
                    <TableCell>Services bloqu&eacute;s</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Bloqu&eacute; le</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DEMO_SERVICE_BLOCKS.map(block => (
                    <TableRow key={block.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {block.student?.firstname} {block.student?.lastname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {block.student?.matricule}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{block.reason}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {block.blocked_services.map((service, idx) => (
                            <Chip key={idx} size="small" label={service} variant="outlined" color="error" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={SERVICE_BLOCK_STATUS_LABELS[block.status]}
                          sx={{ bgcolor: SERVICE_BLOCK_STATUS_COLORS[block.status], color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(block.blocked_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell align="center">
                        {block.status === 'active' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => setSnackbar({ open: true, message: 'Blocage levé', severity: 'success' })}
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
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Payment Plans */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Plans de Paiement</Typography>
            {DEMO_PAYMENT_PLANS.map(plan => (
              <Paper key={plan.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography fontWeight="bold">
                      {plan.student?.firstname} {plan.student?.lastname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {plan.student?.matricule} - {formatCurrency(plan.total_amount)} en {plan.installments_count} mensualit&eacute;s
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={PAYMENT_PLAN_STATUS_LABELS[plan.status]}
                      sx={{ bgcolor: PAYMENT_PLAN_STATUS_COLORS[plan.status], color: 'white' }}
                    />
                    {plan.status === 'active' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => setSnackbar({ open: true, message: 'Plan annulé', severity: 'success' })}
                      >
                        Annuler
                      </Button>
                    )}
                  </Box>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mensualit&eacute;</TableCell>
                        <TableCell align="right">Montant</TableCell>
                        <TableCell>&Eacute;ch&eacute;ance</TableCell>
                        <TableCell>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {plan.schedules.map(schedule => (
                        <TableRow key={schedule.id}>
                          <TableCell>Tranche {schedule.installment_number}</TableCell>
                          <TableCell align="right">{formatCurrency(schedule.amount)}</TableCell>
                          <TableCell>{new Date(schedule.due_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={schedule.is_paid ? 'Payé' : 'En attente'}
                              color={schedule.is_paid ? 'success' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))}
            <Button
              variant="contained"
              onClick={() => setPlanOpen(true)}
              sx={{ mt: 1 }}
            >
              + Nouveau plan de paiement
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Statistics */}
      {tab === 3 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Indicateurs de Recouvrement</Typography>
                {[
                  { label: 'Créances totales en cours', value: formatCurrency(DEMO_COLLECTION_STATS.total_outstanding), color: '#f44336' },
                  { label: 'Rappels envoyés', value: DEMO_COLLECTION_STATS.total_reminders_sent, color: '#1976d2' },
                  { label: 'Services bloqués', value: DEMO_COLLECTION_STATS.total_service_blocks, color: '#ff9800' },
                  { label: 'Plans de paiement actifs', value: DEMO_COLLECTION_STATS.total_payment_plans, color: '#9c27b0' },
                  { label: 'Créances passées en pertes', value: DEMO_COLLECTION_STATS.total_write_offs, color: '#757575' },
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
                <Typography variant="h6" sx={{ mb: 2 }}>Taux de Recouvrement</Typography>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h2" fontWeight="bold" sx={{ color: DEMO_COLLECTION_STATS.recovery_rate >= 70 ? '#4caf50' : '#f44336' }}>
                    {DEMO_COLLECTION_STATS.recovery_rate}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={DEMO_COLLECTION_STATS.recovery_rate}
                    sx={{
                      height: 16, borderRadius: 8, mt: 2, mx: 4,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: DEMO_COLLECTION_STATS.recovery_rate >= 70 ? '#4caf50' : '#f44336',
                        borderRadius: 8,
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Délai moyen de retard : {DEMO_COLLECTION_STATS.average_days_overdue} jours
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Create Reminder Dialog */}
      <Dialog open={reminderOpen} onClose={() => setReminderOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau Rappel</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="R&eacute;f&eacute;rence facture" fullWidth placeholder="Ex: FAC-2026-0003" />
            <FormControl fullWidth>
              <InputLabel>Type de rappel</InputLabel>
              <Select label="Type de rappel" defaultValue="email">
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="letter">Courrier</MenuItem>
                <MenuItem value="phone">T&eacute;l&eacute;phone</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Message" fullWidth multiline rows={4} placeholder="Contenu du rappel..." />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setReminderOpen(false);
              setSnackbar({ open: true, message: 'Rappel créé avec succès', severity: 'success' });
            }}
          >
            Cr&eacute;er
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Service Block Dialog */}
      <Dialog open={blockOpen} onClose={() => setBlockOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bloquer un Service</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Matricule &eacute;tudiant" fullWidth placeholder="Ex: ETU-2026-003" />
            <TextField label="Raison" fullWidth multiline rows={2} placeholder="Raison du blocage..." />
            <FormControl fullWidth>
              <InputLabel>Services &agrave; bloquer</InputLabel>
              <Select label="Services à bloquer" defaultValue="" multiple>
                <MenuItem value="bibliotheque">Acc&egrave;s biblioth&egrave;que</MenuItem>
                <MenuItem value="examens">Inscription examens</MenuItem>
                <MenuItem value="certificats">Certificats</MenuItem>
                <MenuItem value="laboratoire">Acc&egrave;s laboratoire</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setBlockOpen(false);
              setSnackbar({ open: true, message: 'Service bloqué', severity: 'success' });
            }}
          >
            Bloquer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Payment Plan Dialog */}
      <Dialog open={planOpen} onClose={() => setPlanOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau Plan de Paiement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Matricule &eacute;tudiant" fullWidth placeholder="Ex: ETU-2026-003" />
            <TextField label="R&eacute;f&eacute;rence facture" fullWidth placeholder="Ex: FAC-2026-0003" />
            <TextField label="Nombre de mensualit&eacute;s" type="number" fullWidth defaultValue={3} />
            <TextField
              label="Date de d&eacute;but"
              type="date"
              defaultValue="2026-04-01"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setPlanOpen(false);
              setSnackbar({ open: true, message: 'Plan de paiement créé', severity: 'success' });
            }}
          >
            Cr&eacute;er
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
