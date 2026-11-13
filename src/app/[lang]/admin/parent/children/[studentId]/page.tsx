'use client';

import { useParams } from 'next/navigation';

import Grid from '@mui/material/Grid2';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { parentService } from '@/modules/PortailParent/services/parentService';
import { StudentDocumentsCard } from '@/modules/Documents/components/StudentDocumentsCard';
import {
  ChildAttendanceTable,
  ChildGradesTable,
  ChildInvoicesTable,
  ChildProfileDetails,
} from '@/modules/PortailParent/admin/components/ChildDataTables';
import { WeeklyTimetableGrid } from '@/modules/Timetable/admin/components/WeeklyTimetableGrid';
import { portalToSlots } from '@/modules/Timetable/admin/services/lyceeTimetableService';

export default function ChildDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const id = Number(studentId);

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Fiche enfant'
          subtitle='Informations générales'
          loader={() => parentService.getChild(id)}
          render={(child) => <ChildProfileDetails child={child} />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Notes'
          subtitle='Notes publiées'
          loader={() => parentService.childGrades(id)}
          render={(grades) => <ChildGradesTable grades={grades} />}
          emptyMessage='Aucune note publiée pour le moment.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ScaffoldPage
          title='Présences / Absences'
          subtitle='Appels de classe'
          loader={() => parentService.childAttendance(id)}
          render={(records) => <ChildAttendanceTable records={records} />}
          emptyMessage='Aucun appel enregistré pour le moment.'
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ScaffoldPage
          title='Emploi du temps'
          subtitle='Classe actuelle'
          loader={() => parentService.childTimetable(id)}
          render={(slots) => <WeeklyTimetableGrid slots={portalToSlots(slots)} />}
          emptyMessage='Aucun emploi du temps disponible.'
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ScaffoldPage
          title='Factures'
          subtitle='Frais de scolarité et paiements'
          loader={() => parentService.childInvoices(id)}
          render={(invoices) => <ChildInvoicesTable invoices={invoices} />}
          emptyMessage='Aucune facture émise.'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <StudentDocumentsCard studentId={id} title='Documents' subtitle='Certificats, attestations et relevés' />
      </Grid>
    </Grid>
  );
}
