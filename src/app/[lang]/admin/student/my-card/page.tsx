'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';

export default function MyCardPage() {
  return (
    <ScaffoldPage
      title='Ma carte scolaire'
      subtitle='Story Étudiant 07'
      loader={() => studentPortalService.myCard()}
    />
  );
}
