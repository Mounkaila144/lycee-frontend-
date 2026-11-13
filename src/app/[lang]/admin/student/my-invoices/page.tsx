'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { StudentInvoicesView } from '@/modules/PortailEtudiant/components/StudentPortalViews';
import type { StudentInvoice } from '@/modules/PortailEtudiant/types';

export default function MyInvoicesPage() {
  return (
    <ScaffoldPage<StudentInvoice[]>
      title='Mes factures'
      subtitle='Frais de scolarité et paiements'
      loader={() => studentPortalService.myInvoices()}
      render={(data) => <StudentInvoicesView data={data} />}
      emptyMessage='Aucune facture en cours.'
    />
  );
}
