'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { StudentAttendanceView } from '@/modules/PortailEtudiant/components/StudentPortalViews';
import type { StudentAttendanceRecord } from '@/modules/PortailEtudiant/types';

export default function MyAttendancePage() {
  return (
    <ScaffoldPage<StudentAttendanceRecord[]>
      title='Mes présences'
      subtitle='Absences et retards enregistrés'
      loader={() => studentPortalService.myAttendance()}
      render={(data) => <StudentAttendanceView data={data} />}
      emptyMessage='Aucune absence enregistrée.'
    />
  );
}
