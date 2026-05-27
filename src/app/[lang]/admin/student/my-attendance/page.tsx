'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { AttendanceView } from '@/modules/PortailEtudiant/components/StudentViews';

export default function MyAttendancePage() {
  return (
    <ScaffoldPage
      title='Mes présences'
      loader={() => studentPortalService.myAttendance()}
      render={AttendanceView}
      emptyMessage='Aucune absence enregistrée.'
    />
  );
}
