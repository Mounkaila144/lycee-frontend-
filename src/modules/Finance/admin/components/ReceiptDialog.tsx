'use client';

import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { useQuery } from '@tanstack/react-query';

import { createApiClient } from '@/shared/lib/api-client';

/** Forme renvoyée par GET /admin/finance/payments/{id}/receipt */
export interface ReceiptData {
  receipt_number: string | null;
  payment_date: string;
  amount: number | string;
  amount_words?: string;
  payment_method: string;
  reference_number?: string | null;
  invoice_number: string;
  student: { matricule?: string; firstname?: string; lastname?: string };
  invoice_total: number | string;
  invoice_paid: number | string;
  invoice_balance: number | string;
  recorded_by?: string | null;
  notes?: string | null;
}

export const FINANCE_PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Espèces',
  mobile_money: 'Mobile Money',
  bank_transfer: 'Virement bancaire',
  check: 'Chèque',
  card: 'Carte bancaire',
  online: 'Paiement en ligne',
};

export const formatXof = (amount: number | string | null | undefined): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(
    Number(amount ?? 0),
  );

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const printReceipt = (receipt: ReceiptData) => {
  const win = window.open('', '_blank', 'width=720,height=900');

  if (!win) return;

  const method = FINANCE_PAYMENT_METHOD_LABELS[receipt.payment_method] ?? receipt.payment_method;

  const rows: Array<[string, string]> = [
    ['N° reçu', receipt.receipt_number ?? '—'],
    ['Date', receipt.payment_date],
    ['Élève', `${receipt.student?.firstname ?? ''} ${receipt.student?.lastname ?? ''} (${receipt.student?.matricule ?? ''})`],
    ['Facture', receipt.invoice_number],
    ['Montant', formatXof(receipt.amount)],
    ['Montant en lettres', receipt.amount_words ? `${receipt.amount_words} francs CFA` : '—'],
    ['Mode de paiement', method],
    ['Référence', receipt.reference_number ?? '—'],
    ['Total facture', formatXof(receipt.invoice_total)],
    ['Total payé', formatXof(receipt.invoice_paid)],
    ['Reste à payer', formatXof(receipt.invoice_balance)],
    ['Encaissé par', receipt.recorded_by ?? '—'],
  ];

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Reçu ${escapeHtml(receipt.receipt_number)}</title>
<style>body{font-family:Arial,sans-serif;padding:32px;color:#222}h1{text-align:center;font-size:20px;margin-bottom:24px}
table{width:100%;border-collapse:collapse}td{padding:8px;border-bottom:1px solid #ddd}td:first-child{color:#555;width:40%}
.sign{margin-top:48px;text-align:right}</style></head><body>
<h1>REÇU DE PAIEMENT</h1><table>${rows
    .map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td><strong>${escapeHtml(value)}</strong></td></tr>`)
    .join('')}</table><p class="sign">Signature et cachet</p></body></html>`);
  win.document.close();
  win.focus();
  win.print();
};

interface ReceiptDialogProps {
  paymentId: number | null;
  tenantId?: string | null;
  onClose: () => void;
}

/**
 * Affiche le reçu d'un paiement (données serveur) et permet de l'imprimer.
 */
export const ReceiptDialog: React.FC<ReceiptDialogProps> = ({ paymentId, tenantId, onClose }) => {
  const { data: receipt, isLoading, error } = useQuery({
    queryKey: ['payment-receipt', paymentId],
    queryFn: async () => {
      const res = await createApiClient(tenantId || undefined).get<{ data: ReceiptData }>(
        `/admin/finance/payments/${paymentId}/receipt`,
      );

      return res.data.data;
    },
    enabled: paymentId !== null,
  });

  const field = (label: string, value: React.ReactNode, size = 6) => (
    <Grid size={{ xs: size }}>
      <Typography variant='caption' color='text.secondary'>{label}</Typography>
      <Typography fontWeight='medium'>{value}</Typography>
    </Grid>
  );

  return (
    <Dialog open={paymentId !== null} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Reçu de paiement</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box display='flex' justifyContent='center' p={3}><CircularProgress /></Box>
        )}
        {error instanceof Error && <Alert severity='error'>Impossible de charger le reçu.</Alert>}
        {receipt && (
          <Paper variant='outlined' sx={{ p: 3, mt: 1 }}>
            <Grid container spacing={1.5}>
              {field('N° reçu', receipt.receipt_number ?? '—')}
              {field('Date', receipt.payment_date)}
              <Grid size={{ xs: 12 }}><Divider /></Grid>
              {field('Élève', `${receipt.student?.firstname ?? ''} ${receipt.student?.lastname ?? ''}`)}
              {field('Matricule', receipt.student?.matricule ?? '—')}
              {field('Facture', receipt.invoice_number)}
              {field('Mode', FINANCE_PAYMENT_METHOD_LABELS[receipt.payment_method] ?? receipt.payment_method)}
              <Grid size={{ xs: 12 }}><Divider /></Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary'>Montant</Typography>
                <Typography variant='h5' fontWeight='bold' color='success.main'>{formatXof(receipt.amount)}</Typography>
                {receipt.amount_words && (
                  <Typography variant='body2' color='text.secondary'>{receipt.amount_words} francs CFA</Typography>
                )}
              </Grid>
              {field('Total facture', formatXof(receipt.invoice_total), 4)}
              {field('Total payé', formatXof(receipt.invoice_paid), 4)}
              {field('Reste à payer', formatXof(receipt.invoice_balance), 4)}
              {field('Référence', receipt.reference_number ?? '—')}
              {field('Encaissé par', receipt.recorded_by || '—')}
            </Grid>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        <Button variant='contained' disabled={!receipt} onClick={() => receipt && printReceipt(receipt)}>
          Imprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
