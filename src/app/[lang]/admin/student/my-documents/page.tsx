'use client';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';

import { StudentDocumentsCard } from '@/modules/Documents/components/StudentDocumentsCard';
import { studentPortalService } from '@/modules/PortailEtudiant/services/studentPortalService';

export default function MyDocumentsPage() {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentPortalService
      .me()
      .then((student) => setStudentId(Number(student?.id)))
      .catch((err) => setError(err?.response?.data?.message ?? 'Profil élève introuvable.'));
  }, []);

  if (error) {
    return <Alert severity='error'>{error}</Alert>;
  }

  return (
    <StudentDocumentsCard
      studentId={studentId}
      title='Mes documents'
      subtitle='Certificats de scolarité, attestations et relevés émis par l’établissement'
    />
  );
}
