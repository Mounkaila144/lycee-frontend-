'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { AnnouncementList } from '@/modules/Messaging/components/AnnouncementList';
import { parentService } from '@/modules/PortailParent/services/parentService';

export default function ParentAnnouncementsPage() {
  return (
    <ScaffoldPage
      title='Annonces de l’établissement'
      subtitle='Informations générales et annonces des classes de vos enfants'
      loader={() => parentService.announcements()}
      render={(announcements) => <AnnouncementList announcements={announcements} />}
      emptyMessage='Aucune annonce publiée.'
    />
  );
}
