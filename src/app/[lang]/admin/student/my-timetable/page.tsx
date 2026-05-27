'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { TimetableView } from '@/modules/PortailEtudiant/components/StudentViews';

export default function MyTimetablePage() {
  return (
    <ScaffoldPage
      title='Mon emploi du temps'
      loader={() => studentPortalService.myTimetable()}
      render={TimetableView}
      emptyMessage='Aucun créneau planifié.'
    />
  );
}
