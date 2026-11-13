'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { StudentGradesReport } from '@/modules/Grades/lycee/components/StudentGradesReport';

export default function MyGradesPage() {
  return (
    <Card>
      <CardHeader title='Mes notes' subheader='Notes publiées, moyennes, rang et bulletin du semestre' />
      <CardContent>
        <StudentGradesReport loader={(semesterId) => studentPortalService.myGrades(semesterId)} />
      </CardContent>
    </Card>
  );
}
