'use client';

import Stack from '@mui/material/Stack';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { StudentHomeView } from '@/modules/PortailEtudiant/components/StudentPortalViews';
import type { StudentDashboard } from '@/modules/PortailEtudiant/types';
import { LatestAnnouncementsCard } from '@/modules/Messaging/components/LatestAnnouncementsCard';

export default function StudentHomePage() {
  return (
    <Stack spacing={6}>
      <ScaffoldPage<StudentDashboard>
        title='Accueil'
        subtitle='Portail Élève'
        loader={() => studentPortalService.dashboard()}
        render={(data) => <StudentHomeView data={data} />}
      />
      <LatestAnnouncementsCard />
    </Stack>
  );
}
