'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { GradesView } from '@/modules/PortailEtudiant/components/StudentViews';

export default function MyGradesPage() {
  return (
    <ScaffoldPage
      title='Mes notes'
      loader={() => studentPortalService.myGrades()}
      render={GradesView}
      emptyMessage='Aucune note publiée pour le moment.'
    />
  );
}
