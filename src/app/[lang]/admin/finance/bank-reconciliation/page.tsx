'use client';

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';

import { createApiClient } from '@/shared/lib/api-client';
import { BankAccountDialog } from '@/modules/Finance/admin/components/BankAccountDialog';

interface BankAccount {
  id: number;
  name: string;
  iban?: string;
  bank_name?: string;
  currency: string;
  opening_balance: number;
  is_active: boolean;
}

interface BankTransaction {
  id: number;
  transaction_date: string;
  description?: string;
  amount: number;
  status: string;
}

export default function BankReconciliationPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const client = createApiClient();
    Promise.all([
      client.get<{ data: BankAccount[] }>('/admin/finance/bank-reconciliation/accounts'),
      client.get<{ data: BankTransaction[] }>('/admin/finance/bank-reconciliation/transactions'),
    ])
      .then(([acc, tx]) => {
        setAccounts(acc.data.data);
        setTransactions(tx.data.data);
      })
      .catch(() => {});
  }, [refreshKey]);

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card>
          <CardHeader
            title='Comptes bancaires'
            subheader='Story Comptable 03'
            action={
              <Button variant='contained' onClick={() => setDialogOpen(true)}>
                Nouveau compte
              </Button>
            }
          />
          <CardContent>
            {accounts.length === 0 && <Alert severity='info'>Aucun compte configuré.</Alert>}
            {accounts.length > 0 && (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Banque</TableCell>
                    <TableCell align='right'>Solde init.</TableCell>
                    <TableCell>Devise</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.name}</TableCell>
                      <TableCell>{a.bank_name ?? '—'}</TableCell>
                      <TableCell align='right'>{Number(a.opening_balance).toFixed(2)}</TableCell>
                      <TableCell>{a.currency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <Card>
          <CardHeader title='Transactions récentes' subheader='Import + rapprochement' />
          <CardContent>
            {transactions.length === 0 && (
              <Alert severity='info'>Aucune transaction importée.</Alert>
            )}
            {transactions.length > 0 && (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Libellé</TableCell>
                    <TableCell align='right'>Montant</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.transaction_date}</TableCell>
                      <TableCell>{t.description ?? '—'}</TableCell>
                      <TableCell
                        align='right'
                        sx={{ color: t.amount < 0 ? 'error.main' : 'success.main' }}
                      >
                        {Number(t.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t.status}
                          color={t.status === 'matched' ? 'success' : 'default'}
                          size='small'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grid>

      <BankAccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </Grid>
  );
}
