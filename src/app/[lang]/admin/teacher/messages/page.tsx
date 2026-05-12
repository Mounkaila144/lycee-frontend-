'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { messagingService } from '@/modules/Messaging/services/messagingService';

export default function TeacherMessagesPage() {
  return (
    <ScaffoldPage
      title='Messagerie'
      subtitle='Story Professeur — Messages avec parents'
      loader={() => messagingService.inbox()}
      emptyMessage='Aucun message pour le moment.'
    />
  );
}
