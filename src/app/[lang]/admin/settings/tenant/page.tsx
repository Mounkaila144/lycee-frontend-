'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { settingsService } from '@/modules/Settings/services/settingsService';

export default function TenantSettingsPage() {
  return (
    <ScaffoldPage
      title='Réglages de l’établissement'
      subtitle='Story Admin 13'
      loader={() => settingsService.list()}
      emptyMessage='Aucun réglage configuré pour le moment.'
    />
  );
}
