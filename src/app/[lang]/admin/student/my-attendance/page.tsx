'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';

export default function MyAttendancePage() {
  return (
    <ScaffoldPage
      title='Mes présences'
      subtitle='Story Étudiant 04'
      loader={() => studentPortalService.myAttendance()}
      emptyMessage='Aucune absence enregistrée.'
    />
  );
}
