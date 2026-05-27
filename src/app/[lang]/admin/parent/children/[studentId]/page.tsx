'use client';

import { useParams } from 'next/navigation';
import Grid from '@mui/material/Grid2';
import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { parentService } from '@/modules/PortailParent/services/parentService';
import { GradesView, AttendanceView, TimetableView, InvoicesView, DocumentsView } from '@/modules/PortailEtudiant/components/StudentViews';

export default function ChildDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const id = Number(studentId);

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Fiche enfant'
          loader={() => parentService.getChild(id)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Notes'
          loader={() => parentService.childGrades(id)}
          render={GradesView}
          emptyMessage='Aucune note publiée pour le moment.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Présences / Absences'
          loader={() => parentService.childAttendance(id)}
          render={AttendanceView}
          emptyMessage='Aucune absence enregistrée.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Emploi du temps'
          loader={() => parentService.childTimetable(id)}
          render={TimetableView}
          emptyMessage='Aucun emploi du temps disponible.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Factures'
          loader={() => parentService.childInvoices(id)}
          render={InvoicesView}
          emptyMessage='Aucune facture émise.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Documents'
          loader={() => parentService.childDocuments(id)}
          render={DocumentsView}
          emptyMessage='Aucun document disponible.'
        />
      </Grid>
    </Grid>
  );
}
