'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';

export default function ReenrollmentPage() {
  return (
    <ScaffoldPage
      title='Réinscription'
      subtitle='Story Étudiant 08'
      loader={() => studentPortalService.reenrollment()}
    />
  );
}
