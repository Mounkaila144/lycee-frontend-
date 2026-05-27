'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

const fmt = (v: number | null | undefined): string => (v == null ? '—' : Number(v).toFixed(2).replace('.', ','));
const fmtDate = (d?: string | null): string => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const fmtMoney = (v?: number | null): string => (v == null ? '—' : `${Number(v).toLocaleString('fr-FR')} FCFA`);

interface SubjectCol { subject_id: number; name: string; code?: string; coefficient: number }
interface SubjectResult { subject_id: number; average: number | null; coefficient: number; weighted: number | null }

export function GradesView(data: { subjects?: SubjectCol[]; student?: { subjects?: SubjectResult[]; general_average?: number | null; rank?: number | null } | null; class_average?: number | null }): React.ReactNode {
  const subjects = data?.subjects ?? [];
  const student = data?.student;
  if (!student || subjects.length === 0) {
    return <Alert severity="info">Aucune note disponible pour le moment.</Alert>;
  }
  const bySubject = new Map((student.subjects ?? []).map(s => [s.subject_id, s]));
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip color="primary" label={`Moyenne générale : ${fmt(student.general_average)}/20`} />
        <Chip label={`Rang : ${student.rank ?? '—'}`} />
        <Chip variant="outlined" label={`Moyenne de la classe : ${fmt(data.class_average)}/20`} />
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Matière</TableCell>
              <TableCell align="center">Coef.</TableCell>
              <TableCell align="center">Moyenne /20</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map(col => {
              const r = bySubject.get(col.subject_id);
              return (
                <TableRow key={col.subject_id} hover>
                  <TableCell>{col.name}</TableCell>
                  <TableCell align="center">{fmt(col.coefficient)}</TableCell>
                  <TableCell align="center">{fmt(r?.average ?? null)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function AttendanceView(data: { records?: any[]; summary?: Record<string, number> }): React.ReactNode {
  const records = data?.records ?? [];
  const s = data?.summary ?? {};
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip color="success" label={`Présent : ${s.present ?? 0}`} />
        <Chip color="error" label={`Absent : ${s.absent ?? 0}`} />
        <Chip color="warning" label={`Retard : ${s.late ?? 0}`} />
        <Chip label={`Excusé : ${s.excused ?? 0}`} />
      </Box>
      {records.length === 0 ? <Alert severity="info">Aucun relevé de présence.</Alert> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Matière</TableCell><TableCell>Statut</TableCell></TableRow></TableHead>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell>{fmtDate(r.session_date)}</TableCell>
                  <TableCell>{r.subject_name ?? '—'}</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export function InvoicesView(data: { invoices?: any[]; summary?: Record<string, number> }): React.ReactNode {
  const invoices = data?.invoices ?? [];
  const s = data?.summary ?? {};
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip label={`Total dû : ${fmtMoney(s.total_due)}`} />
        <Chip color="success" label={`Payé : ${fmtMoney(s.total_paid)}`} />
        <Chip color={s.balance && s.balance > 0 ? 'error' : 'success'} label={`Solde : ${fmtMoney(s.balance)}`} />
      </Box>
      {invoices.length === 0 ? <Alert severity="info">Aucune facture.</Alert> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead><TableRow><TableCell>N°</TableCell><TableCell>Date</TableCell><TableCell align="right">Montant</TableCell><TableCell align="right">Payé</TableCell><TableCell align="right">Solde</TableCell><TableCell>Statut</TableCell></TableRow></TableHead>
            <TableBody>
              {invoices.map(inv => (
                <TableRow key={inv.id} hover>
                  <TableCell>{inv.invoice_number}</TableCell>
                  <TableCell>{fmtDate(inv.invoice_date)}</TableCell>
                  <TableCell align="right">{fmtMoney(inv.total_amount)}</TableCell>
                  <TableCell align="right">{fmtMoney(inv.paid_amount)}</TableCell>
                  <TableCell align="right">{fmtMoney(inv.balance)}</TableCell>
                  <TableCell>{inv.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export function DocumentsView(data: any[]): React.ReactNode {
  const docs = Array.isArray(data) ? data : [];
  if (docs.length === 0) return <Alert severity="info">Aucun document disponible.</Alert>;
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead><TableRow><TableCell>N°</TableCell><TableCell>Type</TableCell><TableCell>Date</TableCell><TableCell>Code</TableCell></TableRow></TableHead>
        <TableBody>
          {docs.map(d => (
            <TableRow key={d.id} hover>
              <TableCell>{d.document_number}</TableCell>
              <TableCell>{d.document_type}</TableCell>
              <TableCell>{fmtDate(d.issue_date)}</TableCell>
              <TableCell>{d.verification_code ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function TimetableView(data: any[]): React.ReactNode {
  const slots = Array.isArray(data) ? data : [];
  if (slots.length === 0) return <Alert severity="info">Aucun cours programmé.</Alert>;
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead><TableRow><TableCell>Jour</TableCell><TableCell>Horaire</TableCell><TableCell>Matière</TableCell><TableCell>Enseignant</TableCell><TableCell>Salle</TableCell></TableRow></TableHead>
        <TableBody>
          {slots.map(s => (
            <TableRow key={s.id} hover>
              <TableCell>{s.day_of_week}</TableCell>
              <TableCell>{String(s.start_time).slice(0, 5)} - {String(s.end_time).slice(0, 5)}</TableCell>
              <TableCell>{s.subject_name ?? '—'}</TableCell>
              <TableCell>{s.teacher_name || '—'}</TableCell>
              <TableCell>{s.room_name ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function CardView(data: { card_status?: string; card_number?: string | null; issue_date?: string | null; verification_code?: string | null }): React.ReactNode {
  if (!data || data.card_status !== 'issued') {
    return <Alert severity="info">Aucune carte scolaire émise. Contactez l'administration.</Alert>;
  }
  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 420 }}>
      <Typography variant="overline" color="primary">Carte scolaire</Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>{data.card_number}</Typography>
      <Typography variant="body2">Émise le : {fmtDate(data.issue_date)}</Typography>
      <Typography variant="body2">Code de vérification : {data.verification_code}</Typography>
    </Paper>
  );
}
