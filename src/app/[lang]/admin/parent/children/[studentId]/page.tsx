'use client';

import { useParams } from 'next/navigation';
import Grid from '@mui/material/Grid2';
import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { parentService } from '@/modules/PortailParent/services/parentService';

export default function ChildDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const id = Number(studentId);

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Fiche enfant'
          subtitle='Story Parent 01'
          loader={() => parentService.getChild(id)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Notes'
          subtitle='Story Parent 02'
          loader={() => parentService.childGrades(id)}
          emptyMessage='Aucune note publiée pour le moment.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Présences / Absences'
          subtitle='Story Parent 03'
          loader={() => parentService.childAttendance(id)}
          emptyMessage='Aucune absence enregistrée.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Emploi du temps'
          subtitle='Story Parent 04'
          loader={() => parentService.childTimetable(id)}
          emptyMessage='Aucun emploi du temps disponible.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Factures'
          subtitle='Story Parent 05'
          loader={() => parentService.childInvoices(id)}
          emptyMessage='Aucune facture émise.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Documents'
          subtitle='Story Parent 09'
          loader={() => parentService.childDocuments(id)}
          emptyMessage='Aucun document disponible.'
        />
      </Grid>
    </Grid>
  );
}
