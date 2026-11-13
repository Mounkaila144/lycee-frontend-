'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { StudentHomeView } from '@/modules/PortailEtudiant/components/StudentPortalViews';
import type { StudentDashboard } from '@/modules/PortailEtudiant/types';

export default function StudentHomePage() {
  return (
    <ScaffoldPage<StudentDashboard>
      title='Accueil'
      subtitle='Portail Élève'
      loader={() => studentPortalService.dashboard()}
      render={(data) => <StudentHomeView data={data} />}
    />
  );
}
