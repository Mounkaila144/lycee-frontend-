'use client';

import Grid from '@mui/material/Grid2';
import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { parentService } from '@/modules/PortailParent/services/parentService';

export default function ParentHomePage() {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Mon profil parent'
          subtitle='Story Parent 01 — Home'
          loader={() => parentService.me()}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Mes enfants'
          subtitle='Vue rapide'
          loader={() => parentService.myChildren()}
          emptyMessage='Aucun enfant associé à votre compte.'
        />
      </Grid>
    </Grid>
  );
}
