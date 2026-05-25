'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';

export default function StudentHomePage() {
  return (
    <ScaffoldPage
      title='Accueil'
      subtitle='Portail Élève'
      loader={() => studentPortalService.me()}
      emptyMessage='Bienvenue sur votre portail élève.'
    />
  );
}
