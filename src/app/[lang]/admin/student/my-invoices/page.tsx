'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { InvoicesView } from '@/modules/PortailEtudiant/components/StudentViews';

export default function MyInvoicesPage() {
  return (
    <ScaffoldPage
      title='Mes factures'
      loader={() => studentPortalService.myInvoices()}
      render={InvoicesView}
      emptyMessage='Aucune facture en cours.'
    />
  );
}
