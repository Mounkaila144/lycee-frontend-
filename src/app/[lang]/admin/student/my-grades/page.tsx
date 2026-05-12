'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';

export default function MyGradesPage() {
  return (
    <ScaffoldPage
      title='Mes notes'
      subtitle='Story Étudiant 02'
      loader={() => studentPortalService.myGrades()}
      emptyMessage='Aucune note publiée pour le moment.'
    />
  );
}
