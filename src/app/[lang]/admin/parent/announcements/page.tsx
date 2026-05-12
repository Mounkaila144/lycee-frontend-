'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { parentService } from '@/modules/PortailParent/services/parentService';

export default function ParentAnnouncementsPage() {
  return (
    <ScaffoldPage
      title='Annonces de l’établissement'
      subtitle='Story Parent 08'
      loader={() => parentService.announcements()}
      emptyMessage='Aucune annonce publiée.'
    />
  );
}
