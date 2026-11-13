'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { StudentCardView } from '@/modules/PortailEtudiant/components/StudentPortalViews';
import type { StudentCard } from '@/modules/PortailEtudiant/types';

export default function MyCardPage() {
  return (
    <ScaffoldPage<StudentCard>
      title='Ma carte scolaire'
      subtitle='Statut de votre carte'
      loader={() => studentPortalService.myCard()}
      render={(data) => <StudentCardView data={data} />}
    />
  );
}
