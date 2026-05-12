'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';

export default function MyInvoicesPage() {
  return (
    <ScaffoldPage
      title='Mes factures'
      subtitle='Story Étudiant 05'
      loader={() => studentPortalService.myInvoices()}
      emptyMessage='Aucune facture en cours.'
    />
  );
}
