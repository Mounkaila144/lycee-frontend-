'use client';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type {
  ChildAttendanceRecord,
  ChildGrade,
  ChildInvoice,
  ChildSummary,
} from '../../types/portail-parent.types';

const formatDate = (value: string | null | undefined): string =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '—';

const formatAmount = (value: number, currency: string): string =>
  `${new Intl.NumberFormat('fr-FR').format(value)} ${currency}`;

function SimpleTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <TableContainer>
      <Table size='small'>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((cells, rowIndex) => (
            <TableRow key={rowIndex}>
              {cells.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ChildProfileDetails({ child }: { child: ChildSummary }) {
  const lines: [string, string][] = [
    ['Nom complet', child.full_name],
    ['Matricule', child.matricule ?? 'En attente'],
    ['Date de naissance', formatDate(child.birthdate)],
    ['Sexe', child.sex === 'F' ? 'Féminin' : 'Masculin'],
    ['Nationalité', child.nationality ?? '—'],
    ['Statut', child.status],
  ];

  return (
    <Stack spacing={1}>
      {lines.map(([label, value]) => (
        <Stack key={label} direction='row' spacing={2}>
          <Typography variant='body2' color='text.secondary' sx={{ minWidth: 140 }}>
            {label}
          </Typography>
          <Typography variant='body2'>{value}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export function ChildGradesTable({ grades }: { grades: ChildGrade[] }) {
  return (
    <SimpleTable
      headers={['Matière', 'Évaluation', 'Note', 'Date']}
      rows={grades.map((grade) => [
        grade.subject ?? '—',
        grade.evaluation ?? '—',
        grade.is_absent ? 'Absent' : grade.score === null ? '—' : `${grade.score} / ${grade.max_score}`,
        formatDate(grade.evaluation_date),
      ])}
    />
  );
}

const attendanceColors: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  Présent: 'success',
  Absent: 'error',
  Retard: 'warning',
  Excusé: 'info',
};

export function ChildAttendanceTable({ records }: { records: ChildAttendanceRecord[] }) {
  return (
    <SimpleTable
      headers={['Date', 'Matière', 'Horaire', 'Statut']}
      rows={records.map((record) => [
        formatDate(record.date),
        record.subject ?? '—',
        record.start_time ? `${record.start_time.slice(0, 5)} - ${record.end_time?.slice(0, 5) ?? ''}` : '—',
        <Chip
          key='status'
          size='small'
          label={record.status}
          color={attendanceColors[record.status] ?? 'default'}
        />,
      ])}
    />
  );
}

const invoiceStatusLabels: Record<string, string> = {
  pending: 'En attente',
  partial: 'Partiellement payée',
  paid: 'Payée',
  overdue: 'En retard',
  cancelled: 'Annulée',
};

export function ChildInvoicesTable({ invoices }: { invoices: ChildInvoice[] }) {
  return (
    <SimpleTable
      headers={['N°', 'Échéance', 'Montant', 'Payé', 'Reste', 'Statut']}
      rows={invoices.map((invoice) => [
        invoice.invoice_number,
        formatDate(invoice.due_date),
        formatAmount(invoice.amount, invoice.currency),
        formatAmount(invoice.paid_amount, invoice.currency),
        formatAmount(invoice.balance, invoice.currency),
        <Chip
          key='status'
          size='small'
          label={invoiceStatusLabels[invoice.status] ?? invoice.status}
          color={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'error' : 'warning'}
        />,
      ])}
    />
  );
}
