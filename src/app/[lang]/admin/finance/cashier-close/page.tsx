'use client';

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { createApiClient } from '@/shared/lib/api-client';
import { CashierCloseDialog } from '@/modules/Finance/admin/components/CashierCloseDialog';

interface CashierCloseRecord {
  id: number;
  cashier_user_id: number;
  close_date: string;
  total_cash_declared: number;
  total_cash_system: number;
  variance: number;
  status: 'closed' | 'variance_pending' | 'variance_resolved';
  closed_at: string;
}

export default function CashierClosePage() {
  const [rows, setRows] = useState<CashierCloseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    createApiClient()
      .get<{ data: CashierCloseRecord[] }>('/admin/finance/cashier-close')
      .then(({ data }) => setRows(data.data))
      .catch((e) =>
        setError(e?.response?.data?.message ?? 'Erreur de chargement.')
      )
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const statusChip = (s: string) => {
    if (s === 'closed') return <Chip label='Clôturé' color='success' size='small' />;
    if (s === 'variance_pending')
      return <Chip label='Écart à investiguer' color='warning' size='small' />;
    return <Chip label={s} size='small' />;
  };

  return (
    <Card>
      <CardHeader
        title='Clôture journalière de caisse'
        subheader='Story Caissier 05'
        action={
          <Button variant='contained' onClick={() => setDialogOpen(true)}>
            Nouvelle clôture
          </Button>
        }
      />
      <CardContent>
        {loading && (
          <Box display='flex' justifyContent='center' p={4}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity='error'>{error}</Alert>}
        {!loading && !error && rows.length === 0 && (
          <Alert severity='info'>Aucune clôture enregistrée. Cliquez sur « Nouvelle clôture ».</Alert>
        )}
        {!loading && rows.length > 0 && (
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align='right'>Espèces déclaré</TableCell>
                <TableCell align='right'>Système</TableCell>
                <TableCell align='right'>Écart</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.close_date}</TableCell>
                  <TableCell align='right'>{Number(r.total_cash_declared).toFixed(2)}</TableCell>
                  <TableCell align='right'>{Number(r.total_cash_system).toFixed(2)}</TableCell>
                  <TableCell align='right' sx={{ color: Number(r.variance) !== 0 ? 'warning.main' : 'inherit' }}>
                    {Number(r.variance).toFixed(2)}
                  </TableCell>
                  <TableCell>{statusChip(r.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CashierCloseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </Card>
  );
}
