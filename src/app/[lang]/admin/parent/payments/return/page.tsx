'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { parentService } from '@/modules/PortailParent/services/parentService';

/**
 * Story Parent 06 — Page de retour après paiement CinetPay.
 *
 * URL : /admin/parent/payments/return?payment_id=...
 *
 * Polling toutes les 3s pendant 60s max sur GET /payments/{id}/status
 * jusqu'à un statut final (success / failed / refused / cancelled).
 */
export default function PaymentReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useParams<{ lang: string }>();
  const paymentId = Number(searchParams.get('payment_id'));

  const [status, setStatus] = useState<string>('pending');
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!paymentId) {
      setError('Aucun identifiant de paiement.');
      return;
    }

    let cancelled = false;
    const MAX_TRIES = 20; // 20 × 3s = 60s

    const poll = async () => {
      try {
        const res = await parentService.paymentStatus(paymentId);
        if (cancelled) return;
        setStatus(res.status);
        setTries((t) => t + 1);
        if (['success', 'failed', 'refused', 'cancelled'].includes(res.status)) {
          return; // final
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.response?.data?.message ?? 'Impossible de vérifier le statut.');
        return;
      }
      if (tries < MAX_TRIES) {
        setTimeout(poll, 3000);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const isFinal = ['success', 'failed', 'refused', 'cancelled'].includes(status);
  const isSuccess = status === 'success';

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Stack spacing={3} alignItems='center' textAlign='center'>
          <Typography variant='h5'>Statut du paiement</Typography>

          {error && <Alert severity='error'>{error}</Alert>}

          {!isFinal && !error && (
            <>
              <CircularProgress />
              <Typography color='text.secondary'>
                Vérification en cours… ({tries}/20)
              </Typography>
            </>
          )}

          {isFinal && isSuccess && (
            <Alert severity='success' sx={{ width: '100%' }}>
              Paiement confirmé ✅ — Votre facture est désormais réglée.
            </Alert>
          )}

          {isFinal && !isSuccess && (
            <Alert severity='warning' sx={{ width: '100%' }}>
              Paiement {status === 'refused' ? 'refusé' : status === 'cancelled' ? 'annulé' : 'échoué'}.
              Aucun montant n'a été débité.
            </Alert>
          )}

          <Box>
            <Button
              variant='contained'
              onClick={() => router.push(`/${lang}/admin/parent/children`)}
            >
              Retour à mes enfants
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
