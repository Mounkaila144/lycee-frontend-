'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { CardView } from '@/modules/PortailEtudiant/components/StudentViews';

export default function MyCardPage() {
  return (
    <ScaffoldPage
      title='Ma carte scolaire'
      loader={() => studentPortalService.myCard()}
      render={CardView}
    />
  );
}
