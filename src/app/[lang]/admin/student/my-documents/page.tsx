'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';

export default function MyDocumentsPage() {
  return (
    <ScaffoldPage
      title='Mes documents'
      subtitle='Story Étudiant 06'
      loader={() => studentPortalService.myDocuments()}
      emptyMessage='Aucun document disponible.'
    />
  );
}
