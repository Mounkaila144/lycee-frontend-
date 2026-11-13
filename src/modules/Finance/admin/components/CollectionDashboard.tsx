'use client';

import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { createApiClient } from '@/shared/lib/api-client';
import { useTenant } from '@/shared/lib/tenant-context';
import { useAuthUser } from '@/shared/hooks/useAuthUser';

import type { BlockType, ReminderLevel } from '../services/collectionService';
import {
  useCollectionStatistics,
  useCreatePaymentPlan,
  useCreateServiceBlock,
  useGenerateReminders,
  useLiftServiceBlock,
  useReminders,
  useSendReminders,
  useServiceBlocks,
  useWriteOff,
} from '../hooks/useCollection';
import { formatXof } from './ReceiptDialog';

const REMINDER_LEVEL_LABELS: Record<ReminderLevel, string> = {
  first_reminder: '1re relance',
  second_reminder: '2e relance',
  final_notice: 'Mise en demeure',
  service_block_warning: 'Avertissement blocage',
};

const REMINDER_STATUS: Record<string, { label: string; color: 'default' | 'success' | 'error' | 'warning' }> = {
  pending: { label: 'À envoyer', color: 'warning' },
  sent: { label: 'Envoyée', color: 'success' },
  failed: { label: 'Échec', color: 'error' },
};

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  enrollment: 'Inscription',
  exam_access: 'Accès aux examens',
  documents: 'Délivrance de documents',
  reenrollment: 'Réinscription',
  all: 'Tous les services',
};

interface OverdueInvoice {
  id: number;
  invoice_number: string;
  student_id: number;
  due_date: string;
  total_amount: string | number;
  paid_amount: string | number;
  status: string;
  student?: { id: number; firstname: string; lastname: string; matricule: string } | null;
}

type ActionKind = 'plan' | 'block' | 'writeoff';

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString('fr-FR') : '—');

const daysLate = (dueDate: string) => Math.max(0, Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000));

/**
 * Recouvrement & relances : factures en retard, relances, blocages de services.
 *
 * Données réelles (/admin/finance/collection/*, /admin/finance/invoices?overdue=1).
 * Les actions sont réservées à Administrator / Comptable (le backend renvoie 403
 * aux autres rôles) ; Manager et Caissier ont une vue en lecture seule.
 */
export const CollectionDashboard: React.FC = () => {
  const { tenantId } = useTenant();
  const tenant = tenantId || undefined;
  const authUser = useAuthUser();
  const canAct = (authUser?.roles ?? []).some(r => r === 'Administrator' || r === 'Comptable');

  const [tab, setTab] = useState(0);
  const [overduePage, setOverduePage] = useState(0);
  const [reminderPage, setReminderPage] = useState(0);
  const [reminderStatus, setReminderStatus] = useState('');
  const [blockPage, setBlockPage] = useState(0);
  const [activeBlocksOnly, setActiveBlocksOnly] = useState(true);
  const perPage = 20;

  const [action, setAction] = useState<{ kind: ActionKind; invoice: OverdueInvoice } | null>(null);
  const [installments, setInstallments] = useState('3');
  const [firstDueDate, setFirstDueDate] = useState('');
  const [blockType, setBlockType] = useState<BlockType>('documents');
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });

  const errorMessage = (err: any, fallback: string) => {
    const errors = err?.response?.data?.errors;
    const firstError = errors ? (Object.values(errors)[0] as string[] | undefined)?.[0] : undefined;

    return firstError || err?.response?.data?.message || fallback;
  };

  const { data: stats } = useCollectionStatistics(tenant);

  const { data: overdueData, isLoading: overdueLoading } = useQuery({
    queryKey: ['invoices', 'overdue', overduePage],
    queryFn: async () => {
      const res = await createApiClient(tenant).get<{ data: OverdueInvoice[]; meta: { total: number } }>(
        '/admin/finance/invoices',
        { params: { overdue: 1, page: overduePage + 1, per_page: perPage, sort_by: 'due_date', sort_order: 'asc' } },
      );

      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const { data: remindersData, isLoading: remindersLoading } = useReminders(
    { page: reminderPage + 1, per_page: perPage, ...(reminderStatus ? { status: reminderStatus } : {}) },
    tenant,
  );

  const { data: blocksData, isLoading: blocksLoading } = useServiceBlocks(
    { page: blockPage + 1, per_page: perPage, active_only: activeBlocksOnly },
    tenant,
  );

  const generateMutation = useGenerateReminders(tenant);
  const sendMutation = useSendReminders(tenant);
  const blockMutation = useCreateServiceBlock(tenant);
  const liftMutation = useLiftServiceBlock(tenant);
  const planMutation = useCreatePaymentPlan(tenant);
  const writeOffMutation = useWriteOff(tenant);

  const handleGenerate = async () => {
    try {
      const res = await generateMutation.mutateAsync();

      notify(res.message || 'Relances générées.');
    } catch (err) {
      notify(errorMessage(err, 'Erreur lors de la génération des relances.'), 'error');
    }
  };

  const handleSend = async () => {
    try {
      const res = await sendMutation.mutateAsync();

      notify(res.message || 'Relances envoyées.');
    } catch (err) {
      notify(errorMessage(err, "Erreur lors de l'envoi des relances."), 'error');
    }
  };

  const handleLift = async (blockId: number) => {
    try {
      await liftMutation.mutateAsync(blockId);
      notify('Services débloqués.');
    } catch (err) {
      notify(errorMessage(err, 'Erreur lors du déblocage.'), 'error');
    }
  };

  const openAction = (kind: ActionKind, invoice: OverdueInvoice) => {
    setAction({ kind, invoice });
    setInstallments('3');
    setFirstDueDate('');
    setBlockType('documents');
    setReason('');
    setActionError(null);
  };

  const submitAction = async () => {
    if (!action) return;
    setActionError(null);

    try {
      if (action.kind === 'plan') {
        await planMutation.mutateAsync({
          invoice_id: action.invoice.id,
          number_of_installments: Number(installments),
          ...(firstDueDate ? { first_due_date: firstDueDate } : {}),
        });
        notify('Échéancier créé.');
      } else if (action.kind === 'block') {
        if (!reason.trim()) {
          setActionError('Le motif est obligatoire.');

          return;
        }

        await blockMutation.mutateAsync({
          student_id: action.invoice.student_id,
          block_type: blockType,
          reason: reason.trim(),
          related_invoice_ids: [action.invoice.id],
        });
        notify('Services bloqués.');
      } else {
        if (!reason.trim()) {
          setActionError('Le motif est obligatoire.');

          return;
        }

        await writeOffMutation.mutateAsync({ invoiceId: action.invoice.id, reason: reason.trim() });
        notify('Créance passée en perte.');
      }

      setAction(null);
    } catch (err) {
      setActionError(errorMessage(err, "Erreur lors de l'opération."));
    }
  };

  const actionPending = planMutation.isPending || blockMutation.isPending || writeOffMutation.isPending;

  const studentLabel = (s?: { firstname: string; lastname: string; matricule: string } | null) =>
    s ? `${s.firstname} ${s.lastname} (${s.matricule})` : '—';

  const loader = (
    <Box display='flex' justifyContent='center' p={4}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant='h4' fontWeight='bold'>
          Recouvrement &amp; relances
        </Typography>
        {canAct && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant='outlined' onClick={handleGenerate} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? 'Génération…' : 'Générer les relances'}
            </Button>
            <Button variant='contained' onClick={handleSend} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? 'Envoi…' : 'Envoyer les relances en attente'}
            </Button>
          </Box>
        )}
      </Box>

      {!canAct && (
        <Alert severity='info' sx={{ mb: 2 }}>
          Consultation seule : les relances, blocages et échéanciers sont gérés par l&apos;administration et la comptabilité.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Montant en retard', value: formatXof(stats?.total_overdue_amount ?? 0), color: '#f44336' },
          { label: 'Factures en retard', value: stats?.total_overdue_count ?? 0, color: '#ff9800' },
          { label: 'Relances envoyées', value: stats?.reminders_sent ?? 0, color: '#1976d2' },
          { label: 'Blocages actifs', value: stats?.active_blocks ?? 0, color: '#9c27b0' },
        ].map(stat => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h5' fontWeight='bold' sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {stats?.aging && (
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {Object.entries(stats.aging).map(([range, bucket]) => (
            <Chip key={range} variant='outlined' label={`${range} j : ${bucket.count} — ${formatXof(bucket.amount)}`} />
          ))}
        </Box>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label='Factures en retard' />
        <Tab label='Relances' />
        <Tab label='Blocages de services' />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            {overdueLoading ? loader : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Facture</TableCell>
                      <TableCell>Élève</TableCell>
                      <TableCell>Échéance</TableCell>
                      <TableCell align='right'>Retard</TableCell>
                      <TableCell align='right'>Reste dû</TableCell>
                      {canAct && <TableCell align='center'>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(overdueData?.data ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={canAct ? 6 : 5} align='center'>
                          <Typography color='text.secondary' sx={{ py: 3 }}>Aucune facture en retard.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (overdueData?.data ?? []).map(invoice => (
                        <TableRow key={invoice.id} hover>
                          <TableCell>{invoice.invoice_number}</TableCell>
                          <TableCell>{studentLabel(invoice.student)}</TableCell>
                          <TableCell>{formatDate(invoice.due_date)}</TableCell>
                          <TableCell align='right'>{daysLate(invoice.due_date)} j</TableCell>
                          <TableCell align='right'>
                            <Typography fontWeight='bold' color='error.main'>
                              {formatXof(Number(invoice.total_amount) - Number(invoice.paid_amount))}
                            </Typography>
                          </TableCell>
                          {canAct && (
                            <TableCell align='center'>
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button size='small' variant='outlined' onClick={() => openAction('plan', invoice)}>Échéancier</Button>
                                <Button size='small' variant='outlined' color='warning' onClick={() => openAction('block', invoice)}>Bloquer</Button>
                                <Button size='small' variant='outlined' color='error' onClick={() => openAction('writeoff', invoice)}>Perte</Button>
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <TablePagination
              component='div'
              count={overdueData?.meta?.total ?? 0}
              page={overduePage}
              rowsPerPage={perPage}
              rowsPerPageOptions={[perPage]}
              onPageChange={(_, p) => setOverduePage(p)}
            />
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <FormControl size='small' sx={{ minWidth: 200, mb: 2 }}>
              <InputLabel>Statut</InputLabel>
              <Select label='Statut' value={reminderStatus} onChange={e => { setReminderStatus(e.target.value); setReminderPage(0); }}>
                <MenuItem value=''>Tous</MenuItem>
                {Object.entries(REMINDER_STATUS).map(([value, { label }]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {remindersLoading ? loader : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Niveau</TableCell>
                      <TableCell>Élève</TableCell>
                      <TableCell>Facture</TableCell>
                      <TableCell>Canaux</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Envoyée le</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(remindersData?.data ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align='center'>
                          <Typography color='text.secondary' sx={{ py: 3 }}>Aucune relance.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (remindersData?.data ?? []).map(reminder => {
                        const status = REMINDER_STATUS[reminder.status] ?? { label: reminder.status, color: 'default' as const };

                        return (
                          <TableRow key={reminder.id} hover>
                            <TableCell>{formatDate(reminder.reminder_date)}</TableCell>
                            <TableCell>{REMINDER_LEVEL_LABELS[reminder.reminder_type] ?? reminder.reminder_type}</TableCell>
                            <TableCell>{studentLabel(reminder.student)}</TableCell>
                            <TableCell>{reminder.invoice?.invoice_number ?? `#${reminder.invoice_id}`}</TableCell>
                            <TableCell>{(reminder.send_methods ?? []).join(', ') || '—'}</TableCell>
                            <TableCell><Chip size='small' label={status.label} color={status.color} /></TableCell>
                            <TableCell>{formatDate(reminder.sent_at)}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <TablePagination
              component='div'
              count={remindersData?.meta?.total ?? 0}
              page={reminderPage}
              rowsPerPage={perPage}
              rowsPerPageOptions={[perPage]}
              onPageChange={(_, p) => setReminderPage(p)}
            />
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            <FormControlLabel
              sx={{ mb: 1 }}
              control={<Checkbox checked={activeBlocksOnly} onChange={e => { setActiveBlocksOnly(e.target.checked); setBlockPage(0); }} />}
              label='Blocages actifs uniquement'
            />
            {blocksLoading ? loader : (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Élève</TableCell>
                      <TableCell>Service bloqué</TableCell>
                      <TableCell>Motif</TableCell>
                      <TableCell>Bloqué le</TableCell>
                      <TableCell>Statut</TableCell>
                      {canAct && <TableCell align='center'>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(blocksData?.data ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={canAct ? 6 : 5} align='center'>
                          <Typography color='text.secondary' sx={{ py: 3 }}>Aucun blocage.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (blocksData?.data ?? []).map(block => (
                        <TableRow key={block.id} hover>
                          <TableCell>{studentLabel(block.student)}</TableCell>
                          <TableCell>{BLOCK_TYPE_LABELS[block.block_type] ?? block.block_type}</TableCell>
                          <TableCell>{block.reason}</TableCell>
                          <TableCell>{formatDate(block.blocked_at)}</TableCell>
                          <TableCell>
                            <Chip size='small' label={block.is_active ? 'Actif' : `Levé le ${formatDate(block.unblocked_at)}`} color={block.is_active ? 'error' : 'default'} />
                          </TableCell>
                          {canAct && (
                            <TableCell align='center'>
                              {block.is_active && (
                                <Button size='small' variant='outlined' onClick={() => handleLift(block.id)} disabled={liftMutation.isPending}>
                                  Débloquer
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <TablePagination
              component='div'
              count={blocksData?.meta?.total ?? 0}
              page={blockPage}
              rowsPerPage={perPage}
              rowsPerPageOptions={[perPage]}
              onPageChange={(_, p) => setBlockPage(p)}
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={action !== null} onClose={() => setAction(null)} maxWidth='sm' fullWidth>
        <DialogTitle>
          {action?.kind === 'plan' && 'Créer un échéancier'}
          {action?.kind === 'block' && 'Bloquer des services'}
          {action?.kind === 'writeoff' && 'Passer la créance en perte'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {actionError && <Alert severity='error'>{actionError}</Alert>}
            {action && (
              <Alert severity='info'>
                Facture {action.invoice.invoice_number} — {studentLabel(action.invoice.student)} — reste dû{' '}
                {formatXof(Number(action.invoice.total_amount) - Number(action.invoice.paid_amount))}
              </Alert>
            )}
            {action?.kind === 'plan' && (
              <>
                <TextField
                  label="Nombre d'échéances"
                  type='number'
                  value={installments}
                  onChange={e => setInstallments(e.target.value)}
                  slotProps={{ htmlInput: { min: 2, max: 12 } }}
                />
                <TextField
                  label='Première échéance (optionnel)'
                  type='date'
                  value={firstDueDate}
                  onChange={e => setFirstDueDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </>
            )}
            {action?.kind === 'block' && (
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select label='Service' value={blockType} onChange={e => setBlockType(e.target.value as BlockType)}>
                  {Object.entries(BLOCK_TYPE_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {(action?.kind === 'block' || action?.kind === 'writeoff') && (
              <TextField label='Motif' multiline rows={3} value={reason} onChange={e => setReason(e.target.value)} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAction(null)} disabled={actionPending}>Annuler</Button>
          <Button variant='contained' color={action?.kind === 'writeoff' ? 'error' : 'primary'} onClick={submitAction} disabled={actionPending}>
            {actionPending ? 'Traitement…' : 'Valider'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
