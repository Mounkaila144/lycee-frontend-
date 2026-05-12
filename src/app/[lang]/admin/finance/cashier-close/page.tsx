'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { createApiClient } from '@/shared/lib/api-client';

const loadCashierCloses = async () => {
  const { data } = await createApiClient().get<{ data: any[] }>('/admin/finance/cashier-close');
  return data.data;
};

export default function CashierClosePage() {
  return (
    <ScaffoldPage
      title='Clôture journalière de caisse'
      subtitle='Story Caissier 05'
      loader={loadCashierCloses}
      emptyMessage='Aucune clôture enregistrée.'
    />
  );
}
