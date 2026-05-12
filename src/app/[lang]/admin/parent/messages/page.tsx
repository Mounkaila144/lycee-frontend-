'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { messagingService } from '@/modules/Messaging/services/messagingService';

export default function ParentMessagesPage() {
  return (
    <ScaffoldPage
      title='Messagerie'
      subtitle='Story Parent 07 — Messages enseignants'
      loader={() => messagingService.inbox()}
      emptyMessage='Aucun message pour le moment.'
    />
  );
}
