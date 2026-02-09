import type { Metadata } from 'next';
import { CorrectionRequestsDashboard } from '@/modules/Grades/admin/components';

export const metadata: Metadata = {
  title: 'Demandes de Correction | Administration',
  description: 'Gérez les demandes de correction de notes soumises par les enseignants',
};

export default function CorrectionRequestsPage() {
  return <CorrectionRequestsDashboard />;
}
