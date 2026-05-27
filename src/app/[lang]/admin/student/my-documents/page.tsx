'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { DocumentsView } from '@/modules/PortailEtudiant/components/StudentViews';

export default function MyDocumentsPage() {
  return (
    <ScaffoldPage
      title='Mes documents'
      loader={() => studentPortalService.myDocuments()}
      render={DocumentsView}
      emptyMessage='Aucun document disponible.'
    />
  );
}
