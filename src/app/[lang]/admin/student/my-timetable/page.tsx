'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';

export default function MyTimetablePage() {
  return (
    <ScaffoldPage
      title='Mon emploi du temps'
      subtitle='Story Étudiant 03'
      loader={() => studentPortalService.myTimetable()}
      emptyMessage='Aucun créneau planifié.'
    />
  );
}
