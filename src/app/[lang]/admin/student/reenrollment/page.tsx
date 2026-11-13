'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { StudentReenrollmentView } from '@/modules/PortailEtudiant/components/StudentPortalViews';
import type { StudentReenrollment } from '@/modules/PortailEtudiant/types';

export default function ReenrollmentPage() {
  return (
    <ScaffoldPage<StudentReenrollment>
      title='Réinscription'
      subtitle='Campagnes de réinscription ouvertes'
      loader={() => studentPortalService.reenrollment()}
      render={(data) => <StudentReenrollmentView data={data} />}
    />
  );
}
