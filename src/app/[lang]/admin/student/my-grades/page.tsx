'use client';

import { ScaffoldPage } from '@/shared/components/ScaffoldPage';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';
import { StudentGradesView } from '@/modules/PortailEtudiant/components/StudentPortalViews';
import type { StudentGrade } from '@/modules/PortailEtudiant/types';

export default function MyGradesPage() {
  return (
    <ScaffoldPage<StudentGrade[]>
      title='Mes notes'
      subtitle='Notes publiées par vos enseignants'
      loader={() => studentPortalService.myGrades()}
      render={(data) => <StudentGradesView data={data} />}
      emptyMessage='Aucune note publiée pour le moment.'
    />
  );
}
