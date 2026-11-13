'use client';

import { useParams } from 'next/navigation';

import EvaluationGradeEntry from '@/modules/Grades/lycee/components/EvaluationGradeEntry';

export default function TeacherEvaluationGradesPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>();

  return <EvaluationGradeEntry key={evaluationId} evaluationId={Number(evaluationId)} />;
}
