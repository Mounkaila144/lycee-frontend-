'use client';

import Grid from '@mui/material/Grid2';
import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { createApiClient } from '@/shared/lib/api-client';

const loadAccounts = async () => {
  const { data } = await createApiClient().get<{ data: any[] }>(
    '/admin/finance/bank-reconciliation/accounts'
  );
  return data.data;
};

const loadTransactions = async () => {
  const { data } = await createApiClient().get<{ data: any[] }>(
    '/admin/finance/bank-reconciliation/transactions'
  );
  return data.data;
};

const loadPeriods = async () => {
  const { data } = await createApiClient().get<{ data: any[] }>(
    '/admin/finance/bank-reconciliation/periods'
  );
  return data.data;
};

export default function BankReconciliationPage() {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 4 }}>
        <ScaffoldPage
          title='Comptes bancaires'
          subtitle='Story Comptable 03'
          loader={loadAccounts}
          emptyMessage='Aucun compte bancaire configuré.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ScaffoldPage
          title='Transactions bancaires'
          subtitle='Import récent'
          loader={loadTransactions}
          emptyMessage='Aucune transaction.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ScaffoldPage
          title='Périodes de rapprochement'
          subtitle='Historique'
          loader={loadPeriods}
          emptyMessage='Aucune période ouverte.'
        />
      </Grid>
    </Grid>
  );
}
