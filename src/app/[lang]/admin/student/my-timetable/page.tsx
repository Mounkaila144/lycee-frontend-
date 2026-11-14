'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { WeeklyTimetableGrid } from '@/modules/Timetable/admin/components/WeeklyTimetableGrid';
import { portalToSlots } from '@/modules/Timetable/admin/services/lyceeTimetableService';
import type { PortalTimetableSlot } from '@/modules/Timetable/types/lycee.types';

export default function MyTimetablePage() {
  return (
    <ScaffoldPage<PortalTimetableSlot[]>
      title='Mon emploi du temps'
      subtitle='Cours de la semaine de votre classe'
      loader={() => studentPortalService.myTimetable()}
      render={(slots) => <WeeklyTimetableGrid slots={portalToSlots(slots)} />}
      emptyMessage='Aucun créneau planifié.'
    />
  );
}
