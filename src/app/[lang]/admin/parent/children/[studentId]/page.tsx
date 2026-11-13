'use client';

import { useCallback } from 'react';

import { useParams } from 'next/navigation';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid2';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { parentService } from '@/modules/PortailParent/services/parentService';
import { StudentDocumentsCard } from '@/modules/Documents/components/StudentDocumentsCard';
import {
  ChildAttendanceTable,
  ChildInvoicesTable,
  ChildProfileDetails,
} from '@/modules/PortailParent/admin/components/ChildDataTables';
import { StudentGradesReport } from '@/modules/Grades/lycee/components/StudentGradesReport';
import { WeeklyTimetableGrid } from '@/modules/Timetable/admin/components/WeeklyTimetableGrid';
import { portalToSlots } from '@/modules/Timetable/admin/services/lyceeTimetableService';

export default function ChildDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const id = Number(studentId);
  const loadGrades = useCallback((semesterId?: number) => parentService.childGrades(id, semesterId), [id]);

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
          title='Présences / Absences'
          subtitle='Appels de classe'
          loader={() => parentService.childAttendance(id)}
          render={(records) => <ChildAttendanceTable records={records} />}
          emptyMessage='Aucun appel enregistré pour le moment.'
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Notes' subheader='Notes publiées, moyennes, rang et bulletin du semestre' />
          <CardContent>
            <StudentGradesReport key={id} loader={loadGrades} />
          </CardContent>
        </Card>
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
