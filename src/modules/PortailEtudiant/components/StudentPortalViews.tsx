'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type {
  StudentAttendanceRecord,
  StudentCard,
  StudentDashboard,
  StudentDocument,
  StudentInvoice,
  StudentReenrollment,
  StudentReenrollmentCampaign,
  StudentReenrollmentIntention,
} from '../types';
import { studentPortalService } from '../services/studentPortalService';
import { extractErrorMessage } from '@/modules/Grades/lycee/services/lyceeGradesService';
import { formatScore, toScore } from '@/modules/Grades/lycee/types';

type ChipColor = 'default' | 'success' | 'warning' | 'error' | 'info';

const formatAmount = (value: number, currency = 'XOF') =>
  `${new Intl.NumberFormat('fr-FR').format(value)} ${currency === 'XOF' ? 'FCFA' : currency}`;

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '—';

const INVOICE_STATUS: Record<string, { label: string; color: ChipColor }> = {
  pending: { label: 'En attente', color: 'warning' },
  partial: { label: 'Partiellement payée', color: 'info' },
  paid: { label: 'Payée', color: 'success' },
  overdue: { label: 'En retard', color: 'error' },
  cancelled: { label: 'Annulée', color: 'default' },
};

const ATTENDANCE_COLOR: Record<string, ChipColor> = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  excused: 'info',
};

const CARD_STATUS: Record<string, { label: string; color: ChipColor }> = {
  not_issued: { label: 'Non délivrée', color: 'default' },
  active: { label: 'Active', color: 'success' },
  expired: { label: 'Expirée', color: 'warning' },
  suspended: { label: 'Suspendue', color: 'error' },
  lost: { label: 'Perdue', color: 'error' },
  stolen: { label: 'Volée', color: 'error' },
  replaced: { label: 'Remplacée', color: 'default' },
};

function Kpi({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card variant='outlined' sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='body2' color='text.secondary'>
          {label}
        </Typography>
        <Typography variant='h5' sx={{ mt: 1 }}>
          {value}
        </Typography>
        {hint && (
          <Typography variant='caption' color='text.secondary'>
            {hint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function StudentHomeView({ data }: { data: StudentDashboard }) {
  const next = data.next_class;
  const currentAverage = toScore(data.moyenne_actuelle ?? data.average);

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant='h6'>Bonjour {data.student.full_name}</Typography>
        <Typography variant='body2' color='text.secondary'>
          Matricule {data.student.matricule}
          {data.classe ? ` · Classe ${data.classe.name} (${data.classe.academic_year ?? ''})` : ' · Aucune classe affectée'}
        </Typography>
      </Box>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Kpi
            label='Moyenne actuelle'
            value={currentAverage === null ? '—' : `${formatScore(currentAverage)} / 20`}
            hint='Semestre en cours · notes publiées'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Kpi
            label='Prochain cours'
            value={next ? next.subject ?? 'Cours' : '—'}
            hint={next ? `${next.day_of_week} ${next.start_time}–${next.end_time}` : 'Aucun créneau planifié'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Kpi label='Absences (30 derniers jours)' value={data.recent_absences_count} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Kpi label='Factures à régler' value={data.pending_invoices_count} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Kpi label='Reste à payer' value={formatAmount(data.balance_due, data.currency)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Kpi label='Documents disponibles' value={data.available_documents_count} />
        </Grid>
      </Grid>
    </Stack>
  );
}

export function StudentAttendanceView({ data }: { data: StudentAttendanceRecord[] }) {
  const count = (status: string) => data.filter((record) => record.status === status).length;

  return (
    <Stack spacing={3}>
      <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
        <Chip color='error' label={`Absences : ${count('absent')}`} />
        <Chip color='warning' label={`Retards : ${count('late')}`} />
        <Chip color='info' label={`Excusées : ${count('excused')}`} />
      </Stack>
      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Horaire</TableCell>
              <TableCell>Matière</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Remarque</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{formatDate(record.date)}</TableCell>
                <TableCell>
                  {record.start_time ? `${record.start_time.slice(0, 5)}–${record.end_time?.slice(0, 5) ?? ''}` : '—'}
                </TableCell>
                <TableCell>{record.subject ?? '—'}</TableCell>
                <TableCell>
                  <Chip size='small' color={ATTENDANCE_COLOR[record.status] ?? 'default'} label={record.status_label} />
                  {record.delay_minutes ? ` (${record.delay_minutes} min)` : ''}
                </TableCell>
                <TableCell>{record.notes ?? ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

export function StudentInvoicesView({ data }: { data: StudentInvoice[] }) {
  const billable = data.filter((invoice) => invoice.status !== 'cancelled');
  const totalBalance = billable.reduce((sum, invoice) => sum + invoice.balance, 0);

  return (
    <Stack spacing={4}>
      <Alert severity={totalBalance > 0 ? 'warning' : 'success'}>
        Reste à payer : <strong>{formatAmount(totalBalance)}</strong>
      </Alert>
      {data.map((invoice) => {
        const status = INVOICE_STATUS[invoice.status] ?? { label: invoice.status, color: 'default' as ChipColor };

        return (
          <Card key={invoice.id} variant='outlined'>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='center' flexWrap='wrap' useFlexGap spacing={2}>
                <Box>
                  <Typography variant='subtitle1'>Facture {invoice.invoice_number}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {invoice.academic_year ? `Année ${invoice.academic_year} · ` : ''}Émise le {formatDate(invoice.invoice_date)} ·
                    Échéance {formatDate(invoice.due_date)}
                  </Typography>
                </Box>
                <Chip color={status.color} label={status.label} />
              </Stack>
              <Table size='small' sx={{ mt: 2 }}>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description ?? item.fee_type ?? '—'}</TableCell>
                      <TableCell align='right'>{formatAmount(item.amount - item.discount_amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align='right'><strong>{formatAmount(invoice.total_amount)}</strong></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Payé</TableCell>
                    <TableCell align='right'>{formatAmount(invoice.paid_amount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Reste</TableCell>
                    <TableCell align='right'>{formatAmount(invoice.balance)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {invoice.payments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant='subtitle2'>Paiements</Typography>
                  {invoice.payments.map((payment) => (
                    <Typography key={payment.id} variant='body2' color='text.secondary'>
                      {formatDate(payment.payment_date)} — {formatAmount(payment.amount)}
                      {payment.payment_method ? ` (${payment.payment_method})` : ''}
                      {payment.receipt_number ? ` · Reçu ${payment.receipt_number}` : ''}
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}

export function StudentDocumentsView({ data }: { data: StudentDocument[] }) {
  return (
    <TableContainer>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>Document</TableCell>
            <TableCell>Catégorie</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((document) => (
            <TableRow key={`${document.source}-${document.id}`}>
              <TableCell>
                {document.download_url ? (
                  <a href={document.download_url} target='_blank' rel='noreferrer'>
                    {document.title}
                  </a>
                ) : (
                  document.title
                )}
              </TableCell>
              <TableCell>{document.source === 'official' ? 'Document officiel' : 'Pièce du dossier'}</TableCell>
              <TableCell>{formatDate(document.date)}</TableCell>
              <TableCell>
                <Chip
                  size='small'
                  color={document.is_validated ? 'success' : 'warning'}
                  label={document.source === 'official' ? 'Délivré' : document.is_validated ? 'Validé' : 'En attente'}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function StudentCardView({ data }: { data: StudentCard }) {
  const status = CARD_STATUS[data.card_status] ?? { label: data.card_status, color: 'default' as ChipColor };

  return (
    <Stack spacing={2}>
      <Stack direction='row' spacing={2} alignItems='center'>
        <Typography variant='h6'>{data.full_name}</Typography>
        <Chip color={status.color} label={status.label} />
      </Stack>
      <Typography variant='body2'>Matricule : {data.matricule}</Typography>
      <Typography variant='body2'>
        Classe : {data.classe ? `${data.classe.name} (${data.classe.academic_year ?? ''})` : '—'}
      </Typography>
      {data.card_number && <Typography variant='body2'>N° de carte : {data.card_number}</Typography>}
      {data.issued_at && <Typography variant='body2'>Délivrée le : {formatDate(data.issued_at)}</Typography>}
      {data.valid_until && <Typography variant='body2'>Valide jusqu&apos;au : {formatDate(data.valid_until)}</Typography>}
      {data.card_status === 'not_issued' && (
        <Alert severity='info'>Votre carte scolaire n&apos;a pas encore été délivrée. Rapprochez-vous de l&apos;administration.</Alert>
      )}
    </Stack>
  );
}

function ReenrollmentIntentionForm({ campaign }: { campaign: StudentReenrollmentCampaign }) {
  const [intention, setIntention] = useState<StudentReenrollmentIntention | null>(campaign.my_intention ?? null);
  const [comment, setComment] = useState(campaign.my_intention?.comment ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (wantsToReenroll: boolean) => {
    setSaving(true);
    setError(null);

    try {
      setIntention(await studentPortalService.saveReenrollmentIntention(campaign.id, wantsToReenroll, comment.trim()));
    } catch (err) {
      setError(await extractErrorMessage(err, "Votre réponse n'a pas pu être enregistrée."));
    } finally {
      setSaving(false);
    }
  };

  if (!campaign.can_respond) {
    return (
      <Typography variant='body2' color='text.secondary'>
        Cette campagne ne vous concerne pas (aucune inscription sur l&apos;année concernée).
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {intention && (
        <Alert severity={intention.wants_to_reenroll ? 'success' : 'warning'}>
          {intention.wants_to_reenroll
            ? 'Vous avez indiqué souhaiter vous réinscrire l\'an prochain.'
            : 'Vous avez indiqué ne pas vous réinscrire l\'an prochain.'}
          {intention.responded_at ? ` (réponse du ${formatDate(intention.responded_at)})` : ''}
        </Alert>
      )}
      <Typography variant='body2'>Souhaitez-vous vous réinscrire dans l&apos;établissement l&apos;année prochaine ?</Typography>
      <TextField
        size='small'
        label='Commentaire (facultatif)'
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        inputProps={{ maxLength: 500 }}
        multiline
        minRows={1}
      />
      <Stack direction='row' spacing={2}>
        <Button
          variant={intention?.wants_to_reenroll === true ? 'contained' : 'outlined'}
          color='success'
          disabled={saving}
          onClick={() => save(true)}
        >
          Oui, je me réinscris
        </Button>
        <Button
          variant={intention?.wants_to_reenroll === false ? 'contained' : 'outlined'}
          color='warning'
          disabled={saving}
          onClick={() => save(false)}
        >
          Non, je quitte l&apos;établissement
        </Button>
      </Stack>
      {error && <Alert severity='error'>{error}</Alert>}
    </Stack>
  );
}

export function StudentReenrollmentView({ data }: { data: StudentReenrollment }) {
  if (data.open_campaigns.length === 0) {
    return <Alert severity='info'>Aucune campagne de réinscription n&apos;est ouverte pour le moment.</Alert>;
  }

  return (
    <Stack spacing={2}>
      {data.open_campaigns.map((campaign) => (
        <Card key={campaign.id} variant='outlined'>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant='subtitle1'>{campaign.name}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Du {formatDate(campaign.start_date)} au {formatDate(campaign.end_date)}
                </Typography>
                {campaign.description && <Typography variant='body2'>{campaign.description}</Typography>}
              </Box>
              {data.intentions_available === false ? (
                <Typography variant='body2' color='text.secondary'>
                  La réponse en ligne n&apos;est pas encore disponible : adressez-vous à l&apos;administration.
                </Typography>
              ) : (
                <ReenrollmentIntentionForm campaign={campaign} />
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
